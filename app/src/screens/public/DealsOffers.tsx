import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { CornerBrackets } from './sections/CornerBrackets'

/** PublicPortal.DealsOffers — a Tier B page, sibling to Pricing and Services,
 *  Parts & Accessories.
 *
 *  Same dark instrument-panel read as `PartsAccessories` — the "SALIS AUTO
 *  2030" design study's corner-bracket framing in this site's own tokens.
 *
 *  No promotion is published here unless it carries a verified start date,
 *  expiry date, eligibility, participating branches, redemption rules and a
 *  link to full terms — see LEGAL_REVIEW_REQUIRED.md. Until sales confirms a
 *  specific offer, this page states the categories of programs that exist and
 *  routes to Contact, the one place a signed-out visitor can actually ask what
 *  currently applies to their workshop; there is no coupon-code or checkout
 *  flow to fake. */
interface Program {
  title: string
  body: string
  icon: string
}

const PROGRAMS: readonly Program[] = [
  {
    title: 'New workshop onboarding',
    body: 'Ask about onboarding support when you set up your first branch.',
    icon: 'Gift',
  },
  {
    title: 'Fleet and multi-branch accounts',
    body: 'Volume and multi-branch arrangements are scoped with sales, not sold off a list price.',
    icon: 'Truck',
  },
  {
    title: 'Referral program',
    body: 'Ask sales whether a referral program is currently running and what it covers.',
    icon: 'Award',
  },
  {
    title: 'Seasonal and loyalty programs',
    body: 'Any seasonal or loyalty program will be listed here with its dates, eligibility and terms once confirmed.',
    icon: 'Percent',
  },
]

export function PublicDealsOffers() {
  const t = useT()
  usePageMeta({
    title: t('Deals & Offers — SALIS AUTO'),
    description: t('Programs and offers for new workshops, fleets and multi-branch accounts'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="Programs"
        title="Deals & Offers"
        subtitle="No offer is published here without a confirmed schedule, eligibility and terms — ask sales what currently applies to your workshop"
      />
      <div className="relative overflow-hidden rounded-2xl bg-salis-navy p-5 md:p-8">
        <CornerBrackets />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {PROGRAMS.map((program) => (
            <article
              key={program.title}
              className="relative flex flex-col overflow-hidden rounded-xl border border-white/15 bg-white/[.06] p-5"
            >
              <Icon name={program.icon} size={22} className="text-salis-bright" />
              <h2 className="mb-1.5 mt-3 text-[15px] font-semibold text-white">{t(program.title)}</h2>
              <p className="m-0 text-[13px] leading-normal text-white/70">{t(program.body)}</p>
            </article>
          ))}
        </div>
        <p className="mb-0 mt-6 text-xs text-white/60">
          {t(
            'We do not publish discount percentages or credit amounts here until sales confirms them for a specific program. For what currently applies to your workshop, please'
          )}{' '}
          <Link to="/public-portal/contact" className="text-salis-bright">
            {t('contact us')}
          </Link>{' '}
          {t('or')}{' '}
          <Link to="/public-portal/request-demo" className="text-salis-bright">
            {t('request a demo.')}
          </Link>
        </p>
      </div>
    </div>
  )
}
