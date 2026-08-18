import { useMemo } from 'react'
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
  'Paid-in Capital': ['rgba(10,94,215,.1)', '#0A5ED7'],
  'Retained Earnings': ['rgba(11,179,255,.1)', '#0BB3FF'],
  Reserves: ['rgba(11,31,59,.1)', '#0B1F3B'],
  Drawings: ['rgba(249,115,22,.1)', '#F97316'],
  Other: ['rgba(100,116,139,.1)', '#64748B'],
}

export function EquityManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="PiggyBank"
          title={t('Equity Management')}
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
          {MOCK_EQUITY.map((e) => {
            const [bg, fg] = TYPE_PALETTE[e.type] ?? TYPE_PALETTE.Other
            return (
              <MobileCard key={e.code}>
                <MobileCardHeader
                  title={e.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(e.type)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(e.name)}</MobileCardRow>
                <MobileCardRow label={t('Balance')}>
                  <Money sar={e.balance} className="font-semibold text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Last Updated')}>
                  <span dir="ltr">{e.lastUpdated}</span>
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
        icon="PiggyBank"
        title={t('Equity Management')}
        subtitle={t('Owner equity accounts and reserves')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Equity Accounts')}
        subtitle={t('All equity entries with balances')}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Name')}</th>
                <th className="py-2.5 text-start font-medium">{t('Type')}</th>
                <th className="py-2.5 text-end font-medium">{t('Balance')}</th>
                <th className="py-2.5 text-start font-medium">{t('Last Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EQUITY.map((e) => {
                const [bg, fg] = TYPE_PALETTE[e.type] ?? TYPE_PALETTE.Other
                return (
                  <tr key={e.code} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{e.code}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(e.name)}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(e.type)}</Badge>
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={e.balance} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{e.lastUpdated}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}
