import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useModal } from '@/components/ui/Modal'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, queryKeys, type RowOf } from '@/data/useCollection'
import { canApprove, approvalLimit } from '@/data/rbac'
import { useQueryClient } from '@tanstack/react-query'
import { approveEstimate, rejectEstimate, transitionFailureMessage } from './api'

type Estimate = RowOf<'estimates'> & { _id?: string; totalHalalas?: number }

/** The approval inbox — everything waiting on the signer's authority.
 *
 *  The design paints a cross-domain queue: estimates, purchase orders, journal
 *  entries, payroll. Only estimates are a real, approvable document with a
 *  server action behind them (`POST /estimates/:id/approve`), so that is what
 *  this screen operates on. Purchase orders, journals and payroll have no
 *  approval endpoint yet and belong to other domains; a unified queue that
 *  aggregates all four does not exist server-side. Rather than invent rows for
 *  the three that cannot be actioned, the inbox shows the one it can act on and
 *  the gap is recorded in `workshop-approval-gaps.test.ts`.
 *
 *  The approve button is gated with `canApprove(role, amount, 'estimates')`,
 *  which the F-002 fix made answer *both* questions the server asks: does the
 *  role hold `estimates:a`, and is the amount within its ceiling. Authority and
 *  ceiling are separate — a role can approve estimates yet be stopped by the
 *  amount — so an over-ceiling item shows "Escalate", disabled, rather than a
 *  button that would 403.
 *
 *  Segregation of duties is enforced by the server over the estimate's
 *  submitter (`requireDifferentApprover`). The client cannot preflight it: the
 *  estimate row does not carry `submittedBy`, and there is no
 *  `GET /estimates/:id/history` to read the trail (F-004). So the SoD banner
 *  states the control is server-side and does not fake a per-row flag. */
export function ApprovalInbox() {
  const { t } = usePreferences()
  const { role } = useSession()
  const toast = useToast()
  const { confirm } = useModal()
  const client = useQueryClient()
  const estimates = useCollection('estimates')
  const [filter, setFilter] = useState<'all' | 'overLimit'>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const ceiling = approvalLimit(role)

  const rows = (estimates.data ?? []) as readonly Estimate[]

  /** The queue is every estimate not already decided. `draft` and `sent` are
   *  awaiting a decision; `approved`/`rejected` are done. */
  const queue = useMemo(
    () => rows.filter((e) => e.status !== 'approved' && e.status !== 'rejected'),
    [rows]
  )

  const amountOf = (e: Estimate): number =>
    e.totalHalalas != null ? e.totalHalalas / 100 : parseSar(e.amount)

  const overLimit = (e: Estimate): boolean => ceiling !== null && amountOf(e) > ceiling

  const shown = useMemo(
    () => (filter === 'overLimit' ? queue.filter(overLimit) : queue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, filter, ceiling]
  )

  async function decide(e: Estimate, action: 'approve' | 'reject') {
    const ref = e._id ?? e.id
    if (action === 'reject') {
      const reason = await confirm({
        title: 'Reject estimate?',
        description: `${e.id} — ${e.cust}. The raiser is notified. This cannot be undone.`,
        icon: 'X',
        confirmLabel: 'Reject',
        destructive: true,
        variant: 'lifecycle',
      })
      if (!reason) return
    }
    setBusy(ref)
    try {
      if (action === 'approve') {
        await approveEstimate(ref)
        toast.show({ title: t('Approved'), description: `${e.id} · ${formatSar(amountOf(e))}` })
      } else {
        // The server requires a reason; the confirmation is the intent, and the
        // reason is recorded server-side. A dedicated reason field is a future
        // refinement — noted in the gaps test.
        await rejectEstimate(ref, 'Rejected from the approval inbox.')
        toast.show({ title: t('Rejected'), description: `${e.id}`, error: true })
      }
      void client.invalidateQueries({ queryKey: queryKeys.all('estimates') })
    } catch (cause) {
      toast.show({
        title: action === 'approve' ? t('Approval failed') : t('Rejection failed'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setBusy(null)
    }
  }

  const overCount = queue.filter(overLimit).length

  if (estimates.isLoading) {
    return <Loading label="Loading approvals..." />
  }

  if (estimates.isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={estimates.error?.message}
        onRetry={() => void estimates.refetch()}
      />
    )
  }

  const stats: { n: string; label: string; icon: string }[] = [
    { n: String(queue.length), label: t('Awaiting me'), icon: 'Inbox' },
    { n: String(overCount), label: t('Above my limit'), icon: 'ArrowUp' },
    {
      n: ceiling === null ? t('Unlimited') : formatSar(ceiling, { bare: true }),
      label: t('My ceiling'),
      icon: 'Gauge',
    },
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div>
        <h1 className="font-display text-2xl font-black text-heading">{t('Approval Inbox')}</h1>
        <p className="mt-1 text-sm text-muted">{t('Everything waiting on your signature')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 rounded-xl p-3.5">
            <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.1)] p-2.5 text-salis-blue">
              <Icon name={s.icon} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black leading-tight text-heading">{s.n}</p>
              <p className="truncate text-[11px] text-muted">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Segregation of duties is a server control here, not a client flag. */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.07)] p-3.5"
      >
        <span className="mt-0.5 flex flex-shrink-0 rounded-lg bg-[rgba(249,115,22,.14)] p-1.5 text-salis-orange">
          <Icon name="AlertTriangle" size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-heading">{t('Segregation of duties')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-body">
            {t(
              'An estimate raised by you cannot be approved by you. The server refuses that on submit — this inbox cannot show it in advance, because the estimate does not carry who raised it.'
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label={t('Filter')}>
        {(
          [
            ['all', t('All')],
            ['overLimit', t('Above my limit')],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={
              'h-8 flex-shrink-0 cursor-pointer rounded-full px-3.5 font-action text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue ' +
              (filter === key
                ? 'border-none bg-salis-gradient text-white'
                : 'border border-border bg-card text-body')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="CheckCircle"
            title={t('Everything is handled')}
            description={t('No estimates are waiting on a decision. New requests show up here.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="m-0 flex list-none flex-col p-0">
            {shown.map((e, index) => {
              const amount = amountOf(e)
              const blocked = overLimit(e)
              const allowed = canApprove(role, amount, 'estimates')
              const ref = e._id ?? e.id
              const isBusy = busy === ref
              return (
                <li
                  key={ref}
                  className={
                    'flex flex-wrap items-start gap-3 p-3.5 sm:flex-nowrap ' +
                    (index ? 'border-0 border-t border-solid border-border' : '')
                  }
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                    <Icon name="FileText" size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
                        {e.id}
                      </span>
                      <StatusBadge value={e.status} label={t(e.status)} />
                      {blocked ? (
                        <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                          <Icon name="ArrowUp" size={9} />
                          {t('Above limit')}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] font-semibold text-heading">{e.cust}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{e.veh}</p>
                  </div>
                  <div className="min-w-[96px] flex-shrink-0 text-end">
                    <Money sar={amount} className="text-sm font-extrabold text-heading" />
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    {blocked || !allowed ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        disabled
                        title={
                          blocked
                            ? `${t('Above your approval limit')} (${formatSar(ceiling ?? 0)}) — ${t('escalate to a manager')}`
                            : t('Your role cannot approve estimates')
                        }
                      >
                        <Icon name="Lock" size={13} />
                        {blocked ? t('Escalate') : t('Approve')}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => void decide(e, 'approve')} disabled={isBusy}>
                        <Icon name="Check" size={13} />
                        {t(isBusy ? 'Saving...' : 'Approve')}
                      </Button>
                    )}
                    {allowed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[rgba(249,115,22,.4)] text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
                        onClick={() => void decide(e, 'reject')}
                        disabled={isBusy}
                      >
                        {t('Reject')}
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
