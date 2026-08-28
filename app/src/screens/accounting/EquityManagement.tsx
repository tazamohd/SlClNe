import { useMemo } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface EquityEntry {
  code: string
  name: string
  type: string
  balance: number
  lastUpdated: string
}

const MOCK_EQUITY: readonly EquityEntry[] = [
  { code: 'EQ-001', name: 'Share Capital', type: 'Paid-in Capital', balance: 1000000_00, lastUpdated: '2026-01-01' },
  { code: 'EQ-002', name: 'Retained Earnings', type: 'Retained Earnings', balance: 485000_00, lastUpdated: '2026-07-31' },
  { code: 'EQ-003', name: 'Legal Reserve', type: 'Reserves', balance: 100000_00, lastUpdated: '2026-01-01' },
  { code: 'EQ-004', name: 'Owner Drawings', type: 'Drawings', balance: -75000_00, lastUpdated: '2026-08-10' },
  { code: 'EQ-005', name: 'Revaluation Surplus', type: 'Other', balance: 120000_00, lastUpdated: '2026-06-30' },
]

const TYPE_PALETTE: Record<string, readonly [string, string]> = {
  'Paid-in Capital': ['var(--tint-blue)', '#0A5ED7'],
  'Retained Earnings': ['var(--tint-bright)', '#0BB3FF'],
  Reserves: ['var(--tint-navy)', '#0B1F3B'],
  Drawings: ['var(--tint-orange)', '#F97316'],
  Other: ['rgba(100,116,139,.1)', '#64748B'],
}

export function EquityManagement() {
  const { t } = usePreferences()

  const totals = useMemo(() => {
    let total = 0
    let paidIn = 0
    let retained = 0
    let reserves = 0
    for (const e of MOCK_EQUITY) {
      total += e.balance
      if (e.type === 'Paid-in Capital') paidIn += e.balance
      if (e.type === 'Retained Earnings') retained += e.balance
      if (e.type === 'Reserves') reserves += e.balance
    }
    return { total, paidIn, retained, reserves }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Equity', value: formatSar(totals.total), caption: 'Net worth', highlight: true },
    { label: 'Paid-in Capital', value: formatSar(totals.paidIn), caption: 'Invested capital' },
    { label: 'Retained Earnings', value: formatSar(totals.retained), caption: 'Accumulated profit' },
    { label: 'Reserves', value: formatSar(totals.reserves), caption: 'Legal and statutory', tone: 'info' },
  ]

  const columns: Column<EquityEntry>[] = [
    { header: 'Code', cell: (e) => e.code, code: true },
    { header: 'Name', cell: (e) => t(e.name) },
    { header: 'Type', cell: (e) => {
      const [bg, fg] = TYPE_PALETTE[e.type] ?? TYPE_PALETTE.Other
      return <Badge background={bg} color={fg}>{t(e.type)}</Badge>
    } },
    { header: 'Balance', cell: (e) => <Money sar={e.balance} className="font-semibold" />, className: 'text-end' },
    { header: 'Last Updated', cell: (e) => <span dir="ltr" className="text-muted">{e.lastUpdated}</span> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="PiggyBank"
        title={t('Equity Management')}
        subtitle={t('Owner equity accounts and reserves')}
      />
      <StatRow stats={stats} />

      <DataTable
        caption="Equity accounts"
        columns={columns}
        rows={MOCK_EQUITY as EquityEntry[]}
        rowKey={(e) => e.code}
        mobileCard={(e) => {
          const [bg, fg] = TYPE_PALETTE[e.type] ?? TYPE_PALETTE.Other
          return (
            <>
              <MobileCardHeader title={e.code} code trailing={<Badge background={bg} color={fg}>{t(e.type)}</Badge>} />
              <MobileCardRow>{t(e.name)}</MobileCardRow>
              <MobileCardRow label={t('Balance')}><Money sar={e.balance} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="PiggyBank" title={t('No equity entries found')} />}
      />
    </div>
  )
}
