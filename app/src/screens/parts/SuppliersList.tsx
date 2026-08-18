import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

function statusColor(status: string) {
  if (status === 'Inactive') return { background: 'rgba(239,68,68,.1)', color: '#EF4444' }
  if (status === 'Pending') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
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
    { label: t('Avg Rating'), value: avgRating, icon: 'Star', bg: 'rgba(245,158,11,.1)', fg: '#F59E0B' },
    { label: t('Total Orders'), value: String(totalOrders), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

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
        {filtered.map((supplier) => (
          <MobileCard key={supplier.code}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Building2" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{supplier.name}</p>
                    <p className="text-xs text-muted" dir="ltr">{supplier.code}</p>
                  </div>
                </div>
              }
              trailing={<Badge {...statusColor(supplier.status)}>{t(supplier.status)}</Badge>}
            />
            <MobileCardRow label={t('Contact')} value={supplier.contact} />
            <MobileCardRow label={t('Phone')} value={<span dir="ltr">{supplier.phone}</span>} />
            <MobileCardRow label={t('Category')} value={t(supplier.category)} />
            <MobileCardRow label={t('Rating')} value={<span className="text-amber-500">{supplier.rating}</span>} />
            <MobileCardRow label={t('Orders')} value={String(supplier.ordersCount)} />
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No suppliers found')}</p>}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Building2" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Suppliers')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Supplier directory')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search suppliers...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Code')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Contact')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Phone')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Rating')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Orders')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={supplier.code} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{supplier.code}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{supplier.name}</td>
                  <td className="py-3 pe-4 text-body">{supplier.contact}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{supplier.phone}</td>
                  <td className="py-3 pe-4 text-body">{t(supplier.category)}</td>
                  <td className="py-3 pe-4 text-end"><span className="text-amber-500">{supplier.rating}</span></td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{supplier.ordersCount}</td>
                  <td className="py-3">
                    <Badge {...statusColor(supplier.status)}>{t(supplier.status)}</Badge>
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
