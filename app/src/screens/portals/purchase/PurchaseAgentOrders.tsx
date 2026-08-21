import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

interface AgentOrder {
  id: string
  supplier: string
  category: string
  items: number
  total: number
  ordered: string
  status: 'Draft' | 'Submitted' | 'Confirmed' | 'Shipped' | 'Received' | 'Cancelled'
}

const ORDERS: AgentOrder[] = [
  { id: 'AGO-1201', supplier: 'Al-Futtaim Parts', category: 'Brake Systems', items: 15, total: 12500, ordered: '2025-08-17', status: 'Confirmed' },
  { id: 'AGO-1198', supplier: 'Brembo KSA', category: 'Brake Pads', items: 8, total: 8400, ordered: '2025-08-15', status: 'Shipped' },
  { id: 'AGO-1195', supplier: 'NGK Middle East', category: 'Spark Plugs', items: 24, total: 3600, ordered: '2025-08-14', status: 'Received' },
  { id: 'AGO-1192', supplier: 'Gates Automotive', category: 'Belts & Hoses', items: 5, total: 6200, ordered: '2025-08-12', status: 'Draft' },
  { id: 'AGO-1189', supplier: 'Denso Gulf', category: 'Electrical', items: 12, total: 4800, ordered: '2025-08-10', status: 'Received' },
  { id: 'AGO-1186', supplier: 'Mann Filter ME', category: 'Filters', items: 30, total: 2100, ordered: '2025-08-08', status: 'Submitted' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Submitted: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Confirmed: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  Shipped: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Received: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function PurchaseAgentOrders() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Orders'), value: String(ORDERS.length), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(37600), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('In Transit'), value: '1', icon: 'Truck', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Received'), value: '2', icon: 'PackageCheck', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ShoppingCart" title={t('Orders')} subtitle={t('Purchase agent orders')} />
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
        {ORDERS.map((o) => (
          <MobileCard key={o.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="ShoppingCart" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{o.id}</p>
                    <p className="text-xs text-muted">{o.supplier}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(o.category)} />
            <MobileCardRow label={t('Items')} value={String(o.items)} />
            <MobileCardRow label={t('Total')} value={<Money sar={o.total} />} />
            <MobileCardRow label={t('Ordered')} value={o.ordered} />
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
            <Icon name="ShoppingCart" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Orders')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Purchase agent order management')}</p>
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
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('All Orders')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Order')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Total')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Ordered')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{o.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{o.supplier}</td>
                  <td className="py-3 pe-4 text-body">{t(o.category)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{o.items}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={o.total} /></td>
                  <td className="py-3 pe-4 text-body">{o.ordered}</td>
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
