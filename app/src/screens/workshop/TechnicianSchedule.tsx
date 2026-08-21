import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { AppointmentForm } from './AppointmentForm'
import { minuteOf, durationOf, serviceTint, type Appointment } from './schedule'

type Technician = RowOf<'technicians'> & { _id?: string }

const WORKDAY_MINUTES = 8 * 60

/** The technician schedule — today's bookings grouped under each technician,
 *  with a utilization bar.
 *
 *  Utilization is booked minutes over an eight-hour day: a time occupancy
 *  figure, not a money calculation, so it is computed here from the real
 *  durations. The roster is the *union* of the `technicians` collection and the
 *  technicians named on appointments — because the seed does not reconcile the
 *  two (appointments carry `technicianName` strings with no `technicianId`, and
 *  those names are not the roster's names), grouping on the roster alone would
 *  show every technician idle while the day's work floated free. The union keeps
 *  the schedule honest until the seed links appointments to technician ids (a
 *  gap noted in `workshop-approval-gaps.test.ts`). "Assign Job" books an
 *  appointment — there is no separate schedule-assignment endpoint, so it reuses
 *  the booking form rather than pretending a different action exists. */
export function TechnicianSchedule() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const technicians = useCollection('technicians')
  const appointments = useCollection('appointments')
  const [assigning, setAssigning] = useState(false)

  const techRows = (technicians.data ?? []) as readonly Technician[]
  const apptRows = (appointments.data ?? []) as readonly Appointment[]

  const byTech = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const appt of apptRows) {
      const key = (appt.tech ?? '').trim()
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(appt)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (minuteOf(a) ?? 0) - (minuteOf(b) ?? 0))
    }
    return map
  }, [apptRows])

  /** Roster ∪ technicians-with-work. The roster carries specialty and rating; a
   *  technician who only appears on appointments is added as a name-only row so
   *  their day is not lost. */
  const roster = useMemo(() => {
    type Row = { name: string; specialty?: string; _id?: string }
    const rows: Row[] = techRows.map((tech) => ({ name: tech.name, specialty: tech.specialty, _id: tech._id }))
    const known = new Set(rows.map((row) => row.name.trim()))
    for (const name of byTech.keys()) {
      if (!known.has(name)) {
        rows.push({ name })
        known.add(name)
      }
    }
    return rows
  }, [techRows, byTech])

  const isLoading = technicians.isLoading || appointments.isLoading
  const isError = technicians.isError || appointments.isError

  return (
    <div className="flex max-w-[1200px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex ${isMobile ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} items-center justify-center bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]`}>
            <Icon name="CalendarClock" size={isMobile ? 18 : 24} />
          </span>
          <div>
            <h1 className={isMobile ? 'font-display text-xl font-black text-heading' : 'font-display text-2xl font-black text-heading'}>
              {t('Technician Schedule')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{t("Today's assignments and utilization")}</p>
          </div>
        </div>
        <span className="flex-1" />
        {can('appointments', 'c') ? (
          <Button size="md" onClick={() => setAssigning(true)}>
            <Icon name="Plus" size={16} />
            {t('Assign Job')}
          </Button>
        ) : null}
      </div>

      {isError ? (
        <ErrorState
          title={t("Couldn't load this")}
          description={technicians.error?.message ?? appointments.error?.message}
          onRetry={() => {
            void technicians.refetch()
            void appointments.refetch()
          }}
        />
      ) : isLoading ? (
        <Card className="p-6">
          <Loading label="Loading schedule..." />
        </Card>
      ) : roster.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="Users"
            title={t('No technicians yet')}
            description={t('Add a technician to start assigning work.')}
          />
        </Card>
      ) : (
        <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-1 gap-5 md:grid-cols-2'}>
          {roster.map((tech) => {
            const jobs = byTech.get(tech.name.trim()) ?? []
            const bookedMinutes = jobs.reduce((sum, appt) => sum + durationOf(appt), 0)
            const utilization = Math.min(100, Math.round((bookedMinutes / WORKDAY_MINUTES) * 100))
            return (
              <Card key={tech._id ?? tech.name} className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
                    {tech.name.trim()[0] ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-heading">{tech.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{tech.specialty || t('Technician')}</p>
                  </div>
                  <div className="text-end">
                    <span className="font-mono text-base font-black text-salis-blue">
                      {utilization}%
                    </span>
                    <p className="text-[10px] text-muted">{t('Utilization')}</p>
                  </div>
                </div>

                <div
                  className="h-1.5 overflow-hidden rounded-full bg-inset"
                  role="progressbar"
                  aria-valuenow={utilization}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('Utilization')}
                >
                  <div className="h-full rounded-full bg-salis-gradient" style={{ width: `${utilization}%` }} />
                </div>

                {jobs.length === 0 ? (
                  <p className="py-2 text-center text-[12px] text-muted">
                    {t('No jobs scheduled today')}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {jobs.map((appt) => {
                      const tint = serviceTint(appt.svc)
                      return (
                        <div
                          key={appt._id ?? `${appt.cust}-${appt.time}`}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                          style={{ background: tint.bg, color: tint.fg }}
                        >
                          <span className="flex-shrink-0 font-mono text-[10px] font-semibold" dir="ltr">
                            {appt.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-semibold">{appt.cust}</p>
                            <p className="mt-px truncate text-[10px] opacity-80">
                              {appt.svc} — {appt.veh}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <AppointmentForm open={assigning} onClose={() => setAssigning(false)} />
    </div>
  )
}
