import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection } from '@/data/useCollection'

type Category = 'all' | 'customers' | 'vehicles' | 'jobs' | 'invoices' | 'parts'

interface SearchResult {
  id: string
  group: string
  groupKey: Exclude<Category, 'all'>
  icon: string
  title: string
  subtitle: string
  badge?: string
  badgeBg?: string
  badgeColor?: string
}

const CATEGORIES: { key: Category; icon: string; label: string }[] = [
  { key: 'all', icon: 'Search', label: 'All' },
  { key: 'customers', icon: 'User', label: 'Customers' },
  { key: 'vehicles', icon: 'Car', label: 'Vehicles' },
  { key: 'jobs', icon: 'ClipboardList', label: 'Job Cards' },
  { key: 'invoices', icon: 'Receipt', label: 'Invoices' },
  { key: 'parts', icon: 'Package', label: 'Parts' },
]

/* This screen was MOCK_ONLY (BLK-004): every result and every "recent
 * search" was a hardcoded fixture, gated behind an offline-only honest
 * message that hid the fact the "live" branch was fabricated too.
 *
 * Now a real cross-entity search: each real collection's own `q` filter
 * (Repository's `matchesSearch`, the same substring match `.list({ q })`
 * already supports everywhere else) runs against `customers`, `vehicles`,
 * `jobs`, `invoices` and `parts`. There is no query-history collection,
 * so "Recent searches" is dropped rather than invented — the search box
 * just starts empty. */
export function GlobalSearch() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('all')

  const q = query.trim()
  const searching = q.length >= 2

  const customers = useCollection('customers', searching ? { q } : undefined)
  const vehicles = useCollection('vehicles', searching ? { q } : undefined)
  const jobs = useCollection('jobs', searching ? { q } : undefined)
  const invoices = useCollection('invoices', searching ? { q } : undefined)
  const parts = useCollection('parts', searching ? { q } : undefined)

  const loading = searching && (customers.isLoading || vehicles.isLoading || jobs.isLoading || invoices.isLoading || parts.isLoading)

  const results = useMemo<SearchResult[]>(() => {
    if (!searching) return []
    const out: SearchResult[] = []
    for (const c of customers.data ?? []) {
      out.push({ id: `c-${c.name}`, group: 'Customers', groupKey: 'customers', icon: 'User', title: c.name, subtitle: `${t('Customer')} · ${c.phone}` })
    }
    for (const v of vehicles.data ?? []) {
      out.push({ id: `v-${v.plate}`, group: 'Vehicles', groupKey: 'vehicles', icon: 'Car', title: v.make, subtitle: `${v.plate} · ${v.owner}`, badge: t(v.status), badgeBg: 'var(--tint-blue)', badgeColor: 'var(--salis-blue)' })
    }
    for (const j of jobs.data ?? []) {
      out.push({ id: `j-${j.id}`, group: 'Job Cards', groupKey: 'jobs', icon: 'ClipboardList', title: j.id, subtitle: `${j.cust} · ${j.veh}`, badge: t((j.st ?? '').replace(/_/g, ' ')), badgeBg: 'var(--tint-bright)', badgeColor: 'var(--salis-blue-bright)' })
    }
    for (const i of invoices.data ?? []) {
      out.push({ id: `i-${i.id}`, group: 'Invoices', groupKey: 'invoices', icon: 'Receipt', title: i.id, subtitle: `${i.cust} · ${i.amount}`, badge: t(i.status), badgeBg: 'var(--tint-orange)', badgeColor: 'var(--salis-orange)' })
    }
    for (const p of parts.data ?? []) {
      out.push({ id: `p-${p.sku}`, group: 'Parts', groupKey: 'parts', icon: 'Package', title: p.name, subtitle: `${p.sku} · ${t('Stock')} ${p.stock}` })
    }
    return out
  }, [searching, customers.data, vehicles.data, jobs.data, invoices.data, parts.data, t])

  const filtered = category === 'all' ? results : results.filter((r) => r.groupKey === category)

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of filtered) {
      const list = map.get(r.group) ?? []
      list.push(r)
      map.set(r.group, list)
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }))
  }, [filtered])

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
          {!searching ? (
            <div className="px-5 py-10 text-center">
              <Icon name="Search" size={32} className="mx-auto mb-2 text-muted" />
              <p className="m-0 text-sm text-muted">{t('Type at least 2 characters to search')}</p>
            </div>
          ) : loading ? (
            <div className="px-5 py-10">
              <Loading label={t('Searching...')} inline />
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
                            item.badge ? (
                              <Badge background={item.badgeBg ?? 'var(--tint-neutral)'} color={item.badgeColor ?? 'var(--text-muted)'}>
                                {item.badge}
                              </Badge>
                            ) : undefined
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
                    <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
                        <Icon name={item.icon} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[13px] font-medium text-heading">{item.title}</p>
                        <p className="m-0 mt-px truncate text-[11px] text-muted">{item.subtitle}</p>
                      </div>
                      {item.badge && (
                        <Badge background={item.badgeBg ?? 'var(--tint-neutral)'} color={item.badgeColor ?? 'var(--text-muted)'}>
                          {item.badge}
                        </Badge>
                      )}
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
      </Card>
    </div>
  )
}
