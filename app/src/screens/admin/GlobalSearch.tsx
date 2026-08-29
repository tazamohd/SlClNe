import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

type Category = 'all' | 'customers' | 'vehicles' | 'jobs' | 'invoices' | 'parts'

interface SearchResult {
  id: string
  group: string
  groupKey: Category
  icon: string
  title: string
  subtitle: string
  badge: string
  badgeBg: string
  badgeColor: string
}

const CATEGORIES: { key: Category; icon: string; label: string }[] = [
  { key: 'all', icon: 'Search', label: 'All' },
  { key: 'customers', icon: 'User', label: 'Customers' },
  { key: 'vehicles', icon: 'Car', label: 'Vehicles' },
  { key: 'jobs', icon: 'ClipboardList', label: 'Job Cards' },
  { key: 'invoices', icon: 'Receipt', label: 'Invoices' },
  { key: 'parts', icon: 'Package', label: 'Parts' },
]

const FIXTURE_RESULTS: SearchResult[] = [
  { id: '1', group: 'Customers', groupKey: 'customers', icon: 'User', title: 'Ahmed Al-Rashid', subtitle: 'Customer · +966 55 210 4471', badge: 'Loyal', badgeBg: 'var(--tint-blue)', badgeColor: 'var(--salis-blue)' },
  { id: '2', group: 'Job Cards', groupKey: 'jobs', icon: 'ClipboardList', title: 'JC-A3F8B2C1', subtitle: 'Ahmed Al-Rashid · Toyota Camry 2022 · In Progress', badge: 'In Progress', badgeBg: 'var(--tint-bright)', badgeColor: 'var(--salis-blue-bright)' },
  { id: '3', group: 'Vehicles', groupKey: 'vehicles', icon: 'Car', title: 'Toyota Camry 2022', subtitle: 'RUH 4821 · Ahmed Al-Rashid · 42,195 km', badge: 'In Service', badgeBg: 'var(--tint-bright)', badgeColor: 'var(--salis-blue-bright)' },
  { id: '4', group: 'Invoices', groupKey: 'invoices', icon: 'Receipt', title: 'INV-2026-0143', subtitle: 'Ahmed Al-Rashid · SAR 2,116 · Jul 22', badge: 'Pending', badgeBg: 'var(--tint-orange)', badgeColor: 'var(--salis-orange)' },
  { id: '5', group: 'Customers', groupKey: 'customers', icon: 'User', title: 'Sara Al-Mutairi', subtitle: 'Customer · +966 55 891 3344', badge: 'New', badgeBg: 'var(--tint-blue)', badgeColor: 'var(--salis-blue)' },
  { id: '6', group: 'Job Cards', groupKey: 'jobs', icon: 'ClipboardList', title: 'JC-E5D7A3B5', subtitle: 'Sara Al-Mutairi · Ford Explorer 2022', badge: 'Check-In', badgeBg: 'var(--tint-blue)', badgeColor: 'var(--salis-blue)' },
]

const RECENT_SEARCHES = ['Ahmed Al-Rashid', 'Toyota Camry', 'INV-2026', 'Brake pads']

export function GlobalSearch() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let results = FIXTURE_RESULTS
    if (category !== 'all') {
      results = results.filter((r) => r.groupKey === category)
    }
    if (q) {
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q)
      )
    }
    return results
  }, [query, category])

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of filtered) {
      const list = map.get(r.group) ?? []
      list.push(r)
      map.set(r.group, list)
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }))
  }, [filtered])

  if (!isLive) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="Search" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Global Search')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Search across all entities')}</p>
          </div>
        </div>
        <Card className="p-4">
          <EmptyState
            icon="Search"
            title={t('Search requires a live API')}
            description={t('Cross-entity search queries the server. Connect a live API to search customers, vehicles, job cards, invoices and parts.')}
          />
          <p className="mt-1 flex items-start justify-center gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            {t('Connect the API — no data source yet:')}{' '}
            <span dir="ltr" className="font-mono text-body">search</span>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
          <Icon name="Search" size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t('Global Search')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('Search across all entities')}</p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="border-0 border-b border-solid border-border p-4">
          <Input
            icon="Search"
            inputSize="md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search customers, vehicles, invoices...')}
            className="w-full"
            aria-label={t('Global search')}
            autoFocus
          />
        </div>

        <ChipGroup label={t('Filter by category')} className="border-0 border-b border-solid border-border px-4 py-2.5">
          {CATEGORIES.map((cat) => (
            <Chip key={cat.key} label={t(cat.label)} selected={category === cat.key} onToggle={() => setCategory(cat.key)} />
          ))}
        </ChipGroup>

        <div className="max-h-[480px] overflow-y-auto">
          {query.trim() === '' && category === 'all' ? (
            <div className="px-4 py-3">
              <span className="font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('Recent searches')}
              </span>
              <div className="mt-2 flex flex-col gap-0.5">
                {RECENT_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-2 py-2 text-start transition-colors hover:bg-salis-blue/[.04] focus-visible:outline-none focus-visible:bg-salis-blue/[.06]"
                  >
                    <Icon name="Clock" size={14} className="flex-shrink-0 text-muted" />
                    <span className="text-[13px] text-body">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : grouped.length > 0 ? (
            isMobile ? (
              <div className="divide-y divide-border">
                {grouped.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 py-2">
                      <span className="font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {t(group.label)}
                      </span>
                    </div>
                    {group.items.map((item) => (
                      <div key={item.id} className="px-4 py-3 transition-colors hover:bg-salis-blue/[.04]">
                        <MobileCardHeader
                          leading={
                            <div className="flex items-center gap-2.5">
                              <span className="flex rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
                                <Icon name={item.icon} size={14} />
                              </span>
                              <span className="text-[13px] font-semibold text-heading">{item.title}</span>
                            </div>
                          }
                          trailing={
                            <Badge background={item.badgeBg} color={item.badgeColor}>
                              {t(item.badge)}
                            </Badge>
                          }
                        />
                        <MobileCardRow label={t('Details')} value={item.subtitle} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.label}>
                  <div className="px-5 pb-1 pt-2">
                    <span className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                      {t(group.label)}
                    </span>
                  </div>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-5 py-2.5"
                    >
                      <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
                        <Icon name={item.icon} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[13px] font-medium text-heading">{item.title}</p>
                        <p className="m-0 mt-px truncate text-[11px] text-muted">{item.subtitle}</p>
                      </div>
                      <Badge background={item.badgeBg} color={item.badgeColor}>
                        {t(item.badge)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))
            )
          ) : (
            <div className="px-5 py-10 text-center">
              <Icon name="SearchX" size={32} className="mx-auto mb-2 text-muted" />
              <p className="m-0 text-sm text-muted">{t('No results found')}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-0 border-t border-solid border-border px-5 py-2.5">
          <span className="flex items-center gap-1 text-[11px] text-faint">
            <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">&uarr;&darr;</kbd>
            {t('Navigate')}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-faint">
            <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">&crarr;</kbd>
            {t('Open')}
          </span>
          <span className="flex-1" />
          <span className="text-[11px] text-faint">{'⌘K'}</span>
        </div>
      </Card>
    </div>
  )
}
