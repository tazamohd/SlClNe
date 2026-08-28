import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const SUPPLIERS = [
  { code: 'SUP-001', name: 'Al-Rajhi Auto Parts', contact: 'Mohammed Al-Rajhi', phone: '+966 55 123 4567', email: 'info@alrajhiauto.sa', category: 'Parts', rating: 4.8, status: 'Active', ordersCount: 245 },
  { code: 'SUP-002', name: 'Gulf Auto Supply', contact: 'Ahmed Hassan', phone: '+966 50 234 5678', email: 'sales@gulfauto.sa', category: 'Parts', rating: 4.5, status: 'Active', ordersCount: 189 },
  { code: 'SUP-003', name: 'Saudi Lubricants Co.', contact: 'Khalid Ibrahim', phone: '+966 55 345 6789', email: 'orders@saudilube.sa', category: 'Fluids', rating: 4.2, status: 'Active', ordersCount: 156 },
  { code: 'SUP-004', name: 'Riyadh Electrical', contact: 'Omar Farid', phone: '+966 50 456 7890', email: 'contact@riyadhelec.sa', category: 'Electrical', rating: 3.9, status: 'Active', ordersCount: 98 },
  { code: 'SUP-005', name: 'Eastern Parts Hub', contact: 'Yusuf Al-Khatib', phone: '+966 55 567 8901', email: 'supply@easternhub.sa', category: 'Parts', rating: 3.5, status: 'Inactive', ordersCount: 42 },
  { code: 'SUP-006', name: 'Pro Tools Arabia', contact: 'Faisal Nasser', phone: '+966 50 678 9012', email: 'sales@protools.sa', category: 'Tools', rating: 4.6, status: 'Active', ordersCount: 134 },
  { code: 'SUP-007', name: 'Clean Air Parts', contact: 'Tariq Mansour', phone: '+966 55 789 0123', email: 'info@cleanair.sa', category: 'Parts', rating: 4.9, status: 'Active', ordersCount: 210 },
  { code: 'SUP-008', name: 'Jeddah Motor Supply', contact: 'Salem Al-Harbi', phone: '+966 50 890 1234', email: 'orders@jeddahmotor.sa', category: 'Electrical', rating: 3.0, status: 'Pending', ordersCount: 0 },
] as const

type Supplier = (typeof SUPPLIERS)[number]

function statusColor(status: string) {
  if (status === 'Inactive') return { background: 'rgba(249,115,22,.1)', color: '#F97316' }
  if (status === 'Pending') return { background: 'rgba(249,115,22,.1)', color: 'var(--salis-orange)' }
  return { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }
}

export function SuppliersList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return SUPPLIERS
    const q = search.toLowerCase()
    return SUPPLIERS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q),
    )
  }, [search])

  const activeCount = SUPPLIERS.filter((s) => s.status === 'Active').length
  const avgRating = (SUPPLIERS.reduce((sum, s) => sum + s.rating, 0) / SUPPLIERS.length).toFixed(1)
  const totalOrders = SUPPLIERS.reduce((sum, s) => sum + s.ordersCount, 0)

  const kpis = [
    { label: t('Total Suppliers'), value: String(SUPPLIERS.length), icon: 'Building2', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(activeCount), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Rating'), value: avgRating, icon: 'Star', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Orders'), value: String(totalOrders), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Supplier>[] = [
    { header: 'Code', cell: (s) => s.code, code: true },
    { header: 'Name', cell: (s) => <span className="font-medium text-heading">{s.name}</span> },
    { header: 'Contact', cell: (s) => s.contact },
    { header: 'Phone', cell: (s) => <span className="font-mono text-xs text-muted" dir="ltr">{s.phone}</span> },
    { header: 'Category', cell: (s) => t(s.category) },
    { header: 'Rating', cell: (s) => <span className="text-amber-500">{s.rating}</span> },
    { header: 'Orders', cell: (s) => <span className="font-mono text-heading" dir="ltr">{s.ordersCount}</span> },
    { header: 'Status', cell: (s) => <Badge {...statusColor(s.status)}>{t(s.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Suppliers directory"
      columns={columns}
      rows={filtered as unknown as Supplier[]}
      rowKey={(s) => s.code}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No suppliers found')}</p>}
      mobileCard={(s) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Building2" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{s.name}</p>
                  <p className="text-xs text-muted" dir="ltr">{s.code}</p>
                </div>
              </div>
            }
            trailing={<Badge {...statusColor(s.status)}>{t(s.status)}</Badge>}
          />
          <MobileCardRow label={t('Contact')} value={s.contact} />
          <MobileCardRow label={t('Phone')} value={<span dir="ltr">{s.phone}</span>} />
          <MobileCardRow label={t('Category')} value={t(s.category)} />
          <MobileCardRow label={t('Rating')} value={<span className="text-amber-500">{s.rating}</span>} />
          <MobileCardRow label={t('Orders')} value={String(s.ordersCount)} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Suppliers')} subtitle={t('Directory')} />
        <Input inputSize="sm" placeholder={t('Search suppliers...')} value={search} onChange={(e) => setSearch(e.target.value)} />
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
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Building2" title={t('Suppliers')} subtitle={t('Supplier directory')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search suppliers...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
