import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useDateFormat } from '@/lib/formatDate'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { formatSar } from '@/components/ui/Money'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { StageFrame } from './StageFrame'
import { useJobStage } from './useJobStage'

type InvoiceRow = RowOf<'invoices'> & { _id?: string; totalHalalas?: number }

/** Customer e-signature on handover.
 *
 *  The design showed a "tap to sign" placeholder; this captures an actual
 *  signature on a canvas, because a handover record with no signature in it
 *  isn't a handover record. Strokes are kept as paths so the result can be
 *  serialised and stored once file storage exists (README §10).
 *
 *  The summary is the job card's own: the code, the customer, the vehicle
 *  and the invoiced total when there is one. The prototype printed one
 *  customer's name and one figure for every card, which is the fabrication
 *  this rebuild removes. Clearing a signature asks first and can be undone
 *  from the toast, because a customer who has just signed on a tablet does
 *  not want to do it twice over a slipped thumb. */
export function WorkshopSignature() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const { confirm } = useModal()
  const navigate = useNavigate()
  const { dateTime } = useDateFormat()
  const stage = useJobStage()
  const job = stage.job
  const invoices = useCollection('invoices', { filter: { jobCardId: job?._id ?? '' } })
  const invoice = invoices.data?.[0] as InvoiceRow | undefined

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreed, setAgreed] = useState(false)

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

  async function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const agreedToClear = await confirm({
      title: 'Clear the signature?',
      description: 'The customer will need to sign again. You can undo this from the notice that follows.',
      icon: 'Eraser',
      confirmLabel: 'Clear',
      destructive: true,
    })
    if (!agreedToClear) return
    const snapshot = context.getImageData(0, 0, canvas.width, canvas.height)
    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    toast.show({
      title: t('Signature cleared'),
      undo: () => {
        context.putImageData(snapshot, 0, 0)
        setHasSignature(true)
      },
    })
  }

  const ready = hasSignature && agreed && Boolean(job)

  function confirmSignature() {
    if (!ready || !job) return
    toast.show({ title: t('Signature captured'), description: t('Ready for Delivery') })
    navigate(`/workshop-delivery?id=${encodeURIComponent(job.id)}`)
  }

  return (
    <StageFrame
      icon="PenTool"
      title="Customer Signature"
      stage={stage}
      className="max-w-[900px]"
      actions={
        <Button size="lg" icon="CheckCircle" onClick={confirmSignature} disabled={!ready}>
          {t('Confirm Signature')}
        </Button>
      }
    >
      <Panel icon="FileText" title={t('Job Summary')}>
        <FieldGrid>
          <ReadField label={t('Job Card')} value={job?.id ?? '—'} code emphasis />
          <ReadField label={t('Customer')} value={job?.cust ?? '—'} emphasis />
          <ReadField label={t('Vehicle')} value={job?.veh ?? '—'} />
          <ReadField label={t('Service')} value={job ? t(job.svc.replace(/_/g, ' ')) : '—'} />
          <ReadField
            label={t('Total Amount')}
            value={invoice?.totalHalalas != null ? formatSar(invoice.totalHalalas / 100) : t('Not invoiced yet')}
            code={invoice?.totalHalalas != null}
            emphasis
          />
          <ReadField label={t('Date & Time')} value={job?._createdAt ? dateTime(job._createdAt) : '—'} code />
        </FieldGrid>
      </Panel>

      <Card className="flex flex-col gap-3.5 rounded-lg p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-heading">{t('Sign Below')}</h2>
          <Button
            variant="outline"
            size="sm"
            icon="Eraser"
            onClick={() => void clear()}
            disabled={!hasSignature}
            className="border-border text-muted hover:border-salis-orange hover:bg-transparent hover:text-salis-orange"
          >
            {t('Clear')}
          </Button>
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

        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
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
    </StageFrame>
  )
}
