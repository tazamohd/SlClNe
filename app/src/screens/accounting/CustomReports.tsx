import { useMemo, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Money, parseSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { Field } from '@/components/shell/AuthCard'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Custom Reports — the report builder.
 *
 *  The design (`CustomReports.dc.html`) draws a static grid of saved reports
 *  with decorative Play/Download buttons and a "Create Report" button that
 *  goes nowhere. There is no `reports` collection in the repository — saved
 *  report definitions are a local list, standing in for the future API read.
 *
 *  What's real: the builder picks an actual collection (jobs, invoices,
 *  expenses, technicians, parts, customers) and an actual field, then
 *  aggregates the live rows on Run — the same kind of chart `Reports.tsx`
 *  draws, from real data. Saving adds the definition to the grid; playing a
 *  saved card re-aggregates its source on demand. `SlidersHorizontal`
 *  replaces the design's unregistered `FileBarChart` — the icon this
 *  codebase already uses for "Custom Reports" on the Reports hub card. `X`
 *  isn't registered either, so it's imported directly from lucide-react. */

const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

const CATEGORIES = ['Finance', 'Operations', 'Inventory', 'CRM', 'Accounting'] as const
type Category = (typeof CATEGORIES)[number]

interface Row {
  label: string
  value: number
}

type SourceKey = 'jobs' | 'invoices' | 'expenses' | 'technicians' | 'parts' | 'customers'

/** `money` marks values as SAR amounts rather than counts — render through `Money`. */
interface Dimension {
  key: string
  label: string
  rows: (rows: readonly unknown[]) => Row[]
}
interface SourceDef {
  label: string
  icon: string
  money: boolean
  dimensions: readonly Dimension[]
}

/** Sums `value(row)` per `key(row)`, largest first — the same reduction
 *  `FinancialReports`/`OperationalReports` use for their bar lists. */
function groupSum<T>(rows: readonly T[], key: (row: T) => string, value: (row: T) => number): Row[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const label = key(row)
    totals.set(label, (totals.get(label) ?? 0) + value(row))
  }
  return [...totals.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

function groupCount<T>(rows: readonly T[], key: (row: T) => string): Row[] {
  return groupSum(rows, key, () => 1)
}

type Job = RowOf<'jobs'>
type Invoice = RowOf<'invoices'>
type Expense = RowOf<'expenses'>
type Technician = RowOf<'technicians'>
type Part = RowOf<'parts'>
type Customer = RowOf<'customers'>

const byValueDesc = (a: Row, b: Row) => b.value - a.value

/** One entry per real collection a report can be built on. Each dimension is
 *  a field the builder's "Group By" picker can stage before Run aggregates
 *  it — the fields are real columns on the row type, not placeholder labels. */
const SOURCES: Record<SourceKey, SourceDef> = {
  jobs: {
    label: 'Jobs',
    icon: 'ClipboardList',
    money: false,
    dimensions: [
      { key: 'status', label: 'Status', rows: (rows) => groupCount(rows as Job[], (j) => j.st.replace(/_/g, ' ')) },
      { key: 'service', label: 'Service Type', rows: (rows) => groupCount(rows as Job[], (j) => j.svc.replace(/_/g, ' ')) },
    ],
  },
  invoices: {
    label: 'Invoices',
    icon: 'FileText',
    money: true,
    dimensions: [
      { key: 'status', label: 'Status', rows: (rows) => groupSum(rows as Invoice[], (i) => i.status, (i) => parseSar(i.amount)) },
      { key: 'customer', label: 'Customer', rows: (rows) => groupSum(rows as Invoice[], (i) => i.cust, (i) => parseSar(i.amount)).slice(0, 8) },
    ],
  },
  expenses: {
    label: 'Expenses',
    icon: 'ReceiptText',
    money: true,
    dimensions: [
      { key: 'category', label: 'Category', rows: (rows) => groupSum(rows as Expense[], (e) => e.category, (e) => parseSar(e.amount)) },
      { key: 'vendor', label: 'Vendor', rows: (rows) => groupSum(rows as Expense[], (e) => e.vendor, (e) => parseSar(e.amount)).slice(0, 8) },
    ],
  },
  technicians: {
    label: 'Technicians',
    icon: 'Users',
    money: false,
    dimensions: [
      { key: 'specialty', label: 'Specialty', rows: (rows) => groupSum(rows as Technician[], (tc) => tc.specialty, (tc) => tc.jobs) },
      { key: 'technician', label: 'Technician', rows: (rows) => (rows as Technician[]).map((tc) => ({ label: tc.name, value: tc.jobs })).sort(byValueDesc) },
    ],
  },
  parts: {
    label: 'Parts',
    icon: 'Package',
    money: false,
    dimensions: [
      { key: 'stock', label: 'Stock Level', rows: (rows) => [...(rows as Part[])].sort((a, b) => a.stock - b.stock).slice(0, 8).map((p) => ({ label: p.name, value: p.stock })) },
    ],
  },
  customers: {
    label: 'Customers',
    icon: 'Heart',
    money: true,
    dimensions: [
      { key: 'spend', label: 'Total Spend', rows: (rows) => (rows as Customer[]).map((c) => ({ label: c.name, value: parseSar(c.spent) })).sort(byValueDesc).slice(0, 8) },
    ],
  },
}

const SOURCE_KEYS = Object.keys(SOURCES) as SourceKey[]

const CARD_ICON_BTN =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-[rgba(10,94,215,.06)] text-salis-blue transition-colors duration-150 hover:bg-[rgba(10,94,215,.12)]'

interface SavedReport {
  id: string
  name: string
  category: Category
  desc: string
  icon: string
  tint: string
  tone: string
  type: 'scheduled' | 'manual'
  lastRun: string
  source: SourceKey
  dimension: string
}

/** Same six reports the design ships, each pointed at the real collection and
 *  field its description already implies (revenue → invoices, technician
 *  performance → technicians, stock aging → parts, ...). Positional fields:
 *  id, name, category, desc, icon, tint, tone, type, lastRun, source, dimension. */
const REPORT_SEED = [
  ['rpt-revenue', 'Monthly Revenue Report', 'Finance', 'Revenue breakdown by service type and branch', 'DollarSign', 'rgba(10,94,215,.1)', '#0A5ED7', 'scheduled', 'Jul 20, 2026', 'invoices', 'status'],
  ['rpt-technician', 'Technician Performance', 'Operations', 'Job completion rates and customer ratings', 'Users', 'rgba(11,179,255,.1)', '#0BB3FF', 'manual', 'Jul 18, 2026', 'technicians', 'technician'],
  ['rpt-inventory', 'Inventory Aging', 'Inventory', 'Parts stock levels and aging analysis', 'Package', 'rgba(249,115,22,.1)', '#F97316', 'scheduled', 'Jul 21, 2026', 'parts', 'stock'],
  ['rpt-retention', 'Customer Retention', 'CRM', 'Repeat visit rates and churn analysis', 'Heart', 'rgba(11,31,59,.1)', '#0B1F3B', 'manual', 'Jul 15, 2026', 'customers', 'spend'],
  ['rpt-workshop', 'Workshop Utilization', 'Operations', 'Bay utilization and capacity planning', 'Wrench', 'rgba(10,94,215,.1)', '#0A5ED7', 'scheduled', 'Jul 19, 2026', 'jobs', 'status'],
  ['rpt-vat', 'VAT Summary', 'Accounting', 'Quarterly VAT collected vs payable', 'Landmark', 'rgba(249,115,22,.1)', '#F97316', 'manual', 'Jun 30, 2026', 'expenses', 'category'],
] as const

const INITIAL_REPORTS: SavedReport[] = REPORT_SEED.map(
  ([id, name, category, desc, icon, tint, tone, type, lastRun, source, dimension]) =>
    ({ id, name, category, desc, icon, tint, tone, type, lastRun, source, dimension }) as SavedReport
)

/** Bar list matching `Reports.tsx`'s `BarList` — no new chart library. */
function MiniBarList({ rows, money }: { rows: readonly Row[]; money: boolean }) {
  const { t } = usePreferences()
  const max = Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="capitalize text-body">{t(row.label)}</span>
            {money ? (
              <Money sar={row.value} className="font-semibold text-heading" />
            ) : (
              <span className="font-mono font-semibold text-heading" dir="ltr">
                {row.value}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (row.value / max) * 100)}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ReportCardProps {
  report: SavedReport
  canDownload: boolean
  onPlay: () => void
  onDownload: () => void
}

function ReportCard({ report, canDownload, onPlay, onDownload }: ReportCardProps) {
  const { t } = usePreferences()
  const [pillBg, pillFg] =
    report.type === 'scheduled' ? ['rgba(10,94,215,.1)', '#0A5ED7'] : ['rgba(100,116,139,.1)', '#64748B']

  return (
    <Card className="flex flex-col gap-3.5 rounded-2xl p-5 transition-all duration-200 hover:border-salis-blue/30 hover:shadow-lg">
      <div className="flex items-center gap-2.5">
        <span className="flex flex-shrink-0 rounded-[10px] p-2" style={{ background: report.tint, color: report.tone }}>
          <Icon name={report.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-heading">{t(report.name)}</h3>
          <p className="mt-0.5 truncate text-[11px] text-muted">{t(report.category)}</p>
        </div>
        <Badge background={pillBg} color={pillFg}>
          {t(report.type === 'scheduled' ? 'Scheduled' : 'Manual')}
        </Badge>
      </div>
      <p className="text-xs text-muted">{t(report.desc)}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-faint">
          {t('Last run')}: <span dir="ltr">{report.lastRun}</span>
        </span>
        <div className="flex flex-shrink-0 gap-1.5">
          <button type="button" onClick={onPlay} aria-label={t('Run')} className={CARD_ICON_BTN}>
            <Icon name="Play" size={13} />
          </button>
          {canDownload ? (
            <button type="button" onClick={onDownload} aria-label={t('Download')} className={CARD_ICON_BTN}>
              <Icon name="Download" size={13} />
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export function CustomReports() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()

  const { data: jobs = [], isLoading: jobsLoading } = useCollection('jobs')
  const { data: invoices = [], isLoading: invoicesLoading } = useCollection('invoices')
  const { data: expenses = [], isLoading: expensesLoading } = useCollection('expenses')
  const { data: technicians = [], isLoading: techLoading } = useCollection('technicians')
  const { data: parts = [], isLoading: partsLoading } = useCollection('parts')
  const { data: customers = [], isLoading: customersLoading } = useCollection('customers')

  const sourceData: Record<SourceKey, readonly unknown[]> = { jobs, invoices, expenses, technicians, parts, customers }
  const sourceLoading = jobsLoading || invoicesLoading || expensesLoading || techLoading || partsLoading || customersLoading

  // `reports:x` is the only non-view right the module grants (README §3's 28
  // modules table); advisor and qc hold `reports:v` alone. They can run and
  // read every saved report, just not save new ones or export them.
  const canManage = can('reports', 'x')

  const [reports, setReports] = useState<SavedReport[]>(INITIAL_REPORTS)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Finance')
  const [source, setSource] = useState<SourceKey>('invoices')
  const [dimension, setDimension] = useState(SOURCES.invoices.dimensions[0].key)
  type Preview = { title: string; sourceLabel: string; money: boolean; rows: Row[] }
  const [preview, setPreview] = useState<Preview | null>(null)

  const filteredReports = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return reports.filter((report) => {
      if (categoryFilter !== 'all' && report.category !== categoryFilter) return false
      if (!needle) return true
      return [report.name, report.desc, report.category].some((field) => field.toLowerCase().includes(needle))
    })
  }, [reports, query, categoryFilter])

  function computeRows(src: SourceKey, dim: string): Row[] {
    const def = SOURCES[src]
    const dimDef = def.dimensions.find((d) => d.key === dim) ?? def.dimensions[0]
    return dimDef.rows(sourceData[src])
  }

  function runReport(title: string, src: SourceKey, dim: string) {
    setPreview({ title, sourceLabel: SOURCES[src].label, money: SOURCES[src].money, rows: computeRows(src, dim) })
  }

  function submitBuilder(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.show({ title: t('Error'), description: t('Give the report a name first.'), error: true })
      return
    }
    runReport(name.trim(), source, dimension)
    toast.show({ title: t('Report generated'), description: t('Preview updated below.') })
  }

  function saveReport() {
    if (!preview) {
      toast.show({ title: t('Error'), description: t('Run the report before saving it.'), error: true })
      return
    }
    const dimLabel = SOURCES[source].dimensions.find((d) => d.key === dimension)?.label ?? dimension
    const next: SavedReport = {
      id: `rpt-${Date.now()}`,
      name: name.trim(),
      category,
      desc: `${t('Grouped by')} ${t(dimLabel)}`,
      icon: SOURCES[source].icon,
      tint: 'rgba(10,94,215,.1)',
      tone: '#0A5ED7',
      type: 'manual',
      lastRun: t('Just now'),
      source,
      dimension,
    }
    setReports((prev) => [next, ...prev])
    toast.show({ title: t('Report saved'), description: t('Added to your saved reports.') })
    setBuilderOpen(false)
    setName('')
    setPreview(null)
  }

  function playReport(report: SavedReport) {
    runReport(t(report.name), report.source, report.dimension)
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, lastRun: t('Just now') } : r)))
    toast.show({ title: t('Report generated'), description: t(report.name) })
  }

  function selectSource(key: SourceKey) {
    setSource(key)
    setDimension(SOURCES[key].dimensions[0].key)
    setPreview(null)
  }

  function downloadReport(report: SavedReport) {
    const rows = computeRows(report.source, report.dimension)
    const csv = ['Label,Value', ...rows.map((row) => `"${row.label.replace(/"/g, '""')}",${row.value}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.id}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.show({ title: t('Download started'), description: `${report.id}.csv` })
  }

  return (
    <>
      <FeatureHeader
        icon="SlidersHorizontal"
        title={t('Custom Reports')}
        subtitle={t('Reports & Analytics')}
        actions={
          <Button size="md" variant={builderOpen ? 'outline' : 'primary'} onClick={() => setBuilderOpen((open) => !open)}>
            {builderOpen ? <X size={16} strokeWidth={2} aria-hidden /> : <Icon name="Plus" size={16} />}
            {builderOpen ? t('Close') : t('Create Report')}
          </Button>
        }
      />
      {builderOpen ? (
        <Section title={t('New Report')} subtitle={t('Pick a source, group it, then run it')}>
          <form onSubmit={submitBuilder} noValidate className="contents">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field label={t('Report Name')} htmlFor="report-name">
                <Input
                  id="report-name"
                  inputSize="md"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t('e.g. Weekly Parts Usage')}
                />
              </Field>
              <Field label={t('Category')}>
                <ChipGroup label={t('Category')}>
                  {CATEGORIES.map((c) => (
                    <Chip key={c} label={t(c)} selected={category === c} onToggle={() => setCategory(c)} />
                  ))}
                </ChipGroup>
              </Field>
            </div>
            <Field label={t('Data Source')}>
              <ChipGroup label={t('Data Source')}>
                {SOURCE_KEYS.map((key) => (
                  <Chip key={key} label={t(SOURCES[key].label)} selected={source === key} onToggle={() => selectSource(key)} />
                ))}
              </ChipGroup>
            </Field>
            <Field label={t('Group By')}>
              <ChipGroup label={t('Group By')}>
                {SOURCES[source].dimensions.map((dim) => (
                  <Chip key={dim.key} label={t(dim.label)} selected={dimension === dim.key} onToggle={() => setDimension(dim.key)} />
                ))}
              </ChipGroup>
            </Field>

            <div className="flex flex-wrap gap-2.5">
              <Button type="submit" variant="outline" size="md" disabled={sourceLoading}>
                <Icon name="Play" size={15} />
                {t('Run')}
              </Button>
              {canManage ? (
                <Button type="button" size="md" onClick={saveReport} disabled={!preview}>
                  <Icon name="Save" size={15} />
                  {t('Save Report')}
                </Button>
              ) : null}
            </div>
          </form>
        </Section>
      ) : null}
      {preview ? (
        <Section title={preview.title} subtitle={`${t('Source')}: ${t(preview.sourceLabel)}`}>
          {preview.rows.length ? (
            <MiniBarList rows={preview.rows} money={preview.money} />
          ) : (
            <EmptyState icon="Inbox" title={t('No data for this grouping')} />
          )}
        </Section>
      ) : null}
      <Section
        title={t('Saved Reports')}
        subtitle={t('Run or export a report you built earlier')}
        toolbar={
          <span className="relative flex flex-shrink-0 items-center">
            <Icon name="Search" size={14} className="pointer-events-none absolute text-muted start-3" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Search reports...')}
              aria-label={t('Search reports...')}
              className="h-9 w-full rounded border border-border bg-inset px-3 ps-8 text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)] sm:w-[200px]"
            />
          </span>
        }
      >
        <ChipGroup label={t('Category')}>
          <Chip label={t('All')} selected={categoryFilter === 'all'} onToggle={() => setCategoryFilter('all')} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={t(c)} selected={categoryFilter === c} onToggle={() => setCategoryFilter(c)} />
          ))}
        </ChipGroup>
        {filteredReports.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                canDownload={canManage}
                onPlay={() => playReport(report)}
                onDownload={() => downloadReport(report)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="SearchX"
            title={t('No reports match your filters')}
            description={t('Try a different search term or category.')}
            action={
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setCategoryFilter('all')
                }}
              >
                {t('Clear filters')}
              </Button>
            }
          />
        )}
      </Section>
    </>
  )
}
