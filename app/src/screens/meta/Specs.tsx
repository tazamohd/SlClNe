import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { ROLES, PERMS, FIELD_RULES, SOD } from '@/data/generated/rbac'
import { SCREENS } from '@/data/generated/screens'
import { NAV } from '@/data/generated/nav'
import type { ModuleId } from '@/data/types'

/** Design-reference screens: Flow Spec, RBAC Spec, Screen Index — ungated
 *  docs of the product itself (see RBAC_UNGATED). Page content only. */

// blue = granted/positive, orange = warning/denied — no green/red/yellow/purple/pink/teal.
const BLUE: readonly [string, string] = ['rgba(10,94,215,.1)', '#0A5ED7']
const CYAN: readonly [string, string] = ['rgba(11,179,255,.1)', '#0BB3FF']
const ORANGE: readonly [string, string] = ['rgba(249,115,22,.1)', '#F97316']
const NAVY: readonly [string, string] = ['rgba(11,31,59,.1)', '#0B1F3B']
const SLATE: readonly [string, string] = ['rgba(100,116,139,.1)', '#64748B']

/** The 28 permission modules, labelled — shared by RBACSpec (matrix columns)
 *  and IndexPage (screen groups) so both follow the RBAC engine's `ModuleId`. */
const MODULES: readonly (readonly [ModuleId, string])[] = [
  ['dashboard', 'Dashboard'], ['jobcards', 'Job Cards'], ['appointments', 'Appointments'],
  ['estimates', 'Estimates'], ['customers', 'Customers'], ['vehicles', 'Vehicles'],
  ['inventory', 'Inventory'], ['procurement', 'Procurement'], ['invoices', 'Invoices'],
  ['payments', 'Payments'], ['accounting', 'Accounting'], ['hr', 'HR & Payroll'],
  ['technicians', 'Technicians'], ['crm', 'CRM'], ['callcenter', 'Call Center'],
  ['reports', 'Reports'], ['ai', 'AI Platform'], ['admin', 'Administration'],
  ['settings', 'Settings'], ['audit', 'Audit Log'], ['network', 'Parts Network'],
  ['execreports', 'Executive Reports'], ['portaltech', 'Technician Portal'],
  ['portalcustomer', 'Customer Portal'], ['portalsupplier', 'Supplier Portal'],
  ['portalprocure', 'Procurement Portal'], ['approvals', 'Approvals'], ['kiosk', 'Kiosk'],
]

// ═══ Flow Spec ══════════════════════════════════════════════════════════
interface FlowStep { icon: string; label: string; actor: string; tone: readonly [string, string]; gate: string; kind: 'auto' | 'gated' | 'signature' }
interface FlowTransition { from: string; to: string; rule: string; who: string }
interface FlowRole { role: string; can: string; icon: string; tone: readonly [string, string] }
interface FlowEffect { on: string; does: string; icon: string }
interface Flow { name: string; desc: string; steps: readonly FlowStep[]; transitions: readonly FlowTransition[]; roles: readonly FlowRole[]; effects: readonly FlowEffect[]; edges: readonly string[] }

const GATE_LABEL: Record<FlowStep['kind'], string> = { auto: 'Automatic', gated: 'Gate', signature: 'Signature' }
const GATE_TONE: Record<FlowStep['kind'], readonly [string, string]> = { auto: SLATE, gated: ORANGE, signature: BLUE }

const FLOWS: Record<'job' | 'est', Flow> = {
  job: {
    name: 'Job Card Lifecycle',
    desc: 'From vehicle arrival to keys handed back. Six states, three of them gated.',
    steps: [
      { icon: 'Car', label: 'Check-In', actor: 'Service Advisor', tone: ORANGE, gate: 'Vehicle + customer required', kind: 'gated' },
      { icon: 'SearchCheck', label: 'Inspection', actor: 'Technician', tone: CYAN, gate: 'Photos required', kind: 'gated' },
      { icon: 'FileText', label: 'Estimate', actor: 'Service Advisor', tone: BLUE, gate: 'Customer approval', kind: 'signature' },
      { icon: 'Wrench', label: 'Repair', actor: 'Technician', tone: BLUE, gate: 'Parts allocated', kind: 'gated' },
      { icon: 'ClipboardCheck', label: 'Quality Check', actor: 'QC / Senior Tech', tone: CYAN, gate: 'Checklist 100%', kind: 'gated' },
      { icon: 'Truck', label: 'Delivery', actor: 'Service Advisor', tone: NAVY, gate: 'Signature + payment', kind: 'signature' },
    ],
    transitions: [
      { from: 'Check-In', to: 'Inspection', rule: 'Bay and technician assigned', who: 'Service Advisor, Manager' },
      { from: 'Inspection', to: 'Estimate', rule: 'At least one inspection photo attached', who: 'Technician' },
      { from: 'Estimate', to: 'Repair', rule: 'Customer approved in portal, app, or on signature pad', who: 'Customer, or Advisor on their behalf' },
      { from: 'Repair', to: 'Waiting Parts', rule: 'Any line item unavailable in stock', who: 'Technician (automatic)' },
      { from: 'Repair', to: 'Quality Check', rule: 'All labour lines marked complete', who: 'Technician' },
      { from: 'Quality Check', to: 'Repair', rule: 'QC failed — returns to the same technician with notes', who: 'QC, Manager' },
      { from: 'Quality Check', to: 'Delivery', rule: 'All checklist items passed', who: 'QC, Manager' },
      { from: 'Delivery', to: 'Closed', rule: 'Customer signature captured and invoice settled or on account', who: 'Service Advisor' },
    ],
    roles: [
      { role: 'Service Advisor', can: 'Create job cards, build estimates, take approvals, deliver vehicles. Cannot pass QC.', icon: 'Headphones', tone: CYAN },
      { role: 'Technician', can: 'Move only their assigned jobs between Inspection, Repair and Waiting Parts. Cannot edit prices.', icon: 'Wrench', tone: BLUE },
      { role: 'QC / Senior Tech', can: 'Pass or fail quality checks and return jobs with notes. Cannot alter the estimate.', icon: 'ClipboardCheck', tone: NAVY },
      { role: 'Manager', can: 'Override any transition, reassign technicians, and approve estimates above the advisor limit.', icon: 'Crown', tone: ORANGE },
    ],
    effects: [
      { on: 'On Check-In', does: 'Vehicle mileage recorded, WhatsApp confirmation sent, bay marked occupied.', icon: 'MessageCircle' },
      { on: 'On Estimate approved', does: 'Parts reserved from stock; a requisition is raised for anything below reorder level.', icon: 'Package' },
      { on: 'On QC pass', does: 'Draft ZATCA e-invoice generated with 15% VAT and a QR code.', icon: 'Receipt' },
      { on: 'On Delivery', does: 'Signature stored on the job card, bay released, satisfaction survey queued for 24h later.', icon: 'PenTool' },
    ],
    edges: [
      'Customer declines the estimate → job moves to Declined, parts reservations release, vehicle is scheduled for collection.',
      'Parts delayed beyond the promised date → customer is notified automatically and the promised date is recalculated.',
      'QC fails twice on the same job → escalates to the Manager and blocks a third self-certification.',
      'Vehicle collected before payment → job closes as On Account and appears in the receivables ageing report.',
    ],
  },
  est: {
    name: 'Estimate Approval',
    desc: 'Quote to authorised work, with the approval limits that decide who can sign.',
    steps: [
      { icon: 'FilePlus', label: 'Draft', actor: 'Service Advisor', tone: SLATE, gate: 'Editable', kind: 'auto' },
      { icon: 'Calculator', label: 'Priced', actor: 'Service Advisor', tone: CYAN, gate: 'Parts + labour costed', kind: 'gated' },
      { icon: 'UserCheck', label: 'Internal Review', actor: 'Manager', tone: ORANGE, gate: 'Above SAR 5,000 only', kind: 'gated' },
      { icon: 'Send', label: 'Sent', actor: 'System', tone: BLUE, gate: 'Customer notified', kind: 'auto' },
      { icon: 'ThumbsUp', label: 'Approved', actor: 'Customer', tone: BLUE, gate: 'Signature or OTP', kind: 'signature' },
    ],
    transitions: [
      { from: 'Draft', to: 'Priced', rule: 'Every line has a part or labour rate attached', who: 'Service Advisor' },
      { from: 'Priced', to: 'Sent', rule: 'Total at or below SAR 5,000 — advisor may send directly', who: 'Service Advisor' },
      { from: 'Priced', to: 'Internal Review', rule: 'Total above SAR 5,000 requires a manager', who: 'System (automatic)' },
      { from: 'Internal Review', to: 'Sent', rule: 'Manager approves the pricing and discount', who: 'Manager, Owner' },
      { from: 'Sent', to: 'Approved', rule: 'Customer signs on the pad, in the app, or confirms an SMS OTP', who: 'Customer' },
      { from: 'Sent', to: 'Revised', rule: 'Customer requests changes — a new version is created, history kept', who: 'Customer, Advisor' },
      { from: 'Sent', to: 'Declined', rule: 'Customer rejects, or no response within 72 hours', who: 'Customer, or system timeout' },
    ],
    roles: [
      { role: 'Service Advisor', can: 'Draft, price and send estimates up to SAR 5,000. May apply discounts up to 5%.', icon: 'Headphones', tone: CYAN },
      { role: 'Manager', can: 'Approve estimates above SAR 5,000 and discounts up to 15%.', icon: 'Briefcase', tone: BLUE },
      { role: 'Owner', can: 'Approve any amount and any discount. Only role that can waive labour entirely.', icon: 'Crown', tone: ORANGE },
      { role: 'Customer', can: 'Approve, request a revision, or decline. Cannot see internal cost or margin.', icon: 'User', tone: SLATE },
    ],
    effects: [
      { on: 'On Sent', does: 'WhatsApp and email issued with a signed link valid for 72 hours.', icon: 'Send' },
      { on: 'On Approved', does: 'Job card unblocks to Repair, parts are reserved, approval PDF attached to the record.', icon: 'Lock' },
      { on: 'On Revised', does: 'Version number increments; the customer always sees the latest, staff can view the diff.', icon: 'GitBranch' },
      { on: 'On Declined', does: 'Reason logged against the customer record and surfaced in the lost-work report.', icon: 'SearchX' },
    ],
    edges: [
      'Link expires unopened → one reminder is sent, then the estimate lapses to Expired rather than Declined.',
      'Customer approves only part of the work → advisor splits it into an approved estimate and a deferred one.',
      'Price changes after approval → requires re-approval; work is blocked until the customer signs again.',
      'Fleet accounts with a standing PO skip customer approval and go straight to Repair under the contract terms.',
    ],
  },
}

export function FlowSpec() {
  const { t } = usePreferences()
  const [pick, setPick] = useState<'job' | 'est'>('job')
  const flow = FLOWS[pick]

  return (
    <>
      <FeatureHeader icon="ClipboardList" title={t('Flow Specification')} subtitle={t(
        'The two flows that carry the most money and the most disputes. Each state, the gate that guards it, who may cross it, what fires automatically, and how it breaks.'
      )} />
      <div className="flex gap-2" role="tablist">
        {(['job', 'est'] as const).map((id) => (
          <button key={id} type="button" role="tab" aria-selected={pick === id} onClick={() => setPick(id)} className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-4 font-action text-[13px] font-medium transition-colors',
            pick === id ? 'bg-salis-gradient text-white' : 'border border-border bg-card text-body hover:border-border-strong'
          )}>
            <Icon name={id === 'job' ? 'ClipboardList' : 'FileCheck'} size={14} />
            {t(FLOWS[id].name)}
          </button>
        ))}
      </div>
      <Card className="rounded-lg p-6">
        <h2 className="m-0 text-base font-bold text-heading">{t(flow.name)}</h2>
        <p className="mb-5 mt-1 text-[13px] text-muted">{t(flow.desc)}</p>
        <div className="flex items-start gap-0 overflow-x-auto pb-1.5">
          {flow.steps.map((step, index) => (
            <div key={step.label} className="flex flex-shrink-0 items-start">
              <div className="flex w-[168px] flex-col items-center gap-2 text-center">
                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl" style={{ background: step.tone[0], color: step.tone[1] }}>
                  <Icon name={step.icon} size={19} />
                </span>
                <div>
                  <p className="m-0 text-[13px] font-bold text-heading">{t(step.label)}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{t(step.actor)}</p>
                </div>
                <Badge background={GATE_TONE[step.kind][0]} color={GATE_TONE[step.kind][1]}>{t(GATE_LABEL[step.kind])}: {t(step.gate)}</Badge>
              </div>
              {index < flow.steps.length - 1 ? (
                <div className="flex w-6 items-center justify-center pt-3.5"><Icon name="ArrowRight" size={15} className="text-border-strong" /></div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card className="overflow-hidden rounded-lg">
          <div className="border-b border-border px-5 py-4"><h3 className="m-0 text-[15px] font-bold text-heading">{t('State Transitions')}</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-border px-5 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted">{t('From')}</th>
                  <th className="border-b border-border px-3 py-2.5" />
                  <th className="border-b border-border px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted">{t('To')}</th>
                  <th className="border-b border-border px-5 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted">{t('Rule & who can do it')}</th>
                </tr>
              </thead>
              <tbody>
                {flow.transitions.map((row) => (
                  <tr key={row.from + row.to} className="transition-colors hover:bg-[rgba(10,94,215,.03)]">
                    <td className="border-b border-border px-5 py-2.5 text-xs text-muted">{t(row.from)}</td>
                    <td className="border-b border-border px-3 py-2.5 text-center"><Icon name="ArrowRight" size={13} className="text-salis-blue" /></td>
                    <td className="border-b border-border px-3 py-2.5 text-xs font-semibold text-heading">{t(row.to)}</td>
                    <td className="border-b border-border px-5 py-2.5">
                      <p className="m-0 text-xs text-body">{t(row.rule)}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{t(row.who)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex flex-col gap-6">
          <Section title={t('Who Can Do What')}>
            <div className="flex flex-col gap-3">
              {flow.roles.map((r) => (
                <div key={r.role} className="flex items-start gap-2.5">
                  <span className="flex flex-shrink-0 rounded-[9px] p-1.5" style={{ background: r.tone[0], color: r.tone[1] }}><Icon name={r.icon} size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[13px] font-semibold text-heading">{t(r.role)}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">{t(r.can)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title={t('Automatic Side Effects')}>
            <div className="flex flex-col gap-2.5">
              {flow.effects.map((e) => (
                <div key={e.on} className="flex gap-2.5 rounded-[10px] border border-border bg-inset p-2.5">
                  <Icon name={e.icon} size={14} className="mt-0.5 flex-shrink-0 text-salis-blue" />
                  <div>
                    <p className="m-0 text-xs font-semibold text-heading">{t(e.on)}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">{t(e.does)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title={t('Edge Cases')} className="border-[rgba(249,115,22,.25)]">
            <div className="flex flex-col gap-2.5">
              {flow.edges.map((edge) => (
                <div key={edge} className="flex gap-2.5">
                  <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-salis-orange" aria-hidden />
                  <p className="m-0 text-xs leading-snug text-body">{t(edge)}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}

// ═══ RBAC Spec ══════════════════════════════════════════════════════════
const SCOPE_LABEL: Record<string, string> = { all: 'All branches', branch: 'Own branch', own: 'Own jobs', self: 'Own records', external: 'External', platform: 'Platform' }
const SHORT_CODE: Record<string, string> = {
  owner: 'OWN', superadmin: 'SA', manager: 'MGR', advisor: 'ADV', technician: 'TECH', qc: 'QC', parts: 'PART',
  accountant: 'ACCT', hr: 'HR', frontdesk: 'DESK', callcenter: 'CALL', procurement: 'PROC', supplier: 'SUPP', customer: 'CUST',
}
const ACTIONS: readonly [string, string][] = [['v', 'View'], ['c', 'Create'], ['e', 'Edit'], ['d', 'Delete'], ['a', 'Approve'], ['x', 'Export']]

/** One-line role summaries — narrative the engine's flat scope/limit fields
 *  don't carry; not part of the matrix, purely descriptive. */
const ROLE_SUMMARY: Record<string, string> = {
  owner: 'Unrestricted. The only role that can waive labour entirely, change approval limits, and delete financial records.',
  superadmin: 'Platform operator, not a workshop user. Manages tenants and system config; deliberately cannot read customer financial data.',
  manager: 'Runs one branch end to end. Approves above the advisor limit and overrides any workflow transition.',
  advisor: 'Owns the customer relationship: books, quotes, takes approvals, delivers. Never sees cost or margin.',
  technician: 'Sees only jobs assigned to them. Moves work between inspection, repair and waiting-parts; cannot price anything.',
  qc: 'Passes or fails quality checks and returns work with notes. Cannot edit the estimate or perform the repair.',
  parts: 'Owns stock accuracy: receiving, issuing, counts, reorder. Raises requisitions but cannot approve them.',
  accountant: 'Full ledger across all branches. Posts and approves entries, reconciles banks, files VAT.',
  hr: 'Employees, contracts, attendance, payroll. The only non-owner role that may see salaries.',
  frontdesk: 'Greets, books, checks in, takes payment. No workshop or financial depth.',
  callcenter: 'Inbound and outbound calls across all branches. Books and updates leads; cannot touch money.',
  procurement: 'Sources parts, runs RFQs, compares quotes, raises and approves POs within limit.',
  supplier: 'External. Sees only RFQs sent to them and their own quotes, orders and invoices.',
  customer: 'External. Sees only their own vehicles, jobs, estimates and invoices — never internal cost.',
}

function fmtLimit(n: number | null, t: (s: string) => string): string {
  if (n === null) return t('Unlimited')
  if (n === 0) return t('No approval rights')
  return `SAR ${n.toLocaleString('en-US')}`
}

export function RBACSpec() {
  const { t } = usePreferences()

  const roleCards = useMemo(() => ROLES.map((r) => ({
    ...r,
    scopeLabel: SCOPE_LABEL[r.scope] ?? r.scope,
    limitLabel: fmtLimit(r.limit, t),
    modCount: MODULES.filter(([id]) => (PERMS[id]?.[r.id] ?? '').includes('v')).length,
    summary: ROLE_SUMMARY[r.id] ?? '',
  })), [t])

  const matrix = useMemo(() => MODULES.map(([id, label]) => ({ id, label, cells: ROLES.map((r) => PERMS[id]?.[r.id] ?? '') })), [])

  return (
    <>
      <FeatureHeader icon="ShieldCheck" title={t('RBAC Specification')} subtitle={t(
        'Every role in SALIS AUTO, what it may do in each module, which fields it may never see, and the duties that must stay separated. This is the contract between design and implementation.'
      )} />
      <StatRow stats={[
        { label: 'Roles', value: ROLES.length, caption: 'Defined in the engine', highlight: true },
        { label: 'Modules', value: MODULES.length, caption: 'Permission units', tone: 'info' },
        { label: 'Redacted Fields', value: FIELD_RULES.length, caption: 'Hidden regardless of screen access' },
        { label: 'SoD Conflicts', value: SOD.length, caption: 'Duty pairs that must not combine', tone: 'warning' },
      ]} />
      <Section title={t('Roles')} subtitle={t('Each role carries a data scope and an approval ceiling from the live RBAC engine.')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {roleCards.map((r) => (
            <Card key={r.id} className="flex flex-col gap-2.5 rounded-lg p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${r.color} 13%, transparent)`, color: r.color }}>
                  <Icon name={r.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-bold text-heading">{t(r.label)}</p>
                  <p className="m-0 font-mono text-[11px] text-muted" dir="ltr">{r.id}</p>
                </div>
                <Badge background={SLATE[0]} color={SLATE[1]}>{t(r.scopeLabel)}</Badge>
              </div>
              <div className="flex flex-col gap-1 text-[12px]">
                <span className="text-muted">{t('Approval limit')}: <span className="font-semibold text-heading">{r.limitLabel}</span></span>
                <span className="text-muted">{t('Modules')}: <span className="text-body">{r.modCount} / {MODULES.length}</span></span>
              </div>
              <p className="m-0 border-t border-border pt-2 text-[12px] leading-snug text-muted">{t(r.summary)}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title={t('Permission Matrix')} subtitle={t('A dash means the module is hidden from the sidebar entirely for that role.')}>
        <div className="flex flex-wrap items-center gap-3.5">
          {ACTIONS.map(([code, label]) => (
            <span key={code} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="rounded bg-[rgba(10,94,215,.11)] px-1.5 py-px font-mono text-[10px] font-bold text-salis-blue" dir="ltr">{code.toUpperCase()}</span>
              {t(label)}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-inset">
                <th className="sticky start-0 z-[1] bg-inset px-3.5 py-2.5 text-start text-[10.5px] font-bold uppercase tracking-wider text-muted">{t('Module')}</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="px-1 py-2.5 text-[10px] font-bold text-muted" title={r.label}><span dir="ltr">{SHORT_CODE[r.id] ?? r.id.toUpperCase()}</span></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-[rgba(10,94,215,.04)]">
                  <td className="sticky start-0 whitespace-nowrap bg-card px-3.5 py-2 text-[12.5px] font-semibold text-heading">{t(row.label)}</td>
                  {row.cells.map((grant, i) => (
                    <td key={ROLES[i].id} className="px-1 py-1.5 text-center">
                      {grant ? (
                        <span className={cn('inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide', grant.length >= 5 ? 'bg-salis-gradient text-white' : 'bg-[rgba(10,94,215,.11)] text-salis-blue')} dir="ltr">
                          {grant.toUpperCase()}
                        </span>
                      ) : <span className="text-[11px] text-muted opacity-45">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title={t('Field-Level Redaction')} subtitle={t('Screen access is not enough. These fields are hidden from the roles listed even on screens they are allowed to open.')}>
        <div className="flex flex-col divide-y divide-border">
          {FIELD_RULES.map((f) => (
            <div key={f.field} className="flex flex-wrap items-start gap-3.5 py-3">
              <p className="m-0 min-w-[180px] flex-shrink-0 text-[13px] font-semibold text-heading">{t(f.field)}</p>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {f.hidden.map((id) => {
                  const role = ROLES.find((r) => r.id === id)
                  return <span key={id} className="rounded-full bg-[rgba(249,115,22,.11)] px-2 py-0.5 font-action text-[11px] font-semibold text-salis-orange">{t(role?.label ?? id)}</span>
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title={t('Segregation of Duties')} subtitle={t('One person must never hold both sides of these pairs.')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOD.map((s) => (
            <Card key={s.a + s.b} className="flex flex-col gap-2.5 rounded-lg p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-action text-[11px] font-semibold uppercase tracking-wider text-muted">{t('Conflict')}</span>
                <Badge background={s.risk === 'high' ? 'rgba(249,115,22,.14)' : 'rgba(11,179,255,.12)'} color={s.risk === 'high' ? '#F97316' : '#0BB3FF'}>
                  {s.risk === 'high' ? t('High risk') : t('Medium risk')}
                </Badge>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-1 rounded-lg bg-inset px-2.5 py-2 text-[12.5px] font-semibold text-heading">{t(s.a)}</span>
                <XCircle size={13} strokeWidth={2} className="flex-shrink-0 text-salis-orange" aria-hidden />
                <span className="flex-1 rounded-lg bg-inset px-2.5 py-2 text-[12.5px] font-semibold text-heading">{t(s.b)}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}

// ═══ Index Page ═════════════════════════════════════════════════════════
export function IndexPage() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')

  /** Screen → sidebar group, read off NAV so this index groups screens the way
   *  the app's own navigation does. Screens NAV doesn't list — detail pages,
   *  the auth chain, these reference pages — collect under "Other Screens". */
  const groups = useMemo(() => {
    const groupOf = new Map<string, string>()
    for (const group of NAV) {
      // Nav items can be section headers with no screen behind them.
      for (const item of group.items) if (item.screen) groupOf.set(item.screen, group.label)
    }
    const buckets = new Map<string, Array<(typeof SCREENS)[number]>>()
    for (const screen of SCREENS) {
      const key = groupOf.get(screen.name) ?? 'other'
      const bucket = buckets.get(key)
      if (bucket) bucket.push(screen)
      else buckets.set(key, [screen])
    }
    return buckets
  }, [])

  const sections = useMemo(() => {
    const ordered: Array<{ id: string; label: string; items: Array<(typeof SCREENS)[number]> }> = []
    for (const [id, items] of groups) {
      if (id !== 'other') ordered.push({ id, label: id, items })
    }
    const other = groups.get('other')
    if (other?.length) ordered.push({ id: 'other', label: 'Other Screens', items: other })
    if (!query.trim()) return ordered
    const needle = query.trim().toLowerCase()
    return ordered
      .map((section) => ({ ...section, items: section.items.filter((s) => s.name.toLowerCase().includes(needle) || (s.purpose ?? '').toLowerCase().includes(needle)) }))
      .filter((section) => section.items.length > 0)
  }, [groups, query])

  const withMobile = useMemo(() => SCREENS.filter((s) => s.hasMobile).length, [])

  return (
    <>
      <FeatureHeader icon="LayoutGrid" title={t('Screen Index')} subtitle={t('Every screen in the product, wired to its live route.')} />
      <StatRow stats={[
        { label: 'Total Screens', value: SCREENS.length, caption: 'In the route table', highlight: true },
        { label: 'Mobile-Ready', value: withMobile, caption: 'Have a mobile layout', tone: 'info' },
        { label: 'Sections', value: sections.length, caption: 'Grouped by module' },
      ]} />
      <label className="relative flex max-w-sm items-center">
        <Icon name="Search" size={15} className="pointer-events-none absolute text-muted start-3" />
        <span className="sr-only">{t('Filter screens')}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Filter screens...')}
          className="h-10 w-full rounded border border-border bg-inset px-3 ps-9 text-[13px] text-heading outline-none focus:border-salis-blue" />
      </label>
      {sections.length === 0 ? (
        <p className="text-sm text-muted">{t('No screens match that filter.')}</p>
      ) : sections.map((section) => (
        <Section key={section.id} title={t(section.label)} toolbar={
          <span className="rounded-full bg-[rgba(10,94,215,.08)] px-2.5 py-0.5 text-[11px] font-semibold text-salis-blue">{section.items.length}</span>
        }>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((screen) => (
              <Link key={screen.name} to={screen.route} className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 transition-colors hover:border-salis-blue">
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-medium text-heading" dir="ltr">{screen.name}</p>
                  <p className="m-0 truncate font-mono text-[11px] text-muted" dir="ltr">{screen.route}</p>
                </div>
                {screen.hasMobile ? (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[rgba(10,94,215,.07)] text-salis-blue"><Icon name="Smartphone" size={12} /></span>
                ) : null}
              </Link>
            ))}
          </div>
        </Section>
      ))}
    </>
  )
}
