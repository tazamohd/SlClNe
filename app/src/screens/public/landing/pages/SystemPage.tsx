import { useState } from 'react'
import type { T } from '../types'

/** System — the real thirteen domains the product ships (`DOMAINS` on the
 *  real landing page) as a selectable inventory, and the real fourteen roles
 *  from the platform's RBAC model (`project/handoff/README.md` §3), plus the
 *  four real architectural facts that hold the whole thing together. There
 *  is no fiction/fact table on this page any more — every line here already
 *  is fact, so there is nothing left to compare it against. */

interface Domain {
  readonly key: string
  readonly name: string
  readonly blurb: string
  readonly modules: readonly string[]
}

function domains(t: T): readonly Domain[] {
  return [
    { key: 'workshop', name: t('Workshop'), blurb: t('The floor itself: job cards, the bay board and inspections, all on one record.'),
      modules: [t('Job cards'), t('Bay board'), t('Inspection')] },
    { key: 'registry', name: t('Registry'), blurb: t('Every vehicle and customer the workshop has ever served, in one place.'),
      modules: [t('Vehicles, VIN decoding'), t('Customers'), t('Service history')] },
    { key: 'finance', name: t('Finance'), blurb: t('ZATCA Phase 2 e-invoicing, VAT and payments, wired into every job card.'),
      modules: [t('ZATCA Phase 2 e-invoicing'), t('VAT 15%'), t('Payments, Mada')] },
    { key: 'accounting', name: t('Accounting'), blurb: t('The invoice becomes the journal entry — no re-keying, no separate close.'),
      modules: [t('Chart of accounts'), t('Journals from invoices'), t('Statements')] },
    { key: 'crm', name: t('CRM and marketing'), blurb: t('Reminders, campaigns and loyalty, addressed to a real service history.'),
      modules: [t('Service reminders'), t('Campaigns: SMS, email, WhatsApp'), t('Loyalty')] },
    { key: 'admin', name: t('Administration'), blurb: t('Organisation, branch and user boundaries, enforced on every screen.'),
      modules: [t('Organisation, branch, user'), t('14 roles, 28 modules'), t('Branch settings')] },
    { key: 'auth', name: t('Authentication'), blurb: t('Password policy, SMS OTP and session control for every sign-in.'),
      modules: [t('Password policy'), t('SMS OTP'), t('Session control')] },
    { key: 'ai', name: t('AI platform'), blurb: t('An assistant, a knowledge base and agents — configured with an API key at deployment.'),
      modules: [t('Assistant'), t('Knowledge base'), t('Agents')] },
    { key: 'parts', name: t('Parts and inventory'), blurb: t('Stock with minimums, purchase orders and supplier catalogues.'),
      modules: [t('Stock, minimums'), t('Purchase orders'), t('Supplier catalogues')] },
    { key: 'callcentre', name: t('Call centre'), blurb: t('Every call logged against the vehicle it was about, with the follow-up scheduled.'),
      modules: [t('Call logging'), t('Appointments'), t('Follow-ups')] },
    { key: 'reports', name: t('Reports and analytics'), blurb: t('A dashboard per role, custom reports, and alerts on the numbers that matter.'),
      modules: [t('Role dashboards'), t('Custom reports'), t('KPIs, alerts')] },
    { key: 'hr', name: t('Team and HR'), blurb: t('Employee records, attendance and performance for the whole crew.'),
      modules: [t('Employee records, Iqama'), t('Attendance'), t('Performance')] },
    { key: 'portals', name: t('Portals'), blurb: t('Three doors in — customer, technician and supplier — each scoped to its own slice.'),
      modules: [t('Customer app'), t('Technician portal'), t('Supplier portal')] },
  ]
}

interface Standing {
  readonly role: string
  readonly scope: string
  readonly limit: string
  readonly note: string
}

/** The real 14-role RBAC roster — labels, data scope and approval ceiling
 *  from `project/handoff/README.md` §3. */
function standings(t: T): readonly Standing[] {
  return [
    { role: t('Owner / CEO'), scope: t('all'), limit: '∞', note: t('Sees every branch and every number, with no ceiling on approval.') },
    { role: t('Super Admin'), scope: t('platform'), limit: '∞', note: t('Holds the platform itself, across every tenant.') },
    { role: t('Branch Manager'), scope: t('branch'), limit: 'SAR 50,000', note: t('Owns one branch and everything that happens in it.') },
    { role: t('Service Advisor'), scope: t('branch'), limit: 'SAR 5,000', note: t('Stands where the customer stands; raises the estimate they sign.') },
    { role: t('Technician'), scope: t('own'), limit: '—', note: t('Sees the next job assigned to them, in Arabic, on a phone.') },
    { role: t('QC Inspector'), scope: t('branch'), limit: '—', note: t('The second signature. Cannot be the first.') },
    { role: t('Storekeeper'), scope: t('branch'), limit: 'SAR 10,000', note: t('Moves parts, and answers for every unit of stock.') },
    { role: t('Accountant'), scope: t('all'), limit: 'SAR 25,000', note: t('Reads every ledger; reconciles VAT without redoing the month.') },
    { role: t('HR Manager'), scope: t('all'), limit: 'SAR 15,000', note: t('Holds the employee records and the attendance data.') },
    { role: t('Receptionist'), scope: t('branch'), limit: '—', note: t('The gate. Books the appointment and greets the walk-in.') },
    { role: t('Call Center Agent'), scope: t('all'), limit: '—', note: t('One thread per vehicle, across every branch.') },
    { role: t('Procurement Agent'), scope: t('all'), limit: 'SAR 20,000', note: t('Places purchase orders against supplier catalogues.') },
    { role: t('Supplier'), scope: t('external'), limit: '—', note: t('Sees its own orders and catalogue, and nothing else.') },
    { role: t('Customer'), scope: t('self'), limit: '—', note: t('Sees their own vehicles, estimates and invoices — and owns the record.') },
  ]
}

export function SystemPage({ t }: { t: T }) {
  const domainList = domains(t)
  const [selected, setSelected] = useState(domainList[0].key)
  const active = domainList.find((d) => d.key === selected) ?? domainList[0]

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
              {t('Thirteen domains, one backbone. Every domain writes to the same ledger and the same audit trail — nothing is exported, reconciled or retyped between them.')}
            </p>
          </div>
          <div className="rise">
            <div className="stats two">
              <div>
                <div className="k">{t('Domains')}</div>
                <div className="v" dir="ltr">13</div>
              </div>
              <div>
                <div className="k">{t('Modules')}</div>
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

      <section aria-labelledby="system-picker-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — Pick a domain')}</span>
          <h2 id="system-picker-h">{t('Thirteen domains')}</h2>
          <p>{t('No seams to reconcile. Select one to read what it covers.')}</p>
        </div>
        <div className="subsystem-picker">
          <div className="panel subsystem-list rise" role="group" aria-label={t('Thirteen domains')}>
            {domainList.map((d) => (
              <button
                key={d.key}
                type="button"
                className={d.key === selected ? 'on' : undefined}
                aria-pressed={d.key === selected}
                onClick={() => setSelected(d.key)}
              >
                {d.name}
              </button>
            ))}
          </div>
          <aside className="panel subsystem-detail rise" aria-live="polite">
            <i className="corner tr" aria-hidden="true" />
            <i className="corner bl" aria-hidden="true" />
            <span className="tag">{t('Selected')}</span>
            <h3 style={{ marginTop: 12 }}>{active.name}</h3>
            <p>{active.blurb}</p>
            <ul>
              {active.modules.map((m) => (
                <li key={m}>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="system-inventory-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — The full inventory')}</span>
          <h2 id="system-inventory-h">{t('Every domain, at a glance')}</h2>
        </div>
        <div className="cards">
          {domainList.map((d, i) => (
            <article className="panel card rise" key={d.key}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="idx">
                <span dir="ltr">{String(i + 1).padStart(2, '0')} / 13</span>
              </div>
              <h3>{d.name}</h3>
              <p>{d.blurb}</p>
              <ul>
                {d.modules.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="system-roles-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Who the platform answers to')}</span>
          <h2 id="system-roles-h">{t('Fourteen roles')}</h2>
          <p>
            {t('A role is not a menu; it is a boundary, enforced on both the screen and the server. Every write is checked against the role of whoever asked, and every refusal is logged as carefully as every change.')}
          </p>
        </div>
        <div className="roles">
          {standings(t).map((s) => (
            <div className="role rise" key={s.role}>
              <div>
                <h4>{s.role}</h4>
                <p>
                  {s.note} {s.limit !== '—' ? <span dir="ltr">({t('approval limit')} {s.limit})</span> : null}
                </p>
              </div>
              <div className="where">{s.scope}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section aria-labelledby="system-spine-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — What holds it up')}</span>
          <h2 id="system-spine-h">{t('The architecture, in four facts')}</h2>
          <p>{t('Nothing here is a slogan — each one is enforced in the code, not just written on this page.')}</p>
        </div>
        <div className="steps rise">
          <div>
            <div className="n" dir="ltr">A/01</div>
            <h4>{t('One ledger, one truth')}</h4>
            <p>{t('An inspection line becomes an estimate line, becomes a parts reservation, becomes an invoice line, becomes a journal entry — in the same transaction, every time.')}</p>
          </div>
          <div>
            <div className="n" dir="ltr">A/02</div>
            <h4>{t('Role-based access, enforced twice')}</h4>
            <p>{t('The frontend hides and disables; the API re-checks on every request. The two are never allowed to disagree.')}</p>
          </div>
          <div>
            <div className="n" dir="ltr">A/03</div>
            <h4>{t('Bilingual by design')}</h4>
            <p>{t('Arabic and English are both first-class, right to left included — not a stylesheet bolted on afterward.')}</p>
          </div>
          <div>
            <div className="n" dir="ltr">A/04</div>
            <h4>{t('An audit row for every change')}</h4>
            <p>{t('Who changed it, when, from what, to what — recorded for every write, with no exceptions for convenience.')}</p>
          </div>
        </div>

        <div className="pull rise" style={{ marginTop: 22 }}>
          <q>{t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in.')}</q>
          <div className="who">
            {t('The pitch, stated plainly')}
            <span>{t('Every claim on this page traces back to this one sentence.')}</span>
          </div>
        </div>
      </section>
    </>
  )
}
