import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

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
  'In Stock': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Low Stock': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  'Out of Stock': { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
}

export function PurchaseAgentInventory() {
  const { t } = usePreferences()

  const totalItems = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand, 0)
  const totalValue = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand * item.unitCost, 0)

  const kpis = [
    { label: t('Total SKUs'), value: '386', icon: 'Package', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Units on Hand'), value: totalItems.toLocaleString(), icon: 'Boxes', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Inventory Value'), value: `${(totalValue / 1000).toFixed(0)}K SAR`, icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Alerts'), value: '12', icon: 'AlertTriangle', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Package" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Inventory Overview')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Current stock levels and warehouse allocation')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
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
