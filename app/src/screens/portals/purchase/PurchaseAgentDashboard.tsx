import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

interface RecentOrder {
  id: string
  supplier: string
  items: number
  total: number
  date: string
  status: 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled'
}

const RECENT_ORDERS: RecentOrder[] = [
  { id: 'PO-2401', supplier: 'Al-Futtaim Parts', items: 15, total: 12500, date: '2025-08-17', status: 'In Transit' },
  { id: 'PO-2398', supplier: 'Brembo KSA', items: 8, total: 8400, date: '2025-08-15', status: 'Delivered' },
  { id: 'PO-2395', supplier: 'NGK Middle East', items: 24, total: 3600, date: '2025-08-14', status: 'Delivered' },
  { id: 'PO-2390', supplier: 'Gates Automotive', items: 5, total: 6200, date: '2025-08-12', status: 'Pending' },
  { id: 'PO-2385', supplier: 'Denso Gulf', items: 12, total: 4800, date: '2025-08-10', status: 'Delivered' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Delivered: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'In Transit': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function PurchaseAgentDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Open Orders'), value: '8', icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Monthly Spend'), value: formatSar(45200), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending Approvals'), value: '3', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Active Suppliers'), value: '12', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ShoppingCart" title={t('Purchase Dashboard')} subtitle={t('Agent overview')} />
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
        {RECENT_ORDERS.map((o) => (
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
            <MobileCardRow label={t('Items')} value={String(o.items)} />
            <MobileCardRow label={t('Total')} value={<Money sar={o.total} />} />
            <MobileCardRow label={t('Date')} value={o.date} />
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Purchase Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Purchase agent overview and KPIs')}</p>
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
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Recent Orders')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Order')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Total')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{o.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{o.supplier}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{o.items}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={o.total} /></td>
                  <td className="py-3 pe-4 text-body">{o.date}</td>
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
