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

interface Partner {
  name: string
  capitalContribution: number
  drawings: number
  share: number
  currentBalance: number
  status: string
}

const MOCK_PARTNERS: readonly Partner[] = [
  { name: 'Abdullah Al-Rashid', capitalContribution: 500000_00, drawings: 45000_00, share: 40, currentBalance: 455000_00, status: 'Active' },
  { name: 'Mohammed Al-Otaibi', capitalContribution: 375000_00, drawings: 30000_00, share: 30, currentBalance: 345000_00, status: 'Active' },
  { name: 'Fahad Al-Harbi', capitalContribution: 250000_00, drawings: 20000_00, share: 20, currentBalance: 230000_00, status: 'Active' },
  { name: 'Khaled Al-Dosari', capitalContribution: 125000_00, drawings: 0, share: 10, currentBalance: 125000_00, status: 'Inactive' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['var(--tint-blue)', '#0A5ED7'],
  Inactive: ['rgba(100,116,139,.1)', '#64748B'],
}

export function PartnersCurrentAccount() {
  const { t } = usePreferences()

  const totals = useMemo(() => {
    let capital = 0
    let drawings = 0
    let balance = 0
    for (const p of MOCK_PARTNERS) {
      capital += p.capitalContribution
      drawings += p.drawings
      balance += p.currentBalance
    }
    return { capital, drawings, balance }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Capital', value: formatSar(totals.capital), caption: 'All contributions', highlight: true },
    { label: 'Total Drawings', value: formatSar(totals.drawings), caption: 'Withdrawn to date' },
    { label: 'Net Balance', value: formatSar(totals.balance), caption: 'Current net position', tone: 'info' },
  ]

  const columns: Column<Partner>[] = [
    { header: 'Partner Name', cell: (p) => <span className="font-medium text-heading">{p.name}</span> },
    { header: 'Capital', cell: (p) => <Money sar={p.capitalContribution} />, className: 'text-end' },
    { header: 'Drawings', cell: (p) => <Money sar={p.drawings} />, className: 'text-end' },
    { header: 'Share %', cell: (p) => <span className="text-heading">{p.share}%</span>, className: 'text-end' },
    { header: 'Balance', cell: (p) => <Money sar={p.currentBalance} className="font-semibold" />, className: 'text-end' },
    { header: 'Status', cell: (p) => {
      const [bg, fg] = STATUS_PALETTE[p.status] ?? STATUS_PALETTE.Active
      return <Badge background={bg} color={fg}>{t(p.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Users"
        title={t('Partners Current Account')}
        subtitle={t('Partner capital contributions, drawings and balances')}
      />
      <StatRow stats={stats} />

      <DataTable
        caption="Partner accounts"
        columns={columns}
        rows={MOCK_PARTNERS as Partner[]}
        rowKey={(p) => p.name}
        mobileCard={(p) => {
          const [bg, fg] = STATUS_PALETTE[p.status] ?? STATUS_PALETTE.Active
          return (
            <>
              <MobileCardHeader title={p.name} trailing={<Badge background={bg} color={fg}>{t(p.status)}</Badge>} />
              <MobileCardRow label={t('Share')}>{p.share}%</MobileCardRow>
              <MobileCardRow label={t('Balance')}><Money sar={p.currentBalance} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Users" title={t('No partner accounts found')} />}
      />
    </div>
  )
}
