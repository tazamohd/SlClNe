import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightCircle,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** One diagnostic report on its way from the OBD scan to customer approval.
 *
 *  The routing chain is the screen's spine: each desk (technician → reception
 *  → storekeeper → supervisor → customer) adds its piece, and cost figures
 *  only exist once the desk that owns them has acted — parts prices appear at
 *  stage 2, labour and handling at stage 3. Clicking a stage previews what the
 *  report looked like at that desk.
 *
 *  On top of the stage gating, `fieldHidden('Part cost / margin')` redacts
 *  every money figure for roles that never see cost (JobDetail's pattern):
 *  the cost build-up panel is dropped entirely rather than blanked out, and
 *  line totals render an em dash. */

/** Severity palette: critical is orange (warning), "due now" is bright blue,
 *  advisory is slate — no red/yellow in the brand (README §7). Icons are
 *  direct lucide imports; these three aren't in the generated registry. */
const SEVERITY: Record<string, { label: string; chip: string; Glyph: LucideIcon }> = {
  critical: { label: 'Critical', chip: 'bg-[rgba(249,115,22,.13)] text-salis-orange', Glyph: AlertTriangle },
  due: { label: 'Due now', chip: 'bg-[rgba(11,179,255,.12)] text-salis-bright', Glyph: AlertCircle },
  advisory: { label: 'Advisory', chip: 'bg-[rgba(100,116,139,.13)] text-muted', Glyph: Info },
}

const EVIDENCE: Record<string, { label: string; icon: string }> = {
  photo: { label: 'Photo', icon: 'Camera' },
  freeze: { label: 'Freeze frame', icon: 'Snowflake' },
  reading: { label: 'Live reading', icon: 'Activity' },
}

const STOCK: Record<string, { label: string; chip: string }> = {
  in: { label: 'In stock', chip: 'bg-[rgba(10,94,215,.11)] text-salis-blue' },
  order: { label: 'On order', chip: 'bg-[rgba(249,115,22,.13)] text-salis-orange' },
}

const COPY_STATE: Record<string, { label: string; chip: string }> = {
  sent: { label: 'Sent', chip: 'bg-[rgba(10,94,215,.11)] text-salis-blue' },
  saved: { label: 'Saved', chip: 'bg-[rgba(11,179,255,.12)] text-salis-bright' },
}

/** What the current desk is doing, per stage — the routing card's callout. */
const DESK: readonly [string, string][] = [
  ['Technician has completed the scan',
    'Findings, DTC codes and photos are attached. Sending to reception saves a copy to vehicle history and notifies the customer.'],
  ['Reception is reviewing with the customer',
    'Reception confirms the concern with the customer, sets priority, then requests pricing from the parts store. No cost is visible yet.'],
  ['Storekeeper has priced the parts',
    'Part prices and availability are filled in. One item is on order — the promised date accounts for it. Labour is still unknown.'],
  ['Supervisor has added labour and time',
    'Labour lines, handling fee and estimated duration are set. The report is now a complete quote and can go to the customer.'],
  ['Waiting on the customer',
    'The customer sees the full quote with VAT, but never the internal part cost or margin. They can approve, defer lines, or decline.'],
]

/** Role-visibility note, per stage. */
const VIS: readonly string[] = [
  'At this desk the technician records findings only. Part cost, margin and labour rates are hidden from them by role.',
  "Reception can see the findings and the customer's contact details, but no cost — pricing has not happened yet.",
  'The storekeeper sees purchase cost and supplier terms. Reception, the technician and the customer never see those figures.',
  'The supervisor sees full cost and margin to set labour and handling. This is the last desk that sees internal cost.',
  'The customer sees line prices and VAT only. Purchase cost, margin and supplier terms are redacted.',
]

const BASE_ATTACHMENTS = [
  { name: 'OBD-014-scan.pdf', size: '248 KB', icon: 'FileText' },
  { name: 'brake-pads.jpg', size: '1.2 MB', icon: 'Image' },
  { name: 'rotor-wear.jpg', size: '980 KB', icon: 'Image' },
] as const

const TH = 'whitespace-nowrap py-2 text-[10px] font-bold uppercase tracking-[.05em] text-muted'

export function DiagnosticReport() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const toast = useToast()

  // Which desk the report has reached (0..4). The design opens at the
  // storekeeper's desk, with parts freshly priced.
  const [stage, setStage] = useState(2)
  const [extraAttachments, setExtraAttachments] = useState(0)

  const { data: stages = [], isLoading: loadingStages } = useCollection('diagStages')
  const { data: findings = [], isLoading: loadingFindings } = useCollection('diagFindings')
  const { data: parts = [], isLoading: loadingParts } = useCollection('diagParts')
  const { data: labour = [], isLoading: loadingLabour } = useCollection('diagLabour')
  const { data: copies = [], isLoading: loadingCopies } = useCollection('diagCopies')
  const isLoading =
    loadingStages || loadingFindings || loadingParts || loadingLabour || loadingCopies

  // Data-borne strings (timestamps, lead times) carry English month names and
  // "N days" — localise those tokens without translating the digits.
  const loc = (value: string) =>
    value
      .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => t(m))
      .replace(/\b\d+ days?\b/g, (m) => t(m))

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  const hideCosts = fieldHidden('Part cost / margin')

  // Cost is only known once the relevant desk has handled it.
  const partsPriced = stage >= 2
  const labourPriced = stage >= 3
  const partsTotal = parts.reduce((sum, p) => sum + p.qty * p.price, 0)
  const labourTotal = labour.reduce((sum, l) => sum + l.hrs * l.rate, 0)
  const handlingFee = Math.round(partsTotal * 0.05)
  const hours = labour.reduce((sum, l) => sum + l.hrs, 0)
  const sub = (partsPriced ? partsTotal : 0) + (labourPriced ? labourTotal + handlingFee : 0)
  const vat = sub * 0.15
  const grand = sub + vat

  const atApproval = stages.length > 0 && stage >= stages.length - 1
  const current = stages[stage]
  const criticalCount = findings.filter((f) => f.severity === 'critical').length
  const attachments = [
    ...BASE_ATTACHMENTS,
    ...Array.from({ length: extraAttachments }, (_, i) => ({
      name: `cylinder-${i + 1}.jpg`,
      size: '1.1 MB',
      icon: 'Image',
    })),
  ]

  function attachEvidence() {
    setExtraAttachments((count) => count + 1)
    toast.show({
      title: t('Evidence attached'),
      description: t('Saved to the report and to vehicle history.'),
    })
  }

  function advance() {
    if (atApproval) {
      toast.show({
        title: t('Waiting on the customer'),
        description: t('A reminder was sent to their phone.'),
      })
      return
    }
    const next = stages[stage + 1]
    if (!next) return
    setStage(stage + 1)
    toast.show({
      title: `${t('Sent to')} ${rtl ? next.ar : next.label}`,
      description: `${rtl ? next.ar_owner : next.owner} · ${rtl ? next.ar_adds : next.adds}`,
    })
  }

  return (
    <div className="flex max-w-[1300px] flex-col gap-4">
      {/* Screen header: gradient chip, title, jump to the live OBD stream. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-salis-gradient text-white">
          <Icon name="Stethoscope" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] font-black text-heading">{t('Diagnostic Report')}</h1>
          <p className="text-[12.5px] text-muted">{t('From OBD scan to customer approval')}</p>
        </div>
        <Link
          to="/obddiagnostics"
          className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 font-action text-[12.5px] font-semibold text-body no-underline transition-colors hover:border-salis-blue hover:text-salis-blue hover:no-underline"
        >
          <Icon name="Activity" size={14} />
          {t('Live OBD')}
        </Link>
      </div>

      {/* Report identity + running total. */}
      <Card className="flex flex-wrap items-start gap-x-6 gap-y-4 p-4">
        <SummaryField
          label={t('Report')}
          value="DGN-2026-0311"
          valueClass="font-display text-[19px] font-black"
          ltr
          detail={<>{t('Job card')} <span dir="ltr">JC-2026-0884</span></>}
        />
        <SummaryField
          label={t('Vehicle')}
          value="Toyota Camry 2021"
          detail={<span className="font-mono" dir="ltr">RUH 4821 · 58,420 km</span>}
        />
        <SummaryField
          label={t('Scan tool')}
          value="OBD-014 · Techstream"
          ltr
          detail={<>{t('Scanned')} 26 {t('Jul')} · 09:14</>}
        />
        {/* Redacted roles get no figure at all, not a blanked-out one. */}
        {hideCosts ? null : (
          <div className="ms-auto text-end">
            <MicroLabel>{t('Running total')}</MicroLabel>
            <p
              className={cn(
                'mt-1 whitespace-nowrap font-display text-2xl font-black leading-tight tabular-nums',
                sub ? 'text-salis-blue' : 'text-muted'
              )}
            >
              {sub ? <Money sar={grand} className="font-display" /> : t('Pending')}
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {labourPriced
                ? t('Complete quote · VAT included')
                : partsPriced
                  ? t('Parts only · labour pending')
                  : t('Not yet priced')}
            </p>
          </div>
        )}
      </Card>

      {/* Routing chain: five desks, clickable to preview the report there. */}
      <Card className="p-4">
        <MicroLabel className="mb-3 block">{t('Routing chain')}</MicroLabel>
        {stages.length === 0 ? (
          <EmptyState icon="Route" title={t('No routing stages')} />
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {stages.map((s, i) => {
              const done = i < stage
              const cur = i === stage
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={cur}
                  onClick={() => setStage(i)}
                  className={cn(
                    'flex min-w-[120px] flex-1 cursor-pointer flex-col gap-1.5 rounded-lg p-3 text-start font-ui transition-all duration-150 sm:min-w-[158px]',
                    cur
                      ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)]'
                      : 'border border-border bg-card'
                  )}
                >
                  <span className="flex w-full items-center gap-2">
                    <span
                      className={cn(
                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10.5px] font-bold tabular-nums',
                        done
                          ? 'bg-salis-gradient text-white'
                          : cur
                            ? 'bg-[rgba(10,94,215,.14)] text-salis-blue'
                            : 'bg-inset text-muted'
                      )}
                    >
                      {done ? <Icon name="Check" size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-heading">{rtl ? s.ar : s.label}</span>
                      <span className="block truncate text-[10.5px] text-muted">{rtl ? s.ar_owner : s.owner}</span>
                    </span>
                  </span>
                  <span className="block w-full truncate font-mono text-[10px] text-muted">
                    {i <= stage ? loc(s.at) : '—'}
                  </span>
                  <span
                    className={cn(
                      'block h-[3px] w-full rounded-full',
                      done ? 'bg-salis-gradient' : cur ? 'bg-[rgba(10,94,215,.45)]' : 'bg-border'
                    )}
                  />
                </button>
              )
            })}
          </div>
        )}
        {/* What the current desk is doing, and the hand-off to the next one. */}
        <div className="mt-3 flex flex-col gap-2.5 rounded-lg bg-[rgba(10,94,215,.05)] p-3 sm:flex-row sm:items-start">
          <span className="mt-px flex-shrink-0 text-salis-blue">
            {atApproval ? (
              <Icon name="UserCheck" size={14} />
            ) : (
              <ArrowRightCircle size={14} aria-hidden className="rtl:-scale-x-100" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold text-heading">{t(DESK[stage]?.[0] ?? '')}</p>
            <p className="mt-0.5 text-xs leading-normal text-body">{t(DESK[stage]?.[1] ?? '')}</p>
          </div>
          <button
            type="button"
            onClick={advance}
            className={cn(
              'inline-flex h-8 flex-shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg px-3 font-action text-xs font-semibold transition-all',
              atApproval
                ? 'cursor-default border border-border bg-card text-muted'
                : 'cursor-pointer border-none bg-salis-gradient text-white shadow-[0_3px_10px_rgba(10,94,215,.25)]'
            )}
          >
            {atApproval ? t('Awaiting signature') : (rtl ? current?.ar_act : current?.act) ?? t('Next')}
            <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={13} />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_minmax(280px,320px)]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Findings: what the technician recorded, with evidence. */}
          <Card className="overflow-hidden">
            <SectionHeader
              title={t('Diagnostic findings')}
              sub={t('Recorded by the technician from the OBD scan and visual inspection')}
              pill={
                <Pill className="flex-shrink-0 bg-[rgba(249,115,22,.13)] px-2.5 py-0.5 text-[11px] text-salis-orange">
                  {criticalCount} {t('critical')}
                </Pill>
              }
            />
            {findings.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon="SearchX"
                  title={t('No findings recorded')}
                  description={t('The technician has not recorded any findings yet.')}
                />
              </div>
            ) : (
              findings.map((f, i) => {
                const sev = SEVERITY[f.severity] ?? SEVERITY.advisory
                const ev = EVIDENCE[f.evidence] ?? EVIDENCE.photo
                return (
                  <div
                    key={`${f.dtc}-${i}`}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[rgba(10,94,215,.04)]',
                      i > 0 && 'border-t border-border'
                    )}
                  >
                    <span className={cn('mt-px flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg', sev.chip)}>
                      <sev.Glyph size={13} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {f.dtc !== '—' ? (
                          <span className="font-mono text-[11.5px] font-extrabold text-salis-blue" dir="ltr">
                            {f.dtc}
                          </span>
                        ) : null}
                        <Pill className="bg-inset text-muted">{rtl ? f.ar_system : f.system}</Pill>
                        <Pill className="bg-[rgba(11,179,255,.1)] text-salis-bright">
                          <Icon name={ev.icon} size={9} />
                          {t(ev.label)}
                        </Pill>
                      </div>
                      <p className="mt-1 text-[13px] text-body">{rtl ? f.ar : f.finding}</p>
                    </div>
                    <Pill className={cn('flex-shrink-0', sev.chip)}>{t(sev.label)}</Pill>
                  </div>
                )
              })
            )}
            {/* Evidence shelf. */}
            <div className="flex flex-wrap items-center gap-2.5 border-t border-border bg-inset px-4 py-3">
              {attachments.map((file) => (
                <span
                  key={file.name}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 font-action text-[11.5px] font-semibold text-body"
                >
                  <Icon name={file.icon} size={12} className="flex-shrink-0 text-salis-blue" />
                  <span dir="ltr">{file.name}</span>
                  <span className="font-medium text-muted" dir="ltr">{file.size}</span>
                </span>
              ))}
              <button
                type="button"
                onClick={attachEvidence}
                className="inline-flex h-[29px] flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-[rgba(10,94,215,.4)] bg-transparent px-2.5 font-action text-[11.5px] font-semibold text-salis-blue transition-colors hover:bg-[rgba(10,94,215,.06)]"
              >
                <Icon name="Upload" size={12} className="flex-shrink-0" />
                {t('Attach evidence')}
              </button>
            </div>
          </Card>

          {/* Parts: priced by the storekeeper at stage 2. */}
          <Card className="overflow-hidden">
            <SectionHeader
              title={t('Parts required')}
              sub={`${parts.length} ${partsPriced ? t('items priced by the storekeeper') : t('items awaiting pricing')}`}
              pill={
                <StatePill done={partsPriced}>
                  {partsPriced ? t('Priced') : t('Awaiting storekeeper')}
                </StatePill>
              }
            />
            {parts.length === 0 ? (
              <div className="p-6">
                <EmptyState icon="Package" title={t('No parts requested')} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse">
                  <thead>
                    <tr className="bg-inset">
                      <th className={cn(TH, 'px-4 text-start')}>{t('Part')}</th>
                      <th className={cn(TH, 'px-2 text-start')}>{t('Stock')}</th>
                      <th className={cn(TH, 'px-2 text-end')}>{t('Qty')}</th>
                      <th className={cn(TH, 'px-4 text-end')}>{t('Line total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p) => {
                      const stock = STOCK[p.stock] ?? STOCK.in
                      return (
                        <tr key={p.part} className="border-t border-border">
                          <td className="px-4 py-2.5">
                            <p className="text-[12.5px] font-semibold text-heading">{rtl ? p.ar : p.desc}</p>
                            <p className="mt-px whitespace-nowrap font-mono text-[10.5px] text-muted" dir="ltr">
                              {p.part}
                            </p>
                          </td>
                          <td className="px-2 py-2.5">
                            <Pill className={stock.chip}>
                              {p.stock === 'order' ? `${t(stock.label)} · ${loc(p.eta)}` : t(stock.label)}
                            </Pill>
                          </td>
                          <td className="px-2 py-2.5 text-end text-[12.5px] tabular-nums text-body">{p.qty}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-end text-[12.5px] font-bold">
                            {hideCosts ? (
                              <span className="text-faint">—</span>
                            ) : partsPriced ? (
                              <Money sar={p.qty * p.price} className="font-bold text-heading" />
                            ) : (
                              <span className="font-medium text-muted">{t('Pending')}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Labour: appears once the supervisor has acted (stage 3). */}
          <Card className="overflow-hidden">
            <SectionHeader
              title={t('Labour, handling & time')}
              sub={labourPriced ? t('Set by the workshop supervisor') : t('Not yet added')}
              pill={
                <StatePill done={labourPriced}>
                  {labourPriced ? t('Complete') : t('Awaiting supervisor')}
                </StatePill>
              }
            />
            {labourPriced ? (
              labour.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon="Wrench" title={t('No labour lines')} />
                </div>
              ) : (
                <>
                  {labour.map((line, i) => (
                    <div
                      key={line.task}
                      className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-border')}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-heading">{rtl ? line.ar : line.task}</p>
                        <p className="mt-px text-[11px] tabular-nums text-muted">
                          {line.hrs} {t('hr')} ×{' '}
                          {hideCosts ? '—' : <Money sar={line.rate} className="text-muted" />}
                        </p>
                      </div>
                      {hideCosts ? (
                        <span className="text-faint">—</span>
                      ) : (
                        <Money
                          sar={line.hrs * line.rate}
                          className="whitespace-nowrap text-[12.5px] font-bold text-heading"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-inset px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-body">
                      <Icon name="Clock" size={13} className="text-salis-blue" />
                      {t('Estimated time:')} {hours} {t('hr')} · {t('same day')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Icon name="Package" size={13} />
                      {t('Handling fee:')}{' '}
                      {hideCosts ? '—' : <Money sar={handlingFee} className="text-muted" />}
                    </span>
                  </div>
                </>
              )
            ) : (
              <div className="px-5 py-7 text-center">
                <span className="inline-flex rounded-lg bg-inset p-2.5 text-muted">
                  <Icon name="Hourglass" size={18} />
                </span>
                <p className="mt-3 text-[13px] font-semibold text-heading">
                  {t('Waiting on the workshop supervisor')}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t('Labour hours, handling fee and estimated duration are added once parts are priced.')}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Cost build-up — dropped entirely for cost-redacted roles, per
              JobDetail, rather than rendering five blanked-out rows. */}
          {hideCosts ? null : (
            <Card className="p-4 shadow-lg">
              <h2 className="mb-3 font-display text-sm font-bold text-heading">{t('Cost build-up')}</h2>
              <div className="flex flex-col gap-2">
                <CostLine label={t('Parts')} sar={partsPriced ? partsTotal : null} pending={t('Pending')} />
                <CostLine label={t('Labour')} sar={labourPriced ? labourTotal : null} pending={t('Pending')} />
                <CostLine label={t('Handling')} sar={labourPriced ? handlingFee : null} pending={t('Pending')} />
                <CostLine label={`${t('VAT')} 15%`} sar={sub ? vat : null} pending={t('Pending')} />
                <CostLine label={t('Total')} sar={sub ? grand : null} pending={t('Pending')} strong />
              </div>
              {atApproval ? (
                <Link
                  to="/customer-approval"
                  className="mt-3.5 flex h-[42px] items-center justify-center gap-2 rounded-lg bg-salis-gradient font-action text-[13.5px] font-bold text-white no-underline shadow-[0_4px_14px_rgba(10,94,215,.3)] transition-all hover:-translate-y-px hover:text-white hover:no-underline"
                >
                  <Icon name="PenTool" size={15} />
                  {t('Open approval screen')}
                </Link>
              ) : (
                <p className="mt-3 rounded-lg bg-inset px-3 py-2.5 text-[11.5px] leading-normal text-muted">
                  {partsPriced
                    ? t('Cost completes once the supervisor adds labour and time.')
                    : t('No figures are shown until the storekeeper prices the parts.')}
                </p>
              )}
            </Card>
          )}

          {/* Distribution: every desk holding a copy. */}
          <Card className="p-4">
            <h2 className="font-display text-[13.5px] font-bold text-heading">{t('Distribution')}</h2>
            <p className="mb-3 mt-1 text-[11.5px] leading-normal text-muted">
              {t('Every desk that holds a copy of this report.')}
            </p>
            {copies.length === 0 ? (
              <EmptyState icon="Send" title={t('No copies sent yet')} />
            ) : (
              <div className="flex flex-col gap-2">
                {copies.map((copy) => {
                  const state = COPY_STATE[copy.state] ?? COPY_STATE.sent
                  return (
                    <div key={copy.to} className="flex items-center gap-2.5">
                      <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                        <Icon name={copy.icon} size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-heading">{rtl ? copy.ar : copy.to}</p>
                        <p className="truncate font-mono text-[10.5px] text-muted">{loc(copy.at)}</p>
                      </div>
                      <Pill className={cn('flex-shrink-0', state.chip)}>{t(state.label)}</Pill>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Role-visibility note for the selected desk. */}
          <div className="rounded-xl border border-[rgba(10,94,215,.16)] bg-[rgba(10,94,215,.05)] p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Icon name="EyeOff" size={13} className="text-salis-blue" />
              <p className="text-[12.5px] font-bold text-heading">{t('What this desk can see')}</p>
            </div>
            <p className="text-[11.5px] leading-relaxed text-body">{t(VIS[stage] ?? '')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Uppercase micro label above a summary value. */
function MicroLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-action text-[10.5px] font-bold uppercase tracking-[.05em] text-muted', className)}>
      {children}
    </p>
  )
}

/** One block of the report-identity card. `ltr` pins Latin values (ids, tool
 *  names) so Arabic pages don't reorder them. */
function SummaryField({
  label,
  value,
  detail,
  valueClass,
  ltr,
}: {
  label: string
  value: string
  detail: ReactNode
  valueClass?: string
  ltr?: boolean
}) {
  return (
    <div className="min-w-[150px]">
      <MicroLabel>{label}</MicroLabel>
      <p
        className={cn('mt-1 whitespace-nowrap text-sm font-bold text-heading', valueClass)}
        dir={ltr ? 'ltr' : undefined}
      >
        {value}
      </p>
      <p className="mt-0.5 whitespace-nowrap text-xs text-muted">{detail}</p>
    </div>
  )
}

/** Card header: title, sub-line and a status pill at the end. */
function SectionHeader({ title, sub, pill }: { title: string; sub: string; pill: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border px-4 py-3">
      <div>
        <h2 className="font-display text-[14.5px] font-bold text-heading">{title}</h2>
        <p className="mt-0.5 text-[11.5px] text-muted">{sub}</p>
      </div>
      {pill}
    </div>
  )
}

/** Small status pill. */
function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-px font-action text-[10px] font-semibold',
        className
      )}
    >
      {children}
    </span>
  )
}

/** Section-state pill: blue once the owning desk has acted, orange while the
 *  section is still waiting on someone. */
function StatePill({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <Pill
      className={cn(
        'px-2.5 py-0.5 text-[11px]',
        done ? 'bg-[rgba(10,94,215,.12)] text-salis-blue' : 'bg-[rgba(249,115,22,.13)] text-salis-orange'
      )}
    >
      {children}
    </Pill>
  )
}

/** One line of the cost build-up. `sar: null` renders the pending copy. */
function CostLine({
  label,
  sar,
  pending,
  strong,
}: {
  label: string
  sar: number | null
  pending: string
  strong?: boolean
}) {
  const valueClass = cn(
    'whitespace-nowrap tabular-nums',
    strong ? 'text-[15px] font-extrabold text-salis-blue' : 'text-[12.5px] text-heading'
  )
  return (
    <div className={cn('flex items-baseline justify-between gap-3', strong && 'border-t border-border pt-2')}>
      <span className={strong ? 'text-[15px] font-extrabold text-heading' : 'text-[12.5px] font-medium text-muted'}>
        {label}
      </span>
      {sar === null ? <span className={valueClass}>{pending}</span> : <Money sar={sar} className={valueClass} />}
    </div>
  )
}
