import { useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { CodeInput } from '@/components/ui/CodeInput'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** VAT rate for KSA (ZATCA). */
const VAT_RATE = 0.15

/** The code the "Enter demo code" shortcut fills in — the design's demo
 *  mechanic, kept until the SMS gateway exists (README §10). */
const DEMO_CODE = '4813'

type ApprovalLine = RowOf<'approvalLines'>

/** Urgency pill treatments. Orange = critical, bright blue = due, slate =
 *  advisory — the design's exact mapping, and palette-legal (README §7). */
const URGENCY: Record<string, { label: string; pill: string }> = {
  critical: { label: 'Critical', pill: 'bg-[rgba(249,115,22,.13)] text-salis-orange' },
  due: { label: 'Due now', pill: 'bg-[rgba(11,179,255,.13)] text-salis-bright' },
  advisory: { label: 'Advisory', pill: 'bg-[rgba(100,116,139,.13)] text-muted' },
}

/** The customer-facing approval page for an estimate ("secure link").
 *
 *  The customer reviews the found work line by line, unticks anything they
 *  want to defer, signs, confirms a 4-digit OTP, and only then can approve —
 *  the three gates the design encodes in its Review → Sign → Confirm stepper.
 *
 *  Two deliberate departures from the prototype:
 *  - The signature is captured on a real canvas (as `WorkshopSignature`
 *    already does) instead of a click-to-stamp cursive placeholder, and the
 *    stamp records the time only — the prototype showed a hardcoded client IP,
 *    which a browser cannot actually know about itself.
 *  - The OTP boxes are real inputs with focus management and paste support
 *    (shared `CodeInput`), not display-only spans; the design's demo-fill
 *    button remains for when no code has been typed. */
export function CustomerApproval() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const { data: lines = [], isLoading } = useCollection('approvalLines')

  /** Deselected line ids — a line is approved unless it's here. */
  const [off, setOff] = useState<readonly number[]>([])
  const [signed, setSigned] = useState(false)
  const [stamp, setStamp] = useState('')
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const stroked = useRef(false)

  const isOn = (line: ApprovalLine) => !off.includes(line.id)
  const chosen = lines.filter(isOn)
  const subtotal = chosen.reduce((sum, line) => sum + line.qty * line.unit, 0)
  const deferred = lines
    .filter((line) => !isOn(line))
    .reduce((sum, line) => sum + line.qty * line.unit, 0)
  const vat = subtotal * VAT_RATE
  const grandTotal = subtotal + vat

  const ready = signed && verified && chosen.length > 0
  const blockReason = !signed
    ? t('Sign above to enable approval')
    : !verified
      ? t('Verify the code sent to your phone')
      : chosen.length === 0
        ? t('Select at least one line to approve')
        : ''

  const steps = [
    { label: t('Review'), done: true },
    { label: t('Sign'), done: signed },
    { label: t('Confirm'), done: ready },
  ]

  // --- signature canvas (same capture approach as WorkshopSignature) ---

  function pointFrom(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function startStroke(event: React.PointerEvent<HTMLCanvasElement>) {
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

  function moveStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const context = canvasRef.current?.getContext('2d')
    const point = pointFrom(event)
    if (!context || !point) return
    context.lineTo(point.x, point.y)
    context.stroke()
    stroked.current = true
  }

  function endStroke() {
    if (!drawing.current) return
    drawing.current = false
    if (!signed && stroked.current) {
      setSigned(true)
      setStamp(new Date().toISOString().slice(0, 16).replace('T', ' '))
      toast.show({
        title: t('Signature captured'),
        description: t('Now confirm the code sent to your phone.'),
      })
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    stroked.current = false
    setSigned(false)
    setStamp('')
  }

  // --- OTP ---

  function handleOtp() {
    if (verified) {
      setVerified(false)
      setCode('')
      return
    }
    if (code.length < 4) setCode(DEMO_CODE)
    setVerified(true)
    toast.show({ title: t('Code verified'), description: t('You can now approve the work.') })
  }

  // --- decisions ---

  function approve() {
    if (!ready) return
    toast.show({
      title: t('Work approved'),
      description: t(
        'Job card unblocked to Repair. Parts reserved and a signed PDF is on its way to you.'
      ),
    })
  }

  function requestChange() {
    toast.show({
      title: t('Change requested'),
      description: t('Noura will call you and issue a revised estimate. Version history is kept.'),
    })
  }

  function decline() {
    toast.show({
      title: t('Estimate declined'),
      description: t('Your vehicle is scheduled for collection. Nothing has been charged.'),
      error: true,
    })
  }

  return (
    <div className="flex max-w-[1180px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">
            {t('Customer Approval')}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {t('Riyadh Main')} · {t('Service Advisor')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-1 font-action text-[11px] font-semibold text-salis-blue">
          <Icon name="ShieldCheck" size={12} />
          {t('Secure link')}
        </span>
      </div>

      {/* Review → Sign → Confirm progress rail */}
      <div className="flex items-center gap-2.5">
        {steps.map((step) => (
          <div key={step.label} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div
              className={cn('h-1 rounded-full', step.done ? 'bg-salis-gradient' : 'bg-border')}
            />
            <div
              className={cn(
                'flex items-center gap-1.5',
                step.done ? 'text-salis-blue' : 'text-muted'
              )}
            >
              {step.done ? (
                <CheckCircle2 size={12} className="flex-shrink-0" aria-hidden />
              ) : (
                <Icon name="Circle" size={12} className="flex-shrink-0" />
              )}
              <span className="truncate font-action text-[11px] font-semibold">{step.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Estimate header */}
      <Card className="flex flex-wrap items-start gap-4 p-4 sm:px-5">
        <div className="min-w-[180px] flex-1">
          <HeaderLabel>{t('Estimate')}</HeaderLabel>
          <p
            className="mt-1 font-display text-xl font-black tabular-nums text-heading"
            dir="ltr"
          >
            EST-2026-0418
          </p>
          <p className="mt-1 text-[12.5px] text-muted">
            {t('Valid until 28 Jul 2026')} ·{' '}
            <span className="font-semibold text-salis-orange">{t('41 hours left')}</span>
          </p>
        </div>
        <div className="min-w-[150px]">
          <HeaderLabel>{t('Vehicle')}</HeaderLabel>
          <p className="mt-1 text-sm font-bold text-heading">Toyota Camry 2021</p>
          <p className="mt-0.5 font-mono text-[12.5px] text-muted" dir="ltr">
            RUH 4821 · 58,420 km
          </p>
        </div>
        <div className="min-w-[150px]">
          <HeaderLabel>{t('Your advisor')}</HeaderLabel>
          <p className="mt-1 text-sm font-bold text-heading">{t('Noura Al-Qahtani')}</p>
          <p className="mt-0.5 font-mono text-[12.5px] text-muted" dir="ltr">
            +966 55 214 8890
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_minmax(290px,330px)]">
        {/* Left: lines + signature */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border px-4 py-3.5 sm:px-5">
              <div>
                <p className="font-display text-[15px] font-bold text-heading">
                  {t('What we found')}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {t('Untick anything you would rather defer to a later visit.')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOff([])}
                  className="h-10 cursor-pointer rounded-lg border border-border bg-card px-3 font-action text-[11.5px] font-semibold text-body transition-colors hover:border-salis-blue hover:text-salis-blue"
                >
                  {t('Select all')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOff(lines.filter((line) => line.urgency !== 'critical').map((l) => l.id))
                  }
                  className="h-10 cursor-pointer rounded-lg border border-border bg-card px-3 font-action text-[11.5px] font-semibold text-body transition-colors hover:border-salis-orange hover:text-salis-orange"
                >
                  {t('Critical only')}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div>
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className={cn('px-4 py-4 sm:px-5', index > 0 && 'border-t border-border')}
                  >
                    <span className="block h-4 w-2/3 animate-pulse rounded bg-inset" />
                    <span className="mt-2 block h-3 w-1/3 animate-pulse rounded bg-inset" />
                  </div>
                ))}
              </div>
            ) : lines.length === 0 ? (
              <div className="p-6">
                <EmptyState icon="FileQuestion" />
              </div>
            ) : (
              lines.map((line, index) => {
                const on = isOn(line)
                const urgency = URGENCY[line.urgency] ?? URGENCY.advisory
                const label = rtl ? line.ar : line.item
                const note = rtl ? line.ar_note : line.note
                return (
                  <div
                    key={line.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3.5 transition-opacity duration-150 sm:px-5',
                      index > 0 && 'border-t border-border',
                      !on && 'opacity-50'
                    )}
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={label}
                      onClick={() =>
                        setOff((prev) =>
                          prev.includes(line.id)
                            ? prev.filter((id) => id !== line.id)
                            : [...prev, line.id]
                        )
                      }
                      className={cn(
                        'mt-0.5 flex h-[19px] w-[19px] min-h-[44px] min-w-[44px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[5px] transition-all duration-150',
                        on
                          ? 'border-none bg-salis-gradient text-white'
                          : 'border-[1.5px] border-border-strong bg-inset text-transparent'
                      )}
                    >
                      <Icon name="Check" size={12} strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-heading">{label}</p>
                        <span
                          className={cn(
                            'rounded-full px-2 py-px font-action text-[10px] font-semibold',
                            urgency.pill
                          )}
                        >
                          {t(urgency.label)}
                        </span>
                        {line.kind === 'labour' ? (
                          <span className="rounded-full bg-[rgba(100,116,139,.14)] px-1.5 py-px font-action text-[10px] font-semibold text-muted">
                            {t('Labour')}
                          </span>
                        ) : null}
                      </div>
                      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
                    </div>
                    <div className="flex-shrink-0 text-end">
                      <Money
                        sar={line.qty * line.unit}
                        className="text-[13.5px] font-bold text-heading"
                      />
                      <p className="mt-px text-[11px] tabular-nums text-muted" dir="ltr">
                        {line.qty} × {formatSar(line.unit)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </Card>

          {/* Signature */}
          <Card className="p-4 sm:p-5">
            <p className="font-display text-sm font-bold text-heading">{t('Your signature')}</p>
            <p className="mb-3 mt-2 text-[12.5px] leading-relaxed text-muted">
              {t(
                'Signing confirms you authorise the ticked work at the price shown. A signed PDF is emailed to you and attached to the job card.'
              )}
            </p>
            <div
              className={cn(
                'relative overflow-hidden rounded-lg border-[1.5px] border-dashed bg-inset',
                signed ? 'border-salis-blue' : 'border-border-strong'
              )}
            >
              <canvas
                ref={canvasRef}
                width={700}
                height={150}
                onPointerDown={startStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerLeave={endStroke}
                aria-label={t('Tap or click to sign')}
                className="block h-[150px] w-full cursor-crosshair touch-none"
              />
              {!signed ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
                  <Icon name="PenTool" size={24} className="opacity-50" />
                  <span className="text-[12.5px] font-medium">{t('Tap or click to sign')}</span>
                </div>
              ) : null}
              {stamp ? (
                <p
                  className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center font-mono text-[11px] text-muted"
                  dir="ltr"
                >
                  {stamp}
                </p>
              ) : null}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={clearSignature}
                disabled={!signed}
                className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 font-action text-[11.5px] font-semibold text-muted transition-colors hover:border-salis-orange hover:text-salis-orange disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="Eraser" size={12} />
                {t('Clear')}
              </button>
              <p className="flex items-center gap-1.5 text-[11px] text-muted">
                <Icon name="Lock" size={11} className="text-salis-blue" />
                {t('Legally binding e-signature')}
              </p>
            </div>
          </Card>
        </div>

        {/* Right: summary, OTP, decision */}
        <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-4">
          <Card className="p-4 shadow-lg sm:px-5">
            <p className="mb-3 font-display text-sm font-bold text-heading">{t('Summary')}</p>
            <div className="flex flex-col gap-2">
              <TotalRow label={t('Subtotal')} value={<Money sar={subtotal} />} />
              <TotalRow label={`${t('VAT')} 15%`} value={<Money sar={vat} />} />
              {deferred > 0 ? (
                <TotalRow
                  label={t('Deferred')}
                  value={
                    <span dir="ltr" className="font-mono">
                      − {formatSar(deferred)}
                    </span>
                  }
                />
              ) : null}
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2.5">
                <span className="text-[15px] font-extrabold text-heading">{t('Total due')}</span>
                <Money sar={grandTotal} className="text-[15px] font-extrabold text-salis-blue" />
              </div>
            </div>
            <div className="mt-3 flex gap-2 rounded-[10px] bg-[rgba(10,94,215,.06)] px-3 py-2.5">
              <Icon name="Info" size={13} className="mt-px flex-shrink-0 text-salis-blue" />
              <p className="text-[11.5px] leading-normal text-body">
                {t(
                  'Deferred items stay on your vehicle record and we will remind you at the next service.'
                )}
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:px-5">
            <p className="text-[13px] font-bold text-heading">{t("Confirm it's you")}</p>
            <p className="mb-3 mt-1 text-[11.5px] leading-normal text-muted">
              {t('We sent a 4-digit code to +966 55 ••• 8890.')}
            </p>
            {verified ? (
              <div className="flex gap-2" dir="ltr">
                {Array.from({ length: 4 }, (_, index) => (
                  <span
                    key={index}
                    className="flex h-10 flex-1 items-center justify-center rounded-lg border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.09)] font-mono text-[17px] font-bold tabular-nums text-salis-blue"
                  >
                    {code[index] ?? ''}
                  </span>
                ))}
              </div>
            ) : (
              <CodeInput value={code} onChange={setCode} length={4} />
            )}
            <button
              type="button"
              onClick={handleOtp}
              className="h-[34px] w-full cursor-pointer rounded-lg border border-border bg-card font-action text-xs font-semibold text-salis-blue transition-colors hover:bg-[rgba(10,94,215,.07)]"
            >
              {verified
                ? t('Use a different code')
                : code.length === 4
                  ? t('Verify')
                  : t('Enter demo code')}
            </button>
          </Card>

          <button
            type="button"
            onClick={approve}
            disabled={!ready}
            className={cn(
              'flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border-none font-action text-sm font-bold transition-all duration-200',
              ready
                ? 'cursor-pointer bg-salis-gradient text-white shadow-[0_4px_14px_rgba(10,94,215,.3)]'
                : 'cursor-not-allowed bg-inset text-muted'
            )}
          >
            {ready ? (
              <CheckCircle2 size={16} aria-hidden />
            ) : (
              <Icon name="Lock" size={16} />
            )}
            {ready ? (
              <span>
                {t('Approve')} ·{' '}
                <span dir="ltr" className="font-mono">
                  {formatSar(grandTotal)}
                </span>
              </span>
            ) : (
              t('Approve work')
            )}
          </button>
          <p className="min-h-[15px] text-center text-[11px] text-muted">{blockReason}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestChange}
              className="h-[38px] flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-border-strong bg-card font-action text-xs font-semibold text-body transition-colors hover:border-salis-blue hover:text-salis-blue"
            >
              {t('Request changes')}
            </button>
            <button
              type="button"
              onClick={decline}
              className="h-[38px] flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-[rgba(249,115,22,.4)] bg-card font-action text-xs font-semibold text-salis-orange transition-colors hover:bg-[rgba(249,115,22,.07)]"
            >
              {t('Decline')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
      {children}
    </p>
  )
}

function TotalRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <span className="font-medium text-muted">{label}</span>
      <span className="font-medium text-heading">{value}</span>
    </div>
  )
}
