import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Search } from '@/components/ui/Search'
import { Money, parseSar } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Part = RowOf<'parts'>
type Status = 'Out of Stock' | 'Low Stock' | 'Available'

/** `parts` has no `category`/`brand`/`compatibility` field — this screen used
 *  to invent all three, plus a "Backordered"/"Discontinued" status no
 *  collection tracks. Dropped rather than filled with placeholders; `status`
 *  is now derived from the same `stock` vs `reorder` comparison
 *  `ProcurementPurchaseOrder.tsx` and `Inventory.tsx` already use to flag a
 *  part for reordering. */
function statusOf(part: Part): Status {
  if (part.stock <= 0) return 'Out of Stock'
  if (part.stock <= part.reorder) return 'Low Stock'
  return 'Available'
}

function statusColor(status: Status) {
  if (status === 'Out of Stock') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  if (status === 'Low Stock') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
}

function priceHalalasOf(part: Part): number {
  return typeof part.priceHalalas === 'number' ? part.priceHalalas : Math.round(parseSar(part.price) * 100)
}

export function SparePartsList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const { data: parts = [], isLoading, isError, error, refetch } = useCollection('parts')

  const filtered = useMemo(() => {
    if (!search.trim()) return parts
    const q = search.toLowerCase()
    return parts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }, [parts, search])

  const available = parts.filter((p) => statusOf(p) === 'Available').length
  const lowStock = parts.filter((p) => statusOf(p) === 'Low Stock').length
  const outOfStock = parts.filter((p) => statusOf(p) === 'Out of Stock').length

  const kpis = [
    { label: t('Total Parts'), value: String(parts.length), icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Available'), value: String(available), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock'), value: String(lowStock), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Out of Stock'), value: String(outOfStock), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  if (isLoading) return <Loading label={t('Loading parts...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const columns: Column<Part>[] = [
    { header: 'Part #', cell: (part) => part.sku, code: true },
    { header: 'Name', cell: (part) => <span className="font-medium text-heading">{part.name}</span> },
    { header: 'Price', cell: (part) => <Money sar={priceHalalasOf(part)} /> },
    { header: 'Stock', cell: (part) => <span className="font-mono text-heading" dir="ltr">{part.stock}</span> },
    { header: 'Reorder At', cell: (part) => <span className="font-mono text-heading" dir="ltr">{part.reorder}</span> },
    { header: 'Status', cell: (part) => <Badge {...statusColor(statusOf(part))}>{t(statusOf(part))}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Spare parts catalog"
      columns={columns}
      rows={filtered}
      rowKey={(part) => part.sku}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No parts found')}</p>}
      mobileCard={(part) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{part.name}</p>
                  <p className="text-xs text-muted" dir="ltr">{part.sku}</p>
                </div>
              </div>
            }
            trailing={<Badge {...statusColor(statusOf(part))}>{t(statusOf(part))}</Badge>}
          />
          <MobileCardRow label={t('Stock')} value={String(part.stock)} />
          <MobileCardRow label={t('Reorder At')} value={String(part.reorder)} />
          <MobileCardRow label={t('Price')}><Money sar={priceHalalasOf(part)} /></MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Wrench" title={t('Spare Parts')} subtitle={t('Catalog')} />
        <Input inputSize="sm" placeholder={t('Search parts...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Wrench" title={t('Spare Parts')} subtitle={t('Parts catalog')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search parts...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
