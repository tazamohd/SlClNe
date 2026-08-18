import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

function statusColor(status: string) {
  if (status === 'Out of Stock') return { background: 'rgba(239,68,68,.1)', color: '#EF4444' }
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
    { label: t('Out of Stock'), value: String(outOfStock), icon: 'XCircle', bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Package" title={t('Inventory')} subtitle={t('Management')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {ITEMS.map((item) => (
          <MobileCard key={item.sku}>
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Inventory Management')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Master inventory dashboard')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('SKU')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('On Hand')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reserved')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Available')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reorder Pt')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Unit Cost')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((item) => (
                <tr key={item.sku} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{item.sku}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{item.name}</td>
                  <td className="py-3 pe-4 text-body">{t(item.category)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{item.onHand}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{item.reserved}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{item.available}</td>
                  <td className="py-3 pe-4 text-end font-mono text-muted" dir="ltr">{item.reorderPoint}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={item.unitCost} /></td>
                  <td className="py-3">
                    <Badge {...statusColor(item.status)}>{t(item.status)}</Badge>
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
