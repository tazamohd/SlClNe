import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'

/** UI pattern library — Modals: Data / Capture / Lifecycle.
 *
 *  Reference galleries, not live dialogs: every variant renders as an inline
 *  "specimen" card, exactly as the design's static HTML does, so the whole
 *  set is visible on load without opening anything — no portal, no backdrop,
 *  no focus trap, no click required. Companion to ModalsCore.tsx
 *  (CRUD / Actions / Status specimens). */

type Tone = 'blue' | 'cyan' | 'navy' | 'orange'
const CHIP: Record<Tone, readonly [string, string]> = {
  blue: ['rgba(10,94,215,.08)', '#0A5ED7'],
  cyan: ['rgba(11,179,255,.08)', '#0BB3FF'],
  navy: ['rgba(11,31,59,.08)', '#0B1F3B'],
  orange: ['rgba(249,115,22,.08)', '#F97316'],
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

type Action = { label: string; primary?: boolean; orange?: boolean }

function ActionBar({ actions }: { actions: readonly Action[] }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-shrink-0 justify-end gap-2.5 border-t border-border px-5 py-3.5">
      {actions.map((a) => (
        <Button key={a.label} variant={a.primary || a.orange ? 'primary' : 'outline'} size="sm"
          className={a.orange ? 'bg-salis-orange shadow-[0_4px_12px_rgba(249,115,22,.25)] hover:bg-salis-orange-hover' : undefined}>
          {t(a.label)}
        </Button>
      ))}
    </div>
  )
}

/** A dialog's markup shown in place as a card — chip, title, close glyph,
 *  body, optional footer actions. */
function Specimen({ icon, tone = 'blue', title, actions, children }:
  { icon: string; tone?: Tone; title: string; actions?: readonly Action[]; children: ReactNode }) {
  const { t } = usePreferences()
  const [bg, fg] = CHIP[tone]
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl">
      <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-5 py-3.5">
        <span className="flex rounded-lg p-1.5" style={{ background: bg, color: fg }}><Icon name={icon} size={16} /></span>
        <h3 className="min-w-0 truncate text-[15px] font-bold text-heading">{t(title)}</h3>
        <span className="flex-1" />
        <span aria-hidden className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-lg leading-none text-muted">&times;</span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-5 py-4">{children}</div>
      {actions ? <ActionBar actions={actions} /> : null}
    </Card>
  )
}

/** Centered confirm specimen — medallion, heading, copy, no header row
 *  (lifecycle activate/deactivate variants). */
function CenteredSpecimen({ icon, tone, heading, copy, actions }:
  { icon: string; tone: Tone; heading: string; copy: string; actions: readonly Action[] }) {
  const { t } = usePreferences()
  const [bg, fg] = CHIP[tone]
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl">
      <div className="flex flex-col items-center gap-3 px-6 py-7 text-center">
        <span className="flex rounded-full p-3.5" style={{ background: bg, color: fg }}><Icon name={icon} size={26} /></span>
        <h3 className="text-lg font-bold text-heading">{t(heading)}</h3>
        <p className="max-w-[290px] text-sm leading-relaxed text-muted">{t(copy)}</p>
      </div>
      <ActionBar actions={actions} />
    </Card>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-action text-xs font-medium text-body">{t(label)}</label>
      {children}
    </div>
  )
}

function SwitchDot({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={cn('relative inline-block h-[21px] w-[38px] flex-shrink-0 rounded-full', on ? 'bg-salis-blue' : 'bg-border-strong')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow', on ? 'start-[19px]' : 'start-0.5')} />
    </span>
  )
}

function Pill({ label, on }: { label: string; on?: boolean }) {
  const { t } = usePreferences()
  return (
    <span className={cn('inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 font-action text-[11px] font-medium',
      on ? 'border border-[rgba(10,94,215,.35)] bg-[rgba(10,94,215,.1)] text-salis-blue' : 'border border-border bg-inset text-muted')}>
      {t(label)}
    </span>
  )
}

function InsetNote({ icon, tone = 'blue', children }: { icon: string; tone?: Tone; children: ReactNode }) {
  const [, fg] = CHIP[tone]
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[11px]',
      tone === 'orange' ? 'border-[rgba(249,115,22,.2)] bg-[rgba(249,115,22,.06)]' : 'border-border bg-inset')}>
      <Icon name={icon} size={13} className="flex-shrink-0" style={{ color: fg }} />
      <span style={tone === 'orange' ? { color: fg } : undefined} className={tone === 'orange' ? '' : 'text-muted'}>{children}</span>
    </div>
  )
}

/** Bordered selectable row (branch picker, merge-candidate rows). */
function PickRow({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg border-[1.5px] px-3 py-2.5',
      on ? 'border-salis-blue bg-[rgba(10,94,215,.05)]' : 'border-border bg-inset')}>
      {children}
    </div>
  )
}

// ── Data modals ──────────────────────────────────────────────────────────────

const DATA_COLUMNS: readonly [string, boolean][] = [['Job Card', true], ['Customer', true], ['Vehicle', true], ['Technician', true], ['Status', true], ['Created', false], ['Total', true]]
const DATA_SORTS = [{ order: '1st', field: 'Created Date', dir: 'DESC', icon: 'ArrowDown' }, { order: '2nd', field: 'Total', dir: 'ASC', icon: 'ArrowUp' }] as const
const DATA_SCOPES: readonly [string, boolean][] = [['Job Cards', true], ['Customers', true], ['Invoices', false], ['Vehicles', true], ['Parts', false]]
const DATA_FILTERS = [{ field: 'Status', op: 'equals', value: 'In Progress' }, { field: 'Branch', op: 'is', value: 'Riyadh Main' }, { field: 'Total', op: '>=', value: '1000' }] as const
const DATA_MAPPINGS = [{ source: 'full_name', target: 'Customer Name' }, { source: 'mobile', target: 'Phone' }, { source: 'email_addr', target: 'Email' }, { source: 'plate_no', target: 'Vehicle Plate' }] as const
const DATA_FORMATS = [{ label: 'CSV', icon: 'FileText', on: true }, { label: 'Excel', icon: 'FileSpreadsheet', on: false }, { label: 'PDF', icon: 'FileType', on: false }] as const
const DATA_SCOPE_RADIOS: readonly [string, boolean][] = [['All records (42)', true], ['Current filter (18)', false], ['Selected only (5)', false]]

/** Route /ui/modals/data — column, sort, search, filter, export and import dialog variants. */
export function UIModalsData() {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader icon="SlidersHorizontal" title={t('Data Modals')} subtitle={t('Column, sort, search, filter, export and import surfaces')} />
      <Grid>
        <Specimen icon="Columns3" tone="blue" title="Column Selector" actions={[{ label: 'Reset' }, { label: 'Apply', primary: true }]}>
          <div className="flex flex-col gap-0.5">
            {DATA_COLUMNS.map(([label, on]) => (
              <div key={label} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
                <Icon name="GripVertical" size={14} className="flex-shrink-0 cursor-grab text-faint" />
                <span className="flex-1 text-[13px] text-heading">{t(label)}</span>
                <SwitchDot on={on} />
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen icon="ArrowUpDown" tone="cyan" title="Sort Options" actions={[{ label: 'Clear' }, { label: 'Apply Sort', primary: true }]}>
          {DATA_SORTS.map((s) => (
            <div key={s.order} className="flex items-center gap-2 rounded-lg border border-border bg-inset px-3 py-2.5">
              <span className="w-9 flex-shrink-0 text-[11px] font-semibold text-muted">{t(s.order)}</span>
              <span className="flex-1 truncate text-xs text-heading">{t(s.field)}</span>
              <span className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-salis-blue" dir="ltr">
                <Icon name={s.icon} size={12} />{s.dir}
              </span>
              <span aria-hidden className="flex-shrink-0 text-base leading-none text-salis-orange">&times;</span>
            </div>
          ))}
          <button type="button" className="flex h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent font-action text-xs text-salis-blue">
            <Icon name="Plus" size={13} />{t('Add sort level')}
          </button>
        </Specimen>

        <Specimen icon="SearchCode" tone="navy" title="Advanced Search" actions={[{ label: 'Reset' }, { label: 'Search', primary: true }]}>
          <Field label="Keywords"><Input placeholder={t('Search across all records...')} readOnly inputSize="md" /></Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="From"><Input value="2026-07-01" readOnly dir="ltr" inputSize="md" className="font-mono text-xs" /></Field>
            <Field label="To"><Input value="2026-07-24" readOnly dir="ltr" inputSize="md" className="font-mono text-xs" /></Field>
          </div>
          <Field label="Search in">
            <div className="flex flex-wrap gap-1.5">{DATA_SCOPES.map(([label, on]) => <Pill key={label} label={label} on={on} />)}</div>
          </Field>
        </Specimen>

        <Specimen icon="SlidersHorizontal" tone="orange" title="Filter Builder" actions={[{ label: 'Reset' }, { label: 'Apply Filters', primary: true }]}>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{t('Match')}</span>
            <div className="flex overflow-hidden rounded-md border border-border">
              <span className="bg-salis-gradient px-3 py-1 font-action text-[11px] font-medium text-white">{t('ALL')}</span>
              <span className="bg-card px-3 py-1 font-action text-[11px] font-medium text-body">{t('ANY')}</span>
            </div>
            <span>{t('of the following')}</span>
          </div>
          {DATA_FILTERS.map((f) => (
            <div key={f.field} className="flex items-center gap-2 rounded-lg border border-border bg-inset px-2.5 py-2">
              <span className="rounded-md border border-border bg-card px-2 py-1 text-[11px] text-heading">{t(f.field)}</span>
              <span className="rounded-md border border-border bg-card px-2 py-1 text-[11px] text-heading">{t(f.op)}</span>
              <span className="flex-1 truncate rounded-md border border-border bg-card px-2 py-1 text-[11px] text-heading" dir="ltr">{f.value}</span>
              <span aria-hidden className="flex-shrink-0 text-sm leading-none text-salis-orange">&times;</span>
            </div>
          ))}
          <button type="button" className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent font-action text-xs text-salis-blue">
            <Icon name="Plus" size={13} />{t('Add condition')}
          </button>
        </Specimen>

        <Specimen icon="Download" tone="blue" title="Export Records" actions={[{ label: 'Cancel' }, { label: 'Export', primary: true }]}>
          <Field label="Format">
            <div className="flex gap-2">
              {DATA_FORMATS.map((f) => (
                <span key={f.label} className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] py-2 font-action text-xs font-medium',
                  f.on ? 'border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue' : 'border-border bg-inset text-body')}>
                  <Icon name={f.icon} size={14} />{t(f.label)}
                </span>
              ))}
            </div>
          </Field>
          <Field label="Scope">
            <div className="flex flex-col gap-1.5">
              {DATA_SCOPE_RADIOS.map(([label, checked]) => (
                <span key={label} className="flex items-center gap-2 text-[13px] text-body">
                  <span aria-hidden className={cn('flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px]', checked ? 'border-salis-blue' : 'border-border-strong')}>
                    {checked ? <span className="h-2 w-2 rounded-full bg-salis-blue" /> : null}
                  </span>
                  {t(label)}
                </span>
              ))}
            </div>
          </Field>
          <InsetNote icon="Info">42 {t('records')} · {t('approx.')} 1.2 MB</InsetNote>
        </Specimen>

        <Specimen icon="Upload" tone="cyan" title="Import Records" actions={[{ label: 'Cancel' }, { label: 'Import 242 Rows', primary: true }]}>
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5">
            <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue"><Icon name="FileSpreadsheet" size={15} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-heading" dir="ltr">customers_july.csv</p>
              <p className="text-[11px] text-muted">248 {t('rows')} · 84 KB</p>
            </div>
            <Icon name="BadgeCheck" size={16} className="flex-shrink-0 text-salis-blue" />
          </div>
          <Field label="Column mapping">
            <div className="flex flex-col gap-1.5">
              {DATA_MAPPINGS.map((m) => (
                <div key={m.source} className="flex items-center gap-2 rounded-lg border border-border bg-inset px-2.5 py-1.5">
                  <span className="flex-1 truncate font-mono text-[11px] text-muted" dir="ltr">{m.source}</span>
                  <Icon name="ArrowRight" size={12} className="flex-shrink-0 text-faint" />
                  <span className="flex-1 truncate text-xs font-medium text-heading">{t(m.target)}</span>
                </div>
              ))}
            </div>
          </Field>
          <InsetNote icon="ShieldAlert" tone="orange">6 {t('rows have duplicate phone numbers and will be skipped.')}</InsetNote>
        </Specimen>
      </Grid>
    </>
  )
}

// ── Capture modals ───────────────────────────────────────────────────────────

const BARCODE_BARS = [[4, 3], [11, 2], [17, 5], [26, 2], [32, 4], [40, 2], [46, 6], [56, 2], [62, 3], [69, 5], [78, 2], [84, 4]] as const
const PRINT_LINES = [[6, 62], [5, 44], [5, 80], [5, 72], [5, 56], [5, 68]] as const
const QR_CORNERS = ['top-4 start-4 border-t-[3px] border-s-[3px] rounded-tl-md', 'top-4 end-4 border-t-[3px] border-e-[3px] rounded-tr-md',
  'bottom-4 start-4 border-b-[3px] border-s-[3px] rounded-bl-md', 'bottom-4 end-4 border-b-[3px] border-e-[3px] rounded-br-md'] as const

/** Route /ui/modals/capture — camera, barcode/QR scan, signature, print and
 *  upload dialog variants. Every capture surface is a static placeholder
 *  block: no device media is requested, no remote asset is loaded. */
export function UIModalsCapture() {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader icon="Camera" title={t('Capture & Print Modals')} subtitle={t('Photo capture, barcode/QR scan, signature and print surfaces')} />
      <Grid>
        <Specimen icon="Camera" tone="blue" title="Capture Photo">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[rgba(11,31,59,.12)] to-[rgba(10,94,215,.06)]">
            <Icon name="Camera" size={40} className="text-salis-blue opacity-35" />
            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-[rgba(10,94,215,.35)]" />
            <span className="absolute top-3 start-3 rounded-full bg-[rgba(249,115,22,.9)] px-2 py-0.5 text-[10px] font-semibold text-white">{t('LIVE')}</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-inset text-body"><Icon name="Image" size={17} /></span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-salis-blue bg-salis-gradient text-white shadow-[0_6px_16px_rgba(10,94,215,.3)]"><Icon name="Camera" size={22} /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-inset text-body"><Icon name="SwitchCamera" size={17} /></span>
          </div>
          <p className="text-center text-[11px] text-muted" dir="ltr">Attach to JC-A3F8B2C1 · Toyota Camry 2022</p>
        </Specimen>

        <Specimen icon="ScanBarcode" tone="cyan" title="Scan Barcode" actions={[{ label: 'Cancel' }, { label: 'Add to Job', primary: true }]}>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[rgba(11,179,255,.1)] to-[rgba(10,94,215,.05)]">
            <svg viewBox="0 0 160 60" className="w-[62%] opacity-50" aria-hidden>
              <g fill="#0B1F3B">{BARCODE_BARS.map(([x, w]) => <rect key={x} x={x} y="6" width={w} height="48" />)}</g>
            </svg>
            <div className="absolute inset-x-[12%] h-0.5 bg-salis-orange shadow-[0_0_10px_rgba(249,115,22,.7)]" />
          </div>
          <div className="rounded-lg border border-border bg-inset px-3 py-2.5">
            <p className="text-[11px] text-muted">{t('Last scan')}</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-salis-blue" dir="ltr">OF-TY-001</p>
            <p className="mt-0.5 text-xs text-body">{t('Oil Filter (Toyota)')} · 124 {t('in stock')}</p>
          </div>
        </Specimen>

        <Specimen icon="QrCode" tone="navy" title="Scan QR Code">
          <div className="relative flex aspect-square items-center justify-center rounded-xl border border-border bg-gradient-to-br from-[rgba(11,31,59,.08)] to-[rgba(10,94,215,.05)]">
            <Icon name="QrCode" size={72} className="text-heading opacity-30" />
            {QR_CORNERS.map((pos) => <span key={pos} className={cn('absolute h-[26px] w-[26px] border-salis-blue', pos)} />)}
          </div>
          <p className="text-center text-xs text-muted">{t('Point at the vehicle QR tag or a ZATCA invoice code')}</p>
        </Specimen>

        <Specimen icon="PenTool" tone="orange" title="Customer Signature" actions={[{ label: 'Cancel' }, { label: 'Accept Signature', primary: true }]}>
          <div className="relative flex h-[150px] items-center justify-center rounded-xl border-[1.5px] border-dashed border-border bg-inset">
            <svg viewBox="0 0 320 120" className="h-auto w-[88%]" aria-hidden>
              <path d="M24,84 C48,44 62,96 84,66 C104,38 118,92 140,70 C158,52 168,88 188,68 C206,50 220,84 244,58 C262,38 280,66 298,52"
                fill="none" stroke="#0B1F3B" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
            </svg>
            <span className="absolute bottom-3 start-6 end-6 border-t border-border" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border bg-card font-action text-xs font-medium text-body">{t('Clear')}</span>
            <span className="flex-[2] text-center text-[11px] text-muted">Ahmed Al-Rashid · Jul 24, 2026</span>
          </div>
        </Specimen>

        <Specimen icon="Printer" tone="blue" title="Print Preview" actions={[{ label: 'Cancel' }, { label: 'Print', primary: true }]}>
          <div className="flex aspect-[1/1.3] flex-col gap-2 overflow-hidden rounded-lg border border-border bg-white p-4 shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="h-[18px] w-[18px] rounded-[5px] bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF]" />
              <span className="text-[9px] font-extrabold text-[#0B1F3B]">SALIS AUTO</span>
              <span className="flex-1" />
              <span className="font-mono text-[7px] text-[#64748B]" dir="ltr">INV-2026-0142</span>
            </div>
            <div className="h-px bg-[#E2E8F0]" />
            {PRINT_LINES.map(([h, w], i) => <div key={i} className="rounded-sm bg-[#E2E8F0]" style={{ height: h, width: `${w}%` }} />)}
            <div className="flex-1" />
            <div className="h-px bg-[#E2E8F0]" />
            <div className="flex justify-between">
              <span className="text-[8px] text-[#64748B]">{t('Total incl. VAT')}</span>
              <span className="font-mono text-[9px] font-bold text-[#0B1F3B]">SAR 1,840.00</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="flex h-[34px] flex-1 items-center rounded-lg border border-border bg-inset px-2.5 text-xs text-body">{t('A4 · Portrait')}</span>
            <span className="flex h-[34px] flex-1 items-center rounded-lg border border-border bg-inset px-2.5 text-xs text-body">{t('1 copy')}</span>
          </div>
        </Specimen>

        <Specimen icon="Upload" tone="cyan" title="Upload Image" actions={[{ label: 'Cancel' }, { label: 'Upload 3 Images', primary: true }]}>
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-5 py-6 text-center">
            <Icon name="ImagePlus" size={30} className="text-salis-blue" />
            <p className="text-[13px] font-semibold text-heading">{t('Drop images here')}</p>
            <p className="text-[11px] text-muted">JPG, PNG, HEIC · {t('max 10MB each')}</p>
          </div>
          <div className="flex gap-2">
            {[CHIP.blue, CHIP.orange, CHIP.navy].map(([bg, fg], i) => (
              <div key={i} className="relative flex aspect-square flex-1 items-center justify-center rounded-lg border border-border" style={{ background: bg }}>
                <Icon name="Image" size={18} style={{ color: fg }} className="opacity-40" />
                <span aria-hidden className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(11,31,59,.7)] text-[10px] leading-none text-white end-1">&times;</span>
              </div>
            ))}
          </div>
        </Specimen>
      </Grid>
    </>
  )
}

// ── Lifecycle modals ─────────────────────────────────────────────────────────

const LIFECYCLE_BRANCHES = [{ name: 'Riyadh North', detail: 'Al-Nakheel · 2 bays free', on: true }, { name: 'Jeddah Branch', detail: 'Al-Safa · 1 bay free', on: false }, { name: 'Dammam Branch', detail: 'Al-Faisaliah · 3 bays free', on: false }] as const
const MERGE_RECORDS = [{ name: 'Ahmed Al-Rashid', initial: 'A', detail: '+966 55 210 4471 · 3 vehicles · 12 invoices', tag: 'Primary', on: true }, { name: 'Ahmed AlRashid', initial: 'A', detail: '+966 55 210 4471 · 0 vehicles · 1 invoice', tag: 'Duplicate', on: false }] as const

/** Route /ui/modals/lifecycle — transfer, merge, restore, activation and lock workflow dialog variants. */
export function UIModalsLifecycle() {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader icon="ArrowRightLeft" title={t('Lifecycle Modals')} subtitle={t('Transfer, merge, restore, activation and lock workflows')} />
      <Grid>
        <Specimen icon="ArrowRightLeft" tone="blue" title="Transfer Job Card" actions={[{ label: 'Cancel' }, { label: 'Transfer', primary: true }]}>
          <div className="rounded-lg border border-border bg-inset px-3 py-2.5">
            <p className="text-[11px] text-muted">{t('Currently at')}</p>
            <p className="mt-0.5 text-[13px] font-semibold text-heading">Riyadh Main · Bay 3</p>
          </div>
          <Field label="Transfer to">
            <div className="flex flex-col gap-2">
              {LIFECYCLE_BRANCHES.map((b) => (
                <PickRow key={b.name} on={b.on}>
                  <Icon name="MapPin" size={14} className="flex-shrink-0 text-salis-blue" />
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate text-[13px] font-medium text-heading">{t(b.name)}</p>
                    <p className="truncate text-[11px] text-muted">{t(b.detail)}</p>
                  </div>
                </PickRow>
              ))}
            </div>
          </Field>
        </Specimen>

        <Specimen icon="Merge" tone="cyan" title="Merge Customers" actions={[{ label: 'Cancel' }, { label: 'Merge Records', primary: true }]}>
          <p className="max-w-[330px] text-sm leading-relaxed text-muted">{t('Two records look like the same customer. Choose which one to keep as the primary.')}</p>
          {MERGE_RECORDS.map((m) => (
            <PickRow key={m.name} on={m.on}>
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">{m.initial}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{t(m.name)}</p>
                <p className="truncate text-[11px] text-muted" dir="ltr">{m.detail}</p>
              </div>
              <span className={cn('flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium', m.on ? 'bg-[rgba(10,94,215,.12)] text-salis-blue' : 'bg-[rgba(100,116,139,.1)] text-muted')}>{t(m.tag)}</span>
            </PickRow>
          ))}
          <InsetNote icon="ShieldAlert" tone="orange">{t('3 vehicles and 12 invoices will move to the primary record.')}</InsetNote>
        </Specimen>

        <Specimen icon="ArchiveRestore" tone="blue" title="Restore from Archive" actions={[{ label: 'Cancel' }, { label: 'Restore', primary: true }]}>
          <p className="max-w-[330px] text-sm leading-relaxed text-muted">{t('Restore this archived record and return it to the active list.')}</p>
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5">
            <span className="flex flex-shrink-0 rounded-lg bg-[rgba(100,116,139,.1)] p-1.5 text-[#64748B]"><Icon name="Archive" size={14} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-heading" dir="ltr">JC-2025-0884</p>
              <p className="truncate text-[11px] text-muted">{t('Archived')} Dec 18, 2025 · Omar Al-Ghamdi</p>
            </div>
          </div>
        </Specimen>

        <CenteredSpecimen icon="Power" tone="orange" heading="Deactivate User?"
          copy="Faisal Al-Harbi will lose access immediately. Their job history and assignments are kept."
          actions={[{ label: 'Cancel' }, { label: 'Deactivate', orange: true }]} />

        <CenteredSpecimen icon="PowerOff" tone="blue" heading="Activate User?"
          copy="Majed Al-Shehri will regain access with the Technician role and receive an email invite."
          actions={[{ label: 'Cancel' }, { label: 'Activate', primary: true }]} />

        <Specimen icon="Lock" tone="navy" title="Lock Record" actions={[{ label: 'Cancel' }, { label: 'Lock Record', primary: true }]}>
          <p className="max-w-[330px] text-sm leading-relaxed text-muted">{t('Locking prevents further edits. Only managers and above can unlock it again.')}</p>
          <Field label="Reason">
            <textarea rows={3} readOnly placeholder={t('Why is this record being locked?')}
              className="resize-none rounded-lg border border-border bg-inset px-2.5 py-2.5 font-ui text-[13px] text-heading outline-none" />
          </Field>
          <label className="flex items-center gap-2 text-xs text-body">
            <input type="checkbox" readOnly className="h-[15px] w-[15px] accent-salis-blue" />
            {t('Notify the assigned technician')}
          </label>
        </Specimen>
      </Grid>
    </>
  )
}
