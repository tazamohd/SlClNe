import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const ITEMS = [
  { sku: 'SKU-001', name: 'Oil Filter', category: 'Filters', onHand: 120, reserved: 15, available: 105, reorderPoint: 20, unitCost: 18.50, status: 'In Stock' },
  { sku: 'SKU-002', name: 'Brake Pad Set', category: 'Brakes', onHand: 8, reserved: 3, available: 5, reorderPoint: 10, unitCost: 145.00, status: 'Low Stock' },
  { sku: 'SKU-003', name: 'Spark Plug', category: 'Engine Parts', onHand: 200, reserved: 30, available: 170, reorderPoint: 50, unitCost: 12.75, status: 'In Stock' },
  { sku: 'SKU-004', name: 'Alternator', category: 'Electrical', onHand: 0, reserved: 0, available: 0, reorderPoint: 5, unitCost: 520.00, status: 'Out of Stock' },
  { sku: 'SKU-005', name: 'Engine Oil 5W-30', category: 'Fluids', onHand: 75, reserved: 10, available: 65, reorderPoint: 30, unitCost: 42.00, status: 'In Stock' },
  { sku: 'SKU-006', name: 'Front Bumper', category: 'Body', onHand: 3, reserved: 1, available: 2, reorderPoint: 5, unitCost: 890.00, status: 'Low Stock' },
  { sku: 'SKU-007', name: 'Air Filter', category: 'Filters', onHand: 95, reserved: 5, available: 90, reorderPoint: 20, unitCost: 24.00, status: 'In Stock' },
  { sku: 'SKU-008', name: 'Headlight Assembly', category: 'Electrical', onHand: 0, reserved: 0, available: 0, reorderPoint: 3, unitCost: 675.00, status: 'Out of Stock' },
  { sku: 'SKU-009', name: 'Brake Fluid', category: 'Fluids', onHand: 50, reserved: 8, available: 42, reorderPoint: 15, unitCost: 28.50, status: 'In Stock' },
  { sku: 'SKU-010', name: 'Timing Belt', category: 'Engine Parts', onHand: 6, reserved: 2, available: 4, reorderPoint: 8, unitCost: 185.00, status: 'Low Stock' },
] as const

type Item = (typeof ITEMS)[number]

function statusColor(status: string) {
  if (status === 'Out of Stock') return { background: 'rgba(249,115,22,.1)', color: '#F97316' }
  if (status === 'Low Stock') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
  return { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }
}

export function InventoryManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalValue = useMemo(() => ITEMS.reduce((sum, i) => sum + i.onHand * i.unitCost, 0), [])
  const lowStock = ITEMS.filter((i) => i.status === 'Low Stock').length
  const outOfStock = ITEMS.filter((i) => i.status === 'Out of Stock').length

  const kpis = [
    { label: t('Total SKUs'), value: String(ITEMS.length), icon: 'Package', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(totalValue), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Items'), value: String(lowStock), icon: 'AlertTriangle', bg: 'rgba(245,158,11,.1)', fg: '#F59E0B' },
    { label: t('Out of Stock'), value: String(outOfStock), icon: 'XCircle', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  ]

  const columns: Column<Item>[] = [
    { header: 'SKU', cell: (item) => <span className="font-mono text-xs text-muted" dir="ltr">{item.sku}</span> },
    { header: 'Name', cell: (item) => <span className="font-medium text-heading">{item.name}</span> },
    { header: 'Category', cell: (item) => t(item.category) },
    { header: 'On Hand', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.onHand}</span> },
    { header: 'Reserved', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.reserved}</span> },
    { header: 'Available', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.available}</span> },
    { header: 'Reorder Pt', cell: (item) => <span className="font-mono text-muted" dir="ltr">{item.reorderPoint}</span> },
    { header: 'Unit Cost', cell: (item) => <Money sar={item.unitCost} /> },
    { header: 'Status', cell: (item) => <Badge {...statusColor(item.status)}>{t(item.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Inventory Management')} subtitle={t('Master inventory dashboard')} />

      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
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
        caption="Inventory items"
        columns={columns}
        rows={[...ITEMS] as unknown as Item[]}
        rowKey={(item) => item.sku}
        empty={t('No inventory items found')}
        mobileCard={(item) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{item.name}</p>
                    <p className="text-xs text-muted" dir="ltr">{item.sku}</p>
                  </div>
                </div>
              }
              trailing={<Badge {...statusColor(item.status)}>{t(item.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(item.category)} />
            <MobileCardRow label={t('On Hand / Available')} value={`${item.onHand} / ${item.available}`} />
            <MobileCardRow label={t('Unit Cost')}><Money sar={item.unitCost} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
