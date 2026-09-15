import { useState } from 'react'
import type { T } from '../types'

/** System — the "SALIS AUTO 2030" artifact's `system` page: the domain
 *  constellation, the thirteen domains in full, the fourteen roles, the four
 *  decisions that hold the whole thing up, and the six duty pairs that cannot
 *  be bent.
 *
 *  One data table (`domains`) drives two views — the constellation's detail
 *  panel and the card inventory — exactly as the artifact's `SUB` array does,
 *  so one edit updates both. The artifact's constellation is a clickable SVG
 *  with `role="button"` nodes and a five-second auto-advance; here the SVG is
 *  decorative and drawn at rest, and the selection is made with a real list of
 *  real buttons beside it. Same content, fewer ways for a screen reader to end
 *  up inside an SVG. */

interface Domain {
  readonly key: string
  /** Position on the constellation, in the artifact's own 1000 × 760 viewBox. */
  readonly cx: number
  readonly cy: number
  readonly name: string
  /** The domain's Arabic name, as it appears in the product. */
  readonly arabic: string
  readonly blurb: string
  readonly modules: readonly { name: string; gloss: string }[]
}

function domains(t: T): readonly Domain[] {
  return [
    {
      key: 'workshop', cx: 500, cy: 217, name: t('Workshop'), arabic: 'الورشة',
      blurb: t('The six-stage job card, and the centre of everything else: check-in, inspection, estimate, repair, quality check, delivery. The order is held by the server — a card cannot skip a stage, and two of the six are gates that need a different person entirely.'),
      modules: [
        { name: t('Job cards'), gloss: t('the whole visit') },
        { name: t('Multi-point inspection'), gloss: t('severity and photos') },
        { name: t('Estimates'), gloss: t('signed before work starts') },
      ],
    },
    {
      key: 'registry', cx: 604, cy: 235, name: t('Registry'), arabic: 'السجل',
      blurb: t('Customers and vehicles, with the Saudi formats validated where they are entered: plate patterns, +966 numbers, national ID. A vehicle keeps its service history across branches and across owners.'),
      modules: [
        { name: t('Customers and fleets'), gloss: t('with loyalty') },
        { name: t('Vehicles, VIN decoding'), gloss: t('identity') },
        { name: t('Service history'), gloss: t('the whole life') },
      ],
    },
    {
      key: 'finance', cx: 684, cy: 284, name: t('Finance'), arabic: 'المالية',
      blurb: t('Invoices, payments and receipts, stored as integer halalas and rounded once at the total. Standard invoices clear with ZATCA in real time; simplified invoices are reported. VAT is computed on the server and never accepted from the browser.'),
      modules: [
        { name: t('ZATCA Phase 2 e-invoicing'), gloss: t('cleared, not filed') },
        { name: t('VAT 15%'), gloss: t('server-side') },
        { name: t('Payments · Mada, card, cash'), gloss: t('and transfer') },
      ],
    },
    {
      key: 'accounting', cx: 810, cy: 346, name: t('Accounting'), arabic: 'المحاسبة',
      blurb: t('A real double-entry ledger underneath the invoice, not a report generated from it. The entry is posted from the document that caused it, so the month closes by review rather than by reassembly.'),
      modules: [
        { name: t('Chart of accounts, journals'), gloss: t('debits equal credits') },
        { name: t('Trial balance, P&L, cash flow'), gloss: t('continuous') },
        { name: t('AR / AP, bank reconciliation'), gloss: t('and budgets') },
      ],
    },
    {
      key: 'crm', cx: 792, cy: 449, name: t('CRM & Marketing'), arabic: 'العملاء والتسويق',
      blurb: t('Lead to opportunity to customer, with the audit chain preserved through the conversion. Service reminders go out on the channel the customer actually answers, in the language they read.'),
      modules: [
        { name: t('Leads and opportunities'), gloss: t('one chain') },
        { name: t('Campaigns · SMS, email, WhatsApp'), gloss: t('one voice') },
        { name: t('Service reminders'), gloss: t('by mileage or date') },
      ],
    },
    {
      key: 'admin', cx: 707, cy: 534, name: t('Administration'), arabic: 'الإدارة',
      blurb: t('Organisation, branch, user — the boundaries a workshop draws around itself, enforced by row-level security rather than by a policy document nobody has read. The permission matrix is edited here, in the open.'),
      modules: [
        { name: t('Tenants, branches, users'), gloss: t('territory') },
        { name: t('14 roles × 28 modules'), gloss: t('the matrix') },
        { name: t('Audit log'), gloss: t('every change, every refusal') },
      ],
    },
    {
      key: 'auth', cx: 575, cy: 582, name: t('Authentication'), arabic: 'الدخول',
      blurb: t('Sessions that expire, passwords hashed with argon2id, one-time codes over SMS, and refresh tokens that detect their own reuse. Nothing here is a feature anyone asks for; all of it is noticed the day it is missing.'),
      modules: [
        { name: t('Password policy, argon2id'), gloss: t('hashed') },
        { name: t('SMS one-time codes'), gloss: t('and lockout') },
        { name: t('Sessions, refresh, MFA'), gloss: t('short-lived') },
      ],
    },
    {
      key: 'ai', cx: 446, cy: 522, name: t('AI Platform'), arabic: 'الذكاء الاصطناعي',
      blurb: t('An assistant that answers over the workshop’s own data, a repair knowledge base the floor adds to, and scheduling help that reads the bay board. Suggestions, never silent authority: an agent proposes, a role approves.'),
      modules: [
        { name: t('Assistant'), gloss: t('natural language') },
        { name: t('Repair knowledge base'), gloss: t('institutional memory') },
        { name: t('Smart scheduling'), gloss: t('reads the board') },
      ],
    },
    {
      key: 'parts', cx: 293, cy: 534, name: t('Parts & Inventory'), arabic: 'قطع الغيار والمخزون',
      blurb: t('Stock is not a number somebody edits; it is the sum of its movements. Reorder points, purchase orders with an approval chain, goods received against the order, and transfer between branches.'),
      modules: [
        { name: t('Stock, reorder points'), gloss: t('derived, not typed') },
        { name: t('Purchase orders'), gloss: t('with approval ceilings') },
        { name: t('Supplier catalogues'), gloss: t('and price lists') },
      ],
    },
    {
      key: 'callcenter', cx: 145, cy: 465, name: t('Call Center'), arabic: 'مركز الاتصال',
      blurb: t('Every conversation with a customer, wherever it started, lands in one thread against one vehicle — and the follow-up is scheduled before the call ends rather than remembered afterwards.'),
      modules: [
        { name: t('Call logging'), gloss: t('one thread per vehicle') },
        { name: t('Queues and appointments'), gloss: t('across branches') },
        { name: t('Follow-ups'), gloss: t('never dropped') },
      ],
    },
    {
      key: 'reports', cx: 123, cy: 340, name: t('Reports & Analytics'), arabic: 'التقارير والتحليلات',
      blurb: t('Dashboards that answer the question the role actually has. The owner sees money, the advisor sees today, the technician sees the next hour — and anything on screen can leave as a file.'),
      modules: [
        { name: t('Role dashboards'), gloss: t('per standing') },
        { name: t('Report builder'), gloss: t('ask for a column') },
        { name: t('KPIs and alerts'), gloss: t('pushed, not hunted') },
      ],
    },
    {
      key: 'team', cx: 188, cy: 223, name: t('Team & HR'), arabic: 'الفريق والموارد البشرية',
      blurb: t('The technician directory, shifts, timesheets, leave, certifications and performance — plus payroll preparation, which stops deliberately at the bank: the system prepares the run, a human sends the money.'),
      modules: [
        { name: t('Shifts and timesheets'), gloss: t('from the floor') },
        { name: t('Leave, certifications'), gloss: t('and training') },
        { name: t('Payroll preparation'), gloss: t('prepared, not paid') },
      ],
    },
    {
      key: 'portals', cx: 324, cy: 139, name: t('Portals'), arabic: 'البوابات',
      blurb: t('Customer, technician, supplier, procurement, kiosk and super admin. Six ways in, each with its own permissions, each seeing exactly its own slice and nothing adjacent to it.'),
      modules: [
        { name: t('Customer app'), gloss: t('sign the estimate') },
        { name: t('Technician portal'), gloss: t('one hand, in Arabic') },
        { name: t('Supplier portal'), gloss: t('its own orders only') },
      ],
    },
  ]
}

/** Every role the product defines, with the data it may see and what it may
 *  approve — the artifact's `ROLES`. */
function roles(t: T): readonly { name: string; scope: string; note: string }[] {
  return [
    { name: t('Owner / CEO — المالك'), scope: t('all branches'), note: t('Sees the money and the shape of every branch at once. Approves without ceiling') },
    { name: t('Super Admin — المشرف العام'), scope: t('platform'), note: t('Holds the platform itself, and is audited hardest of anyone on it') },
    { name: t('Branch Manager — مدير الفرع'), scope: t('one branch'), note: t('Owns one floor and everything on it. Approves to SAR 50,000') },
    { name: t('Accountant — محاسب'), scope: t('all branches'), note: t('Issues the invoice after delivery, posts the journal. Approves to SAR 25,000') },
    { name: t('Procurement Agent — وكيل المشتريات'), scope: t('all branches'), note: t('Raises and places orders, and may not receive what they ordered. To SAR 20,000') },
    { name: t('HR Manager — مدير الموارد البشرية'), scope: t('all branches'), note: t('Holds the people records and prepares the payroll run. To SAR 15,000') },
    { name: t('Storekeeper — أمين المستودع'), scope: t('one branch'), note: t('Issues parts to the job card and answers for every unit. To SAR 10,000') },
    { name: t('Service Advisor — مستشار الخدمة'), scope: t('one branch'), note: t('Stands where the customer stands. Prices the estimate. To SAR 5,000') },
    { name: t('Receptionist — موظف الاستقبال'), scope: t('one branch'), note: t('The gate: opens the card, takes the payment. Approves nothing') },
    { name: t('Call Center Agent — موظف مركز الاتصال'), scope: t('all branches'), note: t('One thread per vehicle, across every branch. Approves nothing') },
    { name: t('Technician — فني'), scope: t('own jobs'), note: t('Sees the next hour, in Arabic, with one hand free. Cost and margin are hidden') },
    { name: t('QC Inspector — مفتش الجودة'), scope: t('one branch'), note: t('The second signature, and never the first. Cannot pass their own repair') },
    { name: t('Customer — عميل'), scope: t('self'), note: t('One life — the vehicle’s. Signs the estimate, keeps the invoice') },
    { name: t('Supplier — مورّد'), scope: t('external'), note: t('Its own orders and its own catalogue. No customer data, ever') },
  ]
}

/** The artifact's `TRUTH` — pairs of actions one person may never hold at both
 *  ends. Six are enforced by the server; the last is enforced by the customer's
 *  own signature, which is why its right-hand column reads differently. */
function duties(t: T): readonly { a: string; b: string; how: string; server: boolean }[] {
  return [
    { a: t('Raise a purchase requisition'), b: t('Approve that same requisition'), how: t('Server-side'), server: true },
    { a: t('Carry out the repair'), b: t('Pass its quality check'), how: t('Server-side'), server: true },
    { a: t('Create a supplier'), b: t('Approve a payment to it'), how: t('Server-side'), server: true },
    { a: t('Post a journal entry'), b: t('Approve that entry'), how: t('Server-side'), server: true },
    { a: t('Issue stock from the store'), b: t('Adjust the stock count'), how: t('Server-side'), server: true },
    { a: t('Create an employee record'), b: t('Approve the payroll run'), how: t('Server-side'), server: true },
    { a: t('Price an estimate'), b: t('Authorise it on the customer’s behalf'), how: t('The customer signs'), server: false },
  ]
}

const CORE = { x: 500, y: 372 }

export function SystemPage({ t }: { t: T }) {
  const domainList = domains(t)
  const [selected, setSelected] = useState(domainList[0].key)
  const activeIndex = Math.max(
    0,
    domainList.findIndex((d) => d.key === selected)
  )
  const active = domainList[activeIndex]

  return (
    <>
      <section className="masthead" aria-labelledby="system-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 01 — What it is made of')}</span>
            <h1 id="system-hero-h" className="rise">
              <span className="thin">{t('The')}</span> {t('System')}
            </h1>
            <p className="lede rise">
              {t('Thirteen functional domains on one tenancy. Workshop sits at the centre because everything else exists to serve a job card; the other twelve surround it. Each card below carries the domain in English and in Arabic, because')}{' '}
              <b>{t('Arabic is not a translation layer here')}</b> —{' '}
              {t('it is half the product, right to left, on the same day.')}
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Domains')}</div>
                <div className="v" dir="ltr">13</div>
              </div>
              <div>
                <div className="k">{t('Permission modules')}</div>
                <div className="v" dir="ltr">28</div>
              </div>
              <div>
                <div className="k">{t('Roles')}</div>
                <div className="v" dir="ltr">14</div>
              </div>
              <div>
                <div className="k">{t('Audit rows')}</div>
                <div className="v" dir="ltr">
                  1<em>/{t('change')}</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="system-constellation" aria-labelledby="system-constellation-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — The shape of it')}</span>
          <h2 id="system-constellation-h">{t('Domain constellation')}</h2>
          <p>
            {t('Nothing here is a layer stacked on another. The domains share one contract package — the same Zod schemas, permission tables and business rules imported by the server and the browser — so an invoice can post its own journal entry and a part can leave stock costed, with nobody carrying the number between systems by hand. Select a node.')}
          </p>
        </div>

        <div className="constel">
          <div className="panel constel-stage rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner tr" aria-hidden="true" />
            <i className="corner bl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <svg viewBox="0 0 1000 760" aria-hidden="true" focusable="false">
              {domainList.map((domain) => (
                <line
                  key={`spoke-${domain.key}`}
                  x1={CORE.x}
                  y1={CORE.y}
                  x2={domain.cx}
                  y2={domain.cy}
                  stroke="var(--hair)"
                  strokeWidth="1"
                />
              ))}
              <circle cx={CORE.x} cy={CORE.y} r="118" fill="rgba(11,179,255,.07)" />
              <circle cx={CORE.x} cy={CORE.y} r="52" fill="var(--void)" stroke="var(--hair-strong)" strokeWidth="1.4" />
              <circle cx={CORE.x} cy={CORE.y} r="7" fill="var(--cyan)" />
              {domainList.map((domain, i) => (
                <g key={`node-${domain.key}`}>
                  <circle
                    cx={domain.cx}
                    cy={domain.cy}
                    r="21"
                    fill="rgba(11,179,255,.16)"
                    opacity={i === activeIndex ? 1 : 0}
                  />
                  <circle
                    cx={domain.cx}
                    cy={domain.cy}
                    r="11"
                    fill="var(--void)"
                    stroke={i === activeIndex ? 'var(--ember)' : 'var(--cyan)'}
                    strokeWidth="1.6"
                  />
                  <circle cx={domain.cx} cy={domain.cy} r="3.2" fill={i === activeIndex ? 'var(--ember)' : 'var(--cyan)'} />
                </g>
              ))}
            </svg>
            <div className="subsystem-list" role="group" aria-label={t('Thirteen domains')}>
              {domainList.map((domain) => (
                <button
                  key={domain.key}
                  type="button"
                  className={domain.key === selected ? 'on' : undefined}
                  aria-pressed={domain.key === selected}
                  onClick={() => setSelected(domain.key)}
                >
                  {domain.name}
                </button>
              ))}
            </div>
          </div>

          <aside className="panel constel-detail rise" aria-live="polite">
            <i className="corner tr" aria-hidden="true" />
            <i className="corner bl" aria-hidden="true" />
            <span className="tag">
              {t('Domain')} <span dir="ltr">{String(activeIndex + 1).padStart(2, '0')} / 13</span>
            </span>
            <h3>{active.name}</h3>
            <div className="then" dir="rtl">
              {active.arabic}
            </div>
            <p>{active.blurb}</p>
            <ul>
              {active.modules.map((mod) => (
                <li key={mod.name}>
                  <span>{mod.name}</span>
                  <b>{mod.gloss}</b>
                </li>
              ))}
            </ul>
            <div className="hint">{t('Module · what it carries')}</div>
          </aside>
        </div>
      </section>

      <div className="rule" />

      <section id="system-inventory" aria-labelledby="system-inventory-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — The full inventory')}</span>
          <h2 id="system-inventory-h">{t('Thirteen domains')}</h2>
          <p>{t('The orange line under each title is the domain’s Arabic name, as it appears in the product. Under that, the modules it carries.')}</p>
        </div>
        <div className="cards">
          {domainList.map((domain, i) => (
            <article className="panel card rise" key={domain.key}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="idx">
                <span>
                  {t('DOMAIN')} <span dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <b dir="ltr">AR · EN</b>
              </div>
              <h3>{domain.name}</h3>
              <div className="then" dir="rtl">
                {domain.arabic}
              </div>
              <p>{domain.blurb}</p>
              <ul>
                {domain.modules.map((mod) => (
                  <li key={mod.name}>{mod.name}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="system-roles" aria-labelledby="system-roles-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Who the system answers to')}</span>
          <h2 id="system-roles-h">{t('Fourteen roles')}</h2>
          <p>
            {t('A role is not a menu; it is a boundary. Twenty-eight permission modules, five actions each, checked on every screen and every write — and each role carries an approval ceiling in riyals, above which it may not commit the workshop to anything. The refusal is logged as carefully as the change.')}
          </p>
        </div>
        <div className="roles">
          {roles(t).map((role) => (
            <div className="role rise" key={role.name}>
              <div>
                <h3>{role.name}</h3>
                <p>{role.note}</p>
              </div>
              <div className="where">{role.scope}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="system-spine" aria-labelledby="system-spine-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — What holds it up')}</span>
          <h2 id="system-spine-h">{t('The spine')}</h2>
          <p>{t('Four decisions carry everything above. Remove any one and this is a filing cabinet.')}</p>
        </div>
        <div className="steps rise">
          <div>
            <div className="n" dir="ltr">S/01</div>
            <h3>{t('One contract, both sides')}</h3>
            <p>
              {t('A shared package holds the Zod schemas, the permission tables and the business rules. One definition is the API type, the server guard and the form validator at once, so the browser and the server cannot drift into disagreeing about what a job card is.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">S/02</div>
            <h3>{t('The tenant boundary')}</h3>
            <p>
              {t('PostgreSQL 16 with row-level security. Every row carries its organisation and its branch, and the database — not a forgotten where clause — decides who may read it.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">S/03</div>
            <h3>{t('The repository seam')}</h3>
            <p>
              {t('The interface reads data through one collection seam rather than calling the API directly. A screen does not know whether it is reading fixtures or a live server, which is what makes it testable in the first place.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">S/04</div>
            <h3>{t('The audit row')}</h3>
            <p>
              {t('Who changed what, when, from what, to what — for every write, with no exceptions for convenience, and for every refusal too. Money moves as integer halalas and is rounded once, at the total.')}
            </p>
          </div>
        </div>

        <div className="pull rise" style={{ marginTop: 22 }}>
          <q>
            {t('The hard part was never the diagnosis. It was that six people wrote the same number into four systems and one of them was wrong by Thursday.')}
          </q>
          <div className="who">
            {t('Design note')}
            <span>{t('The problem the platform was built to end — one number, entered once, carried everywhere')}</span>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="system-truth" aria-labelledby="system-truth-h">
        <div className="sec-head rise">
          <span className="tag">{t('05 — What cannot be bent')}</span>
          <h2 id="system-truth-h">{t('Separation of duties')}</h2>
          <p>
            {t('Six pairs of actions that one person may never hold at both ends. These are not settings a busy branch can switch off on a Thursday; they are enforced by the server, and every attempt is written down.')}
          </p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('One person may not…')}</th>
                <th>{t('…and also')}</th>
                <th>{t('Enforced')}</th>
              </tr>
            </thead>
            <tbody>
              {duties(t).map((pair) => (
                <tr key={pair.a}>
                  <th>{pair.a}</th>
                  <td style={{ textAlign: 'start', color: 'var(--mist)' }}>{pair.b}</td>
                  <td className={pair.server ? 'em' : undefined}>{pair.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
