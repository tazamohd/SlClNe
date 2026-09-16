import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { approvals, type ApprovalItem, type ApprovalQueue } from '@/data/repository'
import { approveQueueItem, rejectQueueItem, transitionFailureMessage } from './api'

type Estimate = RowOf<'estimates'> & { _id?: string; totalHalalas?: number }

/** The one shape the list renders, whichever backend fed it. The live queue
 *  carries the server's own standing (`canApprove`, `withinCeiling`,
 *  `isSubmitter`) so the inbox and the approval engine cannot disagree; the
 *  fixture build fills the same fields from the client `canApprove` proxy, and
 *  cannot know `isSubmitter` because the fixture estimate does not record who
 *  raised it.
 *
 *  `approvePath`/`rejectPath` are the endpoints that decide *this* row. The
 *  live queue is mixed — estimates, requisitions, purchase orders and insurance
 *  claims — and each source approves at its own route, so the row carries the
 *  route rather than the screen guessing it from `kind`. `rejectPath` is null
 *  where the source has no reject route; the fixture build can only produce
 *  estimates, so it fills both. */
interface InboxItem {
  key: string
  ref: string
  kind: ApprovalItem['kind']
  reference: string
  party: string
  subject: string
  status: string
  amountSar: number
  canApprove: boolean
  withinCeiling: boolean
  isSubmitter: boolean
  ceilingHalalas: number | null
  approvePath: string
  rejectPath: string | null
}

/** What each source is called in a refusal or a confirmation, so the copy names
 *  the document in front of the user rather than always saying "estimate". */
const KIND_NOUN: Record<ApprovalItem['kind'], string> = {
  estimate: 'estimate',
  requisition: 'requisition',
  purchase_order: 'purchase order',
  insurance_claim: 'insurance claim',
}

const KIND_ICON: Record<ApprovalItem['kind'], string> = {
  estimate: 'FileText',
  requisition: 'ClipboardList',
  purchase_order: 'ShoppingCart',
  insurance_claim: 'Shield',
}

/** The approval inbox — everything waiting on the signer's authority.
 *
 *  The design paints a cross-domain queue. Four sources are real, approvable
 *  documents with a ceiling-gated server action behind them — estimates,
 *  requisitions, purchase orders and insurance claims — and `GET /approvals`
 *  aggregates all four, each row naming the endpoint that decides it. The
 *  server folds a source in only when the caller may view that source's own
 *  module, so this screen renders whatever came back rather than filtering.
 *
 *  Payroll runs and journal entries are still absent, and deliberately: posting
 *  a payroll run is gated on `hr:e` as an edit, not on a ceiling, and journal
 *  entries are written by the business event that caused them. Neither has an
 *  approval to show, so neither gets an unactionable row. The gap is recorded
 *  in `workshop-approval-gaps.test.ts`.
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
  const [filter, setFilter] = useState<'all' | 'overLimit'>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const clientCeiling = approvalLimit(role)

  /* Live: the unified queue the server computes, whose rows carry the caller's
   * standing so this inbox and the approval engine cannot disagree (F-029).
   * Fixture: the accessor is null, the query never runs, and the estimates
   * collection below is the honest fallback. */
  const live = useQuery<ApprovalQueue>({
    queryKey: ['approvals', 'queue'],
    queryFn: () => approvals!.list(),
    enabled: Boolean(approvals),
    retry: false,
  })
  const estimates = useCollection('estimates')

  const queue = useMemo<InboxItem[]>(() => {
    if (approvals) {
      return (live.data?.rows ?? []).map((row) => ({
        key: `${row.kind}:${row.entityId}`,
        ref: row.entityId,
        kind: row.kind,
        reference: row.reference,
        party: row.party,
        subject: row.subject,
        status: row.status,
        amountSar: row.amountHalalas / 100,
        canApprove: row.approval.canApprove,
        withinCeiling: row.approval.withinCeiling,
        isSubmitter: row.approval.isSubmitter,
        ceilingHalalas: row.approval.ceilingHalalas,
        approvePath: row.approvePath,
        rejectPath: row.rejectPath,
      }))
    }
    const rows = (estimates.data ?? []) as readonly Estimate[]
    return rows
      .filter((e) => e.status !== 'approved' && e.status !== 'rejected')
      .map((e) => {
        const amountSar = e.totalHalalas != null ? e.totalHalalas / 100 : parseSar(e.amount)
        const withinCeiling = clientCeiling === null || amountSar <= clientCeiling
        const ref = e._id ?? e.id
        return {
          key: `estimate:${ref}`,
          ref,
          kind: 'estimate' as const,
          reference: e.id,
          party: e.cust,
          subject: e.veh,
          status: e.status,
          amountSar,
          // The client proxy answers authority + ceiling; the server re-checks,
          // and re-checks the segregation of duties the fixture cannot know.
          canApprove: canApprove(role, amountSar, 'estimates'),
          withinCeiling,
          isSubmitter: false,
          ceilingHalalas: clientCeiling === null ? null : clientCeiling * 100,
          approvePath: `estimates/${encodeURIComponent(ref)}/approve`,
          rejectPath: `estimates/${encodeURIComponent(ref)}/reject`,
        }
      })
  }, [live.data, estimates.data, clientCeiling, role])

  const shown = useMemo(
    () => (filter === 'overLimit' ? queue.filter((row) => !row.withinCeiling) : queue),
    [queue, filter]
  )

  const isLoading = approvals ? live.isLoading : estimates.isLoading
  const isError = approvals ? live.isError : estimates.isError
  const errorMessage = approvals ? live.error?.message : estimates.error?.message
  const retry = () => void (approvals ? live.refetch() : estimates.refetch())

  /* Ceiling to display: the server's standing when live (identical across rows
   * for one caller), else the client limit. */
  const ceiling =
    approvals && queue[0]?.ceilingHalalas != null
      ? queue[0].ceilingHalalas / 100
      : clientCeiling

  async function decide(item: InboxItem, action: 'approve' | 'reject') {
    const { key, rejectPath } = item
    const noun = KIND_NOUN[item.kind]
    if (action === 'reject') {
      /* A source with no reject route never offers the button; this guard keeps
       * that true if the two ever drift. */
      if (!rejectPath) return
      const reason = await confirm({
        title: `Reject ${noun}?`,
        description: `${item.reference} — ${item.party}. The raiser is notified. This cannot be undone.`,
        icon: 'X',
        confirmLabel: 'Reject',
        destructive: true,
        variant: 'lifecycle',
      })
      if (!reason) return
    }
    setBusy(key)
    try {
      if (action === 'approve') {
        await approveQueueItem(item.approvePath)
        toast.show({ title: t('Approved'), description: `${item.reference} · ${formatSar(item.amountSar)}` })
      } else {
        // The server requires a reason; the confirmation is the intent, and the
        // reason is recorded server-side. A dedicated reason field is a future
        // refinement — noted in the gaps test.
        /* Non-null by the guard above: `action === 'reject'` returns early when
         * the source has no reject route. */
        await rejectQueueItem(rejectPath!, 'Rejected from the approval inbox.')
        toast.show({ title: t('Rejected'), description: `${item.reference}`, error: true })
      }
      void client.invalidateQueries({ queryKey: queryKeys.all('estimates') })
      if (approvals) void client.invalidateQueries({ queryKey: ['approvals', 'queue'] })
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

  const overCount = queue.filter((row) => !row.withinCeiling).length

  if (isLoading) {
    return <Loading label="Loading approvals..." />
  }

  if (isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={errorMessage}
        onRetry={retry}
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
            <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2.5 text-salis-blue">
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
        className="flex items-start gap-3 rounded-xl border border-salis-orange/[.28] bg-salis-orange/[.07] p-3.5"
      >
        <span className="mt-0.5 flex flex-shrink-0 rounded-lg bg-salis-orange/[.14] p-1.5 text-salis-orange">
          <Icon name="AlertTriangle" size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-heading">{t('Segregation of duties')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-body">
            {approvals
              ? t(
                  'A document raised by you cannot be approved by you. The queue flags one you raised from the server standing, and the server refuses it on submit either way.'
                )
              : t(
                  'An estimate raised by you cannot be approved by you. The server refuses that on submit — this inbox cannot show it in advance, because the estimate does not carry who raised it.'
                )}
          </p>
        </div>
      </div>

      <ChipGroup label={t('Filter')}>
        <Chip label={t('All')} selected={filter === 'all'} onToggle={() => setFilter('all')} />
        <Chip label={t('Above my limit')} selected={filter === 'overLimit'} onToggle={() => setFilter('overLimit')} />
      </ChipGroup>

      {shown.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="CheckCircle"
            title={t('Everything is handled')}
            description={t('Nothing is waiting on a decision. New requests show up here.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="m-0 flex list-none flex-col p-0">
            {shown.map((item, index) => {
              const blocked = !item.withinCeiling
              const allowed = item.canApprove
              const isBusy = busy === item.key
              /* Why the approve button is unavailable, in the row's own terms:
               * an over-ceiling item escalates; the raiser cannot approve their
               * own; otherwise the role simply lacks the authority. */
              const refusal = item.isSubmitter
                ? t('You raised this — it needs a different approver.')
                : blocked
                  ? `${t('Above your approval limit')} (${formatSar(ceiling ?? 0)}) — ${t('escalate to a manager')}`
                  : `${t('Your role cannot approve')} ${t(`${KIND_NOUN[item.kind]}s`)}`
              return (
                <li
                  key={item.key}
                  className={
                    'flex flex-wrap items-start gap-3 p-3.5 sm:flex-nowrap ' +
                    (index ? 'border-0 border-t border-solid border-border' : '')
                  }
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-tint-blue text-salis-blue">
                    <Icon name={KIND_ICON[item.kind]} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
                        {item.reference}
                      </span>
                      <Badge background="rgba(37,99,235,.10)" color="var(--salis-blue)">
                        {t(KIND_NOUN[item.kind])}
                      </Badge>
                      <StatusBadge value={item.status} label={t(item.status)} />
                      {blocked ? (
                        <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                          <Icon name="ArrowUp" size={9} />
                          {t('Above limit')}
                        </Badge>
                      ) : null}
                      {item.isSubmitter ? (
                        <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                          <Icon name="User" size={9} />
                          {t('You raised this')}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] font-semibold text-heading">{item.party}</p>
                    {item.subject ? (
                      <p className="mt-0.5 text-[11px] text-muted">{item.subject}</p>
                    ) : null}
                  </div>
                  <div className="min-w-[96px] flex-shrink-0 text-end">
                    <Money sar={item.amountSar} className="text-sm font-extrabold text-heading" />
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    {allowed ? (
                      <Button size="sm" onClick={() => void decide(item, 'approve')} disabled={isBusy}>
                        <Icon name="Check" size={13} />
                        {t(isBusy ? 'Saving...' : 'Approve')}
                      </Button>
                    ) : (
                      <Button variant="subtle" size="sm" disabled title={refusal}>
                        <Icon name="Lock" size={13} />
                        {blocked && !item.isSubmitter ? t('Escalate') : t('Approve')}
                      </Button>
                    )}
                    {allowed && item.rejectPath ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-salis-orange/[.4] text-salis-orange hover:bg-salis-orange/[.07]"
                        onClick={() => void decide(item, 'reject')}
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
