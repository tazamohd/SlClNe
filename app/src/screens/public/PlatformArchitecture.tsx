import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT, usePreferences } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatBand } from './sections/StatBand'

type T = (source: string) => string

/** PublicPortal.PlatformArchitecture — Tier B content page.
 *
 *  The architecture deep-dive: what the thirteen domains are, who the
 *  fourteen roles are, the four decisions the whole platform stands on, and
 *  the six pairs of duties the server splits and never lets one person hold
 *  both ends of.
 *
 *  This is a light-first rewrite of content that shipped, complete, as part
 *  of the "SALIS AUTO 2030" design study's `system` page — a permanently
 *  dark HUD screen with its own six-page tour, never linked into the site
 *  (see `Landing.tsx`'s docstring). The content survives — every domain,
 *  every role, every duty pair, the same product facts already used on
 *  `About.tsx` (13/14/28) — the presentation is this site's own card-and-
 *  table system instead of the study's SVG constellation and dark instrument
 *  panel, and the study's clickable-constellation duplication (the same 13
 *  domains shown twice, once in a diagram and once as cards) is dropped in
 *  favour of naming each domain once. */
interface Domain {
  readonly key: string
  readonly icon: string
  readonly name: string
  readonly arabic: string
  readonly blurb: string
  readonly modules: readonly string[]
}

function domains(t: T): readonly Domain[] {
  return [
    {
      key: 'workshop', icon: 'Wrench', name: t('Workshop'), arabic: 'الورشة',
      blurb: t('The six-stage job card, and the centre of everything else: check-in, inspection, estimate, repair, quality check, delivery. The order is held by the server — a card cannot skip a stage, and two of the six are gates that need a different person entirely.'),
      modules: [t('Job cards — the whole visit'), t('Multi-point inspection — severity and photos'), t('Estimates — signed before work starts')],
    },
    {
      key: 'registry', icon: 'BookUser', name: t('Registry'), arabic: 'السجل',
      blurb: t('Customers and vehicles, with the Saudi formats validated where they are entered: plate patterns, +966 numbers, national ID. A vehicle keeps its service history across branches and across owners.'),
      modules: [t('Customers and fleets — with loyalty'), t('Vehicles, VIN decoding — identity'), t('Service history — the whole life')],
    },
    {
      key: 'finance', icon: 'Receipt', name: t('Finance'), arabic: 'المالية',
      blurb: t('Invoices, payments and receipts, stored as integer halalas and rounded once at the total. Standard invoices clear with ZATCA in real time; simplified invoices are reported. VAT is computed on the server and never accepted from the browser.'),
      modules: [t('ZATCA Phase 2 e-invoicing — cleared, not filed'), t('VAT 15% — server-side'), t('Payments · Mada, card, cash and transfer')],
    },
    {
      key: 'accounting', icon: 'BarChart3', name: t('Accounting'), arabic: 'المحاسبة',
      blurb: t('A real double-entry ledger underneath the invoice, not a report generated from it. The entry is posted from the document that caused it, so the month closes by review rather than by reassembly.'),
      modules: [t('Chart of accounts, journals — debits equal credits'), t('Trial balance, P&L, cash flow — continuous'), t('AR / AP, bank reconciliation and budgets')],
    },
    {
      key: 'crm', icon: 'Users', name: t('CRM & Marketing'), arabic: 'العملاء والتسويق',
      blurb: t('Lead to opportunity to customer, with the audit chain preserved through the conversion. Service reminders go out on the channel the customer actually answers, in the language they read.'),
      modules: [t('Leads and opportunities — one chain'), t('Campaigns · SMS, email, WhatsApp — one voice'), t('Service reminders — by mileage or date')],
    },
    {
      key: 'admin', icon: 'ShieldCheck', name: t('Administration'), arabic: 'الإدارة',
      blurb: t('Organisation, branch, user — the boundaries a workshop draws around itself, enforced by row-level security rather than by a policy document nobody has read. The permission matrix is edited here, in the open.'),
      modules: [t('Tenants, branches, users — territory'), t('14 roles × 28 modules — the matrix'), t('Audit log — every change, every refusal')],
    },
    {
      key: 'auth', icon: 'KeyRound', name: t('Authentication'), arabic: 'الدخول',
      blurb: t('Sessions that expire, passwords hashed with argon2id, one-time codes over SMS, and refresh tokens that detect their own reuse. Nothing here is a feature anyone asks for; all of it is noticed the day it is missing.'),
      modules: [t('Password policy, argon2id — hashed'), t('SMS one-time codes — and lockout'), t('Sessions, refresh, MFA — short-lived')],
    },
    {
      key: 'ai', icon: 'Brain', name: t('AI Platform'), arabic: 'الذكاء الاصطناعي',
      blurb: t('An assistant that answers over the workshop’s own data, a repair knowledge base the floor adds to, and scheduling help that reads the bay board. Suggestions, never silent authority: an agent proposes, a role approves.'),
      modules: [t('Assistant — natural language'), t('Repair knowledge base — institutional memory'), t('Smart scheduling — reads the board')],
    },
    {
      key: 'parts', icon: 'Boxes', name: t('Parts & Inventory'), arabic: 'قطع الغيار والمخزون',
      blurb: t('Stock is not a number somebody edits; it is the sum of its movements. Reorder points, purchase orders with an approval chain, goods received against the order, and transfer between branches.'),
      modules: [t('Stock, reorder points — derived, not typed'), t('Purchase orders — with approval ceilings'), t('Supplier catalogues and price lists')],
    },
    {
      key: 'callcenter', icon: 'Headset', name: t('Call Center'), arabic: 'مركز الاتصال',
      blurb: t('Every conversation with a customer, wherever it started, lands in one thread against one vehicle — and the follow-up is scheduled before the call ends rather than remembered afterwards.'),
      modules: [t('Call logging — one thread per vehicle'), t('Queues and appointments — across branches'), t('Follow-ups — never dropped')],
    },
    {
      key: 'reports', icon: 'LineChart', name: t('Reports & Analytics'), arabic: 'التقارير والتحليلات',
      blurb: t('Dashboards that answer the question the role actually has. The owner sees money, the advisor sees today, the technician sees the next hour — and anything on screen can leave as a file.'),
      modules: [t('Role dashboards — per standing'), t('Report builder — ask for a column'), t('KPIs and alerts — pushed, not hunted')],
    },
    {
      key: 'team', icon: 'IdCard', name: t('Team & HR'), arabic: 'الفريق والموارد البشرية',
      blurb: t('The technician directory, shifts, timesheets, leave, certifications and performance — plus payroll preparation, which stops deliberately at the bank: the system prepares the run, a human sends the money.'),
      modules: [t('Shifts and timesheets — from the floor'), t('Leave, certifications and training'), t('Payroll preparation — prepared, not paid')],
    },
    {
      key: 'portals', icon: 'DoorOpen', name: t('Portals'), arabic: 'البوابات',
      blurb: t('Customer, technician, supplier, procurement, kiosk and super admin. Six ways in, each with its own permissions, each seeing exactly its own slice and nothing adjacent to it.'),
      modules: [t('Customer app — sign the estimate'), t('Technician portal — one hand, in Arabic'), t('Supplier portal — its own orders only')],
    },
  ]
}

function roles(t: T): readonly { name: string; scope: string; note: string }[] {
  return [
    { name: t('Owner / CEO — المالك'), scope: t('All branches'), note: t('Sees the money and the shape of every branch at once. Approves without ceiling.') },
    { name: t('Super Admin — المشرف العام'), scope: t('Platform'), note: t('Holds the platform itself, and is audited hardest of anyone on it.') },
    { name: t('Branch Manager — مدير الفرع'), scope: t('One branch'), note: t('Owns one floor and everything on it, within their approval ceiling.') },
    { name: t('Accountant — محاسب'), scope: t('All branches'), note: t('Issues the invoice after delivery, posts the journal.') },
    { name: t('Procurement Agent — وكيل المشتريات'), scope: t('All branches'), note: t('Raises and places orders, and may not receive what they ordered.') },
    { name: t('HR Manager — مدير الموارد البشرية'), scope: t('All branches'), note: t('Holds the people records and prepares the payroll run.') },
    { name: t('Storekeeper — أمين المستودع'), scope: t('One branch'), note: t('Issues parts to the job card and answers for every unit.') },
    { name: t('Service Advisor — مستشار الخدمة'), scope: t('One branch'), note: t('Stands where the customer stands. Prices the estimate.') },
    { name: t('Receptionist — موظف الاستقبال'), scope: t('One branch'), note: t('The gate: opens the card, takes the payment. Approves nothing.') },
    { name: t('Call Center Agent — موظف مركز الاتصال'), scope: t('All branches'), note: t('One thread per vehicle, across every branch. Approves nothing.') },
    { name: t('Technician — فني'), scope: t('Own jobs'), note: t('Sees the next hour, in Arabic, with one hand free. Cost and margin are hidden.') },
    { name: t('QC Inspector — مفتش الجودة'), scope: t('One branch'), note: t('The second signature, and never the first. Cannot pass their own repair.') },
    { name: t('Customer — عميل'), scope: t('Self'), note: t('One life — the vehicle’s. Signs the estimate, keeps the invoice.') },
    { name: t('Supplier — مورّد'), scope: t('External'), note: t('Its own orders and its own catalogue. No customer data, ever.') },
  ]
}

function spine(t: T): readonly { n: string; title: string; body: string }[] {
  return [
    { n: '01', title: t('One contract, both sides'), body: t('A shared package holds the Zod schemas, the permission tables and the business rules. One definition is the API type, the server guard and the form validator at once, so the browser and the server cannot drift into disagreeing about what a job card is.') },
    { n: '02', title: t('The tenant boundary'), body: t('PostgreSQL 16 with row-level security. Every row carries its organisation and its branch, and the database — not a forgotten where clause — decides who may read it.') },
    { n: '03', title: t('The repository seam'), body: t('The interface reads data through one collection seam rather than calling the API directly. A screen does not know whether it is reading fixtures or a live server, which is what makes it testable in the first place.') },
    { n: '04', title: t('The audit row'), body: t('Who changed what, when, from what, to what — for every write, with no exceptions for convenience, and for every refusal too. Money moves as integer halalas and is rounded once, at the total.') },
  ]
}

function duties(t: T): readonly { a: string; b: string; how: string }[] {
  return [
    { a: t('Raise a purchase requisition'), b: t('Approve that same requisition'), how: t('Server-side') },
    { a: t('Carry out the repair'), b: t('Pass its quality check'), how: t('Server-side') },
    { a: t('Create a supplier'), b: t('Approve a payment to it'), how: t('Server-side') },
    { a: t('Post a journal entry'), b: t('Approve that entry'), how: t('Server-side') },
    { a: t('Issue stock from the store'), b: t('Adjust the stock count'), how: t('Server-side') },
    { a: t('Create an employee record'), b: t('Approve the payroll run'), how: t('Server-side') },
  ]
}

export function PublicPlatformArchitecture() {
  const t = useT()
  const { language } = usePreferences()
  const rtl = language === 'ar'
  usePageMeta({
    title: t('Platform Architecture — SALIS AUTO'),
    description: t(
      'Thirteen functional domains, fourteen roles and the four decisions that hold the SALIS AUTO platform together — plus the six pairs of duties the server keeps split.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        eyebrow={t('What it is made of')}
        title={t('Platform Architecture')}
        subtitle={t('Thirteen functional domains on one tenancy, one shared contract package, and a permission model that is a boundary rather than a menu.')}
      />
      <StatBand
        items={[
          { value: '13', label: t('Functional domains') },
          { value: '14', label: t('Operational roles') },
          { value: '28', label: t('Permission modules') },
          { value: '6', label: t('Separated duty pairs') },
        ]}
      />

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Thirteen domains')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('Nothing here is a layer stacked on another. Every domain shares one contract package — the same Zod schemas, permission tables and business rules imported by the server and the browser — so an invoice can post its own journal entry and a part can leave stock costed, with nobody carrying the number between systems by hand.')}
      </p>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {domains(t).map((domain) => (
          <article key={domain.key} className="flex flex-col rounded-2xl border border-default bg-card p-5">
            <span className="mb-3 inline-flex w-fit rounded-[14px] bg-tint-blue p-2.5 text-salis-blue">
              <Icon name={domain.icon} size={20} />
            </span>
            <h3 className="mb-0.5 mt-0 text-[15px] font-bold text-heading">{domain.name}</h3>
            <p dir="rtl" className="mb-2.5 mt-0 text-[13px] text-muted">{domain.arabic}</p>
            <p className="mb-3 mt-0 flex-1 text-[13px] leading-normal text-muted">{domain.blurb}</p>
            <ul className="m-0 flex flex-col gap-1 ps-4 text-[12px] text-body">
              {domain.modules.map((mod) => (
                <li key={mod}>{mod}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Fourteen roles')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('A role is not a menu; it is a boundary. Twenty-eight permission modules, checked on every screen and every write — and each role carries an approval ceiling in riyals, above which it may not commit the workshop to anything. The refusal is logged as carefully as the change.')}
      </p>
      <div className="mb-12 flex flex-col gap-2">
        {roles(t).map((role) => (
          <div key={role.name} className="flex flex-col gap-1 rounded-xl border border-default bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h3 className="m-0 text-sm font-semibold text-heading">{role.name}</h3>
              <p className="m-0 text-[13px] text-muted">{role.note}</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-tint-blue px-2.5 py-1 text-[11px] font-semibold text-salis-blue">
              {role.scope}
            </span>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('The spine')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">{t('Four decisions carry everything above. Remove any one and this is a filing cabinet.')}</p>
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {spine(t).map((step) => (
          <div key={step.n} className="rounded-2xl border border-default bg-card p-5">
            <div dir="ltr" className="mb-1.5 font-mono text-xs font-semibold text-salis-blue">{step.n}</div>
            <h3 className="mb-1.5 mt-0 text-sm font-bold text-heading">{step.title}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{step.body}</p>
          </div>
        ))}
      </div>

      <blockquote className="mb-12 rounded-2xl border-s-4 border-salis-blue bg-card px-6 py-5">
        <p className="m-0 text-[15px] italic leading-relaxed text-heading">
          {t('“The hard part was never the diagnosis. It was that six people wrote the same number into four systems and one of them was wrong by Thursday.”')}
        </p>
        <p className="mb-0 mt-2 text-[13px] text-muted">{t('Design note — the problem the platform was built to end: one number, entered once, carried everywhere.')}</p>
      </blockquote>

      <h2 className="mb-1.5 mt-2 font-display text-xl font-bold text-heading">{t('Separation of duties')}</h2>
      <p className="mb-6 mt-0 text-sm text-muted">
        {t('Six pairs of actions that one person may never hold at both ends. These are not settings a busy branch can switch off on a Thursday; they are enforced by the server, and every attempt is written down.')}
      </p>
      <div className="mb-12 overflow-x-auto rounded-2xl border border-default">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-default bg-sidebar text-start">
              <th className="p-3 text-start font-semibold text-heading">{t('One person may not…')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('…and also')}</th>
              <th className="p-3 text-start font-semibold text-heading">{t('Enforced')}</th>
            </tr>
          </thead>
          <tbody>
            {duties(t).map((pair) => (
              <tr key={pair.a} className="border-b border-default last:border-0">
                <td className="p-3 font-medium text-heading">{pair.a}</td>
                <td className="p-3 text-muted">{pair.b}</td>
                <td className="p-3 text-salis-blue">{pair.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-default pt-8">
        <Link to="/public-portal/supply-chain" className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('See the supply chain')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
        </Link>
        <Link to="/public-portal/compare-plans" className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-heading no-underline hover:bg-card">
          {t('Compare plans')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={14} />
        </Link>
        <Link to="/public-portal/book-demo" className="rounded-lg bg-salis-gradient px-4 py-2 text-sm font-semibold text-white no-underline">
          {t('Book a demo')}
        </Link>
      </div>
    </div>
  )
}
