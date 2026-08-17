import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, TabBar, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/components/ui/Toast'

/** Insurance Reports — policies, claims and commission rolled up by provider.
 *
 *  The repository has no `insuranceProviders`/`insuranceClaims` collection
 *  (`repository.ts` only carries the 33 tables it already ports) — SODAD,
 *  Najm and Tawuniya only show up as connected `integrations`, not as a data
 *  source. `INSURANCE_PROVIDERS` below is kept as a local const, typed the
 *  way a future `useCollection('insuranceProviders')` would return it, same
 *  as `SalesReports`' rep leaderboard. The four headline KPIs and the policy-
 *  type breakdown are then computed from those rows, so they can't drift from
 *  the table underneath the way the design's did.
 *
 *  One figure changed in that reconciliation: `InsuranceReports.dc.html`
 *  hardcodes an 88.4% approval rate, but its own five provider rows sum to
 *  37 approved of 41 claims filed — 90.2%. This mirrors the Payments
 *  discrepancy documented in the app README ("One number that changed"): the
 *  headline and the table it sits above were never reconciled in the design,
 *  so this port derives the rate from the rows instead of re-hardcoding it. */

/** Brand-safe chart palette — blue/bright/orange/slate only (README §7). */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#F97316', '#0B1F3B', '#64748B']

interface InsuranceProviderRow {
  provider: string
  policies: number
  claims: number
  approved: number
  commission: number
}

/** Figures match `InsuranceReports.dc.html`'s `rowRaw`. */
const INSURANCE_PROVIDERS: readonly InsuranceProviderRow[] = [
  { provider: 'Tawuniya', policies: 96, claims: 14, approved: 13, commission: 15_200 },
  { provider: 'Bupa Arabia', policies: 72, claims: 11, approved: 10, commission: 11_400 },
  { provider: 'Malath Insurance', policies: 58, claims: 8, approved: 7, commission: 8_600 },
  { provider: 'Al Rajhi Takaful', policies: 44, claims: 6, approved: 5, commission: 5_200 },
  { provider: 'Salama', policies: 16, claims: 2, approved: 2, commission: 2_200 },
]

/** Figures match `InsuranceReports.dc.html`'s `bdRaw`. Also sums to the same
 *  286 active policies as the provider table above. */
const POLICY_TYPES: readonly { type: string; policies: number }[] = [
  { type: 'Comprehensive', policies: 182 },
  { type: 'Third Party', policies: 74 },
  { type: 'Fleet Cover', policies: 22 },
  { type: 'Extended Warranty', policies: 8 },
]

const PERIODS = ['week', 'month', 'quarter', 'year'] as const
const PERIOD_LABEL: Record<(typeof PERIODS)[number], string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
}

/** One row of a breakdown panel — a label, a bar sized against `max`, and a
 *  trailing value already formatted by the caller. */
function BarRow({
  label,
  value,
  max,
  color,
  display,
}: {
  label: string
  value: number
  max: number
  color: string
  display: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-body">{label}</span>
        <span className="font-mono font-semibold text-heading" dir="ltr">
          {display}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}

export function InsuranceReports() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('month')

  // The headline KPIs derive from the provider rows rather than repeating the
  // design's separately-hardcoded figures — see the file doc comment for the
  // one place that changed as a result (approval rate).
  const totals = useMemo(() => {
    const policies = INSURANCE_PROVIDERS.reduce((sum, row) => sum + row.policies, 0)
    const claims = INSURANCE_PROVIDERS.reduce((sum, row) => sum + row.claims, 0)
    const approved = INSURANCE_PROVIDERS.reduce((sum, row) => sum + row.approved, 0)
    const commission = INSURANCE_PROVIDERS.reduce((sum, row) => sum + row.commission, 0)
    return {
      policies,
      claims,
      approved,
      commission,
      approvalRate: claims ? (approved / claims) * 100 : 0,
    }
  }, [])

  const stats: Stat[] = [
    {
      label: 'Active Policies',
      value: totals.policies,
      caption: 'Across all providers',
      highlight: true,
      icon: 'Shield',
    },
    {
      label: 'Claims Filed',
      value: totals.claims,
      caption: 'This period',
      icon: 'FileCheck',
    },
    {
      label: 'Approval Rate',
      value: `${totals.approvalRate.toFixed(1)}%`,
      caption: 'Approved of claims filed',
      tone: 'info',
      icon: 'BadgeCheck',
    },
    {
      label: 'Commission',
      value: formatSar(totals.commission),
      caption: 'Earned from providers',
      tone: 'info',
      icon: 'Coins',
    },
  ]

  const policyTypeMax = Math.max(...POLICY_TYPES.map((row) => row.policies), 1)
  const canExport = can('execreports', 'x')

  function handleExport() {
    toast.show({
      title: t('Export started'),
      description: t('The insurance report is being prepared for download.'),
    })
  }

  const providerColumns: Column<InsuranceProviderRow>[] = [
    { header: 'Provider', cell: (row) => t(row.provider) },
    { header: 'Policies', cell: (row) => row.policies, code: true },
    { header: 'Claims', cell: (row) => row.claims, code: true },
    { header: 'Approved', cell: (row) => row.approved, code: true },
    {
      header: 'Commission',
      cell: (row) => <Money sar={row.commission} className="font-semibold text-heading" />,
      code: true,
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="Shield"
        title={t('Insurance Reports')}
        subtitle={t('Reports & Analytics')}
        actions={
          <>
            {!isMobile ? (
              <TabBar
                tabs={PERIODS.map((p) => ({ id: p, label: PERIOD_LABEL[p] }))}
                value={period}
                onChange={(id) => setPeriod(id as (typeof PERIODS)[number])}
              />
            ) : null}
            {canExport ? (
              <Button size="md" onClick={handleExport}>
                <Icon name="Download" size={15} />
                {t('Export Report')}
              </Button>
            ) : null}
          </>
        }
      />

      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <Section title={t('Claims by Provider')} subtitle={t('Approved against total claims filed')}>
          <div className="flex flex-col gap-3.5">
            {INSURANCE_PROVIDERS.map((row, index) => (
              <BarRow
                key={row.provider}
                label={t(row.provider)}
                value={row.claims}
                max={Math.max(...INSURANCE_PROVIDERS.map((r) => r.claims), 1)}
                color={CHART_COLORS[index % CHART_COLORS.length]}
                display={`${row.approved} / ${row.claims}`}
              />
            ))}
          </div>
        </Section>

        <Section title={t('Breakdown')} subtitle={t('Active policies by cover type')}>
          <div className="flex flex-col gap-3.5">
            {POLICY_TYPES.map((row, index) => (
              <BarRow
                key={row.type}
                label={t(row.type)}
                value={row.policies}
                max={policyTypeMax}
                color={CHART_COLORS[index % CHART_COLORS.length]}
                display={`${row.policies} ${t('policies')}`}
              />
            ))}
          </div>
        </Section>
      </div>

      <Section title={t('Details')} subtitle={t('Policies, claims and commission per provider')}>
        <DataTable
          columns={providerColumns}
          rows={INSURANCE_PROVIDERS}
          rowKey={(row) => row.provider}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                title={t(row.provider)}
                trailing={<Money sar={row.commission} className="font-semibold text-salis-blue" />}
              />
              <MobileCardRow label={t('Policies')}>{row.policies}</MobileCardRow>
              <MobileCardRow label={t('Claims')}>{row.claims}</MobileCardRow>
              <MobileCardRow label={t('Approved')}>{row.approved}</MobileCardRow>
            </>
          )}
        />
      </Section>
    </>
  )
}
