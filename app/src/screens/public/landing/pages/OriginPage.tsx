import { Link } from 'react-router-dom'
import type { T } from '../types'
import type { EraRow } from '../landingData'

/** Origin — the "SALIS AUTO 2030" artifact's `origin` page: how it went (the
 *  same rail as the release page, told from the company's side), the six
 *  principles, the six dispatches, and the six kinds of operation the product
 *  was shaped around.
 *
 *  The artifact's closing note ends "book a demo and we will map the six
 *  stages onto how your floor actually runs" — here that is a real `<Link>` to
 *  `/public-portal/book-demo` rather than a sentence with nowhere to go. */

/** The artifact's `STORY` — six chapters, on the same `.chrono` rail the
 *  Arrival page draws its releases on. */
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
      body: t('UBL 2.1, TLV QR, hash chain, X.509 signature, Fatoora clearance. Compliance becomes a property of the invoice rather than a project in the last week of the quarter.'),
    },
    {
      year: 'VI', status: t('Now'), headline: t('Thirteen domains, one platform'),
      body: t('Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, team and portals — one tenancy, two languages, one audit trail.'),
    },
  ]
}

function principles(t: T): readonly { title: string; body: string }[] {
  return [
    {
      title: t('Arabic is not a feature'),
      body: t('It is half the product. Anything that works in English works in Arabic, right to left, on the same day — and Arabic copy is written for Arabic rather than shortened to fit a layout drawn for English.'),
    },
    {
      title: t('One write, one truth'),
      body: t('A number is entered once. If two screens disagree, that is a bug of the highest severity, not a reconciliation task for a person at the end of the month.'),
    },
    {
      title: t('The refusal is logged too'),
      body: t('Every permission check that says no is recorded as carefully as every change that says yes. A boundary you cannot audit is decoration.'),
    },
    {
      title: t('A second signature exists'),
      body: t('Six pairs of duties are split and stay split: the technician who did the repair cannot pass its quality check, and nobody approves their own requisition. No deadline has ever been allowed to collapse that.'),
    },
    {
      title: t('Blue is success, orange is warning'),
      body: t('There is no third signal colour, and green and red are deliberately absent — severity is carried by weight, position and wording, which is also what makes the interface work on a floor where readers are colour-blind.'),
    },
    {
      title: t('Say the exact thing'),
      body: t('“That phone is already in use” beats “Duplicate record detected”. Name the field, the amount, the id — and when something fails, hand over a request id rather than an apology.'),
    },
  ]
}

function dispatches(t: T): readonly { note: string; desk: string; title: string; body: string }[] {
  return [
    {
      note: 'NOTE 01', desk: t('Engineering'), title: t('The audit row is the product'),
      body: t('Every feature worth being proud of is downstream of one decision: write who changed what, when, from what, to what — for everything, forever, with no exceptions for convenience. It is also the cheapest support tool ever built, because most arguments end by reading.'),
    },
    {
      note: 'NOTE 02', desk: t('Finance'), title: t('Why money is an integer'),
      body: t('Amounts are stored in halalas and rounded once, at the total. Floating point in a fiscal document is a rounding error waiting for an auditor, and the alternative costs nothing but discipline at the boundary.'),
    },
    {
      note: 'NOTE 03', desk: t('Design'), title: t('Arabic, one-handed, in a hot bay'),
      body: t('The constraint that shaped more of this interface than any other: a technician holding a part, in gloves, in forty-six degrees, who needs the next instruction in three words and cannot scroll.'),
    },
    {
      note: 'NOTE 04', desk: t('Design'), title: t('Against the dashboard'),
      body: t('What an owner wants is not twelve charts; it is one number and permission to stop worrying about it until it moves. Every role dashboard starts from the question that role actually has.'),
    },
    {
      note: 'NOTE 05', desk: t('Compliance'), title: t('Clearance is not filing'),
      body: t('Phase 2 is not a QR code bolted onto a PDF. The invoice is generated as UBL, hashed into a chain, signed and cleared — and if any step fails, the document does not quietly become a normal invoice.'),
    },
    {
      note: 'NOTE 06', desk: t('Policy'), title: t('The export is not behind billing'),
      body: t('Customers, vehicles, job cards, invoices, journals and the audit trail leave in full, whenever you ask, whether or not the last invoice is paid. Exit terms are a design decision, and this one was made early.'),
    },
  ]
}

/** The artifact's `OPEN` — the six kinds of operation the product was shaped
 *  around. Not vacancies: the heading is "Who runs it". */
function operations(t: T): readonly { title: string; shape: string; body: string }[] {
  return [
    {
      title: t('Independent workshop'), shape: t('1 branch · 4–9 bays'),
      body: t('One floor, one owner who is still on it, and a business that lives or dies on turnaround. Reception opens the card, the advisor prices it, the customer signs on their phone.'),
    },
    {
      title: t('Multi-branch group'), shape: t('3+ branches'),
      body: t('Branches that must behave as one business: shared stock with transfer between them, one chart of accounts, and a manager who sees their own floor and nothing beside it.'),
    },
    {
      title: t('Dealer service centre'), shape: t('Franchise · high volume'),
      body: t('Manufacturer schedules, warranty work and a service history that has to be complete and legible years later. Kiosk check-in, because the queue at 7am is the real constraint.'),
    },
    {
      title: t('Fleet and transport'), shape: t('Contract customers'),
      body: t('One customer, many vehicles, and a monthly invoice that has to reconcile against every job card behind it. Preventive schedules by mileage rather than by memory.'),
    },
    {
      title: t('Tyres and quick service'), shape: t('Walk-in led'),
      body: t('Short jobs, heavy stock movement and a counter that cannot wait for an estimate cycle. The same six stages, run in minutes rather than days.'),
    },
    {
      title: t('Body shop and insurance'), shape: t('Estimate heavy'),
      body: t('Photographs, severity and a priced estimate that a third party has to accept before anything is dismantled. Every finding carries its evidence on the card.'),
    },
  ]
}

export function OriginPage({ t }: { t: T }) {
  const rail = story(t)

  return (
    <>
      <section className="masthead" aria-labelledby="origin-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 04 — Who is doing this, and why')}</span>
            <h1 id="origin-hero-h" className="rise">
              {t('Origin')}
            </h1>
            <p className="lede rise">
              {t('This did not start as a moonshot. It started with an accountant re-typing the same invoice into a fourth system on a Thursday evening, and with a simple observation: the hard part of running a workshop is not the repair.')}{' '}
              <b>{t('It is that one number has to survive six people, four systems and a regulator without changing.')}</b>
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Built for')}</div>
                <div className="v" dir="ltr">KSA</div>
              </div>
              <div>
                <div className="k">{t('Home')}</div>
                <div className="v" dir="ltr">RUH</div>
              </div>
              <div>
                <div className="k">{t('Languages')}</div>
                <div className="v" dir="ltr">
                  2<em>{t('first-class')}</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Principles')}</div>
                <div className="v" dir="ltr">6</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="origin-story" aria-labelledby="origin-story-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — How it was built')}</span>
          <h2 id="origin-story-h">{t('How it went')}</h2>
          <p>
            {t('The same rail as the product page, told from the company’s side rather than the release’s: what each phase forced us to decide, and what it cost to decide it that way.')}
          </p>
        </div>
        <div className="chrono">
          {rail.map((chapter, i) => (
            <article className={i === rail.length - 1 ? 'era now' : 'era'} key={chapter.year}>
              <div className="yr" dir="ltr">
                {chapter.year}
                <small>{chapter.status}</small>
              </div>
              <div>
                <h3>{chapter.headline}</h3>
                <p>{chapter.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="origin-principles" aria-labelledby="origin-principles-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — What does not get traded away')}</span>
          <h2 id="origin-principles-h">{t('Six things we hold')}</h2>
          <p>{t('These are not aspirations. Each one has cost a feature, a quarter or an argument at least once.')}</p>
        </div>
        <div className="cards">
          {principles(t).map((principle, i) => (
            <article className="panel card rise" key={principle.title}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="idx">
                <span>
                  {t('PRINCIPLE')} <span dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <b>{t('HELD')}</b>
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="origin-dispatches" aria-labelledby="origin-dispatches-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Written down')}</span>
          <h2 id="origin-dispatches-h">{t('Dispatches')}</h2>
          <p>{t('Notes from the floor and from the repository — the decisions behind the parts of this that look opinionated.')}</p>
        </div>
        <div>
          {dispatches(t).map((dispatch) => (
            <article className="dispatch rise" key={dispatch.note}>
              <div className="meta">
                <b dir="ltr">{dispatch.note}</b>
                {dispatch.desk}
              </div>
              <div>
                <h3>{dispatch.title}</h3>
                <p>{dispatch.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="origin-roles" aria-labelledby="origin-roles-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Who this is for')}</span>
          <h2 id="origin-roles-h">{t('Who runs it')}</h2>
          <p>
            {t('The product was shaped around six kinds of operation. If yours is on this list, nothing in the setup will feel like a compromise you agreed to on someone else’s behalf.')}
          </p>
        </div>
        <div className="roles">
          {operations(t).map((op) => (
            <div className="role rise" key={op.title}>
              <div>
                <h3>{op.title}</h3>
                <p>{op.body}</p>
              </div>
              <div className="where">{op.shape}</div>
            </div>
          ))}
        </div>
        <p className="fine-note rise" style={{ marginTop: 20 }}>
          {t('NOT ON THE LIST? Most workshops are a mix of two of these. Book a demo and we will map the six stages onto how your floor actually runs before anyone talks about a plan.')}
        </p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn ghost" to="/public-portal/book-demo">
            {t('Book a demo')}
          </Link>
        </p>
      </section>
    </>
  )
}
