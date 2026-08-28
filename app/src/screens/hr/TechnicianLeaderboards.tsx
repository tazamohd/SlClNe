import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_LEADERBOARD
    const q = search.toLowerCase()
    return MOCK_LEADERBOARD.filter((r) => r.name.toLowerCase().includes(q))
  }, [search])

  const columns: Column<LeaderboardEntry>[] = [
    { header: 'Rank', cell: (r) => <RankBadge rank={r.rank} /> },
    { header: 'Technician', cell: (r) => r.name },
    { header: 'Jobs Completed', cell: (r) => r.jobsCompleted, code: true },
    { header: 'Avg Rating', cell: (r) => r.avgRating.toFixed(1), code: true },
    { header: 'Efficiency', cell: (r) => `${r.efficiency}%`, code: true },
    { header: 'Revenue', cell: (r) => <Money sar={r.revenue} />, code: true },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Trophy" title={t('Leaderboards')} subtitle={t('Technician Rankings')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search technicians...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <DataTable
        caption="Technician leaderboard"
        columns={columns}
        rows={[...filtered]}
        rowKey={(r) => String(r.rank)}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.name}
              trailing={<RankBadge rank={r.rank} />}
            />
            <MobileCardRow label={t('Jobs Completed')}>{String(r.jobsCompleted)}</MobileCardRow>
            <MobileCardRow label={t('Avg Rating')}>{r.avgRating.toFixed(1)}</MobileCardRow>
            <MobileCardRow label={t('Efficiency')}>{r.efficiency}%</MobileCardRow>
            <MobileCardRow label={t('Revenue')}><Money sar={r.revenue} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
