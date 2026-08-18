import { FeatureHeader, Section, StatRow, TabBar, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useState } from 'react'

/** Financing applications by lender.
 *
 *  `Repository` (`src/data/repository.ts`) has no `loans` collection yet — the
 *  API surface this screen wants (per-lender application/approval/financed
 *  counts) doesn't exist. This is a typed local stand-in for that future read;
 *  once a `loans` collection lands, replace `LENDER_LOAN_SUMMARY` with
 *  `useCollection('loans')` grouped by lender and every aggregate below falls
 *  out unchanged. Figures are ported 1:1 from `LoanReports.dc.html`'s
 *  per-lender table. */
interface LenderLoanSummary {
  lender: string
  applications: number
  approved: number
  financedSar: number
  avgTermMonths: number
  /** Representative APR for this lender's book, used to weight the portfolio
   *  average — the design hardcoded a top-line 3.6% with nothing under it to
   *  derive it from; these five figures land the same weighted average. */
  avgApr: number
}

const LENDER_LOAN_SUMMARY: readonly LenderLoanSummary[] = [
  { lender: 'Al Rajhi Bank', applications: 24, approved: 19, financedSar: 2_600_000, avgTermMonths: 60, avgApr: 3.4 },
  { lender: 'Riyad Bank', applications: 16, approved: 12, financedSar: 1_800_000, avgTermMonths: 54, avgApr: 3.5 },
  { lender: 'SNB', applications: 13, approved: 9, financedSar: 1_400_000, avgTermMonths: 48, avgApr: 3.8 },
  { lender: 'Bank Albilad', applications: 8, approved: 5, financedSar: 700_000, avgTermMonths: 60, avgApr: 3.9 },
  { lender: 'Other', applications: 3, approved: 2, financedSar: 300_000, avgTermMonths: 36, avgApr: 4.2 },
]

const TOTAL_APPLICATIONS = LENDER_LOAN_SUMMARY.reduce((sum, r) => sum + r.applications, 0)
const TOTAL_APPROVED = LENDER_LOAN_SUMMARY.reduce((sum, r) => sum + r.approved, 0)
const TOTAL_FINANCED_SAR = LENDER_LOAN_SUMMARY.reduce((sum, r) => sum + r.financedSar, 0)
const WEIGHTED_AVG_APR =
  LENDER_LOAN_SUMMARY.reduce((sum, r) => sum + r.avgApr * r.applications, 0) / (TOTAL_APPLICATIONS || 1)
const APPROVAL_RATE = TOTAL_APPLICATIONS ? (TOTAL_APPROVED / TOTAL_APPLICATIONS) * 100 : 0

/** Blue-family palette only — these are lender rows, not overdue or at-risk
 *  accounts, so orange (README §7: warnings/critical only) doesn't apply. */
const BAR_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#0B1F3B']

type Period = 'week' | 'month' | 'quarter' | 'year'
const PERIODS: readonly { id: Period; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
]

/** Applications submitted vs approved, per lender — a track bar (all
 *  applications) with a solid overlay (the approved share). Replaces the
 *  design's trend line, which drew a fixed decorative curve unrelated to any
 *  figure on the page; this draws real numbers from the table below. */
function ApprovalBars({ rows }: { rows: readonly LenderLoanSummary[] }) {
  const { t } = usePreferences()
  const max = Math.max(...rows.map((r) => r.applications), 1)
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.lender} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-body">{t(row.lender)}</span>
            <span className="font-mono text-xs font-semibold text-muted" dir="ltr">
              {row.approved}/{row.applications}
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-inset">
            <div
              className="absolute inset-y-0 rounded-full bg-[rgba(10,94,215,.22)] start-0"
              style={{ width: `${(row.applications / max) * 100}%` }}
            />
            <div
              className="absolute inset-y-0 rounded-full bg-salis-blue start-0"
              style={{ width: `${(row.approved / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Financed value share by lender — proportional bars, same shape as the
 *  design's Breakdown panel. */
function FinancedBars({ rows }: { rows: readonly LenderLoanSummary[] }) {
  const { t } = usePreferences()
  const max = Math.max(...rows.map((r) => r.financedSar), 1)
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row, index) => (
        <div key={row.lender} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-body">{t(row.lender)}</span>
            <Money sar={row.financedSar} className="font-semibold text-heading" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.financedSar / max) * 100}%`,
                background: BAR_COLORS[index % BAR_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoanReports() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { show } = useToast()
  const [period, setPeriod] = useState<Period>('month')

  // Every role that can open this screen already holds `execreports:v` — the
  // route itself is gated on it. Checked again here, same as
  // ExecutiveReports' `hidePnl`, so widening the module elsewhere can't
  // silently surface the export action to a view-only role.
  const canExport = can('execreports', 'v')

  const stats: Stat[] = [
    {
      label: 'Applications',
      value: TOTAL_APPLICATIONS,
      caption: t(PERIODS.find((p) => p.id === period)?.label ?? 'This Month'),
      highlight: true,
      icon: 'FileText',
    },
    {
      label: 'Approval Rate',
      value: `${APPROVAL_RATE.toFixed(1)}%`,
      caption: 'Approved of submitted',
      tone: 'info',
      icon: 'CheckCircle',
    },
    {
      label: 'Financed Value',
      value: formatSar(TOTAL_FINANCED_SAR),
      caption: 'Total disbursed',
      icon: 'Banknote',
    },
    {
      label: 'Avg APR',
      value: `${WEIGHTED_AVG_APR.toFixed(1)}%`,
      caption: 'Weighted by applications',
      icon: 'Percent',
    },
  ]

  const columns: Column<LenderLoanSummary>[] = [
    { header: 'Lender', cell: (r) => t(r.lender) },
    { header: 'Applications', cell: (r) => r.applications, code: true, className: 'text-end' },
    { header: 'Approved', cell: (r) => r.approved, code: true, className: 'text-end' },
    {
      header: 'Financed',
      cell: (r) => <Money sar={r.financedSar} className="font-semibold" />,
      className: 'text-end',
    },
    { header: 'Avg Term', cell: (r) => `${r.avgTermMonths} ${t('mo')}`, code: true, className: 'text-end' },
  ]

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Loan Reports')}
        subtitle={t('Financing applications, approvals and lender performance')}
        actions={
          canExport ? (
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                show({
                  title: t('Export'),
                  description: t('Report export is not connected to a backend yet.'),
                })
              }
            >
              <Icon name="Download" size={15} />
              {t('Export Report')}
            </Button>
          ) : null
        }
      />

      <TabBar
        tabs={PERIODS.map((p) => ({ id: p.id, label: p.label }))}
        value={period}
        onChange={(id) => setPeriod(id as Period)}
      />

      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Applications vs Approved')} subtitle={t('By lender, current period')}>
          <ApprovalBars rows={LENDER_LOAN_SUMMARY} />
        </Section>
        <Section title={t('Financed by Lender')} subtitle={t('Share of total disbursed')}>
          <FinancedBars rows={LENDER_LOAN_SUMMARY} />
        </Section>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-bold text-heading">{t('Lender Detail')}</h2>
        <DataTable
          columns={columns}
          rows={LENDER_LOAN_SUMMARY}
          rowKey={(r) => r.lender}
          empty={
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex rounded-full bg-inset p-4 text-muted">
                <Icon name="Landmark" size={24} />
              </span>
              <div>
                <p className="font-action text-sm font-semibold text-heading">{t('No financing activity')}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {t('No lender applications recorded for this period.')}
                </p>
              </div>
            </div>
          }
          mobileCard={(r) => (
            <>
              <MobileCardHeader
                title={t(r.lender)}
                trailing={
                  <span className="font-mono text-[13px] font-bold text-salis-blue" dir="ltr">
                    {r.avgTermMonths} {t('mo')}
                  </span>
                }
              />
              <MobileCardRow label={t('Applications')}>
                <span className="font-mono" dir="ltr">
                  {r.applications}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Approved')}>
                <span className="font-mono" dir="ltr">
                  {r.approved}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Financed')}>
                <Money sar={r.financedSar} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
        />
      </div>
    </>
  )
}
