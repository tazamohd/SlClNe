import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { useRevealMotion } from './landing/useRevealMotion'
import { Hero } from './landing/homepage/Hero'
import { ProofBand } from './landing/homepage/ProofBand'
import { ProductMockups } from './landing/homepage/ProductMockups'
import { ReleaseTimeline } from './landing/homepage/ReleaseTimeline'
import './landing/homepage.css'

/** PublicPortal.Landing — the homepage, redesigned onto a restrained,
 *  light-first enterprise-SaaS visual system (Stripe/Linear/Vercel
 *  register) in place of the previous "SALIS AUTO 2030" HUD tour.
 *
 *  That tour — a faithful, section-for-section port of a separate dark
 *  sci-fi design artifact (`app/public/2030/`) with its own canvas/WebGL
 *  scenes already downgraded to static SVG when ported — read as flashy
 *  HUD chrome rather than the clean, data-forward register the product
 *  owner asked for, and never followed the app's own light/dark toggle.
 *  Its content was strong and honest; only the skin was wrong. This
 *  rewrite keeps that discipline (every figure on a mockup panel is
 *  labelled as sample data, exactly as the tour's own panels were) and
 *  re-presents it as a single-scroll homepage: an outcome-first hero, a
 *  credibility section built from real structural facts, three labelled
 *  product-UI mockups, and a real version-numbered release timeline.
 *
 *  The tour's six pages (`landing/pages/{System,Grid,Access,Origin,
 *  Channel}Page.tsx`, plus `PageNav`/`CommandDeck`) are left in the
 *  codebase untouched and unlinked from here — by the product owner's
 *  explicit decision, remapping that content onto redesigned pages is a
 *  later cascade-phase task, not part of this homepage rewrite. This
 *  screen introduces no new route/screen name, so the registry's
 *  three-place routing registration does not apply here.
 *
 *  Still exactly one `<h1>` (in `Hero`) and a clean heading hierarchy —
 *  the same constraint `tests/public-pages.test.tsx` enforces on every
 *  Tier A public page. */
export function PublicLanding() {
  const t = useT()
  const root = useRef<HTMLDivElement>(null)
  useRevealMotion(root)

  usePageMeta({
    title: t('SALIS AUTO — Workshop Management, Saudi Standard'),
    description: t('One platform runs the workshop from check-in to invoice, in Arabic and English, with ZATCA e-invoicing built in and one audit trail.'),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SALIS AUTO',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: ['ar', 'en'],
      description:
        'Workshop management platform for Saudi automotive workshops: ZATCA Phase 2 e-invoicing, Arabic and English, one audit trail.',
      areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
      publisher: {
        '@type': 'Organization',
        name: 'SALIS AUTO',
        email: 'info@salisauto.sa',
        address: { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
      },
    },
  })

  return (
    <div className="salis-home" ref={root}>
      <Hero t={t} />
      <ProofBand t={t} />
      <ProductMockups t={t} />
      <ReleaseTimeline t={t} />

      <section className="mx-auto max-w-[900px] px-5 py-14 text-center md:px-10 md:py-20">
        <h2 className="mb-3 font-display text-2xl font-black text-heading md:text-3xl">
          {t('Talk to sales, not a script')}
        </h2>
        <p className="mx-auto mb-6 max-w-[52ch] text-sm text-muted">
          {t('Every plan is configured to your workshop — modules, branches, users and integrations. A specialist scopes it with you before any commitment.')}
        </p>
        <Link
          to="/public-portal/request-demo"
          className="inline-flex h-11 items-center rounded-lg bg-salis-gradient px-7 text-sm font-semibold text-white no-underline hover:no-underline"
        >
          {t('Request a Demo')}
        </Link>
      </section>
    </div>
  )
}
