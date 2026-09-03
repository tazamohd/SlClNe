import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Section, SearchField, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Alert } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/Toast'
import { useCollection } from '@/data/useCollection'
import type { FeatureRow } from '@/data/repository'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  applyFilters,
  BoardView,
  CalendarFeatureView,
  FeatureHeroCard,
  FilterChips,
  GalleryView,
  MonitorView,
  QuickLinksRail,
  SplitView,
  WizardSheet,
} from './FeatureLayouts'
import { withLayout } from './layouts'
import type { FeatureAction, FeatureDef, FeatureSection } from './types'

/** Renders a `FeatureDef` through the feature-screen kit.
 *
 *  Rows come through the repository seam (`featureRows`, keyed by route and
 *  panel, or a real collection when the def binds one), so every kit screen
 *  has the same loading, error and empty states as a designed one and a
 *  sortable, paged table instead of a raw `<table>`. The header is the one
 *  page header, which also gives the ~48 kit routes breadcrumbs and a phone
 *  layout. `layouts.ts` decides the body's shape per route. */
export function FeatureScreenView({ def: base }: { def: FeatureDef }) {
  const def = useMemo(() => withLayout(base), [base])
  const { t } = usePreferences()
  const navigate = useNavigate()
  const toast = useToast()
  const query = useCollection('featureRows', { filter: { route: def.route }, pageSize: 500 })
  const [wizardOpen, setWizardOpen] = useState(false)
  const [active, setActive] = useState<Record<string, string | null>>({})

  const rows = useMemo(() => query.data ?? [], [query.data])
  const primarySection = def.sections?.[0]
  const primaryRows = useMemo(
    () => applyFilters(rows.filter((row) => row.section === primarySection?.title), def.filters, active),
    [rows, primarySection, def.filters, active]
  )

  const run = (action: FeatureAction) => {
    if (action.kind === 'route' && action.to) navigate(action.to)
    else if (action.kind === 'wizard') setWizardOpen(true)
    else if (action.kind === 'toast') toast.show({ title: t(action.message ?? action.label), tone: 'info' })
  }

  const actions = def.actions?.length
    ? def.actions
    : def.action
      ? [{ ...def.action, intent: 'primary' as const, kind: (def.wizard ? 'wizard' : 'toast') as FeatureAction['kind'], message: 'This action needs the live API; nothing was changed.' }]
      : []
  const primary = actions.find((a) => a.intent === 'primary') ?? actions[0]
  const secondary = actions.filter((a) => a !== primary && a.intent !== 'destructive')

  const layout = def.layout ?? 'list'

  return (
    <ScreenFrame
      icon={def.icon}
      title={def.title}
      subtitle={def.subtitle ? t(def.subtitle) : undefined}
      query={query}
      skeleton={layout === 'monitor' ? 'dashboard' : layout === 'gallery' ? 'cards' : 'table'}
      notice={def.notice ? <Alert variant="info">{t(def.notice)}</Alert> : undefined}
      actions={
        <>
          {secondary.map((action) => (
            <Button key={action.label} variant="outline" size="md" icon={action.icon} onClick={() => run(action)}>
              {t(action.label)}
            </Button>
          ))}
          {primary ? (
            <Button
              size="md"
              icon={primary.icon}
              variant={primary.intent === 'destructive' ? 'destructive' : 'primary'}
              onClick={() => run(primary)}
            >
              {t(primary.label)}
            </Button>
          ) : null}
        </>
      }
      toolbar={
        def.filters?.length || def.tabs?.length ? (
          <div className="flex flex-col gap-3">
            {def.tabs?.length ? <TabBar tabs={def.tabs} /> : null}
            {def.filters?.length ? (
              <FilterChips
                filters={def.filters}
                rows={rows.filter((row) => row.section === primarySection?.title)}
                active={active}
                onChange={(id, value) => setActive((prev) => ({ ...prev, [id]: value }))}
              />
            ) : null}
          </div>
        ) : undefined
      }
    >
      {def.hero ? <FeatureHeroCard hero={def.hero} /> : null}
      {def.stats?.length ? <StatRow stats={def.hero ? def.stats.filter((s) => s !== def.hero?.stat) : def.stats} /> : null}

      <LayoutBody def={def} rows={rows} primaryRows={primaryRows} refetch={() => void query.refetch()} refreshing={query.isFetching} />

      {def.quickLinks?.length ? <QuickLinksRail links={def.quickLinks} /> : null}
      {def.wizard ? (
        <WizardSheet def={def} wizard={def.wizard} open={wizardOpen} onClose={() => setWizardOpen(false)} />
      ) : null}
    </ScreenFrame>
  )
}

function LayoutBody({
  def,
  rows,
  primaryRows,
  refetch,
  refreshing,
}: {
  def: FeatureDef
  rows: readonly FeatureRow[]
  primaryRows: readonly FeatureRow[]
  refetch: () => void
  refreshing: boolean
}): ReactNode {
  const primarySection = def.sections?.[0]
  const rest = def.sections?.slice(1) ?? []
  const tail = rest.map((section) => (
    <FeatureSectionView key={section.title} section={section} rows={rows.filter((row) => row.section === section.title)} />
  ))

  switch (def.layout) {
    case 'board':
      return (
        <>
          {def.board ? <BoardView def={def} board={def.board} section={primarySection} rows={primaryRows} /> : null}
          {tail}
        </>
      )
    case 'monitor':
      return (
        <>
          {def.monitor ? (
            <MonitorView monitor={def.monitor} section={primarySection} rows={primaryRows} onRefresh={refetch} refreshing={refreshing} />
          ) : null}
          {tail}
        </>
      )
    case 'calendar':
      return (
        <>
          <CalendarFeatureView calendar={def.calendar} section={primarySection} rows={primaryRows} />
          {def.collection ? <BoundSectionView def={def} /> : tail}
        </>
      )
    case 'split':
      return (
        <>
          <SplitView section={primarySection} rows={primaryRows} />
          {tail}
        </>
      )
    case 'gallery':
      return (
        <>
          <GalleryView section={primarySection} rows={primaryRows} />
          {tail}
        </>
      )
    case 'wizard':
    case 'list':
    default:
      return (
        <>
          {def.collection ? (
            <BoundSectionView def={def} />
          ) : primarySection ? (
            <FeatureSectionView section={primarySection} rows={primaryRows} />
          ) : null}
          {tail}
        </>
      )
  }
}

/** A section bound to a real repository collection. */
function BoundSectionView({ def }: { def: FeatureDef }) {
  const { t } = usePreferences()
  const binding = def.collection!
  const query = useCollection(binding.key, { filter: binding.filter, pageSize: 500 })
  const section = def.sections?.[0]
  const [search, setSearch] = useState('')

  type Row = Record<string, unknown>
  const rows = useMemo(() => {
    const all = (query.data ?? []) as readonly Row[]
    const needle = search.trim().toLowerCase()
    if (!needle) return all
    return all.filter((row) => binding.fields.some((f) => String(row[f.key] ?? '').toLowerCase().includes(needle)))
  }, [query.data, search, binding.fields])

  const columns = useMemo<Column<Row>[]>(
    () =>
      binding.fields.map((field) => ({
        header: field.header,
        key: field.key,
        code: field.code,
        numeric: field.numeric,
        cell: (row) => <>{String(row[field.key] ?? '')}</>,
        sortValue: (row) => {
          const value = row[field.key]
          return typeof value === 'number' ? value : String(value ?? '')
        },
      })),
    [binding.fields]
  )

  return (
    <Section
      title={t(section?.title ?? def.title)}
      subtitle={section?.subtitle ? t(section.subtitle) : undefined}
      toolbar={<SearchField value={search} onChange={setSearch} className="w-full sm:w-[260px]" />}
    >
      <DataTable<Row>
        caption={section?.title ?? def.title}
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        rowKey={(row, index) => String(row._id ?? row.id ?? row[binding.fields[0].key] ?? index)}
        empty={
          <EmptyState
            icon={section?.empty?.icon ?? (search ? 'SearchX' : 'Inbox')}
            title={search ? t('No results') : t(section?.empty?.title ?? 'Nothing here yet')}
            description={search ? t('Nothing matches the current filters.') : section?.empty?.description ? t(section.empty.description) : undefined}
          />
        }
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={String(row[binding.fields[0].key] ?? '')} code={binding.fields[0].code} />
            {binding.fields.slice(1).map((field) => (
              <MobileCardRow key={field.key} label={t(field.header)}>
                <span dir={field.code || field.numeric ? 'ltr' : undefined} className={field.code || field.numeric ? 'font-mono' : undefined}>
                  {String(row[field.key] ?? '')}
                </span>
              </MobileCardRow>
            ))}
          </>
        )}
      />
    </Section>
  )
}

function FeatureSectionView({ section, rows }: { section: FeatureSection; rows: readonly FeatureRow[] }) {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => row.cells.some((cell) => cell.toLowerCase().includes(needle)))
  }, [rows, query])

  const columns = useMemo<Column<FeatureRow>[]>(
    () =>
      (section.columns ?? []).map((header, index) => ({
        header,
        key: `${index}-${header}`,
        cell: (row) => (
          <span className={index === 0 ? 'font-medium text-heading' : 'text-body'}>{row.cells[index]}</span>
        ),
        sortValue: (row) => row.cells[index],
      })),
    [section.columns]
  )

  const empty = (
    <EmptyState
      icon={section.empty?.icon ?? (query ? 'SearchX' : 'Inbox')}
      title={query ? t('No results') : t(section.empty?.title ?? 'Nothing here yet')}
      description={
        query
          ? t('Nothing matches the current filters.')
          : section.empty?.description
            ? t(section.empty.description)
            : undefined
      }
    />
  )

  return (
    <Section
      title={t(section.title)}
      subtitle={section.subtitle ? t(section.subtitle) : undefined}
      toolbar={
        section.searchable ? (
          <SearchField value={query} onChange={setQuery} className="w-full sm:w-[260px]" />
        ) : undefined
      }
    >
      {section.columns ? (
        <DataTable<FeatureRow>
          caption={section.title}
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          empty={empty}
          mobileCard={(row) => (
            <>
              <MobileCardHeader title={row.cells[0]} />
              {row.cells.slice(1).map((cell, cellIndex) => (
                <MobileCardRow key={cellIndex} label={t(section.columns![cellIndex + 1])}>
                  {cell}
                </MobileCardRow>
              ))}
            </>
          )}
        />
      ) : (
        empty
      )}
    </Section>
  )
}
