import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Section } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { CalendarView, type CalendarEvent } from '@/components/ui/CalendarView'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Drawer } from '@/components/ui/Drawer'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { KanbanView, type KanbanColumn } from '@/components/ui/KanbanView'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Sparkline } from '@/components/ui/Charts'
import { EmptyState } from '@/components/ui/States'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useCreate } from '@/data/useCollection'
import type { FeatureRow } from '@/data/repository'
import { useDateFormat } from '@/lib/formatDate'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import type {
  FeatureBoard,
  FeatureCalendar,
  FeatureDef,
  FeatureField,
  FeatureFilter,
  FeatureHero,
  FeatureMonitor,
  FeatureQuickLink,
  FeatureSection,
  FeatureWizard,
} from './types'

/** The layout-specific blocks of a feature screen. Each takes the def and the
 *  rows the seam returned and renders one purpose-shaped body; the frame,
 *  header, states and actions are `FeatureScreenView`'s. Every block is
 *  honest about what the demo can show: a monitor with no paired device says
 *  so instead of animating invented traffic. */

/* ── Hero figure ─────────────────────────────────────────────────────────── */

export function FeatureHeroCard({ hero }: { hero: FeatureHero }) {
  const { t } = usePreferences()
  return (
    <Card className="flex flex-wrap items-center gap-6 rounded-xl border-transparent bg-salis-gradient p-6 text-white shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white/80">{t(hero.stat.label)}</p>
        <p className="mt-1 flex items-baseline gap-2 font-display text-[44px] font-black leading-none">
          <span dir="ltr" className="tabular-nums">{hero.stat.value}</span>
          {hero.unit ? <span className="text-base font-semibold text-white/80">{t(hero.unit)}</span> : null}
        </p>
        {hero.stat.caption ? <p className="mt-2 text-xs text-white/70">{t(hero.stat.caption)}</p> : null}
      </div>
      {hero.trend && hero.trend.length > 1 ? (
        <Sparkline values={hero.trend} kind="area" width={160} height={48} stroke="white" label={hero.stat.label} />
      ) : null}
    </Card>
  )
}

/* ── Filter chips ────────────────────────────────────────────────────────── */

export function FilterChips({
  filters,
  rows,
  active,
  onChange,
}: {
  filters: readonly FeatureFilter[]
  rows: readonly FeatureRow[]
  active: Readonly<Record<string, string | null>>
  onChange: (id: string, value: string | null) => void
}) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {filters.map((filter) => {
        const options =
          filter.options ??
          [...new Set(rows.map((row) => row.cells[filter.column]).filter(Boolean))].sort()
        if (options.length === 0) return null
        return (
          <ChipGroup key={filter.id} label={t(filter.label)}>
            <span className="me-1 text-[11px] font-semibold uppercase tracking-[.05em] text-muted">{t(filter.label)}</span>
            {options.map((option) => (
              <Chip
                key={option}
                label={`${t(option)} (${rows.filter((row) => row.cells[filter.column] === option).length})`}
                selected={active[filter.id] === option}
                onToggle={() => onChange(filter.id, active[filter.id] === option ? null : option)}
              />
            ))}
          </ChipGroup>
        )
      })}
    </div>
  )
}

export function applyFilters(
  rows: readonly FeatureRow[],
  filters: readonly FeatureFilter[] | undefined,
  active: Readonly<Record<string, string | null>>
): readonly FeatureRow[] {
  if (!filters?.length) return rows
  return rows.filter((row) =>
    filters.every((filter) => {
      const value = active[filter.id]
      return !value || row.cells[filter.column] === value
    })
  )
}

/* ── Related links ───────────────────────────────────────────────────────── */

export function QuickLinksRail({ links }: { links: readonly FeatureQuickLink[] }) {
  const { t, rtl } = usePreferences()
  return (
    <nav aria-label={t('Related')} className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[.05em] text-muted">{t('Related')}</span>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-action text-xs font-medium text-heading no-underline transition-colors hover:border-salis-blue hover:text-salis-blue hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name={link.icon} size={13} />
          {t(link.label)}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={12} className="text-muted" />
        </Link>
      ))}
    </nav>
  )
}

/* ── Board ───────────────────────────────────────────────────────────────── */

function statusColumnIndex(section: FeatureSection | undefined, explicit: number): number {
  if (explicit >= 0) return explicit
  const columns = section?.columns ?? []
  const found = columns.findIndex((header) => /status|stage|state/i.test(header))
  return found >= 0 ? found : Math.max(0, columns.length - 1)
}

export function BoardView({
  def,
  board,
  section,
  rows,
}: {
  def: FeatureDef
  board: FeatureBoard
  section: FeatureSection | undefined
  rows: readonly FeatureRow[]
}) {
  const { t } = usePreferences()
  const groupBy = statusColumnIndex(section, board.groupBy)
  const columns = useMemo<KanbanColumn[]>(() => {
    const buckets = board.columns.map((column) => ({
      id: column.id,
      title: `${t(column.label)}`,
      color: column.tone === 'warning' ? 'var(--salis-orange)' : 'var(--salis-blue)',
      cards: [] as { id: string; content: ReactNode }[],
    }))
    for (const row of rows) {
      const cell = (row.cells[groupBy] ?? '').toLowerCase()
      const target =
        buckets.find((b) => cell === b.id.toLowerCase()) ??
        buckets.find((b) => cell.includes(b.id.toLowerCase())) ??
        buckets[0]
      target?.cards.push({
        id: row.id,
        content: (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold text-heading">{row.cells[0]}</span>
            {row.cells.slice(1).filter((_, i) => i + 1 !== groupBy).slice(0, 2).map((cell, i) => (
              <span key={i} className="text-xs text-muted">{cell}</span>
            ))}
          </div>
        ),
      })
    }
    return buckets.map((b) => ({ ...b, title: `${b.title} · ${b.cards.length}` }))
  }, [board.columns, rows, groupBy, t])

  return (
    <Section title={t(section?.title ?? def.title)} subtitle={section?.subtitle ? t(section.subtitle) : undefined}>
      {rows.length === 0 ? (
        <EmptyState
          icon={section?.empty?.icon ?? 'Kanban'}
          title={t(section?.empty?.title ?? 'Nothing on the board yet')}
          description={section?.empty?.description ? t(section.empty.description) : undefined}
        />
      ) : null}
      <KanbanView columns={columns} />
    </Section>
  )
}

/* ── Monitor ─────────────────────────────────────────────────────────────── */

export function MonitorView({
  monitor,
  section,
  rows,
  onRefresh,
  refreshing,
}: {
  monitor: FeatureMonitor
  section: FeatureSection | undefined
  rows: readonly FeatureRow[]
  onRefresh: () => void
  refreshing: boolean
}) {
  const { t } = usePreferences()
  const { time } = useDateFormat()
  const [updatedAt, setUpdatedAt] = useState(() => new Date())
  const refresh = () => {
    onRefresh()
    setUpdatedAt(new Date())
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {monitor.gauges.map((gauge) => {
          const value = gauge.fromRows ? rows.length : (gauge.value ?? 0)
          const ratio = gauge.max > 0 ? Math.min(1, value / gauge.max) : 0
          const circumference = 2 * Math.PI * 26
          const colour = gauge.tone === 'warning' ? 'var(--salis-orange)' : 'var(--salis-blue)'
          return (
            <Card key={gauge.label} className="flex items-center gap-4 rounded-lg p-4">
              <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`${t(gauge.label)}: ${value} / ${gauge.max}`} className="-rotate-90 flex-shrink-0">
                <circle cx="32" cy="32" r="26" stroke="var(--tint-neutral)" strokeWidth="6" fill="none" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={colour}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(circumference * ratio).toFixed(1)} ${circumference.toFixed(1)}`}
                />
              </svg>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">{t(gauge.label)}</p>
                <p className="font-display text-2xl font-black leading-none text-heading">
                  <span dir="ltr" className="tabular-nums">{value}</span>
                  <span className="text-sm font-semibold text-muted"> / {gauge.max}{gauge.unit ? ` ${t(gauge.unit)}` : ''}</span>
                </p>
              </div>
            </Card>
          )
        })}
      </div>
      <Section
        title={t(monitor.feedTitle)}
        subtitle={`${t('Updated')} ${time(updatedAt)}`}
        toolbar={
          <Button variant="outline" size="sm" icon="RefreshCw" onClick={refresh} loading={refreshing} loadingLabel="Refreshing...">
            {t('Refresh')}
          </Button>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={section?.empty?.icon ?? 'Radio'}
            title={t(section?.empty?.title ?? 'No live signals')}
            description={section?.empty?.description ? t(section.empty.description) : undefined}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 rounded-lg border border-border bg-inset px-3 py-2.5">
                <span aria-hidden className="h-2 w-2 flex-shrink-0 rounded-full bg-salis-blue" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-heading">{row.cells[0]}</span>
                <span className="truncate text-xs text-muted">{row.cells.slice(1).join(' · ')}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}

/* ── Calendar ────────────────────────────────────────────────────────────── */

function dateColumnIndex(section: FeatureSection | undefined, explicit?: number): number {
  if (explicit !== undefined && explicit >= 0) return explicit
  const columns = section?.columns ?? []
  const found = columns.findIndex((header) => /date|time|scheduled|due|when/i.test(header))
  return found >= 0 ? found : 0
}

export function CalendarFeatureView({
  calendar,
  section,
  rows,
}: {
  calendar: FeatureCalendar | undefined
  section: FeatureSection | undefined
  rows: readonly FeatureRow[]
}) {
  const { t } = usePreferences()
  const dateAt = dateColumnIndex(section, calendar?.dateColumn)
  const labelAt = calendar?.labelColumn ?? (dateAt === 0 ? 1 : 0)
  const events = useMemo<CalendarEvent[]>(
    () =>
      rows.flatMap((row) => {
        const parsed = new Date(row.cells[dateAt] ?? '')
        if (Number.isNaN(parsed.getTime())) return []
        return [{ id: row.id, date: parsed.toISOString().slice(0, 10), label: row.cells[labelAt] ?? row.cells[0] }]
      }),
    [rows, dateAt, labelAt]
  )
  return (
    <Section title={t(section?.title ?? 'Schedule')} subtitle={section?.subtitle ? t(section.subtitle) : undefined}>
      {events.length === 0 ? (
        <p className="mb-3 text-[13px] text-muted">
          {t(section?.empty?.title ?? 'Nothing scheduled yet')}
        </p>
      ) : null}
      <CalendarView events={events} />
    </Section>
  )
}

/* ── Split (master / detail) ─────────────────────────────────────────────── */

export function SplitView({ section, rows }: { section: FeatureSection | undefined; rows: readonly FeatureRow[] }) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = rows.find((row) => row.id === selectedId) ?? (isMobile ? null : rows[0] ?? null)
  const columns = section?.columns ?? []

  const detail = selected ? (
    <dl className="m-0 flex flex-col gap-3">
      {selected.cells.map((cell, index) => (
        <div key={index} className="flex flex-col gap-0.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[.05em] text-muted">{t(columns[index] ?? `Field ${index + 1}`)}</dt>
          <dd className="m-0 text-sm text-heading">{cell}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <EmptyState icon="MousePointerClick" title={t('Select an item')} description={t('Its details appear here.')} />
  )

  return (
    <div className={cn('grid gap-6', !isMobile && 'lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]')}>
      <Section title={t(section?.title ?? 'Items')} subtitle={section?.subtitle ? t(section.subtitle) : undefined}>
        {rows.length === 0 ? (
          <EmptyState
            icon={section?.empty?.icon ?? 'Inbox'}
            title={t(section?.empty?.title ?? 'Nothing here yet')}
            description={section?.empty?.description ? t(section.empty.description) : undefined}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  aria-current={selected?.id === row.id ? 'true' : undefined}
                  onClick={() => setSelectedId(row.id)}
                  className={cn(
                    'flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-start transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                    selected?.id === row.id ? 'border-salis-blue bg-tint-blue' : 'border-border bg-card hover:border-salis-blue/50'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-heading">{row.cells[0]}</span>
                    {row.cells[1] ? <span className="block truncate text-xs text-muted">{row.cells[1]}</span> : null}
                  </span>
                  <Icon name="ChevronRight" size={14} className="text-muted rtl:-scale-x-100" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      {isMobile ? (
        <Drawer open={Boolean(selectedId)} onClose={() => setSelectedId(null)} title={selected?.cells[0] ?? t('Details')}>
          {detail}
        </Drawer>
      ) : (
        <Section title={selected?.cells[0] ?? t('Details')}>{detail}</Section>
      )}
    </div>
  )
}

/* ── Gallery ─────────────────────────────────────────────────────────────── */

export function GalleryView({ section, rows }: { section: FeatureSection | undefined; rows: readonly FeatureRow[] }) {
  const { t } = usePreferences()
  return (
    <Section title={t(section?.title ?? 'Gallery')} subtitle={section?.subtitle ? t(section.subtitle) : undefined}>
      {rows.length === 0 ? (
        <EmptyState
          icon={section?.empty?.icon ?? 'Image'}
          title={t(section?.empty?.title ?? 'Nothing here yet')}
          description={section?.empty?.description ? t(section.empty.description) : undefined}
        />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, index) => (
            <li key={row.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
              <div
                aria-hidden
                className="flex h-28 items-center justify-center bg-tint-blue text-salis-blue"
                style={{ background: index % 2 ? 'var(--tint-bright)' : 'var(--tint-blue)' }}
              >
                <Icon name="Image" size={28} />
              </div>
              <div className="flex flex-col gap-1 p-4">
                <span className="text-sm font-semibold text-heading">{row.cells[0]}</span>
                {row.cells.slice(1, 3).map((cell, i) => (
                  <span key={i} className="text-xs text-muted">{cell}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

/* ── Wizard ──────────────────────────────────────────────────────────────── */

export function WizardSheet({
  def,
  wizard,
  open,
  onClose,
}: {
  def: FeatureDef
  wizard: FeatureWizard
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('featureRows')
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const step = wizard.steps[stepIndex]
  const last = stepIndex === wizard.steps.length - 1

  const errorFor = (field: FeatureField): string | null => {
    if (!field.required) return null
    return (values[field.name] ?? '').trim() ? null : t('This field is required.')
  }
  const stepValid = step.fields.every((field) => !errorFor(field))

  const reset = () => {
    setStepIndex(0)
    setValues({})
    setTouched({})
  }

  const submit = async () => {
    const targetSection = wizard.section ?? def.sections?.[0]?.title ?? def.title
    const cells = wizard.steps.flatMap((s) => s.fields.map((f) => values[f.name] ?? ''))
    await create.mutateAsync({
      input: { id: `${def.route}::new::${Date.now()}`, route: def.route, section: targetSection, cells },
    })
    toast.show({ title: t(wizard.done), tone: 'success' })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      variant="data"
      title={def.action?.label ?? def.title}
      icon={def.icon}
      description={`${t('Step')} ${stepIndex + 1} ${t('of')} ${wizard.steps.length} · ${t(step.label)}`}
      footer={
        <>
          {stepIndex > 0 ? (
            <Button variant="ghost" onClick={() => setStepIndex((i) => i - 1)}>
              {t('Back')}
            </Button>
          ) : null}
          <span className="flex-1" />
          {last ? (
            <Button
              onClick={() => void submit()}
              disabled={!stepValid}
              loading={create.isPending}
              loadingLabel="Saving..."
              icon="Check"
            >
              {t(wizard.submit)}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setTouched((prev) => ({ ...prev, ...Object.fromEntries(step.fields.map((f) => [f.name, true])) }))
                if (stepValid) setStepIndex((i) => i + 1)
              }}
              icon="ArrowRight"
            >
              {t('Continue')}
            </Button>
          )}
        </>
      }
    >
      <ol className="m-0 mb-2 flex list-none items-center gap-2 p-0" aria-label={t('Progress')}>
        {wizard.steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              aria-current={i === stepIndex ? 'step' : undefined}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold',
                i < stepIndex ? 'bg-salis-blue/20 text-salis-blue' : i === stepIndex ? 'bg-salis-gradient text-white' : 'bg-inset text-muted'
              )}
            >
              {i < stepIndex ? <Icon name="Check" size={12} /> : i + 1}
            </span>
            <span className={cn('text-xs', i === stepIndex ? 'font-semibold text-heading' : 'text-muted')}>{t(s.label)}</span>
            {i < wizard.steps.length - 1 ? <span aria-hidden className="h-px w-4 bg-border" /> : null}
          </li>
        ))}
      </ol>
      {step.fields.map((field) => {
        const id = `${def.id}-${field.name}`
        const error = touched[field.name] ? errorFor(field) : null
        const common = {
          id,
          value: values[field.name] ?? '',
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${id}-error` : undefined,
          onBlur: () => setTouched((prev) => ({ ...prev, [field.name]: true })),
          dir: field.ltr ? ('ltr' as const) : undefined,
        }
        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="font-action text-xs font-semibold text-heading">
              {t(field.label)}
              {field.required ? <span aria-hidden className="text-salis-orange"> *</span> : null}
            </label>
            {field.type === 'textarea' ? (
              <Textarea {...common} rows={3} invalid={Boolean(error)} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))} />
            ) : field.type === 'select' ? (
              <Select {...common} size="lg" invalid={Boolean(error)} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}>
                <option value="">{t('Select...')}</option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>{t(option)}</option>
                ))}
              </Select>
            ) : (
              <Input
                {...common}
                type={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                inputMode={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'numeric' : undefined}
                placeholder={field.placeholder ? t(field.placeholder) : undefined}
                invalid={Boolean(error)}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              />
            )}
            {error ? (
              <p id={`${id}-error`} role="alert" className="text-xs text-salis-orange">{error}</p>
            ) : null}
          </div>
        )
      })}
    </Modal>
  )
}
