import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
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
  Active: ['var(--tint-blue)', '#0A5ED7'],
  Disposed: ['rgba(100,116,139,.1)', '#64748B'],
  'Under Maintenance': ['var(--tint-orange)', '#F97316'],
}

const CATEGORIES = ['All', 'Land', 'Building', 'Vehicle', 'Equipment', 'Furniture', 'IT'] as const

export function AssetsManagement() {
  const { t } = usePreferences()
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

  const columns: Column<Asset>[] = [
    { header: 'Code', cell: (a) => a.code, code: true },
    { header: 'Asset Name', cell: (a) => t(a.name) },
    { header: 'Category', cell: (a) => t(a.category) },
    { header: 'Acquired', cell: (a) => <span dir="ltr" className="text-muted">{a.acquisitionDate}</span> },
    { header: 'Cost', cell: (a) => <Money sar={a.cost} />, className: 'text-end' },
    { header: 'Depreciation', cell: (a) => <Money sar={a.depreciation} />, className: 'text-end' },
    { header: 'Net Value', cell: (a) => <Money sar={a.netValue} className="font-semibold" />, className: 'text-end' },
    { header: 'Status', cell: (a) => {
      const [bg, fg] = STATUS_PALETTE[a.status] ?? STATUS_PALETTE.Active
      return <Badge background={bg} color={fg}>{t(a.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Building"
        title={t('Assets Management')}
        subtitle={t('Fixed asset register with depreciation tracking')}
      />
      <StatRow stats={stats} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Code or name')}
            aria-label={t('Search assets')}
            inputSize="sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Category')}</span>
          <Select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            aria-label={t('Filter by category')}
            size="md"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? t('All Categories') : t(c)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <DataTable
        caption="Asset register"
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.code}
        mobileCard={(a) => {
          const [bg, fg] = STATUS_PALETTE[a.status] ?? STATUS_PALETTE.Active
          return (
            <>
              <MobileCardHeader title={a.code} code trailing={<Badge background={bg} color={fg}>{t(a.status)}</Badge>} />
              <MobileCardRow>{t(a.name)}</MobileCardRow>
              <MobileCardRow label={t('Cost')}><Money sar={a.cost} className="text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Building" title={t('No assets match the filter')} />}
      />
    </div>
  )
}
