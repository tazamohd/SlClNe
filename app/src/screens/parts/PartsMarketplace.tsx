import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const LISTINGS = [
  { partName: 'Oil Filter Premium', supplier: 'Al-Rajhi Auto Parts', price: 22.50, rating: 4.8, deliveryDays: 2, minOrder: 10, inStock: true },
  { partName: 'Brake Pad Set Ceramic', supplier: 'Gulf Auto Supply', price: 165.00, rating: 4.5, deliveryDays: 3, minOrder: 5, inStock: true },
  { partName: 'LED Headlight Kit', supplier: 'Riyadh Motors Co.', price: 280.00, rating: 4.2, deliveryDays: 5, minOrder: 2, inStock: true },
  { partName: 'Timing Belt Kit', supplier: 'Eastern Parts Hub', price: 195.00, rating: 3.8, deliveryDays: 7, minOrder: 1, inStock: false },
  { partName: 'Alternator Rebuilt', supplier: 'Saudi Auto Recyclers', price: 380.00, rating: 3.5, deliveryDays: 4, minOrder: 1, inStock: true },
  { partName: 'Cabin Air Filter', supplier: 'Clean Air Parts', price: 28.00, rating: 4.9, deliveryDays: 1, minOrder: 20, inStock: true },
  { partName: 'Shock Absorber Set', supplier: 'Gulf Auto Supply', price: 420.00, rating: 4.6, deliveryDays: 3, minOrder: 4, inStock: true },
  { partName: 'Radiator Assembly', supplier: 'Al-Rajhi Auto Parts', price: 650.00, rating: 5.0, deliveryDays: 6, minOrder: 1, inStock: false },
] as const

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const stars: string[] = []
  for (let i = 0; i < full; i++) stars.push('★')
  if (half) stars.push('½')
  return stars.join('')
}

export function PartsMarketplace() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Store" title={t('Marketplace')} subtitle={t('Parts marketplace')} />
        {LISTINGS.map((listing, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Store" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{listing.partName}</p>
                    <p className="text-xs text-muted">{listing.supplier}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge
                  background={listing.inStock ? 'var(--tint-blue)' : 'var(--tint-orange)'}
                  color={listing.inStock ? 'var(--salis-blue)' : 'var(--salis-orange)'}
                >
                  {listing.inStock ? t('In Stock') : t('Out of Stock')}
                </Badge>
              }
            />
            <MobileCardRow label={t('Price')}><Money sar={listing.price} /></MobileCardRow>
            <MobileCardRow label={t('Rating')} value={<span className="text-amber-500">{renderStars(listing.rating)} {listing.rating}</span>} />
            <MobileCardRow label={t('Delivery')} value={t(`${listing.deliveryDays} days`)} />
            <MobileCardRow label={t('Min Order')} value={String(listing.minOrder)} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Store" title={t('Parts Marketplace')} subtitle={t('Browse and compare parts from suppliers')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LISTINGS.map((listing, i) => (
          <Card key={i} className="flex flex-col gap-3 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Box" size={16} /></span>
                <h2 className="text-sm font-semibold text-heading">{listing.partName}</h2>
              </div>
              <Badge
                background={listing.inStock ? 'var(--tint-blue)' : 'var(--tint-orange)'}
                color={listing.inStock ? 'var(--salis-blue)' : 'var(--salis-orange)'}
              >
                {listing.inStock ? t('In Stock') : t('Out of Stock')}
              </Badge>
            </div>
            <p className="text-xs text-muted">{listing.supplier}</p>
            <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">{t('Price')}</span>
                <Money sar={listing.price} className="font-semibold text-heading" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t('Rating')}</span>
                <span className="text-amber-500">{renderStars(listing.rating)} {listing.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t('Delivery')}</span>
                <span className="text-body">{t(`${listing.deliveryDays} days`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{t('Min Order')}</span>
                <span className="font-mono text-heading">{listing.minOrder}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
