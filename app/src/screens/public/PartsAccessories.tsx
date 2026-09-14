import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { CornerBrackets } from './sections/CornerBrackets'

/** PublicPortal.PartsAccessories — successor to `PublicPortal.Marketplace`.
 *
 *  Renamed and re-scoped from a single flat parts grid to three catalogues —
 *  Services, Parts and Accessories — each framed as a dark instrument panel:
 *  the "SALIS AUTO 2030" design study's HUD read (corner brackets, a mono
 *  eyebrow tag, cyan-on-navy) reproduced with this site's own `salis-navy`/
 *  `salis-bright` tokens rather than that study's literal hex palette, and
 *  filled with real catalogue items rather than its fictional 2030 copy.
 *
 *  Purchasing lives in the authenticated customer app (`CustomerApp.Marketplace`)
 *  and no public product-detail route exists, so every tile is a showcase, not
 *  a link — carried over from the original Marketplace page's own reasoning.
 *  Service prices are starting estimates, not fixed quotes — the footnote
 *  under that catalogue says so, same as the design's own "illustrative"
 *  convention elsewhere on the public site. */
type Tone = 'blue' | 'bright' | 'orange'

interface Item {
  name: string
  price: string
  icon: string
}

interface Catalogue {
  key: string
  eyebrow: string
  title: string
  tone: Tone
  items: readonly Item[]
  footnote?: string
}

const TONE_TEXT: Record<Tone, string> = {
  blue: 'text-salis-blue',
  bright: 'text-salis-bright',
  orange: 'text-salis-orange',
}

const CATALOGUES: readonly Catalogue[] = [
  {
    key: 'services',
    eyebrow: '01 — At the counter',
    title: 'Services',
    tone: 'bright',
    items: [
      { name: 'Oil Change', price: 'From SAR 120', icon: 'Droplets' },
      { name: 'Brake Service', price: 'From SAR 250', icon: 'Disc' },
      { name: 'AC Service', price: 'From SAR 180', icon: 'Wind' },
      { name: 'Battery Replacement', price: 'From SAR 350', icon: 'Battery' },
      { name: 'Tire Rotation', price: 'From SAR 60', icon: 'Disc3' },
      { name: 'Diagnostic Scan', price: 'From SAR 100', icon: 'SearchCheck' },
    ],
    footnote: 'Starting prices — the final quote depends on vehicle and condition, and is always signed before work begins.',
  },
  {
    key: 'parts',
    eyebrow: '02 — In stock',
    title: 'Parts',
    tone: 'blue',
    items: [
      { name: 'Oil Filter (Toyota)', price: 'SAR 45', icon: 'Droplets' },
      { name: 'Brake Pads (Front)', price: 'SAR 310', icon: 'Disc' },
      { name: 'Air Filter (Universal)', price: 'SAR 95', icon: 'Wind' },
      { name: 'Spark Plug Set', price: 'SAR 140', icon: 'Zap' },
      { name: 'Battery 12V', price: 'SAR 380', icon: 'Battery' },
      { name: 'Wiper Blades', price: 'SAR 65', icon: 'Waves' },
      { name: 'Coolant 4L', price: 'SAR 75', icon: 'Thermometer' },
      { name: 'Transmission Fluid', price: 'SAR 120', icon: 'Cog' },
    ],
  },
  {
    key: 'accessories',
    eyebrow: '03 — Add to any visit',
    title: 'Accessories',
    tone: 'orange',
    items: [
      { name: 'Dash Camera', price: 'SAR 220', icon: 'Camera' },
      { name: 'All-Weather Floor Mats', price: 'SAR 150', icon: 'Grid3x3' },
      { name: 'Phone Mount', price: 'SAR 45', icon: 'Smartphone' },
      { name: 'Seat Covers (Set)', price: 'SAR 280', icon: 'Package' },
      { name: 'Car Perfume', price: 'SAR 35', icon: 'Sparkles' },
      { name: 'Emergency Roadside Kit', price: 'SAR 90', icon: 'LifeBuoy' },
    ],
  },
]

function CatalogueSection({ catalogue }: { catalogue: Catalogue }) {
  const t = useT()
  return (
    <section aria-label={t(catalogue.title)} className="mt-10 first:mt-0">
      <div className="relative overflow-hidden rounded-2xl bg-salis-navy p-5 md:p-8">
        <CornerBrackets />
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[.28em] text-salis-bright">
          {t(catalogue.eyebrow)}
        </p>
        <h2 className="mb-5 mt-0 font-display text-xl font-black text-white md:text-2xl">
          {t(catalogue.title)}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalogue.items.map((item) => (
            <article
              key={item.name}
              className="relative overflow-hidden rounded-xl border border-white/15 bg-white/[.06] p-4"
            >
              <Icon name={item.icon} size={22} className={TONE_TEXT[catalogue.tone]} />
              <h3 className="mb-1 mt-3 text-sm font-semibold text-white">{t(item.name)}</h3>
              <p dir="ltr" className={`m-0 text-start font-mono text-sm font-bold ${TONE_TEXT[catalogue.tone]}`}>
                {t(item.price)}
              </p>
            </article>
          ))}
        </div>
        {catalogue.footnote ? (
          <p className="mb-0 mt-5 text-xs text-white/60">{t(catalogue.footnote)}</p>
        ) : null}
      </div>
    </section>
  )
}

export function PublicPartsAccessories() {
  const t = useT()
  usePageMeta({
    title: t('Services, Parts & Accessories — SALIS AUTO'),
    description: t('Workshop services, quality auto parts and accessories, all in one place'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="The catalogue"
        title="Services, Parts & Accessories"
        subtitle="Workshop services, quality auto parts and accessories, all in one place"
      />
      {CATALOGUES.map((catalogue) => (
        <CatalogueSection key={catalogue.key} catalogue={catalogue} />
      ))}
    </div>
  )
}
