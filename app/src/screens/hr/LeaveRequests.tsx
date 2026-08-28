import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, queryKeys } from '@/data/useCollection'
import { can } from '@/data/rbac'
import { isLive, type LeaveRequestRow } from '@/data/repository'
import { actionFailureMessage, approveLeave, isRefusal, rejectLeave } from './api'
import { ConnectApi, ProvenanceNote, StatusPill } from './bits'

/** Leave Requests (`Leave-Requests`, `/leave-requests`).
 *
 *  The leave list — type, dates, days, status — with the approve/reject decision
 *  a request in `submitted` needs. Both actions are gated on `hr:a` (owner and
 *  the HR manager hold it) and a rejection requires a reason; the server records
 *  the approver for segregation of duties and re-checks the grant, so a role
 *  without `hr:a` simply never sees the buttons and would 403 if it forced one.
 *  A request already decided cannot be decided again — the server 409s and the
 *  UI hides the actions once the status leaves `submitted`.
 *
 *  Provenance: feature-map spec + screenshot, no `.dc.html` — design-system
 *  layout, mirroring the insurance-claim decision panel. See `./bits`.
 */

const STATUSES: readonly LeaveRequestRow['status'][] = ['submitted', 'approved', 'rejected']
const TYPE_ICON: Record<LeaveRequestRow['type'], string> = {
  annual: 'Sun',
  sick: 'Thermometer',
  unpaid: 'Wallet',
  other: 'Calendar',
}

export function LeaveRequests() {
  const { t } = usePreferences()
  const { role } = useSession()
  const [filter, setFilter] = useState<'all' | LeaveRequestRow['status']>('all')
  const [selected, setSelected] = useState<LeaveRequestRow | null>(null)

  const leave = useCollection('leaveRequests', { sort: 'startDate:desc' })
  const rows = (leave.data ?? []) as readonly LeaveRequestRow[]
  const shown = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  )
  const pending = rows.filter((r) => r.status === 'submitted').length
  const mayDecide = can('hr', 'a', role)

  return (
    <div className="flex max-w-[960px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="CalendarClock" size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t('Leave Requests')}</h1>
          <p className="mt-1 text-sm text-muted">
            {isLive && pending > 0
              ? `${pending} ${t('awaiting a decision')}`
              : t('Annual, sick and unpaid leave')}
          </p>
        </div>
      </div>
      <ProvenanceNote />

      {!isLive ? (
        <ConnectApi
          icon="CalendarClock"
          title="No leave requests to show"
          description="Leave requests and their approvals live on the server, gated on HR. A decision cannot be faked here — connect a live API to review and decide leave."
          collection="leaveRequests"
        />
      ) : leave.isLoading ? (
        <Loading label="Loading leave requests..." />
      ) : leave.isError ? (
        <ErrorState description={leave.error?.message} onRetry={() => void leave.refetch()} />
      ) : (
        <>
          <ChipGroup label={t('Filter by status')}>
            {(['all', ...STATUSES] as const).map((key) => (
              <Chip key={key} label={key === 'all' ? t('All') : t(key)} selected={filter === key} onToggle={() => setFilter(key)} />
            ))}
          </ChipGroup>

          {shown.length === 0 ? (
            <Card className="p-4">
              <EmptyState
                icon="CalendarCheck"
                title={t('No leave requests here')}
                description={filter === 'all' ? t('No leave has been requested yet.') : t('No requests match this status.')}
              />
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <ul className="m-0 flex list-none flex-col p-0">
                {shown.map((req, index) => (
                  <li
                    key={req._id ?? `${req.employeeId}-${index}`}
                    className={
                      'flex flex-wrap items-center gap-3 p-3.5 sm:flex-nowrap ' +
                      (index ? 'border-0 border-t border-solid border-border' : '')
                    }
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tint-blue)] text-salis-blue">
                      <Icon name={TYPE_ICON[req.type]} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-heading">{req.employeeName}</span>
                        <StatusPill value={req.status} />
                      </div>
                      <p className="mt-0.5 text-[11px] capitalize text-muted">
                        {t(req.type)} · <span dir="ltr">{req.startDate}</span> → <span dir="ltr">{req.endDate}</span>
                      </p>
                    </div>
                    <div className="min-w-[64px] flex-shrink-0 text-end">
                      <p className="font-display text-base font-black text-heading">{req.days}</p>
                      <p className="text-[11px] text-muted">{t(req.days === 1 ? 'day' : 'days')}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center">
                      <Button variant="outline" size="sm" onClick={() => setSelected(req)}>
                        {req.status === 'submitted' && mayDecide ? t('Review') : t('Open')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {selected ? <LeaveDetail request={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
        {t(label)}
      </span>
      <span className="min-w-0 text-end text-[13px] text-heading">{children}</span>
    </div>
  )
}

function LeaveDetail({ request, onClose }: { request: LeaveRequestRow; onClose: () => void }) {
  const { t } = usePreferences()
  const { role } = useSession()
  const toast = useToast()
  const client = useQueryClient()
  const ref = request._id ?? ''

  const decidable = request.status === 'submitted'
  const mayDecide = can('hr', 'a', role)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<null | 'approve' | 'reject'>(null)

  function done(title: string) {
    void client.invalidateQueries({ queryKey: queryKeys.all('leaveRequests') })
    toast.show({ title: t(title), description: request.employeeName })
    onClose()
  }

  function fail(cause: unknown, title: string) {
    toast.show({
      title: isRefusal(cause) ? t('Cannot decide this request') : t(title),
      description: actionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
      error: true,
    })
  }

  async function approve() {
    setBusy('approve')
    try {
      await approveLeave(ref, reason.trim() || undefined)
      done('Leave approved')
    } catch (cause) {
      fail(cause, 'Approval failed')
    } finally {
      setBusy(null)
    }
  }

  async function reject() {
    if (!reason.trim()) return
    setBusy('reject')
    try {
      await rejectLeave(ref, reason.trim())
      done('Leave rejected')
    } catch (cause) {
      fail(cause, 'Rejection failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="lifecycle"
      icon="CalendarClock"
      title={request.employeeName}
      meta={<StatusPill value={request.status} />}
      dismissible={busy === null}
    >
      <div className="flex flex-col divide-y divide-border">
        <div className="pb-1">
          <Row label="Type">
            <span className="capitalize">{t(request.type)}</span>
          </Row>
          <Row label="From">
            <span dir="ltr">{request.startDate}</span>
          </Row>
          <Row label="To">
            <span dir="ltr">{request.endDate}</span>
          </Row>
          <Row label="Days">{request.days}</Row>
          {request.reason ? <Row label="Reason">{request.reason}</Row> : null}
        </div>

        {decidable && mayDecide ? (
          <div className="flex flex-col gap-3 pt-3">
            <p className="text-[11px] text-muted">
              {t('Approval and rejection are checked against your HR grant server-side. A rejection must say why.')}
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="leave-reason" className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted">
                {t('Reason')}
              </label>
              <Textarea
                id="leave-reason"
                rows={2}
                value={reason}
                disabled={busy !== null}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('Required to reject; optional to approve')}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[rgba(249,115,22,.4)] text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
                onClick={() => void reject()}
                disabled={busy !== null || !reason.trim()}
              >
                {t(busy === 'reject' ? 'Saving...' : 'Reject')}
              </Button>
              <Button size="sm" onClick={() => void approve()} disabled={busy !== null}>
                <Icon name="Check" size={13} />
                {t(busy === 'approve' ? 'Saving...' : 'Approve')}
              </Button>
            </div>
          </div>
        ) : decidable ? (
          <p className="pt-3 text-[12px] text-muted">
            {t('This request is awaiting a decision. Your role can view it but not decide it.')}
          </p>
        ) : (
          <p className="pt-3 text-[12px] text-muted">
            {request.status === 'approved'
              ? t('This request was approved. The decision is final.')
              : t('This request was rejected. The decision is final.')}
          </p>
        )}
      </div>
    </Modal>
  )
}
