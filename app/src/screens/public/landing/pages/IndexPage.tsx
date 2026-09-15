import type { T } from '../types'
import type { EraRow, LedgerData } from '../landingData'
import { CommandDeck } from '../CommandDeck'
import { CornerBrackets } from '../../sections/CornerBrackets'

/** Arrival — the "SALIS AUTO 2030" artifact's `index` page, ported section for
 *  section: the hero and its three-panel rail, the workshop floor (`#lattice`),
 *  inspection and the estimate (`#core`), branches on one tenancy (`#fleet`),
 *  the release rail (`#chrono`), ZATCA Phase 2 end to end (`#ledger`) and the
 *  command deck (`#deck`).
 *
 *  Every figure on a panel is the artifact's own sample data, frozen at a
 *  representative value rather than re-rolled from a seeded RNG each tick —
 *  the artifact labels these panels "sample data … no tenant data reaches this
 *  page", and that labelling is carried over verbatim wherever a figure is
 *  shown. The artifact's two canvas scenes here (a wireframe service vehicle
 *  in the hero, an animated branch map with transfer arcs) are reimplemented
 *  as static SVG drawn from the same coordinates.
 *
 *  The bay-board block in the hero rail carries `<CornerBrackets>`, the
 *  instrument-panel corner accent other public pages borrowed from this same
 *  design study — see `sections/CornerBrackets.tsx`. */

/** The nine bays of the sample Riyadh floor — the artifact's `BAY_JOBS`, with
 *  its two alert bays (parts on order, and a walk-in still at check-in) and a
 *  fixed state, ETA and labour figure for each of the rest. */
interface BayRow {
  readonly id: string
  readonly job: string
  readonly vehicle: string
  readonly state: string
  readonly eta: string
  readonly labour: string
  readonly alert: boolean
}

function bays(t: T): readonly BayRow[] {
  return [
    { id: 'BAY 01', job: t('Periodic service · 20,000 km'), vehicle: 'RUH 4821 · Toyota Camry', state: t('IN REPAIR'), eta: '45', labour: '2.5', alert: false },
    { id: 'BAY 02', job: t('Front pads and discs'), vehicle: 'RUH 1157 · Hyundai Sonata', state: t('QUALITY CHECK'), eta: '25', labour: '1.8', alert: false },
    { id: 'BAY 03', job: t('A/C diagnosis · weak cooling'), vehicle: 'JED 9930 · Nissan Patrol', state: t('INSPECTION'), eta: '70', labour: '1.2', alert: false },
    { id: 'BAY 04', job: t('Timing belt and water pump'), vehicle: 'DMM 2204 · Kia Sportage', state: t('PARTS ON ORDER'), eta: '180', labour: '5.4', alert: true },
    { id: 'BAY 05', job: t('Battery and alternator test'), vehicle: 'RUH 0071 · Toyota Hilux', state: t('AWAITING SIGNATURE'), eta: '35', labour: '0.9', alert: false },
    { id: 'BAY 06', job: t('Coolant flush · desert package'), vehicle: 'RUH 6612 · Ford Explorer', state: t('IN REPAIR'), eta: '60', labour: '2.1', alert: false },
    { id: 'BAY 07', job: t('Suspension arm, front left'), vehicle: 'JED 3390 · Lexus LX', state: t('READY FOR DELIVERY'), eta: '20', labour: '3.6', alert: false },
    { id: 'BAY 08', job: t('Four-wheel alignment'), vehicle: 'DMM 8115 · Chevrolet Tahoe', state: t('QUALITY CHECK'), eta: '30', labour: '1.4', alert: false },
    { id: 'BAY 09', job: t('Walk-in · fault not yet named'), vehicle: 'RUH 5540 · Not on file', state: t('CHECK-IN'), eta: '15', labour: '0.5', alert: true },
  ]
}

/** The artifact's `DIAG` — a sample multi-point inspection, each finding with
 *  a severity that becomes a priced line on the estimate. */
function findings(t: T): readonly { title: string; body: string; severity: string; warn: boolean }[] {
  return [
    { title: t('Front brake pads'), body: t('Lining down to 3 mm, both sides. Photographed on the card.'), severity: t('Now'), warn: true },
    { title: t('Battery under load'), body: t('Cranking voltage dips to 9.6 V. Replacement quoted on the estimate.'), severity: t('Now'), warn: true },
    { title: t('Engine oil and filter'), body: t('Service due at 20,000 km; the odometer reads 19,410.'), severity: t('Due'), warn: false },
    { title: t('Tyre tread, rear axle'), body: t('4 mm both sides. Logged, and quoted for the next visit.'), severity: t('Watch'), warn: false },
    { title: t('A/C refrigerant'), body: t('Vent temperature within range. No action, and it is recorded as such.'), severity: t('Pass'), warn: false },
  ]
}

/** The twelve locations of the sample tenant, positioned on the artifact's own
 *  fractional map coordinates, projected into a 620 × 420 viewBox. `attn`
 *  marks the three the artifact draws in ember. */
const BRANCH_POINTS: readonly { x: number; y: number; attn: boolean }[] = [
  { x: 321, y: 190, attn: true },
  { x: 170, y: 238, attn: false },
  { x: 461, y: 156, attn: false },
  { x: 116, y: 88, attn: true },
  { x: 191, y: 177, attn: false },
  { x: 202, y: 320, attn: false },
  { x: 137, y: 109, attn: false },
  { x: 245, y: 129, attn: false },
  { x: 175, y: 136, attn: false },
  { x: 396, y: 299, attn: false },
  { x: 504, y: 75, attn: true },
  { x: 472, y: 184, attn: false },
]

/** Stock transfers drawn between branches — index pairs into BRANCH_POINTS. */
const TRANSFERS: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 4],
  [0, 9],
  [2, 11],
  [3, 6],
  [0, 10],
]

/** The artifact's `EVENTS` dispatch log, with the clock frozen: a stream that
 *  re-times itself every 2.6 seconds reads as live telemetry, and there is no
 *  tenant behind this page. */
function activity(t: T): readonly { time: string; text: string; detail: string; attn: boolean }[] {
  return [
    { time: '09:41:12', text: t('Job card opened'), detail: 'JC-4821', attn: false },
    { time: '09:39:58', text: t('Estimate sent for signature'), detail: 'RUH 1157', attn: false },
    { time: '09:37:04', text: t('Estimate approved by customer'), detail: 'SAR 3,545.00', attn: false },
    { time: '09:34:21', text: t('Parts issued to job'), detail: t('front pads ×4'), attn: false },
    { time: '09:31:47', text: t('ATTENTION — awaiting approval'), detail: 'PO 4471', attn: true },
    { time: '09:28:16', text: t('Quality check passed'), detail: 'JC-9930', attn: false },
    { time: '09:24:53', text: t('Invoice cleared by ZATCA'), detail: 'INV-2026-004182', attn: false },
    { time: '09:22:09', text: t('Payment recorded · Mada'), detail: 'SAR 4,076.75', attn: false },
    { time: '09:18:40', text: t('ATTENTION — below reorder point'), detail: t('18 SKUs'), attn: true },
    { time: '09:15:02', text: t('Branch transfer received'), detail: t('Jeddah → Riyadh'), attn: false },
    { time: '09:11:35', text: t('Vehicle delivered'), detail: 'RUH 1157', attn: false },
    { time: '09:07:18', text: t('Service reminder sent'), detail: t('WhatsApp · 42 customers'), attn: false },
  ]
}

/** The release rail — the artifact's `ERAS`. Named releases, each a working
 *  slice: roles first, then the floor, then money, then parts, then
 *  certification. `1.0.0` is where the product is; `2.0.0` is next. */
function releases(t: T): readonly EraRow[] {
  return [
    {
      year: '0.1.0', status: t('Alpha'), headline: t('Foundations'),
      body: t('Authentication, the fourteen roles and the twenty-eight permission modules, and the Arabic and English language packs with right-to-left layout built in rather than bolted on.'),
    },
    {
      year: '0.2.0', status: t('Alpha'), headline: t('The workshop lifecycle'),
      body: t('Check-in, inspection, estimate, repair, quality check and delivery — held in order by a server-side state machine that refuses a card trying to skip a stage.'),
    },
    {
      year: '0.4.0', status: t('Alpha'), headline: t('Finance, and the first cleared invoice'),
      body: t('Invoices, payments and receipts stored in halalas, VAT computed on the server at the ZATCA rate, and the e-invoicing pipeline proven against the ZATCA sandbox.'),
    },
    {
      year: '0.6.0', status: t('Alpha'), headline: t('Parts and purchasing'),
      body: t('Stock derived from movements, reorder points, purchase orders with an approval chain and a ceiling per role, goods received against the order, and inter-branch transfer.'),
    },
    {
      year: '0.8.0', status: t('Beta'), headline: t('Certification'),
      body: t('The full ZATCA Phase 2 pipeline — UBL 2.1, TLV QR, hash chain, X.509 signature, Fatoora clearance — certified against production rather than sandbox.'),
    },
    {
      year: '1.0.0', status: t('You are here'), headline: t('Thirteen domains, one platform'),
      body: t('Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, team and portals — one tenancy, two languages, one audit trail.'),
    },
    {
      year: '2.0.0', status: t('Next'), headline: t('Phase two'),
      body: t('Native mobile applications, offline mode for a workshop floor with no signal in the pit, and multi-currency for operators working outside the Kingdom.'),
    },
  ]
}

function ledgerData(t: T): LedgerData {
  return {
    total: '4,076.75',
    lines: [
      { label: t('Labour · 3.5 h at standard rate'), amount: '1,240.00' },
      { label: t('Parts · front pads and discs'), amount: '1,905.00' },
      { label: t('Periodic service kit · 20,000 km'), amount: '400.00' },
      { label: t('VAT 15%'), amount: '531.75' },
    ],
  }
}

/** Forty throughput bars, shaped by a fixed arch rather than a live feed —
 *  the same silhouette the artifact draws, minus the animation. */
const SPECTRUM = Array.from({ length: 40 }, (_, i) => {
  const arch = Math.sin((i / 40) * Math.PI) * 62
  return Math.max(3, Math.round(arch * (0.72 + 0.26 * Math.sin(i * 1.7))))
})

function smoothScrollTo(id: string) {
  return (event: React.MouseEvent<HTMLElement>) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    el.scrollIntoView?.({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
}

export function IndexPage({ t }: { t: T }) {
  const bayRows = bays(t)
  const diag = findings(t)
  const log = activity(t)
  const eras = releases(t)
  const ledger = ledgerData(t)

  return (
    <>
      <section id="hero" className="hero" aria-labelledby="index-hero-h">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker rise">
              <span>◈ {t('Riyadh · Kingdom of Saudi Arabia · ZATCA Phase 2')}</span>
            </div>
            <h1 id="index-hero-h" className="rise">
              <span className="thin">SALIS AUTO</span>{' '}
              <span className="glow" dir="ltr">
                2030
              </span>
            </h1>
            <p className="hero-lede rise">
              <b>{t('Workshop Management. Saudi Standard.')}</b>{' '}
              {t('One platform carries the whole job — check-in, inspection, a signed estimate, the repair, quality control, delivery and a cleared ZATCA invoice — on a single record that nobody re-types. Thirteen domains, fourteen roles, Arabic and English as equals.')}{' '}
              <b>{t('Figures on the live panels are sample data.')}</b>
            </p>
            <div className="hero-actions rise">
              <button className="btn" type="button" onClick={smoothScrollTo('lattice')}>
                ◈ {t('See the workshop floor')}
              </button>
              <a className="btn ghost" href="#chrono" onClick={smoothScrollTo('chrono')}>
                {t('The road to 1.0')}
              </a>
            </div>
          </div>

          <div className="hero-stage rise">
            {/* The artifact's WebGL service vehicle, drawn once at rest from the
                same profile coordinates: a side section extruded across the
                width, with rungs between the two faces. Decorative only. */}
            <svg viewBox="0 0 520 300" aria-hidden="true" focusable="false">
              <polygon
                points="35.2,120.1 66.4,89.7 167.8,77.2 253.6,50.7 323.8,48.3 394.0,78.8 442.4,97.5 450.2,124.0 409.6,150.5 284.8,163.0 128.8,163.0 50.8,144.3"
                fill="none"
                stroke="var(--hair)"
                strokeWidth="1"
              />
              <polygon
                points="69.2,146.1 100.4,115.7 201.8,103.2 287.6,76.7 357.8,74.3 428.0,104.8 476.4,123.5 484.2,150.0 443.6,176.5 318.8,189.0 162.8,189.0 84.8,170.3"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="1.3"
              />
              <g stroke="var(--hair-strong)" strokeWidth="1">
                <line x1="69.2" y1="146.1" x2="35.2" y2="120.1" />
                <line x1="201.8" y1="103.2" x2="167.8" y2="77.2" />
                <line x1="357.8" y1="74.3" x2="323.8" y2="48.3" />
                <line x1="476.4" y1="123.5" x2="442.4" y2="97.5" />
                <line x1="443.6" y1="176.5" x2="409.6" y2="150.5" />
                <line x1="162.8" y1="189.0" x2="128.8" y2="163.0" />
              </g>
              <ellipse cx="315" cy="103" rx="48" ry="23" fill="none" stroke="var(--blue)" strokeWidth="1" />
              <circle cx="139.4" cy="189" r="26" fill="none" stroke="var(--ember)" strokeWidth="1" opacity=".55" />
              <circle cx="396.8" cy="189" r="26" fill="none" stroke="var(--ember)" strokeWidth="1" opacity=".55" />
              <line x1="20" y1="222" x2="500" y2="222" stroke="var(--hair)" strokeWidth="1" strokeDasharray="4 10" />
            </svg>
            <p className="cap">
              {t('Service vehicle · wireframe study.')} <b>{t('Drawn in SVG on this page')}</b> —{' '}
              {t('decorative, and not a photograph of anything.')}
            </p>
          </div>
        </div>

        <div className="panel hero-rail rise">
          <div>
            <span className="tag">{t('The system at a glance')}</span>
            <div className="kpis">
              <div>
                <div className="k">{t('Functional domains')}</div>
                <div className="v" dir="ltr">13</div>
              </div>
              <div>
                <div className="k">{t('Job cards today')}</div>
                <div className="v" dir="ltr">42</div>
              </div>
              <div>
                <div className="k">{t('Median turnaround')}</div>
                <div className="v" dir="ltr">
                  3.4<em>h</em>
                </div>
              </div>
              <div>
                <div className="k">{t('Roles enforced')}</div>
                <div className="v" dir="ltr">14</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <CornerBrackets />
            <span className="tag">{t('Workshop floor · sample tenant')}</span>
            <div className="readout">
              <div className="row">
                <span>{t('Bay utilisation')}</span>
                <span dir="ltr">76%</span>
              </div>
              <div className="meter">
                <i style={{ width: '76%' }} />
              </div>
              <div className="row">
                <span>{t('Parts availability')}</span>
                <span dir="ltr">62%</span>
              </div>
              <div className="meter">
                <i style={{ width: '62%' }} />
              </div>
              <div className="row">
                <span>{t('Estimates signed same day')}</span>
                <span dir="ltr">88%</span>
              </div>
              <div className="meter">
                <i style={{ width: '88%' }} />
              </div>
              <div className="row">
                <span>{t('Awaiting customer approval')}</span>
                <span dir="ltr">34%</span>
              </div>
              <div className="meter warn">
                <i style={{ width: '34%' }} />
              </div>
            </div>
          </div>

          <div>
            <span className="tag">{t('Throughput · last 40 days')}</span>
            <div className="spectrum" aria-hidden="true">
              {SPECTRUM.map((height, i) => (
                <i key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="fine-note">
              {t('SAMPLE DATA')}
              <br />
              {t('illustrative figures, not customer data')}
              <br />
              {t('no tenant data reaches this page')}
            </p>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="lattice" aria-labelledby="lattice-h">
        <div className="sec-head rise">
          <span className="tag">{t('01 — The floor')}</span>
          <h2 id="lattice-h">{t('Six stages, one job card')}</h2>
          <p>
            {t('Check-in, inspection, estimate, repair, quality check, delivery. The order is held by a server-side state machine, not by habit: a card that skips a stage is refused, and two of the six are gates — the customer signs the estimate before any work starts, and the technician who did the repair can never be the one who passes its quality check.')}
          </p>
        </div>
        <div className="bays">
          {bayRows.map((bay) => (
            <article className={bay.alert ? 'panel bay rise alert' : 'panel bay rise'} key={bay.id}>
              <i className="corner tl" aria-hidden="true" />
              <i className="corner br" aria-hidden="true" />
              <div className="id">
                <b dir="ltr">{bay.id}</b>
                <span>{t('Riyadh')}</span>
              </div>
              <h3>{bay.job}</h3>
              <div className="sub" dir="ltr">
                {bay.vehicle}
              </div>
              <div className="state">
                <i aria-hidden="true" />
                {bay.state}
              </div>
              <div className="foot">
                <span>
                  {t('ETA')}{' '}
                  <b dir="ltr">
                    {bay.eta} {t('min')}
                  </b>
                </span>
                <span>
                  {t('LABOUR')}{' '}
                  <b dir="ltr">
                    {bay.labour} {t('h')}
                  </b>
                </span>
              </div>
            </article>
          ))}
        </div>
        <p className="fine-note rise">{t('Sample tenant. Nine illustrative bays, not customer data.')}</p>
      </section>

      <div className="rule" />

      <section id="core" aria-labelledby="core-h">
        <div className="sec-head rise">
          <span className="tag">{t('02 — Before the work starts')}</span>
          <h2 id="core-h">{t('Inspection, then an estimate')}</h2>
          <p>
            {t('A multi-point inspection writes findings against the vehicle, each with a severity and a photo. The findings become priced lines; the priced lines become an estimate; the estimate goes to the customer’s phone and comes back signed with an SMS one-time code. Nothing is dismantled on a verbal yes.')}
          </p>
        </div>

        <div className="core-grid">
          <div className="orb rise">
            <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
              <circle cx="200" cy="200" r="188" fill="none" stroke="var(--hair)" />
              <circle
                cx="200"
                cy="200"
                r="188"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="1.5"
                strokeDasharray="6 10 40 14 90 30"
                opacity=".7"
              />
              <circle cx="200" cy="12" r="4" fill="var(--cyan)" />
              <circle
                cx="200"
                cy="200"
                r="146"
                fill="none"
                stroke="var(--ember)"
                strokeWidth="2"
                strokeDasharray="30 16 8 12"
                opacity=".6"
              />
              <circle cx="346" cy="200" r="3.5" fill="var(--ember)" />
              <circle cx="200" cy="200" r="108" fill="none" stroke="var(--hair-strong)" strokeWidth="1" strokeDasharray="2 8" />
              <circle cx="200" cy="200" r="76" fill="none" stroke="var(--blue)" strokeWidth="1" opacity=".7" />
              <circle cx="200" cy="200" r="58" fill="rgba(11,179,255,.06)" stroke="var(--hair-strong)" />
              <g stroke="var(--hair-strong)" strokeWidth="1">
                <line x1="200" y1="24" x2="200" y2="70" />
                <line x1="200" y1="330" x2="200" y2="376" />
                <line x1="24" y1="200" x2="70" y2="200" />
                <line x1="330" y1="200" x2="376" y2="200" />
              </g>
            </svg>
            <div className="orb-centre">
              <div className="n" dir="ltr">98.6%</div>
              <div className="l">{t('Inspection points cleared')}</div>
            </div>
          </div>

          <div className="rise">
            <div className="dlist">
              {diag.map((finding) => (
                <div key={finding.title}>
                  <div>
                    <div className="t">{finding.title}</div>
                    <div className="d">{finding.body}</div>
                  </div>
                  <div className={finding.warn ? 'v warn' : 'v'}>{finding.severity}</div>
                </div>
              ))}
            </div>
            <p className="fine-note">
              {t('SAMPLE VEHICLE. Every finding carries a severity, a photograph and a line on the estimate. The card cannot move to repair until the customer has signed, and every change to it writes an audit row: who, when, from what, to what.')}
            </p>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="fleet" aria-labelledby="fleet-h">
        <div className="sec-head rise">
          <span className="tag">{t('03 — Across the Kingdom')}</span>
          <h2 id="fleet-h">{t('Branches, on one tenancy')}</h2>
          <p>
            {t('One organisation, many branches, one set of books. Every row carries its organisation and its branch, and PostgreSQL row-level security — not application code — decides who may read it. Stock transfers between branches, a call centre answers for all of them, and a branch manager still sees only their own floor.')}
          </p>
        </div>

        <div className="fleet-wrap">
          <div className="panel map rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner tr" aria-hidden="true" />
            <i className="corner bl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <svg viewBox="0 0 620 420" role="img" aria-label={t('Map of twelve sample branches across the Kingdom, with stock-transfer lines drawn between them.')}>
              {TRANSFERS.map(([a, b]) => (
                <path
                  key={`${a}-${b}`}
                  d={`M${BRANCH_POINTS[a].x} ${BRANCH_POINTS[a].y} Q ${(BRANCH_POINTS[a].x + BRANCH_POINTS[b].x) / 2} ${
                    Math.min(BRANCH_POINTS[a].y, BRANCH_POINTS[b].y) - 46
                  } ${BRANCH_POINTS[b].x} ${BRANCH_POINTS[b].y}`}
                  fill="none"
                  stroke="var(--hair-strong)"
                  strokeWidth="1"
                />
              ))}
              {BRANCH_POINTS.map((point) => (
                <g key={`${point.x}-${point.y}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={point.attn ? 16 : 11}
                    fill={point.attn ? 'rgba(249,115,22,.14)' : 'rgba(11,179,255,.12)'}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={point.attn ? 'var(--ember)' : 'var(--cyan)'}
                  />
                </g>
              ))}
            </svg>
            <div className="map-legend">
              <span>
                <b>◆</b> {t('BRANCH')}
              </span>
              <span>
                <b>—</b> {t('TRANSFER')}
              </span>
              <span>
                <b className="e">◆</b> {t('ATTENTION')}
              </span>
            </div>
          </div>

          <div className="panel log rise">
            <i className="corner tl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
            <h3>{t('Activity stream')}</h3>
            <ul>
              {log.map((entry) => (
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
        <p className="fine-note rise">{t('Sample tenant. No tenant data reaches this page.')}</p>
      </section>

      <div className="rule" />

      <section id="chrono" aria-labelledby="chrono-h">
        <div className="sec-head rise">
          <span className="tag">{t('04 — The release rail')}</span>
          <h2 id="chrono-h" dir="ltr">
            2025 → 2030
          </h2>
          <p>
            {t('The platform ships in named releases, each one a working slice rather than a promise: the roles first, then the floor, then money, then parts, then certification. Phase two is where the Kingdom stops being the only place it runs.')}
          </p>
        </div>
        <div className="chrono">
          {eras.map((era) => (
            <article className={era.year === '1.0.0' ? 'era now' : 'era'} key={era.year}>
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

      <section id="ledger" aria-labelledby="ledger-h">
        <div className="sec-head rise">
          <span className="tag">{t('05 — The invoice')}</span>
          <h2 id="ledger-h">{t('ZATCA Phase 2, end to end')}</h2>
          <p>
            {t('Five steps, every invoice, no exceptions: UBL 2.1 XML, a TLV QR code carrying five tags, a SHA-256 hash chained to the invoice before it, an X.509 signature, and clearance through the Fatoora API — standard invoices cleared in real time, simplified ones reported. VAT is computed on the server at the ZATCA rate and never accepted from the browser. Tilt it.')}
          </p>
        </div>

        <div className="ledger-grid">
          <div className="holo-stage rise">
            <article className="holo tilt">
              <div className="hh">
                <b>SALIS AUTO</b>
                <span>
                  {t('ZATCA PHASE 2 · CLEARED')}
                  <br />
                  <span dir="ltr">INV-2026-004182</span>
                </span>
              </div>
              <div className="amt" dir="ltr">
                <em>SAR</em>
                <span>{ledger.total}</span>
              </div>
              <div className="lines">
                {ledger.lines.map((line) => (
                  <div key={line.label}>
                    <span>{line.label}</span>
                    <b dir="ltr">{line.amount}</b>
                  </div>
                ))}
              </div>
              <div className="seal">
                <div className="qr" aria-hidden="true" />
                <p>
                  {t('TLV QR · 5 tags')}
                  <br />
                  {t('Hash')} <span dir="ltr">7F2A·C41E·9B03</span>
                  <br />
                  {t('Signed X.509 · retained 7 years')}
                </p>
              </div>
            </article>
          </div>
          <div className="rise">
            <div className="dlist">
              <div>
                <div>
                  <div className="t">{t('Signed before the work')}</div>
                  <div className="d">{t('The estimate is approved by SMS one-time code from the customer’s phone.')}</div>
                </div>
                <div className="v">{t('Gate')}</div>
              </div>
              <div>
                <div>
                  <div className="t">{t('One write, one journal')}</div>
                  <div className="d">{t('The invoice posts its own entry. Nobody re-keys it into a second system.')}</div>
                </div>
                <div className="v">{t('0 steps')}</div>
              </div>
              <div>
                <div>
                  <div className="t">{t('Money in halalas')}</div>
                  <div className="d">{t('Stored as integers, rounded once at the total, formatted only on screen.')}</div>
                </div>
                <div className="v">{t('Exact')}</div>
              </div>
              <div>
                <div>
                  <div className="t">{t('Kept for seven years')}</div>
                  <div className="d">{t('Invoice, hash and signature retained and exportable, whole, at any time.')}</div>
                </div>
                <div className="v warn">{t('7 yrs')}</div>
              </div>
            </div>
            <p className="fine-note">{t('Illustrative invoice. Figures are examples, not customer data.')}</p>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section id="deck" aria-labelledby="deck-h">
        <div className="sec-head rise">
          <span className="tag">{t('06 — Ask the system')}</span>
          <h2 id="deck-h">{t('Command deck')}</h2>
          <p>
            {t('A console with no backend behind it — it answers from this page alone. Type')}{' '}
            <span className="mono" style={{ color: 'var(--cyan)' }}>
              help
            </span>{' '}
            {t('to see what it knows.')}
          </p>
        </div>
        <CommandDeck t={t} />
      </section>
    </>
  )
}
