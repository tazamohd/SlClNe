import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { TINT_WASH, type Tint } from './sections/tints'

/** PublicPortal.Marketplace — `project/PublicPortal.Marketplace.dc.html`.
 *
 *  A four-column showcase of catalogue items: gradient tile, part name, mono
 *  brand-blue price pinned LTR. Purchasing lives in the authenticated customer
 *  app (`CustomerApp.Marketplace`) and no public product-detail route exists,
 *  so the tiles are a showcase, not links — the design's `cursor:pointer`
 *  led nowhere and is deliberately not reproduced. */
interface Product {
  name: string
  price: string
  icon: string
  tint: Tint
}

const PRODUCTS: readonly Product[] = [
  { name: 'Oil Filter (Toyota)', price: 'SAR 45', icon: 'Droplets', tint: 'blue' },
  { name: 'Brake Pads (Front)', price: 'SAR 310', icon: 'Disc', tint: 'orange' },
  { name: 'Air Filter (Universal)', price: 'SAR 95', icon: 'Wind', tint: 'bright' },
  { name: 'Spark Plug Set', price: 'SAR 140', icon: 'Zap', tint: 'navy' },
  { name: 'Battery 12V', price: 'SAR 380', icon: 'Battery', tint: 'blue' },
  { name: 'Wiper Blades', price: 'SAR 65', icon: 'Waves', tint: 'bright' },
  { name: 'Coolant 4L', price: 'SAR 75', icon: 'Thermometer', tint: 'orange' },
  { name: 'Transmission Fluid', price: 'SAR 120', icon: 'Cog', tint: 'navy' },
]

const TILE_ICON: Record<Tint, string> = {
  blue: 'text-salis-blue',
  bright: 'text-salis-bright',
  orange: 'text-salis-orange',
  navy: 'text-salis-navy dark:text-salis-bright',
}

export function PublicMarketplace() {
  const t = useT()
  usePageMeta({
    title: t('Parts Marketplace — SALIS AUTO'),
    description: t('Quality auto parts delivered to your doorstep'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Parts Marketplace"
        subtitle="Quality auto parts delivered to your doorstep"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <article
            key={product.name}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div
              aria-hidden
              className="flex h-[140px] items-center justify-center"
              style={{ background: TINT_WASH[product.tint] }}
            >
              <Icon
                name={product.icon}
                size={40}
                className={`opacity-30 ${TILE_ICON[product.tint]}`}
              />
            </div>
            <div className="p-3.5">
              {/* h2 (design draws a p): the tile name heads its card, directly
                  under the page h1. */}
              <h2 className="m-0 text-sm font-semibold text-heading">{t(product.name)}</h2>
              <p dir="ltr" className="mb-0 mt-1.5 text-start font-mono text-base font-bold text-salis-blue">
                {product.price}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
