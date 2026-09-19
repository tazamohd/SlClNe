import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '@/components/ui/BackLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { formatSar, parseSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { RepositoryError } from '@/data/repository'
import { uploadDeliverySignature } from './delivery-api'
import { useJobStage } from './useJobStage'
import { StageNotice } from './StageNotice'

/** The live invoice row carries the total the server computed (F-029); the
 *  fixture row carries only the pre-formatted `amount`. */
type Invoice = RowOf<'invoices'> & { _id?: string; totalHalalas?: number }

/** Customer e-signature on handover (Sprint 2, P0 backlog item 4).
 *
 *  The design showed a "tap to sign" placeholder; this captures an actual
 *  signature on a canvas and uploads it as a real PNG through
 *  `POST /job-cards/:id/delivery-signoff` — a handover record with no
 *  signature in it isn't a handover record. A second signature for the same
 *  job is refused by the server (already captured), which this screen
 *  treats as success rather than an error: the record exists either way, so
 *  the customer moves on to `WorkshopDelivery` exactly as if this were the
 *  first submission. The job summary above it is real: the job card,
 *  customer, vehicle and service come from `jobs`, and the total from the
 *  invoice raised for this job card, same as `WorkshopDelivery` reads it. */
export function WorkshopSignature() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const stage = useJobStage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const invoices = useCollection('invoices', { filter: { jobCardId: stage.job?._id ?? '' } })
  const invoice = ((invoices.data ?? []) as readonly Invoice[])[0]
  const totalSar = invoice
    ? invoice.totalHalalas != null
      ? invoice.totalHalalas / 100
      : parseSar(invoice.amount)
    : null
  const signedAt = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date())

  function pointFrom(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext('2d')
    const point = pointFrom(event)
    if (!context || !point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    context.strokeStyle = getComputedStyle(canvasRef.current!).getPropertyValue('--salis-blue').trim() || 'var(--salis-blue)'
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const context = canvasRef.current?.getContext('2d')
    const point = pointFrom(event)
    if (!context || !point) return
    context.lineTo(point.x, point.y)
    context.stroke()
    setHasSignature(true)
  }

  function end() {
    drawing.current = false
  }

  function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const ready = hasSignature && agreed && !submitting

  function canvasToPng(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas) {
        resolve(null)
        return
      }
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  async function confirm() {
    if (!ready || !stage.job) return
    const jobId = stage.job.id
    setSubmitting(true)
    try {
      const blob = await canvasToPng()
      if (!blob) throw new Error('Could not read the signature canvas.')
      await uploadDeliverySignature(jobId, blob)
      toast.show({ title: t('Signature captured'), description: t('Ready for Delivery') })
      navigate(`/workshop-delivery?id=${encodeURIComponent(jobId)}`)
    } catch (cause) {
      if (cause instanceof RepositoryError && cause.code === 'conflict') {
        /* A signature already exists for this job — the record is there
         * either way, so this is not a failure from the customer's side. */
        toast.show({ title: t('Signature captured'), description: t('Ready for Delivery') })
        navigate(`/workshop-delivery?id=${encodeURIComponent(jobId)}`)
        return
      }
      const message = cause instanceof RepositoryError ? cause.message : t('The signature could not be saved.')
      toast.show({ title: t('Signature not saved'), description: message, error: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <BackLink to="/job-cards" label="Back to Job Cards" />

      <PageHeader
        icon="PenTool"
        title={t('Customer Signature')}
        subtitle={<span dir="ltr">{stage.job ? `${stage.job.id} · ${stage.job.cust}` : '—'}</span>}
        compact={isMobile}
      />

      <StageNotice stage={stage} />

      <Panel icon="FileText" title={t('Job Summary')}>
        <FieldGrid>
          <ReadField label={t('Job Card')} value={stage.job?.id ?? '—'} code emphasis />
          <ReadField label={t('Customer')} value={stage.job?.cust ?? '—'} emphasis />
          <ReadField label={t('Vehicle')} value={stage.job?.veh ?? '—'} />
          <ReadField label={t('Service')} value={stage.job?.svc ?? '—'} />
          <ReadField
            label={t('Total Amount')}
            value={totalSar != null ? formatSar(totalSar) : t('No invoice yet')}
            code emphasis
          />
          <ReadField label={t('Date & Time')} value={signedAt} />
        </FieldGrid>
      </Panel>

      <Card className="flex flex-col gap-3.5 rounded-lg p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-heading">{t('Sign Below')}</h2>
          <button
            type="button"
            onClick={clear}
            disabled={!hasSignature}
            className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded-md border border-border bg-transparent px-3 font-action text-xs text-muted transition-colors hover:border-salis-orange hover:text-salis-orange disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <Icon name="Eraser" size={13} />
            {t('Clear')}
          </button>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={isMobile ? 400 : 800}
            height={isMobile ? 160 : 220}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            aria-label={t('Sign Below')}
            className={`${isMobile ? 'h-[160px]' : 'h-[220px]'} w-full touch-none rounded border-[1.5px] border-dashed border-border-strong bg-inset`}
          />
          {hasSignature ? null : (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
              <Icon name="PenTool" size={24} />
              <span className="text-[13px]">{t('Tap to sign')}</span>
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed((v) => !v)}
            className="sr-only"
          />
          <span
            aria-hidden
            className={cn(
              'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] transition-all duration-150',
              agreed
                ? 'border-none bg-salis-gradient text-white'
                : 'border-[1.5px] border-border-strong bg-inset text-transparent'
            )}
          >
            <Icon name="Check" size={12} strokeWidth={3} />
          </span>
          <span className="text-[13px] text-body">
            {t('I authorize the work described above and accept the total amount.')}
          </span>
        </label>
      </Card>

      <Button size="lg" className="self-end" onClick={() => void confirm()} disabled={!ready}>
        <Icon name="CheckCircle" size={18} />
        {submitting ? t('Saving...') : t('Confirm Signature')}
      </Button>
    </div>
  )
}
