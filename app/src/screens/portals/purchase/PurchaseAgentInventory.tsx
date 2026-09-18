import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Part = RowOf<'parts'>

/* This screen was MOCK_ONLY (BLK-004): every KPI ("386 Total SKUs", "12
 * Low Stock Alerts", neither derived from the fixture rows below them) and
 * every inventory row (an invented category, warehouse and unit cost) was
 * hardcoded fixture data.
 *
 * Reads the real `parts` collection Inventory.tsx already reads. There is
 * no category or warehouse field on this collection, so those columns are
 * dropped rather than invented; "Status" and "Low Stock Alerts" use the
 * same `stock <= reorder` rule Inventory.tsx uses for its own alerts. */
export function PurchaseAgentInventory() {
  const { t } = usePreferences()
  const { data: parts = [], isLoading, isError, error, refetch } = useCollection('parts')

  const statusOf = (p: Part): 'In Stock' | 'Low Stock' | 'Out of Stock' =>
    p.stock <= 0 ? 'Out of Stock' : p.stock <= p.reorder ? 'Low Stock' : 'In Stock'

  const statusStyle: Record<string, { bg: string; fg: string }> = {
    'In Stock': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    'Low Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    'Out of Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  }

  const totalUnits = parts.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = parts.reduce((sum, p) => sum + p.stock * parseSar(p.price), 0)
  const lowStockCount = parts.filter((p) => p.stock <= p.reorder).length

  const kpis = [
    { label: t('Total SKUs'), value: parts.length.toLocaleString(), icon: 'Package', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Units on Hand'), value: totalUnits.toLocaleString(), icon: 'Boxes', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Inventory Value'), value: `${(totalValue / 1000).toFixed(0)}K SAR`, icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Alerts'), value: String(lowStockCount), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Part>[] = [
    { header: t('Part Name'), cell: (p) => p.name },
    { header: t('Part #'), cell: (p) => p.sku, code: true },
    { header: t('Qty'), cell: (p) => p.stock.toLocaleString() },
    { header: t('Reorder Lvl'), cell: (p) => p.reorder },
    { header: t('Unit Cost'), cell: (p) => <Money sar={parseSar(p.price)} /> },
    { header: t('Status'), cell: (p) => <Badge background={statusStyle[statusOf(p)].bg} color={statusStyle[statusOf(p)].fg}>{t(statusOf(p))}</Badge> },
  ]

  if (isLoading) return <Loading label={t('Loading inventory...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Inventory Overview')} subtitle={t('Current stock levels')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Inventory overview"
        columns={columns}
        rows={parts}
        rowKey={(p) => p.sku}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.name} trailing={<Badge background={statusStyle[statusOf(p)].bg} color={statusStyle[statusOf(p)].fg}>{t(statusOf(p))}</Badge>} />
            <MobileCardRow label={t('Part #')}>{p.sku}</MobileCardRow>
            <MobileCardRow label={t('Qty on Hand')}>{p.stock.toLocaleString()}</MobileCardRow>
            <MobileCardRow label={t('Unit Cost')}><Money sar={parseSar(p.price)} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
