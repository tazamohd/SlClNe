import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Money } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type Part = (typeof PARTS)[number]

function statusColor(status: string) {
  if (status === 'Backordered') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  if (status === 'Discontinued') return { background: 'var(--tint-orange)', color: '#F97316' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
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
    { label: t('Total Parts'), value: String(PARTS.length), icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Available'), value: String(available), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Backordered'), value: String(backordered), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Categories'), value: String(categories), icon: 'Tag', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Part>[] = [
    { header: 'Part #', cell: (part) => part.partNumber, code: true },
    { header: 'Name', cell: (part) => <span className="font-medium text-heading">{part.name}</span> },
    { header: 'Brand', cell: (part) => part.brand },
    { header: 'Category', cell: (part) => t(part.category) },
    { header: 'Compatibility', cell: (part) => t(part.compatibility) },
    { header: 'Price', cell: (part) => <Money sar={part.price} /> },
    { header: 'Stock', cell: (part) => <span className="font-mono text-heading" dir="ltr">{part.stock}</span> },
    { header: 'Status', cell: (part) => <Badge {...statusColor(part.status)}>{t(part.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Spare parts catalog"
      columns={columns}
      rows={filtered as unknown as Part[]}
      rowKey={(part) => part.partNumber}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No parts found')}</p>}
      mobileCard={(part) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-[var(--tint-blue)] text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
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
        </>
      )}
    />
  )

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
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Wrench" title={t('Spare Parts')} subtitle={t('Parts catalog')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search parts...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
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
