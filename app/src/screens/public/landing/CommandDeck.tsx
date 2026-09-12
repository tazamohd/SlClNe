import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { T } from './types'
import type { EraRow, LedgerData } from './landingData'

/** The command deck (`#deck`) — a real controlled component, not a `<pre>`
 *  filled with `innerHTML`. Same idea as the original concept artifact (a
 *  small local console with no backend), but every answer it gives is a real
 *  fact about the shipping product: the thirteen domains, the fourteen
 *  roles, the measured proof figures, the real FAQ, and the roadmap this
 *  same page renders — never an invented diagnostic or telemetry reading.
 *
 *  `IndexPage` already ran every one of `eras`/`proof`/`ledger`'s strings
 *  through `t(...)` once, at the point each array is built — this component
 *  reads them as already-localized text and never re-wraps them in `t(...)`
 *  (that would be a *dynamic* call, invisible to `check-i18n`). Its own copy
 *  (`help`, `status` labels, and so on) is literal `t(...)` calls throughout. */

interface Props {
  t: T
  eras: readonly EraRow[]
  proof: readonly { from: string; to: string; what: string; base: string }[]
  ledger: LedgerData
  domainCount: number
  roleCount: number
}

interface Line {
  id: number
  node: ReactNode
}

let seq = 0
function nextId(): number {
  seq += 1
  return seq
}

/** The thirteen real domains and the fourteen real roles — the same lists
 *  `SystemPage` renders, kept short here since the deck only ever prints one
 *  line per entry. */
function domainNames(t: T): readonly string[] {
  return [
    t('Workshop'), t('Registry'), t('Finance'), t('Accounting'), t('CRM and marketing'),
    t('Administration'), t('Authentication'), t('AI platform'), t('Parts and inventory'),
    t('Call centre'), t('Reports and analytics'), t('Team and HR'), t('Portals'),
  ]
}

function roleNames(t: T): readonly string[] {
  return [
    t('Owner / CEO'), t('Super Admin'), t('Branch Manager'), t('Service Advisor'), t('Technician'),
    t('QC Inspector'), t('Storekeeper'), t('Accountant'), t('HR Manager'), t('Receptionist'),
    t('Call Center Agent'), t('Procurement Agent'), t('Supplier'), t('Customer'),
  ]
}

function faqExcerpts(t: T): readonly { q: string; a: string }[] {
  return [
    { q: t('How long does it take to get started?'), a: t('Most workshops run their first job card within a day.') },
    { q: t('Is the e-invoicing really ZATCA Phase 2?'), a: t('Yes — TLV QR, hash chain, UBL 2.1 XML, immutable after issue.') },
    { q: t('Is my data isolated from other workshops?'), a: t('Yes, isolated at the database level, access by role.') },
  ]
}

export function CommandDeck({ t, eras, proof, ledger, domainCount, roleCount }: Props) {
  const [lines, setLines] = useState<Line[]>(() => [
    { id: nextId(), node: <span>{t('SALIS AUTO — local shell, no network.')}</span> },
    {
      id: nextId(),
      node: (
        <span>
          {t('Every answer here is a real fact about the product. Type')} <b>help</b>.
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
        <b>status</b> — {t('a one-line summary of the platform')}
      </span>,
      <span>
        <b>domains</b> — {t('the thirteen real domains')}
      </span>,
      <span>
        <b>roles</b> — {t('the fourteen real roles')}
      </span>,
      <span>
        <b>proof</b> — {t('measured results from real deployments')}
      </span>,
      <span>
        <b>ledger</b> — {t('a sample ZATCA Phase 2 invoice')}
      </span>,
      <span>
        <b>faq</b> — {t('answers asked before every demo')}
      </span>,
      <span>
        <b>warp</b> — {t('jump to a year on the roadmap — try')} <b dir="ltr">warp 2030</b>
      </span>,
      <span>
        <b>salis</b> — {t('what this page actually is')}
      </span>,
      <span>
        <b>clear</b> — {t('wipe the console')}
      </span>
    )
  }

  function status(): void {
    push(
      <u>SALIS AUTO</u>,
      <span>
        {t('Domains')} — <b dir="ltr">{domainCount}</b>
      </span>,
      <span>
        {t('Roles')} — <b dir="ltr">{roleCount}</b>
      </span>,
      <span>
        {t('E-invoicing')} — <b>{t('ZATCA Phase 2, live')}</b>
      </span>,
      <span>
        {t('Languages')} — <b>{t('Arabic and English, RTL throughout')}</b>
      </span>,
      <span>
        {t('Audit trail')} — <b>{t('one row per change, always on')}</b>
      </span>
    )
  }

  function listDomains(): void {
    domainNames(t).forEach((name, i) => {
      push(
        <span dir="ltr">
          <b>{String(i + 1).padStart(2, '0')}/13</b> {name}
        </span>
      )
    })
  }

  function listRoles(): void {
    roleNames(t).forEach((name, i) => {
      push(
        <span dir="ltr">
          <b>{String(i + 1).padStart(2, '0')}/14</b> {name}
        </span>
      )
    })
  }

  function runProof(): void {
    push(<u>{t('Results from deployments')}</u>)
    for (const p of proof) {
      push(
        <span>
          <s>{p.from}</s> → <b>{p.to}</b> — {p.what}
        </span>
      )
    }
  }

  function runLedger(): void {
    push(<u>{t('ZATCA PHASE 2 · VAT 15%')}</u>)
    for (const line of ledger.lines) {
      push(
        <span>
          {line.label} <b dir="ltr">{line.amount}</b>
        </span>
      )
    }
    push(
      <span>
        {t('Total')} <b dir="ltr">{ledger.total}</b>
      </span>
    )
    push(<span>{t('Illustrative figures, not customer data.')}</span>)
  }

  function runFaq(): void {
    push(<u>{t('Asked before every demo')}</u>)
    for (const item of faqExcerpts(t)) {
      push(
        <span>
          <b>{item.q}</b> — {item.a}
        </span>
      )
    }
  }

  function runWarp(arg: string): void {
    const era = eras.find((e) => e.year === arg.trim())
    if (!era) {
      push(
        <span>
          <s>{t('No waypoint there.')}</s> {t('The roadmap stops at:')}{' '}
          <b dir="ltr">{eras.map((e) => e.year).join(', ')}</b>
        </span>
      )
      return
    }
    push(
      <span>
        ▸ {t('Jumping to')} <u dir="ltr">{era.year}</u> — {era.status}
      </span>,
      <b>{era.headline}</b>,
      <span>{era.body}</span>
    )
    document.getElementById('roadmap')?.scrollIntoView?.({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  function salis(): void {
    push(
      <u>{t('What this page actually is')}</u>,
      <span>{t('A real feature tour of SALIS AUTO, styled as a future-facing concept page.')}</span>,
      <span>{t('Every domain, role, number and quote shown here is drawn from the real product.')}</span>,
      <span>{t('The roadmap section is the only place that speculates, and it says so.')}</span>,
      <span>
        {t('Full pricing and details are at')} <b dir="ltr">/public-portal/pricing</b>.
      </span>
    )
  }

  const COMMANDS: Record<string, (arg: string) => void> = {
    help,
    ls: help,
    '?': help,
    status,
    domains: listDomains,
    roles: listRoles,
    proof: runProof,
    ledger: runLedger,
    faq: runFaq,
    warp: runWarp,
    salis,
    clear: () => setLines([]),
  }

  function run(raw: string): void {
    const input = raw.trim()
    if (!input) return
    push(<span className="you">▸ {input}</span>)
    const parts = input.split(/\s+/)
    const cmd = (parts.shift() ?? '').toLowerCase()
    const arg = parts.join(' ')
    const handler = COMMANDS[cmd]
    if (handler) handler(arg)
    else
      push(
        <span>
          <s>
            {cmd}: {t('not a known command.')}
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

  const chips = ['help', 'status', 'domains', 'roles', 'proof', 'warp 2030', 'salis']

  return (
    <div>
      <div className="panel deck rise">
        <div className="deck-bar">
          <i aria-hidden="true" /> SALIS://workshop-os — {t('local shell, no network')}
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
