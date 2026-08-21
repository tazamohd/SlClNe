import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()

  const totalItems = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand, 0)
  const totalValue = INVENTORY.reduce((sum, item) => sum + item.qtyOnHand * item.unitCost, 0)

  const kpis = [
    { label: t('Total SKUs'), value: '386', icon: 'Package', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Units on Hand'), value: totalItems.toLocaleString(), icon: 'Boxes', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Inventory Value'), value: `${(totalValue / 1000).toFixed(0)}K SAR`, icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Alerts'), value: '12', icon: 'AlertTriangle', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Package" title={t('Inventory')} subtitle={t('Stock overview')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {INVENTORY.map((item) => (
          <MobileCard key={item.partNumber}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{item.partName}</p>
                    <p className="text-xs text-muted">{item.partNumber}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[item.status].bg} color={STATUS_STYLES[item.status].fg}>{t(item.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(item.category)} />
            <MobileCardRow label={t('Qty on Hand')} value={item.qtyOnHand.toLocaleString()} />
            <MobileCardRow label={t('Reorder Level')} value={String(item.reorderLevel)} />
            <MobileCardRow label={t('Unit Cost')} value={`${item.unitCost.toFixed(2)} SAR`} />
            <MobileCardRow label={t('Warehouse')} value={item.warehouse} />
          </MobileCard>
        ))}
      </div>
    )
  }

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Part Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Qty')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reorder Lvl')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Unit Cost')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Warehouse')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map((item) => (
                <tr key={item.partNumber} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{item.partName}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{item.partNumber}</td>
                  <td className="py-3 pe-4 text-body">{t(item.category)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{item.qtyOnHand.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end font-mono text-body">{item.reorderLevel}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{item.unitCost.toFixed(2)}</td>
                  <td className="py-3 pe-4 text-body">{item.warehouse}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[item.status].bg} color={STATUS_STYLES[item.status].fg}>{t(item.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
