import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT, usePreferences } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import type { EraRow } from './landing/landingData'

type T = (source: string) => string

/** PublicPortal.CompanyStory — Tier B content page.
 *
 *  The deeper "why" that `About.tsx` keeps short: how the platform came to
 *  be built, six things the team holds regardless of deadline, and notes
 *  from engineering, finance, design, compliance and policy on the parts of
 *  it that read as opinionated. A light-first rewrite of the "SALIS AUTO
 *  2030" design study's `origin` page (see `PlatformArchitecture.tsx`'s
 *  docstring for why this content is being cascaded now).
 *
 *  Two departures from the study's own text. Its closing "who runs it"
 *  section — six generic operation shapes with invented bay/branch-count
 *  ranges — is dropped in favour of pointing to `Industries.tsx`, which
 *  already covers this ground with nine real segments (problem, modules,
 *  workflow, value) and no invented numbers, so this page does not compete
 *  with it. And its "the export is not behind billing" dispatch, which
 *  promised full data export on every plan whether or not the last invoice
 *  is paid, is reworded to match the more conservative claim
 *  `Security.tsx` already ships (export scoped to enterprise implementation
 *  and offboarding) — see `ComparePlans.tsx`'s docstring for the same
 *  correction made there. */
function story(t: T): readonly EraRow[] {
  return [
    {
      year: 'I', status: t('The problem'), headline: t('One number, four systems'),
      body: t('A workshop running on a whiteboard, a spreadsheet, an accounting package and a book of paper job cards — with the same figure typed into all four and wrong in at least one by the end of the week.'),
    },
    {
      year: 'II', status: t('The decision'), headline: t('Arabic is not a translation layer'),
      body: t('The interface is built for Arabic and English at once, right to left included, because a technician in a hot bay reading their second language is a safety problem before it is a usability one.'),
    },
    {
      year: 'III', status: t('The spine'), headline: t('One contract, both sides'),
      body: t('Schemas, permission tables and business rules move into a single shared package, so the server and the browser cannot disagree about what a job card is or who may sign one.'),
    },
    {
      year: 'IV', status: t('The floor'), headline: t('Six stages, held by the server'),
      body: t('Check-in, inspection, estimate, repair, quality check, delivery — with two gates that need a different person entirely, which is the moment the system stops being a record and starts being a control.'),
    },
    {
      year: 'V', status: t('The regulator'), headline: t('ZATCA Phase 2, end to end'),
      body: t('UBL 2.1, TLV QR, a hash chain, a digital signature, Fatoora clearance. Compliance becomes a property of the invoice rather than a project in the last week of the quarter.'),
    },
    {
      year: 'VI', status: t('Now'), headline: t('Thirteen domains, one platform'),
      body: t('Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, team and portals — one tenancy, two languages, one audit trail.'),
    },
  ]
}

function principles(t: T): readonly { title: string; body: string }[] {
  return [
    { title: t('Arabic is not a feature'), body: t('It is half the product. Anything that works in English works in Arabic, right to left, on the same day — and Arabic copy is written for Arabic rather than shortened to fit a layout drawn for English.') },
    { title: t('One write, one truth'), body: t('A number is entered once. If two screens disagree, that is a bug of the highest severity, not a reconciliation task for a person at the end of the month.') },
    { title: t('The refusal is logged too'), body: t('Every permission check that says no is recorded as carefully as every change that says yes. A boundary you cannot audit is decoration.') },
    { title: t('A second signature exists'), body: t('Six pairs of duties are split and stay split: the technician who did the repair cannot pass its quality check, and nobody approves their own requisition.') },
    { title: t('Blue is success, orange is warning'), body: t('There is no third signal colour, and green and red are deliberately absent — severity is carried by weight, position and wording, which also makes the interface work for readers who are colour-blind.') },
    { title: t('Say the exact thing'), body: t('“That phone is already in use” beats “Duplicate record detected”. Name the field, the amount, the id — and when something fails, hand over a request id rather than an apology.') },
  ]
}

function dispatches(t: T): readonly { note: string; desk: string; title: string; body: string }[] {
  return [
    { note: 'NOTE 01', desk: t('Engineering'), title: t('The audit row is the product'), body: t('Every feature worth being proud of is downstream of one decision: write who changed what, when, from what, to what — for everything, forever, with no exceptions for convenience. It is also the cheapest support tool ever built, because most arguments end by reading.') },
    { note: 'NOTE 02', desk: t('Finance'), title: t('Why money is an integer'), body: t('Amounts are stored in halalas and rounded once, at the total. Floating point in a fiscal document is a rounding error waiting for an auditor, and the alternative costs nothing but discipline at the boundary.') },
    { note: 'NOTE 03', desk: t('Design'), title: t('Arabic, one-handed, in a hot bay'), body: t('The constraint that shaped more of this interface than any other: a technician holding a part, in gloves, in the desert heat, who needs the next instruction in three words and cannot scroll.') },
    { note: 'NOTE 04', desk: t('Design'), title: t('Against the dashboard'), body: t('What an owner wants is not twelve charts; it is one number and permission to stop worrying about it until it moves. Every role dashboard starts from the question that role actually has.') },
    { note: 'NOTE 05', desk: t('Compliance'), title: t('Clearance is not filing'), body: t('Phase 2 is not a QR code bolted onto a PDF. The invoice is generated as UBL, hashed into a chain, signed and cleared — and if any step fails, the document does not quietly become a normal invoice.') },
    { note: 'NOTE 06', desk: t('Policy'), title: t('Leaving is a real feature, not a threat'), body: t('Structured export of your customers, vehicles, job cards, invoices and journals is part of how an enterprise implementation is scoped — set up on the way in, not improvised on the way out.') },
  ]
}

export function PublicCompanyStory() {
  const t = useT()
  const { language } = usePreferences()
  const rtl = language === 'ar'
  usePageMeta({
    title: t('Our Story — SALIS AUTO'),
    description: t(
      'How SALIS AUTO came to be built, six things the team holds regardless of deadline, and notes from engineering, finance, design, compliance and policy.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        eyebrow={t('Who is doing this, and why')}
        title={t('Our Story')}
        subtitle={t('This did not start as a moonshot. It started with an accountant re-typing the same invoice into a fourth system on a Thursday evening, and with a simple observation: the hard part of running a workshop is not the repair. It is that one number has to survive several people, several systems and a regulator without changing.')}
      />

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('How it went')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('The same shape as the product’s own release history, told from the company’s side: what each phase forced us to decide, and what it cost to decide it that way.')}
      </p>
      <div className="mb-12 flex flex-col gap-5">
        {story(t).map((chapter) => (
          <div key={chapter.year} className="flex gap-4 rounded-2xl border border-default bg-card p-5">
            <div dir="ltr" className="flex w-14 flex-shrink-0 flex-col items-center border-e border-default pe-4 text-center">
              <span className="font-display text-xl font-black text-salis-blue">{chapter.year}</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">{chapter.status}</span>
            </div>
            <div>
              <h3 className="m-0 text-sm font-bold text-heading">{chapter.headline}</h3>
              <p className="mb-0 mt-1 text-[13px] leading-normal text-muted">{chapter.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Six things we hold')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('These are not aspirations. Each one has cost a feature, a quarter or an argument at least once.')}</p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {principles(t).map((principle) => (
          <article key={principle.title} className="rounded-2xl border border-default bg-card p-5">
            <h3 className="mb-1.5 mt-0 text-sm font-bold text-heading">{principle.title}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{principle.body}</p>
          </article>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Dispatches')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('Notes from the floor and from the repository — the decisions behind the parts of this that look opinionated.')}</p>
      <div className="mb-12 flex flex-col gap-4">
        {dispatches(t).map((dispatch) => (
          <div key={dispatch.note} className="flex flex-col gap-1 border-b border-default pb-4 last:border-0 sm:flex-row sm:gap-6">
            <div dir="ltr" className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-salis-blue sm:w-32">
              {dispatch.note} · {dispatch.desk}
            </div>
            <div>
              <h3 className="m-0 text-sm font-bold text-heading">{dispatch.title}</h3>
              <p className="mb-0 mt-1 text-[13px] leading-normal text-muted">{dispatch.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-default pt-8">
        <Link to="/public-portal/industries" className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('See who we build for')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
        </Link>
        <Link to="/public-portal/platform" className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('See the platform architecture')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
        </Link>
        <Link to="/public-portal/book-demo" className="rounded-lg bg-salis-gradient px-4 py-2 text-sm font-semibold text-white no-underline">
          {t('Book a demo')}
        </Link>
      </div>
    </div>
  )
}
