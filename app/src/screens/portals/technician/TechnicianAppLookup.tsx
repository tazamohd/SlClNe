import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface PartResult {
  partNumber: string
  name: string
  brand: string
  compatibility: string
  stock: number
  price: number
  location: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

const PART_RESULTS: PartResult[] = [
  { partNumber: 'BP-TOY-4821', name: 'Front Brake Pads', brand: 'Brembo', compatibility: 'Toyota Camry 2018-2023', stock: 12, price: 280, location: 'Shelf A-12', status: 'In Stock' },
  { partNumber: 'OF-TOY-1100', name: 'Oil Filter', brand: 'Denso', compatibility: 'Toyota Camry 2018-2023', stock: 24, price: 45, location: 'Shelf B-03', status: 'In Stock' },
  { partNumber: 'SP-TOY-2200', name: 'Spark Plugs (Set of 4)', brand: 'NGK', compatibility: 'Toyota Camry 2018-2023', stock: 3, price: 120, location: 'Shelf C-07', status: 'Low Stock' },
  { partNumber: 'AF-TOY-3300', name: 'Air Filter', brand: 'K&N', compatibility: 'Toyota Camry 2018-2023', stock: 0, price: 95, location: '--', status: 'Out of Stock' },
  { partNumber: 'TB-TOY-4400', name: 'Timing Belt Kit', brand: 'Gates', compatibility: 'Toyota Camry 2018-2023', stock: 5, price: 650, location: 'Shelf D-15', status: 'In Stock' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Stock': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Low Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  'Out of Stock': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function TechnicianAppLookup() {
  const { t } = usePreferences()

  const columns: Column<PartResult>[] = [
    { header: t('Part No.'), cell: (p) => p.partNumber },
    { header: t('Name'), cell: (p) => p.name },
    { header: t('Brand'), cell: (p) => p.brand },
    { header: t('Compatibility'), cell: (p) => p.compatibility },
    { header: t('Stock'), cell: (p) => p.stock },
    { header: t('Location'), cell: (p) => p.location },
    { header: t('Price'), cell: (p) => <Money sar={p.price} /> },
    { header: t('Status'), cell: (p) => <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Search" title={t('Parts Lookup')} subtitle={t('Search parts by number, name, or VIN')} />

      <Card className="rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-salis-blue/[.05] px-3 py-2">
          <Icon name="Search" size={16} className="text-muted" />
          <span className="text-sm text-muted">{t('Search by part number, name, or VIN...')}</span>
        </div>
      </Card>

      <DataTable
        caption="Parts lookup results"
        columns={columns}
        rows={PART_RESULTS}
        rowKey={(p) => p.partNumber}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.name} trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>} />
            <MobileCardRow label={t('Part No.')}>{p.partNumber}</MobileCardRow>
            <MobileCardRow label={t('Brand')}>{p.brand}</MobileCardRow>
            <MobileCardRow label={t('Price')}><Money sar={p.price} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
