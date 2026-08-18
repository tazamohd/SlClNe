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
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Inactive: ['rgba(100,116,139,.1)', '#64748B'],
}

export function PartnersCurrentAccount() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Users"
          title={t('Partners Account')}
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
          {MOCK_PARTNERS.map((p) => {
            const [bg, fg] = STATUS_PALETTE[p.status] ?? STATUS_PALETTE.Active
            return (
              <MobileCard key={p.name}>
                <MobileCardHeader
                  title={p.name}
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(p.status)}
                    </Badge>
                  }
                />
                <MobileCardRow label={t('Share')}>{p.share}%</MobileCardRow>
                <MobileCardRow label={t('Capital')}>
                  <Money sar={p.capitalContribution} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Drawings')}>
                  <Money sar={p.drawings} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Balance')}>
                  <Money sar={p.currentBalance} className="font-semibold text-heading" />
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
        icon="Users"
        title={t('Partners Current Account')}
        subtitle={t('Partner capital contributions, drawings and balances')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Partner Accounts')}
        subtitle={t('All partners with capital and balance details')}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Partner Name')}</th>
                <th className="py-2.5 text-end font-medium">{t('Capital')}</th>
                <th className="py-2.5 text-end font-medium">{t('Drawings')}</th>
                <th className="py-2.5 text-end font-medium">{t('Share %')}</th>
                <th className="py-2.5 text-end font-medium">{t('Balance')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PARTNERS.map((p) => {
                const [bg, fg] = STATUS_PALETTE[p.status] ?? STATUS_PALETTE.Active
                return (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="py-2.5 text-[13px] font-medium text-heading">{p.name}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={p.capitalContribution} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={p.drawings} />
                    </td>
                    <td className="py-2.5 text-end text-[13px] text-heading">{p.share}%</td>
                    <td className="py-2.5 text-end">
                      <Money sar={p.currentBalance} className="font-semibold" />
                    </td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(p.status)}</Badge>
                    </td>
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
