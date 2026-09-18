import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '@/components/ui/BackLink'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Money, SummaryRow, parseSar } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { EmptyState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, useUpdate, type RowOf } from '@/data/useCollection'
import { RepositoryError, type DeliverySignoffChecklist } from '@/data/repository'
import { useAuthenticatedMediaUrl } from '@/data/useAuthenticatedMedia'
import { StageNotice, stageBusy } from './StageNotice'
import { useJobStage } from './useJobStage'

type ChecklistKey = 'customerNotified' | 'keysReturned' | 'documentsReady' | 'invoiceAttached' | 'cleaned' | 'qualityCheck'

const DELIVERY_CHECKS: readonly (ChecklistItem & { key: ChecklistKey })[] = [
  { icon: 'Bell', label: 'Customer Notified', key: 'customerNotified' },
  { icon: 'Key', label: 'Keys Returned', key: 'keysReturned' },
  { icon: 'FileText', label: 'Documents Ready', key: 'documentsReady' },
  { icon: 'Receipt', label: 'Invoice Attached', key: 'invoiceAttached' },
  { icon: 'Sparkles', label: 'Cleaned', key: 'cleaned' },
  { icon: 'Eye', label: 'Quality Check', key: 'qualityCheck' },
]

/** The live invoice row carries the VAT split the server computed from its
 *  lines (F-029); the fixture row carries only the pre-formatted `amount`. */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  taxHalalas?: number
  totalHalalas?: number
}

type Signoff = RowOf<'deliverySignoffs'>

/** Stage 6 — hand the vehicle back and close the job (Sprint 2, P0 backlog
 *  item 4).
 *
 *  The invoice summary is the real invoice raised for this job card —
 *  `invoices` filtered by `jobCardId`, its lines split into parts and labour
 *  the same way `WorkshopQC` reads them. The checklist and the odometer
 *  reading are now real too: both are held here as local state while the
 *  advisor is working through them, then persisted onto the
 *  `deliverySignoffs` row `WorkshopSignature.tsx` created — the same row the
 *  signature image lives on — through the generic collection's `PATCH`, the
 *  moment before the stage actually advances. Completing delivery without a
 *  captured signature is refused outright: a hand-off record with no
 *  signature on it isn't one. */
export function WorkshopDelivery() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const stage = useJobStage()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [odometerOut, setOdometerOut] = useState('')
  const [completing, setCompleting] = useState(false)
  const updateSignoff = useUpdate('deliverySignoffs')

  const jobCardId = stage.job?._id ?? ''
  const signoffs = useCollection('deliverySignoffs', { filter: { jobCardId } })
  const signoff = ((signoffs.data ?? []) as readonly Signoff[])[0]
  const { src: signatureSrc } = useAuthenticatedMediaUrl(signoff?.url)

  /* Pre-fill from whatever was already saved on the sign-off row (e.g. a
   * reload mid-checklist), without fighting the advisor's own edits once
   * they start ticking boxes. */
  useEffect(() => {
    if (!signoff) return
    setChecked((prev) =>
      Object.keys(prev).length > 0
        ? prev
        : Object.fromEntries(DELIVERY_CHECKS.map((c) => [c.label, Boolean(signoff.checklist?.[c.key])]))
    )
    setOdometerOut((prev) => (prev ? prev : signoff.odometerOut != null ? String(signoff.odometerOut) : ''))
  }, [signoff])

  const invoices = useCollection('invoices', { filter: { jobCardId } })
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
    if (!signoff?._id) {
      toast.show({
        title: t('Signature required'),
        description: t('Capture the customer’s signature before completing delivery.'),
        error: true,
      })
      return
    }
    const odometerValue = odometerOut.trim() ? Number(odometerOut.trim()) : null
    if (odometerOut.trim() && (!Number.isInteger(odometerValue) || odometerValue! < 0)) {
      toast.show({
        title: t('Invalid odometer reading'),
        description: t('Enter a whole number of kilometres.'),
        error: true,
      })
      return
    }

    const checklist = {} as DeliverySignoffChecklist
    for (const c of DELIVERY_CHECKS) checklist[c.key] = Boolean(checked[c.label])

    setCompleting(true)
    try {
      await updateSignoff.mutateAsync({
        id: signoff._id,
        patch: { checklist, odometerOut: odometerValue },
      })
    } catch (cause) {
      const message = cause instanceof RepositoryError ? cause.message : t('The checklist could not be saved.')
      toast.show({ title: t('Could not save'), description: message, error: true })
      setCompleting(false)
      return
    }
    setCompleting(false)

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
        <div className="flex flex-col gap-5">
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

          <Panel icon="PenTool" title={t('Customer Signature')}>
            {signoffs.isLoading ? (
              <Loading label={t('Loading signature...')} />
            ) : !signoff ? (
              <EmptyState
                icon="PenTool"
                title={t('No signature captured yet')}
                description={t('The customer needs to sign before delivery can be completed.')}
                action={
                  <Button
                    size="sm"
                    onClick={() => navigate(`/workshop-signature?id=${encodeURIComponent(stage.job?.id ?? '')}`)}
                  >
                    {t('Capture Signature')}
                  </Button>
                }
              />
            ) : (
              <div className="flex items-center gap-3">
                {signatureSrc ? (
                  <img
                    src={signatureSrc}
                    alt={t('Customer signature')}
                    className="h-[54px] w-[100px] flex-shrink-0 rounded border border-border bg-inset object-contain"
                  />
                ) : null}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold text-heading">{signoff.signedByName}</span>
                  <span className="text-[11px] text-muted" dir="ltr">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                    }).format(new Date(signoff.agreedAt))}
                  </span>
                </div>
              </div>
            )}
          </Panel>
        </div>

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

          <Panel icon="Gauge" title={t('Odometer at Delivery')}>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="odometer-out"
                className="font-action text-[11px] font-medium text-heading"
              >
                {t('Reading (km)')}
              </label>
              <Input
                id="odometer-out"
                value={odometerOut}
                onChange={(e) => setOdometerOut(e.target.value)}
                dir="ltr"
                inputMode="numeric"
                inputSize="sm"
                className="font-mono"
                placeholder="0"
              />
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" size="lg" className="border-border-strong text-body" onClick={() => window.print()}>
          <Icon name="Printer" size={16} />
          {t('Print Delivery Note')}
        </Button>
        <Button size="lg" onClick={() => void completeDelivery()} disabled={stageBusy(stage) || completing}>
          <Icon name="CheckCircle" size={16} />
          {completing || stage.status === 'saving' ? t('Saving...') : t('Complete Delivery')}
        </Button>
      </div>
    </div>
  )
}
