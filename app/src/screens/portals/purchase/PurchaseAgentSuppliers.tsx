import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Supplier {
  name: string
  category: string
  city: string
  rating: number
  ordersCompleted: number
  avgDeliveryDays: number
  status: 'Approved' | 'Pending' | 'Suspended'
}

const SUPPLIERS: Supplier[] = [
  { name: 'Al-Rajhi Auto Parts', category: 'Filters & Lubricants', city: 'Riyadh', rating: 4.8, ordersCompleted: 342, avgDeliveryDays: 2, status: 'Approved' },
  { name: 'Gulf Motor Supply', category: 'Brake Systems', city: 'Jeddah', rating: 4.6, ordersCompleted: 218, avgDeliveryDays: 3, status: 'Approved' },
  { name: 'Eastern Parts Hub', category: 'Engine Components', city: 'Dammam', rating: 4.3, ordersCompleted: 156, avgDeliveryDays: 4, status: 'Approved' },
  { name: 'Saudi Tire Distributors', category: 'Tires & Wheels', city: 'Riyadh', rating: 4.1, ordersCompleted: 89, avgDeliveryDays: 5, status: 'Approved' },
  { name: 'Nada Electrical Co.', category: 'Electrical & Lighting', city: 'Makkah', rating: 3.9, ordersCompleted: 64, avgDeliveryDays: 6, status: 'Pending' },
  { name: 'Al-Madinah Body Parts', category: 'Body & Paint', city: 'Madinah', rating: 4.5, ordersCompleted: 127, avgDeliveryDays: 3, status: 'Approved' },
  { name: 'Hail Auto Accessories', category: 'Accessories', city: 'Hail', rating: 3.7, ordersCompleted: 31, avgDeliveryDays: 7, status: 'Pending' },
  { name: 'Tabuk Motors Wholesale', category: 'Transmission Parts', city: 'Tabuk', rating: 2.8, ordersCompleted: 12, avgDeliveryDays: 9, status: 'Suspended' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Approved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Suspended: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
}

export function PurchaseAgentSuppliers() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Suppliers'), value: '48', icon: 'Building2', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Approved'), value: '36', icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending Review'), value: '8', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Avg Rating'), value: '4.3', icon: 'Star', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Supplier Directory')} subtitle={t('Manage suppliers')} />
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
        {SUPPLIERS.map((s) => (
          <MobileCard key={s.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Building2" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{s.name}</p>
                    <p className="text-xs text-muted">{s.city}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(s.category)} />
            <MobileCardRow label={t('Rating')} value={String(s.rating)} />
            <MobileCardRow label={t('Orders')} value={s.ordersCompleted.toLocaleString()} />
            <MobileCardRow label={t('Avg Delivery')} value={`${s.avgDeliveryDays} ${t('days')}`} />
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
            <Icon name="Building2" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Supplier Directory')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Browse and manage approved suppliers')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('City')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Rating')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Orders')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Avg Delivery')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s) => (
                <tr key={s.name} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{s.name}</td>
                  <td className="py-3 pe-4 text-body">{t(s.category)}</td>
                  <td className="py-3 pe-4 text-body">{s.city}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{s.rating}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{s.ordersCompleted.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end text-body">{s.avgDeliveryDays} {t('days')}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>
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
