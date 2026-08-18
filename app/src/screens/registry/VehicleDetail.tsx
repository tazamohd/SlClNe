import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Vehicle 360 — header, specs, mileage/parts history, service jobs,
 *  documents and insurance for one vehicle.
 *
 *  Looked up by `?plate=` (how Registries links here) or `?id=`, falling back
 *  to the first row — same pattern as JobDetail. Mileage log, parts-replaced
 *  and the documents/insurance panels aren't in the `vehicles` collection, so
 *  they're static design data, same as JobDetail's TIMELINE/PARTS_USED. */
export function VehicleDetail() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const [params] = useSearchParams()
  const { data: vehicles = [], isLoading: vehiclesLoading } = useCollection('vehicles')
  const { data: jobs = [], isLoading: jobsLoading } = useCollection('jobs')

  const lookup = params.get('plate') ?? params.get('id')
  const vehicle = lookup
    ? vehicles.find((row) => row.plate === lookup) ?? vehicles[0]
    : vehicles[0]

  if (vehiclesLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!vehicle) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="Car"
          title={t('Vehicle not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/vehicles" className="font-action text-[13px] font-medium">
              {t('Back to All Vehicles')}
            </Link>
          }
        />
      </Card>
    )
  }

  const hideCosts = fieldHidden('Part cost / margin')
  const serviceJobs = jobs.filter((job) => job.veh === vehicle.make)
  const [statusBg, statusFg] = VEHICLE_STATUS[vehicle.status] ?? VEHICLE_STATUS.active

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to All Vehicles')}
        </Link>
      </div>

      {/* Vehicle header */}
      <Card className="flex flex-wrap items-center gap-5 p-6">
        <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(10,94,215,.08)]">
          <Icon name="Car" size={32} className="text-salis-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-black text-heading">{vehicle.make}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1" dir="ltr">
              <Icon name="Hash" size={13} />
              {vehicle.plate}
            </span>
            <span className="inline-flex items-center gap-1" dir="ltr">
              <Icon name="Palette" size={13} />
              {t(VEHICLE_COLOR)}
            </span>
            <span className="inline-flex items-center gap-1" dir="ltr">
              <Icon name="Key" size={13} />
              VIN: {VEHICLE_VIN}
            </span>
          </div>
        </div>
        <Badge background={statusBg} color={statusFg}>
          {t(vehicle.status === 'service' ? 'In Service' : 'Active')}
        </Badge>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t('Odometer')} value={vehicle.mileage} />
        <Stat label={t('Total Jobs')} value={String(serviceJobs.length)} />
        <Stat
          label={t('Total Spent')}
          value={hideCosts ? '—' : VEHICLE_TOTAL_SPENT}
        />
        <Stat label={t('Last Service')} value={vehicle.last} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mileage log */}
        <Card className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="Gauge" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Mileage Log')}</h3>
          </div>
          <div className="flex flex-col">
            {MILEAGE_LOG.map((entry, index) => (
              <div
                key={entry.date}
                className={
                  'flex items-center gap-2.5 py-2 ' +
                  (index < MILEAGE_LOG.length - 1 ? 'border-b border-border' : '')
                }
              >
                <span className="w-[62px] flex-shrink-0 text-xs text-muted">{entry.date}</span>
                <div className="h-1 flex-1 rounded-full bg-inset">
                  <div
                    className="h-full rounded-full bg-salis-gradient"
                    style={{ width: `${entry.pct}%` }}
                  />
                </div>
                <span
                  className="w-[70px] flex-shrink-0 text-end font-mono text-xs font-semibold text-heading"
                  dir="ltr"
                >
                  {entry.odo}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Parts replaced */}
        <Card className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="Package" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Parts Replaced')}</h3>
          </div>
          <div className="flex flex-col">
            {PARTS_REPLACED.map((part, index) => {
              const [bg, fg] = WARRANTY_BADGE[part.warranty]
              return (
                <div
                  key={part.part}
                  className={
                    'flex items-center gap-2.5 py-2 ' +
                    (index < PARTS_REPLACED.length - 1 ? 'border-b border-border' : '')
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-body">{t(part.part)}</p>
                    <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                      {part.date} · {part.odo}
                    </p>
                  </div>
                  <Badge background={bg} color={fg}>
                    {t(part.warranty === 'expired' ? 'Expired' : 'Warranty')}
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Service history */}
      <Card className="flex flex-col gap-3.5 p-5">
        <div className="flex items-center gap-2">
          <Icon name="History" size={16} className="text-salis-blue" />
          <h3 className="text-sm font-bold text-heading">{t('Service History')}</h3>
        </div>
        {jobsLoading ? (
          <p className="text-sm text-muted">{t('Loading...')}</p>
        ) : serviceJobs.length === 0 ? (
          <EmptyState
            icon="Wrench"
            title={t('No service history yet')}
            description={t('Job cards for this vehicle will show up here.')}
          />
        ) : (
          <div className="flex flex-col">
            {serviceJobs.map((job, index) => (
              <div
                key={job.id}
                className={
                  'flex flex-wrap items-center justify-between gap-2 py-2.5 ' +
                  (index < serviceJobs.length - 1 ? 'border-b border-border' : '')
                }
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-heading" dir="ltr">
                    {job.id}
                  </span>
                  <span className="text-[13px] text-body">{t(job.svc.replace(/_/g, ' '))}</span>
                </span>
                <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents */}
        <Card className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Documents')}</h3>
          </div>
          <div className="flex flex-col">
            {DOCUMENTS.map((doc, index) => {
              const [bg, fg] = DOCUMENT_BADGE[doc.state]
              return (
                <div
                  key={doc.name}
                  className={
                    'flex items-center gap-3 py-2.5 ' +
                    (index < DOCUMENTS.length - 1 ? 'border-b border-border' : '')
                  }
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-inset text-muted">
                    <Icon name={doc.icon} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-body">{t(doc.name)}</p>
                    <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                      {t('Expires')} {doc.expires}
                    </p>
                  </div>
                  <Badge background={bg} color={fg}>
                    {t(DOCUMENT_LABEL[doc.state])}
                  </Badge>
                  <button
                    type="button"
                    aria-label={t('Download')}
                    className="inline-flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted hover:bg-[rgba(10,94,215,.08)]"
                  >
                    <Icon name="Download" size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Insurance */}
        <Card className="flex flex-col gap-4 bg-salis-gradient p-5 text-white shadow-[0_10px_25px_-5px_rgba(10,94,215,.35)]">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={16} />
            <span className="text-[13px] font-bold">{t('Active Policy')}</span>
          </div>
          <div>
            <p className="text-base font-extrabold">{t(INSURANCE.plan)}</p>
            <p className="mt-1 text-xs opacity-80">
              {vehicle.make} · <span dir="ltr">{vehicle.plate}</span>
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-3.5">
            <div>
              <p className="text-[10px] opacity-70">{t('Valid Until')}</p>
              <p className="mt-0.5 text-sm font-bold" dir="ltr">
                {INSURANCE.validUntil}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[10px] opacity-70">{t('Premium')}</p>
              <p className="mt-0.5 text-sm font-bold" dir="ltr">
                {INSURANCE.premium}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] text-muted">{label}</p>
      <h3 className="mt-1 text-xl font-display font-black text-heading" dir="ltr">
        {value}
      </h3>
    </Card>
  )
}

type Vehicle = RowOf<'vehicles'>

const VEHICLE_STATUS: Record<Vehicle['status'], readonly [string, string]> = {
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  service: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

// Design-only demo data ported from VehicleDetail.dc.html / WorkshopCheckIn —
// static regardless of the selected vehicle, same as JobDetail's TIMELINE.
const VEHICLE_COLOR = 'Silver'
const VEHICLE_VIN = '6T1BF...A8210'
const VEHICLE_TOTAL_SPENT = 'SAR 8.4K'

const MILEAGE_LOG = [
  { date: 'Jul 22', odo: '42,195', pct: 100 },
  { date: 'Jun 15', odo: '41,800', pct: 93 },
  { date: 'Apr 8', odo: '40,200', pct: 85 },
  { date: 'Feb 20', odo: '38,700', pct: 78 },
  { date: 'Dec 3', odo: '36,100', pct: 68 },
] as const

const WARRANTY_BADGE: Record<'warranty' | 'expired', readonly [string, string]> = {
  warranty: ['rgba(10,94,215,.1)', '#0A5ED7'],
  expired: ['rgba(100,116,139,.1)', '#64748B'],
}

const PARTS_REPLACED = [
  { part: 'Brake Pads (Front)', date: 'Jul 22', odo: '42,195 km', warranty: 'warranty' },
  { part: 'Oil Filter (Toyota)', date: 'Jul 22', odo: '42,195 km', warranty: 'warranty' },
  { part: 'Air Filter (Universal)', date: 'Apr 8', odo: '40,200 km', warranty: 'expired' },
  { part: 'Spark Plug Set', date: 'Feb 20', odo: '38,700 km', warranty: 'warranty' },
] as const

const DOCUMENT_BADGE: Record<'valid' | 'expiring' | 'expired', readonly [string, string]> = {
  valid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  expiring: ['rgba(249,115,22,.1)', '#F97316'],
  expired: ['rgba(100,116,139,.1)', '#64748B'],
}

const DOCUMENT_LABEL: Record<'valid' | 'expiring' | 'expired', string> = {
  valid: 'Valid',
  expiring: 'Expiring Soon',
  expired: 'Expired',
}

const DOCUMENTS = [
  { name: 'Vehicle Registration (Istimara)', icon: 'FileText', expires: 'Mar 14, 2027', state: 'valid' },
  { name: 'Insurance Certificate', icon: 'ShieldCheck', expires: 'Dec 31, 2026', state: 'valid' },
  { name: 'Periodic Inspection Report', icon: 'ClipboardCheck', expires: 'Sep 2, 2026', state: 'expiring' },
  { name: 'Extended Warranty Card', icon: 'FileCheck', expires: 'Jun 10, 2025', state: 'expired' },
] as const

// Ported from CustomerApp.Insurance.dc.html's demo policy for RUH 4821.
const INSURANCE = {
  plan: 'Comprehensive Coverage',
  validUntil: 'Dec 31, 2026',
  premium: 'SAR 2,400/yr',
}
