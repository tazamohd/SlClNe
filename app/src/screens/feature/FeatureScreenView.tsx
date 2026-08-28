import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  Section,
  SearchField,
  StatRow,
  TabBar,
} from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { MobileCard, MobileCardHeader, MobileCardRow, MobileList } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { FeatureDef, FeatureSection } from './types'

/** Renders a `FeatureDef` through the feature-screen kit, in both layouts. */
export function FeatureScreenView({ def }: { def: FeatureDef }) {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon={def.icon}
        title={t(def.title)}
        subtitle={def.subtitle ? t(def.subtitle) : undefined}
        actions={
          def.action ? (
            <Button size="md">
              <Icon name={def.action.icon} size={16} />
              {t(def.action.label)}
            </Button>
          ) : undefined
        }
      />

      {def.tabs?.length ? <TabBar tabs={def.tabs} /> : null}
      {def.stats?.length ? <StatRow stats={def.stats} /> : null}

      {def.sections?.map((section) => (
        <FeatureSectionView key={section.title} section={section} />
      ))}
    </>
  )
}

function FeatureSectionView({ section }: { section: FeatureSection }) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const all = section.rows ?? []
    const needle = query.trim().toLowerCase()
    if (!needle) return all
    return all.filter((row) => row.some((cell) => cell.toLowerCase().includes(needle)))
  }, [section.rows, query])

  const body = !section.columns ? null : rows.length === 0 ? (
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
  ) : isMobile ? (
    <MobileList>
      {rows.map((row, index) => (
        <MobileCard key={index}>
          <MobileCardHeader title={row[0]} />
          {row.slice(1).map((cell, cellIndex) => (
            <MobileCardRow key={cellIndex} label={t(section.columns![cellIndex + 1])}>
              {cell}
            </MobileCardRow>
          ))}
        </MobileCard>
      ))}
    </MobileList>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {section.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap border-b border-border px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-[.04em] text-muted"
              >
                {t(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="transition-colors duration-150 hover:bg-salis-blue/[.04]">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={
                    'border-b border-border px-3 py-3 align-middle ' +
                    (cellIndex === 0 ? 'font-medium text-heading' : 'text-body')
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      {body ?? (
        <EmptyState
          icon={section.empty?.icon ?? 'Inbox'}
          title={t(section.empty?.title ?? 'Nothing here yet')}
          description={section.empty?.description ? t(section.empty.description) : undefined}
        />
      )}
    </Section>
  )
}
