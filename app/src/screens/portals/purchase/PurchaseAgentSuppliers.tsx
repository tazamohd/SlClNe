import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Approved: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Suspended: { bg: 'var(--tint-orange)', fg: '#F97316' },
}

export function PurchaseAgentSuppliers() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Suppliers'), value: '48', icon: 'Building2', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Approved'), value: '36', icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Pending Review'), value: '8', icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Avg Rating'), value: '4.3', icon: 'Star', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Supplier>[] = [
    { header: t('Supplier'), cell: (s) => s.name },
    { header: t('Category'), cell: (s) => t(s.category) },
    { header: t('City'), cell: (s) => s.city },
    { header: t('Rating'), cell: (s) => s.rating },
    { header: t('Orders'), cell: (s) => s.ordersCompleted.toLocaleString() },
    { header: t('Avg Delivery'), cell: (s) => `${s.avgDeliveryDays} ${t('days')}` },
    { header: t('Status'), cell: (s) => <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Building2" title={t('Supplier Directory')} subtitle={t('Browse and manage approved suppliers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Supplier directory"
        columns={columns}
        rows={SUPPLIERS}
        rowKey={(s) => s.name}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.name} trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>} />
            <MobileCardRow label={t('Category')}>{t(s.category)}</MobileCardRow>
            <MobileCardRow label={t('City')}>{s.city}</MobileCardRow>
            <MobileCardRow label={t('Rating')}>{s.rating}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
