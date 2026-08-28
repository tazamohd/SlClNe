import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface InventoryItem {
  partName: string
  partNumber: string
  category: string
  qtyOnHand: number
  reorderLevel: number
  unitCost: number
  warehouse: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

const INVENTORY: InventoryItem[] = [
  { partName: 'Oil Filter (Toyota)', partNumber: 'OF-TOY-2204', category: 'Filters', qtyOnHand: 245, reorderLevel: 50, unitCost: 22.50, warehouse: 'Riyadh Central', status: 'In Stock' },
  { partName: 'Brake Pad Set (Front)', partNumber: 'BP-UNI-1108', category: 'Brakes', qtyOnHand: 82, reorderLevel: 30, unitCost: 165.00, warehouse: 'Riyadh Central', status: 'In Stock' },
  { partName: 'Air Filter (Hyundai)', partNumber: 'AF-HYU-3301', category: 'Filters', qtyOnHand: 18, reorderLevel: 25, unitCost: 38.00, warehouse: 'Jeddah North', status: 'Low Stock' },
  { partName: 'Spark Plug Set (4-cyl)', partNumber: 'SP-NGK-4401', category: 'Ignition', qtyOnHand: 120, reorderLevel: 40, unitCost: 35.00, warehouse: 'Riyadh Central', status: 'In Stock' },
  { partName: 'Timing Belt (Honda)', partNumber: 'TB-HON-5502', category: 'Engine', qtyOnHand: 0, reorderLevel: 10, unitCost: 195.00, warehouse: 'Dammam East', status: 'Out of Stock' },
  { partName: 'Cabin Air Filter', partNumber: 'CF-UNI-6601', category: 'Filters', qtyOnHand: 310, reorderLevel: 60, unitCost: 28.00, warehouse: 'Riyadh Central', status: 'In Stock' },
  { partName: 'Alternator (Nissan)', partNumber: 'AL-NIS-7704', category: 'Electrical', qtyOnHand: 5, reorderLevel: 8, unitCost: 380.00, warehouse: 'Jeddah North', status: 'Low Stock' },
  { partName: 'Radiator (Toyota Camry)', partNumber: 'RD-TOY-8801', category: 'Cooling', qtyOnHand: 0, reorderLevel: 5, unitCost: 650.00, warehouse: 'Dammam East', status: 'Out of Stock' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Stock': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Low Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  'Out of Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function PurchaseAgentInventory() {
  const { t } = usePreferences()

  const totalItems = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand, 0)
  const totalValue = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand * item.unitCost, 0)

  const kpis = [
    { label: t('Total SKUs'), value: '386', icon: 'Package', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Units on Hand'), value: totalItems.toLocaleString(), icon: 'Boxes', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Inventory Value'), value: `${(totalValue / 1000).toFixed(0)}K SAR`, icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Alerts'), value: '12', icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<InventoryItem>[] = [
    { header: t('Part Name'), cell: (item) => item.partName },
    { header: t('Part #'), cell: (item) => item.partNumber },
    { header: t('Category'), cell: (item) => t(item.category) },
    { header: t('Qty'), cell: (item) => item.qtyOnHand.toLocaleString() },
    { header: t('Reorder Lvl'), cell: (item) => item.reorderLevel },
    { header: t('Unit Cost'), cell: (item) => item.unitCost.toFixed(2) },
    { header: t('Warehouse'), cell: (item) => item.warehouse },
    { header: t('Status'), cell: (item) => <Badge background={STATUS_STYLES[item.status].bg} color={STATUS_STYLES[item.status].fg}>{t(item.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Inventory Overview')} subtitle={t('Current stock levels and warehouse allocation')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Inventory overview"
        columns={columns}
        rows={INVENTORY}
        rowKey={(item) => item.partNumber}
        mobileCard={(item) => (
          <>
            <MobileCardHeader title={item.partName} trailing={<Badge background={STATUS_STYLES[item.status].bg} color={STATUS_STYLES[item.status].fg}>{t(item.status)}</Badge>} />
            <MobileCardRow label={t('Part #')}>{item.partNumber}</MobileCardRow>
            <MobileCardRow label={t('Qty on Hand')}>{item.qtyOnHand.toLocaleString()}</MobileCardRow>
            <MobileCardRow label={t('Warehouse')}>{item.warehouse}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
