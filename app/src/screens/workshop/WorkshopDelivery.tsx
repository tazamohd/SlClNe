import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { EmptyState } from '@/components/ui/States'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { StageFrame } from './StageFrame'
import { stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'

const DELIVERY_CHECKS: ChecklistItem[] = [
  { icon: 'Bell', label: 'Customer Notified' },
  { icon: 'Key', label: 'Keys Returned' },
  { icon: 'FileText', label: 'Documents Ready' },
  { icon: 'Receipt', label: 'Invoice Attached' },
  { icon: 'Sparkles', label: 'Cleaned' },
  { icon: 'Eye', label: 'Quality Check' },
]

type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  subtotalHalalas?: number
  taxHalalas?: number
  totalHalalas?: number
}

/** Stage 6 — hand the vehicle back and close the job.
 *
 *  Odometer readings bracket the visit: what came in (the vehicle record's
 *  mileage), what goes out (typed here). The difference is the workshop's
 *  own mileage on the vehicle, which is what a customer queries, so the
 *  reading travels with the transition as its reason.
 *
 *  Completing delivery is `POST /jobs/:id/transition` to `invoiced` — the
 *  contract's only move out of `delivery`. The invoice summary is the job's
 *  real invoice, or says there is none; the prototype's fixed parts/labour
 *  split was the same two numbers for every card. */
export function WorkshopDelivery() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const stage = useJobStage()
  const job = stage.job
  const vehicles = useCollection('vehicles')
  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as InvoiceRow | undefined
  const vehicle = (vehicles.data ?? []).find((row) => row.make === job?.veh && row.owner === job?.cust)

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [odometerOut, setOdometerOut] = useState('')

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
    const reason = [
      `delivered ${done}/${DELIVERY_CHECKS.length}`,
      odometerOut.trim() ? `odometer out ${odometerOut.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' · ')
    const moved = await stage.advance('invoiced', { reason })
    if (moved) navigate('/job-cards')
  }

  return (
    <StageFrame
      icon="Car"
      title="Vehicle Delivery"
      stage={stage}
      actions={
        <>
          <Button variant="outline" size="lg" icon="Printer" className="border-border-strong text-body" onClick={() => window.print()}>
            {t('Print Delivery Note')}
          </Button>
          <Button
            size="lg"
            icon="CheckCircle"
            loading={stage.status === 'saving'}
            loadingLabel="Saving..."
            disabled={stageBusy(stage)}
            onClick={() => void completeDelivery()}
          >
            {t('Complete Delivery')}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          icon="ListChecks"
          title={t('Delivery Checklist')}
          action={
            <span className="font-mono text-[11px] font-semibold text-muted" dir="ltr">
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
            {invoice ? (
              <div className="flex flex-col gap-2">
                <SummaryRow label={t('Subtotal')} halalas={invoice.subtotalHalalas} />
                <SummaryRow label={t('VAT (15%)')} halalas={invoice.taxHalalas} />
                <div className="flex justify-between border-t border-border pt-2 text-lg font-extrabold text-heading">
                  <span>{t('Grand Total')}</span>
                  <Money sar={(invoice.totalHalalas ?? 0) / 100} className="font-extrabold" />
                </div>
                <p className="text-[11px] text-muted">
                  {t('Invoice')} <span dir="ltr" className="font-mono">{invoice.id}</span> · {t(invoice.status)}
                </p>
              </div>
            ) : (
              <EmptyState
                icon="Receipt"
                title={t('Not invoiced yet')}
                description={t('Totals appear once this job card is invoiced.')}
              />
            )}
          </Panel>

          <Panel icon="Gauge" title={t('Final Odometer')}>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[11px] text-muted">{t('Check-In')}</span>
                <span className="font-mono text-base font-bold text-heading" dir="ltr">
                  {vehicle?.mileage ?? '—'}
                </span>
              </div>
              <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} className="text-muted" />
              <div className="flex flex-1 flex-col gap-0.5">
                <label htmlFor="odometer-out" className="text-[11px] text-muted">
                  {t('Delivery')}
                </label>
                <Input
                  id="odometer-out"
                  value={odometerOut}
                  onChange={(e) => setOdometerOut(e.target.value)}
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="km"
                  className="font-mono"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </StageFrame>
  )
}
