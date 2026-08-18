import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

interface CostCenter {
  code: string
  name: string
  department: string
  budget: number
  actual: number
  variance: number
  manager: string
  status: string
}

const MOCK_CENTERS: readonly CostCenter[] = [
  { code: 'CC-001', name: 'Workshop Operations', department: 'Service', budget: 450000_00, actual: 380000_00, variance: 70000_00, manager: 'Ahmed Al-Rashid', status: 'Active' },
  { code: 'CC-002', name: 'Parts Department', department: 'Inventory', budget: 250000_00, actual: 265000_00, variance: -15000_00, manager: 'Fahad Al-Otaibi', status: 'Active' },
  { code: 'CC-003', name: 'Sales Division', department: 'Sales', budget: 180000_00, actual: 155000_00, variance: 25000_00, manager: 'Khalid Al-Harbi', status: 'Active' },
  { code: 'CC-004', name: 'Administration', department: 'Admin', budget: 120000_00, actual: 118000_00, variance: 2000_00, manager: 'Nora Al-Qahtani', status: 'Active' },
  { code: 'CC-005', name: 'Marketing', department: 'Marketing', budget: 85000_00, actual: 62000_00, variance: 23000_00, manager: 'Salman Al-Dosari', status: 'Active' },
  { code: 'CC-006', name: 'Old Branch Office', department: 'Admin', budget: 0, actual: 0, variance: 0, manager: 'N/A', status: 'Inactive' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Inactive: ['rgba(100,116,139,.1)', '#64748B'],
}

export function CostCenters() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_CENTERS.filter(
      (c) =>
        !needle ||
        c.code.toLowerCase().includes(needle) ||
        c.name.toLowerCase().includes(needle) ||
        c.department.toLowerCase().includes(needle)
    )
  }, [query])

  const totals = useMemo(() => {
    let budget = 0
    let actual = 0
    let variance = 0
    for (const c of MOCK_CENTERS) {
      budget += c.budget
      actual += c.actual
      variance += c.variance
    }
    return { count: MOCK_CENTERS.length, budget, actual, variance }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Centers', value: totals.count, caption: 'Cost centers', highlight: true },
    { label: 'Total Budget', value: formatSar(totals.budget), caption: 'All centers' },
    { label: 'Total Actual', value: formatSar(totals.actual), caption: 'Spent to date' },
    { label: 'Variance', value: formatSar(totals.variance), caption: totals.variance >= 0 ? 'Under budget' : 'Over budget', tone: totals.variance >= 0 ? 'info' : 'warning' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Target"
          title={t('Cost Centers')}
          subtitle={t('Accounting')}
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
            return (
              <MobileCard key={c.code}>
                <MobileCardHeader
                  title={c.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(c.status)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(c.name)}</MobileCardRow>
                <MobileCardRow label={t('Department')}>{t(c.department)}</MobileCardRow>
                <MobileCardRow label={t('Budget')}>
                  <Money sar={c.budget} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Actual')}>
                  <Money sar={c.actual} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Variance')}>
                  <Money sar={c.variance} className={c.variance >= 0 ? 'text-salis-blue' : 'text-salis-orange'} />
                </MobileCardRow>
                <MobileCardRow label={t('Manager')}>{c.manager}</MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Target"
        title={t('Cost Centers')}
        subtitle={t('Budget tracking by department and cost center')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Cost Center List')}
        subtitle={t('All cost centers with budget and actual figures')}
        toolbar={
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Code, name or department')}
              aria-label={t('Search cost centers')}
              className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Name')}</th>
                <th className="py-2.5 text-start font-medium">{t('Department')}</th>
                <th className="py-2.5 text-end font-medium">{t('Budget')}</th>
                <th className="py-2.5 text-end font-medium">{t('Actual')}</th>
                <th className="py-2.5 text-end font-medium">{t('Variance')}</th>
                <th className="py-2.5 text-start font-medium">{t('Manager')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
                return (
                  <tr key={c.code} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{c.code}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(c.name)}</td>
                    <td className="py-2.5 text-[13px] text-body">{t(c.department)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.budget} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.actual} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.variance} className={c.variance >= 0 ? 'text-salis-blue' : 'text-salis-orange'} />
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{c.manager}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(c.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No cost centers match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
