import { useMemo } from 'react'
import { FeatureHeader, StatRow, Section } from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { formatSar, parseSar } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'

const STATUS_TONE: Record<string, readonly [string, string]> = {
  checked_in: ['rgba(11,179,255,.12)', '#0BB3FF'],
  inspection: ['rgba(10,94,215,.1)', '#0A5ED7'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  completed: ['rgba(11,31,59,.1)', '#0B1F3B'],
  delivered: ['rgba(100,116,139,.1)', '#64748B'],
  pending_approval: ['rgba(249,115,22,.1)', '#F97316'],
}

const BAR_COLORS = [
  'var(--salis-blue)',
  'var(--salis-blue-bright)',
  'var(--salis-orange)',
  'var(--salis-navy)',
  'var(--text-muted)',
]

/** Alternate dashboard view — KPI grid, revenue sparkline, jobs breakdown,
 *  and technician performance ranking. */
export function DashboardMain() {
  const { t } = usePreferences()
  const { data: jobs = [], isLoading: jL, isError: jE, error: jErr, refetch: jR } = useCollection('jobs')
  const { data: technicians = [], isLoading: tL } = useCollection('technicians')

  type AnyJob = Record<string, string>
  const totalRevenue = useMemo(
    () => jobs.reduce((sum, j) => sum + parseSar((j as AnyJob).total ?? '0'), 0),
    [jobs]
  )
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.st !== 'completed' && j.st !== 'delivered').length,
    [jobs]
  )
  const partsValue = useMemo(
    () => jobs.reduce((sum, j) => sum + parseSar((j as AnyJob).parts ?? '0'), 0),
    [jobs]
  )
  const outstanding = useMemo(
    () =>
      jobs
        .filter((j) => j.st === 'completed')
        .reduce((sum, j) => sum + parseSar((j as AnyJob).total ?? '0'), 0),
    [jobs]
  )

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) {
      const key = job.st || 'unknown'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1])
    const max = entries[0]?.[1] ?? 1
    return entries.map(([label, count], index) => ({
      label: t(label.replace(/_/g, ' ')),
      count,
      pct: Math.round((count / max) * 100),
      color: BAR_COLORS[index % BAR_COLORS.length],
      tone: STATUS_TONE[label],
    }))
  }, [jobs, t])

  const topTechnicians = useMemo(
    () =>
      [...technicians]
        .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
        .slice(0, 5)
        .map((tech, i) => ({ ...tech, rank: i + 1 })),
    [technicians]
  )

  const techColumns: Column<(typeof topTechnicians)[number]>[] = [
    { header: '#', cell: (tech) => <span className="font-mono text-muted">{tech.rank}</span>, code: true },
    { header: 'Technician', cell: (tech) => <span className="font-medium text-heading">{tech.name}</span> },
    { header: 'Specialty', cell: (tech) => tech.specialty || '—' },
    { header: 'Active Jobs', cell: (tech) => <span className="font-mono" dir="ltr">{tech.jobs}</span> },
    { header: 'Rating', cell: (tech) => <span className="font-mono font-semibold text-heading" dir="ltr">{tech.rating || '—'}</span> },
  ]

  /* Revenue sparkline data — bin jobs into 7 rough buckets for a minimal
   * inline SVG trend line. */
  const sparkline = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => 0)
    const step = Math.max(1, Math.ceil(jobs.length / 7))
    for (let i = 0; i < jobs.length; i++) {
      const bucket = Math.min(Math.floor(i / step), 6)
      buckets[bucket] += parseSar((jobs[i] as AnyJob).total ?? '0')
    }
    const max = Math.max(...buckets, 1)
    return buckets.map((v) => Math.round((v / max) * 40))
  }, [jobs])

  const sparklinePath = useMemo(() => {
    if (sparkline.every((v) => v === 0)) return ''
    return sparkline.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 20},${40 - y}`).join(' ')
  }, [sparkline])

  if (jL || tL) return <Loading label={t('Loading dashboard...')} />
  if (jE) return <ErrorState description={jErr?.message} onRetry={() => void jR()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="BarChart3"
        title={t('Dashboard')}
        subtitle={t('Overview & Analytics')}
      />

      <StatRow
        stats={[
          { label: 'Total Revenue', value: formatSar(totalRevenue), caption: 'All time', highlight: true, icon: 'DollarSign' },
          { label: 'Active Jobs', value: activeJobs, caption: 'In progress', tone: 'info', icon: 'Wrench' },
          { label: 'Parts Value', value: formatSar(partsValue), caption: 'Allocated', icon: 'Package' },
          { label: 'Outstanding Invoices', value: formatSar(outstanding), caption: 'Pending collection', tone: 'warning', icon: 'FileText' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={t('Revenue Trend')} subtitle={t('Approximate distribution across jobs')}>
          {sparklinePath ? (
            <div className="flex items-end justify-center py-4">
              <svg
                viewBox="0 0 120 44"
                className="h-16 w-full max-w-[280px]"
                role="img"
                aria-label={t('Revenue sparkline')}
              >
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="var(--salis-blue)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <p className="py-4 text-center text-[13px] text-muted">{t('No data to chart yet')}</p>
          )}
        </Section>

        <Section title={t('Jobs by Status')} subtitle={t('Current breakdown')}>
          {statusBreakdown.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-muted">{t('No job cards yet')}</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {statusBreakdown.map((row) => {
                const [bg, fg] = row.tone ?? ['rgba(100,116,139,.1)', '#64748B']
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-body">
                        <Badge background={bg} color={fg}>
                          {row.label}
                        </Badge>
                      </span>
                      <span className="font-mono font-semibold text-muted" dir="ltr">
                        {row.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.pct}%`, background: row.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-heading">{t('Top Technicians')}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{t('By rating')}</p>
        </div>
        <DataTable
          caption="Top technicians"
          columns={techColumns}
          rows={topTechnicians}
          rowKey={(tech) => tech.name}
          empty={t('No technicians registered')}
          mobileCard={(tech) => (
            <>
              <MobileCardHeader
                title={`#${tech.rank} ${tech.name}`}
                trailing={
                  <span className="font-mono text-[13px] font-bold text-heading" dir="ltr">
                    {tech.rating || '—'}
                  </span>
                }
              />
              <MobileCardRow label={t('Specialty')}>{tech.specialty || '—'}</MobileCardRow>
              <MobileCardRow label={t('Active Jobs')}>
                <span className="font-mono" dir="ltr">{tech.jobs}</span>
              </MobileCardRow>
            </>
          )}
        />
      </div>
    </div>
  )
}
