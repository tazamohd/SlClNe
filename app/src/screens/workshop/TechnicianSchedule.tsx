import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Technician = RowOf<'technicians'>

/** Colour tones for a scheduled slot, straight from the design: blue for
 *  standard work, sky for diagnostics/electrical, orange for body & paint,
 *  slate for low-priority. No green/red/yellow anywhere (README §7). */
const TONES = {
  blue: ['rgba(10,94,215,.1)', '#0A5ED7'],
  sky: ['rgba(11,179,255,.1)', '#0BB3FF'],
  orange: ['rgba(249,115,22,.1)', '#F97316'],
  slate: ['rgba(100,116,139,.1)', '#64748B'],
} as const

interface Slot {
  /** Wall-clock time as the design shows it — always LTR, even in Arabic. */
  time: string
  customer: string
  /** Service name, translated through t(). */
  service: string
  /** Vehicle model — Latin text, rendered LTR inside Arabic copy. */
  vehicle: string
  tone: keyof typeof TONES
}

/** Today's assignments per technician, keyed by name.
 *
 *  The design bundle carries these slots inline in the prototype rather than
 *  in `gms-data.js`, so they have no collection yet — this is the screen's
 *  grid scaffolding, exactly as the mock shows it. When the API lands, the
 *  join is `assignments.filter(a => a.techId === tech.id)` through the
 *  repository seam and this constant disappears. */
const SCHEDULE: Record<string, { utilization: number; slots: readonly Slot[] }> = {
  'Yousef Al-Otaibi': {
    utilization: 85,
    slots: [
      { time: '8:30', customer: 'Ahmed Al-Rashid', service: 'Maintenance', vehicle: 'Toyota Camry', tone: 'blue' },
      { time: '10:00', customer: 'Mohammed Hassan', service: 'Diagnostics', vehicle: 'Lexus ES 350', tone: 'sky' },
      { time: '2:00', customer: 'Sara Al-Mutairi', service: 'Inspection', vehicle: 'Ford Explorer', tone: 'blue' },
    ],
  },
  'Bandar Al-Qahtani': {
    utilization: 60,
    slots: [
      { time: '9:00', customer: 'Fatima Al-Zahrani', service: 'Body & Paint', vehicle: 'Nissan Patrol', tone: 'orange' },
      { time: '1:30', customer: 'Omar Al-Ghamdi', service: 'Paint Condition', vehicle: 'Hyundai Sonata', tone: 'orange' },
    ],
  },
  'Faisal Al-Harbi': {
    utilization: 45,
    slots: [
      { time: '9:30', customer: 'Layla Al-Sulaiman', service: 'Battery', vehicle: 'GMC Yukon', tone: 'sky' },
      { time: '3:00', customer: 'Noura Al-Harbi', service: 'Headlights', vehicle: 'Honda Accord', tone: 'sky' },
    ],
  },
  'Nasser Al-Dosari': {
    utilization: 30,
    slots: [
      { time: '11:00', customer: 'Fahad Al-Qahtani', service: 'Tire Service', vehicle: 'Kia Sportage', tone: 'slate' },
    ],
  },
}

/** Today's board: one card per technician with their utilization and the jobs
 *  assigned to them, two-up on desktop and stacked on phones per the mobile
 *  design. Technicians come from the repository; the day's slot assignments
 *  are design scaffolding until the assignments endpoint exists. */
export function TechnicianSchedule() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { data: technicians = [], isLoading } = useCollection('technicians')

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg"
              aria-hidden
            />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="CalendarClock" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">
              {t('Technician Schedule')}
            </h1>
            {/* The demo dataset's fixed "today" — every mock date is Jul 2026. */}
            <p className="mt-0.5 text-sm text-muted">
              {t('Tuesday, Jul 22, 2026')}
            </p>
          </div>
        </div>
        <div className="flex-1" />
        {can('technicians', 'e') ? (
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Assign Job')}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('Loading...')}</p>
      ) : technicians.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="CalendarX"
            title={t('No technicians to schedule')}
            description={t('Add technicians in the registry to build the day board.')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {technicians.map((tech) => (
            <TechnicianDay key={tech.name} tech={tech} />
          ))}
        </div>
      )}
    </div>
  )
}

/** One technician's day: identity row, utilization bar, then the slot list. */
function TechnicianDay({ tech }: { tech: Technician }) {
  const { t } = usePreferences()
  const plan = SCHEDULE[tech.name]
  const utilization = plan?.utilization ?? 0
  const slots = plan?.slots ?? []

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
          {tech.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-heading">{tech.name}</p>
          <p className="mt-px text-[11px] text-muted">{t(tech.specialty)}</p>
        </div>
        <div className="text-end">
          <span className="font-mono text-base font-black text-salis-blue" dir="ltr">
            {utilization}%
          </span>
          <p className="text-[10px] text-muted">{t('Utilization')}</p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label={`${tech.name} — ${t('Utilization')}`}
        aria-valuenow={utilization}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 rounded-full bg-inset"
      >
        <div
          className="h-full rounded-full bg-salis-gradient transition-[width] duration-300"
          style={{ width: `${utilization}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {slots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-2.5 py-2 text-center text-xs text-muted">
            {t('No jobs assigned today')}
          </p>
        ) : (
          slots.map((slot) => {
            const [background, color] = TONES[slot.tone]
            return (
              <div
                key={`${slot.time}-${slot.customer}`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                style={{ background, color }}
              >
                <span className="flex-shrink-0 font-mono text-[10px] font-semibold" dir="ltr">
                  {slot.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{slot.customer}</p>
                  <p className="mt-px truncate text-[10px] opacity-80">
                    {t(slot.service)} — <span dir="ltr">{slot.vehicle}</span>
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
