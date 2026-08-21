import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
    { label: t('Below Minimum'), value: String(RULES.filter((r) => r.currentStock < r.minStock).length), icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('Orders Triggered'), value: '12', icon: 'ShoppingCart', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Total Parts'), value: String(RULES.length), icon: 'Package', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  ]

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
        {RULES.map((r) => (
          <MobileCard key={r.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.partName}</p>
                    <p className="text-xs text-muted">{r.partNo}</p>
                  </div>
                </div>
              }
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
            <MobileCardRow label={t('Last Triggered')} value={r.lastTriggered} />
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
            <Icon name="RotateCcw" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Automated Reordering')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Auto-replenishment rules and triggers')}</p>
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
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Reorder Rules')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Part')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part #')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Stock')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Min Stock')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reorder Qty')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Last Triggered')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.partName}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{r.partNo}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" style={{ color: r.currentStock < r.minStock ? 'rgb(239,68,68)' : undefined }}>{r.currentStock}</td>
                  <td className="py-3 pe-4 text-end font-mono text-muted">{r.minStock}</td>
                  <td className="py-3 pe-4 text-end font-mono text-body">{r.reorderQty}</td>
                  <td className="py-3 pe-4 text-body">{r.supplier}</td>
                  <td className="py-3 pe-4 text-body">{r.lastTriggered}</td>
                  <td className="py-3">
                    <Badge
                      background={r.active ? 'rgba(10,94,215,.1)' : 'rgba(107,114,128,.1)'}
                      color={r.active ? 'var(--salis-blue)' : 'rgb(107,114,128)'}
                    >{t(r.active ? 'Active' : 'Inactive')}</Badge>
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
