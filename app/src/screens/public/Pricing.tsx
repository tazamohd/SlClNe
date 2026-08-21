import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { cn } from '@/lib/cn'

/** PublicPortal.Pricing — Tier B content page.
 *
 *  Three plan cards in a responsive row. Professional is visually highlighted
 *  with a ring. CTAs point to real destinations — register for free, or
 *  request-demo for paid tiers. */
interface Plan {
  name: string
  price: string
  period?: string
  features: readonly string[]
  cta: string
  to: string
  highlighted?: boolean
}

const PLANS: readonly Plan[] = [
  {
    name: 'Starter',
    price: 'Free',
    features: [
      '1 branch location',
      'Up to 5 users',
      'Basic job card management',
      'Customer database',
      'Standard invoicing',
      'Email support',
    ],
    cta: 'Get Started',
    to: '/register',
  },
  {
    name: 'Professional',
    price: 'SAR 499',
    period: '/mo',
    features: [
      'Up to 3 branches',
      'Up to 25 users',
      'Full ERP modules',
      'Inventory management',
      'Financial reporting',
      'CRM and marketing tools',
      'API access',
      'Priority support',
    ],
    cta: 'Request Demo',
    to: '/public-portal/request-demo',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Sales',
    features: [
      'Unlimited branches',
      'Unlimited users',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      'SLA guarantees',
      'On-site training',
      'White-label options',
    ],
    cta: 'Contact Sales',
    to: '/public-portal/request-demo',
  },
]

export function PublicPricing() {
  const t = useT()
  usePageMeta({
    title: t('Pricing — SALIS AUTO'),
    description: t('Flexible pricing plans for automotive workshops of every size'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Pricing Plans"
        subtitle="Flexible plans that grow with your workshop — start free, scale when ready"
      />
      <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'flex flex-1 flex-col rounded-2xl border border-default bg-card p-6',
              plan.highlighted && 'ring-2 ring-[var(--salis-blue)]'
            )}
          >
            <h2 className="mb-1 mt-0 text-lg font-bold text-heading">{t(plan.name)}</h2>
            <p className="mb-5 mt-0 text-2xl font-black text-heading">
              {t(plan.price)}
              {plan.period ? (
                <span className="text-base font-normal text-muted">{plan.period}</span>
              ) : null}
            </p>
            <ul className="mb-6 mt-0 flex flex-1 flex-col gap-2.5 ps-5">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-body">
                  {t(f)}
                </li>
              ))}
            </ul>
            <Link
              to={plan.to}
              className={cn(
                'block rounded-lg py-2.5 text-center text-sm font-semibold no-underline transition-colors',
                plan.highlighted
                  ? 'bg-salis-gradient text-white'
                  : 'border border-default bg-surface text-heading hover:bg-card'
              )}
            >
              {t(plan.cta)}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
