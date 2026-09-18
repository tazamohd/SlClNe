import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Part = RowOf<'parts'>

/* This screen was MOCK_ONLY (BLK-004): every part row (a Brembo brake pad
 * with an invented shelf location, ...) was a hardcoded fixture, and the
 * search box was a decorative label rather than a real filter.
 *
 * Reads the real `parts` collection SparePartsList.tsx and Inventory.tsx
 * already use. There is no brand, vehicle-compatibility or shelf-location
 * field on this collection, so those columns are dropped rather than
 * invented; "Status" is derived from the same `stock <= reorder` rule
 * Inventory.tsx uses for its own low-stock alerts. */
export function TechnicianAppLookup() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const { data: parts = [], isLoading, isError, error, refetch } = useCollection('parts')

  const q = query.trim().toLowerCase()
  const results = q
    ? parts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    : parts

  const statusOf = (p: Part): 'In Stock' | 'Low Stock' | 'Out of Stock' =>
    p.stock <= 0 ? 'Out of Stock' : p.stock <= p.reorder ? 'Low Stock' : 'In Stock'

  const statusStyle: Record<string, { bg: string; fg: string }> = {
    'In Stock': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    'Low Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    'Out of Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  }

  const columns: Column<Part>[] = [
    { header: t('Part No.'), cell: (p) => p.sku, code: true },
    { header: t('Name'), cell: (p) => p.name },
    { header: t('Stock'), cell: (p) => p.stock },
    { header: t('Price'), cell: (p) => <Money sar={parseSar(p.price)} /> },
    { header: t('Status'), cell: (p) => <Badge background={statusStyle[statusOf(p)].bg} color={statusStyle[statusOf(p)].fg}>{t(statusOf(p))}</Badge> },
  ]

  if (isLoading) return <Loading label={t('Loading parts...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Search" title={t('Parts Lookup')} subtitle={t('Search parts by number or name')} />

      <Card className="rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-salis-blue/[.05] px-3 py-2">
          <Icon name="Search" size={16} className="text-muted" />
          <input
            type="text"
            aria-label={t('Search by part number or name...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search by part number or name...')}
            className="w-full bg-transparent text-sm text-heading outline-none placeholder:text-muted"
          />
        </div>
      </Card>

      <DataTable
        caption="Parts lookup results"
        columns={columns}
        rows={results}
        rowKey={(p) => p.sku}
        empty={<p className="py-8 text-center text-sm text-muted">{t('No parts match this search')}</p>}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.name} trailing={<Badge background={statusStyle[statusOf(p)].bg} color={statusStyle[statusOf(p)].fg}>{t(statusOf(p))}</Badge>} />
            <MobileCardRow label={t('Part No.')}>{p.sku}</MobileCardRow>
            <MobileCardRow label={t('Price')}><Money sar={parseSar(p.price)} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
