import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge, StatusBadge, ServiceBadge, PriorityBadge } from '@/components/ui/Badge'
import { Money, parseSar } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { StatRow } from '@/components/shell/FeatureScreen'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Customer 360: contact card, vehicles, job history and invoice history for
 *  one customer, joined off the customer's name — the only key the mock
 *  tables share (`vehicles.owner`, `jobs.cust`, `invoices.cust`).
 *
 *  Contact details (email/phone) are role-gated the same way the Customers
 *  registry gates its phone column — technicians, QC and suppliers don't get
 *  a customer's contact details (FIELD_RULES). Spend and invoice history stay
 *  visible; that gate only covers PII, not revenue. */

type Invoice = RowOf<'invoices'>
type Job = RowOf<'jobs'>

// Invoice status palette — matches the Invoices register: paid is brand blue,
// overdue is the warning orange, unpaid is neutral slate. No green/red/yellow.
const INVOICE_STATUS: Record<string, readonly [string, string]> = {
  paid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  unpaid: ['rgba(100,116,139,.1)', '#64748B'],
  overdue: ['rgba(249,115,22,.1)', '#F97316'],
}

// Vehicle status palette — matches the Vehicles registry.
const VEHICLE_STATUS: Record<string, readonly [string, string]> = {
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  service: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

export function CustomerDetail() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const [params] = useSearchParams()
  const { data: customers = [], isLoading: loadingCustomers } = useCollection('customers')
  const { data: vehicles = [], isLoading: loadingVehicles } = useCollection('vehicles')
  const { data: jobs = [], isLoading: loadingJobs } = useCollection('jobs')
  const { data: invoices = [], isLoading: loadingInvoices } = useCollection('invoices')

  const name = params.get('name') ?? params.get('id')
  const customer = name ? customers.find((row) => row.name === name) : customers[0]

  const isLoading = loadingCustomers || loadingVehicles || loadingJobs || loadingInvoices

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  if (!customer) {
    return (
      <Card className="p-6">
        <EmptyState
          icon="Users"
          title={t('Customer not found')}
          description={t('It may have been deleted, merged, or the link is out of date.')}
          action={
            <Link to="/customers" className="font-action text-[13px] font-medium">
              {t('Back to Customers')}
            </Link>
          }
        />
      </Card>
    )
  }

  const hideContact = fieldHidden('Customer contact details')

  const customerVehicles = vehicles.filter((v) => v.owner === customer.name)
  const customerJobs = jobs.filter((j) => j.cust === customer.name)
  const customerInvoices = invoices.filter((i) => i.cust === customer.name)
  const totalSpent = customerInvoices.reduce((sum, invoice) => sum + parseSar(invoice.amount), 0)

  const invoiceBadge = (status: string) => {
    const [background, color] = INVOICE_STATUS[status] ?? INVOICE_STATUS.unpaid
    return (
      <Badge background={background} color={color}>
        {t(status[0].toUpperCase() + status.slice(1))}
      </Badge>
    )
  }

  const vehicleBadge = (status: string) => {
    const [background, color] = VEHICLE_STATUS[status] ?? VEHICLE_STATUS.active
    return (
      <Badge background={background} color={color}>
        {t(status === 'service' ? 'In Service' : 'Active')}
      </Badge>
    )
  }

  const jobColumns: Column<Job>[] = [
    { header: 'Job Card #', cell: (j) => j.id, code: true },
    { header: 'Vehicle', cell: (j) => j.veh },
    { header: 'Service', cell: (j) => <ServiceBadge value={j.svc} label={t(j.svc.replace(/_/g, ' '))} /> },
    { header: 'Priority', cell: (j) => <PriorityBadge value={j.pr} label={t(j.pr)} /> },
    { header: 'Status', cell: (j) => <StatusBadge value={j.st} label={t(j.st.replace(/_/g, ' '))} /> },
  ]

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Customers')}
        </Link>
      </div>

      <Card className="flex flex-wrap items-center gap-5 p-6">
        <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-2xl font-extrabold text-white shadow-[0_8px_20px_rgba(10,94,215,.2)]">
          {customer.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-black text-heading">{customer.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            {hideContact ? null : (
              <>
                <span className="flex items-center gap-1 text-[13px] text-muted" dir="ltr">
                  <Icon name="Mail" size={13} />
                  {customer.name.toLowerCase().replace(/[^a-z]/g, '')}@email.com
                </span>
                <span className="flex items-center gap-1 text-[13px] text-muted" dir="ltr">
                  <Icon name="Phone" size={13} />
                  {customer.phone}
                </span>
              </>
            )}
            <span className="rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-0.5 text-[11px] font-semibold text-salis-blue">
              {t('Loyal Customer')}
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button variant="outline" size="md">
            <Icon name="MessageSquare" size={14} />
            {t('Message')}
          </Button>
          <Button size="md">
            <Icon name="Plus" size={14} />
            {t('New Job')}
          </Button>
        </div>
      </Card>

      <StatRow
        stats={[
          { label: 'Total Jobs', value: customerJobs.length, icon: 'Wrench' },
          { label: 'Total Spent', value: `SAR ${totalSpent.toLocaleString('en-US')}`, icon: 'DollarSign' },
          { label: 'Vehicles', value: customerVehicles.length, icon: 'Car' },
          { label: 'Last Visit', value: t(customer.last), icon: 'Calendar' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center gap-2">
            <Icon name="Car" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Vehicles')}</h3>
          </div>
          {customerVehicles.length === 0 ? (
            <EmptyState
              icon="Car"
              title={t('No vehicles yet')}
              description={t('Vehicles are added at check-in.')}
            />
          ) : (
            customerVehicles.map((vehicle) => (
              <div
                key={vehicle.plate}
                className="flex items-center gap-2.5 rounded-[10px] border border-border bg-inset p-2.5"
              >
                <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
                  <Icon name="Car" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-heading">{vehicle.make}</p>
                  <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                    {vehicle.plate} · {vehicle.mileage}
                  </p>
                </div>
                {vehicleBadge(vehicle.status)}
              </div>
            ))
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="Receipt" size={16} className="text-salis-blue" />
            <h3 className="text-sm font-bold text-heading">{t('Invoices')}</h3>
          </div>
          {customerInvoices.length === 0 ? (
            <EmptyState
              icon="Receipt"
              title={t('No invoices yet')}
              description={t('Invoices are raised when a job card is delivered.')}
            />
          ) : (
            customerInvoices.map((invoice: Invoice) => (
              <div
                key={invoice.id}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-body" dir="ltr">
                    {invoice.id}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{invoice.due}</p>
                </div>
                <Money sar={parseSar(invoice.amount)} className="text-[13px] font-semibold text-heading" />
                {invoiceBadge(invoice.status)}
              </div>
            ))
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon name="History" size={16} className="text-salis-blue" />
          <h3 className="text-sm font-bold text-heading">{t('Job History')}</h3>
        </div>
        <DataTable
          columns={jobColumns}
          rows={customerJobs}
          rowKey={(j) => j.id}
          mobileCard={(j) => (
            <>
              <MobileCardHeader
                title={j.id}
                code
                trailing={<StatusBadge value={j.st} label={t(j.st.replace(/_/g, ' '))} />}
              />
              <MobileCardRow>{j.veh}</MobileCardRow>
              <MobileCardRow label={t('Service')}>
                <ServiceBadge value={j.svc} label={t(j.svc.replace(/_/g, ' '))} />
              </MobileCardRow>
              <MobileCardRow label={t('Priority')}>
                <PriorityBadge value={j.pr} label={t(j.pr)} />
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Wrench"
              title={t('No job cards yet')}
              description={t('Job cards are created at check-in.')}
            />
          }
        />
      </div>
    </div>
  )
}
