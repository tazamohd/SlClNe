import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface ReorderRule {
  id: string
  partName: string
  partNo: string
  minStock: number
  reorderQty: number
  currentStock: number
  supplier: string
  active: boolean
  lastTriggered: string
}

const RULES: ReorderRule[] = [
  { id: 'AR-01', partName: 'Oil Filter 5W-30', partNo: 'OF-5W30', minStock: 20, reorderQty: 50, currentStock: 8, supplier: 'Al-Futtaim Parts', active: true, lastTriggered: '2025-08-15' },
  { id: 'AR-02', partName: 'Brake Pad Set', partNo: 'BP-FRNT', minStock: 10, reorderQty: 25, currentStock: 12, supplier: 'Brembo KSA', active: true, lastTriggered: '2025-08-12' },
  { id: 'AR-03', partName: 'Spark Plug Iridium', partNo: 'SP-IRID', minStock: 30, reorderQty: 100, currentStock: 45, supplier: 'NGK Middle East', active: true, lastTriggered: '2025-08-08' },
  { id: 'AR-04', partName: 'Timing Belt Kit', partNo: 'TB-KIT', minStock: 5, reorderQty: 10, currentStock: 3, supplier: 'Gates Automotive', active: true, lastTriggered: '2025-08-16' },
  { id: 'AR-05', partName: 'Air Filter Universal', partNo: 'AF-UNI', minStock: 15, reorderQty: 40, currentStock: 22, supplier: 'Mann Filter ME', active: false, lastTriggered: '2025-07-20' },
]

export function AutomatedReordering() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Active Rules'), value: String(RULES.filter((r) => r.active).length), icon: 'RotateCcw', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Below Minimum'), value: String(RULES.filter((r) => r.currentStock < r.minStock).length), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
    { label: t('Orders Triggered'), value: '12', icon: 'ShoppingCart', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Total Parts'), value: String(RULES.length), icon: 'Package', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  ]

  const columns: Column<ReorderRule>[] = [
    { header: 'Part', cell: (r) => r.partName },
    { header: 'Part #', cell: (r) => r.partNo, code: true },
    { header: 'Stock', cell: (r) => <span className="font-mono" style={{ color: r.currentStock < r.minStock ? 'rgb(249,115,22)' : undefined }}>{r.currentStock}</span> },
    { header: 'Min Stock', cell: (r) => <span className="font-mono text-muted">{r.minStock}</span> },
    { header: 'Reorder Qty', cell: (r) => <span className="font-mono">{r.reorderQty}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Last Triggered', cell: (r) => r.lastTriggered },
    {
      header: 'Status',
      cell: (r) => (
        <Badge
          background={r.active ? 'rgba(10,94,215,.1)' : 'rgba(107,114,128,.1)'}
          color={r.active ? 'var(--salis-blue)' : 'rgb(107,114,128)'}
        >{t(r.active ? 'Active' : 'Inactive')}</Badge>
      ),
    },
  ]

  const table = (
    <DataTable
      caption="Reorder rules"
      columns={columns}
      rows={RULES}
      rowKey={(r) => r.id}
      mobileCard={(r) => (
        <>
          <MobileCardHeader
            title={r.partName}
            trailing={
              <Badge
                background={r.active ? 'rgba(10,94,215,.1)' : 'rgba(107,114,128,.1)'}
                color={r.active ? 'var(--salis-blue)' : 'rgb(107,114,128)'}
              >{t(r.active ? 'Active' : 'Inactive')}</Badge>
            }
          />
          <MobileCardRow label={t('Stock')} value={`${r.currentStock} / ${r.minStock} ${t('min')}`} />
          <MobileCardRow label={t('Reorder Qty')} value={String(r.reorderQty)} />
          <MobileCardRow label={t('Supplier')} value={r.supplier} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="RotateCcw" title={t('Automated Reordering')} subtitle={t('Auto-replenishment rules')} />
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
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="RotateCcw" title={t('Automated Reordering')} subtitle={t('Auto-replenishment rules and triggers')} />

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

      {table}
    </div>
  )
}
