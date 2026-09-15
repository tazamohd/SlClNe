import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Access — the "SALIS AUTO 2030" artifact's `access` page: the three plans,
 *  the full comparison matrix, the six things that stop being paid for, and
 *  the seven questions.
 *
 *  Prices are deliberately absent. The artifact quotes figures that contradict
 *  the ones `/public-portal/pricing` publishes, and a site that names two
 *  prices for one plan has no price at all — so this page carries what each
 *  plan *contains* and sends the commercial terms to the pricing page, which
 *  stays the single source of truth. For the same reason the per-plan user
 *  ceilings here are the pricing page's, not the artifact's. The artifact's
 *  monthly/annual toggle went with the figures it existed to switch.
 *
 *  Every "Book a demo" is a real `<Link>` to `/public-portal/book-demo`,
 *  "See pricing" goes to the real pricing page, and "Compare line by line"
 *  scrolls to the matrix on this page — none is a decorative dead end. */

interface Plan {
  readonly key: string
  readonly name: string
  readonly forWho: string
  readonly note: string
  readonly has: readonly string[]
  readonly off: readonly string[]
  readonly feature: boolean
}

function plans(t: T): readonly Plan[] {
  return [
    {
      key: 'starter',
      name: t('Starter'),
      forWho: t('One workshop'),
      feature: false,
      note: t('1 branch · up to 5 users · 10 GB of documents'),
      has: [
        t('All thirteen domains'),
        t('All fourteen roles and the full permission matrix'),
        t('ZATCA Phase 2 e-invoicing'),
        t('Arabic and English, right to left'),
        t('Customer app and technician portal'),
        t('Email support within 24 hours'),
        t('Uptime target 99.5%'),
      ],
      off: [t('API access'), t('Multiple branches')],
    },
    {
      key: 'professional',
      name: t('Professional'),
      forWho: t('A group of branches'),
      feature: true,
      note: t('3 branches · up to 25 users · 50 GB of documents'),
      has: [
        t('Everything in Starter'),
        t('Up to three branches, with stock transfer between them'),
        t('All six portals, supplier and procurement included'),
        t('Read-only API access'),
        t('Consolidated reporting across branches'),
        t('Support response within 4 hours'),
        t('Uptime target 99.9%'),
      ],
      off: [t('Write access to the API')],
    },
    {
      key: 'enterprise',
      name: t('Enterprise'),
      forWho: t('A multi-branch operator'),
      feature: false,
      note: t('Unlimited branches, users and storage'),
      has: [
        t('Everything in Professional'),
        t('Unlimited branches, users and storage'),
        t('Full API access'),
        t('Franchise and multi-operator structure'),
        t('Support response within 1 hour'),
        t('Uptime target 99.95%, with service credits'),
        t('Onboarding and data migration'),
      ],
      off: [],
    },
  ]
}

interface MatrixRow {
  readonly label: string
  /** A group heading spans the table and has no cells of its own. */
  readonly cells: readonly string[] | null
}

function matrix(t: T): readonly MatrixRow[] {
  const all = t('All')
  const yes = t('Yes')
  return [
    { label: t('What changes'), cells: null },
    { label: t('Branches'), cells: ['1', '3', t('Unlimited')] },
    { label: t('Users'), cells: ['5', '25', t('Unlimited')] },
    { label: t('Document storage'), cells: ['10 GB', '50 GB', t('Unlimited')] },
    { label: t('API access'), cells: ['—', t('Read-only'), t('Full')] },
    { label: t('Support response'), cells: [t('24 hours, email'), t('4 hours'), t('1 hour')] },
    { label: t('Uptime target'), cells: ['99.5%', '99.9%', t('99.95% + credits')] },
    { label: t('Portals'), cells: [t('Customer, technician'), t('All six'), t('All six')] },
    { label: t('Onboarding and migration'), cells: [t('Self-serve'), t('Guided'), t('Included')] },
    { label: t('What every plan carries'), cells: null },
    { label: t('Thirteen domains'), cells: [all, all, all] },
    { label: t('Fourteen roles, 28 permission modules'), cells: [all, all, all] },
    { label: t('Separation of duties, six pairs'), cells: [t('Enforced'), t('Enforced'), t('Enforced')] },
    { label: t('ZATCA Phase 2 e-invoicing'), cells: [yes, yes, yes] },
    { label: t('VAT computed server-side'), cells: [yes, yes, yes] },
    { label: t('Arabic and English, RTL throughout'), cells: [yes, yes, yes] },
    { label: t('Audit row per change'), cells: [yes, yes, yes] },
    { label: t('Full export, any time'), cells: [yes, yes, yes] },
  ]
}

function replaced(t: T): readonly { title: string; body: string }[] {
  return [
    {
      title: t('The second entry'),
      body: t('The invoice was written once and the journal came from it. Nobody re-keys anything into a spreadsheet at day’s end, so nobody reconciles the difference at month’s end.'),
    },
    {
      title: t('The paper estimate'),
      body: t('Signed from the customer’s phone, in the language they read, before the car reaches the gate. Two days of waiting becomes an afternoon.'),
    },
    {
      title: t('The stock guess'),
      body: t('On-hand is the sum of its movements, and the reorder point does the remembering, so the money sitting on the shelf stops being a hedge against being wrong.'),
    },
    {
      title: t('The compliance scramble'),
      body: t('ZATCA correctness is a property of the invoice, not a project in the last week of the quarter — and the penalty for getting it wrong starts at SAR 5,000 per invoice.'),
    },
    {
      title: t('The “who changed this”'),
      body: t('Every change carries a row: who, when, from what, to what. The argument ends by reading rather than by seniority.'),
    },
    {
      title: t('The follow-up that never happened'),
      body: t('Reminders fire off the vehicle’s own condition, so the returning customer stops being a function of who remembered to call.'),
    },
  ]
}

function questions(t: T): readonly { q: string; a: string }[] {
  return [
    {
      q: t('Is SALIS AUTO ZATCA compliant?'),
      a: t('Every invoice goes through the Phase 2 pipeline: UBL 2.1 XML, a TLV QR code carrying five tags, a SHA-256 hash chained to the invoice before it, an X.509 signature, and the Fatoora API — standard invoices cleared in real time, simplified invoices reported. VAT is computed on the server at the ZATCA rate and never accepted from the browser, and invoices are retained for seven years.'),
    },
    {
      q: t('Is Arabic a paid feature?'),
      a: t('No, and it never has been. Arabic and English are both first-class, right to left included — the same component set, two themes, two reading directions. Arabic copy is written for Arabic rather than translated into it, and a workshop system sold in Saudi Arabia that charged extra for that would deserve to be laughed at.'),
    },
    {
      q: t('Does the permission model change between plans?'),
      a: t('No. The fourteen roles, the twenty-eight permission modules, the approval ceilings and the six separated duty pairs are identical on every plan. What scales is branches, users and support — never the boundary.'),
    },
    {
      q: t('Can we run more than one branch?'),
      a: t('Yes. Every row carries its organisation and its branch, and PostgreSQL row-level security decides who may read it. Starter covers one branch, Professional three, Enterprise as many as you run — with stock transfer between them and one set of books over all of them.'),
    },
    {
      q: t('What happens to our data if we stop paying?'),
      a: t('Nothing is deleted and nothing is held hostage. The export runs whether or not the invoice is paid, and it takes everything — customers, vehicles, job cards, invoices, journals and the audit trail. A system that holds your history back is not a system; it is a hostage arrangement.'),
    },
    {
      q: t('Is there an API?'),
      a: t('Professional includes read-only API access; Enterprise includes the full API. The contract is the same one the product uses internally — the schemas, the permission tables and the business rules are one shared package rather than a second interface maintained beside the first.'),
    },
    {
      q: t('What is not in Phase 1?'),
      a: t('Three things, deliberately: native mobile applications, an offline mode for the floor, and multi-currency. Phase 1 is the Kingdom, in riyals, online. All three are named for 2.0 rather than implied.'),
    },
  ]
}

function smoothScrollTo(id: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    el.scrollIntoView?.({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
}

export function AccessPage({ t }: { t: T }) {
  return (
    <>
      <section className="masthead" aria-labelledby="access-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 03 — What it costs')}</span>
            <h1 id="access-hero-h" className="rise">
              {t('Access')}
            </h1>
            <p className="lede rise">
              {t('Three plans. Every plan carries the whole product —')}{' '}
              <b>{t('the thirteen domains, the fourteen roles, Arabic and English, and ZATCA Phase 2 e-invoicing')}</b>.{' '}
              {t('What changes is scale: how many branches, how many people, how quickly someone answers when you need them.')}{' '}
              {t('The figures live on the pricing page, so there is one place for them to be right.')}
            </p>
            <div className="hero-actions rise" style={{ marginTop: 30 }}>
              <Link className="btn" to="/public-portal/pricing">
                <i aria-hidden="true">◈</i> {t('See pricing')}
              </Link>
              <Link className="btn ghost" to="/public-portal/book-demo">
                {t('Book a demo')}
              </Link>
              <a className="btn ghost" href="#access-matrix" onClick={smoothScrollTo('access-matrix')}>
                {t('Compare line by line')}
              </a>
            </div>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Plans')}</div>
                <div className="v" dir="ltr">3</div>
              </div>
              <div>
                <div className="k">{t('Domains')}</div>
                <div className="v" dir="ltr">
                  13<em>{t('on every plan')}</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Roles')}</div>
                <div className="v" dir="ltr">
                  14<em>{t('on every plan')}</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Lock-in')}</div>
                <div className="v">{t('None')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="access-strata" aria-labelledby="access-strata-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Pick a plan')}</span>
          <h2 id="access-strata-h">{t('Three plans')}</h2>
          <p>
            {t('Starter is one workshop finding its feet. Professional is a group of branches that has to add up as one business. Enterprise is for an operator who needs the API, the uptime commitment and a number to call at two in the morning.')}
          </p>
        </div>
        <div className="strata">
          {plans(t).map((plan) => (
            <article className={plan.feature ? 'panel stratum rise feature' : 'panel stratum rise'} key={plan.key}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="name">{plan.name}</div>
              <div className="for">{plan.forWho}</div>
              <ul>
                {plan.has.map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {plan.off.map((line) => (
                  <li className="off" key={line}>
                    {line}
                  </li>
                ))}
              </ul>
              <Link className={plan.feature ? 'btn' : 'btn ghost'} to="/public-portal/pricing">
                {t('See pricing')}
              </Link>
              <div className="foot-note">{plan.note}</div>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="access-matrix" aria-labelledby="access-matrix-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Line by line')}</span>
          <h2 id="access-matrix-h">{t('What each plan carries')}</h2>
          <p>
            {t('The first block is what differs between plans. The second is what does not: every plan carries the whole product, because a permission model sold in pieces is a marketing surface rather than a boundary.')}
          </p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Capability')}</th>
                <th>{t('Starter')}</th>
                <th>{t('Professional')}</th>
                <th>{t('Enterprise')}</th>
              </tr>
            </thead>
            <tbody>
              {matrix(t).map((row) =>
                row.cells === null ? (
                  <tr key={row.label}>
                    <th className="group" colSpan={4}>
                      {row.label}
                    </th>
                  </tr>
                ) : (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    {row.cells.map((cell, i) => (
                      <td className={cell === '—' ? 'no' : undefined} key={`${row.label}-${i}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rule" />

      <section id="access-replaces" aria-labelledby="access-replaces-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — The honest arithmetic')}</span>
          <h2 id="access-replaces-h">{t('What stops being paid for')}</h2>
          <p>
            {t('The argument was never that this is cheap. It is that six things a workshop already pays for — in hours, in write-offs, in fines — stop existing.')}
          </p>
        </div>
        <div className="cards rise">
          {replaced(t).map((card) => (
            <article className="panel card" key={card.title}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="access-faq" aria-labelledby="access-faq-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Asked before')}</span>
          <h2 id="access-faq-h">{t('Questions')}</h2>
        </div>
        <div className="qa rise">
          {questions(t).map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <div className="a">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
