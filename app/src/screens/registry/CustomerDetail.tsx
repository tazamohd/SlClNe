import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailRecord, type DetailStat } from '@/components/shell/DetailPage'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { StatusBadge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, useDelete, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/components/ui/Toast'
import { CustomerFormModal } from './CustomerForm'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { InvoiceStatusBadge, VehicleStatusBadge } from './badges'
import { derived, rowId } from './writes'

/** Customer 360 — `CustomerDetail.dc.html` and `.Mobile.dc.html`.
 *
 *  Desktop: the profile header, a four-stat strip, the vehicles and invoices
 *  panels side by side, and the service-history table. Phone: the compact
 *  profile card, three different stats, and the vehicles panel alone — which is
 *  what the mobile design draws, not a narrowed copy of the desktop one. Both
 *  come out of one `DetailPage`, with `on: 'desktop' | 'mobile'` marking the
 *  parts that genuinely differ.
 *
 *  Two deliberate departures from the prototype, both because the alternative
 *  would be inventing data:
 *
 *  - The service-history table drops the design's Date, Technician and Cost
 *    columns. A job card carries customer, vehicle, service, status and
 *    priority; it carries no date, no assigned-technician name and no total, so
 *    those three columns could only have been filled with numbers nobody wrote.
 *    The columns that exist are shown.
 *  - "Member Since" appears only when the record actually carries a creation
 *    timestamp, which the API sends and the demo fixtures do not.
 *
 *  Contact details are redacted for technicians, QC and suppliers
 *  (`FIELD_RULES`), so the email and phone are dropped from the header rather
 *  than rendered blank. **That is presentation, not protection** — the server
 *  still sends both fields to those roles today, which is recorded as a finding
 *  rather than papered over here. */
type Customer = RowOf<'customers'> & {
  email?: string | null
  type?: string
  _id?: string
  _createdAt?: string
}
type Vehicle = RowOf<'vehicles'>
type Job = RowOf<'jobs'>

export function CustomerDetail() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ref = params.get('id') ?? params.get('name') ?? ''

  const customers = useCollection('customers')
  const vehicles = useCollection('vehicles')
  const invoices = useCollection('invoices')
  const jobs = useCollection('jobs')
  const remove = useDelete('customers')

  const rows = (customers.data ?? []) as readonly Customer[]
  // The design's own screens fall back to the first record when the query
  // string names nobody, and the route is reachable that way.
  const customer = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]

  if (customers.isLoading) return <DetailPage title={t('Customers')} loading />

  if (customers.isError) {
    return (
      <DetailPage
        title={t('Customers')}
        back={{ to: '/customers', label: 'Customers' }}
        error={{ message: customers.error?.message, onRetry: () => void customers.refetch() }}
      />
    )
  }

  if (!customer) {
    return (
      <DetailPage
        title={t('Customers')}
        back={{ to: '/customers', label: 'Customers' }}
        notFound={{
          title: 'Customer not found',
          description: 'It may have been deleted, or the link is out of date.',
        }}
      />
    )
  }

  const hideContact = fieldHidden('Customer contact details')
  const id = rowId(customer)
  const owned = (vehicles.data ?? []).filter((v: Vehicle) => v.owner === customer.name)
  const billed = (invoices.data ?? []).filter((row) => row.cust === customer.name)
  const worked = (jobs.data ?? []).filter((row: Job) => row.cust === customer.name)
  const memberSince = customer._createdAt ? customer._createdAt.slice(0, 4) : undefined

  const summary: DetailStat[] = [
    { label: 'Total Jobs', value: worked.length, icon: 'Wrench', on: 'desktop' },
    {
      label: 'Total Spent',
      value: <Money sar={parseSar(customer.spent ?? '')} />,
      icon: 'DollarSign',
      on: 'desktop',
    },
    { label: 'Vehicles', value: derived(customer.vehicles), icon: 'Car', on: 'desktop' },
    ...(memberSince
      ? [
          {
            label: 'Member Since',
            value: (
              <span dir="ltr" className="font-mono">
                {memberSince}
              </span>
            ),
            icon: 'Calendar',
            on: 'desktop' as const,
          },
        ]
      : []),
    // The phone screen shows a different three.
    { label: 'Vehicles Count', value: derived(customer.vehicles), on: 'mobile' },
    { label: 'Total Spent', value: <Money sar={parseSar(customer.spent ?? '')} />, on: 'mobile' },
    { label: 'Last Visit', value: derived(customer.last && t(customer.last)), on: 'mobile' },
  ]

  const vehicleRecords: DetailRecord[] = owned.map((vehicle) => ({
    id: vehicle.plate,
    to: `/vehicle-detail?plate=${encodeURIComponent(vehicle.plate)}`,
    icon: isMobile ? undefined : 'Car',
    primary: vehicle.make,
    secondary: (
      <span dir="ltr">
        {vehicle.plate} · {vehicle.mileage}
      </span>
    ),
    badge: <VehicleStatusBadge value={vehicle.status} />,
  }))

  const invoiceRecords: DetailRecord[] = billed.map((invoice) => ({
    id: invoice.id,
    to: `/invoice-detail?id=${encodeURIComponent(invoice.id)}`,
    primary: <span dir="ltr">{invoice.id}</span>,
    secondary: invoice.due,
    meta: <Money sar={parseSar(invoice.amount)} className="text-[13px] font-semibold text-heading" />,
    badge: <InvoiceStatusBadge value={invoice.status} />,
  }))

  const historyColumns: Column<Job>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Vehicle', cell: (job) => job.veh },
    { header: 'Service', cell: (job) => t(job.svc.replace(/_/g, ' ')) },
    {
      header: 'Status',
      cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />,
    },
  ]

  return (
    <>
      <DetailPage
        back={{ to: '/customers', label: 'Customers' }}
        title={customer.name}
        avatar={{ initial: customer.name.trim()[0] ?? '?' }}
        subtitle={isMobile && !hideContact ? <span dir="ltr">{customer.phone}</span> : undefined}
        meta={
          isMobile || hideContact
            ? undefined
            : [
                ...(customer.email
                  ? [{ icon: 'Mail', label: 'Email', value: customer.email, code: true }]
                  : []),
                { icon: 'Phone', label: 'Phone', value: customer.phone, code: true },
              ]
        }
        /* The design draws a "Loyal Customer" pill here. There is no loyalty
           column anywhere in the data model, so rendering it for every customer
           would be a label the record does not carry. The account type — which
           the record does carry — takes the slot. */
        status={
          !isMobile && customer.type ? (
            <span className="rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-1 text-[11px] font-semibold text-salis-blue">
              {t(customer.type === 'fleet' ? 'Fleet Account' : 'Individual')}
            </span>
          ) : undefined
        }
        actions={
          can('customers', 'e') || can('customers', 'd') ? (
            <>
              {can('customers', 'e') ? (
                <Button variant="subtle" onClick={() => setEditing(true)}>
                  <Icon name="Pencil" size={14} />
                  {t('Edit')}
                </Button>
              ) : null}
              {can('customers', 'd') ? (
                <Button variant="subtle" onClick={() => setDeleting(true)}>
                  <Icon name="Trash2" size={14} />
                  {t('Delete')}
                </Button>
              ) : null}
            </>
          ) : undefined
        }
        summary={summary}
        summaryAlign="center"
        readOnly={can('customers', 'e') ? false : 'Read-only — your role can view this customer but not change it.'}
        related={[
          {
            id: 'vehicles',
            title: 'Vehicles',
            icon: 'Car',
            span: 'half',
            loading: vehicles.isLoading,
            records: vehicleRecords,
            empty: {
              icon: 'Car',
              title: 'No vehicles yet',
              description: 'Vehicles are added at check-in.',
            },
          },
          {
            id: 'invoices',
            title: 'Invoices',
            icon: 'Receipt',
            span: 'half',
            on: 'desktop',
            loading: invoices.isLoading,
            records: invoiceRecords,
            empty: {
              icon: 'Receipt',
              title: 'No invoices yet',
              description: 'Invoices are raised when a job is delivered.',
            },
          },
        ]}
        sections={[
          {
            id: 'history',
            title: 'Service History',
            icon: 'History',
            on: 'desktop',
            children: (
              <DataTable
                columns={historyColumns}
                rows={worked}
                rowKey={(job) => job.id}
                loading={jobs.isLoading}
                empty={
                  <div className="py-2 text-center text-[13px] text-muted">
                    {t('No job cards for this customer yet.')}
                  </div>
                }
              />
            ),
          },
        ]}
      />

      {editing ? (
        <CustomerFormModal open onClose={() => setEditing(false)} customer={customer} />
      ) : null}

      {deleting ? (
        <DeleteRecordModal
          open
          onClose={() => setDeleting(false)}
          kind="Customer"
          name={customer.name}
          consequences={
            <>
              <Consequence count={owned.length} label="vehicles stay in the registry" />
              <Consequence label="Job cards and invoices keep their history" />
            </>
          }
          onConfirm={async () => {
            if (!id) throw new Error(t('This record has no id, so it cannot be deleted.'))
            await remove.mutateAsync({ id })
            toast.show({ title: t('Customer deleted'), description: customer.name })
            // Staying on the detail page of a record that no longer exists
            // would show a not-found panel a second later; go back to the list.
            navigate('/customers')
          }}
        />
      ) : null}
    </>
  )
}
