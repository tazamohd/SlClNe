import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface VendorOrder {
  orderId: string
  workshop: string
  items: string
  qty: number
  total: number
  dueDate: string
  status: 'New' | 'Processing' | 'Shipped' | 'Delivered'
}

interface PerformanceMetric {
  label: string
  value: string
  icon: string
  trend: string
}

const ORDERS: VendorOrder[] = [
  { orderId: 'PO-2026-0851', workshop: 'Salis Main Branch', items: 'Oil Filters (Toyota)', qty: 100, total: 2250, dueDate: 'Aug 20, 2026', status: 'New' },
  { orderId: 'PO-2026-0849', workshop: 'Jeddah Service Center', items: 'Brake Pad Sets', qty: 30, total: 4950, dueDate: 'Aug 19, 2026', status: 'Processing' },
  { orderId: 'PO-2026-0846', workshop: 'Dammam Workshop', items: 'Air Filters (Hyundai)', qty: 80, total: 3040, dueDate: 'Aug 18, 2026', status: 'Shipped' },
  { orderId: 'PO-2026-0842', workshop: 'Salis Main Branch', items: 'Cabin Air Filters', qty: 150, total: 4200, dueDate: 'Aug 16, 2026', status: 'Delivered' },
  { orderId: 'PO-2026-0839', workshop: 'Riyadh North Branch', items: 'Spark Plug Sets', qty: 60, total: 2100, dueDate: 'Aug 15, 2026', status: 'Delivered' },
  { orderId: 'PO-2026-0836', workshop: 'Jeddah Service Center', items: 'Alternators (Nissan)', qty: 8, total: 3040, dueDate: 'Aug 14, 2026', status: 'Delivered' },
]

const METRICS: PerformanceMetric[] = [
  { label: 'On-Time Delivery', value: '97.2%', icon: 'Clock', trend: '+1.4%' },
  { label: 'Order Fill Rate', value: '98.5%', icon: 'CheckCircle', trend: '+0.8%' },
  { label: 'Return Rate', value: '0.3%', icon: 'RotateCcw', trend: '-0.1%' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  New: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Processing: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Shipped: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function VendorSupplierPortal() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const activeOrders = ORDERS.filter((o) => o.status !== 'Delivered')
  const totalRevenue = ORDERS.reduce((sum, o) => sum + o.total, 0)

  const kpis = [
    { label: t('Active Orders'), value: String(activeOrders.length), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Revenue'), value: `${(totalRevenue / 1000).toFixed(1)}K`, icon: 'DollarSign', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Workshops Served'), value: '14', icon: 'Building', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Rating'), value: '4.7', icon: 'Star', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Store" title={t('Vendor Portal')} subtitle={t('Manage orders & performance')} />
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

        <p className="text-[13px] font-bold text-heading">{t('Performance')}</p>
        {METRICS.map((m) => (
          <Card key={m.label} className="flex items-center gap-3 rounded-xl p-3 shadow-sm">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={m.icon} size={14} /></span>
            <div className="flex-1">
              <p className="text-[11px] text-muted">{t(m.label)}</p>
              <p className="font-display text-lg font-black text-heading">{m.value}</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--salis-blue)' }}>{m.trend}</span>
          </Card>
        ))}

        <p className="text-[13px] font-bold text-heading">{t('Recent Orders')}</p>
        {ORDERS.map((o) => (
          <MobileCard key={o.orderId}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="ShoppingCart" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{o.orderId}</p>
                    <p className="text-xs text-muted">{o.workshop}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>}
            />
            <MobileCardRow label={t('Items')} value={o.items} />
            <MobileCardRow label={t('Qty')} value={String(o.qty)} />
            <MobileCardRow label={t('Total')} value={`${o.total.toLocaleString()} SAR`} />
            <MobileCardRow label={t('Due Date')} value={o.dueDate} />
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
            <Icon name="Store" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Vendor Portal')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Orders, deliveries, and performance metrics')}</p>
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

      <div className="grid grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="flex items-center gap-3 rounded-xl p-4 shadow-sm">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue" aria-hidden><Icon name={m.icon} size={18} /></span>
            <div className="flex-1">
              <p className="text-[11px] text-muted">{t(m.label)}</p>
              <p className="mt-0.5 font-display text-xl font-black text-heading" dir="ltr">{m.value}</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--salis-blue)' }}>{m.trend}</span>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Recent Orders')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Order #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Workshop')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Qty')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Total')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.orderId} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono font-semibold text-heading" dir="ltr">{o.orderId}</td>
                  <td className="py-3 pe-4 text-body">{o.workshop}</td>
                  <td className="py-3 pe-4 text-body">{o.items}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{o.qty}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{o.total.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-muted">{o.dueDate}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>
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
