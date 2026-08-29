import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { SCREENS } from '@/data/generated/screens'
import { SCREENS as WEBSITE_SCREENS } from '@/screens/domains/website'
import { usePageMeta } from '@/screens/public/usePageMeta'

// Vitest runs with `app/` as cwd (jsdom's import.meta.url is not a file URL).
const publicDir = path.resolve(process.cwd(), 'public')
const sitemap = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8')
const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8')

const ROUTE_OF = new Map(SCREENS.map((s) => [s.name, s.route]))
/** The ungated public route set is exactly what the website barrel declares —
 *  every PublicPortal screen in the generated registry plus the top-level legal
 *  pages. Deriving it from the barrel keeps the sitemap honest as pages are
 *  added, rather than hard-coding a count. */
const PUBLIC_ROUTES = Object.keys(WEBSITE_SCREENS).map((name) => {
  const route = ROUTE_OF.get(name)
  if (!route) throw new Error(`${name} is in the website barrel but not the generated registry`)
  return route
})

describe('sitemap.xml', () => {
  it('lists every ungated public route the website barrel declares', () => {
    expect(PUBLIC_ROUTES.length).toBe(Object.keys(WEBSITE_SCREENS).length)
    for (const route of PUBLIC_ROUTES) {
      expect(sitemap).toContain(`<loc>https://salisauto.sa${route}</loc>`)
    }
  })

  it('lists nothing but those public routes — no authenticated URL leaks in', () => {
    const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1])
    const expected = PUBLIC_ROUTES.map((r) => `https://salisauto.sa${r}`).sort()
    expect(locs.sort()).toEqual(expected)
  })
})

describe('robots.txt', () => {
  it('allows the public routes, disallows the rest, and names the sitemap', () => {
    expect(robots).toContain('Allow: /public-portal/')
    // The legal pages sit at top-level paths, so each is allowed explicitly.
    expect(robots).toContain('Allow: /privacy-policy')
    expect(robots).toContain('Allow: /terms-conditions')
    expect(robots).toContain('Allow: /cookie-policy')
    expect(robots).toContain('Disallow: /')
    expect(robots).toContain('Sitemap: https://salisauto.sa/sitemap.xml')
  })
})

describe('usePageMeta', () => {
  function Head({ title, description }: { title: string; description: string }) {
    usePageMeta({ title, description })
    return null
  }

  it('sets the document title and meta description, updating in place', () => {
    const { rerender } = render(<Head title="First — SALIS AUTO" description="first description" />)
    expect(document.title).toBe('First — SALIS AUTO')
    const tag = () => document.head.querySelector('meta[name="description"]')
    expect(tag()?.getAttribute('content')).toBe('first description')

    rerender(<Head title="Second — SALIS AUTO" description="second description" />)
    expect(document.title).toBe('Second — SALIS AUTO')
    expect(tag()?.getAttribute('content')).toBe('second description')
    // One tag, updated — not a new tag per page.
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
  })
})
