import { useT } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePageMeta } from './usePageMeta'
import { LegalDocument, type LegalClause } from './sections/LegalDocument'

/** PrivacyPolicy — Tier C content/SEO page (§A26).
 *
 *  Design-system page: there is no `PrivacyPolicy.dc.html` in the handoff, so
 *  this is built from the approved public section system and is **not**
 *  design-authoritative (§A25). The body is a plain legal scaffold, clearly
 *  marked a template that has not been reviewed by counsel — see the banner in
 *  `LegalDocument`. Rendered `ungated` in `PublicShell`, so a signed-out
 *  visitor reads it. */
const CLAUSES: readonly LegalClause[] = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you contact us through this site, we collect the details you provide — your name, email address, phone number and message — so that we can respond to your enquiry.',
      'When you use the platform, we process the operational data your workshop enters, such as vehicles, job cards, invoices and customer records, on your behalf and under your instructions.',
      'We collect basic technical information automatically, such as your device type and pages viewed, to keep the service secure and to understand how it is used.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'We use the information to provide and improve the service, to respond to your requests, to secure our systems, and to meet our legal and regulatory obligations in the Kingdom of Saudi Arabia.',
      'We do not sell your personal information. We collect only what we need for the purposes described here and keep it no longer than necessary.',
    ],
  },
  {
    heading: 'Legal basis and consent',
    paragraphs: [
      'We process personal data where you have given consent, where it is necessary to perform a contract with you, or where we have a legitimate interest that does not override your rights.',
      'Where consent is the basis, you may withdraw it at any time without affecting processing that has already taken place.',
    ],
  },
  {
    heading: 'Sharing and disclosure',
    paragraphs: [
      'We share data with service providers who help us operate the platform, under agreements that require them to protect it and use it only on our instructions.',
      'We may disclose information where required by law or by a competent authority, or to protect the rights and safety of our users and the public.',
    ],
  },
  {
    heading: 'Data retention and security',
    paragraphs: [
      'We keep personal data only as long as needed for the purposes set out here or as required by law, and then delete or anonymise it.',
      'We apply organisational and technical measures — including access controls, encryption in transit and audit logging — to protect data against unauthorised access, loss or misuse.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Subject to applicable law, you may request access to the personal data we hold about you, ask us to correct or delete it, or object to certain processing.',
      'To exercise any of these rights, contact us using the details on our Contact page and we will respond within the period required by law.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as the platform develops or as the law changes. We will post the revised version here and update the date above; significant changes will be communicated where appropriate.',
    ],
  },
]

export function PublicPrivacyPolicy() {
  const t = useT()
  const isMobile = useIsMobile()
  usePageMeta({
    title: t('Privacy Policy — SALIS AUTO'),
    description: t(
      'How SALIS AUTO collects, uses, shares and protects personal information across our platform and public website.'
    ),
  })

  return (
    <div className={isMobile ? 'px-1' : ''}>
      <LegalDocument
        title="Privacy Policy"
        updated="16 August 2026"
        intro="This Privacy Policy explains how SALIS AUTO handles personal information when you visit our website, contact us, or use our workshop management platform. We are committed to protecting your privacy and handling your data responsibly."
        clauses={CLAUSES}
      />
    </div>
  )
}
