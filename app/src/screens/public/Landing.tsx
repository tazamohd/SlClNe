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
 *  Grid / Access / Origin / Channel), styled as a dark, futuristic HUD. It is
 *  a faithful port of the "SALIS AUTO 2030" design artifact: that artifact's
 *  own six pages, section for section, with its own copy — the six-stage job
 *  card and its two gates, the thirteen domains in English and Arabic, the
 *  fourteen roles and their approval ceilings, the six separated duty pairs,
 *  the parts flow from requisition to issue, the six portal doors, the three
 *  plans and the comparison matrix, the principles and dispatches, and the
 *  ways to reach a person.
 *
 *  Every figure on a "live" panel — the bay board, the meters, the throughput
 *  bars, the activity and store-floor streams, the order stream, the branch
 *  roll-call, the invoice — is the artifact's own sample data, and is labelled
 *  as sample data wherever it is shown, exactly as the artifact labels it. The
 *  artifact re-rolls those figures from a seeded RNG on a timer; here they are
 *  frozen at one representative reading, because a number that moves on its
 *  own reads as live telemetry and there is no tenant behind this page.
 *
 *  The artifact was a standalone six-document site with its own header, nav,
 *  language toggle, skip link and boot sequence. All of that is dropped —
 *  PublicShell already supplies the site's real header, footer, nav and
 *  language toggle. What is kept is the six pages' visual identity and
 *  structure, plus a lightweight in-page tab nav (`PageNav`) for moving
 *  between them, since PublicShell's own nav does not know about pages that
 *  live inside one screen.
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
 *  The artifact's canvas/WebGL scenes (a hand-rolled 3D service vehicle, the
 *  branch map with animated transfer arcs, the supply-mesh flow, the spinning
 *  diagnostic orb, the carrier signal) are reimplemented as static SVG drawn
 *  at rest — see the doc comment at the top of `landing/landing.css`. Two
 *  content departures, both for the same reason: the artifact's six portal
 *  doors become three real `<Link>`s and three informational tiles, because
 *  only customer, technician and supplier have a public route; and the
 *  Channel page's deliberately-local contact form is dropped, because a form
 *  that reads your text back and throws it away is honest inside a design
 *  document and a dead end inside the real application. Every remaining CTA
 *  is a real destination: an in-page scroll, an in-page page switch, or a
 *  `<Link>` to a route that already exists.
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
  useLandingMotion(root)

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
