import type { ReactNode } from 'react'
import { CheckCircle, Clock, FileSignature } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, parseSar } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** Fleet contract detail: header + status, contract terms, fleet stats,
 *  covered vehicles and billing (service) history for one fleet account.
 *
 *  The fleet row (name, vehicle/job counts, contract status) comes from the
 *  `fleets` collection, matched by the `name` query param `FleetManagement`
 *  navigates with. The contract terms, covered vehicles and billing rows are
 *  the design's own fixed demo data — not modeled in the fleets table — so
 *  they're local consts, same as `JobDetail`'s assigned technician and parts. */

type CoveredVehicle = {
  make: string
  plate: string
  status: 'active' | 'service'
}

type BillingRow = {
  date: string
  vehicle: string
  service: string
  costSar: number
}

export function FleetContract() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const [params] = useSearchParams()
  const { data: fleets = [], isLoading } = useCollection('fleets')

  const fleetName = params.get('name')
  const fleet = fleetName ? fleets.find((row) => row.name === fleetName) : fleets[0]

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!fleet) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="FileQuestion"
          title={t('Fleet account not found')}
          description={t('It may have been deleted, or the link is out of date.')}
          action={
            <Link to="/fleet-management" className="font-action text-[13px] font-medium">
              {t('Fleet Management')}
            </Link>
          }
        />
      </Card>
    )
  }

  const isRenewal = fleet.contract === 'renewal'

  const billingColumns: Column<BillingRow>[] = [
    { header: 'Date', cell: (row) => row.date },
    { header: 'Vehicle', cell: (row) => row.vehicle },
    { header: 'Service', cell: (row) => t(row.service) },
    { header: 'Cost', cell: (row) => <Money sar={row.costSar} className="font-semibold" /> },
  ]

  const statusBadge = (status: 'active' | 'service') =>
    status === 'active' ? (
      <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
        {t('Active')}
      </Badge>
    ) : (
      <Badge background="rgba(11,179,255,.1)" color="#0BB3FF">
        {t('In Service')}
      </Badge>
    )

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <Link
          to="/fleet-management"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Fleet Management')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <FileSignature size={28} strokeWidth={2} aria-hidden />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">
              {t('Fleet Contract')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{fleet.name}</p>
          </div>
        </div>
        <div className="flex-1" />
        {isRenewal ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(249,115,22,.1)] px-3.5 py-1.5 font-action text-xs font-semibold text-salis-orange">
            <Clock size={14} strokeWidth={2} aria-hidden />
            {t('Renewal Due')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(10,94,215,.1)] px-3.5 py-1.5 font-action text-xs font-semibold text-salis-blue">
            <CheckCircle size={14} strokeWidth={2} aria-hidden />
            {t('Active')}
          </span>
        )}
        {can('vehicles', 'e') ? (
          <Button size="md">
            <Icon name="RefreshCw" size={14} />
            {t('Renew Contract')}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Contract Details')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label={t('Contract Type')} value={t(CONTRACT.type)} />
            <Field
              label={t('Contract Value')}
              value={
                <span className="font-mono text-sm font-bold text-heading" dir="ltr">
                  <Money sar={CONTRACT.valueSar} />/yr
                </span>
              }
            />
            <Field label={t('Start Date')} value={CONTRACT.start} />
            <Field label={t('End Date')} value={CONTRACT.end} />
            <Field label={t('Fleet Contact')} value={CONTRACT.contact} />
            <Field label={t('Phone')} value={<span dir="ltr">{CONTRACT.phone}</span>} />
          </div>
          <div className="flex flex-col gap-1.5 rounded-[10px] bg-inset p-3.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted">{t('Contract Progress')}</span>
              <span className="font-mono font-bold text-salis-blue">{CONTRACT.progressPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-border">
              <div
                className="h-full rounded-full bg-salis-gradient"
                style={{ width: `${CONTRACT.progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted">
              {CONTRACT.daysRemaining} {t('days remaining')}
            </span>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            {FLEET_STATS.map((stat) => (
              <Card key={stat.label} className="flex flex-col gap-1 p-4">
                <span className="text-[11px] text-muted">{t(stat.label)}</span>
                <span className="font-display text-[22px] font-black text-heading" dir="ltr">
                  {stat.value}
                </span>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Icon name="Car" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Assigned Vehicles')}</h3>
              <span className="flex-1" />
              <span className="font-mono text-xs text-muted" dir="ltr">
                {fleet.vehicles} {t('Vehicles')}
              </span>
            </div>
            {COVERED_VEHICLES.map((vehicle) => (
              <div
                key={vehicle.plate}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
              >
                <span className="flex rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                  <Icon name="Car" size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-body">{vehicle.make}</p>
                  <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                    {vehicle.plate}
                  </p>
                </div>
                {statusBadge(vehicle.status)}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="History" size={16} className="text-salis-blue" />
          <h3 className="text-sm font-bold text-heading">{t('Service History')}</h3>
        </div>
        <DataTable
          columns={billingColumns}
          rows={BILLING_ROWS}
          rowKey={(row, index) => `${row.vehicle}-${index}`}
          mobileCard={(row) => (
            <>
              <MobileCardHeader title={`${t(row.service)} — ${row.vehicle}`} />
              <MobileCardRow label={t('Date')}>{row.date}</MobileCardRow>
              <MobileCardRow label={t('Cost')}>
                <Money sar={row.costSar} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="History"
              title={t('No service history yet')}
              description={t('Service visits for this fleet will appear here.')}
            />
          }
        />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="text-[11px] text-muted">{label}</span>
      <p className="mt-1 text-sm font-semibold text-heading">{value}</p>
    </div>
  )
}

const CONTRACT = {
  type: 'Comprehensive',
  valueSar: 186000,
  start: 'Jan 1, 2026',
  end: 'Dec 31, 2026',
  contact: 'Saad Al-Rashidi',
  phone: '+966 55 891 2200',
  progressPct: 56,
  daysRemaining: 204,
}

const FLEET_STATS = [
  { label: 'Vehicles', value: '24' },
  { label: 'Active Jobs', value: '6' },
  { label: 'Services YTD', value: '47' },
  { label: 'Total Spent', value: 'SAR 82K' },
] as const

const COVERED_VEHICLES: CoveredVehicle[] = [
  { make: 'Toyota Hilux 2024', plate: 'RUH 1001', status: 'active' },
  { make: 'Toyota Hilux 2023', plate: 'RUH 1002', status: 'service' },
  { make: 'Isuzu D-Max 2024', plate: 'RUH 1003', status: 'active' },
  { make: 'Mitsubishi L200 2023', plate: 'RUH 1004', status: 'service' },
]

const BILLING_ROWS: BillingRow[] = [
  { date: 'Jul 18, 2026', vehicle: 'Toyota Hilux — RUH 1002', service: 'Maintenance', costSar: parseSar('SAR 1,240') },
  { date: 'Jul 12, 2026', vehicle: 'Isuzu D-Max — RUH 1003', service: 'Tire Service', costSar: parseSar('SAR 680') },
  { date: 'Jul 5, 2026', vehicle: 'Mitsubishi L200 — RUH 1004', service: 'Repair', costSar: parseSar('SAR 2,350') },
  { date: 'Jun 28, 2026', vehicle: 'Toyota Hilux — RUH 1001', service: 'Inspection', costSar: parseSar('SAR 420') },
]
