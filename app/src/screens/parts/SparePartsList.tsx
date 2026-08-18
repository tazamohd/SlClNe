import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Money } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const PARTS = [
  { partNumber: 'SP-1001', name: 'Oil Filter', brand: 'Toyota Genuine', category: 'OEM', compatibility: 'Toyota', price: 18.50, stock: 120, status: 'Available' },
  { partNumber: 'SP-1002', name: 'Brake Pad Set', brand: 'Brembo', category: 'Aftermarket', compatibility: 'All', price: 145.00, stock: 35, status: 'Available' },
  { partNumber: 'SP-1003', name: 'Spark Plug', brand: 'NGK', category: 'Universal', compatibility: 'All', price: 12.75, stock: 200, status: 'Available' },
  { partNumber: 'SP-1004', name: 'Alternator', brand: 'Hyundai Genuine', category: 'OEM', compatibility: 'Hyundai', price: 520.00, stock: 0, status: 'Backordered' },
  { partNumber: 'SP-1005', name: 'Timing Belt Kit', brand: 'Gates', category: 'Aftermarket', compatibility: 'Toyota', price: 185.00, stock: 15, status: 'Available' },
  { partNumber: 'SP-1006', name: 'Radiator Hose', brand: 'Continental', category: 'Universal', compatibility: 'All', price: 32.00, stock: 0, status: 'Backordered' },
  { partNumber: 'SP-1007', name: 'Headlight Bulb', brand: 'Philips', category: 'Universal', compatibility: 'All', price: 28.50, stock: 80, status: 'Available' },
  { partNumber: 'SP-1008', name: 'Cabin Air Filter', brand: 'Mann', category: 'Aftermarket', compatibility: 'Hyundai', price: 24.00, stock: 60, status: 'Available' },
  { partNumber: 'SP-1009', name: 'Clutch Disc', brand: 'Exedy', category: 'Aftermarket', compatibility: 'Toyota', price: 310.00, stock: 0, status: 'Discontinued' },
  { partNumber: 'SP-1010', name: 'Wheel Bearing', brand: 'SKF', category: 'Universal', compatibility: 'All', price: 95.00, stock: 45, status: 'Available' },
] as const

function statusColor(status: string) {
  if (status === 'Backordered') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
  if (status === 'Discontinued') return { background: 'rgba(239,68,68,.1)', color: '#EF4444' }
  return { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }
}

export function SparePartsList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return PARTS
    const q = search.toLowerCase()
    return PARTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q),
    )
  }, [search])

  const available = PARTS.filter((p) => p.status === 'Available').length
  const backordered = PARTS.filter((p) => p.status === 'Backordered').length
  const categories = new Set(PARTS.map((p) => p.category)).size

  const kpis = [
    { label: t('Total Parts'), value: String(PARTS.length), icon: 'Wrench', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Available'), value: String(available), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Backordered'), value: String(backordered), icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: '#F59E0B' },
    { label: t('Categories'), value: String(categories), icon: 'Tag', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Wrench" title={t('Spare Parts')} subtitle={t('Catalog')} />
        <Input inputSize="sm" placeholder={t('Search parts...')} value={search} onChange={(e) => setSearch(e.target.value)} />
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
        {filtered.map((part) => (
          <MobileCard key={part.partNumber}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{part.name}</p>
                    <p className="text-xs text-muted" dir="ltr">{part.partNumber}</p>
                  </div>
                </div>
              }
              trailing={<Badge {...statusColor(part.status)}>{t(part.status)}</Badge>}
            />
            <MobileCardRow label={t('Brand')} value={part.brand} />
            <MobileCardRow label={t('Category')} value={t(part.category)} />
            <MobileCardRow label={t('Compatibility')} value={t(part.compatibility)} />
            <MobileCardRow label={t('Stock')} value={String(part.stock)} />
            <MobileCardRow label={t('Price')}><Money sar={part.price} /></MobileCardRow>
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No parts found')}</p>}
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
              <Icon name="Wrench" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Spare Parts')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Parts catalog')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search parts...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Part #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Brand')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Compatibility')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Price')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Stock')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((part) => (
                <tr key={part.partNumber} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{part.partNumber}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{part.name}</td>
                  <td className="py-3 pe-4 text-body">{part.brand}</td>
                  <td className="py-3 pe-4 text-body">{t(part.category)}</td>
                  <td className="py-3 pe-4 text-body">{t(part.compatibility)}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={part.price} /></td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{part.stock}</td>
                  <td className="py-3">
                    <Badge {...statusColor(part.status)}>{t(part.status)}</Badge>
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
