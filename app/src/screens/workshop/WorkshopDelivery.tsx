import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '@/components/ui/BackLink'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

const DELIVERY_CHECKS: ChecklistItem[] = [
  { icon: 'Bell', label: 'Customer Notified' },
  { icon: 'Key', label: 'Keys Returned' },
  { icon: 'FileText', label: 'Documents Ready' },
  { icon: 'Receipt', label: 'Invoice Attached' },
  { icon: 'Sparkles', label: 'Cleaned' },
  { icon: 'Eye', label: 'Quality Check' },
]

const PARTS_SAR = 590
const LABOUR_SAR = 755
const VAT_RATE = 0.15

/** Stage 6 — hand the vehicle back and close the job.
 *
 *  Odometer readings bracket the visit: what came in, what goes out. The
 *  difference is the workshop's own mileage on the vehicle, which is what a
 *  customer queries. */
export function WorkshopDelivery() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const done = countChecked(DELIVERY_CHECKS, checked)
  const complete = done === DELIVERY_CHECKS.length

  const vat = (PARTS_SAR + LABOUR_SAR) * VAT_RATE
  const grandTotal = PARTS_SAR + LABOUR_SAR + vat

  function completeDelivery() {
    if (!complete) {
      toast.show({
        title: t('Incomplete checklist'),
        description: `${done}/${DELIVERY_CHECKS.length} ${t('checks recorded')}`,
        error: true,
      })
      return
    }
    toast.show({ title: t('Delivered'), description: t('Job card closed') })
    setTimeout(() => navigate('/job-cards'), 700)
  }

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <BackLink to="/job-cards" label="Back to Job Cards" />

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
          <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Car" size={isMobile ? 20 : 28} />
          </div>
        </div>
        <div>
          <h1 className={isMobile ? 'font-display text-xl font-black text-heading' : 'font-display text-[26px] font-black text-heading'}>
            {t('Vehicle Delivery')}
          </h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            JC-A3F8B2C1 · Ahmed Al-Rashid
          </p>
        </div>
      </div>

      <WorkflowStepper current="Delivery" />

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
            <div className="flex flex-col gap-2">
              <SummaryRow label={t('Parts')} sar={PARTS_SAR} />
              <SummaryRow label={t('Labor')} sar={LABOUR_SAR} />
              <SummaryRow label={t('VAT (15%)')} sar={vat} />
              <div className="flex justify-between border-t border-border pt-2 text-lg font-extrabold text-heading">
                <span>{t('Grand Total')}</span>
                <Money sar={grandTotal} className="font-extrabold" />
              </div>
            </div>
          </Panel>

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
        <Button size="lg" onClick={completeDelivery}>
          <Icon name="CheckCircle" size={16} />
          {t('Complete Delivery')}
        </Button>
      </div>
    </div>
  )
}

