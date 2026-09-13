import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { CornerBrackets } from './sections/CornerBrackets'

/** PublicPortal.DealsOffers — a new Tier B page, sibling to Pricing and
 *  Services, Parts & Accessories.
 *
 *  Same dark instrument-panel read as `PartsAccessories` — the "SALIS AUTO
 *  2030" design study's corner-bracket framing in this site's own tokens —
 *  applied to real promotional copy rather than a fictional feature. Every
 *  offer routes to Contact, the one place a signed-out visitor can actually
 *  act on one; there is no coupon-code or checkout flow to fake. */
interface Offer {
  title: string
  body: string
  icon: string
  badge: string
}

const OFFERS: readonly Offer[] = [
  {
    title: 'New customer welcome',
    body: '10% off your first invoice, any service.',
    icon: 'Gift',
    badge: '-10%',
  },
  {
    title: 'Fleet accounts',
    body: 'Volume pricing for five vehicles or more under one account.',
    icon: 'Truck',
    badge: 'FLEET',
  },
  {
    title: 'Brake safety bundle',
    body: 'A free 21-point inspection with any brake service.',
    icon: 'ShieldCheck',
    badge: 'FREE',
  },
  {
    title: 'Referral credit',
    body: 'SAR 50 credit for every workshop you refer that books a service.',
    icon: 'Award',
    badge: 'SAR 50',
  },
  {
    title: 'Seasonal AC check',
    body: 'A free AC inspection with any service booked this season.',
    icon: 'Wind',
    badge: 'FREE',
  },
  {
    title: 'Loyalty discount',
    body: '5% off every third visit at the same branch.',
    icon: 'Percent',
    badge: '-5%',
  },
]

export function PublicDealsOffers() {
  const t = useT()
  usePageMeta({
    title: t('Deals & Offers — SALIS AUTO'),
    description: t('Current promotions for new customers, fleets and loyal workshops'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="Open offers"
        title="Deals & Offers"
        subtitle="Current promotions for new customers, fleets and loyal workshops"
      />
      <div className="relative overflow-hidden rounded-2xl bg-salis-navy p-5 md:p-8">
        <CornerBrackets />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
            <article
              key={offer.title}
              className="relative flex flex-col overflow-hidden rounded-xl border border-white/15 bg-white/[.06] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <Icon name={offer.icon} size={22} className="text-salis-bright" />
                <span
                  dir="ltr"
                  className="rounded-full border border-salis-orange/60 px-2.5 py-0.5 font-mono text-[11px] font-bold text-salis-orange"
                >
                  {offer.badge}
                </span>
              </div>
              <h2 className="mb-1.5 mt-3 text-[15px] font-semibold text-white">{t(offer.title)}</h2>
              <p className="m-0 text-[13px] leading-normal text-white/70">{t(offer.body)}</p>
            </article>
          ))}
        </div>
        <p className="mb-0 mt-6 text-xs text-white/60">
          {t('Offers vary by branch and season, and cannot be combined. Ask at booking, or')}{' '}
          <Link to="/public-portal/contact" className="text-salis-bright">
            {t('contact us')}
          </Link>{' '}
          {t('to confirm what applies to your workshop.')}
        </p>
      </div>
    </div>
  )
}
