import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { AppointmentForm } from './AppointmentForm'
import { ScheduleTimeline, type TimelineLane } from './ScheduleTimeline'
import { minuteOf, durationOf, serviceTint, type Appointment } from './schedule'

type Technician = RowOf<'technicians'> & { _id?: string }
type Job = RowOf<'jobs'> & { _id?: string }

const WORKDAY_MINUTES = 8 * 60

/** The technician schedule — today's bookings on a technician × hour timeline,
 *  with a utilization card per technician underneath.
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
 *  the booking form rather than pretending a different action exists.
 *
 *  Tapping a booking opens the technician's view of the job. Appointments
 *  carry no job id either, so the job is matched on customer and vehicle —
 *  the two fields both records hold — and the tap falls back to the
 *  appointment's own id when nothing matches, which the job screen reports
 *  as not found rather than guessing. */
export function TechnicianSchedule() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const technicians = useCollection('technicians')
  const appointments = useCollection('appointments')
  const jobs = useCollection('jobs')
  const [assigning, setAssigning] = useState(false)

  const techRows = (technicians.data ?? []) as readonly Technician[]
  const apptRows = (appointments.data ?? []) as readonly Appointment[]
  const jobRows = (jobs.data ?? []) as readonly Job[]

  const byTech = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const appt of apptRows) {
      const key = (appt.tech ?? '').trim()
      if (!key) continue
      map.set(key, [...(map.get(key) ?? []), appt])
    }
    return new Map(
      [...map].map(([key, list]) => [key, [...list].sort((a, b) => (minuteOf(a) ?? 0) - (minuteOf(b) ?? 0))])
    )
  }, [apptRows])

  /** Roster ∪ technicians-with-work. The roster carries specialty and rating; a
   *  technician who only appears on appointments is added as a name-only row so
   *  their day is not lost. */
  const roster = useMemo(() => {
    type Row = { name: string; specialty?: string; _id?: string }
    const rows: Row[] = techRows.map((tech) => ({ name: tech.name, specialty: tech.specialty, _id: tech._id }))
    const known = new Set(rows.map((row) => row.name.trim()))
    const extra: Row[] = [...byTech.keys()].filter((name) => !known.has(name)).map((name) => ({ name }))
    return [...rows, ...extra]
  }, [techRows, byTech])

  const lanes = useMemo<TimelineLane[]>(
    () =>
      roster.map((tech) => ({
        id: tech._id ?? tech.name,
        label: tech.name,
        caption: tech.specialty || t('Technician'),
        items: byTech.get(tech.name.trim()) ?? [],
      })),
    [roster, byTech, t]
  )

  function openJob(appt: Appointment) {
    const match = jobRows.find((job) => job.cust === appt.cust && job.veh === appt.veh)
    const id = match?.id ?? (appt as { jobId?: string }).jobId ?? appt._id ?? ''
    navigate(`/technician-portal-job-detail?id=${encodeURIComponent(id)}`)
  }

  const isLoading = technicians.isLoading || appointments.isLoading
  const isError = technicians.isError || appointments.isError

  return (
    <>
      <ScreenFrame
        icon="CalendarClock"
        title="Technician Schedule"
        subtitle={t("Today's assignments and utilization")}
        actions={
          can('appointments', 'c') ? (
            <Button size="md" icon="Plus" onClick={() => setAssigning(true)}>
              {t('Assign Job')}
            </Button>
          ) : undefined
        }
        loading={isLoading}
        error={
          isError
            ? {
                message: technicians.error?.message ?? appointments.error?.message,
                onRetry: () => {
                  void technicians.refetch()
                  void appointments.refetch()
                },
              }
            : null
        }
        empty={
          !isLoading && !isError && roster.length === 0
            ? { icon: 'Users', title: 'No technicians yet', description: 'Add a technician to start assigning work.' }
            : false
        }
        skeleton="cards"
        bodyClassName="max-w-[1200px]"
      >
        <ScheduleTimeline lanes={lanes} onSelect={openJob} label="Technician timeline" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {roster.map((tech) => {
            const booked = byTech.get(tech.name.trim()) ?? []
            const bookedMinutes = booked.reduce((sum, appt) => sum + durationOf(appt), 0)
            const utilization = Math.min(100, Math.round((bookedMinutes / WORKDAY_MINUTES) * 100))
            return (
              <Card key={tech._id ?? tech.name} className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={tech.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-heading">{tech.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{tech.specialty || t('Technician')}</p>
                  </div>
                  <div className="text-end">
                    <span className="font-mono text-base font-black text-salis-blue tabular-nums" dir="ltr">
                      {utilization}%
                    </span>
                    <p className="text-[11px] text-muted">{t('Utilization')}</p>
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

                {booked.length === 0 ? (
                  <p className="py-2 text-center text-[12px] text-muted">{t('No jobs scheduled today')}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {booked.map((appt) => {
                      const tint = serviceTint(appt.svc)
                      return (
                        <button
                          key={appt._id ?? `${appt.cust}-${appt.time}`}
                          type="button"
                          onClick={() => openJob(appt)}
                          className="flex min-h-[44px] w-full cursor-pointer items-center gap-2.5 rounded-lg border-none px-2.5 py-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                          style={{ background: tint.bg, color: tint.fg }}
                        >
                          <span className="flex-shrink-0 font-mono text-[11px] font-semibold" dir="ltr">
                            {appt.time}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold">{appt.cust}</span>
                            <span className="mt-px block truncate text-[11px] opacity-80">
                              {appt.svc} — {appt.veh}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </ScreenFrame>

      <AppointmentForm open={assigning} onClose={() => setAssigning(false)} />
    </>
  )
}
