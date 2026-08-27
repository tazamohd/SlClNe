import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailRecord, type DetailStat } from '@/components/shell/DetailPage'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { ActivityFeed, type ActivityItem } from '@/components/ui/ActivityFeed'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, useDelete, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { EstimateStatusBadge, VehicleStatusBadge } from './badges'
import { VehicleFormModal } from './VehicleForm'
import { derived, rowId } from './writes'

/** Vehicle 360 — `VehicleDetail.dc.html` and `.Mobile.dc.html`.
 *
 *  Desktop: the icon-tile header with plate and VIN, the stat strip, and two
 *  panels. Phone: the plate as the title, make and owner beneath it, two stats,
 *  and the job-card list — the mobile design's own composition.
 *
 *  Three departures from the prototype, each because the data does not exist:
 *
 *  - **Mileage Log** is dropped. The design plots five historical odometer
 *    readings; a vehicle row carries one number, `mileageKm`, and there is no
 *    reading history anywhere in the schema. Five plausible earlier numbers
 *    would be invented data on a screen whose whole purpose is the record.
 *  - **Parts Replaced** is dropped, for the same reason: nothing links a part
 *    to a vehicle. `DIAG_PARTS` is the diagnostics workflow's fixed basket and
 *    is keyed to neither a job nor a vehicle.
 *  - The stat strip has three figures rather than four. "Total Spent" per
 *    vehicle is not derivable — invoices are raised against a customer, not a
 *    vehicle — so it is absent rather than guessed.
 *
 *  What replaces them is real and joined the way the mobile design itself
 *  joins it: the job cards raised against this vehicle, and the estimates. */
type Vehicle = RowOf<'vehicles'> & {
  vin?: string | null
  mileageKm?: number
  customerId?: string | null
  _id?: string
}
type Job = RowOf<'jobs'>

export function VehicleDetail() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ref = params.get('id') ?? params.get('plate') ?? ''

  const vehicles = useCollection('vehicles')
  const jobs = useCollection('jobs')
  const estimates = useCollection('estimates')
  const remove = useDelete('vehicles')

  const rows = (vehicles.data ?? []) as readonly Vehicle[]
  const vehicle = ref ? rows.find((row) => rowId(row) === ref || row.plate === ref) : rows[0]
  const vehicleMake = vehicle?.make ?? ''
  const vehicleOwner = vehicle?.owner ?? ''
  const worked = (jobs.data ?? []).filter((row: Job) => vehicleMake && row.veh === vehicleMake)
  const quoted = (estimates.data ?? []).filter((row) => vehicleMake && row.veh === vehicleMake)

  const activities: ActivityItem[] = useMemo(
    () =>
      vehicleMake
        ? worked.slice(0, 5).map((job) => ({
            id: `act-${job.id}`,
            icon: job.st === 'completed' ? 'CheckCircle' : 'Wrench',
            user: vehicleOwner,
            action: t(job.svc.replace(/_/g, ' ')),
            target: job.id,
            time: t(job.st.replace(/_/g, ' ')),
          }))
        : [],
    [worked, vehicleOwner, vehicleMake, t]
  )

  if (vehicles.isLoading) return <DetailPage title={t('All Vehicles')} loading />

  if (vehicles.isError) {
    return (
      <DetailPage
        title={t('All Vehicles')}
        back={{ to: '/vehicles', label: 'Vehicles' }}
        error={{ message: vehicles.error?.message, onRetry: () => void vehicles.refetch() }}
      />
    )
  }

  if (!vehicle) {
    return (
      <DetailPage
        title={t('All Vehicles')}
        back={{ to: '/vehicles', label: 'Vehicles' }}
        notFound={{
          title: 'Vehicle not found',
          description: 'It may have been deleted, or the link is out of date.',
        }}
      />
    )
  }

  const id = rowId(vehicle)

  const summary: DetailStat[] = [
    {
      label: 'Odometer',
      value: (
        <span dir="ltr" className="font-mono">
          {derived(vehicle.mileage)}
        </span>
      ),
      on: 'desktop',
    },
    { label: 'Total Jobs', value: worked.length, on: 'desktop' },
    { label: 'Last Service', value: derived(vehicle.last && t(vehicle.last)), on: 'desktop' },
    // The phone design shows two.
    {
      label: 'Mileage',
      value: (
        <span dir="ltr" className="font-mono">
          {derived(vehicle.mileage)}
        </span>
      ),
      on: 'mobile',
    },
    { label: 'Last Service', value: derived(vehicle.last && t(vehicle.last)), on: 'mobile' },
  ]

  const jobRecords: DetailRecord[] = worked.map((job) => ({
    id: job.id,
    to: `/job-detail?id=${encodeURIComponent(job.id)}`,
    primary: <span dir="ltr">{job.id}</span>,
    secondary: t(job.svc.replace(/_/g, ' ')),
    badge: <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />,
  }))

  const estimateRecords: DetailRecord[] = quoted.map((estimate) => ({
    id: estimate.id,
    to: `/estimate-detail?id=${encodeURIComponent(estimate.id)}`,
    primary: <span dir="ltr">{estimate.id}</span>,
    secondary: estimate.cust,
    meta: (
      <Money sar={parseSar(estimate.amount)} className="text-[13px] font-semibold text-heading" />
    ),
    badge: <EstimateStatusBadge value={estimate.status} />,
  }))

  return (
    <>
      <DetailPage
        back={{ to: '/vehicles', label: 'Vehicles' }}
        /* The phone design leads with the plate; the desktop one leads with the
           make and carries the plate in the detail line. */
        title={isMobile ? vehicle.plate : vehicle.make}
        titleCode={isMobile}
        subtitle={isMobile ? `${vehicle.make} · ${vehicle.owner}` : undefined}
        avatar={{ icon: 'Car' }}
        meta={
          isMobile
            ? undefined
            : [
                { icon: 'Hash', label: 'Plate', value: vehicle.plate, code: true },
                { icon: 'User', label: 'Owner', value: vehicle.owner },
                ...(vehicle.vin
                  ? [{ icon: 'Key', label: 'VIN', value: vehicle.vin, code: true }]
                  : []),
              ]
        }
        status={<VehicleStatusBadge value={vehicle.status} />}
        actions={
          can('vehicles', 'e') || can('vehicles', 'd') ? (
            <>
              {can('vehicles', 'e') ? (
                <Button variant="subtle" onClick={() => setEditing(true)}>
                  <Icon name="Pencil" size={14} />
                  {t('Edit')}
                </Button>
              ) : null}
              {can('vehicles', 'd') ? (
                <Button variant="subtle" onClick={() => setDeleting(true)}>
                  <Icon name="Trash2" size={14} />
                  {t('Delete')}
                </Button>
              ) : null}
            </>
          ) : undefined
        }
        summary={summary}
        readOnly={
          can('vehicles', 'e')
            ? false
            : 'Read-only — your role can view this vehicle but not change it.'
        }
        timeline={
          activities.length > 0 && !isMobile ? (
            <ActivityFeed items={activities} title={t('Service History')} />
          ) : undefined
        }
        related={[
          {
            id: 'jobs',
            title: 'Latest Job Cards',
            icon: 'Wrench',
            span: 'half',
            loading: jobs.isLoading,
            records: jobRecords,
            empty: {
              icon: 'Wrench',
              title: 'No job cards yet',
              description: 'A job card is raised at check-in.',
            },
          },
          {
            id: 'estimates',
            title: 'Estimates',
            icon: 'FileText',
            span: 'half',
            on: 'desktop',
            loading: estimates.isLoading,
            records: estimateRecords,
            empty: {
              icon: 'FileText',
              title: 'No estimates yet',
              description: 'Estimates are raised after inspection.',
            },
          },
        ]}
      />

      {editing ? (
        <VehicleFormModal open onClose={() => setEditing(false)} vehicle={vehicle} />
      ) : null}

      {deleting ? (
        <DeleteRecordModal
          open
          onClose={() => setDeleting(false)}
          kind="Vehicle"
          name={vehicle.plate}
          code
          consequences={
            <>
              <Consequence count={worked.length} label="Job cards keep this vehicle's history" />
              <Consequence label="The owner's customer record is not affected" />
            </>
          }
          onConfirm={async () => {
            if (!id) throw new Error(t('This record has no id, so it cannot be deleted.'))
            await remove.mutateAsync({ id })
            toast.show({ title: t('Vehicle deleted'), description: vehicle.plate })
            navigate('/vehicles')
          }}
        />
      ) : null}
    </>
  )
}
