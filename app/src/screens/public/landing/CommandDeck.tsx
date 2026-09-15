import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { T } from './types'

/** The command deck (`#deck`) — a real controlled component, not a `<pre>`
 *  filled with `innerHTML`. The "SALIS AUTO 2030" artifact's console, ported
 *  command for command: `help`, `status`, `lifecycle`, `domains`, `roles`,
 *  `zatca`, `parts`, `pricing`, `salis`, `clear`, plus `ls` and `?` as
 *  aliases of `help`, and the same eight chips under the shell.
 *
 *  Two departures from the artifact. Its `status` figures are re-rolled from
 *  a seeded RNG on every call; here they are fixed sample values, because a
 *  number that changes when you ask twice reads as live telemetry and this
 *  page has no tenant behind it — the answer says "sample tenant" either way.
 *  And every string is a literal `t(...)` call, so `check-i18n` can see it;
 *  nothing here is assembled from a template literal. */

interface Line {
  id: number
  node: ReactNode
}

let seq = 0
function nextId(): number {
  seq += 1
  return seq
}

/** The thirteen domains and what each carries — the artifact's `DOMAINS`. */
function domainLines(t: T): readonly { name: string; body: string }[] {
  return [
    { name: t('Workshop'), body: t('the six-stage job card') },
    { name: t('Registry'), body: t('customers, vehicles, service history') },
    { name: t('Finance'), body: t('invoices, payments, receipts') },
    { name: t('Accounting'), body: t('double-entry ledger and statements') },
    { name: t('CRM & Marketing'), body: t('leads, campaigns, reminders') },
    { name: t('Administration'), body: t('tenants, branches, roles, audit') },
    { name: t('Authentication'), body: t('sessions, OTP, permissions') },
    { name: t('AI Platform'), body: t('assistant, knowledge base, scheduling') },
    { name: t('Parts & Inventory'), body: t('stock, orders, transfers') },
    { name: t('Call Center'), body: t('queues, call logs, follow-ups') },
    { name: t('Reports & Analytics'), body: t('KPIs, report builder, export') },
    { name: t('Team & HR'), body: t('shifts, timesheets, payroll prep') },
    { name: t('Portals'), body: t('customer, technician, supplier, kiosk') },
  ]
}

/** The fourteen roles and their approval ceiling in SAR — the artifact's
 *  `ROLE_LINES`. A ceiling of `0` prints struck through: a role that may
 *  approve nothing is a boundary, not a lesser role. */
function roleLines(t: T): readonly { name: string; ceiling: string }[] {
  return [
    { name: t('Owner / CEO — المالك'), ceiling: '∞' },
    { name: t('Super Admin — المشرف العام'), ceiling: '∞' },
    { name: t('Branch Manager — مدير الفرع'), ceiling: '50,000' },
    { name: t('Accountant — محاسب'), ceiling: '25,000' },
    { name: t('Procurement Agent — وكيل المشتريات'), ceiling: '20,000' },
    { name: t('HR Manager — مدير الموارد البشرية'), ceiling: '15,000' },
    { name: t('Storekeeper — أمين المستودع'), ceiling: '10,000' },
    { name: t('Service Advisor — مستشار الخدمة'), ceiling: '5,000' },
    { name: t('Receptionist — موظف الاستقبال'), ceiling: '0' },
    { name: t('Call Center Agent — موظف مركز الاتصال'), ceiling: '0' },
    { name: t('Technician — فني'), ceiling: '0' },
    { name: t('QC Inspector — مفتش الجودة'), ceiling: '0' },
    { name: t('Customer — عميل'), ceiling: '0' },
    { name: t('Supplier — مورّد'), ceiling: '0' },
  ]
}

export function CommandDeck({ t }: { t: T }) {
  const [lines, setLines] = useState<Line[]>(() => [
    { id: nextId(), node: <span>{t('SALIS AUTO · GARAGE OS v1.0 — local shell.')}</span> },
    {
      id: nextId(),
      node: (
        <span>
          {t('No network, no backend, no tenant data. Type')} <b>help</b>.
        </span>
      ),
    },
  ])
  const [value, setValue] = useState('')
  const outRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = outRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function push(...nodes: ReactNode[]): void {
    setLines((prev) => [...prev, ...nodes.map((node) => ({ id: nextId(), node }))])
  }

  function help(): void {
    push(
      <u>{t('Known commands')}</u>,
      <span>
        <b>status</b> — {t('today on a sample tenant, one line per figure')}
      </span>,
      <span>
        <b>lifecycle</b> — {t('the six stages of a job card, and the two gates')}
      </span>,
      <span>
        <b>domains</b> — {t('the thirteen functional domains')}
      </span>,
      <span>
        <b>roles</b> — {t('the fourteen roles and what each may approve')}
      </span>,
      <span>
        <b>zatca</b> — {t('the e-invoicing pipeline, step by step')}
      </span>,
      <span>
        <b>parts</b> — {t('how a part reaches a job card')}
      </span>,
      <span>
        <b>pricing</b> — {t('the three plans')}
      </span>,
      <span>
        <b>salis</b> — {t('what this actually is')}
      </span>,
      <span>
        <b>clear</b> — {t('wipe the console')}
      </span>
    )
  }

  function status(): void {
    push(
      <u>{t('SAMPLE TENANT — RIYADH')}</u>,
      <span>
        {t('branches')} <b dir="ltr">3 / 3</b> {t('online')}
      </span>,
      <span>
        {t('job cards open')} <b dir="ltr">31</b>
      </span>,
      <span>
        {t('awaiting signature')} <b dir="ltr">6</b> {t('estimates')}
      </span>,
      <span>
        {t('invoices cleared')} <b dir="ltr">24</b> {t('today')}
      </span>,
      <span>
        {t('below reorder point')} <s dir="ltr">18 SKUs</s> — {t('purchasing notified')}
      </span>,
      <span>{t('Sample data. No tenant data reaches this page.')}</span>
    )
  }

  function lifecycle(): void {
    push(
      <u>{t('THE JOB CARD — SIX STAGES, IN ORDER')}</u>,
      <span>
        <b dir="ltr">1</b> {t('Check-in')} — {t('reception or the kiosk; customer, vehicle, complaint, photos')}
      </span>,
      <span>
        <b dir="ltr">2</b> {t('Inspection')} — {t('technician; multi-point, each finding with a severity')}
      </span>,
      <span>
        <b dir="ltr">3</b> {t('Estimate')} — {t('advisor prices it')} <s>{t('GATE: customer signs by SMS one-time code')}</s>
      </span>,
      <span>
        <b dir="ltr">4</b> {t('Repair')} — {t('only the authorised lines; parts issued by the storekeeper')}
      </span>,
      <span>
        <b dir="ltr">5</b> {t('Quality check')} — {t('inspector passes or fails')} <s>{t('GATE: never the same technician')}</s>
      </span>,
      <span>
        <b dir="ltr">6</b> {t('Delivery')} — {t('checklist, customer sign-off, then the ZATCA invoice')}
      </span>,
      <span>{t('A card that skips a stage is refused by the server, not by habit.')}</span>
    )
  }

  function listDomains(): void {
    push(<u>{t('THIRTEEN FUNCTIONAL DOMAINS')}</u>)
    for (const domain of domainLines(t)) {
      push(
        <span>
          <b>{domain.name}</b> — {domain.body}
        </span>
      )
    }
  }

  function listRoles(): void {
    push(<u>{t('FOURTEEN ROLES · APPROVAL CEILING IN SAR')}</u>)
    for (const role of roleLines(t)) {
      push(
        <span>
          {role.ceiling === '0' ? <s dir="ltr">{role.ceiling}</s> : <b dir="ltr">{role.ceiling}</b>} {role.name}
        </span>
      )
    }
    push(<span>{t('A role that may approve nothing is not a lesser role — it is a boundary.')}</span>)
  }

  function zatca(): void {
    push(
      <u>{t('ZATCA PHASE 2 — EVERY INVOICE, FIVE STEPS')}</u>,
      <span>
        <b dir="ltr">1</b> {t('UBL 2.1 XML generated from the invoice itself')}
      </span>,
      <span>
        <b dir="ltr">2</b> {t('TLV QR code, five tags, printed on the document')}
      </span>,
      <span>
        <b dir="ltr">3</b> {t('SHA-256 hash, chained to the invoice before it')}
      </span>,
      <span>
        <b dir="ltr">4</b> {t('X.509 signature applied')}
      </span>,
      <span>
        <b dir="ltr">5</b> {t('Fatoora API —')} <b>{t('standard')}</b> {t('cleared in real time,')} <b>{t('simplified')}</b> {t('reported')}
      </span>,
      <span>{t('VAT is computed on the server at the ZATCA rate. Retained seven years.')}</span>
    )
  }

  function parts(): void {
    push(
      <u>{t('HOW A PART REACHES A JOB CARD')}</u>,
      <span>
        <b>{t('requisition')}</b> — {t('raised against the job')} <s>{t('never approved by the same person')}</s>
      </span>,
      <span>
        <b>{t('order')}</b> — {t('approved within the role ceiling, sent to the supplier')}
      </span>,
      <span>
        <b>{t('received')}</b> — {t('checked against the order and costed into stock')}
      </span>,
      <span>
        <b>{t('issued')}</b> — {t('storekeeper issues it to the card; stock is a sum of movements')}
      </span>
    )
  }

  function pricing(): void {
    push(
      <u>{t('THREE PLANS · SAR, EXCLUDING VAT')}</u>,
      <span>
        <b>{t('Starter')}</b> — <span dir="ltr">999</span> {t('/ month — 1 branch, 10 users')}
      </span>,
      <span>
        <b>{t('Professional')}</b> — <span dir="ltr">2,499</span> {t('/ month — 3 branches, 50 users')}
      </span>,
      <span>
        <b>{t('Enterprise')}</b> — {t('by quotation — unlimited branches and users')}
      </span>,
      <span>{t('Annual billing takes 15% off. See Access for the full comparison.')}</span>
    )
  }

  function salis(): void {
    push(
      <u>{t('What this is')}</u>,
      <span>{t('SALIS AUTO — a multi-tenant garage management platform for the Saudi market:')}</span>,
      <span>{t('workshop operations, parts and inventory, ZATCA-compliant invoicing and')}</span>,
      <span>{t('accounting, CRM, HR, procurement, and the customer, technician, supplier')}</span>,
      <span>{t('and procurement portals. Arabic and English.')}</span>,
      <span>
        <s>{t('Figures on this page are sample data.')}</s>
      </span>
    )
  }

  const COMMANDS: Record<string, () => void> = {
    help,
    ls: help,
    '?': help,
    status,
    lifecycle,
    domains: listDomains,
    roles: listRoles,
    zatca,
    parts,
    pricing,
    salis,
    clear: () => setLines([]),
  }

  function run(raw: string): void {
    const input = raw.trim()
    if (!input) return
    push(<span className="you">▸ {input}</span>)
    const cmd = (input.split(/\s+/)[0] ?? '').toLowerCase()
    const handler = COMMANDS[cmd]
    if (handler) handler()
    else
      push(
        <span>
          <s>
            {cmd}: {t('not a command here.')}
          </s>{' '}
          {t('Try')} <b>help</b>.
        </span>
      )
  }

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault()
    run(value)
    setValue('')
  }

  const chips = ['help', 'status', 'lifecycle', 'domains', 'roles', 'zatca', 'pricing', 'salis']

  return (
    <div>
      <div className="panel deck rise">
        <div className="deck-bar">
          <i aria-hidden="true" /> SALIS://riyadh — {t('local shell, no network')}
        </div>
        <div className="deck-out mono" ref={outRef} role="log" aria-live="polite">
          {lines.map((line) => (
            <div key={line.id}>{line.node}</div>
          ))}
        </div>
        <form className="deck-in" onSubmit={onSubmit}>
          <span aria-hidden="true">▸</span>
          <label className="sr-only" htmlFor="deck-input">
            {t('Command')}
          </label>
          <input
            id="deck-input"
            name="command"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t('type a command, or `help`')}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
      <div className="chips">
        {chips.map((chip) => (
          <button key={chip} type="button" className="chip" onClick={() => run(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
