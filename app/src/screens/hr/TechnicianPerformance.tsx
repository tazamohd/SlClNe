import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Search } from '@/components/ui/Search'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface TechPerformance {
  name: string
  completionRate: number
  qualityScore: number
  customerRating: number
  jobsThisMonth: number
}

const MOCK_PERFORMANCE: readonly TechPerformance[] = [
  { name: 'Yousef Al-Shehri', completionRate: 98, qualityScore: 9.4, customerRating: 4.9, jobsThisMonth: 38 },
  { name: 'Fahad Al-Harbi', completionRate: 95, qualityScore: 9.1, customerRating: 4.8, jobsThisMonth: 35 },
  { name: 'Ahmed Al-Ghamdi', completionRate: 93, qualityScore: 8.8, customerRating: 4.7, jobsThisMonth: 32 },
  { name: 'Nasser Al-Otaibi', completionRate: 91, qualityScore: 8.5, customerRating: 4.6, jobsThisMonth: 29 },
  { name: 'Omar Al-Qahtani', completionRate: 89, qualityScore: 8.3, customerRating: 4.5, jobsThisMonth: 27 },
  { name: 'Tariq Al-Zahrani', completionRate: 87, qualityScore: 8.0, customerRating: 4.4, jobsThisMonth: 25 },
]

const SUMMARY = {
  avgCompletionTime: '2.4 hrs',
  avgQualityScore: '8.7',
  avgCustomerRating: '4.65',
  totalJobsThisMonth: '186',
}

export function TechnicianPerformance() {
  const { t } = usePreferences()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_PERFORMANCE
    const q = search.toLowerCase()
    return MOCK_PERFORMANCE.filter((r) => r.name.toLowerCase().includes(q))
  }, [search])

  const kpis = [
    { label: t('Avg Completion Time'), value: SUMMARY.avgCompletionTime, icon: 'Clock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Quality Score'), value: SUMMARY.avgQualityScore, icon: 'Target', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Avg Customer Rating'), value: SUMMARY.avgCustomerRating, icon: 'Star', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Jobs This Month'), value: SUMMARY.totalJobsThisMonth, icon: 'Briefcase', bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
  ]

  function ratingBadge(rate: number) {
    if (rate >= 92) return { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' }
    if (rate >= 85) return { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' }
    return { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' }
  }

  const columns: Column<TechPerformance>[] = [
    { header: 'Technician', cell: (r) => r.name },
    { header: 'Completion Rate', cell: (r) => <Badge background={ratingBadge(r.completionRate).bg} color={ratingBadge(r.completionRate).fg}>{r.completionRate}%</Badge> },
    { header: 'Quality Score', cell: (r) => `${r.qualityScore}/10`, code: true },
    { header: 'Customer Rating', cell: (r) => `${r.customerRating}/5`, code: true },
    { header: 'Jobs This Month', cell: (r) => r.jobsThisMonth, code: true },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="BarChart3" title={t('Performance')} subtitle={t('Technician Performance')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search technicians...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Technician performance metrics"
        columns={columns}
        rows={[...filtered]}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.name}
              trailing={
                <Badge background={ratingBadge(r.completionRate).bg} color={ratingBadge(r.completionRate).fg}>
                  {r.completionRate}%
                </Badge>
              }
            />
            <MobileCardRow label={t('Quality Score')}>{r.qualityScore}/10</MobileCardRow>
            <MobileCardRow label={t('Customer Rating')}>{r.customerRating}/5</MobileCardRow>
            <MobileCardRow label={t('Jobs This Month')}>{String(r.jobsThisMonth)}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
