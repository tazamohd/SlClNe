import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { useLandingMotion } from './landing/useLandingMotion'
import { useLandingScenes } from './landing/useLandingScenes'
import { MAP_ACCENTS, MAP_GRID } from './landing/mapFallback'
import './landing/landing.css'

/** PublicPortal.Landing — a port of the `SALIS AUTO last` design artifact.
 *
 *  The artifact is a standalone bilingual HTML page with its own header, footer
 *  and language switch. This screen keeps its markup and its stylesheet and
 *  drops the three pieces PublicShell already owns: the chrome, the language
 *  toggle (PreferencesProvider drives `<html lang>` and `<html dir>`) and the
 *  skip link. Copy is translated through `useT` like every other screen, with
 *  the artifact's own Arabic in `AR_OVERRIDES`, rather than the artifact's
 *  paired `<span lang>` elements — one translation mechanism, not two. Every
 *  key is a literal at its call site, including the ones inside the data arrays
 *  below, so `check-i18n` and the registry can both prove the coverage.
 *
 *  Everything below the hero renders at rest. `useLandingMotion` adds the
 *  entrance sequence, tilt, reveals, counted proof figures and parallax on top
 *  of it, and the page is complete without them.
 *
 *  Not ported: the artifact's four WebGL scenes (hero constellation, lifecycle
 *  rail, ZATCA invoice, AI-era map). They need Three.js, which is not a
 *  dependency here, and the artifact ships static fallbacks for every visitor
 *  who does not get them — narrow viewport, reduced motion, no WebGL. Those
 *  fallbacks are what this screen renders. */

/** The decorative circuit trace behind the hero, drawn once on load. */
function Trace({ className, style }: { className: string; style: CSSProperties }) {
  return (
    <svg className={className} viewBox="0 0 400 200" style={style} aria-hidden="true">
      <g className="draw f-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        <path className="s-bright" d="M22 160 H118 L160 118 H262" />
        <path className="s-blue" d="M62 44 H140 L182 86 H300 L342 44" />
        <path className="s-orange" d="M204 176 H318 L362 132" />
        <path className="s-bright" d="M22 100 H84" />
      </g>
      <g className="dots">
        <circle className="f-bright" cx="22" cy="160" r="10" />
        <circle className="f-navy s-bright" cx="262" cy="118" r="10" strokeWidth="7" />
        <circle className="f-orange" cx="62" cy="44" r="10" />
        <circle className="f-navy s-blue" cx="342" cy="44" r="10" strokeWidth="7" />
        <circle className="f-orange" cx="362" cy="132" r="10" />
        <circle className="f-navy s-orange" cx="204" cy="176" r="10" strokeWidth="7" />
        <circle className="f-navy s-bright" cx="84" cy="100" r="10" strokeWidth="7" />
      </g>
    </svg>
  )
}

export function PublicLanding() {
  const t = useT()
  const root = useRef<HTMLDivElement>(null)
  useLandingMotion(root)
  useLandingScenes(root)

  const HERO_CTAS: readonly { label: string; to: string }[] = [
    { label: t('Book a 20-minute demo'), to: '/public-portal/book-demo' },
    { label: t('See pricing'), to: '/public-portal/pricing' },
  ]

  /** The bay board behind the hero. Illustrative rows — the footnote says so. */
  const BAY_ROWS: readonly {
    readonly bay: string
    readonly job: string
    readonly plate: string
    readonly amount: string
    readonly status: string
    readonly warn?: boolean
  }[] = [
    { bay: '1', job: 'JC-4F2A', plate: 'RUH 4821', amount: 'SAR 1,245.00', status: t('In repair') },
    { bay: '2', job: 'JC-4F2B', plate: 'RUH 1157', amount: 'SAR 380.00', status: t('QC') },
    { bay: '3', job: 'JC-4F2C', plate: 'RUH 9930', amount: 'SAR 2,910.50', status: t('Awaiting parts'), warn: true },
    { bay: '4', job: 'JC-4F2D', plate: 'RUH 2204', amount: 'SAR 640.00', status: t('Delivered') },
  ]

  /** Six stages, in order. Each one gates the next, which is why they are numbered. */
  const STAGES: readonly { readonly title: string; readonly detail: string }[] = [
    { title: t('Check-in'), detail: t('Photos, plate, customer lookup') },
    { title: t('Inspection'), detail: t('Multi-point, with severity') },
    { title: t('Estimate'), detail: t('Signed from the phone') },
    { title: t('Repair'), detail: t('Bay board, parts from stock') },
    { title: t('Quality control'), detail: t('A second technician signs') },
    { title: t('Delivery'), detail: t('Invoice, QR, e-signature') },
  ]

  /** Results from deployments. Every figure carries the baseline it is measured
   *  against — a number without one does not go on the page. */
  const PROOF: readonly {
    readonly from?: string
    readonly to: string
    readonly count: number
    readonly countFrom: number
    readonly unit: string
    readonly prefix?: string
    readonly what: string
    readonly base: string
  }[] = [
    {
      from: '48 h',
      to: '4 h',
      count: 4,
      countFrom: 48,
      unit: ' h',
      what: t('Estimate approval'),
      base: t('Baseline: paper estimates signed at the counter.'),
    },
    {
      from: '15 min',
      to: '2 min',
      count: 2,
      countFrom: 15,
      unit: ' min',
      what: t('Invoice at the counter'),
      base: t('Baseline: handwritten invoice copied to a spreadsheet at day’s end.'),
    },
    {
      to: '+25%',
      count: 25,
      countFrom: 0,
      unit: '%',
      prefix: '+',
      what: t('Workshop throughput'),
      base: t('Measured across deployments against each workshop’s prior twelve months.'),
    },
  ]

  const DOMAINS: readonly { readonly title: string; readonly modules: readonly string[] }[] = [
    { title: t('Workshop'), modules: [t('Job cards'), t('Bay board'), t('Inspection')] },
    { title: t('Registry'), modules: [t('Vehicles, VIN decoding'), t('Customers'), t('Service history')] },
    { title: t('Finance'), modules: [t('ZATCA Phase 2 e-invoicing'), t('VAT 15%'), t('Payments, Mada')] },
    { title: t('Accounting'), modules: [t('Chart of accounts'), t('Journals from invoices'), t('Statements')] },
    {
      title: t('CRM and marketing'),
      modules: [t('Service reminders'), t('Campaigns: SMS, email, WhatsApp'), t('Loyalty')],
    },
    {
      title: t('Administration'),
      modules: [t('Organisation, branch, user'), t('14 roles, 28 modules'), t('Branch settings')],
    },
    { title: t('Authentication'), modules: [t('Password policy'), t('SMS OTP'), t('Session control')] },
    { title: t('AI platform'), modules: [t('Assistant'), t('Knowledge base'), t('Agents')] },
    {
      title: t('Parts and inventory'),
      modules: [t('Stock, minimums'), t('Purchase orders'), t('Supplier catalogues')],
    },
    { title: t('Call centre'), modules: [t('Call logging'), t('Appointments'), t('Follow-ups')] },
    {
      title: t('Reports and analytics'),
      modules: [t('Role dashboards'), t('Custom reports'), t('KPIs, alerts')],
    },
    { title: t('Team and HR'), modules: [t('Employee records, Iqama'), t('Attendance'), t('Performance')] },
    { title: t('Portals'), modules: [t('Customer app'), t('Technician portal'), t('Supplier portal')] },
  ]

  const AI_CARDS: readonly { readonly title: string; readonly body: string }[] = [
    { title: t('AI Assistant'), body: t('Natural-language questions over the workshop’s own data.') },
    { title: t('Smart Scheduling'), body: t('Predictive bay allocation and technician scheduling.') },
    {
      title: t('AI Agents'),
      body: t('Routine administrative tasks run by the system, with the audit row written like any other change.'),
    },
  ]

  const ROLES: readonly { readonly role: string; readonly body: string }[] = [
    {
      role: t('Workshop owner'),
      body: t('Revenue, VAT and stock reconcile without a bookkeeper redoing the month.'),
    },
    {
      role: t('Service advisor'),
      body: t('Speed at the counter, and an estimate the customer signs from their phone in the language they read.'),
    },
    { role: t('Technician'), body: t('Short, unambiguous instructions on a phone, in Arabic, with one hand.') },
    {
      role: t('Accountant'),
      body: t('ZATCA correctness, and an audit trail that answers who changed this, and when.'),
    },
  ]

  const QUOTES: readonly { readonly quote: string; readonly role: string; readonly where: string }[] = [
    {
      quote: t('Our accountant stopped re-keying invoices. The VAT return reconciled the first month.'),
      role: t('Workshop owner'),
      where: t('Three branches, Eastern Province'),
    },
    {
      quote: t('Estimates that took two days on paper are signed from the customer’s phone the same afternoon.'),
      role: t('Operations manager'),
      where: t('Single-bay workshop, Jeddah'),
    },
    {
      quote: t('Customers watch the job move from the bay to delivery. The phone rings less, and when it does, it is not about status.'),
      role: t('Service advisor'),
      where: t('Fleet accounts, Riyadh'),
    },
  ]

  const FAQS: readonly { readonly question: string; readonly answer: string }[] = [
    {
      question: t('How long does it take to get started?'),
      answer: t('Most workshops run their first job card within a day. Onboarding imports your customers, vehicles and parts, and sets up your roles.'),
    },
    {
      question: t('Do I need to install anything?'),
      answer: t('No. SALIS AUTO runs in the browser on desktop and phone. There is nothing to install and nothing to update.'),
    },
    {
      question: t('Is my data isolated from other workshops?'),
      answer: t('Yes. Each workshop is isolated at the database level, access is by role, and every change records who made it and when.'),
    },
    {
      question: t('Is the e-invoicing really ZATCA Phase 2?'),
      answer: t('Yes. Every issued invoice carries the TLV QR, the hash chain to its predecessor, the UBL 2.1 XML and the seller and buyer VAT numbers, and is immutable after issue. Reporting to the Fatoora platform is configured for each workshop at deployment.'),
    },
    {
      question: t('Can I try it before I commit?'),
      answer: t('Book a 20-minute demo on your own workshop’s numbers. Plans start at one branch and ten users on Starter, monthly or annual.'),
    },
  ]

  usePageMeta({
    title: t('SALIS AUTO — Workshop Management, Saudi Standard'),
    // One line, so `check-i18n` reads it as a literal key rather than a dynamic call.
    description: t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in and one audit trail.'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SALIS AUTO',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: ['ar', 'en'],
      description:
        'Workshop management platform for Saudi automotive workshops: ZATCA Phase 2 e-invoicing, Arabic and English, one audit trail.',
      areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
      publisher: {
        '@type': 'Organization',
        name: 'SALIS AUTO',
        email: 'info@salisauto.sa',
        address: { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
      },
    },
  })

  return (
    <div className="salis-landing" ref={root}>
      <section className="hero" aria-labelledby="hero-h">
        <div className="scene" data-scene="hero" aria-hidden="true" />
        <div className="scrim" aria-hidden="true" />
        <Trace className="trace anim" style={{ width: 980, insetInlineEnd: -300, top: -160 }} />
        <Trace
          className="trace anim late"
          style={{ width: 700, insetInlineStart: -260, bottom: -240, transform: 'rotate(180deg)' }}
        />
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">{t('Built for Saudi workshops')}</div>
            <h1 id="hero-h">
              {t('Workshop Management.')}{' '}
              {/* The break is visual; the space keeps the accessible name readable. */}
              <br />
              <span className="o">{t('Saudi Standard.')}</span>
            </h1>
            <p className="lede">
              {t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in. Every change is on the audit trail.')}
            </p>
            <div className="ctas">
              <Link className="btn on-dark" to={HERO_CTAS[0].to}>
                {HERO_CTAS[0].label}
                <i className="arr" aria-hidden="true">
                  &rarr;
                </i>
              </Link>
              <Link className="btn ghost-dark" to={HERO_CTAS[1].to}>
                {HERO_CTAS[1].label}
              </Link>
            </div>
            <div className="statusline">
              <b>{t('Single bay to multi-branch.')}</b>{' '}
              {t('Thirteen domains, fourteen roles, SAR to the halala, one audit trail.')}
            </div>
          </div>

          <div className="hero-mock tilt-deep">
            <div className="mock" aria-label={t('Bay board, illustrative')}>
              <div className="bar">
                <b>{t('Bay board · Riyadh Main')}</b>
                <span className="mono" dir="ltr">
                  04 Sep 2026 · 09:40
                </span>
              </div>
              <div className="row head">
                <span>{t('Bay')}</span>
                <span>{t('Job card')}</span>
                <span>{t('Plate')}</span>
                <span className="num">{t('Amount')}</span>
                <span>{t('Status')}</span>
              </div>
              {BAY_ROWS.map((row) => (
                <div className="row" key={row.job}>
                  <b>{row.bay}</b>
                  <span className="mono" dir="ltr">
                    {row.job}
                  </span>
                  <span className="mono" dir="ltr">
                    {row.plate}
                  </span>
                  <span className="num mono" dir="ltr">
                    {row.amount}
                  </span>
                  <span className={row.warn ? 'st o' : 'st'}>{row.status}</span>
                </div>
              ))}
              <div className="foot">{t('Illustrative rows. Figures are examples, not customer data.')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="life-h" id="life">
        <div className="sec-head">
          <div className="eyebrow">{t('The lifecycle')}</div>
          <h2 id="life-h">{t('Six stages. One job card. Each stage gates the next.')}</h2>
          <p>
            {t('The vehicle moves from check-in to delivery on one record. The invoice at the end is the sum of what happened, not a list retyped from memory.')}
          </p>
        </div>
        <div className="rail-wrap">
          <div className="scene rail-scene" data-scene="rail" data-driver="#life" aria-hidden="true" />
          <div className="rail6" role="list">
            {STAGES.map((stage, index) => (
              <Link role="listitem" to="/public-portal/workshop" key={stage.title}>
                <span className="n" dir="ltr">
                  {index + 1}
                </span>
                <b>{stage.title}</b>
                <span>{stage.detail}</span>
              </Link>
            ))}
          </div>
        </div>
        <p className="scene-cap">
          {t('The job card is the only thing that moves. Scroll, and it travels the six stages.')}
        </p>
        <p style={{ marginTop: 28 }}>
          <Link className="more" to="/public-portal/workshop">
            {t('Walk the six stages')}{' '}
            <span dir="ltr" aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      </section>

      <section id="proof" className="proof" aria-labelledby="proof-h">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow bright">{t('Results from deployments')}</div>
            <h2 id="proof-h">{t('Numbers carry their baseline or they do not appear.')}</h2>
          </div>
          <div className="grid">
            {PROOF.map((cell) => (
              <div className="cell" key={cell.what}>
                <div className="pair" dir="ltr">
                  {cell.from ? <span className="from">{cell.from}</span> : null}
                  <span
                    className="to"
                    data-count={cell.count}
                    data-from={cell.countFrom}
                    data-unit={cell.unit}
                    {...(cell.prefix ? { 'data-prefix': cell.prefix } : {})}
                  >
                    {cell.to}
                  </span>
                </div>
                <div className="what">{cell.what}</div>
                <div className="base">{cell.base}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="dom-h">
        <div className="sec-head">
          <div className="eyebrow">{t('Thirteen domains')}</div>
          <h2 id="dom-h">{t('Workshop, parts, finance, CRM, HR and AI on one backbone.')}</h2>
          <p>{t('No seams to reconcile. Every domain writes to the same ledger and the same audit trail.')}</p>
        </div>
        <div className="domains">
          {DOMAINS.map((domain, index) => (
            <div key={domain.title}>
              <span className="k" dir="ltr">{`${String(index + 1).padStart(2, '0')} / 13`}</span>
              <b>{domain.title}</b>
              <ul>
                {domain.modules.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="wide">
            <span className="k">{t('The rule')}</span>
            <b>{t('One record of the job')}</b>
            <p>
              {t('An inspection line becomes an estimate line, becomes a parts reservation, becomes an invoice line, becomes a journal entry. Nothing is exported, reconciled or retyped between domains, and every change writes its audit row in the same transaction.')}
            </p>
          </div>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link className="more" to="/public-portal/features">
            {t('Every module under every domain')}{' '}
            <span dir="ltr" aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      </section>

      <section className="ai-era" id="ai" aria-labelledby="ai-h">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow bright">{t('The AI era')}</div>
            <h2 id="ai-h">{t('Reinventing auto service for the AI era.')}</h2>
            <p>
              {t('Saudi Arabia first, then the Gulf and the region. Less retyping, less waiting, less guessing: the system drafts, schedules and reconciles, and people decide. Built to lead by removing friction, not by adding features.')}
            </p>
          </div>

          <div className="ai-stage" data-driver="#ai">
            <div className="scene" data-scene="map" data-driver="#ai" aria-hidden="true" />
            <svg className="map-fallback" viewBox="0 0 1000 560" aria-hidden="true">
              <g className="f-blue" opacity=".5">
                {MAP_GRID.map(([cx, cy]) => (
                  <circle cx={cx} cy={cy} r="2.2" key={`${cx}:${cy}`} />
                ))}
              </g>
              <circle className="f-none s-orange" cx="517" cy="299" r="14" strokeWidth="2" opacity=".6" />
              {MAP_ACCENTS.map((dot) => (
                <circle
                  className={`f-${dot.tone}`}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  opacity={dot.faded ? 0.5 : undefined}
                  key={`${dot.cx}:${dot.cy}:${dot.r}`}
                />
              ))}
            </svg>

            <div className="ai-overlay" aria-hidden="true">
              <div className="fold">
                <div className="paper p1" />
                <div className="paper p2" />
                <div className="paper p3" />
                <div className="slab">
                  <b dir="ltr">JC-4F2A</b>
                  <span>{t('One job card')}</span>
                  <i />
                </div>
              </div>
              <span className="orb-label l1">{t('Assistant')}</span>
              <span className="orb-label l2">{t('Scheduling')}</span>
              <span className="orb-label l3">{t('Agents')}</span>
            </div>
          </div>

          <p className="scene-cap ai-cap">
            {t('Illustrative. Regions light as the network grows; no customer locations are shown.')}
          </p>

          <div className="roles ai-cards">
            {AI_CARDS.map((card) => (
              <div key={card.title}>
                <b>{card.title}</b>
                <p>{card.body}</p>
              </div>
            ))}
          </div>

          <p className="fine">
            {t('Requires configuration: the AI features connect to an AI API at deployment. Until it is connected, the assistant shows “Connect the API”.')}
          </p>
        </div>
      </section>

      <section className="wrap" aria-labelledby="who-h">
        <div className="sec-head">
          <div className="eyebrow">{t('Who it is for')}</div>
          <h2 id="who-h">
            {t('Judged on whether it survives the floor at 09:40 with a queue behind the counter.')}
          </h2>
        </div>
        <div className="roles">
          {ROLES.map((entry) => (
            <div key={entry.role}>
              <b>{entry.role}</b>
              <p>{entry.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" aria-labelledby="q-h">
        <div className="sec-head">
          <div className="eyebrow">{t('What workshops report')}</div>
          <h2 id="q-h">{t('Quoted by role and region until consent to name is on file.')}</h2>
        </div>
        <div className="quotes">
          {QUOTES.map((entry) => (
            <blockquote key={entry.quote}>
              <p>{entry.quote}</p>
              <footer>
                <b>{entry.role}</b>
                <span>{entry.where}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="wrap" aria-labelledby="faq-h">
        <div className="sec-head">
          <div className="eyebrow">{t('Questions')}</div>
          <h2 id="faq-h">{t('Asked before every demo.')}</h2>
        </div>
        <div className="faq">
          {FAQS.map((entry, index) => (
            <details key={entry.question} open={index === 0}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wrap cta-end" aria-label={t('Next step')}>
        <h2>{t('See it on your own workshop’s numbers.')}</h2>
        <p>{t('A 20-minute demo, in Arabic or English, on a job card from your floor.')}</p>
        <div className="ctas">
          <Link className="btn" to="/public-portal/book-demo">
            {t('Book a 20-minute demo')}
            <i className="arr" aria-hidden="true">
              &rarr;
            </i>
          </Link>
          <Link className="btn ghost" to="/public-portal/pricing">
            {t('See pricing')}
          </Link>
        </div>
      </section>
    </div>
  )
}
