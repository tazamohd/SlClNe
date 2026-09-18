import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { FaqList } from './sections/FaqList'
import { cn } from '@/lib/cn'

type T = (source: string) => string

/** PublicPortal.ComparePlans — Tier B content page.
 *
 *  A light-first rewrite of the "SALIS AUTO 2030" design study's `access`
 *  page (see `PlatformArchitecture.tsx`'s docstring for why this content is
 *  being cascaded now). One deliberate, material departure from the study's
 *  own text, beyond the visual rewrite every cascaded page gets:
 *
 *  The study's page published a numeric comparison matrix — specific branch
 *  and user ceilings per plan, specific support-response hours, specific
 *  uptime percentages — and a plan named "Starter" that does not exist on
 *  this site. None of those figures appear anywhere else in this codebase;
 *  `Pricing.tsx` deliberately publishes no such numbers ("no public
 *  prices... a sales specialist will scope this with you"), and one FAQ
 *  answer's blanket "full export, any time, on every plan, whether or not
 *  paid" contradicts the already-shipped `Security.tsx`, which scopes data
 *  export to enterprise implementation and offboarding. Republishing the
 *  study's numbers here would recreate exactly the problem
 *  `LEGAL_REVIEW_REQUIRED.md` already records once, for `DealsOffers.tsx`:
 *  an unverified commercial figure on a live page. This page therefore uses
 *  `Pricing.tsx`'s real plan names and feature lists, keeps every
 *  differentiation qualitative, and routes anyone who wants a number to
 *  Pricing or to sales — which is what the study's own page already did for
 *  its headline prices ("the figures live on the pricing page"), just not
 *  consistently enough. */
interface Plan {
  readonly key: string
  readonly name: string
  readonly forWho: string
  readonly has: readonly string[]
}

function plans(t: T): readonly Plan[] {
  return [
    {
      key: 'essential', name: t('Essential'), forWho: t('For smaller workshops establishing their digital operation'),
      has: [
        t('Single-branch job card management'),
        t('Customer and vehicle records'),
        t('Standard invoicing, ZATCA Phase 2'),
        t('Arabic and English interface'),
      ],
    },
    {
      key: 'professional', name: t('Professional'), forWho: t('For growing workshops adding branches and needing tighter control'),
      has: [
        t('Everything in Essential'),
        t('Multi-branch job card management'),
        t('Inventory and parts control'),
        t('Financial reporting'),
        t('Role-based team permissions'),
        t('CRM and customer communication'),
      ],
    },
    {
      key: 'enterprise', name: t('Enterprise'), forWho: t('For multi-branch groups, fleets and organisations needing tailored terms'),
      has: [
        t('Everything in Professional'),
        t('Unlimited branches and users'),
        t('Custom integrations and API access'),
        t('Advanced permissions and audit trail'),
        t('Dedicated implementation and training'),
        t('Negotiated support and SLA terms'),
      ],
    },
  ]
}

const CARRIED: readonly string[] = [
  'Thirteen functional domains',
  'Fourteen roles, twenty-eight permission modules',
  'Separation of duties, enforced server-side',
  'ZATCA Phase 2 e-invoicing',
  'VAT computed server-side',
  'Arabic and English, right to left throughout',
  'An audit row for every change',
]

function replaced(t: T): readonly { title: string; body: string }[] {
  return [
    {
      title: t('The second entry'),
      body: t('The invoice is written once and the journal is posted from it. Nobody re-keys anything into a spreadsheet at day’s end, so nobody reconciles a difference at month’s end.'),
    },
    {
      title: t('The paper estimate'),
      body: t('Signed from the customer’s phone, in the language they read, before the car reaches the gate.'),
    },
    {
      title: t('The stock guess'),
      body: t('On-hand is the sum of its movements, and the reorder point does the remembering, so the money sitting on the shelf stops being a hedge against being wrong.'),
    },
    {
      title: t('The compliance scramble'),
      body: t('ZATCA correctness is a property of the invoice, not a project in the last week of the quarter — and getting it wrong carries a real regulatory penalty, not just a warning letter.'),
    },
    {
      title: t('The “who changed this”'),
      body: t('Every change carries a row: who, when, from what, to what. The argument ends by reading rather than by seniority.'),
    },
    {
      title: t('The follow-up that never happened'),
      body: t('Reminders fire off the vehicle’s own service history, so the returning customer stops being a function of who remembered to call.'),
    },
  ]
}

function questions(t: T): readonly { question: string; answer: string }[] {
  return [
    {
      question: t('Is SALIS AUTO ZATCA compliant?'),
      answer: t('Every invoice goes through the Phase 2 pipeline: UBL 2.1 XML, a TLV QR code, a hash chained to the invoice before it, a digital signature, and the Fatoora API — standard invoices cleared in real time, simplified invoices reported. VAT is computed on the server and never accepted from the browser, and records are retained for the period Saudi tax regulation requires.'),
    },
    {
      question: t('Is Arabic a paid feature?'),
      answer: t('No, and it never has been. Arabic and English are both first-class, right to left included — the same component set, two themes, two reading directions, on every plan.'),
    },
    {
      question: t('Does the permission model change between plans?'),
      answer: t('No. The fourteen roles and the twenty-eight permission modules are identical on every plan. What scales with the plan is branches, users and support response — never the boundary.'),
    },
    {
      question: t('Can we run more than one branch?'),
      answer: t('Yes. Every row carries its organisation and its branch, and PostgreSQL row-level security decides who may read it, with stock transfer between branches and one set of books over all of them. How many branches a plan supports scales with the plan — see pricing or talk to sales for exact limits.'),
    },
    {
      question: t('Is there an API?'),
      answer: t('Enterprise includes API and custom-integration access. The contract exposed is the same one the product uses internally — the schemas, permission tables and business rules are one shared package rather than a second interface maintained beside the first.'),
    },
    {
      question: t('What happens to our data if we want to leave?'),
      answer: t('Structured data export is available as part of enterprise implementation and offboarding — talk to sales about the format and scope your organisation needs. Your operational history is not held back as a negotiating tactic.'),
    },
  ]
}

export function PublicComparePlans() {
  const t = useT()
  usePageMeta({
    title: t('Compare Plans — SALIS AUTO'),
    description: t(
      'What each SALIS AUTO plan carries, what every plan carries regardless of tier, and what a workshop stops paying for once it switches.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        eyebrow={t('What it costs')}
        title={t('Compare Plans')}
        subtitle={t('Every plan carries the whole product — the thirteen domains, the fourteen roles, Arabic and English, and ZATCA Phase 2 e-invoicing. What changes is scale and support. Figures live on the pricing page, so there is one place for them to be right.')}
      />
      <div className="mb-10 flex flex-wrap gap-3">
        <Link to="/public-portal/pricing" className="rounded-lg bg-salis-gradient px-4 py-2 text-sm font-semibold text-white no-underline">
          {t('See pricing')}
        </Link>
        <Link to="/public-portal/book-demo" className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('Book a demo')}
        </Link>
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Three plans')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('Essential is one workshop finding its feet. Professional is a group of branches that has to add up as one business. Enterprise is for an operator who needs the API, negotiated terms, and dedicated implementation.')}
      </p>
      <div className="mb-12 flex flex-col items-stretch gap-6 md:flex-row md:items-start">
        {plans(t).map((plan) => (
          <div
            key={plan.key}
            className={cn(
              'flex flex-1 flex-col rounded-2xl border border-default bg-card p-6',
              plan.key === 'professional' && 'ring-2 ring-salis-blue'
            )}
          >
            <h3 className="mb-1 mt-0 text-lg font-bold text-heading">{plan.name}</h3>
            <p className="mb-5 mt-0 text-sm leading-[1.6] text-muted">{plan.forWho}</p>
            <ul className="mb-6 mt-0 flex flex-1 flex-col gap-2 ps-5">
              {plan.has.map((line) => (
                <li key={line} className="text-sm text-body">{line}</li>
              ))}
            </ul>
            <Link
              to="/public-portal/pricing"
              className={cn(
                'block rounded-lg py-2.5 text-center text-sm font-semibold no-underline transition-colors',
                plan.key === 'professional'
                  ? 'bg-salis-gradient text-white'
                  : 'border border-default bg-surface text-heading hover:bg-card'
              )}
            >
              {t('See pricing')}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('What every plan carries')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('Never rationed by tier, because a permission model or a compliance pipeline sold in pieces is a marketing surface rather than a boundary.')}
      </p>
      <ul className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARRIED.map((line) => (
          <li key={line} className="flex items-start gap-2 rounded-xl border border-default bg-card p-4 text-sm text-body">
            <span className="mt-0.5 text-salis-blue">✓</span>
            {t(line)}
          </li>
        ))}
      </ul>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('What stops being paid for')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('The argument was never that this is cheap. It is that things a workshop already pays for — in hours, in write-offs, in fines — stop existing.')}
      </p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {replaced(t).map((card) => (
          <article key={card.title} className="rounded-2xl border border-default bg-card p-5">
            <h3 className="mb-1.5 mt-0 text-sm font-bold text-heading">{card.title}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{card.body}</p>
          </article>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Questions')}</h2>
      <FaqList items={questions(t)} />
    </div>
  )
}
