import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Grid — the "SALIS AUTO 2030" artifact's `grid` page: the supply chain
 *  drawn, requisition to issue, the six doors, the order stream and the branch
 *  roll-call.
 *
 *  One departure, and it is the honest one. The artifact draws six portals as
 *  six identical cards; the app has three public portal routes — customer,
 *  technician and supplier (`/public-portal/{customer,technician,supplier}-portal`).
 *  Those three carry a real `<Link>`. The other three doors — procurement,
 *  kiosk and super admin — live inside the signed-in application and have no
 *  public page, so they render as informational tiles that say so, rather than
 *  as a link to a route that does not exist.
 *
 *  The artifact's supply-mesh canvas (packets flowing supplier → store → bay)
 *  is reimplemented as a static SVG of the same wiring, drawn at rest. */

/** The five catalogue sources the workshop buys against — the artifact's
 *  `LIBS`, positioned down the left of the mesh. */
function catalogues(t: T): readonly { label: string; y: number }[] {
  return [
    { label: t('OEM CATALOGUE'), y: 72 },
    { label: t('AFTERMARKET'), y: 126 },
    { label: t('LOCAL DISTRIBUTOR'), y: 180 },
    { label: t('TYRES & BATTERIES'), y: 234 },
    { label: t('CONSUMABLES'), y: 288 },
  ]
}

const BAY_Y = [47, 80, 113, 147, 180, 213, 247, 280, 313]

interface Portal {
  readonly key: string
  readonly name: string
  readonly then: string
  readonly body: string
  readonly sees: readonly string[]
  /** A real public route, or `null` for a door that only exists signed in. */
  readonly to: string | null
  readonly cta: string
}

function portals(t: T): readonly Portal[] {
  return [
    {
      key: 'customer',
      name: t('The customer door'),
      then: t('Customer app · تطبيق العميل'),
      body: t('One life — the vehicle’s. Bookings, the estimate waiting for a signature, the service history and the invoices, on a phone, in Arabic or English.'),
      sees: [
        t('Their own vehicles and no one else’s'),
        t('Estimates, to sign by one-time code'),
        t('Appointments and service reminders'),
        t('Invoices, with the ZATCA QR'),
      ],
      to: '/public-portal/customer-portal',
      cta: t('Open the customer portal'),
    },
    {
      key: 'technician',
      name: t('The technician door'),
      then: t('Technician portal · بوابة الفني'),
      body: t('Short, unambiguous instructions on a phone, in Arabic, operable with one hand — because the other one is holding the part. The next hour, and nothing about money.'),
      sees: [
        t('Only jobs assigned to them'),
        t('Parts requested against the job'),
        t('Time clock and attendance'),
        t('No part cost, no margin, ever'),
      ],
      to: '/public-portal/technician-portal',
      cta: t('Open the technician portal'),
    },
    {
      key: 'supplier',
      name: t('The supplier door'),
      then: t('Supplier portal · بوابة المورّد'),
      body: t('Orders in, confirmations out. A supplier sees the purchase orders placed with it and the catalogue it published — and nothing about the workshop beside it.'),
      sees: [
        t('Its own purchase orders only'),
        t('Its own catalogue and price list'),
        t('Delivery confirmation'),
        t('No customer data, ever'),
      ],
      to: '/public-portal/supplier-portal',
      cta: t('Open the supplier portal'),
    },
    {
      key: 'procurement',
      name: t('The procurement door'),
      then: t('Procurement portal · بوابة المشتريات'),
      body: t('Requisitions from every branch in one queue, priced against the catalogues, released only within the ceiling the role carries.'),
      sees: [
        t('Requisitions across branches'),
        t('Orders, awaiting and released'),
        t('Supplier performance'),
        t('Never approves its own requisition'),
      ],
      to: null,
      cta: '',
    },
    {
      key: 'kiosk',
      name: t('The kiosk door'),
      then: t('Kiosk check-in · الاستقبال الذاتي'),
      body: t('A customer who arrives before the desk is free starts their own check-in: plate, complaint, photographs. The card is open before anyone has said good morning.'),
      sees: [t('Plate or phone lookup'), t('Complaint and photographs'), t('Queue position'), t('No pricing, no history')],
      to: null,
      cta: '',
    },
    {
      key: 'admin',
      name: t('The admin door'),
      then: t('Super admin · المشرف العام'),
      body: t('Tenants, branches, roles and the audit log. The most powerful door in the building and the most heavily recorded one.'),
      sees: [
        t('Tenants and branches'),
        t('The 14 × 28 permission matrix'),
        t('Every change and every refusal'),
        t('ZATCA, VAT and Zakat settings'),
      ],
      to: null,
      cta: '',
    },
  ]
}

/** The artifact's `PARTS` × `STATES` order stream, frozen at one representative
 *  reading rather than re-rolled on every load. */
function orders(t: T): readonly { part: string; supplier: string; branch: string; state: string; due: string; warn: boolean }[] {
  return [
    { part: t('Brake pads, front axle'), supplier: t('OEM CATALOGUE'), branch: t('Riyadh · Main branch'), state: t('Ordered'), due: '12', warn: false },
    { part: t('Oil filter · service kit'), supplier: t('CONSUMABLES'), branch: t('Jeddah · Branch 04'), state: t('Received'), due: '7', warn: false },
    { part: t('Suspension arm, front left'), supplier: t('AFTERMARKET'), branch: t('Dammam · Branch 11'), state: t('Awaiting approval'), due: '41', warn: true },
    { part: t('Timing belt and water pump'), supplier: t('OEM CATALOGUE'), branch: t('NEOM · Branch 01'), state: t('Requisition raised'), due: '23', warn: false },
    { part: t('Battery 80 Ah'), supplier: t('TYRES & BATTERIES'), branch: t('Riyadh · Main branch'), state: t('Approved'), due: '9', warn: false },
    { part: t('A/C compressor'), supplier: t('LOCAL DISTRIBUTOR'), branch: t('Makkah · Branch 02'), state: t('Awaiting approval'), due: '55', warn: true },
    { part: t('Brake discs ×2'), supplier: t('AFTERMARKET'), branch: t('Khobar · Branch 12'), state: t('Ordered'), due: '18', warn: false },
    { part: t('Coolant, 5 L'), supplier: t('CONSUMABLES'), branch: t('Madinah · Branch 03'), state: t('Received'), due: '5', warn: false },
  ]
}

/** The artifact's store-floor log, with the clock frozen for the same reason
 *  the Arrival page's activity stream is. */
function storeFloor(t: T): readonly { time: string; text: string; detail: string; attn: boolean }[] {
  return [
    { time: '10:04:51', text: t('Requisition raised'), detail: t('JC-4821 · front pads'), attn: false },
    { time: '10:01:26', text: t('Purchase order sent'), detail: 'PO 4471', attn: false },
    { time: '09:57:13', text: t('Goods received'), detail: t('12 of 12 lines'), attn: false },
    { time: '09:53:40', text: t('ATTENTION — below reorder point'), detail: t('oil filter · 4 left'), attn: true },
    { time: '09:49:02', text: t('Costed into stock'), detail: 'SAR 1,905.00', attn: false },
    { time: '09:45:38', text: t('Issued to job card'), detail: 'JC-9930', attn: false },
    { time: '09:41:19', text: t('Transfer out'), detail: t('Riyadh → Jeddah'), attn: false },
    { time: '09:36:55', text: t('ATTENTION — approval waiting'), detail: 'PO 4488 · SAR 62,400', attn: true },
    { time: '09:32:07', text: t('Price list updated'), detail: t('OEM CATALOGUE'), attn: false },
    { time: '09:28:44', text: t('Stock count adjusted'), detail: t('with reason code'), attn: false },
  ]
}

/** The artifact's `NODES` — a sample tenant with twelve locations. */
function branches(t: T): readonly { name: string; kind: string; bays: string; cards: string; serving: boolean }[] {
  const branch = t('Branch')
  const point = t('Service point')
  return [
    { name: t('Riyadh · Main branch'), kind: branch, bays: '9', cards: '38', serving: true },
    { name: t('Jeddah · Branch 04'), kind: branch, bays: '4', cards: '17', serving: true },
    { name: t('Dammam · Branch 11'), kind: branch, bays: '3', cards: '12', serving: true },
    { name: t('NEOM · Branch 01'), kind: branch, bays: '6', cards: '21', serving: true },
    { name: t('Madinah · Branch 03'), kind: branch, bays: '3', cards: '11', serving: true },
    { name: t('Abha · Branch 07'), kind: branch, bays: '2', cards: '8', serving: true },
    { name: t('Tabuk · Branch 09'), kind: branch, bays: '2', cards: '6', serving: true },
    { name: t('Hail · Service point'), kind: point, bays: '—', cards: '4', serving: false },
    { name: t('Al-Ula · Service point'), kind: point, bays: '—', cards: '3', serving: false },
    { name: t('Jubail · Branch 08'), kind: branch, bays: '2', cards: '9', serving: true },
    { name: t('Makkah · Branch 02'), kind: branch, bays: '5', cards: '26', serving: true },
    { name: t('Khobar · Branch 12'), kind: branch, bays: '3', cards: '14', serving: true },
  ]
}

export function GridPage({ t }: { t: T }) {
  const libs = catalogues(t)

  return (
    <>
      <section className="masthead" aria-labelledby="grid-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 02 — Where the metal is')}</span>
            <h1 id="grid-hero-h" className="rise">
              <span className="thin">{t('The')}</span> {t('Grid')}
            </h1>
            <p className="lede rise">
              {t('Parts are where a workshop quietly loses its margin: the part nobody ordered, the one ordered twice, the one issued to a job and never costed onto it. Here stock is')}{' '}
              <b>{t('the sum of its movements')}</b>{' '}
              {t('rather than a number somebody edits, every order carries an approval ceiling, and the person who raises a requisition is never the person who approves it.')}
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Portals')}</div>
                <div className="v" dir="ltr">6</div>
              </div>
              <div>
                <div className="k">{t('Duty pairs split')}</div>
                <div className="v" dir="ltr">6</div>
              </div>
              <div>
                <div className="k">{t('Stock')}</div>
                <div className="v">{t('Derived')}</div>
              </div>
              <div>
                <div className="k">{t('Transfers')}</div>
                <div className="v">
                  {t('Branch')}
                  <em>
                    <span dir="ltr">↔</span>
                    {t('branch')}
                  </em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="grid-mesh" aria-labelledby="grid-mesh-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Supplier to bay')}</span>
          <h2 id="grid-mesh-h">{t('The supply chain, drawn')}</h2>
          <p>
            {t('Left: the supplier catalogues and price lists the workshop buys against. Centre: the store, where every unit arrives costed and leaves against a job card. Right: the bays waiting for it. Nothing moves through the middle without a movement row behind it.')}
          </p>
        </div>
        <div className="panel mesh-stage rise">
          <i className="corner tl" aria-hidden="true" />
          <i className="corner tr" aria-hidden="true" />
          <i className="corner bl" aria-hidden="true" />
          <i className="corner br" aria-hidden="true" />
          <svg
            viewBox="0 0 620 360"
            role="img"
            aria-label={t('Five supplier catalogues feed one central store, which issues parts to nine bays.')}
          >
            {libs.map((lib) => (
              <line key={`wire-${lib.y}`} x1="110" y1={lib.y} x2="310" y2="180" stroke="var(--hair)" strokeWidth="1" />
            ))}
            {BAY_Y.map((y) => (
              <line key={`bay-wire-${y}`} x1="310" y1="180" x2="510" y2={y} stroke="var(--hair)" strokeWidth="1" />
            ))}
            {libs.map((lib) => (
              <g key={`lib-${lib.y}`}>
                <rect x="96" y={lib.y - 7} width="14" height="14" transform={`rotate(45 103 ${lib.y})`} fill="var(--void)" stroke="var(--cyan)" strokeWidth="1.3" />
                <text x="82" y={lib.y + 4} textAnchor="end" fill="var(--steel)" fontSize="11" fontFamily="var(--f-mono)">
                  {lib.label}
                </text>
              </g>
            ))}
            <circle cx="310" cy="180" r="44" fill="rgba(11,179,255,.08)" stroke="var(--hair-strong)" strokeWidth="1.4" />
            <text x="310" y="184" textAnchor="middle" fill="var(--ink)" fontSize="12" fontFamily="var(--f-mono)" letterSpacing="2">
              {t('STORE')}
            </text>
            {BAY_Y.map((y, i) => (
              <g key={`bay-${y}`}>
                <circle cx="510" cy={y} r="7" fill="var(--void)" stroke={i === 3 ? 'var(--ember)' : 'var(--cyan)'} strokeWidth="1.3" />
                <text x="526" y={y + 4} fill="var(--dim)" fontSize="10" fontFamily="var(--f-mono)">
                  {`0${i + 1}`}
                </text>
              </g>
            ))}
          </svg>
          <div className="mesh-cap">
            <b>◆</b> {t('SUPPLIER')} · <b>⬡</b> {t('STORE')} · <b>◈</b> {t('BAY')}
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="grid-matter" aria-labelledby="grid-matter-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — How a part reaches a job')}</span>
          <h2 id="grid-matter-h">{t('Requisition to issue')}</h2>
          <p>{t('Four steps, and a different pair of hands at each end of the first two.')}</p>
        </div>

        <div className="steps rise">
          <div>
            <div className="n" dir="ltr">P/01</div>
            <h3>{t('Requisition')}</h3>
            <p>
              {t('The technician needs a part; the card asks for it by name against the job. The person who raises it may never be the person who approves it — that pair is split at the server, not by office custom.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">P/02</div>
            <h3>{t('Order')}</h3>
            <p>
              {t('Approved inside the role’s ceiling — an advisor to SAR 5,000, a storekeeper to 10,000, a branch manager to 50,000 — and sent to the supplier as a purchase order with a price the catalogue already agreed.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">P/03</div>
            <h3>{t('Received')}</h3>
            <p>
              {t('Goods are checked in against the order rather than against memory. Short deliveries stay open, and what does arrive is costed into stock at what was actually paid for it.')}
            </p>
          </div>
          <div>
            <div className="n" dir="ltr">P/04</div>
            <h3>{t('Issued')}</h3>
            <p>
              {t('The storekeeper issues it to the job card during the repair. Stock falls because a movement says so, and the part is on the invoice before it is bolted on.')}
            </p>
          </div>
        </div>

        <div className="cards wide rise" style={{ marginTop: 22 }}>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span>{t('THE STORE')}</span>
              <b>{t('STOCK')}</b>
            </div>
            <h3>{t('What the storekeeper holds')}</h3>
            <div className="then" dir="rtl">
              أمين المستودع
            </div>
            <p>
              {t('A count nobody types. On-hand is the sum of every movement since the opening quantity, which means a discrepancy is a missing movement rather than an argument — and the person who issues stock is not the person who may adjust the count.')}
            </p>
            <ul>
              <li>{t('Stock by branch, with reorder points')}</li>
              <li>{t('Movements: received, issued, transferred, adjusted')}</li>
              <li>{t('Inter-branch transfer, both sides recorded')}</li>
              <li>{t('Parts issued straight onto the job card')}</li>
            </ul>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span>{t('PURCHASING')}</span>
              <b>{t('ORDERS')}</b>
            </div>
            <h3>{t('What procurement holds')}</h3>
            <div className="then" dir="rtl">
              وكيل المشتريات
            </div>
            <p>
              {t('Suppliers, catalogues and the orders placed against them — with a ceiling on every role and a rule that survives a busy Thursday: whoever raised the requisition is not the one who releases the money for it.')}
            </p>
            <ul>
              <li>{t('Suppliers, catalogues and price lists')}</li>
              <li>{t('Purchase orders with an approval chain')}</li>
              <li>{t('Goods received against the order, costed')}</li>
              <li>{t('Supplier portal: its own orders, nothing else')}</li>
            </ul>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section id="grid-portals" aria-labelledby="grid-portals-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Six ways in')}</span>
          <h2 id="grid-portals-h">{t('Six doors')}</h2>
          <p>
            {t('Not everyone who touches a job card should be given the whole application. Each portal carries its own permissions and sees exactly its own slice: a supplier never sees a customer, a technician never sees a margin, a customer sees one vehicle — theirs.')}
          </p>
        </div>
        <div className="cards">
          {portals(t).map((portal, i) => (
            <article className="panel card rise" key={portal.key}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="idx">
                <span>
                  {t('DOOR')} <span dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <b>{t('SCOPED')}</b>
              </div>
              <h3>{portal.name}</h3>
              <div className="then">{portal.then}</div>
              <p>{portal.body}</p>
              <ul>
                {portal.sees.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {portal.to ? (
                <p style={{ marginTop: 16 }}>
                  <Link className="btn ghost" to={portal.to}>
                    {portal.cta}
                  </Link>
                </p>
              ) : (
                <p className="fine-note">{t('Inside the signed-in application — this door has no public page.')}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="grid-stream" aria-labelledby="grid-stream-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Purchasing, in motion')}</span>
          <h2 id="grid-stream-h">{t('Order stream')}</h2>
          <p>{t('Sample data, shown on this page. No network, no supplier, no order.')}</p>
        </div>
        <div className="fleet-wrap">
          <div className="matrix-wrap rise">
            <table className="matrix">
              <thead>
                <tr>
                  <th>{t('Part')}</th>
                  <th>{t('Supplier')}</th>
                  <th>{t('Branch')}</th>
                  <th>{t('State')}</th>
                  <th>{t('Due')}</th>
                </tr>
              </thead>
              <tbody>
                {orders(t).map((row) => (
                  <tr key={row.part}>
                    <th>{row.part}</th>
                    <td style={{ textAlign: 'start' }}>{row.supplier}</td>
                    <td style={{ textAlign: 'start', color: 'var(--mist)' }}>{row.branch}</td>
                    <td className={row.warn ? 'em' : undefined}>{row.state}</td>
                    <td dir="ltr">
                      {row.due} {t('min')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel log rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Store floor')}</h3>
            <ul>
              {storeFloor(t).map((entry) => (
                <li className={entry.attn ? 'e' : undefined} key={entry.time}>
                  <time dir="ltr">{entry.time}</time>
                  <span>
                    {entry.text} <b dir="ltr">{entry.detail}</b>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="grid-reach" aria-labelledby="grid-reach-h">
        <div className="sec-head rise">
          <span className="tag">{t('05 — How far it goes')}</span>
          <h2 id="grid-reach-h">{t('Branch roll-call')}</h2>
          <p>
            {t('A sample tenant with twelve locations. A branch runs bays and holds stock; a service point takes bookings and hands work to the nearest branch. Every one of them reads its own rows and only its own, and the group’s books add up across all of them.')}
          </p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Branch')}</th>
                <th>{t('Class')}</th>
                <th>{t('Bays')}</th>
                <th>{t('Open cards')}</th>
                <th>{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {branches(t).map((row) => (
                <tr key={row.name}>
                  <th>{row.name}</th>
                  <td style={{ textAlign: 'start' }}>{row.kind}</td>
                  <td dir="ltr">{row.bays}</td>
                  <td dir="ltr">{row.cards}</td>
                  <td className={row.serving ? undefined : 'no'}>{row.serving ? t('Serving') : t('Bookings only')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-note rise">{t('Sample tenant. No tenant data reaches this page.')}</p>
      </section>
    </>
  )
}
