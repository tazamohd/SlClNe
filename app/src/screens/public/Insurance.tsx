import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Insurance — `project/PublicPortal.Insurance.dc.html`.
 *
 *  Two plan cards: Comprehensive (blue border, "Popular" pill, gradient CTA)
 *  and Third Party (outline CTA). There is no public quoting endpoint — quotes
 *  are handled by the team — so "Get Quote" leads to the Contact page, a real
 *  destination, rather than pretending to start a quote flow. */
interface Plan {
  name: string
  description: string
  price: string
  popular: boolean
}

const PLANS: readonly Plan[] = [
  {
    name: 'Comprehensive',
    description: 'Full coverage including accidents, theft, and natural disasters',
    price: 'SAR 2,400',
    popular: true,
  },
  {
    name: 'Third Party',
    description: 'Mandatory coverage for third-party liability',
    price: 'SAR 850',
    popular: false,
  },
]

export function PublicInsurance() {
  const t = useT()
  usePageMeta({
    title: t('Vehicle Insurance — SALIS AUTO'),
    description: t('Comprehensive and third-party coverage for your vehicles'),
  })

  return (
    <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        title="Vehicle Insurance"
        subtitle="Comprehensive and third-party coverage for your vehicles"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={
              plan.popular
                ? 'rounded-2xl border-2 border-salis-blue bg-card p-6'
                : 'rounded-2xl border border-border bg-card p-6'
            }
          >
            {plan.popular ? (
              <span className="mb-3 inline-flex items-center rounded-full bg-tint-blue px-3 py-1 text-xs font-semibold text-salis-blue">
                {t('Popular')}
              </span>
            ) : null}
            <h2
              className={
                plan.popular
                  ? 'mb-1.5 mt-0 text-xl font-bold text-heading'
                  : 'mb-1.5 mt-3 text-xl font-bold text-heading'
              }
            >
              {t(plan.name)}
            </h2>
            <p className="mb-4 mt-0 text-[13px] text-muted">{t(plan.description)}</p>
            <p className="m-0">
              <span
                dir="ltr"
                className={
                  plan.popular
                    ? 'font-display text-[28px] font-black text-salis-blue'
                    : 'font-display text-[28px] font-black text-heading'
                }
              >
                {plan.price}
              </span>
              <span className="text-sm font-normal text-muted">{t('/year')}</span>
            </p>
            <Link
              to="/public-portal/contact"
              className={
                plan.popular
                  ? 'mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-salis-gradient font-action text-sm font-semibold text-white no-underline hover:no-underline'
                  : 'mt-4 flex h-11 w-full items-center justify-center rounded-lg border-[1.5px] border-salis-blue font-action text-sm font-medium text-salis-blue no-underline hover:no-underline'
              }
            >
              {t('Get Quote')}
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
