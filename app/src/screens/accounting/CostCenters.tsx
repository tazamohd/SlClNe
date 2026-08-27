import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
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

  const columns: Column<CostCenter>[] = [
    { header: 'Code', cell: (c) => c.code, code: true },
    { header: 'Name', cell: (c) => t(c.name) },
    { header: 'Department', cell: (c) => t(c.department) },
    { header: 'Budget', cell: (c) => <Money sar={c.budget} />, className: 'text-end' },
    { header: 'Actual', cell: (c) => <Money sar={c.actual} />, className: 'text-end' },
    { header: 'Variance', cell: (c) => <Money sar={c.variance} className={c.variance >= 0 ? 'text-salis-blue' : 'text-salis-orange'} />, className: 'text-end' },
    { header: 'Manager', cell: (c) => c.manager },
    { header: 'Status', cell: (c) => {
      const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
      return <Badge background={bg} color={fg}>{t(c.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Target"
        title={t('Cost Centers')}
        subtitle={t('Budget tracking by department and cost center')}
      />
      <StatRow stats={stats} />

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

      <DataTable
        caption="Cost center list"
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.code}
        mobileCard={(c) => {
          const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE.Active
          return (
            <>
              <MobileCardHeader title={c.code} code trailing={<Badge background={bg} color={fg}>{t(c.status)}</Badge>} />
              <MobileCardRow>{t(c.name)}</MobileCardRow>
              <MobileCardRow label={t('Budget')}><Money sar={c.budget} className="text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Target" title={t('No cost centers match the filter')} />}
      />
    </div>
  )
}
