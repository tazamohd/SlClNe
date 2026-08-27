import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, type RowOf } from '@/data/useCollection'
import { workshopReports, type WorkshopReport, type RepositoryError } from '@/data/repository'

type Job = RowOf<'jobs'>
type Technician = RowOf<'technicians'> & { _id?: string }

const BAR_COLORS = ['var(--salis-blue)', 'var(--salis-blue-bright)', 'var(--salis-orange)', 'var(--salis-navy)', 'var(--text-muted)']

/** Workshop reports — the operational figures the workshop can prove from its
 *  own records.
 *
 *  Job-card counts and the service mix are counted from the real `jobs`
 *  collection; the technician table is the real `technicians` collection. These
 *  are tallies, not money, so the client may compute them.
 *
 *  What the design also shows — a time-series trend, a period-over-period
 *  delta, QC pass rate and average bay time — needs an aggregation/time-series
 *  endpoint that does not exist (`GET /reports/workshop`). Rather than draw a
 *  fabricated trend line, that panel states the gap. Recorded in
 *  `workshop-approval-gaps.test.ts`. */
export function WorkshopReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const jobs = useCollection('jobs')
  const technicians = useCollection('technicians')

  /* The server-computed analytics (F-029): QC pass rate from the audit trail,
   * bay time and technician hours, each summed in SQL over the whole tenant
   * scope. Live only — the accessor is null on the fixtures, the query never
   * runs, and the panel keeps its honest "not connected" state below. */
  const report = useQuery<WorkshopReport, RepositoryError>({
    queryKey: ['reports', 'workshop'],
    queryFn: () => workshopReports!.workshop(),
    enabled: Boolean(workshopReports),
    retry: false,
  })
  const analytics = report.data

  const jobRows = (jobs.data ?? []) as readonly Job[]
  const techRows = (technicians.data ?? []) as readonly Technician[]

  const kpis = useMemo(() => {
    const active = jobRows.filter((j) => j.st !== 'completed' && j.st !== 'delivered').length
    const ratings = techRows
      .map((tech) => Number(tech.rating))
      .filter((value) => Number.isFinite(value))
    const avgRating = ratings.length
      ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)
      : '—'
    return [
      { label: t('Job Cards'), value: String(jobRows.length), icon: 'ClipboardList' },
      { label: t('Active'), value: String(active), icon: 'Wrench' },
      { label: t('Technicians'), value: String(techRows.length), icon: 'Users' },
      { label: t('Avg Rating'), value: avgRating, icon: 'Star' },
    ]
  }, [jobRows, techRows, t])

  const breakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobRows) {
      const key = job.svc || 'other'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1])
    const max = entries[0]?.[1] ?? 1
    return entries.map(([label, count], index) => ({
      label: t(label.replace(/_/g, ' ')),
      count,
      pct: Math.round((count / max) * 100),
      color: BAR_COLORS[index % BAR_COLORS.length],
    }))
  }, [jobRows, t])

  const isLoading = jobs.isLoading || technicians.isLoading
  const isError = jobs.isError || technicians.isError

  if (isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={jobs.error?.message ?? technicians.error?.message}
        onRetry={() => {
          void jobs.refetch()
          void technicians.refetch()
        }}
      />
    )
  }

  const techColumns: Column<Technician>[] = [
    { header: 'Technician', cell: (tech) => tech.name },
    { header: 'Specialty', cell: (tech) => tech.specialty || '—' },
    { header: 'Active Jobs', cell: (tech) => <span className="font-mono">{tech.jobs}</span> },
    { header: 'Rating', cell: (tech) => <span className="font-mono font-semibold">{tech.rating || '—'}</span> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        {!isMobile && (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="Wrench" size={24} />
          </span>
        )}
        <div>
          <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('Workshop Reports')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('Reports & Analytics')}</p>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <Loading label="Loading reports..." />
        </Card>
      ) : (
        <>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="rounded-2xl p-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
                    <Icon name={kpi.icon} size={18} />
                  </span>
                  <span className="text-[13px] font-medium text-muted">{kpi.label}</span>
                </div>
                <p className="font-display text-2xl font-black text-heading" dir="ltr">
                  {kpi.value}
                </p>
              </Card>
            ))}
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            <Card className="rounded-2xl p-6">
              <h3 className="mb-5 text-[17px] font-bold text-heading">{t('Jobs by service')}</h3>
              {breakdown.length === 0 ? (
                <p className="text-[13px] text-muted">{t('No job cards to summarize yet.')}</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {breakdown.map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex justify-between text-[13px]">
                        <span className="text-body">{row.label}</span>
                        <span className="font-mono font-semibold text-muted">
                          {row.count} {t('jobs')}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, background: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl p-6">
              <h3 className="mb-2 text-[17px] font-bold text-heading">{t('Trend & analytics')}</h3>
              {workshopReports ? (
                report.isLoading ? (
                  <Loading inline label="Loading analytics..." />
                ) : report.isError ? (
                  <p className="text-[13px] leading-relaxed text-muted">{report.error?.message}</p>
                ) : (
                  <>
                    <p className="mb-4 text-[13px] leading-relaxed text-muted">
                      {t('Server-computed over the whole tenant scope — not a page this screen added up.')}
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {(
                        [
                          [
                            t('QC pass rate'),
                            analytics?.qc.passRatePct == null
                              ? t('Not yet measured')
                              : `${analytics.qc.passRatePct.toFixed(1)}%`,
                            'ShieldCheck',
                          ],
                          [
                            t('Average bay time'),
                            `${Math.round(analytics?.bay.averageBayMinutes ?? 0)} ${t('min')}`,
                            'Timer',
                          ],
                          [
                            t('Technician hours'),
                            `${(analytics?.technicians ?? [])
                              .reduce((sum, tech) => sum + tech.hours, 0)
                              .toFixed(1)} ${t('hr')}`,
                            'Clock',
                          ],
                        ] as const
                      ).map(([label, value, icon]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2 rounded-lg bg-inset p-3"
                        >
                          <span className="inline-flex items-center gap-2 text-[13px] text-body">
                            <Icon name={icon} size={15} className="flex-shrink-0 text-salis-blue" />
                            {label}
                          </span>
                          <span className="font-mono text-[15px] font-bold text-heading" dir="ltr">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              ) : (
                <>
                  <p className="text-[13px] leading-relaxed text-muted">
                    {t(
                      'A time-series trend, period-over-period comparison, QC pass rate and average bay time need a workshop analytics endpoint that is not connected yet. Showing a chart here would be inventing the numbers.'
                    )}
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-inset p-3 text-[12px] text-muted">
                    <Icon name="LineChart" size={15} className="flex-shrink-0 text-salis-blue" />
                    {t('Awaiting GET /reports/workshop')}
                  </div>
                </>
              )}
            </Card>
          </div>

          <DataTable
            caption="Technician performance"
            columns={techColumns}
            rows={techRows as Technician[]}
            rowKey={(tech) => tech._id ?? tech.name}
            mobileCard={(tech) => (
              <>
                <MobileCardHeader
                  title={tech.name}
                  trailing={<span className="font-mono text-[13px] font-bold text-heading">{tech.rating || '—'}</span>}
                />
                <MobileCardRow label={t('Specialty')} value={tech.specialty || '—'} />
                <MobileCardRow label={t('Active Jobs')} value={<span className="font-mono">{tech.jobs}</span>} />
              </>
            )}
          />
        </>
      )}
    </div>
  )
}
