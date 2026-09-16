import { useT } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePageMeta } from './usePageMeta'
import { LegalDocument, type LegalClause } from './sections/LegalDocument'

/** PrivacyPolicy — Tier C content/SEO page (§A26).
 *
 *  Design-system page: there is no `PrivacyPolicy.dc.html` in the handoff, so
 *  this is built from the approved public section system and is **not**
 *  design-authoritative (§A25). Structured against the Saudi Personal Data
 *  Protection Law (PDPL): consent, collection, processing purposes, retention,
 *  security, data-subject rights, cookies, processors and cross-border
 *  transfer are each their own clause. Open items that need the operating
 *  legal entity's own input (registered entity name, DPO contact, confirmed
 *  hosting region) are tracked in `LEGAL_REVIEW_REQUIRED.md` at the repo root,
 *  not surfaced on this public page. Rendered `ungated` in `PublicShell`, so a
 *  signed-out visitor reads it. */
const CLAUSES: readonly LegalClause[] = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you contact us or request a demo through this site, we collect the details you provide — such as your name, work email, phone number, company name and message — so that we can respond to your enquiry.',
      'When your workshop uses the platform, we process the operational data it enters — vehicles, job cards, estimates, invoices and customer records — on its behalf and under its instructions.',
      'We collect basic technical information automatically, such as device type, browser and pages viewed, to keep the service secure and to understand how it is used.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'We use the information to provide and improve the service, respond to enquiries, secure our systems, and meet our legal and regulatory obligations in the Kingdom of Saudi Arabia — including ZATCA e-invoicing requirements where applicable to a workshop’s own invoicing.',
      'We do not sell personal information. We collect only what each purpose above requires and keep it no longer than necessary for that purpose.',
    ],
  },
  {
    heading: 'Legal basis and consent',
    paragraphs: [
      'We process personal data where you have given consent, where it is necessary to perform a contract with you or your workshop, or where we have a legitimate interest that does not override your rights and freedoms.',
      'Where a form on this site asks for consent — for example, before submitting a demo request — that consent is never pre-selected; you actively opt in. You may withdraw consent at any time by contacting us, without affecting processing already carried out.',
    ],
  },
  {
    heading: 'Sharing, processors and disclosure',
    paragraphs: [
      'We share data with service providers who help us operate the platform — such as hosting, payment processing and messaging providers — under agreements that require them to protect it and process it only on our instructions.',
      'We may disclose information where required by Saudi law or a competent authority, or to protect the rights, property or safety of our users, workshops or the public.',
    ],
  },
  {
    heading: 'International data transfers',
    paragraphs: [
      'Where a service provider we use processes data outside the Kingdom of Saudi Arabia, we take steps consistent with PDPL requirements for cross-border transfer, including assessing the safeguards the receiving party applies before any such transfer takes place.',
      'The specific hosting regions and sub-processors involved are a required legal-review item — see LEGAL_REVIEW_REQUIRED.md — and this clause will be updated with confirmed details once that review is complete.',
    ],
  },
  {
    heading: 'Data retention and security',
    paragraphs: [
      'We keep personal data only as long as needed for the purpose it was collected for, or as required by law — for example, invoicing and tax records are retained for the period Saudi tax regulation requires — and delete or anonymise it afterward.',
      'We apply organisational and technical measures — including access controls, role-based permissions, encryption in transit and audit logging — to protect data against unauthorised access, loss or misuse.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Subject to the Saudi PDPL and its implementing regulations, you may request access to the personal data we hold about you, ask us to correct or delete it, request its transfer, withdraw consent, or object to certain processing.',
      'To exercise any of these rights, use our Contact page. We will confirm receipt and respond within the period the law requires.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as the platform develops, as our processing activities change, or as the law changes. We will post the revised version here with an updated effective date and version number; material changes will be communicated where appropriate.',
    ],
  },
]

export function PublicPrivacyPolicy() {
  const t = useT()
  const isMobile = useIsMobile()
  usePageMeta({
    title: t('Privacy Policy — SALIS AUTO'),
    description: t(
      'How SALIS AUTO collects, uses, shares and protects personal information across our platform and public website, aligned with the Saudi PDPL.'
    ),
  })

  return (
    <div className={isMobile ? 'px-1' : ''}>
      <LegalDocument
        title="Privacy Policy"
        updated="16 September 2026"
        version="1.1"
        intro="This Privacy Policy explains how SALIS AUTO handles personal information when you visit our website, contact us, or use our workshop management platform, and how it aligns with the Saudi Personal Data Protection Law (PDPL)."
        clauses={CLAUSES}
      />
    </div>
  )
}
