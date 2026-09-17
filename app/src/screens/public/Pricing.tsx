import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { CornerBrackets } from './sections/CornerBrackets'
import { cn } from '@/lib/cn'

/** PublicPortal.Pricing — Tier B content page.
 *
 *  No public prices. Configuration (modules, branch count, users, data
 *  migration, integrations, training, support and SLA requirements) drives
 *  cost, so every plan routes to a sales conversation rather than a number we
 *  cannot stand behind — see LEGAL_REVIEW_REQUIRED.md. Professional is
 *  visually highlighted as the plan most workshops start the conversation
 *  from, not as a default price tier. */
interface Plan {
  name: string
  tagline: string
  features: readonly string[]
  highlighted?: boolean
}

const PLANS: readonly Plan[] = [
  {
    name: 'Essential',
    tagline: 'For smaller workshops establishing their digital operation.',
    features: [
      'Single-branch job card management',
      'Customer and vehicle records',
      'Standard invoicing',
      'Arabic and English interface',
    ],
  },
  {
    name: 'Professional',
    tagline:
      'For growing workshops requiring stronger control over inventory, teams, finance and reporting.',
    features: [
      'Multi-branch job card management',
      'Inventory and parts control',
      'Financial reporting',
      'Role-based team permissions',
      'CRM and customer communication',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tagline:
      'For multi-branch groups, fleets and organizations requiring tailored integrations, permissions, implementation and support.',
    features: [
      'Unlimited branches and users',
      'Custom integrations and API access',
      'Advanced permissions and audit trail',
      'Dedicated implementation and training',
      'Negotiated support and SLA terms',
    ],
  },
]

export function PublicPricing() {
  const t = useT()
  usePageMeta({
    title: t('Pricing — SALIS AUTO'),
    description: t(
      'SALIS AUTO plans are configured to your workshop — modules, branches, users and integrations. Talk to sales for a quote.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="Three strata"
        title="Pricing Plans"
        subtitle="Every plan is configured to your workshop. Talk to sales for a quote — we don't publish list prices."
      />
      <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'relative flex flex-1 flex-col rounded-2xl border border-default bg-card p-6',
              plan.highlighted && 'ring-2 ring-salis-blue'
            )}
          >
            <CornerBrackets />
            <h2 className="mb-1 mt-0 text-lg font-bold text-heading">{t(plan.name)}</h2>
            <p className="mb-5 mt-0 text-sm leading-[1.6] text-muted">{t(plan.tagline)}</p>
            <ul className="mb-6 mt-0 flex flex-1 flex-col gap-2.5 ps-5">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-body">
                  {t(f)}
                </li>
              ))}
            </ul>
            <Link
              to="/public-portal/request-demo"
              className={cn(
                'block rounded-lg py-2.5 text-center text-sm font-semibold no-underline transition-colors',
                plan.highlighted
                  ? 'bg-salis-gradient text-white'
                  : 'border border-default bg-surface text-heading hover:bg-card'
              )}
            >
              {t('Talk to Sales')}
            </Link>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-[720px] text-center text-[13px] leading-relaxed text-muted">
        {t(
          'Final configuration and cost depend on the modules you need, the number of branches and users, data migration, integrations, training and your support or service-level requirements. A sales specialist will scope this with you before any commitment.'
        )}
      </p>
    </div>
  )
}
