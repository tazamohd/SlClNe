import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection } from '@/data/useCollection'
import { isLive, type TimesheetRow } from '@/data/repository'
import { ConnectApi, ProvenanceNote, StatCard, StatusPill } from './bits'

/** Timesheets (`Timesheet-Management` and `Timeclock-Payroll`).
 *
 *  Registered under both feature-map names: they list the same `timesheets`
 *  collection — employee, date, clock in/out, worked hours, status — and the
 *  reference screenshots show the same record, so one honest component answers
 *  both rather than two that would drift. Rows are grouped by employee and
 *  filterable by status; worked minutes are the stored integer and `hours` is the
 *  server's decimal presentation, shown as-is (no client arithmetic).
 *
 *  Provenance: feature-map spec + screenshot, no `.dc.html` — design-system
 *  layout. See `./bits`.
 */

const STATUSES: readonly TimesheetRow['status'][] = ['submitted', 'approved', 'rejected']

export function Timesheets() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | TimesheetRow['status']>('all')

  const sheets = useCollection('timesheets', { sort: 'workDate:desc' })
  const rows = (sheets.data ?? []) as readonly TimesheetRow[]

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (filter === 'all' || r.status === filter) &&
        (!needle || r.employeeName.toLowerCase().includes(needle)),
    )
  }, [rows, filter, q])

  const grouped = useMemo(() => {
    const map = new Map<string, TimesheetRow[]>()
    for (const row of shown) {
      const list = map.get(row.employeeName) ?? []
      list.push(row)
      map.set(row.employeeName, list)
    }
    return [...map.entries()]
  }, [shown])

  // Sum of worked minutes → hours, for the stat rail. Minutes are the stored
  // integer, so this is a count of worked time, not a money figure.
  const totalMinutes = shown.reduce((sum, r) => sum + r.minutes, 0)
  const pending = rows.filter((r) => r.status === 'submitted').length

  return (
    <div className="flex max-w-[1040px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Clock" size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t('Timesheets')}</h1>
          <p className="mt-1 text-sm text-muted">{t('Clock records and worked hours')}</p>
        </div>
      </div>
      <ProvenanceNote />

      {!isLive ? (
        <ConnectApi
          icon="Clock"
          title="No timesheets to show"
          description="Timesheets and clock records live on the server, gated on HR. The fixture build has none — connect a live API to see worked hours."
          collection="timesheets"
        />
      ) : sheets.isLoading ? (
        <Loading label="Loading timesheets..." />
      ) : sheets.isError ? (
        <ErrorState description={sheets.error?.message} onRetry={() => void sheets.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard icon="FileText" value={String(shown.length)} label="Records shown" />
            <StatCard icon="Clock" value={`${(totalMinutes / 60).toFixed(1)}`} label="Hours shown" />
            <StatCard icon="Hourglass" value={String(pending)} label="Awaiting review" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <ChipGroup label={t('Filter by status')}>
              {(['all', ...STATUSES] as const).map((key) => (
                <Chip key={key} label={key === 'all' ? t('All') : t(key)} selected={filter === key} onToggle={() => setFilter(key)} />
              ))}
            </ChipGroup>
            <Input
              icon="Search"
              inputSize="sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('Search employee')}
              className="w-full sm:w-56"
              aria-label={t('Search timesheets')}
            />
          </div>

          {grouped.length === 0 ? (
            <Card className="p-4">
              <EmptyState
                icon="Clock"
                title={t('No timesheets here')}
                description={q.trim() || filter !== 'all' ? t('No records match the current search and filter.') : t('No timesheets have been recorded yet.')}
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {grouped.map(([employee, records]) => (
                <Card key={employee} className="overflow-hidden p-0">
                  <div className="flex items-center gap-2 border-0 border-b border-solid border-border px-4 py-2.5">
                    <Icon name="User" size={14} className="text-salis-blue" />
                    <span className="text-[13px] font-bold text-heading">{employee}</span>
                    <span className="text-[11px] text-muted">
                      {records.length} {t(records.length === 1 ? 'record' : 'records')}
                    </span>
                  </div>
                  {isMobile ? (
                    <div className="divide-y divide-border">
                      {records.map((r, index) => (
                        <div key={r._id ?? `${r.workDate}-${index}`} className="px-4 py-2.5">
                          <MobileCardHeader
                            leading={
                              <span className="font-mono text-[12px] font-semibold text-heading" dir="ltr">
                                {r.workDate}
                              </span>
                            }
                            trailing={<StatusPill value={r.status} />}
                          />
                          <MobileCardRow
                            label={t('Clock in')}
                            value={<span className="font-mono" dir="ltr">{r.clockIn ?? '—'}</span>}
                          />
                          <MobileCardRow
                            label={t('Clock out')}
                            value={<span className="font-mono" dir="ltr">{r.clockOut ?? '—'}</span>}
                          />
                          <MobileCardRow
                            label={t('Hours')}
                            value={
                              <span className="font-mono font-semibold" dir="ltr">
                                {r.hours.toFixed(2)}
                              </span>
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {['Date', 'Clock in', 'Clock out', 'Hours', 'Status'].map((h) => (
                              <th
                                key={h}
                                className={
                                  'whitespace-nowrap border-0 border-b border-solid border-border px-4 py-2 font-action text-[11px] font-semibold uppercase text-muted ' +
                                  (h === 'Hours' || h === 'Status' ? 'text-end' : 'text-start')
                                }
                              >
                                {t(h)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((r, index) => (
                            <tr
                              key={r._id ?? `${r.workDate}-${index}`}
                              className={index ? 'border-0 border-t border-solid border-border' : ''}
                            >
                              <td className="whitespace-nowrap px-4 py-2 font-mono text-[12px] text-body" dir="ltr">
                                {r.workDate}
                              </td>
                              <td className="px-4 py-2 font-mono text-[12px] text-body" dir="ltr">
                                {r.clockIn ?? '—'}
                              </td>
                              <td className="px-4 py-2 font-mono text-[12px] text-body" dir="ltr">
                                {r.clockOut ?? '—'}
                              </td>
                              <td className="px-4 py-2 text-end font-mono text-[13px] font-semibold text-heading" dir="ltr">
                                {r.hours.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-end">
                                <StatusPill value={r.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
