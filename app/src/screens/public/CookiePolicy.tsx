import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { LegalDocument, type LegalClause } from './sections/LegalDocument'

/** PublicPortal.CookiePolicy — Tier C legal page.
 *
 *  Uses the shared LegalDocument scaffold, matching Privacy Policy and Terms.
 *  A plain-language template, clearly marked as not reviewed by counsel. */
const CLAUSES: readonly LegalClause[] = [
  {
    heading: 'What are cookies',
    paragraphs: [
      'Cookies are small text files that a website places on your device when you visit. They help the site remember your preferences and understand how you use it.',
      'Some cookies are removed when you close your browser (session cookies); others remain until they expire or you delete them (persistent cookies).',
    ],
  },
  {
    heading: 'Cookies we use',
    paragraphs: [
      'Essential cookies: these are required for the platform to function. They handle authentication, security tokens and session state. You cannot opt out of essential cookies while using the service.',
      'Analytics cookies: these help us understand how visitors interact with the site — which pages are visited most, how long sessions last and where errors occur. The data is aggregated and does not identify you personally.',
      'Preference cookies: these remember your choices, such as language, theme and display settings, so the platform can present them consistently across visits.',
    ],
  },
  {
    heading: 'Managing cookies',
    paragraphs: [
      'Most browsers allow you to view, manage and delete cookies through their settings. You can configure your browser to refuse all cookies or to alert you when a cookie is being set.',
      'If you disable essential cookies, some parts of the platform may not function correctly. Disabling analytics or preference cookies will not prevent you from using the service, but may reduce the quality of your experience.',
    ],
  },
  {
    heading: 'Third-party cookies',
    paragraphs: [
      'We may use third-party services that set their own cookies — for example, analytics providers. These cookies are governed by the respective third party privacy policies, not this Cookie Policy.',
      'We do not allow third-party advertising cookies on the SALIS AUTO platform.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'If you have questions about how we use cookies, please reach out through the Contact page on this website or email us at info@salisauto.sa.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this Cookie Policy as we introduce new features or as regulations evolve. We will post the revised version here and update the date above.',
    ],
  },
]

export function PublicCookiePolicy() {
  const t = useT()
  usePageMeta({
    title: t('Cookie Policy — SALIS AUTO'),
    description: t(
      'How SALIS AUTO uses cookies to operate the platform and improve your experience'
    ),
  })

  return (
    <LegalDocument
      title="Cookie Policy"
      updated="2026-08-16"
      intro="This Cookie Policy explains how SALIS AUTO uses cookies and similar technologies when you visit our website or use our platform. It covers what cookies are, which ones we use, and how you can manage them."
      clauses={CLAUSES}
    />
  )
}
