import { useSearchParams } from 'react-router-dom'
import { PrintLayout, InfoRow, SignatureLine } from '@/components/ui/PrintLayout'
import { Money } from '@/components/ui/Money'
import { Loading, EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { railLabelFor, type JobRow } from './stages'

type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  subtotalHalalas?: number
  taxHalalas?: number
  totalHalalas?: number
}
type LineRow = RowOf<'invoiceLines'> & { _id?: string }
type TechnicianRow = RowOf<'technicians'> & { _id?: string }

/** Print-optimized job card view.
 *
 *  Shows all relevant job information in a clean A4 format: customer and
 *  vehicle info, technician assignment, work performed, parts used, and
 *  signature lines for both customer and technician. */
export function JobCardPrint() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()

  const jobs = useCollection('jobs')
  const jobId = params.get('id')
  const rows = (jobs.data ?? []) as readonly JobRow[]
  const job = jobId ? rows.find((row) => row.id === jobId) : rows[0]

  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as InvoiceRow | undefined
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })
  const technicians = useCollection('technicians')

  if (jobs.isLoading) return <Loading label={t('Loading job card...')} />
  if (!job) {
    return (
      <EmptyState
        icon="FileQuestion"
        title={t('Job card not found')}
        description={t('It may have been deleted, or the link is out of date.')}
      />
    )
  }

  const technician = job.assignedTechId
    ? (technicians.data as readonly TechnicianRow[] | undefined)?.find(
        (row) => row._id === job.assignedTechId
      )
    : undefined

  const parts = ((lines.data ?? []) as readonly LineRow[]).filter((line) => line.kind === 'part')
  const labour = ((lines.data ?? []) as readonly LineRow[]).filter((line) => line.kind === 'labour')

  const statusLabel = job.st?.replace(/_/g, ' ') ?? ''
  const stageLabel = railLabelFor(job.stage)

  return (
    <PrintLayout
      documentTitle={t('Job Card')}
      documentNumber={job.id}
      date={job._createdAt ? String(job._createdAt).slice(0, 10) : undefined}
      status={
        <span className="rounded bg-salis-blue/10 px-2 py-0.5 text-xs font-semibold text-salis-blue">
          {t(statusLabel)}
        </span>
      }
      customerInfo={
        <>
          <InfoRow label={t('Customer')} value={job.cust} />
          <InfoRow label={t('Service Type')} value={t(job.svc)} />
          <InfoRow label={t('Priority')} value={t(job.pr)} />
        </>
      }
      vehicleInfo={
        <>
          <InfoRow label={t('Vehicle')} value={job.veh} />
          <InfoRow label={t('Stage')} value={t(stageLabel)} />
        </>
      }
      footer={
        <div className="space-y-6">
          {/* Notes placeholder */}
          <div>
            <h4 className="mb-1.5 text-xs font-bold uppercase text-heading">
              {t('Additional Notes')}
            </h4>
            <div className="min-h-[48px] rounded border border-dashed border-border bg-surface p-2 text-xs text-muted">
              {t('Any additional notes or remarks can be written here.')}
            </div>
          </div>

          {/* Signature lines */}
          <div className="flex items-end justify-between gap-8 pt-4">
            <div className="space-y-6">
              <SignatureLine label={t('Technician Signature')} />
              {technician && (
                <p className="text-center text-xs text-muted">{technician.name}</p>
              )}
            </div>
            <div className="space-y-6">
              <SignatureLine label={t('Customer Signature')} />
              <p className="text-center text-xs text-muted">{job.cust}</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Technician Assignment */}
      <div className="mb-6">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
          {t('Assigned Technician')}
        </h4>
        {technician ? (
          <div className="flex items-center gap-3 rounded border border-border bg-surface p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-salis-navy text-sm font-bold text-white">
              {technician.name?.charAt(0) ?? 'T'}
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">{technician.name}</p>
              {(technician as { specialty?: string }).specialty && (
                <p className="text-xs text-muted">{(technician as { specialty?: string }).specialty}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">{t('No technician assigned yet')}</p>
        )}
      </div>

      {/* Checklist / Inspection section */}
      <div className="mb-6">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
          {t('Inspection Checklist')}
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            t('Exterior condition'),
            t('Interior condition'),
            t('Engine bay'),
            t('Fluid levels'),
            t('Tire condition'),
            t('Brake system'),
            t('Lights and signals'),
            t('Battery condition'),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-body">
              <div className="h-3.5 w-3.5 flex-shrink-0 rounded border border-border" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Work Performed */}
      {labour.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
            {t('Work Performed')}
          </h4>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface">
                <Th align="start">#</Th>
                <Th align="start">{t('Description')}</Th>
                <Th align="end">{t('Qty')}</Th>
                <Th align="end">{t('Rate')}</Th>
              </tr>
            </thead>
            <tbody>
              {labour.map((line, index) => (
                <tr key={line._id ?? `l-${index}`} className="border-b border-border">
                  <td className="px-3 py-2 text-xs text-muted">{index + 1}</td>
                  <td className="px-3 py-2 text-heading">
                    {rtl && line.ar ? line.ar : line.desc}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <span dir="ltr" className="font-mono">{line.qty}</span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Money sar={line.unit} className="text-body" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Parts Used */}
      {parts.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
            {t('Parts Used')}
          </h4>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface">
                <Th align="start">#</Th>
                <Th align="start">{t('Part')}</Th>
                <Th align="start">{t('Code')}</Th>
                <Th align="end">{t('Qty')}</Th>
                <Th align="end">{t('Unit Price')}</Th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part, index) => (
                <tr key={part._id ?? `p-${index}`} className="border-b border-border">
                  <td className="px-3 py-2 text-xs text-muted">{index + 1}</td>
                  <td className="px-3 py-2 text-heading">
                    {rtl && part.ar ? part.ar : part.desc}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-muted" dir="ltr">
                      {part.part || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <span dir="ltr" className="font-mono">{part.qty}</span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Money sar={part.unit} className="text-body" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost Summary */}
      {invoice && (
        <div className="mt-4 flex justify-end">
          <div className="w-72 space-y-1.5">
            <TotalRow label={t('Subtotal')} amount={(invoice.subtotalHalalas ?? 0) / 100} />
            <TotalRow label={`${t('VAT')} (15%)`} amount={(invoice.taxHalalas ?? 0) / 100} />
            <div className="flex justify-between border-t-2 border-salis-navy pt-2 text-base font-bold text-salis-navy">
              <span>{t('Total Cost')}</span>
              <Money sar={(invoice.totalHalalas ?? 0) / 100} className="font-bold" />
            </div>
          </div>
        </div>
      )}

      {/* Time Tracking placeholder */}
      <div className="mt-6">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
          {t('Time Tracking')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <TimeField label={t('Check-In')} />
          <TimeField label={t('Work Start')} />
          <TimeField label={t('Work Complete')} />
        </div>
      </div>
    </PrintLayout>
  )
}

function TimeField({ label }: { label: string }) {
  return (
    <div className="rounded border border-border bg-surface p-2.5">
      <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm text-body">__:__ __</p>
    </div>
  )
}

function Th({
  children,
  align,
  className = '',
}: {
  children: React.ReactNode
  align: 'start' | 'end'
  className?: string
}) {
  return (
    <th
      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted ${
        align === 'end' ? 'text-end' : 'text-start'
      } ${className}`}
    >
      {children}
    </th>
  )
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-sm text-body">
      <span>{label}</span>
      <Money sar={amount} className="text-body" />
    </div>
  )
}
