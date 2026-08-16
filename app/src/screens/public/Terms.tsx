import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { LegalDocument, type LegalClause } from './sections/LegalDocument'

/** TermsConditions — Tier C content/SEO page (§A26).
 *
 *  Design-system page: no `TermsConditions.dc.html` exists in the handoff, so
 *  this is composed from the approved public section system and is **not**
 *  design-authoritative (§A25). A plain legal scaffold, clearly marked a
 *  template not reviewed by counsel. Rendered `ungated` in `PublicShell` so a
 *  signed-out visitor can read it before creating an account. */
const CLAUSES: readonly LegalClause[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By accessing or using the SALIS AUTO website or platform, you agree to these Terms & Conditions. If you are using the service on behalf of an organisation, you confirm that you are authorised to bind that organisation to these terms.',
      'If you do not agree with these terms, please do not use the service.',
    ],
  },
  {
    heading: 'The service',
    paragraphs: [
      'SALIS AUTO provides a workshop management platform for automotive businesses in the Kingdom of Saudi Arabia, together with related public information on this website.',
      'We may add, change or remove features as the platform develops. We aim to give reasonable notice of material changes that affect how you use the service.',
    ],
  },
  {
    heading: 'Accounts and access',
    paragraphs: [
      'You are responsible for keeping your account credentials confidential and for all activity that takes place under your account.',
      'You agree to provide accurate information and to keep it up to date, and to notify us promptly of any unauthorised use of your account.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'You agree to use the service only for lawful purposes and in line with these terms. You must not attempt to disrupt the service, gain unauthorised access to it, or use it to store or transmit unlawful content.',
      'You are responsible for the data your organisation enters and for ensuring you have the right to process it.',
    ],
  },
  {
    heading: 'Fees and payment',
    paragraphs: [
      'Where the service is provided under a paid plan, the applicable fees, billing cycle and payment terms will be set out in your order or subscription agreement.',
      'Unless stated otherwise, fees are exclusive of value-added tax, which will be applied where required by law.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'The platform, its software and its content are owned by SALIS AUTO or its licensors and are protected by law. These terms grant you a limited right to use the service, not to own it.',
      'You retain ownership of the data you enter; you grant us the permissions we need to host and process it in order to provide the service.',
    ],
  },
  {
    heading: 'Disclaimers and liability',
    paragraphs: [
      'The service is provided on an "as is" and "as available" basis. To the extent permitted by law, we make no warranties beyond those we expressly state.',
      'To the extent permitted by law, our liability arising out of or in connection with the service is limited, and we are not liable for indirect or consequential losses.',
    ],
  },
  {
    heading: 'Governing law and changes',
    paragraphs: [
      'These terms are governed by the laws of the Kingdom of Saudi Arabia, and any dispute is subject to the jurisdiction of its competent courts.',
      'We may update these terms as the platform develops or the law changes. We will post the revised version here and update the date above; continued use after a change means you accept the updated terms.',
    ],
  },
]

export function PublicTerms() {
  const t = useT()
  usePageMeta({
    title: t('Terms & Conditions — SALIS AUTO'),
    description: t(
      'The terms that govern your use of the SALIS AUTO website and workshop management platform.'
    ),
  })

  return (
    <LegalDocument
      title="Terms & Conditions"
      updated="16 August 2026"
      intro="These Terms & Conditions govern your access to and use of the SALIS AUTO website and platform. Please read them carefully before using the service."
      clauses={CLAUSES}
    />
  )
}
