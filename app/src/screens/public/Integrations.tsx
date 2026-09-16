import { useT } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatusBadge, type StatusKind } from './sections/StatusBadge'

/** PublicPortal.Integrations — Integrations product page, rewritten for the
 *  truth-and-conversion overhaul (2026-09).
 *
 *  Every entry carries an honest status, checked against this repository
 *  rather than asserted:
 *  - ZATCA: `server/src/routes/invoices.ts`, `finance-reports.ts` and
 *    `db/schema.ts` implement ZATCA-compliant invoice generation (UBL
 *    structure, hash chain, digital signature). No live connection to
 *    ZATCA's own government clearance API is evidenced in this codebase, so
 *    this is "in testing", not "live".
 *  - Mada / HyperPay / Unifonic / email: `server/src/auth/otp.ts` states
 *    directly — "There is no SMS or email provider configured in any
 *    environment this has run in" — and no payment-gateway adapter exists
 *    either. These are "planned": Mada is modelled as a payment method in
 *    the data layer (`packages/contract/src/entities/payment.ts`), not a
 *    wired gateway.
 *  - OBD-II: `server/src/integrations/config.ts` is explicit — the default
 *    transport is `unconfigured`, a `mock` transport exists for development
 *    only, and "there is deliberately no `live` value: a live bridge needs
 *    an adapter this repo does not ship." That is "in testing".
 *  - Bosch, Denso, Continental, Shell Lubricants: approved business
 *    relationships (owner decision), named as recognised brands in the
 *    parts/supplier catalogue — not API integrations. Labelled "ecosystem
 *    relationship" so the difference is never implied away.
 *
 *  See LEGAL_REVIEW_REQUIRED.md for what would need to change before any of
 *  the "planned"/"in testing" items could move to "live". */
interface IntegrationItem {
  icon: string
  title: string
  description: string
  status: StatusKind
}

interface Category {
  heading: string
  items: readonly IntegrationItem[]
}

const CATEGORIES: readonly Category[] = [
  {
    heading: 'Government and compliance',
    items: [
      {
        icon: 'Landmark',
        title: 'ZATCA e-invoicing',
        description:
          'ZATCA-compliant invoice generation — structured UBL format, hash chain and digital signature — is implemented. A live connection to ZATCA’s own government clearance API is not yet confirmed in this environment.',
        status: 'testing',
      },
    ],
  },
  {
    heading: 'Payments',
    items: [
      {
        icon: 'CreditCard',
        title: 'Mada',
        description:
          'Mada is modelled as a recognised payment method in the platform’s data layer. A live connection to a Mada-accepting payment gateway is not yet wired in this environment.',
        status: 'planned',
      },
      {
        icon: 'Banknote',
        title: 'HyperPay',
        description:
          'HyperPay is an approved payment-gateway relationship for processing card and wallet payments. Live gateway wiring is planned, not yet connected.',
        status: 'planned',
      },
    ],
  },
  {
    heading: 'Communications',
    items: [
      {
        icon: 'MessageSquare',
        title: 'Unifonic',
        description:
          'Unifonic is the approved SMS/WhatsApp relationship for appointment reminders and one-time codes. A configuration screen exists in the product; no SMS provider is connected in any environment today.',
        status: 'planned',
      },
      {
        icon: 'Mail',
        title: 'Transactional email',
        description:
          'Email delivery for invoices, receipts and one-time codes is designed into the platform’s notification system. No email provider is configured in any environment today.',
        status: 'planned',
      },
    ],
  },
  {
    heading: 'Automotive and diagnostics',
    items: [
      {
        icon: 'ScanBarcode',
        title: 'OBD-II diagnostics & barcode scanning',
        description:
          'A development-only mock transport exists for OBD-II scan-tool data. There is deliberately no live bridge shipped in this repository — a connected scan tool in a bay is a planned capability, not a current one.',
        status: 'testing',
      },
    ],
  },
  {
    heading: 'Parts and suppliers',
    items: [
      {
        icon: 'Wrench',
        title: 'Bosch',
        description:
          'Bosch is a recognised parts and diagnostics brand within the platform’s supplier and inventory catalogue — a business relationship, not a live vendor API integration.',
        status: 'relationship',
      },
      {
        icon: 'Wrench',
        title: 'Denso',
        description:
          'Denso is a recognised parts brand within the platform’s supplier and inventory catalogue — a business relationship, not a live vendor API integration.',
        status: 'relationship',
      },
      {
        icon: 'Wrench',
        title: 'Continental',
        description:
          'Continental is a recognised parts brand (tyres, components) within the platform’s supplier and inventory catalogue — a business relationship, not a live vendor API integration.',
        status: 'relationship',
      },
      {
        icon: 'Wind',
        title: 'Shell Lubricants',
        description:
          'Shell Lubricants is a recognised product line within the platform’s parts and service catalogue — a business relationship, not a live vendor API integration.',
        status: 'relationship',
      },
    ],
  },
  {
    heading: 'Accounting',
    items: [
      {
        icon: 'Calculator',
        title: 'Accounting software exports',
        description:
          'The platform includes its own native accounting module (chart of accounts, posting, financial reports). Export to third-party accounting software is planned and not yet available.',
        status: 'planned',
      },
    ],
  },
  {
    heading: 'Maps and logistics',
    items: [
      {
        icon: 'Map',
        title: 'Maps and routing',
        description:
          'Location services for fleet tracking and customer directions are planned and not yet connected to a live mapping provider.',
        status: 'planned',
      },
    ],
  },
  {
    heading: 'APIs and webhooks',
    items: [
      {
        icon: 'Network',
        title: 'Custom API and webhook access',
        description:
          'Enterprise agreements can scope custom API access and webhooks as part of implementation — talk to sales about your integration requirements.',
        status: 'custom',
      },
    ],
  },
]

export function PublicIntegrations() {
  const t = useT()
  usePageMeta({
    title: t('Integrations — SALIS AUTO'),
    description: t(
      'What SALIS AUTO connects to today, what is in testing, and what is planned — including the ZATCA, Mada, HyperPay, Unifonic, Bosch, Denso, Continental and Shell Lubricants relationships, honestly labelled.'
    ),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Integrations"
        subtitle="What SALIS AUTO connects to today, what is in testing, and what is planned — a named business relationship is never presented as a live technical integration"
      />
      <div className="flex flex-col gap-10">
        {CATEGORIES.map((category) => (
          <section key={category.heading}>
            <h2 className="mb-4 mt-0 text-lg font-bold text-heading">{t(category.heading)}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {category.items.map((item) => (
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
                  <p className="m-0 text-[13px] leading-normal text-muted">
                    {t(item.description)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
