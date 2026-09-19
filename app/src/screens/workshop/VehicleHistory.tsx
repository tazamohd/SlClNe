import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Money'
import { Icon } from '@/components/ui/Icon'
import { ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, MAX_PAGE_SIZE, type RowOf } from '@/data/useCollection'
import type { JobRow } from './stages'

type TechnicianRow = RowOf<'technicians'> & { _id?: string }
type InvoiceRow = RowOf<'invoices'> & { jobCardId?: string | null; totalHalalas?: number }

const COMPLETED_STATUSES = ['completed', 'delivered']

interface ServiceRecord {
  key: string
  date: string | null
  service: string
  technician: string | null
  status: string
  costHalalas: number | null
}

/** Previously six invented rows — fake dates, fake technicians ("Ahmad
 *  Al-Harbi" etc.), fake costs — for every vehicle in the fleet alike. This
 *  route (`/vehicle-history`) carries no vehicle id (nothing links to it with
 *  one), so it is honestly a fleet-wide service timeline rather than a
 *  per-vehicle one: the real `jobs` collection's completed/delivered rows,
 *  each joined to its own invoice (`invoices.jobCardId === job._id`, the same
 *  join `JobDetail.tsx` uses) for its real cost, and to `technicians` for the
 *  assignee's real name. `_id`/`_createdAt`/`assignedTechId` are absent on a
 *  fixture build (`stages.ts`'s `JobRow` comment) — those columns read "—"
 *  there rather than joining on nothing. `partial` mirrors
 *  `TechnicianLeaderboards`' own flag: a page of jobs capped at
 *  `MAX_PAGE_SIZE` is a real undercount on a shop with more history than that,
 *  named rather than hidden. No total is summed across rows — a per-row cost
 *  is one record's own figure, not a cross-record aggregate. */
export function useServiceRecords(t: (s: string) => string) {
  const jobs = useCollection('jobs')
  const invoices = useCollection('invoices')
  const technicians = useCollection('technicians')

  return useMemo(() => {
    const jobRows = (jobs.data ?? []) as readonly JobRow[]
    const invoiceRows = (invoices.data ?? []) as readonly InvoiceRow[]
    const techRows = (technicians.data ?? []) as readonly TechnicianRow[]

    const invoiceByJob = new Map<string, InvoiceRow>()
    for (const inv of invoiceRows) {
      if (inv.jobCardId) invoiceByJob.set(inv.jobCardId, inv)
    }
    const techName = new Map<string, string>()
    for (const tech of techRows) {
      if (tech._id) techName.set(tech._id, tech.name)
    }

    const records: ServiceRecord[] = jobRows
      .filter((j) => COMPLETED_STATUSES.includes(j.st))
      .map((j) => {
        const invoice = j._id ? invoiceByJob.get(j._id) : undefined
        return {
          key: j._id ?? j.id,
          date: j._createdAt ? j._createdAt.slice(0, 10) : null,
          service: j.svc,
          technician: j.assignedTechId ? (techName.get(j.assignedTechId) ?? null) : null,
          status: j.st,
          costHalalas: invoice?.totalHalalas ?? null,
        }
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

    return {
      records,
      isLoading: jobs.isLoading || invoices.isLoading || technicians.isLoading,
      partial: jobRows.length >= MAX_PAGE_SIZE,
    }
  }, [jobs.data, jobs.isLoading, invoices.data, invoices.isLoading, technicians.data, technicians.isLoading, t])
}

export function VehicleHistory() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { records, partial } = useServiceRecords(t)

  const columns: Column<ServiceRecord>[] = [
    { header: 'Date', cell: (r) => r.date ?? '—', code: true },
    { header: 'Service Type', cell: (r) => <ServiceBadge value={r.service} label={t(r.service.replace(/_/g, ' '))} /> },
    { header: 'Technician', cell: (r) => r.technician ?? '—' },
    {
      header: 'Cost',
      cell: (r) => r.costHalalas == null ? '—' : <span className="font-mono font-medium" dir="ltr"><Money sar={r.costHalalas / 100} /></span>,
    },
    { header: 'Status', cell: (r) => <StatusBadge value={r.status} label={t(r.status.replace(/_/g, ' '))} /> },
  ]

  const table = (
    <DataTable
      caption="Service timeline"
      columns={columns}
      rows={records}
      rowKey={(r) => r.key}
      mobileCard={(r) => (
        <>
          <MobileCardHeader
            title={t(r.service.replace(/_/g, ' '))}
            trailing={<StatusBadge value={r.status} label={t(r.status.replace(/_/g, ' '))} />}
          />
          <MobileCardRow label={t('Date')}>{r.date ?? '—'}</MobileCardRow>
          <MobileCardRow label={t('Cost')}>
            {r.costHalalas == null ? '—' : <span dir="ltr"><Money sar={r.costHalalas / 100} /></span>}
          </MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="History" title={t('Vehicle History')} subtitle={t('Service Records')} />
        <MobileCard>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t('Service Records')}</span>
            <span className="font-mono text-sm font-bold text-heading">{records.length}{partial ? '+' : ''}</span>
          </div>
        </MobileCard>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="History" title={t('Vehicle History')} subtitle={t('Service Records')} />

      <Card className="w-fit rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-bright text-salis-bright" aria-hidden><Icon name="ClipboardList" size={16} /></span>
          <span className="text-xs font-medium text-muted">{t('Service Records')}</span>
        </div>
        <p className="mt-2 font-display text-xl font-black text-heading">
          {records.length}
          {partial ? '+' : ''}
        </p>
        {partial && <p className="mt-1 text-[11px] text-muted">{t('More records exist than this page shows.')}</p>}
      </Card>

      {table}
    </div>
  )
}
