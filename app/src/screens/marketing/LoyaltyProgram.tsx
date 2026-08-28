import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface LoyaltyMember {
  name: string
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  points: number
  visits: number
  lastVisit: string
  status: 'Active' | 'Inactive'
}

const MEMBERS: LoyaltyMember[] = [
  { name: 'Ahmed Al-Rashid', tier: 'Platinum', points: 14200, visits: 38, lastVisit: 'Aug 15, 2026', status: 'Active' },
  { name: 'Khalid Mohammed', tier: 'Gold', points: 8750, visits: 24, lastVisit: 'Aug 12, 2026', status: 'Active' },
  { name: 'Fatima Al-Saud', tier: 'Gold', points: 7300, visits: 19, lastVisit: 'Aug 10, 2026', status: 'Active' },
  { name: 'Omar Hassan', tier: 'Silver', points: 4100, visits: 14, lastVisit: 'Jul 28, 2026', status: 'Active' },
  { name: 'Nora Al-Fahd', tier: 'Silver', points: 3600, visits: 11, lastVisit: 'Aug 01, 2026', status: 'Active' },
  { name: 'Yusuf Ibrahim', tier: 'Bronze', points: 1800, visits: 7, lastVisit: 'Jul 15, 2026', status: 'Active' },
  { name: 'Sara Al-Mutairi', tier: 'Bronze', points: 950, visits: 4, lastVisit: 'Jun 20, 2026', status: 'Inactive' },
  { name: 'Tariq Al-Dosari', tier: 'Bronze', points: 400, visits: 2, lastVisit: 'May 10, 2026', status: 'Inactive' },
]

const TIER_STYLES: Record<string, { bg: string; fg: string }> = {
  Platinum: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Gold: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Silver: { bg: 'rgba(107,114,128,.15)', fg: 'var(--text-muted)' },
  Bronze: { bg: 'rgba(180,130,80,.1)', fg: 'rgb(180,130,80)' },
}

export function LoyaltyProgram() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Members'), value: '1,248', icon: 'Users', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: '1,086', icon: 'UserCheck', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Total Points Issued'), value: '542K', icon: 'Award', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Redemption Rate'), value: '34.2%', icon: 'Gift', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<LoyaltyMember>[] = [
    { header: 'Member', cell: (m) => <span className="font-medium text-heading">{m.name}</span> },
    { header: 'Tier', cell: (m) => <Badge background={TIER_STYLES[m.tier].bg} color={TIER_STYLES[m.tier].fg}>{t(m.tier)}</Badge> },
    { header: 'Points', cell: (m) => <span className="font-mono text-heading">{m.points.toLocaleString()}</span> },
    { header: 'Visits', cell: (m) => <span className="font-mono text-heading">{m.visits}</span> },
    { header: 'Last Visit', cell: (m) => m.lastVisit },
    {
      header: 'Status',
      cell: (m) => (
        <Badge
          background={m.status === 'Active' ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
          color={m.status === 'Active' ? 'var(--salis-blue)' : 'var(--text-muted)'}
        >{t(m.status)}</Badge>
      ),
    },
  ]

  const table = (
    <DataTable
      caption="Loyalty members"
      columns={columns}
      rows={MEMBERS}
      rowKey={(m) => m.name}
      mobileCard={(m) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{m.name}</p>
                  <p className="text-xs text-muted">{t(m.lastVisit)}</p>
                </div>
              </div>
            }
            trailing={<Badge background={TIER_STYLES[m.tier].bg} color={TIER_STYLES[m.tier].fg}>{t(m.tier)}</Badge>}
          />
          <MobileCardRow label={t('Points')} value={m.points.toLocaleString()} />
          <MobileCardRow label={t('Visits')} value={String(m.visits)} />
          <MobileCardRow label={t('Status')} value={t(m.status)} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Award" title={t('Loyalty Program')} subtitle={t('Member rewards')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Award" title={t('Loyalty Program')} subtitle={t('Customer rewards and tiers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
