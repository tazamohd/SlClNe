import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import {
  isLive,
  productReports,
  type InsurancePolicyRow,
  type LoanContractRow,
  type LoanRepaymentRow,
} from '@/data/repository'
import { ConnectApi, StatCard, StatusPill } from './bits'

/** The read-only context either side of the claim workspace: the policies a
 *  claim is filed against, and the loan book with its repayment schedule. Both
 *  are browsing surfaces — no writes — so where a screen would total figures it
 *  shows the server's aggregate (`productReports`) or an em dash, never a sum
 *  the client added up.
 */

const POLICY_TYPE_LABEL: Record<InsurancePolicyRow['type'], string> = {
  comprehensive: 'Comprehensive',
  third_party: 'Third party',
  own_damage: 'Own damage',
}

// ── Policies ─────────────────────────────────────────────────────────────────

export function PoliciesPanel() {
  const { t } = usePreferences()
  const policies = useCollection('insurancePolicies')

  if (!isLive) {
    return (
      <ConnectApi
        icon="ShieldCheck"
        title="No policies to show"
        description="Insurance policies are served by the API. The fixture build has none — connect a live API to browse them."
        collection="insurancePolicies"
      />
    )
  }

  if (policies.isLoading) return <Loading label="Loading policies..." />
  if (policies.isError) {
    return <ErrorState description={policies.error?.message} onRetry={() => void policies.refetch()} />
  }

  const rows = (policies.data ?? []) as readonly InsurancePolicyRow[]
  const columns: readonly Column<InsurancePolicyRow>[] = [
    { header: 'Policy', code: true, cell: (r) => r.policyNumber },
    { header: 'Insurer', cell: (r) => t(r.insurer) },
    { header: 'Type', cell: (r) => t(POLICY_TYPE_LABEL[r.type] ?? r.type) },
    { header: 'Holder', cell: (r) => r.holder },
    { header: 'Vehicle', code: true, cell: (r) => r.vehicleLabel },
    { header: 'Premium', cell: (r) => <Money sar={r.premiumHalalas / 100} className="text-[13px]" /> },
    { header: 'Coverage', cell: (r) => <Money sar={r.coverageHalalas / 100} className="text-[13px]" /> },
    { header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  ]

  return (
    <DataTable
      caption="Insurance policies"
      columns={columns}
      rows={rows}
      rowKey={(r, i) => r._id ?? `${r.policyNumber}-${i}`}
      empty={
        <ConnectApi
          icon="ShieldCheck"
          title="No policies yet"
          description="Policies filed against a vehicle appear here once the insurer records are loaded."
          collection="insurancePolicies"
        />
      }
      mobileCard={(r) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
              {r.policyNumber}
            </span>
            <StatusPill value={r.status} />
          </div>
          <span className="text-[13px] font-semibold text-heading">{t(r.insurer)}</span>
          <span className="text-[11px] text-muted">
            {r.holder} · <span dir="ltr">{r.vehicleLabel}</span>
          </span>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
            <span>
              {t('Premium')} <Money sar={r.premiumHalalas / 100} className="text-body" />
            </span>
            <span>
              {t('Coverage')} <Money sar={r.coverageHalalas / 100} className="text-body" />
            </span>
          </div>
        </div>
      )}
    />
  )
}

// ── Loans ────────────────────────────────────────────────────────────────────

export function LoansPanel() {
  const { t } = usePreferences()
  const contracts = useCollection('loanContracts')
  const repayments = useCollection('loanRepayments')
  const [selected, setSelected] = useState<LoanContractRow | null>(null)

  const summary = useQuery({
    queryKey: ['loans', 'summary'],
    queryFn: () => productReports!.loansSummary(),
    enabled: Boolean(productReports),
    retry: false,
  })

  const schedule = useMemo<readonly LoanRepaymentRow[]>(() => {
    if (!selected) return []
    const rows = (repayments.data ?? []) as readonly LoanRepaymentRow[]
    return rows
      .filter((r) => r.contractId === selected._id || r.contractNumber === selected.contractNumber)
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
  }, [selected, repayments.data])

  if (!isLive) {
    return (
      <ConnectApi
        icon="Banknote"
        title="No finance to show"
        description="Auto-loan contracts and their repayment schedule are served by the API. The fixture build has none — connect a live API to browse them."
        collection="loanContracts"
      />
    )
  }

  if (contracts.isLoading) return <Loading label="Loading contracts..." />
  if (contracts.isError) {
    return <ErrorState description={contracts.error?.message} onRetry={() => void contracts.refetch()} />
  }

  const rows = (contracts.data ?? []) as readonly LoanContractRow[]
  const columns: readonly Column<LoanContractRow>[] = [
    { header: 'Contract', code: true, cell: (r) => r.contractNumber },
    { header: 'Borrower', cell: (r) => r.borrower },
    { header: 'Principal', cell: (r) => <Money sar={r.principalHalalas / 100} className="text-[13px]" /> },
    { header: 'Rate', code: true, cell: (r) => `${(r.rateBps / 100).toFixed(2)}%` },
    { header: 'Term', cell: (r) => `${r.termMonths} ${t('mo')}` },
    {
      header: 'Instalment',
      cell: (r) => <Money sar={r.monthlyInstalmentHalalas / 100} className="text-[13px]" />,
    },
    { header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
  ]

  return (
    <div className="flex flex-col gap-4">
      {productReports && summary.data ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard icon="FileText" value={String(summary.data.contractCount)} label="Contracts" />
          <StatCard
            icon="Banknote"
            value={<Money sar={summary.data.principalHalalas / 100} bare className="text-lg" />}
            label="Principal"
          />
          <StatCard
            icon="ArrowDownRight"
            value={<Money sar={summary.data.outstandingHalalas / 100} bare className="text-lg" />}
            label="Outstanding"
          />
          <StatCard
            icon="AlertTriangle"
            value={<Money sar={summary.data.overdueHalalas / 100} bare className="text-lg" />}
            label="Overdue"
          />
        </div>
      ) : null}

      <DataTable
        caption="Auto-loan contracts"
        columns={columns}
        rows={rows}
        rowKey={(r, i) => r._id ?? `${r.contractNumber}-${i}`}
        onRowClick={(r) => setSelected(r)}
        empty={
          <ConnectApi
            icon="Banknote"
            title="No contracts yet"
            description="Auto-loan contracts appear here once the finance records are loaded."
            collection="loanContracts"
          />
        }
        mobileCard={(r) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
                {r.contractNumber}
              </span>
              <StatusPill value={r.status} />
            </div>
            <span className="text-[13px] font-semibold text-heading">{r.borrower}</span>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
              <span>
                {t('Principal')} <Money sar={r.principalHalalas / 100} className="text-body" />
              </span>
              <span>
                {t('Instalment')} <Money sar={r.monthlyInstalmentHalalas / 100} className="text-body" />
              </span>
            </div>
          </div>
        )}
      />

      {selected ? (
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex flex-shrink-0 rounded-lg bg-[var(--tint-blue)] p-2 text-salis-blue">
                <Icon name="CalendarClock" size={15} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-heading">
                  {t('Repayment schedule')} ·{' '}
                  <span className="font-mono" dir="ltr">
                    {selected.contractNumber}
                  </span>
                </p>
                <p className="text-[11px] text-muted">{selected.borrower}</p>
              </div>
            </div>
            <Button variant="subtle" size="sm" onClick={() => setSelected(null)}>
              <Icon name="X" size={13} />
              {t('Close')}
            </Button>
          </div>

          {repayments.isError ? (
            <ErrorState
              description={repayments.error?.message}
              onRetry={() => void repayments.refetch()}
            />
          ) : (
            <DataTable
              caption="Repayment schedule"
              columns={
                [
                  { header: '#', code: true, cell: (r) => String(r.sequence) },
                  { header: 'Due date', code: true, cell: (r) => r.dueDate },
                  {
                    header: 'Amount due',
                    cell: (r) => <Money sar={r.amountDueHalalas / 100} className="text-[13px]" />,
                  },
                  {
                    header: 'Paid',
                    cell: (r) => <Money sar={r.amountPaidHalalas / 100} className="text-[13px]" />,
                  },
                  { header: 'Paid date', code: true, cell: (r) => r.paidDate ?? '—' },
                  { header: 'Status', cell: (r) => <StatusPill value={r.status} /> },
                ] as readonly Column<LoanRepaymentRow>[]
              }
              rows={schedule}
              loading={repayments.isLoading}
              rowKey={(r, i) => r._id ?? `${r.contractNumber}-${r.sequence}-${i}`}
              empty={
                <ConnectApi
                  icon="CalendarClock"
                  title="No schedule rows"
                  description="This contract has no repayment rows on the server yet."
                  collection="loanRepayments"
                />
              }
              mobileCard={(r) => (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-heading">
                      #{r.sequence} · <span dir="ltr">{r.dueDate}</span>
                    </span>
                    <Money sar={r.amountDueHalalas / 100} className="text-[11px] text-muted" />
                  </div>
                  <StatusPill value={r.status} />
                </div>
              )}
            />
          )}
        </Card>
      ) : null}
    </div>
  )
}
