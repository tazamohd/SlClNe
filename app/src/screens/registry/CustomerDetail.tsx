import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailMeta, type DetailRecord, type DetailStat } from '@/components/shell/DetailPage'
import { useCommand, type Command } from '@/components/shell/commands'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { Popover } from '@/components/ui/Popover'
import { StatusBadge } from '@/components/ui/Badge'
import { ActivityFeed, type ActivityItem } from '@/components/ui/ActivityFeed'
import { Comments, type Comment } from '@/components/ui/Comments'
import { EmptyState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, useUndoableDelete, type RowOf } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { invoiceMoney } from '@/screens/finance/money'
import { CustomerFormModal } from './CustomerForm'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { InvoiceStatusBadge, VehicleStatusBadge } from './badges'
import { OverflowItem } from './registryShared'
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
 *  One primary action: "New Job Card", which opens the job-card screen with
 *  this customer already named. Edit is secondary; Delete lives behind the
 *  overflow menu, confirms, and can be undone from the toast.
 *
 *  Deliberate departures from the prototype, all because the alternative would
 *  be inventing data:
 *
 *  - The service-history table drops the design's Date, Technician and Cost
 *    columns. A job card carries no date, no technician name and no total.
 *  - "Member Since" appears only when the record carries a creation timestamp.
 *  - The design's three sample PDFs are gone. The documents rail is an honest
 *    empty state; uploading needs a document store the API does not have yet,
 *    so the Upload control is present and disabled with the reason.
 *
 *  Contact details are redacted for technicians, QC and suppliers
 *  (`FIELD_RULES`), so the email and phone are dropped from the header rather
 *  than rendered blank. **That is presentation, not protection** — the server
 *  still sends both fields to those roles today. */
type Customer = RowOf<'customers'> & {
  email?: string | null
  type?: string
  _id?: string
  _createdAt?: string
}
type Vehicle = RowOf<'vehicles'>
type Job = RowOf<'jobs'>

const OPEN_JOB_STATES = new Set(['completed', 'delivered', 'cancelled'])

export function CustomerDetail() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const ref = params.get('id') ?? params.get('name') ?? ''

  const customers = useCollection('customers')
  const vehicles = useCollection('vehicles')
  const invoices = useCollection('invoices')
  const jobs = useCollection('jobs')
  const { remove: removeCustomer, pending: removing } = useUndoableDelete('customers', 'Customer')

  const rows = (customers.data ?? []) as readonly Customer[]
  // The design's own screens fall back to the first record when the query
  // string names nobody, and the route is reachable that way.
  const customer = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]
  const customerName = customer?.name ?? ''
  const owned = (vehicles.data ?? []).filter((v: Vehicle) => customerName && v.owner === customerName)
  const billed = (invoices.data ?? []).filter((row) => customerName && row.cust === customerName)
  const worked = (jobs.data ?? []).filter((row: Job) => customerName && row.cust === customerName)
  const openJobs = worked.filter((job) => !OPEN_JOB_STATES.has(job.st))

  /** What the customer still owes, from the server's balance where it exists
   *  and from the unpaid total where this build has only the fixture string. */
  const outstandingHalalas = useMemo(
    () =>
      billed.reduce((sum, invoice) => {
        if (invoice.status === 'cancelled') return sum
        const money = invoiceMoney(invoice)
        if (money.fromServer) return sum + money.balanceHalalas
        return invoice.status === 'paid' ? sum : sum + money.totalHalalas
      }, 0),
    [billed]
  )

  const canCreateJob = can('jobcards', 'c')
  const commands = useMemo<Command[]>(
    () =>
      canCreateJob && customerName
        ? [
            {
              id: 'customer:new-job',
              label: 'New Job Card',
              icon: 'ClipboardPlus',
              group: 'create',
              keywords: ['job', 'card', 'check-in', customerName],
              shortcut: 'N',
              run: (ctx) => ctx.navigate('/job-cards', { state: { customerName } }),
            },
          ]
        : [],
    [canCreateJob, customerName]
  )
  useCommand(commands)

  const activities: ActivityItem[] = useMemo(
    () =>
      customerName
        ? worked.slice(0, 5).map((job, i) => ({
            id: `act-${job.id}`,
            icon: i % 2 === 0 ? 'Wrench' : 'CheckCircle',
            user: customerName,
            action: job.st === 'completed' ? 'completed' : 'started',
            target: job.id,
            time: t(job.st.replace(/_/g, ' ')),
          }))
        : [],
    [worked, customerName, t]
  )

  const comments: Comment[] = useMemo(
    () =>
      customerName
        ? worked.slice(0, 3).map((job) => ({
            id: `cmt-${job.id}`,
            author: customerName,
            text: `${t(job.svc.replace(/_/g, ' '))} — ${t(job.st.replace(/_/g, ' '))}`,
            time: t(job.pr),
          }))
        : [],
    [worked, customerName, t]
  )

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
  const memberSince = customer._createdAt ? customer._createdAt.slice(0, 4) : undefined
  const mayEdit = can('customers', 'e')
  const mayDelete = can('customers', 'd')

  const meta: DetailMeta[] = [
    ...(hideContact || isMobile
      ? []
      : [
          ...(customer.email ? [{ icon: 'Mail', label: 'Email', value: customer.email, code: true }] : []),
          { icon: 'Phone', label: 'Phone', value: customer.phone, code: true },
        ]),
    ...(!isMobile && customer.last ? [{ icon: 'Clock', label: 'Last Visit', value: t(customer.last) }] : []),
    ...(!isMobile && memberSince
      ? [{ icon: 'Calendar', label: 'Member Since', value: memberSince, code: true }]
      : []),
  ]

  const summary: DetailStat[] = [
    { label: 'Vehicles', value: derived(customer.vehicles ?? owned.length), icon: 'Car', on: 'desktop' },
    { label: 'Open Jobs', value: openJobs.length, icon: 'Wrench', on: 'desktop' },
    {
      label: 'Outstanding',
      value: (
        <Money
          sar={outstandingHalalas / 100}
          className={outstandingHalalas > 0 ? 'text-salis-orange' : undefined}
        />
      ),
      icon: 'Receipt',
      on: 'desktop',
    },
    { label: 'Total Jobs', value: worked.length, icon: 'History', on: 'desktop' },
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
    { header: 'Job Card', cell: (job) => job.id, code: true, sortValue: (job) => job.id },
    { header: 'Vehicle', cell: (job) => job.veh, sortValue: (job) => job.veh },
    { header: 'Service', cell: (job) => t(job.svc.replace(/_/g, ' ')), sortValue: (job) => job.svc },
    {
      header: 'Status',
      cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />,
      sortValue: (job) => job.st,
    },
  ]

  const actions =
    canCreateJob || mayEdit || mayDelete ? (
      <>
        {canCreateJob ? (
          <Button size="md" icon="ClipboardPlus" onClick={() => navigate('/job-cards', { state: { customerName } })}>
            {t('New Job Card')}
          </Button>
        ) : null}
        {mayEdit ? (
          <Button variant="outline" size="md" icon="Pencil" onClick={() => setEditing(true)}>
            {t('Edit')}
          </Button>
        ) : null}
        {mayDelete ? (
          <Popover
            align="end"
            trigger={
              <button
                type="button"
                aria-label={t('More actions')}
                aria-haspopup="menu"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-border bg-card text-muted transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
              >
                <Icon name="MoreHorizontal" size={18} />
              </button>
            }
            contentClassName="flex min-w-[200px] flex-col gap-1 p-1.5"
          >
            <OverflowItem icon="Trash2" label="Delete" destructive onClick={() => setDeleting(true)} />
          </Popover>
        ) : null}
      </>
    ) : undefined

  const documents = isMobile ? undefined : (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Icon name="Paperclip" size={16} className="text-salis-blue" />
        <h2 className="text-sm font-bold text-heading">{t('Documents')}</h2>
      </div>
      <EmptyState
        icon="FileUp"
        title={t('No documents yet')}
        description={t('ID copies, contracts and signed forms will appear here.')}
        action={
          <div className="flex flex-col items-center gap-1.5">
            <Button
              variant="outline"
              size="md"
              icon="Upload"
              disabled
              title={t('Document storage is not connected yet.')}
            >
              {t('Upload')}
            </Button>
            <p className="text-[11px] text-muted">
              {isLive
                ? t('Document storage is not connected yet.')
                : t('This build reads demo data. Saving needs the API — set VITE_API_URL.')}
            </p>
          </div>
        }
      />
    </Card>
  )

  return (
    <>
      <DetailPage
        back={{ to: '/customers', label: 'Customers' }}
        title={customer.name}
        avatar={{ initial: customer.name.trim()[0] ?? '?' }}
        subtitle={isMobile && !hideContact ? <span dir="ltr">{customer.phone}</span> : undefined}
        meta={meta.length ? meta : undefined}
        /* The design draws a "Loyal Customer" pill here. There is no loyalty
           column anywhere in the data model, so rendering it for every customer
           would be a label the record does not carry. The account type — which
           the record does carry — takes the slot. */
        status={
          !isMobile && customer.type ? (
            <span className="rounded-full bg-tint-blue px-2.5 py-1 text-[11px] font-semibold text-salis-blue">
              {t(customer.type === 'fleet' ? 'Fleet Account' : 'Individual')}
            </span>
          ) : undefined
        }
        actions={actions}
        summary={summary}
        summaryAlign="center"
        readOnly={mayEdit ? false : 'Read-only — your role can view this customer but not change it.'}
        timeline={
          activities.length > 0 && !isMobile ? (
            <ActivityFeed items={activities} title={t('Recent Activity')} />
          ) : undefined
        }
        comments={
          comments.length > 0 && !isMobile ? (
            <Comments items={comments} title={t('Notes')} />
          ) : undefined
        }
        attachments={documents}
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
                caption="Service history for this customer"
                columns={historyColumns}
                rows={worked}
                rowKey={(job) => job.id}
                loading={jobs.isLoading}
                pageSize={10}
                onRowClick={(job) => navigate(`/job-detail?id=${encodeURIComponent(job.id)}`)}
                empty={
                  <EmptyState
                    icon="Wrench"
                    title={t('No job cards for this customer yet.')}
                    description={t('Check a vehicle in to open the first one.')}
                    action={
                      canCreateJob ? (
                        <Button
                          variant="outline"
                          size="md"
                          icon="ClipboardPlus"
                          onClick={() => navigate('/job-cards', { state: { customerName } })}
                        >
                          {t('New Job Card')}
                        </Button>
                      ) : null
                    }
                  />
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
            if (removing) return
            await removeCustomer(id)
            // Staying on the detail page of a record that no longer exists
            // would show a not-found panel a second later; go back to the list.
            navigate('/customers')
          }}
        />
      ) : null}
    </>
  )
}
