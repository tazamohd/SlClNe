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

interface Asset {
  code: string
  name: string
  category: string
  acquisitionDate: string
  cost: number
  depreciation: number
  netValue: number
  status: string
}

const MOCK_ASSETS: readonly Asset[] = [
  { code: 'AST-001', name: 'Main Workshop Land', category: 'Land', acquisitionDate: '2019-01-15', cost: 2500000_00, depreciation: 0, netValue: 2500000_00, status: 'Active' },
  { code: 'AST-002', name: 'Workshop Building', category: 'Building', acquisitionDate: '2019-06-01', cost: 1800000_00, depreciation: 360000_00, netValue: 1440000_00, status: 'Active' },
  { code: 'AST-003', name: 'Toyota Hilux – Service', category: 'Vehicle', acquisitionDate: '2021-03-10', cost: 145000_00, depreciation: 58000_00, netValue: 87000_00, status: 'Active' },
  { code: 'AST-004', name: 'Hydraulic Lift #1', category: 'Equipment', acquisitionDate: '2020-08-22', cost: 85000_00, depreciation: 34000_00, netValue: 51000_00, status: 'Active' },
  { code: 'AST-005', name: 'Office Desk Set', category: 'Furniture', acquisitionDate: '2022-01-05', cost: 12000_00, depreciation: 4800_00, netValue: 7200_00, status: 'Active' },
  { code: 'AST-006', name: 'Diagnostic Scanner Pro', category: 'IT', acquisitionDate: '2023-04-18', cost: 35000_00, depreciation: 8750_00, netValue: 26250_00, status: 'Active' },
  { code: 'AST-007', name: 'Old Compressor Unit', category: 'Equipment', acquisitionDate: '2017-11-30', cost: 25000_00, depreciation: 25000_00, netValue: 0, status: 'Disposed' },
  { code: 'AST-008', name: 'Delivery Van – Ford', category: 'Vehicle', acquisitionDate: '2020-05-14', cost: 120000_00, depreciation: 60000_00, netValue: 60000_00, status: 'Under Maintenance' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Disposed: ['rgba(100,116,139,.1)', '#64748B'],
  'Under Maintenance': ['rgba(249,115,22,.1)', '#F97316'],
}

const CATEGORIES = ['All', 'Land', 'Building', 'Vehicle', 'Equipment', 'Furniture', 'IT'] as const

export function AssetsManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [catFilter, setCatFilter] = useState<string>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_ASSETS.filter((a) => catFilter === 'All' || a.category === catFilter).filter(
      (a) =>
        !needle ||
        a.code.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle)
    )
  }, [catFilter, query])

  const totals = useMemo(() => {
    let cost = 0
    let depreciation = 0
    let netValue = 0
    for (const a of MOCK_ASSETS) {
      cost += a.cost
      depreciation += a.depreciation
      netValue += a.netValue
    }
    return { count: MOCK_ASSETS.length, cost, depreciation, netValue }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Assets', value: totals.count, caption: 'Registered assets', highlight: true },
    { label: 'Total Value', value: formatSar(totals.cost), caption: 'Acquisition cost' },
    { label: 'Total Depreciation', value: formatSar(totals.depreciation), caption: 'Accumulated' },
    { label: 'Net Book Value', value: formatSar(totals.netValue), caption: 'Current value', tone: 'info' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Building"
          title={t('Assets Management')}
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
          {filtered.map((a) => {
            const [bg, fg] = STATUS_PALETTE[a.status] ?? STATUS_PALETTE.Active
            return (
              <MobileCard key={a.code}>
                <MobileCardHeader
                  title={a.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(a.status)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(a.name)}</MobileCardRow>
                <MobileCardRow label={t('Category')}>{t(a.category)}</MobileCardRow>
                <MobileCardRow label={t('Cost')}>
                  <Money sar={a.cost} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Depreciation')}>
                  <Money sar={a.depreciation} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Net Value')}>
                  <Money sar={a.netValue} className="font-semibold text-heading" />
                </MobileCardRow>
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
        icon="Building"
        title={t('Assets Management')}
        subtitle={t('Fixed asset register with depreciation tracking')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Asset Register')}
        subtitle={t('All registered assets with values and status')}
        toolbar={
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Code or name')}
                aria-label={t('Search assets')}
                className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">{t('Category')}</span>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                aria-label={t('Filter by category')}
                className="h-10 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? t('All Categories') : t(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Asset Name')}</th>
                <th className="py-2.5 text-start font-medium">{t('Category')}</th>
                <th className="py-2.5 text-start font-medium">{t('Acquired')}</th>
                <th className="py-2.5 text-end font-medium">{t('Cost')}</th>
                <th className="py-2.5 text-end font-medium">{t('Depreciation')}</th>
                <th className="py-2.5 text-end font-medium">{t('Net Value')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const [bg, fg] = STATUS_PALETTE[a.status] ?? STATUS_PALETTE.Active
                return (
                  <tr key={a.code} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{a.code}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(a.name)}</td>
                    <td className="py-2.5 text-[13px] text-body">{t(a.category)}</td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{a.acquisitionDate}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.cost} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.depreciation} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={a.netValue} className="font-semibold" />
                    </td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(a.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No assets match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
