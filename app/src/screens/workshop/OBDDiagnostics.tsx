import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import {
  diagnostics,
  type IntegrationStatus,
  type ObdCommandResult,
  type RepositoryError,
} from '@/data/repository'
import { isExternalDependency, transitionFailureMessage } from './api'

type Device = RowOf<'obdDevices'> & { _id?: string }
type Dtc = RowOf<'dtcCodes'> & { _id?: string }

/** What a device command surfaced, kept per screen so a re-scan on one tool does
 *  not colour another. `unavailable` is the honest §40 state: the OBD bridge is
 *  an external dependency and the live command refuses with a 503 until it is
 *  deployed — never a failure and never a faked scan. */
type CommandState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'done'; result: ObdCommandResult }

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  live: { bg: 'rgba(10,94,215,.12)', fg: 'var(--salis-blue)', label: 'Live' },
  idle: { bg: 'rgba(11,179,255,.12)', fg: 'var(--salis-blue-bright)', label: 'Idle' },
  offline: { bg: 'rgba(100,116,139,.13)', fg: 'var(--text-muted)', label: 'Offline' },
}

const SEVERITY_TINT: Record<string, { bg: string; fg: string; icon: string }> = {
  high: { bg: 'rgba(249,115,22,.13)', fg: 'var(--salis-orange)', icon: 'AlertTriangle' },
  medium: { bg: 'rgba(11,179,255,.13)', fg: 'var(--salis-blue-bright)', icon: 'AlertCircle' },
  low: { bg: 'rgba(100,116,139,.13)', fg: 'var(--text-muted)', icon: 'Info' },
}

/** OBD-II diagnostics — the connected scan tools and their last telemetry.
 *
 *  The device rows are real (`obdDevices`) and carry the last reading: RPM,
 *  coolant, battery voltage, engine load and a fault count. Those are shown as
 *  the last reading, honestly, not animated to fake a live stream the client
 *  has no socket for.
 *
 *  `dtcCodes` is a *reference catalog*, not per-device readings — nothing in the
 *  data links a specific code to a specific device, so it is presented as the
 *  code reference with a link into the knowledge base, rather than asserting a
 *  device "has" codes it invented. Re-scan, clear-codes and add-to-job are
 *  device commands with no endpoint yet; they are named as gaps rather than
 *  rendered as buttons that do nothing (see `workshop-approval-gaps.test.ts`).
 */
export function OBDDiagnostics() {
  const { t, rtl } = usePreferences()
  const devices = useCollection('obdDevices')
  const dtc = useCollection('dtcCodes')
  const [picked, setPicked] = useState(0)
  const [command, setCommand] = useState<CommandState>({ kind: 'idle' })

  const deviceRows = (devices.data ?? []) as readonly Device[]
  const dtcRows = (dtc.data ?? []) as readonly Dtc[]
  const selected = deviceRows[picked] ?? deviceRows[0]
  const deviceRef = selected?._id ?? selected?.id

  const liveCount = useMemo(() => deviceRows.filter((d) => d.status === 'live').length, [deviceRows])

  /* The integration-status read (F-029): the honest EXTERNAL_DEPENDENCY state of
   * the OBD bridge. Live only — null on the fixtures, where the static note below
   * remains the honest fallback. */
  const integrations = useQuery<{ integrations: IntegrationStatus[] }, RepositoryError>({
    queryKey: ['diagnostics', 'integrations'],
    queryFn: () => diagnostics!.integrations(),
    enabled: Boolean(diagnostics),
    retry: false,
  })
  const obdBridge = integrations.data?.integrations.find(
    (i) => i.dependency?.toLowerCase().includes('obd') || i.id?.toLowerCase().includes('obd')
  )

  /* The per-device DTC readings the device↔dtc link now persists (F-029,
   * migration 0006). Live only: null on the fixtures, where the DTC catalog
   * below stays the honest "reference, not this device's codes" fallback. */
  const readings = useQuery({
    queryKey: ['diagnostics', 'readings', deviceRef],
    queryFn: () => diagnostics!.readings(deviceRef as string),
    enabled: Boolean(diagnostics) && Boolean(deviceRef),
    retry: false,
  })
  const readingRows = readings.data?.rows ?? []

  async function runCommand(action: 'rescan' | 'clearCodes') {
    if (!diagnostics || !deviceRef) return
    setCommand({ kind: 'pending' })
    try {
      const result = await diagnostics[action](deviceRef)
      setCommand({ kind: 'done', result })
    } catch (cause) {
      if (isExternalDependency(cause)) {
        setCommand({
          kind: 'unavailable',
          message: (cause as RepositoryError).message,
        })
      } else {
        setCommand({
          kind: 'error',
          message: transitionFailureMessage(cause, t('Something went wrong. Nothing was saved.')),
        })
      }
    }
  }

  if (devices.isError) {
    return (
      <ErrorState
        title={t("Couldn't load this")}
        description={devices.error?.message}
        onRetry={() => void devices.refetch()}
      />
    )
  }
  if (devices.isLoading) {
    return <Loading label="Loading scan tools..." />
  }

  const pids = selected
    ? [
        { label: t('Engine RPM'), value: String(selected.rpm ?? 0), pct: (selected.rpm ?? 0) / 70, warn: false },
        {
          label: t('Coolant'),
          value: `${selected.coolant ?? 0} °C`,
          pct: selected.coolant ?? 0,
          warn: (selected.coolant ?? 0) > 105,
        },
        {
          label: t('Battery'),
          value: `${(selected.voltage ?? 0).toFixed(1)} V`,
          pct: ((selected.voltage ?? 0) / 15) * 100,
          warn: (selected.voltage ?? 0) < 12,
        },
        { label: t('Engine load'), value: `${selected.load ?? 0} %`, pct: selected.load ?? 0, warn: false },
      ]
    : []

  const status = STATUS_TINT[selected?.status ?? 'offline'] ?? STATUS_TINT.offline

  return (
    <div className="animate-fade-up motion-reduce:animate-none">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="font-display text-2xl font-black text-heading">
              {t('OBD-II Live Diagnostics')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {t('Connected scan tools across the workshop')}
            </p>
          </div>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(10,94,215,.1)] px-2.5 py-1 font-action text-[11px] font-semibold text-salis-blue">
            <span
              className="h-1.5 w-1.5 rounded-full bg-salis-blue"
              aria-hidden
            />
            {liveCount} {t('streaming')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,285px)_1fr]">
        <div className="flex flex-col gap-2.5">
          <p className="font-action text-[11px] font-bold uppercase tracking-wide text-muted">
            {t('Scan tools')}
          </p>
          {deviceRows.length === 0 ? (
            <Card className="p-4">
              <EmptyState icon="Bluetooth" title={t('No scan tools paired')} />
            </Card>
          ) : (
            deviceRows.map((device, index) => {
              const dStatus = STATUS_TINT[device.status] ?? STATUS_TINT.offline
              const on = index === picked
              return (
                <button
                  key={device._id ?? device.id}
                  type="button"
                  onClick={() => setPicked(index)}
                  className={
                    'flex w-full items-center gap-2.5 rounded-xl p-3 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue ' +
                    (on
                      ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.07)]'
                      : 'border border-border bg-card hover:border-[rgba(10,94,215,.35)]')
                  }
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: dStatus.fg }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-heading">{device.vehicle}</p>
                    <p className="truncate font-mono text-[11px] text-muted" dir="ltr">
                      {device.plate} · {device.bay}
                    </p>
                  </div>
                  {device.dtc > 0 ? (
                    <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[rgba(249,115,22,.15)] px-1.5 text-[10.5px] font-bold text-salis-orange">
                      {device.dtc}
                    </span>
                  ) : null}
                </button>
              )
            })
          )}
          <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(10,94,215,.28)] bg-[rgba(10,94,215,.05)] p-3">
            <Icon name="Bluetooth" size={14} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            <div>
              <p className="text-[12px] font-semibold text-heading">{t('Pair a new tool')}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">
                {t('Plug the dongle into the OBD port and hold the pair button for 3 seconds.')}
              </p>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-black text-heading">{selected.vehicle}</p>
                    <Badge background={status.bg} color={status.fg}>
                      {t(status.label)}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-[12.5px] text-muted" dir="ltr">
                    VIN {selected.vin} · {selected.bay} · {selected.id}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                  <Icon name="Clock" size={12} />
                  {t('Last reading')}
                </span>
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {pids.map((pid) => (
                  <div key={pid.label} className="rounded-xl border border-border bg-inset p-3">
                    <p className="font-action text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {pid.label}
                    </p>
                    <p
                      className="mt-1 font-display text-lg font-black leading-tight"
                      style={{ color: pid.warn ? 'var(--salis-orange)' : 'var(--salis-blue)' }}
                    >
                      {pid.value}
                    </p>
                    <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(2, Math.min(100, pid.pct))}%`,
                          background: pid.warn ? 'var(--salis-orange)' : 'var(--salis-blue)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {diagnostics ? (
                <div className="mt-3.5 flex flex-col gap-2.5">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => void runCommand('rescan')}
                      disabled={command.kind === 'pending'}
                    >
                      <Icon name="RefreshCw" size={13} />
                      {t(command.kind === 'pending' ? 'Working...' : 'Re-scan')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void runCommand('clearCodes')}
                      disabled={command.kind === 'pending'}
                    >
                      <Icon name="Eraser" size={13} />
                      {t('Clear codes')}
                    </Button>
                  </div>

                  {/* The bridge is an external dependency (§40): show its state
                      honestly, never a faked scan. */}
                  {command.kind === 'unavailable' ? (
                    <div
                      role="note"
                      className="flex items-start gap-2.5 rounded-lg border border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.07)] p-2.5"
                    >
                      <Icon name="Plug" size={14} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-salis-orange">
                          {t('OBD bridge not connected')}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-body">{command.message}</p>
                      </div>
                    </div>
                  ) : null}

                  {command.kind === 'error' ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-[rgba(249,115,22,.28)] bg-[rgba(249,115,22,.07)] p-2.5 text-[11.5px] text-body"
                    >
                      {command.message}
                    </div>
                  ) : null}

                  {command.kind === 'done' ? (
                    <div className="rounded-lg bg-[rgba(10,94,215,.06)] p-2.5 text-[11.5px] text-body">
                      {t('Command completed')}: {command.result.command}
                      {command.result.mock ? (
                        <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                          {t('Mock bridge — not a live scan')}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}

                  {obdBridge && !obdBridge.configured ? (
                    <p className="rounded-lg bg-inset p-2.5 text-[11px] leading-relaxed text-muted">
                      {t('The OBD bridge is not configured in this deployment')} — {obdBridge.dependency}.{' '}
                      {t('Commands refuse until it is connected; nothing is faked.')}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 rounded-lg bg-inset p-2.5 text-[11px] leading-relaxed text-muted">
                  {t('Re-scan, clear codes and add-to-job are device commands the API does not expose yet.')}
                </p>
              )}
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2.5 border-0 border-b border-solid border-border p-3.5">
                <div>
                  <p className="font-display text-[14.5px] font-bold text-heading">
                    {t('Trouble code reference')}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {diagnostics && readingRows.length
                      ? `${readingRows.length} ${t('codes recorded on this device')}`
                      : `${selected.dtc} ${t('faults on this tool · codes below are the reference catalog')}`}
                  </p>
                </div>
              </div>
              {diagnostics && (readings.isLoading || readingRows.length) ? (
                readings.isLoading ? (
                  <div className="p-4">
                    <Loading inline label="Loading device codes..." />
                  </div>
                ) : (
                  <ul className="m-0 flex list-none flex-col p-0">
                    {readingRows.map((reading, index) => (
                      <li
                        key={reading._id ?? `${reading.dtc}-${index}`}
                        className={
                          'flex items-start gap-3 p-3.5 ' +
                          (index ? 'border-0 border-t border-solid border-border' : '')
                        }
                      >
                        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                          <Icon name="AlertCircle" size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[13.5px] font-extrabold text-heading">
                              {reading.dtc}
                            </span>
                            <span className="rounded-full bg-inset px-1.5 py-0.5 font-action text-[10px] font-semibold text-muted">
                              {reading.severity}
                            </span>
                            {reading.cleared ? (
                              <Badge background="rgba(10,94,215,.11)" color="var(--salis-blue)">
                                {t('Cleared')}
                              </Badge>
                            ) : null}
                            {reading.mock ? (
                              <Badge background="rgba(249,115,22,.13)" color="var(--salis-orange)">
                                {t('Mock')}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[12.5px] text-body">{reading.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : dtc.isLoading ? (
                <div className="p-4">
                  <Loading inline label="Loading codes..." />
                </div>
              ) : dtcRows.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon="ShieldCheck"
                    title={t('No codes stored')}
                    description={t('The ECU reports no active or pending faults.')}
                  />
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {dtcRows.map((code, index) => {
                    const sev = SEVERITY_TINT[code.severity] ?? SEVERITY_TINT.low
                    return (
                      <li
                        key={code._id ?? code.code}
                        className={
                          'flex items-start gap-3 p-3.5 ' +
                          (index ? 'border-0 border-t border-solid border-border' : '')
                        }
                      >
                        <span
                          className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: sev.bg, color: sev.fg }}
                        >
                          <Icon name={sev.icon} size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[13.5px] font-extrabold text-heading">
                              {code.code}
                            </span>
                            <span className="rounded-full bg-inset px-1.5 py-0.5 font-action text-[10px] font-semibold text-muted">
                              {t(code.system)}
                            </span>
                            {code.freeze ? (
                              <Badge background="rgba(11,179,255,.12)" color="var(--salis-blue-bright)">
                                <Icon name="Camera" size={9} />
                                {t('Freeze frame')}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[12.5px] text-body">{rtl ? code.ar || code.desc : code.desc}</p>
                        </div>
                        <Link
                          to="/technician-kb"
                          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 font-action text-[11px] font-semibold text-salis-blue no-underline hover:bg-[rgba(10,94,215,.07)] hover:no-underline"
                        >
                          <Icon name="BookOpen" size={11} />
                          {t('Procedure')}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
