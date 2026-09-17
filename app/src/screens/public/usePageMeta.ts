import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Per-page `<title>`, meta description, canonical URL, Open Graph/Twitter
 *  tags, and optional JSON-LD structured data for the public marketing pages.
 *
 *  There is no head-manager dependency in this repository and the orchestrator
 *  serialises package.json, so this is the no-dependency version: a small
 *  effect that owns a fixed set of head tags plus an optional ld+json script.
 *
 *  The description tag is created on first use and reused after; the app's
 *  index.html does not ship one, so nothing is fought over.
 *
 *  No `hreflang` alternates are emitted. This is a single-URL SPA where
 *  language is a client-side preference (`PreferencesProvider`), not a
 *  routed `/en/`/`/ar/` path — there is no second URL to point `hreflang` at.
 *  Advertising one would assert a URL structure that does not exist. See
 *  LEGAL_REVIEW_REQUIRED.md for the same caveat on the canonical origin
 *  below, which is provisional until a production domain is confirmed. */
export interface PageMeta {
  title: string
  description: string
  structuredData?: Record<string, unknown>
}

const LD_ID = 'salis-ld-json'
/** Matches the provisional origin already used by `public/sitemap.xml` and
 *  `public/robots.txt` — one canonical origin, not invented fresh here. */
const SITE_ORIGIN = 'https://salisauto.sa'

function setMeta(selector: string, build: () => HTMLElement, set: (el: Element) => void): void {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = build()
    document.head.appendChild(tag)
  }
  set(tag)
}

export function usePageMeta({ title, description, structuredData }: PageMeta): void {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title

    setMeta(
      'meta[name="description"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('name', 'description')
        return el
      },
      (el) => el.setAttribute('content', description)
    )

    setMeta(
      'meta[property="og:title"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:title')
        return el
      },
      (el) => el.setAttribute('content', title)
    )
    setMeta(
      'meta[property="og:description"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:description')
        return el
      },
      (el) => el.setAttribute('content', description)
    )
    setMeta(
      'meta[name="twitter:title"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('name', 'twitter:title')
        return el
      },
      (el) => el.setAttribute('content', title)
    )
    setMeta(
      'meta[name="twitter:description"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('name', 'twitter:description')
        return el
      },
      (el) => el.setAttribute('content', description)
    )
  }, [title, description])

  useEffect(() => {
    const canonicalUrl = `${SITE_ORIGIN}${pathname}`
    setMeta(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link')
        el.setAttribute('rel', 'canonical')
        return el
      },
      (el) => el.setAttribute('href', canonicalUrl)
    )
    setMeta(
      'meta[property="og:url"]',
      () => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:url')
        return el
      },
      (el) => el.setAttribute('content', canonicalUrl)
    )
  }, [pathname])

  useEffect(() => {
    let script = document.getElementById(LD_ID) as HTMLScriptElement | null
    if (structuredData) {
      if (!script) {
        script = document.createElement('script')
        script.id = LD_ID
        script.setAttribute('type', 'application/ld+json')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(structuredData)
    } else if (script) {
      script.remove()
    }
    return () => {
      document.getElementById(LD_ID)?.remove()
    }
  }, [structuredData])
}
