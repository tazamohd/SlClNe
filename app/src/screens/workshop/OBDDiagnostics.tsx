import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type ObdDevice = RowOf<'obdDevices'>
type DtcCode = RowOf<'dtcCodes'>

/** Connection status → pill / dot treatment. Blue is live (streaming), bright
 *  blue is idle, slate is offline — no green anywhere (README §7). */
const STATUS: Record<
  string,
  { label: string; pill: string; dot: string; pulse?: boolean }
> = {
  live: {
    label: 'Live',
    pill: 'bg-[rgba(10,94,215,.12)] text-salis-blue',
    dot: 'bg-salis-blue',
    pulse: true,
  },
  idle: {
    label: 'Idle',
    pill: 'bg-[rgba(11,179,255,.12)] text-salis-bright',
    dot: 'bg-salis-bright',
  },
  offline: {
    label: 'Offline',
    pill: 'bg-[rgba(100,116,139,.13)] text-muted',
    dot: 'bg-muted',
  },
}

/** DTC severity → icon tile. High is orange (the only warning colour), medium
 *  bright blue, low slate. Severity icons are imported directly from lucide —
 *  `AlertTriangle`/`AlertCircle` are alias names the generated registry
 *  doesn't carry, and the names are known at author time anyway. */
const SEVERITY: Record<string, { icon: LucideIcon; tile: string }> = {
  high: { icon: AlertTriangle, tile: 'bg-[rgba(249,115,22,.13)] text-salis-orange' },
  medium: { icon: AlertCircle, tile: 'bg-[rgba(11,179,255,.13)] text-salis-bright' },
  low: { icon: Info, tile: 'bg-[rgba(100,116,139,.13)] text-muted' },
}

/** Presentational shape of one live-parameter gauge. */
interface Pid {
  label: string
  value: string
  tone: 'blue' | 'bright' | 'orange'
  pct: number
}

const PID_TEXT: Record<Pid['tone'], string> = {
  blue: 'text-salis-blue',
  bright: 'text-salis-bright',
  orange: 'text-salis-orange',
}

const PID_BAR: Record<Pid['tone'], string> = {
  blue: 'bg-salis-blue',
  bright: 'bg-salis-bright',
  orange: 'bg-salis-orange',
}

/** Live OBD-II diagnostics — every scan tool plugged in across the workshop,
 *  the selected vehicle's live parameters, and its stored trouble codes.
 *
 *  Streamed values jitter on a 1.6s tick only while the selected device is
 *  `live`, exactly like the prototype. "Clear codes" and "Add to job" mutate
 *  the job card, so they're gated on `jobcards:e`; read-only roles still see
 *  the stream. */
export function OBDDiagnostics() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const navigate = useNavigate()

  const { data: devices = [], isLoading: devicesLoading } = useCollection('obdDevices')
  const { data: dtcCodes = [], isLoading: codesLoading } = useCollection('dtcCodes')
  const isLoading = devicesLoading || codesLoading

  const [pickedId, setPickedId] = useState<string | null>(null)
  const [cleared, setCleared] = useState(false)
  const [tick, setTick] = useState(0)

  const sel = devices.find((d) => d.id === pickedId) ?? devices[0]
  const streaming = sel?.status === 'live'

  // Live jitter only while the selected device is streaming.
  useEffect(() => {
    if (!streaming) return
    const interval = setInterval(() => setTick((prev) => prev + 1), 1600)
    return () => clearInterval(interval)
  }, [streaming])

  const canEdit = can('jobcards', 'e')
  const liveCount = devices.filter((d) => d.status === 'live').length
  const shownCodes: readonly DtcCode[] = !sel || cleared ? [] : dtcCodes.slice(0, sel.dtc)

  function pick(device: ObdDevice) {
    setPickedId(device.id)
    setCleared(false)
  }

  function rescan() {
    if (!sel) return
    setCleared(false)
    toast.show({
      title: t('Scan complete'),
      description: sel.dtc ? `${sel.dtc} ${t('codes found')}` : t('No codes stored'),
    })
  }

  function clearCodes() {
    setCleared(true)
    toast.show({
      title: t('Codes cleared'),
      description: t('Drive cycle required to confirm the repair.'),
    })
  }

  function addToJob(code: DtcCode) {
    toast.show({
      title: t('Added to job card'),
      description: `${code.code} · ${rtl ? code.ar : code.desc}`,
    })
  }

  const jitter = (base: number, amp: number) =>
    streaming && base > 0
      ? Math.max(0, Math.round((base + Math.sin(tick * 1.7 + base) * amp) * 10) / 10)
      : base

  const rpm = jitter(sel?.rpm ?? 0, 55)
  const coolant = jitter(sel?.coolant ?? 0, 1.5)
  const voltage = Math.round(jitter(sel?.voltage ?? 0, 0.15) * 10) / 10
  const load = jitter(sel?.load ?? 0, 3)

  const pids: readonly Pid[] = [
    { label: t('Engine RPM'), value: `${Math.round(rpm)}`, tone: 'blue', pct: rpm / 70 },
    {
      label: t('Coolant'),
      value: `${Math.round(coolant)} °C`,
      tone: coolant > 105 ? 'orange' : 'blue',
      pct: coolant,
    },
    {
      label: t('Battery'),
      value: `${voltage.toFixed(1)} V`,
      tone: voltage < 12 ? 'orange' : 'bright',
      pct: (voltage / 15) * 100,
    },
    { label: t('Engine load'), value: `${Math.round(load)} %`, tone: 'bright', pct: load },
  ]

  const selStatus = STATUS[sel?.status ?? 'offline'] ?? STATUS.offline

  return (
    <div className="flex max-w-[1320px] flex-col gap-6">
      <FeatureHeader
        icon="Activity"
        title={t('OBD-II Live Diagnostics')}
        subtitle={t('Connected scan tools across the workshop')}
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 self-center rounded-full bg-[rgba(10,94,215,.1)] px-3 py-1.5 font-action text-xs font-semibold text-salis-blue">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-salis-blue" aria-hidden />
              {liveCount} {t('streaming')}
            </span>
            <Button variant="subtle" size="md" onClick={() => navigate('/oemintegrations')}>
              <Icon name="Plug" size={14} />
              {t('OEM tools')}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : !sel ? (
        <Card className="p-6">
          <EmptyState
            icon="Bluetooth"
            title={t('No scan tools connected')}
            description={t('Plug the dongle into the OBD port and hold the pair button for 3 seconds.')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(240px,285px)_1fr]">
          {/* ── Scan-tool rail ──────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="font-action text-[11px] font-bold uppercase tracking-[.05em] text-muted">
              {t('Scan tools')}
            </p>
            {devices.map((device) => {
              const status = STATUS[device.status] ?? STATUS.offline
              const selected = device.id === sel.id
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => pick(device)}
                  aria-pressed={selected}
                  className={
                    'w-full cursor-pointer rounded-xl p-[11px_13px] text-start transition-all duration-150 ' +
                    (selected
                      ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.07)]'
                      : 'border border-border bg-card hover:border-[rgba(10,94,215,.35)]')
                  }
                >
                  <span className="flex w-full items-center gap-2.5">
                    <span
                      className={
                        'h-2 w-2 flex-shrink-0 rounded-full ' +
                        status.dot +
                        (status.pulse ? ' animate-pulse' : '')
                      }
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block truncate text-[12.5px] font-bold text-heading">
                        {device.vehicle}
                      </span>
                      <span className="mt-px block font-mono text-[11px] text-muted">
                        <span dir="ltr">{device.plate}</span> · {t(device.bay)}
                      </span>
                    </span>
                    {device.dtc > 0 ? (
                      <span className="flex h-[19px] min-w-[19px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(249,115,22,.15)] px-1.5 text-[10.5px] font-bold tabular-nums text-salis-orange">
                        {device.dtc}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
            <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(10,94,215,.28)] bg-[rgba(10,94,215,.05)] p-[12px_14px]">
              <Icon name="Bluetooth" size={14} className="mt-0.5 flex-shrink-0 text-salis-blue" />
              <div>
                <p className="text-xs font-semibold text-heading">{t('Pair a new tool')}</p>
                <p className="mt-0.5 text-[11px] leading-[1.45] text-muted">
                  {t('Plug the dongle into the OBD port and hold the pair button for 3 seconds.')}
                </p>
              </div>
            </div>
          </div>

          {/* ── Selected vehicle ────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="p-[16px_18px]">
              <div className="flex flex-wrap items-start justify-between gap-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-black text-heading">{sel.vehicle}</h2>
                    <span
                      className={
                        'rounded-full px-2.5 py-0.5 font-action text-[11px] font-semibold ' +
                        selStatus.pill
                      }
                    >
                      {t(selStatus.label)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[12.5px] text-muted">
                    <span dir="ltr">VIN {sel.vin}</span> · {t(sel.bay)} ·{' '}
                    <span dir="ltr">{sel.id}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="md" onClick={rescan}>
                    <Icon name="RefreshCw" size={13} />
                    {t('Re-scan')}
                  </Button>
                  {canEdit ? (
                    <Button
                      variant="outline"
                      size="md"
                      className="border-salis-orange/40 text-salis-orange hover:bg-[rgba(249,115,22,.07)]"
                      onClick={clearCodes}
                    >
                      {t('Clear codes')}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-2.5">
                {pids.map((pid) => (
                  <div key={pid.label} className="rounded-lg border border-border bg-inset p-[11px_13px]">
                    <p className="font-action text-[10px] font-semibold uppercase tracking-[.04em] text-muted">
                      {pid.label}
                    </p>
                    <p
                      dir="ltr"
                      className={
                        'mt-1 text-start font-display text-[19px] font-black leading-[1.1] tabular-nums ' +
                        PID_TEXT[pid.tone]
                      }
                    >
                      {pid.value}
                    </p>
                    <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-border">
                      <div
                        className={
                          'h-full rounded-full transition-[width] duration-700 ease-out ' +
                          PID_BAR[pid.tone]
                        }
                        style={{ width: `${Math.max(2, Math.min(100, pid.pct))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Trouble codes ─────────────────────────────────────────── */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-2.5 border-b border-border p-[13px_18px]">
                <div>
                  <h3 className="font-display text-[14.5px] font-bold text-heading">
                    {t('Trouble codes')}
                  </h3>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {t('Read from the last scan, newest first')}
                  </p>
                </div>
                <span
                  className={
                    'inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums ' +
                    (shownCodes.length
                      ? 'bg-[rgba(249,115,22,.14)] text-salis-orange'
                      : 'bg-[rgba(10,94,215,.1)] text-salis-blue')
                  }
                >
                  {shownCodes.length}
                </span>
              </div>

              {shownCodes.length > 0 ? (
                shownCodes.map((code, index) => {
                  const severity = SEVERITY[code.severity] ?? SEVERITY.low
                  const SeverityIcon = severity.icon
                  return (
                    <div
                      key={code.code}
                      className={
                        'flex flex-wrap items-start gap-3 p-[13px_18px]' +
                        (index ? ' border-t border-border' : '')
                      }
                    >
                      <span
                        className={
                          'mt-px flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ' +
                          severity.tile
                        }
                      >
                        <SeverityIcon size={14} strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 basis-52">
                        <div className="flex flex-wrap items-center gap-2">
                          <span dir="ltr" className="font-mono text-[13.5px] font-extrabold text-heading">
                            {code.code}
                          </span>
                          <span className="rounded-full bg-inset px-2 py-px font-action text-[10px] font-semibold text-muted">
                            {t(code.system)}
                          </span>
                          {code.freeze ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(11,179,255,.12)] px-2 py-px font-action text-[10px] font-semibold text-salis-bright">
                              <Icon name="Camera" size={9} />
                              {t('Freeze frame')}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[12.5px] text-body">{rtl ? code.ar : code.desc}</p>
                      </div>
                      <div className="flex flex-shrink-0 gap-1.5">
                        <Button
                          variant="subtle"
                          size="sm"
                          className="text-salis-blue"
                          onClick={() => navigate('/technician-kb')}
                        >
                          <Icon name="BookOpen" size={11} />
                          {t('Procedure')}
                        </Button>
                        {canEdit ? (
                          <Button size="sm" onClick={() => addToJob(code)}>
                            {t('Add to job')}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-[38px_20px] text-center">
                  <span className="inline-flex rounded-xl bg-[rgba(10,94,215,.09)] p-[11px] text-salis-blue">
                    <Icon name="ShieldCheck" size={20} />
                  </span>
                  <p className="mt-3 text-[14.5px] font-bold text-heading">{t('No codes stored')}</p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {t('The ECU reports no active or pending faults.')}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

/** Shape-faithful placeholders while the collections resolve. */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(240px,285px)_1fr]">
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="block h-14 animate-pulse rounded-xl bg-inset" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <span className="block h-40 animate-pulse rounded-xl bg-inset" />
        <span className="block h-64 animate-pulse rounded-xl bg-inset" />
      </div>
    </div>
  )
}
