import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money } from '@/components/ui/Money'

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
  'In Stock': { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'Low Stock': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  'Out of Stock': { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function TechnicianAppLookup() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Search" title={t('Parts Lookup')} subtitle={t('Search parts and VIN')} />
        <Card className="rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(10,94,215,.05)] px-3 py-2">
            <Icon name="Search" size={16} className="text-muted" />
            <span className="text-sm text-muted">{t('Search by part number, name, or VIN...')}</span>
          </div>
        </Card>
        {PART_RESULTS.map((p) => (
          <MobileCard key={p.partNumber}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{p.name}</p>
                    <p className="text-xs text-muted">{p.partNumber}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>}
            />
            <MobileCardRow label={t('Brand')} value={p.brand} />
            <MobileCardRow label={t('Fits')} value={p.compatibility} />
            <MobileCardRow label={t('Stock')} value={String(p.stock)} />
            <MobileCardRow label={t('Location')} value={p.location} />
            <MobileCardRow label={t('Price')} value={<Money sar={p.price} />} />
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
            <Icon name="Search" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Parts Lookup')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Search parts by number, name, or VIN')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Part No.')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Brand')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Compatibility')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Stock')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Location')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Price')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {PART_RESULTS.map((p) => (
                <tr key={p.partNumber} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{p.partNumber}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{p.name}</td>
                  <td className="py-3 pe-4 text-body">{p.brand}</td>
                  <td className="py-3 pe-4 text-xs text-body">{p.compatibility}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{p.stock}</td>
                  <td className="py-3 pe-4 text-body">{p.location}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={p.price} /></td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>
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
