import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatusBadge, type StatusKind } from './sections/StatusBadge'

/** PublicPortal.Security — Tier B content page, new for the truth-and-
 *  conversion overhaul (2026-09).
 *
 *  Every control is labelled with what it actually is today — implemented,
 *  in testing, planned, or an enterprise option — never presented as a
 *  finished certification. No ISO 27001 / SOC 2 / PCI DSS claim is made
 *  anywhere on this page because none is evidenced in this repository; see
 *  LEGAL_REVIEW_REQUIRED.md for what would need to change before any such
 *  claim could be added. Controls marked "implemented" are ones this
 *  codebase actually shows: the generated security-headers block
 *  (`scripts/gen-headers.mjs`, checked by `npm run check-headers` and
 *  `e2e/security-headers.spec.ts`), the role/permission matrix (14 roles ×
 *  28 modules, `docs/MASTER_RBAC_MATRIX.md`), and server-side segregation of
 *  duties on approvals (a document's creator cannot approve it themselves). */
interface Control {
  icon: string
  title: string
  description: string
  status: StatusKind
}

const IMPLEMENTED: readonly Control[] = [
  {
    icon: 'ShieldCheck',
    title: 'Transport security',
    description:
      'HTTPS is enforced with HSTS, a strict Content-Security-Policy, X-Frame-Options and Permissions-Policy headers on every response — checked automatically on every change.',
    status: 'live',
  },
  {
    icon: 'Users',
    title: 'Role-based permissions',
    description:
      '14 operational roles across 28 permission modules control who can see and act on what — from a technician’s own bay to full administrative access.',
    status: 'live',
  },
  {
    icon: 'GitBranch',
    title: 'Branch-level access',
    description:
      'A multi-branch workshop group scopes data by branch, so a branch user works with that branch’s job cards, inventory and customers, not the whole organisation’s.',
    status: 'live',
  },
  {
    icon: 'FileCheck',
    title: 'Segregation of duties',
    description:
      'A document’s creator cannot approve it themselves — requisitions, purchase orders and insurance claims are checked against who raised them, enforced on the server, not just hidden in the interface.',
    status: 'live',
  },
]

const IN_TESTING: readonly Control[] = [
  {
    icon: 'History',
    title: 'Audit trail coverage',
    description:
      'Status changes and approvals are recorded against the job-card lifecycle. Extending consistent audit logging across every module is in progress.',
    status: 'testing',
  },
]

const PLANNED: readonly Control[] = [
  {
    icon: 'Lock',
    title: 'Encryption at rest',
    description:
      'We do not yet publish a verified statement on encryption at rest for stored data — this is a required legal/technical review item, not a confirmed control. See LEGAL_REVIEW_REQUIRED.md.',
    status: 'planned',
  },
  {
    icon: 'RefreshCw',
    title: 'Backups and recovery',
    description:
      'A documented backup schedule and recovery-time objective are not yet published for the production environment. Confirmed details will replace this note once available.',
    status: 'planned',
  },
  {
    icon: 'Eye',
    title: 'Vulnerability management',
    description:
      'A formal, published vulnerability-disclosure and patch-management process is not yet in place. Automated dependency and header checks run today; a full program is planned.',
    status: 'planned',
  },
  {
    icon: 'ShieldAlert',
    title: 'Incident response',
    description:
      'A documented incident-response process with defined notification timelines is not yet published. Treat this as an open item until confirmed.',
    status: 'planned',
  },
  {
    icon: 'Database',
    title: 'Data retention schedule',
    description:
      'Retention periods per data category — beyond the tax-record minimums described in our Privacy Policy — are being finalised.',
    status: 'planned',
  },
]

const ENTERPRISE: readonly Control[] = [
  {
    icon: 'KeyRound',
    title: 'Single sign-on and custom auth policies',
    description:
      'Enterprise agreements can scope organisation-specific authentication requirements as part of implementation.',
    status: 'enterprise',
  },
  {
    icon: 'Network',
    title: 'Dedicated environment and integration review',
    description:
      'Multi-branch groups and fleets with custom integrations can request a dedicated security review as part of onboarding.',
    status: 'enterprise',
  },
  {
    icon: 'Boxes',
    title: 'Data export and offboarding',
    description:
      'Structured data export is available as part of enterprise implementation and offboarding — talk to sales about the format and scope your organisation needs.',
    status: 'enterprise',
  },
]

function ControlGroup({ heading, items }: { heading: string; items: readonly Control[] }) {
  const t = useT()
  return (
    <section className="mb-10">
      <h2 className="mb-4 mt-0 text-xl font-bold text-heading">{t(heading)}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className="flex flex-col gap-2 rounded-2xl border border-default bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex rounded-[14px] bg-tint-blue p-2.5 text-salis-blue">
                <Icon name={item.icon} size={20} />
              </span>
              <StatusBadge status={item.status} />
            </div>
            <h3 className="m-0 text-[15px] font-bold text-heading">{t(item.title)}</h3>
            <p className="m-0 text-[13px] leading-normal text-muted">{t(item.description)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function PublicSecurity() {
  const t = useT()
  usePageMeta({
    title: t('Security & Data — SALIS AUTO'),
    description: t(
      'What SALIS AUTO implements today, what is in testing, and what is planned — role-based permissions, branch-level access and transport security, honestly labelled.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        eyebrow="Security & data"
        title="Security & Data"
        subtitle="What is implemented today, what is in testing, and what is planned — no certification is claimed unless it is evidenced"
      />

      <ControlGroup heading="Implemented today" items={IMPLEMENTED} />
      <ControlGroup heading="In testing" items={IN_TESTING} />
      <ControlGroup heading="Planned" items={PLANNED} />
      <ControlGroup heading="Enterprise options" items={ENTERPRISE} />

      <div className="rounded-2xl border border-default bg-surface p-6 text-center">
        <p className="m-0 mb-4 text-sm text-muted">
          {t(
            'Have a specific security or compliance question for your organisation? Our sales team can walk through implementation details with your IT or compliance stakeholders.'
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/public-portal/request-demo"
            className="inline-flex h-11 items-center rounded-lg bg-salis-gradient px-5 font-action text-sm font-semibold text-white no-underline hover:no-underline"
          >
            {t('Request a Demo')}
          </Link>
          <Link
            to="/public-portal/contact"
            className="inline-flex h-11 items-center rounded-lg border border-default bg-card px-5 font-action text-sm font-semibold text-heading no-underline hover:no-underline"
          >
            {t('Talk to Sales')}
          </Link>
        </div>
      </div>
    </div>
  )
}
