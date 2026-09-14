import { Link } from 'react-router-dom'
import type { T } from '../types'
import type { EraRow, LedgerData } from '../landingData'
import { CommandDeck } from '../CommandDeck'
import { CornerBrackets } from '../../sections/CornerBrackets'

/** Arrival — the real SALIS AUTO pitch, styled as the concept page's own dark
 *  HUD. Every number and claim here is one already made, in plain language,
 *  on the real marketing site: the six-stage job card (`Workshop.tsx`
 *  lifecycle), the measured proof figures, ZATCA Phase 2 e-invoicing, the AI
 *  platform (configuration required, honestly labelled), the real personas
 *  and quoted results, and a roadmap that keeps 2025 as fact and everything
 *  after it as a clearly-labelled vision rather than a claim.
 *
 *  The bay-board mock carries `<CornerBrackets>`, the instrument-panel
 *  corner accent other public pages borrowed from this same design study
 *  — see `sections/CornerBrackets.tsx`. */

/** The bay board mock behind the hero — the same illustrative rows the real
 *  landing page uses, not customer data. */
interface BayBoardRow {
  readonly job: string
  readonly plate: string
  readonly amount: string
  readonly state: string
  readonly warn: boolean
}
function bayBoard(t: T): readonly BayBoardRow[] {
  return [
    { job: 'JC-4F2A', plate: 'RUH 4821', amount: 'SAR 1,245.00', state: t('In repair'), warn: false },
    { job: 'JC-4F2B', plate: 'RUH 1157', amount: 'SAR 380.00', state: t('QC'), warn: false },
    { job: 'JC-4F2C', plate: 'RUH 9930', amount: 'SAR 2,910.50', state: t('Awaiting parts'), warn: true },
    { job: 'JC-4F2D', plate: 'RUH 2204', amount: 'SAR 640.00', state: t('Delivered'), warn: false },
  ]
}

/** The six real lifecycle stages — `Workshop.tsx` walks the same six in the
 *  same order. */
function stages(t: T): readonly { n: string; title: string; detail: string }[] {
  return [
    { n: 'ST/01', title: t('Check-in'), detail: t('Photos, plate, customer lookup') },
    { n: 'ST/02', title: t('Inspection'), detail: t('Multi-point, with severity') },
    { n: 'ST/03', title: t('Estimate'), detail: t('Signed from the phone') },
    { n: 'ST/04', title: t('Repair'), detail: t('Bay board, parts from stock') },
    { n: 'ST/05', title: t('Quality control'), detail: t('A second technician signs') },
    { n: 'ST/06', title: t('Delivery'), detail: t('Invoice, QR, e-signature') },
  ]
}

/** Results from deployments — every figure carries the baseline it was
 *  measured against, the same rule the real proof band uses. */
function proof(t: T): readonly { from: string; to: string; what: string; base: string }[] {
  return [
    { from: '48 h', to: '4 h', what: t('Estimate approval'), base: t('Baseline: paper estimates signed at the counter.') },
    { from: '15 min', to: '2 min', what: t('Invoice at the counter'), base: t('Baseline: handwritten invoice copied to a spreadsheet at day’s end.') },
    { from: '0%', to: '+25%', what: t('Workshop throughput'), base: t('Measured across deployments against each workshop’s prior twelve months.') },
  ]
}

function aiCards(t: T): readonly { title: string; body: string }[] {
  return [
    { title: t('AI Assistant'), body: t('Natural-language questions over the workshop’s own data.') },
    { title: t('Smart Scheduling'), body: t('Predictive bay allocation and technician scheduling.') },
    { title: t('AI Agents'), body: t('Routine administrative tasks run by the system, with the audit row written like any other change.') },
  ]
}

function roles(t: T): readonly { role: string; body: string }[] {
  return [
    { role: t('Workshop owner'), body: t('Revenue, VAT and stock reconcile without a bookkeeper redoing the month.') },
    { role: t('Service advisor'), body: t('Speed at the counter, and an estimate the customer signs from their phone in the language they read.') },
    { role: t('Technician'), body: t('Short, unambiguous instructions on a phone, in Arabic, with one hand.') },
    { role: t('Accountant'), body: t('ZATCA correctness, and an audit trail that answers who changed this, and when.') },
  ]
}

function quotes(t: T): readonly { quote: string; role: string; where: string }[] {
  return [
    { quote: t('Our accountant stopped re-keying invoices. The VAT return reconciled the first month.'), role: t('Workshop owner'), where: t('Three branches, Eastern Province') },
    { quote: t('Estimates that took two days on paper are signed from the customer’s phone the same afternoon.'), role: t('Operations manager'), where: t('Single-bay workshop, Jeddah') },
    { quote: t('Customers watch the job move from the bay to delivery. The phone rings less, and when it does, it is not about status.'), role: t('Service advisor'), where: t('Fleet accounts, Riyadh') },
  ]
}

/** 2025 is fact. Everything after it is a clearly-labelled vision, never a
 *  claim — the honesty rule the original rail already followed for its first
 *  entry, now applied to every entry. */
function roadmap(t: T): readonly EraRow[] {
  return [
    {
      year: '2025', status: t('Shipping today'), headline: t('The six-stage job card, live'),
      body: t('Check-in, inspection, estimate, repair, quality control, delivery — with ZATCA Phase 2 e-invoicing and an audit row for every change. This is the product today, not a projection.'),
    },
    {
      year: '2026', status: t('In progress'), headline: t('AI Assistant and Smart Scheduling'),
      body: t('Natural-language questions over the workshop’s own data, and predictive bay and technician scheduling. Requires an AI API connected at deployment.'),
    },
    {
      year: '2028', status: t('Roadmap idea'), headline: t('AI Agents take on routine admin'),
      body: t('Routine administrative tasks run by the system, with the audit row written like any other change — reviewed, not reassembled, by a person.'),
    },
    {
      year: '2030', status: t('Vision 2030'), headline: t('Saudi Arabia first, then the Gulf'),
      body: t('The same platform, the same two languages and the same audit trail, expanding region by region — aligned with Saudi Vision 2030.'),
    },
    {
      year: '2060', status: t('Long-run vision'), headline: t('Every workshop, one auditable system'),
      body: t('The mission stated plainly: every automotive workshop running on one auditable system, in Arabic and English, wherever it operates.'),
    },
  ]
}

function ledgerData(t: T): LedgerData {
  return {
    total: 'SAR 4,182.00',
    lines: [
      { label: t('Bay time · 11 min'), amount: 'SAR 1,240.00' },
      { label: t('Parts and labour'), amount: 'SAR 1,905.00' },
      { label: t('Inspection and diagnosis'), amount: 'SAR 402.00' },
      { label: t('VAT 15%'), amount: 'SAR 635.00' },
    ],
  }
}

function smoothScrollTo(id: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    el.scrollIntoView?.({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
}

export function IndexPage({ t }: { t: T }) {
  const bays = bayBoard(t)
  const stageRows = stages(t)
  const proofRows = proof(t)
  const ai = aiCards(t)
  const roleRows = roles(t)
  const quoteRows = quotes(t)
  const eras = roadmap(t)
  const ledger = ledgerData(t)

  return (
    <>
      <section className="hero" aria-labelledby="index-hero-h">
        <div className="hero-kicker rise">
          <span>◈ {t('Built for Saudi workshops')}</span>
        </div>
        <h1 id="index-hero-h" className="rise">
          <span className="thin">{t('Workshop Management.')}</span> <span className="glow">{t('Saudi Standard.')}</span>
        </h1>
        <p className="hero-lede rise">
          {t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in.')}{' '}
          <b>{t('Every change is on the audit trail.')}</b>
        </p>
        <div className="hero-actions rise">
          <Link className="btn" to="/public-portal/book-demo">
            <i aria-hidden="true">◈</i> {t('Book a 20-minute demo')}
          </Link>
          <a className="btn ghost" href="#roadmap" onClick={smoothScrollTo('roadmap')}>
            {t('See where it’s headed')}
          </a>
        </div>

        <div className="hero-rail rise">
          <div>
            <span className="tag">{t('Results from deployments')}</span>
            <div className="kpis">
              {proofRows.map((cell) => (
                <div key={cell.what}>
                  <div className="k">{cell.what}</div>
                  <div className="v" dir="ltr">
                    {cell.to}
                  </div>
                </div>
              ))}
              <div>
                <div className="k">{t('Coverage')}</div>
                <div className="v" dir="ltr">
                  13<em>/14</em>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <CornerBrackets />
            <span className="tag">{t('Bay board · Riyadh Main')}</span>
            <div className="dlist-plain">
              {bays.map((bay) => (
                <div key={bay.job}>
                  <div>
                    <div className="t" dir="ltr">
                      {bay.job}
                    </div>
                    <div className="d" dir="ltr">
                      {bay.plate} · {bay.state}
                    </div>
                  </div>
                  <div className={bay.warn ? 'v warn' : 'v'} dir="ltr">
                    {bay.amount}
                  </div>
                </div>
              ))}
            </div>
            <p className="fine-note">{t('Illustrative rows. Figures are examples, not customer data.')}</p>
          </div>
        </div>
        <p className="fine-note rise" style={{ maxWidth: '60ch' }}>
          <b>{t('Single bay to multi-branch.')}</b> {t('Thirteen domains, fourteen roles, SAR to the halala, one audit trail.')}
        </p>
      </section>

      <div className="rule" />

      <section id="lifecycle" aria-labelledby="lifecycle-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — The lifecycle')}</span>
          <h2 id="lifecycle-h">{t('Six stages. One job card. Each stage gates the next.')}</h2>
          <p>
            {t('The vehicle moves from check-in to delivery on one record. The invoice at the end is the sum of what happened, not a list retyped from memory.')}
          </p>
        </div>
        <div className="steps rise">
          {stageRows.map((stage) => (
            <div key={stage.n}>
              <div className="n" dir="ltr">{stage.n}</div>
              <h4>{stage.title}</h4>
              <p>{stage.detail}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 22 }}>
          <Link className="btn ghost" to="/public-portal/workshop">
            {t('Walk the six stages')} →
          </Link>
        </p>
      </section>

      <div className="rule" />

      <section id="invoice" aria-labelledby="invoice-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Finance')}</span>
          <h2 id="invoice-h">{t('The invoice is ZATCA Phase 2, not a promise of it')}</h2>
          <p>
            {t('Every issued invoice carries the TLV QR, the hash chain to its predecessor, the UBL 2.1 XML and the seller and buyer VAT numbers, and is immutable after issue.')}
          </p>
        </div>
        <div className="ledger-grid">
          <div className="holo-stage rise">
            <article className="holo tilt">
              <div className="hh">
                <b>SALIS AUTO</b>
                <span dir="ltr">
                  {t('ZATCA PHASE 2')}
                  <br />
                  {t('VAT 15%')}
                </span>
              </div>
              <div className="amt" dir="ltr">
                <em>SAR</em>
                <span>{ledger.total.replace('SAR ', '')}</span>
              </div>
              <div className="lines">
                {ledger.lines.map((line) => (
                  <div key={line.label}>
                    <span>{line.label}</span>
                    <b dir="ltr">{line.amount.replace('SAR ', '')}</b>
                  </div>
                ))}
              </div>
              <div className="seal">
                <div className="qr" aria-hidden="true" />
                <p>
                  {t('TLV QR · hash chain')}
                  <br />
                  {t('Immutable after issue')}
                </p>
              </div>
            </article>
          </div>
          <div className="rise">
            <div className="dlist-plain">
              <div>
                <div>
                  <div className="t">{t('Zero re-keying')}</div>
                  <div className="d">{t('The journal entry is the invoice, written once.')}</div>
                </div>
                <div className="v" dir="ltr">0 {t('steps')}</div>
              </div>
              <div>
                <div>
                  <div className="t">{t('Reporting configured at deployment')}</div>
                  <div className="d">{t('Reporting to the Fatoora platform is configured for each workshop when it is deployed.')}</div>
                </div>
                <div className="v">{t('Per workshop')}</div>
              </div>
              <div>
                <div>
                  <div className="t">{t('Held on the audit trail')}</div>
                  <div className="d">{t('Every figure traces to the change that produced it.')}</div>
                </div>
                <div className="v">{t('Always')}</div>
              </div>
            </div>
          </div>
        </div>
        <p className="fine-note rise" style={{ marginTop: 16 }}>{t('Illustrative invoice. Figures are examples, not customer data.')}</p>
      </section>

      <div className="rule" />

      <section id="ai" aria-labelledby="ai-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — The AI platform')}</span>
          <h2 id="ai-h">{t('Reinventing auto service for the AI era')}</h2>
          <p>
            {t('Saudi Arabia first, then the Gulf and the region. Less retyping, less waiting, less guessing: the system drafts, schedules and reconciles, and people decide.')}
          </p>
        </div>
        <div className="cards">
          {ai.map((card, i) => (
            <article className="panel card rise" key={card.title}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="idx">
                <span dir="ltr">{String(i + 1).padStart(2, '0')} / 03</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
        <p className="fine-note rise" style={{ marginTop: 16 }}>
          {t('Requires configuration: the AI features connect to an AI API at deployment. Until it is connected, the assistant shows “Connect the API”.')}
        </p>
      </section>

      <div className="rule" />

      <section id="roles" aria-labelledby="roles-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — Who it is for')}</span>
          <h2 id="roles-h">{t('Judged on whether it survives the floor at 09:40 with a queue behind the counter')}</h2>
        </div>
        <div className="cards">
          {roleRows.map((entry) => (
            <article className="panel card rise" key={entry.role}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <h3>{entry.role}</h3>
              <p>{entry.body}</p>
            </article>
          ))}
        </div>
        <div className="dispatch" style={{ marginTop: 30, borderBlockEnd: 0 }}>
          <div className="meta">{t('What workshops report')}</div>
          <div className="cards">
            {quoteRows.map((entry) => (
              <article className="panel card" key={entry.quote}>
                <i className="corner tl" aria-hidden="true" />
                <i className="corner br" aria-hidden="true" />
                <p style={{ color: 'var(--mist)', fontSize: 14.5 }}>“{entry.quote}”</p>
                <div className="then" style={{ marginTop: 14, color: 'var(--cyan)' }}>
                  {entry.role} · {entry.where}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="roadmap" aria-labelledby="roadmap-h">
        <div className="sec-head rise">
          <span className="tag">{t('05 — The road ahead')}</span>
          <h2 id="roadmap-h">2025 → 2060</h2>
          <p>{t('The first entry is not a projection; it is the changelog. Everything after it is a labelled vision, not a claim.')}</p>
        </div>
        <div className="chrono">
          {eras.map((era, i) => (
            <article className={i === eras.length - 1 ? 'era now' : 'era'} key={era.year}>
              <div className="yr" dir="ltr">
                {era.year}
                <small>{era.status}</small>
              </div>
              <div>
                <h3>{era.headline}</h3>
                <p>{era.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="rule" />

      <section id="deck" aria-labelledby="deck-h">
        <div className="sec-head rise">
          <span className="tag">{t('06 — Ask it anything')}</span>
          <h2 id="deck-h">{t('Command deck')}</h2>
          <p>
            {t('A small console with no backend behind it — it answers from the facts on this page alone. Type')} <span className="mono" style={{ color: 'var(--cyan)' }}>help</span> {t('to see what it knows.')}
          </p>
        </div>
        <CommandDeck t={t} eras={eras} proof={proofRows} ledger={ledger} domainCount={13} roleCount={14} />
      </section>
    </>
  )
}
