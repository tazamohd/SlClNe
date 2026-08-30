import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DetailPage, type DetailSection } from '@/components/shell/DetailPage'
import { Attachments, type AttachmentFile } from '@/components/ui/Attachments'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { Money, parseSar } from '@/components/ui/Money'
import { EmptyState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useModal } from '@/components/ui/Modal'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, queryKeys, type RowOf } from '@/data/useCollection'
import { canApprove } from '@/data/rbac'
import { history, type EntityHistory } from '@/data/repository'
import {
  approveEstimate,
  rejectEstimate,
  fetchEstimateLines,
  transitionFailureMessage,
  RepositoryError,
  type EstimateLineRow,
} from './api'

/** The live estimate row carries the VAT split and the raise/approve identities
 *  the server now exposes (F-029); the fixture row carries only the pre-formatted
 *  `amount`, so every added field is optional and the screen degrades to the
 *  grand total alone. */
type Estimate = RowOf<'estimates'> & {
  _id?: string
  totalHalalas?: number
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  submittedBy?: string | null
  approvedBy?: string | null
}

/** A single estimate: its line items, its total, and the approve/reject
 *  decision — rendered in the shared `DetailPage` frame agent 09 built.
 *
 *  The design mocks up "recommended services" and "inspection findings", but an
 *  estimate is its line items: `GET /estimates/:id/lines` returns them, and the
 *  total is the one the server computed and stored (`amount`). Nothing here
 *  totals money in the browser — Part 5b forbids it, and the estimate already
 *  carries the figure ZATCA-rated server-side.
 *
 *  Approve and reject go through the estimate actions, which the server gates on
 *  `estimates:a`, the SAR ceiling and segregation of duties. `canApprove`
 *  mirrors the first two so the button reads honestly; the server is the
 *  boundary.
 *
 *  The estimate row does not expose its subtotal/VAT split (only the grand
 *  total), so the breakdown the design shows is not reconstructable here without
 *  inventing the numbers — the summary shows the server total and the honest
 *  line items instead. See `workshop-approval-gaps.test.ts`. */
export function EstimateDetail() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { role, can } = useSession()
  const toast = useToast()
  const { confirm } = useModal()
  const client = useQueryClient()
  const [params] = useSearchParams()
  const estimates = useCollection('estimates')
  const [busy, setBusy] = useState(false)

  const id = params.get('id')
  const rows = (estimates.data ?? []) as readonly Estimate[]
  const estimate = id ? rows.find((e) => e.id === id || e._id === id) : rows[0]

  const ref = estimate?._id ?? estimate?.id

  /* Line items are a sub-resource, not a collection — fetched directly. In the
   * fixture build the call throws `unsupported`; the screen renders that as an
   * honest "connect the API" empty state rather than a fabricated line. */
  const lines = useQuery<{ rows: EstimateLineRow[] }, RepositoryError>({
    queryKey: ['estimate-lines', ref],
    queryFn: () => fetchEstimateLines(ref as string),
    enabled: Boolean(ref),
    retry: false,
  })

  /* The audit trail — who raised the estimate versus who approved it, and the
   * server-computed segregation-of-duties conflicts (F-004 / F-029). Live only:
   * the accessor is null on the fixtures, the query never runs, and the section
   * shows the honest note that the trail needs the API. */
  const trail = useQuery<EntityHistory, RepositoryError>({
    queryKey: ['estimate-history', ref],
    queryFn: () => history!.estimate(ref as string),
    enabled: Boolean(ref) && Boolean(history),
    retry: false,
  })

  const amount = useMemo(() => {
    if (!estimate) return 0
    return estimate.totalHalalas != null ? estimate.totalHalalas / 100 : parseSar(estimate.amount)
  }, [estimate])

  async function decide(action: 'approve' | 'reject') {
    if (!estimate || !ref) return
    if (action === 'reject') {
      const ok = await confirm({
        title: 'Reject estimate?',
        description: `${estimate.id} — ${estimate.cust}. The customer is notified.`,
        icon: 'X',
        confirmLabel: 'Reject',
        destructive: true,
        variant: 'lifecycle',
      })
      if (!ok) return
    }
    setBusy(true)
    try {
      if (action === 'approve') {
        await approveEstimate(ref)
        toast.show({ title: t('Estimate approved'), description: `${estimate.id}` })
      } else {
        await rejectEstimate(ref, 'Rejected from the estimate detail.')
        toast.show({ title: t('Estimate rejected'), description: `${estimate.id}`, error: true })
      }
      void client.invalidateQueries({ queryKey: queryKeys.all('estimates') })
    } catch (cause) {
      toast.show({
        title: action === 'approve' ? t('Approval failed') : t('Rejection failed'),
        description: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  const back = { to: '/estimates', label: 'Back to Estimates' }

  if (estimates.isLoading) {
    return <DetailPage title={t('Estimate')} back={back} loading />
  }
  if (estimates.isError) {
    return (
      <DetailPage
        title={t('Estimate')}
        back={back}
        error={{ message: estimates.error?.message, onRetry: () => void estimates.refetch() }}
      />
    )
  }
  if (!estimate) {
    return (
      <DetailPage
        title={t('Estimate')}
        back={back}
        notFound={{
          title: 'Estimate not found',
          description: 'It may have been deleted, or the link is out of date.',
          action: (
            <Link to="/estimates" className="font-action text-[13px] font-medium">
              {t('Back to Estimates')}
            </Link>
          ),
        }}
      />
    )
  }

  const decided = estimate.status === 'approved' || estimate.status === 'rejected'
  const mayApprove = can('estimates', 'a') && canApprove(role, amount, 'estimates') && !decided

  const lineRows = lines.data?.rows ?? []

  const demoAttachments: AttachmentFile[] = [
    { id: 'att-1', name: 'estimate_breakdown.pdf', size: '1.3 MB', type: 'PDF' },
    { id: 'att-2', name: 'parts_quotation.xlsx', size: '0.9 MB', type: 'Spreadsheet' },
    { id: 'att-3', name: 'inspection_photo.jpg', size: '2.7 MB', type: 'Image' },
  ]

  const sections: DetailSection[] = [
    {
      id: 'lines',
      title: 'Line items',
      icon: 'Wrench',
      span: 'full',
      children: lines.isLoading ? (
        <Loading inline label="Loading line items..." />
      ) : lineRows.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {lineRows.map((line) => (
            <li
              key={line.id}
              className="flex items-center gap-3 border-0 border-b border-solid border-border py-2 last:border-b-0"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-2 text-salis-blue">
                <Icon name={line.kind === 'labour' ? 'Clock' : 'Package'} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">
                  {line.description}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {line.qty} × <Money sar={line.unitPriceHalalas / 100} bare className="text-muted" />
                  {line.partSku ? ` · ${line.partSku}` : ''}
                </p>
              </div>
              {/* Unit price is stored; a per-line total is a client money
                  calculation, so the qty and unit are shown and the server
                  total below is the only summed figure. */}
              <Money sar={line.unitPriceHalalas / 100} className="flex-shrink-0 text-[13px] text-muted" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="ReceiptText"
          title={t('No line items to show')}
          description={
            lines.isError
              ? t('Line items load from the API. Connect a live server to see them.')
              : t('This estimate has no line items yet.')
          }
        />
      ),
    },
    {
      id: 'total',
      title: 'Total',
      icon: 'Calculator',
      span: 'half',
      children: (
        <div className="flex flex-col gap-2">
          {/* When the server exposes the split (live), each figure is its own —
              subtotal, discount and VAT are displayed, never summed here. The
              fixture row carries only the grand total, so that alone is shown. */}
          {estimate.subtotalHalalas != null ? (
            <>
              <div className="flex items-baseline justify-between text-[13px] text-body">
                <span>{t('Subtotal')}</span>
                <Money sar={estimate.subtotalHalalas / 100} className="text-body" />
              </div>
              {estimate.discountHalalas ? (
                <div className="flex items-baseline justify-between text-[13px] text-body">
                  <span>{t('Discount')}</span>
                  <Money sar={-(estimate.discountHalalas / 100)} className="text-body" />
                </div>
              ) : null}
              <div className="flex items-baseline justify-between text-[13px] text-body">
                <span>{t('VAT')}</span>
                <Money sar={(estimate.taxHalalas ?? 0) / 100} className="text-body" />
              </div>
            </>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-bold text-heading first:border-t-0 first:pt-0">
            <span>{t('Grand total')}</span>
            <Money sar={amount} className="font-bold" />
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            {t('VAT is included and computed server-side at the ZATCA rate.')}
          </p>
        </div>
      ),
    },
    {
      id: 'audit',
      title: 'Who raised, who approved',
      icon: 'ShieldCheck',
      span: 'half',
      children: history ? (
        trail.isLoading ? (
          <Loading inline label="Loading audit trail..." />
        ) : trail.isError ? (
          <EmptyState
            icon="ShieldAlert"
            title={t("Couldn't load the audit trail")}
            description={trail.error?.message}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted">{t('Raised by')}</span>
                <span className="font-semibold text-heading">{estimate.submittedBy || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted">{t('Approved by')}</span>
                <span className="font-semibold text-heading">{estimate.approvedBy || '—'}</span>
              </div>
            </div>

            {(trail.data?.sodConflicts.length ?? 0) > 0 ? (
              <div
                role="note"
                className="flex items-start gap-2.5 rounded-lg border border-salis-orange/[.28] bg-salis-orange/[.07] p-2.5"
              >
                <Icon name="AlertTriangle" size={14} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-salis-orange">
                    {t('Segregation-of-duties conflict')}
                  </p>
                  {trail.data?.sodConflicts.map((c) => (
                    <p key={`${c.a}-${c.b}`} className="mt-0.5 text-[11.5px] text-body">
                      {t(c.a)} + {t(c.b)} — {c.risk}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            {trail.data?.entries.length ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {trail.data.entries.map((entry) => {
                  const conflicted = (trail.data?.sodConflicts ?? []).some(
                    (c) => c.actorId === entry.actorId
                  )
                  return (
                    <li
                      key={entry.id}
                      className={
                        'flex items-start gap-2.5 rounded-lg p-2 ' +
                        (conflicted ? 'bg-salis-orange/[.07]' : '')
                      }
                    >
                      <Icon
                        name={conflicted ? 'AlertTriangle' : 'CircleDot'}
                        size={14}
                        className={
                          'mt-0.5 flex-shrink-0 ' +
                          (conflicted ? 'text-salis-orange' : 'text-muted')
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-heading">
                          {t(entry.action)}
                          {entry.activities.length ? (
                            <span className="ms-1.5 font-normal text-muted">
                              · {entry.activities.map((a) => t(a)).join(', ')}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {entry.actorRole || t('unknown role')}
                          {entry.at ? ` · ${entry.at}` : ''}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-[12px] text-muted">{t('No trail entries recorded yet.')}</p>
            )}
          </div>
        )
      ) : (
        <p className="text-[12px] leading-relaxed text-muted">
          {t(
            'Who raised versus who approved — and any segregation-of-duties conflict — comes from the audit trail. Connect a live server to read it.'
          )}
        </p>
      ),
    },
  ]

  return (
    <DetailPage
      back={back}
      title={estimate.id}
      titleCode
      subtitle={`${estimate.cust} · ${estimate.veh}`}
      avatar={{ icon: 'FileCheck' }}
      status={<StatusBadge value={estimate.status} label={t(estimate.status)} />}
      summary={[{ label: 'Amount', value: <Money sar={amount} />, icon: 'Banknote' }]}
      actions={
        <>
          {mayApprove ? (
            <>
              <Button size="md" onClick={() => void decide('approve')} disabled={busy}>
                <Icon name="Check" size={15} />
                {t(busy ? 'Saving...' : 'Approve')}
              </Button>
              <Button
                variant="outline"
                size="md"
                className="border-salis-orange/[.4] text-salis-orange hover:bg-salis-orange/[.07]"
                onClick={() => void decide('reject')}
                disabled={busy}
              >
                {t('Decline')}
              </Button>
            </>
          ) : null}
          {!isMobile && (
            <Button variant="subtle" size="md" onClick={() => window.print()}>
              <Icon name="Printer" size={15} />
              {t('Print')}
            </Button>
          )}
        </>
      }
      readOnly={decided ? `${t('This estimate is')} ${t(estimate.status)}.` : undefined}
      sections={sections}
      attachments={
        <Attachments files={demoAttachments} title={t('Documents')} />
      }
    />
  )
}
