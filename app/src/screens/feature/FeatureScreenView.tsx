import { useMemo, useState } from 'react'
import { Section, SearchField, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useCollection } from '@/data/useCollection'
import type { FeatureRow } from '@/data/repository'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { FeatureDef, FeatureSection } from './types'

/** Renders a `FeatureDef` through the feature-screen kit.
 *
 *  Rows come through the repository seam (`featureRows`, keyed by route and
 *  panel) rather than from the definition itself, so every kit screen has the
 *  same loading, error and empty states as a designed one, and a sortable,
 *  paged table instead of a raw `<table>`. The header is the one page header,
 *  which also gives the ~48 kit routes breadcrumbs and a phone layout. */
export function FeatureScreenView({ def }: { def: FeatureDef }) {
  const { t } = usePreferences()
  const query = useCollection('featureRows', { filter: { route: def.route }, pageSize: 500 })

  return (
    <ScreenFrame
      icon={def.icon}
      title={def.title}
      subtitle={def.subtitle ? t(def.subtitle) : undefined}
      query={query}
      skeleton="table"
      actions={
        def.action ? (
          <Button size="md" icon={def.action.icon}>
            {t(def.action.label)}
          </Button>
        ) : undefined
      }
    >
      {def.tabs?.length ? <TabBar tabs={def.tabs} /> : null}
      {def.stats?.length ? <StatRow stats={def.stats} /> : null}

      {def.sections?.map((section) => (
        <FeatureSectionView
          key={section.title}
          section={section}
          rows={(query.data ?? []).filter((row) => row.section === section.title)}
        />
      ))}
    </ScreenFrame>
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
