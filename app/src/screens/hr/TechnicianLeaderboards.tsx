import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface LeaderboardEntry {
  rank: number
  name: string
  jobsCompleted: number
  avgRating: number
  efficiency: number
  revenue: number
}

const MOCK_LEADERBOARD: readonly LeaderboardEntry[] = [
  { rank: 1, name: 'Yousef Al-Shehri', jobsCompleted: 142, avgRating: 4.9, efficiency: 97, revenue: 84500 },
  { rank: 2, name: 'Fahad Al-Harbi', jobsCompleted: 136, avgRating: 4.8, efficiency: 95, revenue: 79200 },
  { rank: 3, name: 'Ahmed Al-Ghamdi', jobsCompleted: 128, avgRating: 4.7, efficiency: 93, revenue: 74800 },
  { rank: 4, name: 'Nasser Al-Otaibi', jobsCompleted: 119, avgRating: 4.6, efficiency: 91, revenue: 68300 },
  { rank: 5, name: 'Omar Al-Qahtani', jobsCompleted: 115, avgRating: 4.5, efficiency: 89, revenue: 64700 },
  { rank: 6, name: 'Tariq Al-Zahrani', jobsCompleted: 108, avgRating: 4.4, efficiency: 87, revenue: 59200 },
  { rank: 7, name: 'Khalid Al-Dosari', jobsCompleted: 102, avgRating: 4.3, efficiency: 85, revenue: 55400 },
  { rank: 8, name: 'Saad Al-Mutairi', jobsCompleted: 95, avgRating: 4.2, efficiency: 82, revenue: 49800 },
  { rank: 9, name: 'Faisal Al-Rashidi', jobsCompleted: 89, avgRating: 4.3, efficiency: 80, revenue: 45100 },
  { rank: 10, name: 'Majed Al-Tamimi', jobsCompleted: 84, avgRating: 4.1, efficiency: 78, revenue: 41600 },
]

const RANK_BADGES: Record<number, { bg: string; fg: string; label: string }> = {
  1: { bg: 'rgba(249,115,22,.15)', fg: 'var(--salis-orange)', label: 'Gold' },
  2: { bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)', label: 'Silver' },
  3: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', label: 'Bronze' },
}

function RankBadge({ rank }: { rank: number }) {
  const { t } = usePreferences()
  const badge = RANK_BADGES[rank]
  if (badge) {
    return (
      <Badge background={badge.bg} color={badge.fg} strong>
        {t(badge.label)}
      </Badge>
    )
  }
  return <span className="font-mono text-xs text-muted">#{rank}</span>
}

export function TechnicianLeaderboards() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_LEADERBOARD
    const q = search.toLowerCase()
    return MOCK_LEADERBOARD.filter((r) => r.name.toLowerCase().includes(q))
  }, [search])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Trophy" title={t('Leaderboards')} subtitle={t('Technician Rankings')} />
        <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        {filtered.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] font-mono text-xs font-bold text-salis-blue">
                    {r.rank}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.name}</p>
                  </div>
                </div>
              }
              trailing={<RankBadge rank={r.rank} />}
            />
            <MobileCardRow label={t('Jobs Completed')} value={String(r.jobsCompleted)} />
            <MobileCardRow label={t('Avg Rating')} value={r.avgRating.toFixed(1)} />
            <MobileCardRow label={t('Efficiency')} value={`${r.efficiency}%`} />
            <MobileCardRow label={t('Revenue')} value={<Money sar={r.revenue} />} />
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No technicians found')}</p>}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Trophy" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Leaderboards')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Technician Rankings')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Rank')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Technician')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Jobs Completed')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Avg Rating')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Efficiency')}</th>
                <th className="pb-3 text-start font-medium">{t('Revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <RankBadge rank={r.rank} />
                  </td>
                  <td className="py-3 pe-4 font-medium text-heading">{r.name}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.jobsCompleted}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.avgRating.toFixed(1)}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.efficiency}%</td>
                  <td className="py-3 font-mono text-heading">
                    <Money sar={r.revenue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
