import { useEffect, useRef, useState } from 'react'
import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { useLandingMotion } from './landing/useLandingMotion'
import { PageNav } from './landing/PageNav'
import { IndexPage } from './landing/pages/IndexPage'
import { SystemPage } from './landing/pages/SystemPage'
import { GridPage } from './landing/pages/GridPage'
import { AccessPage } from './landing/pages/AccessPage'
import { OriginPage } from './landing/pages/OriginPage'
import { ChannelPage } from './landing/pages/ChannelPage'
import { isPageKey, type PageKey } from './landing/types'
import './landing/landing.css'

/** PublicPortal.Landing — a six-page tour of SALIS AUTO (Arrival / System /
 *  Grid / Access / Origin / Channel), styled as a dark, futuristic HUD
 *  concept page. It began as a full port of a speculative "SALIS AUTO 2060"
 *  design artifact whose content was entirely invented fiction; that content
 *  has since been replaced end to end with the real product's own facts —
 *  the same domains, roles, lifecycle stages, proof figures, pricing plans
 *  and FAQ the rest of the public site states in plain language. Only the
 *  roadmap section (`#roadmap` on Arrival) still looks forward, and every
 *  entry on it past 2025 is labelled a vision or an in-progress feature, not
 *  a claim — the same honesty rule the rest of the page follows throughout.
 *
 *  The artifact this page's shell is drawn from was a standalone six-document
 *  site with its own header, nav, language toggle, skip link and boot
 *  sequence. All of that is dropped — PublicShell already supplies the
 *  site's real header, footer, nav and language toggle. What is kept is the
 *  six pages' visual identity and structure, plus a lightweight in-page tab
 *  nav (`PageNav`) for moving between them, since PublicShell's own nav does
 *  not know about pages that live inside one screen.
 *
 *  One route (`/public-portal/landing`), six pages as React state rather
 *  than six routes, so exactly one page's markup is ever mounted — which is
 *  what keeps this screen down to one `<h1>` and one clean heading
 *  hierarchy, same as every other Tier A public page (`tests/public-pages
 *  .test.tsx` checks for both on every one of them). The active page is
 *  mirrored to `location.hash` (`#index`, `#system`, `#grid`, `#access`,
 *  `#origin`, `#channel`) with `history.replaceState`, not a navigation, so
 *  back/forward and shared links work without adding six entries to the
 *  browser history for one visit.
 *
 *  The artifact's three WebGL scenes (a hand-rolled 3D hovercar, animated
 *  dispatch arcs, a supply-mesh flow) are not ported — see the doc comment
 *  at the top of `landing/landing.css`. Every CTA on every page is a real
 *  destination: an in-page scroll, an in-page page switch, or a `<Link>` to
 *  a route that already exists (book a demo, real pricing, real contact,
 *  the real portals, the real careers and blog pages).
 *
 *  `IndexPage`'s bay-board mock also carries `<CornerBrackets>`, the same
 *  instrument-panel corner accent other public pages borrowed from this
 *  design study — see `sections/CornerBrackets.tsx`. */

const PANEL_ID = 'salis-landing-panel'

function pageFromHash(): PageKey {
  const hash = window.location.hash.replace(/^#/, '')
  return isPageKey(hash) ? hash : 'index'
}

export function PublicLanding() {
  const t = useT()
  const root = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState<PageKey>(() => pageFromHash())
  useLandingMotion(root, [page])

  // Deep-linkable via hash: a direct load or a paste of `#system` etc. opens
  // straight to that page, and switching pages updates the hash in place
  // (no new history entry) so the browser's back button still means "leave
  // this screen", not "walk backward through the six pages".
  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function selectPage(next: PageKey): void {
    setPage(next)
    const url = `${window.location.pathname}${window.location.search}#${next}`
    window.history.replaceState(null, '', url)
    document.getElementById(PANEL_ID)?.scrollIntoView?.({ block: 'start' })
  }

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
    <div className="salis-landing" ref={root} id={PANEL_ID}>
      <PageNav page={page} onSelect={selectPage} t={t} />
      {page === 'index' ? <IndexPage t={t} /> : null}
      {page === 'system' ? <SystemPage t={t} /> : null}
      {page === 'grid' ? <GridPage t={t} /> : null}
      {page === 'access' ? <AccessPage t={t} /> : null}
      {page === 'origin' ? <OriginPage t={t} /> : null}
      {page === 'channel' ? <ChannelPage t={t} /> : null}
    </div>
  )
}
