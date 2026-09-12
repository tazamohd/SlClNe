import { Link } from 'react-router-dom'
import type { T } from '../types'

/** Grid — the real parts, inventory and procurement flow, the real three
 *  portals (linked to the routes that already exist), and the real
 *  organisation/branch/user data-scope model from the RBAC design. No
 *  printing, licensing or invented geometry — the supply chain here is the
 *  one the product ships. */

function scopes(t: T): readonly { level: string; sees: string }[] {
  return [
    { level: t('Platform'), sees: t('Every organisation on SALIS AUTO — the Super Admin standing only.') },
    { level: t('Organisation'), sees: t('Every branch a workshop group owns — Owner, Accountant, HR.') },
    { level: t('Branch'), sees: t('One branch — Branch Manager, Service Advisor, QC Inspector, Storekeeper.') },
    { level: t('Own / self'), sees: t('Only what is assigned to you — a Technician’s jobs, a Customer’s own vehicles.') },
  ]
}

export function GridPage({ t }: { t: T }) {
  return (
    <>
      <section className="masthead" aria-labelledby="grid-hero-h">
        <div className="masthead-grid">
          <div>
            <span className="tag rise">{t('Chapter 02 — Where the parts are')}</span>
            <h1 id="grid-hero-h" className="rise">
              <span className="thin">{t('The')}</span> {t('Grid')}
            </h1>
            <p className="lede rise">
              {t('Stock with minimums, purchase orders with approval routing, and supplier catalogues a workshop actually orders against — plus three real doors into the platform: customer, technician and supplier.')}
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Branches per group')}</div>
                <div className="v" dir="ltr">
                  {t('Unlimited')}
                </div>
              </div>
              <div>
                <div className="k">{t('Doors')}</div>
                <div className="v" dir="ltr">3</div>
              </div>
              <div>
                <div className="k">{t('Approval routing')}</div>
                <div className="v">{t('Built in')}</div>
              </div>
              <div>
                <div className="k">{t('Data scopes')}</div>
                <div className="v" dir="ltr">4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="grid-mesh-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Catalogue to bay')}</span>
          <h2 id="grid-mesh-h">{t('Parts and inventory')}</h2>
          <p>
            {t('A purchase order references a real supplier from the directory, is routed for approval, and the parts it brings in are booked into stock — costed into the job the moment they are used.')}
          </p>
        </div>
        <div className="panel diagram-stage rise">
          <i className="corner tl" aria-hidden="true" />
          <i className="corner tr" aria-hidden="true" />
          <i className="corner bl" aria-hidden="true" />
          <i className="corner br" aria-hidden="true" />
          <svg viewBox="0 0 640 160" role="img" aria-label={t('Supplier catalogue feeds a purchase order, which feeds stock, which feeds the job.')}>
            {['70', '250', '430', '600'].map((x, i) => (
              <g key={x}>
                <rect x={Number(x) - 46} y={60} width={92} height={40} fill="none" stroke="var(--hair-strong)" strokeWidth="1.4" />
                {i < 3 ? <line x1={Number(x) + 46} y1={80} x2={Number(x) + 158} y2={80} stroke="var(--hair-strong)" strokeWidth="1.4" /> : null}
              </g>
            ))}
          </svg>
          <div className="diagram-cap">
            {t('Supplier catalogue')} → {t('Purchase order')} → {t('Stock')} → {t('Job card')}
          </div>
        </div>
        <div className="cards wide rise" style={{ marginTop: 22 }}>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Stock, minimums and reorder points')}</h3>
            <p>{t('The shelf orders against a minimum level, so the money sitting on it is never a guess.')}</p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Purchase orders, with approval routing')}</h3>
            <p>{t('A Procurement Agent places the order; a Branch Manager or Owner approves it above their ceiling.')}</p>
          </article>
          <article className="panel card">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Supplier catalogues and price lists')}</h3>
            <p>{t('A supplier joins the directory so orders reference it, not a free-typed name.')}</p>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="grid-doors-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Three ways in')}</span>
          <h2 id="grid-doors-h">{t('Three doors')}</h2>
          <p>
            {t('Each door sees its own slice and nothing adjacent to it — the portal model the product ships, one click from the real thing.')}
          </p>
        </div>
        <div className="cards">
          <article className="panel card rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span>{t('DOOR 01')}</span>
              <b>{t('SCOPED')}</b>
            </div>
            <h3>{t('The customer door')}</h3>
            <div className="then">{t('Customer app')}</div>
            <p>{t('Bookings, the estimate waiting for a signature, and the service history the customer owns outright.')}</p>
            <ul>
              <li>{t('Their own vehicles and no one else’s')}</li>
              <li>{t('Estimates, to sign or decline')}</li>
              <li>{t('Appointments and reminders')}</li>
              <li>{t('Invoices, held for the vehicle’s life')}</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <Link className="btn ghost" to="/public-portal/customer-portal">
                {t('Open the customer portal')}
              </Link>
            </p>
          </article>
          <article className="panel card rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span>{t('DOOR 02')}</span>
              <b>{t('SCOPED')}</b>
            </div>
            <h3>{t('The technician door')}</h3>
            <div className="then">{t('Technician portal')}</div>
            <p>{t('Short, unambiguous instructions on a phone, in Arabic, operable with one hand. Time clock, the next job, and nothing about money.')}</p>
            <ul>
              <li>{t('Only jobs assigned to them')}</li>
              <li>{t('Parts request against the job')}</li>
              <li>{t('Time clock and attendance')}</li>
              <li>{t('Guides and documentation')}</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <Link className="btn ghost" to="/public-portal/technician-portal">
                {t('Open the technician portal')}
              </Link>
            </p>
          </article>
          <article className="panel card rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <div className="idx">
              <span>{t('DOOR 03')}</span>
              <b>{t('SCOPED')}</b>
            </div>
            <h3>{t('The supplier door')}</h3>
            <div className="then">{t('Supplier portal')}</div>
            <p>{t('A supplier sees the orders placed with it and its own catalogue and prices — and nothing about the workshop beside it.')}</p>
            <ul>
              <li>{t('Its own orders only')}</li>
              <li>{t('Its own catalogue and prices')}</li>
              <li>{t('Delivery state')}</li>
              <li>{t('No customer data, ever')}</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <Link className="btn ghost" to="/public-portal/supplier-portal">
                {t('Open the supplier portal')}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="grid-scope-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Who sees what')}</span>
          <h2 id="grid-scope-h">{t('Four data scopes')}</h2>
          <p>{t('Row-level, enforced by the database — every role above is assigned exactly one of these.')}</p>
        </div>
        <div className="matrix-wrap rise">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t('Scope')}</th>
                <th>{t('Sees')}</th>
              </tr>
            </thead>
            <tbody>
              {scopes(t).map((s) => (
                <tr key={s.level}>
                  <th>{s.level}</th>
                  <td style={{ textAlign: 'start' }}>{s.sees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link className="btn ghost" to="/public-portal/features">
            {t('Every module under every domain')} →
          </Link>
        </p>
      </section>
    </>
  )
}
