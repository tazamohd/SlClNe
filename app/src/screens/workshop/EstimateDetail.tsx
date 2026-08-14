import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DetailPage, type DetailSection } from '@/components/shell/DetailPage'
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
import {
  approveEstimate,
  rejectEstimate,
  fetchEstimateLines,
  transitionFailureMessage,
  RepositoryError,
  type EstimateLineRow,
} from './api'

type Estimate = RowOf<'estimates'> & { _id?: string; totalHalalas?: number }

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
              <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
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
                className="border-[rgba(249,115,22,.4)] text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
                onClick={() => void decide('reject')}
                disabled={busy}
              >
                {t('Decline')}
              </Button>
            </>
          ) : null}
          <Button variant="subtle" size="md" onClick={() => window.print()}>
            <Icon name="Printer" size={15} />
            {t('Print')}
          </Button>
        </>
      }
      readOnly={decided ? `${t('This estimate is')} ${t(estimate.status)}.` : undefined}
      sections={sections}
    />
  )
}
