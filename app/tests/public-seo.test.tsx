import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { SCREENS } from '@/data/generated/screens'
import { usePageMeta } from '@/screens/public/usePageMeta'

// Vitest runs with `app/` as cwd (jsdom's import.meta.url is not a file URL).
const publicDir = path.resolve(process.cwd(), 'public')
const sitemap = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8')
const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8')

const PUBLIC_ROUTES = SCREENS.filter((s) => s.name.startsWith('PublicPortal.')).map(
  (s) => s.route
)

describe('sitemap.xml', () => {
  it('lists every PublicPortal route the registry knows', () => {
    expect(PUBLIC_ROUTES).toHaveLength(10)
    for (const route of PUBLIC_ROUTES) {
      expect(sitemap).toContain(`<loc>https://salisauto.sa${route}</loc>`)
    }
  })

  it('lists nothing but PublicPortal routes — no authenticated URL leaks in', () => {
    const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1])
    expect(locs).toHaveLength(10)
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/salisauto\.sa\/public-portal\//)
    }
  })
})

describe('robots.txt', () => {
  it('allows the public portal, disallows the rest, and names the sitemap', () => {
    expect(robots).toContain('Allow: /public-portal/')
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
