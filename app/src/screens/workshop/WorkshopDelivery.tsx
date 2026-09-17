import { useState } from 'react'
import { BackLink } from '@/components/ui/BackLink'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Money, SummaryRow, parseSar } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { EmptyState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { StageNotice, stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'

const DELIVERY_CHECKS: ChecklistItem[] = [
  { icon: 'Bell', label: 'Customer Notified' },
  { icon: 'Key', label: 'Keys Returned' },
  { icon: 'FileText', label: 'Documents Ready' },
  { icon: 'Receipt', label: 'Invoice Attached' },
  { icon: 'Sparkles', label: 'Cleaned' },
  { icon: 'Eye', label: 'Quality Check' },
]

/** The live invoice row carries the VAT split the server computed from its
 *  lines (F-029); the fixture row carries only the pre-formatted `amount`. */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  taxHalalas?: number
  totalHalalas?: number
}

/** Stage 6 — hand the vehicle back and close the job.
 *
 *  The invoice summary is the real invoice raised for this job card —
 *  `invoices` filtered by `jobCardId`, its lines split into parts and labour
 *  the same way `WorkshopQC` reads them. The checklist and odometer readings
 *  have no backing field yet (no delivery-checklist or odometer column
 *  exists), so they stay local state, same as before. */
export function WorkshopDelivery() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const stage = useJobStage()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const invoices = useCollection('invoices', { filter: { jobCardId: stage.job?._id ?? '' } })
  const invoiceRows = (invoices.data ?? []) as readonly Invoice[]
  const invoice = invoiceRows[0]
  const lines = useCollection('invoiceLines', { filter: { invoiceId: invoice?._id ?? '' } })
  const lineRows = (lines.data ?? []) as readonly RowOf<'invoiceLines'>[]

  // `unit` is already SAR (`sarNumber(row.unitPriceHalalas)`), same field
  // WorkshopQC reads — a per-row total is a display-only `qty × unit`.
  const partsTotal = lineRows.filter((l) => l.kind !== 'labour').reduce((sum, l) => sum + l.qty * l.unit, 0)
  const labourTotal = lineRows.filter((l) => l.kind === 'labour').reduce((sum, l) => sum + l.qty * l.unit, 0)
  const vat = invoice?.taxHalalas != null ? invoice.taxHalalas / 100 : 0
  const grandTotal = invoice?.totalHalalas != null ? invoice.totalHalalas / 100 : invoice ? parseSar(invoice.amount) : 0
  const invoiceLoading = invoices.isLoading || (Boolean(invoice) && lines.isLoading)

  const done = countChecked(DELIVERY_CHECKS, checked)
  const complete = done === DELIVERY_CHECKS.length

  async function completeDelivery() {
    if (!complete) {
      toast.show({
        title: t('Incomplete checklist'),
        description: `${done}/${DELIVERY_CHECKS.length} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    await stage.advance('invoiced', {
      reason: 'vehicle delivered to customer',
      then: '/job-cards',
    })
  }

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <BackLink to="/job-cards" label="Back to Job Cards" />

      <PageHeader
        icon="Car"
        title={t('Vehicle Delivery')}
        subtitle={<span dir="ltr">{stage.job ? `${stage.job.id} · ${stage.job.veh}` : '—'}</span>}
        compact={isMobile}
      />

      <WorkflowStepper current={stage.stageLabel} />

      <StageNotice stage={stage} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          icon="ListChecks"
          title={t('Delivery Checklist')}
          action={
            <span className="font-mono text-[11px] font-semibold text-muted">
              {done}/{DELIVERY_CHECKS.length}
            </span>
          }
        >
          <Checklist
            items={DELIVERY_CHECKS}
            checked={checked}
            onToggle={(label) => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
          />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel icon="Receipt" title={t('Invoice Summary')}>
            {invoiceLoading ? (
              <Loading label={t('Loading invoice...')} />
            ) : !invoice ? (
              <EmptyState
                icon="ReceiptText"
                title={t('No invoice yet')}
                description={t('No invoice is linked to this job card yet.')}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <SummaryRow label={t('Parts')} sar={partsTotal} />
                <SummaryRow label={t('Labor')} sar={labourTotal} />
                <SummaryRow label={t('VAT (15%)')} sar={vat} />
                <div className="flex justify-between border-t border-border pt-2 text-lg font-extrabold text-heading">
                  <span>{t('Grand Total')}</span>
                  <Money sar={grandTotal} className="font-extrabold" />
                </div>
              </div>
            )}
          </Panel>

          {/* No odometer column exists on the job card yet, so these stay
              local rather than being read from a field that isn't there. */}
          <Panel icon="Gauge" title={t('Final Odometer')}>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[11px] text-muted">{t('Check-In')}</span>
                <span className="font-mono text-base font-bold text-heading" dir="ltr">
                  42,180 km
                </span>
              </div>
              <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} className="text-muted" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[11px] text-muted">{t('Delivery')}</span>
                <span className="font-mono text-base font-bold text-salis-blue" dir="ltr">
                  42,195 km
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" size="lg" className="border-border-strong text-body" onClick={() => window.print()}>
          <Icon name="Printer" size={16} />
          {t('Print Delivery Note')}
        </Button>
        <Button size="lg" onClick={() => void completeDelivery()} disabled={stageBusy(stage)}>
          <Icon name="CheckCircle" size={16} />
          {stage.status === 'saving' ? t('Saving...') : t('Complete Delivery')}
        </Button>
      </div>
    </div>
  )
}

