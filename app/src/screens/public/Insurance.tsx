import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'

/** PublicPortal.Insurance — `project/PublicPortal.Insurance.dc.html`.
 *
 *  Two plan cards: Comprehensive (blue border, "Popular" pill, gradient CTA)
 *  and Third Party (outline CTA). There is no public quoting endpoint — quotes
 *  are handled by the team — so "Get Quote" leads to the Contact page, a real
 *  destination, rather than pretending to start a quote flow.
 *
 *  Previously each plan also carried a fixed annual price ("SAR 2,400",
 *  "SAR 850") presented as real premiums. There is no consumer
 *  insurance-pricing collection anywhere in Repository or
 *  API_REGISTRY.json to back a number — premiums depend on vehicle,
 *  driver and coverage details a quote conversation collects, not a list
 *  price. Follows Pricing.tsx's precedent: describe the coverage, route
 *  to a real quote conversation, publish no invented number. */
interface Plan {
  name: string
  description: string
  features: readonly string[]
  popular: boolean
}

const PLANS: readonly Plan[] = [
  {
    name: 'Comprehensive',
    description: 'Full coverage including accidents, theft, and natural disasters',
    features: [
      'Accident and collision damage',
      'Theft and total loss',
      'Fire and natural disaster damage',
      'Third-party liability included',
    ],
    popular: true,
  },
  {
    name: 'Third Party',
    description: 'Mandatory coverage for third-party liability',
    features: [
      'Third-party injury and property liability',
      'Meets Saudi mandatory coverage requirements',
      'No cover for your own vehicle',
    ],
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
        subtitle="Comprehensive and third-party coverage for your vehicles. We don't publish premiums — they depend on your vehicle and driver details, so ask for a quote."
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
            <ul className="m-0 flex flex-col gap-2 ps-5">
              {plan.features.map((f) => (
                <li key={f} className="text-[13px] text-body">
                  {t(f)}
                </li>
              ))}
            </ul>
            <Link
              to="/public-portal/contact"
              className={
                plan.popular
                  ? 'mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-salis-gradient font-action text-sm font-semibold text-white no-underline hover:no-underline'
                  : 'mt-5 flex h-11 w-full items-center justify-center rounded-lg border-[1.5px] border-salis-blue font-action text-sm font-medium text-salis-blue no-underline hover:no-underline'
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
