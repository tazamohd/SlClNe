import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Panel, FieldGrid, ReadField } from '@/components/ui/FieldGrid'
import { formatSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

const TOTAL_SAR = 1546.75

/** Customer e-signature on handover.
 *
 *  The design showed a "tap to sign" placeholder; this captures an actual
 *  signature on a canvas, because a handover record with no signature in it
 *  isn't a handover record. Strokes are kept as paths so the result can be
 *  serialised and stored once file storage exists (README §10). */
export function WorkshopSignature() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
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
    context.strokeStyle = '#0A5ED7'
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

  const ready = hasSignature && agreed

  function confirm() {
    if (!ready) return
    toast.show({ title: t('Signature captured'), description: t('Ready for Delivery') })
    setTimeout(() => navigate('/workshop-delivery'), 700)
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-6">
      <div>
        <Link
          to="/job-cards"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Back to Job Cards')}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
          <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="PenTool" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">
            {t('Customer Signature')}
          </h1>
          <p className="mt-0.5 text-sm text-muted" dir="ltr">
            JC-A3F8B2C1 · Ahmed Al-Rashid
          </p>
        </div>
      </div>

      <Panel icon="FileText" title={t('Job Summary')}>
        <FieldGrid>
          <ReadField label={t('Job Card')} value="JC-A3F8B2C1" code emphasis />
          <ReadField label={t('Customer')} value="Ahmed Al-Rashid" emphasis />
          <ReadField label={t('Vehicle')} value="Toyota Camry 2022" />
          <ReadField label={t('Service')} value={`${t('Maintenance')} · ${t('Repair')}`} />
          <ReadField label={t('Total Amount')} value={formatSar(TOTAL_SAR)} code emphasis />
          <ReadField label={t('Date & Time')} value="Jul 22, 2026 · 2:45 PM" />
        </FieldGrid>
      </Panel>

      <Card className="flex flex-col gap-3.5 rounded-lg p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-heading">{t('Sign Below')}</h3>
          <button
            type="button"
            onClick={clear}
            disabled={!hasSignature}
            className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded-md border border-border bg-transparent px-3 font-action text-xs text-muted transition-colors hover:border-salis-orange hover:text-salis-orange disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="Eraser" size={13} />
            {t('Clear')}
          </button>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={220}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            aria-label={t('Sign Below')}
            className="h-[220px] w-full touch-none rounded border-[1.5px] border-dashed border-border-strong bg-inset"
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

      <Button size="lg" className="self-end" onClick={confirm} disabled={!ready}>
        <Icon name="CheckCircle" size={18} />
        {t('Confirm Signature')}
      </Button>
    </div>
  )
}
