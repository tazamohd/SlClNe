import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentType, ReactElement } from 'react'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicShell } from '@/components/shell/PublicShell'
import { SCREENS as WEBSITE_SCREENS } from '@/screens/domains/website'
import { SCREENS as GENERATED_SCREENS } from '@/data/generated/screens'
import { entryOf } from '@/screens/registry'
import { STORAGE_KEYS } from '@/lib/storage'
import { setViewportWidth } from '@/test-setup'

/** Every Tier A page, mounted the way an anonymous visitor gets it: inside
 *  PublicShell, with PreferencesProvider and a router and nothing else. No
 *  SessionProvider exists in this tree — if any page reached for a session it
 *  would throw here, which is the point. */
function renderPublic(ui: ReactElement, route = '/') {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={[route]}>
        <PublicShell>{ui}</PublicShell>
      </MemoryRouter>
    </PreferencesProvider>
  )
}

const PAGES: readonly { name: string; h1: string; title: string }[] = [
  {
    name: 'PublicPortal.Landing',
    h1: 'One number, entered once, carried everywhere.',
    title: 'SALIS AUTO — Workshop Management, Saudi Standard',
  },
  { name: 'PublicPortal.About', h1: 'About SALIS AUTO', title: 'About — SALIS AUTO' },
  { name: 'PublicPortal.Services', h1: 'Our Services', title: 'Services — SALIS AUTO' },
  {
    name: 'PublicPortal.PartsAccessories',
    h1: 'Services, Parts & Accessories',
    title: 'Services, Parts & Accessories — SALIS AUTO',
  },
  { name: 'PublicPortal.DealsOffers', h1: 'Deals & Offers', title: 'Deals & Offers — SALIS AUTO' },
  { name: 'PublicPortal.RoiCalculator', h1: 'ROI Calculator', title: 'ROI Calculator — SALIS AUTO' },
  { name: 'PublicPortal.Security', h1: 'Security & Data', title: 'Security & Data — SALIS AUTO' },
  { name: 'PublicPortal.Insurance', h1: 'Vehicle Insurance', title: 'Vehicle Insurance — SALIS AUTO' },
  { name: 'PublicPortal.Loans', h1: 'Auto Financing', title: 'Auto Financing — SALIS AUTO' },
  { name: 'PublicPortal.Blog', h1: 'Blog', title: 'Blog — SALIS AUTO' },
  { name: 'PublicPortal.FAQ', h1: 'FAQ', title: 'FAQ — SALIS AUTO' },
  { name: 'PublicPortal.Contact', h1: 'Contact Us', title: 'Contact — SALIS AUTO' },
  { name: 'PublicPortal.Support', h1: 'Help & Support', title: 'Help & Support — SALIS AUTO' },
]

function componentOf(name: string): ComponentType {
  const entry = WEBSITE_SCREENS[name]
  expect(entry, `${name} missing from the website barrel`).toBeDefined()
  return entryOf(entry).component
}

/** Tier C legal pages — no `.dc.html`, design-system pages, registered under
 *  their generated (auth-surface) registry names, not a PublicPortal.* name. */
const LEGAL_SCREENS = ['PrivacyPolicy', 'TermsConditions', 'CookiePolicy'] as const

describe('website domain barrel', () => {
  it('declares every PublicPortal screen plus the top-level legal pages', () => {
    const publicPortal = GENERATED_SCREENS.filter((s) => s.name.startsWith('PublicPortal.'))
      .map((s) => s.name)
      .sort()
    const expected = [...publicPortal, ...LEGAL_SCREENS].sort()
    expect(Object.keys(WEBSITE_SCREENS).sort()).toEqual(expected)
  })

  it('every declared screen is a real name in the generated registry', () => {
    const known = new Set(GENERATED_SCREENS.map((s) => s.name))
    for (const name of Object.keys(WEBSITE_SCREENS)) {
      expect(known, `${name} is not a generated screen — it would never route`).toContain(name)
    }
  })

  it('marks every page ungated and shelled in PublicShell — outside RequireAccess', () => {
    for (const [name, value] of Object.entries(WEBSITE_SCREENS)) {
      const entry = entryOf(value)
      expect(entry.ungated, `${name} must be ungated`).toBe(true)
      expect(entry.shell, `${name} must render in PublicShell`).toBe(PublicShell)
    }
  })
})

describe('Tier A public pages', () => {
  // Landing mirrors its active page to `location.hash`; reset it before every
  // test in this file so one test's page switch never leaks into the next.
  beforeEach(() => {
    window.location.hash = ''
  })

  for (const page of PAGES) {
    it(`${page.name} renders signed-out with its designed h1 and page meta`, () => {
      const Page = componentOf(page.name)
      renderPublic(<Page />)
      const h1s = screen.getAllByRole('heading', { level: 1 })
      expect(h1s).toHaveLength(1)
      expect(h1s[0]).toHaveTextContent(page.h1)
      expect(document.title).toBe(page.title)
      const description = document.head.querySelector('meta[name="description"]')
      expect(description?.getAttribute('content')).toBeTruthy()
      // No skipped heading levels anywhere on the page.
      const levels = new Set(
        screen.getAllByRole('heading').map((h) => Number(h.tagName.slice(1)))
      )
      for (const level of levels) {
        if (level > 1) expect(levels, `h${level} without h${level - 1}`).toContain(level - 1)
      }
    })
  }

  it('Landing mounts with completely empty storage — the true first visit', () => {
    window.localStorage.clear()
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    expect(
      screen.getByRole('heading', { level: 1, name: /One number, entered once, carried everywhere\./ })
    ).toBeInTheDocument()
    // The hero CTA pair, both with real destinations: one to the real demo
    // request route, one an in-page scroll to the proof section. Neither is
    // a decorative dead end, and neither invents a route.
    for (const cta of screen.getAllByRole('link', { name: 'Request a Demo' })) {
      expect(cta).toHaveAttribute('href', '/public-portal/request-demo')
    }
    expect(screen.getByRole('link', { name: 'See how it works' })).toHaveAttribute('href', '#home-proof')
    // Every mockup panel carries its sample-data disclosure, same discipline
    // as the rest of the honest public copy.
    expect(screen.getAllByText(/SAMPLE DATA/).length).toBeGreaterThan(0)
  })

  it('Landing renders in Arabic with the document flipped to RTL', () => {
    window.localStorage.setItem(STORAGE_KEYS.lang, 'ar')
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    expect(document.documentElement.dir).toBe('rtl')
    // The hero CTA carries the Arabic translation from `ar-overrides.ts`.
    expect(screen.getAllByRole('link', { name: 'اطلب عرضًا توضيحيًا' }).length).toBeGreaterThan(0)
  })

  it('the proof section shows real structural facts, not fabricated metrics', () => {
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    // The same figures already used on About/SystemPage — 13 domains, the
    // 14×28 role/permission matrix, 6 separation-of-duty pairs — not new
    // numbers invented for the homepage.
    expect(screen.getByText('13')).toBeInTheDocument()
    expect(screen.getByText('14 × 28')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('the release timeline shows real version numbers, including the one still ahead', () => {
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    for (const version of ['0.1.0', '1.0.0', '2.0.0']) {
      expect(screen.getByText(version)).toBeInTheDocument()
    }
    expect(screen.getByText('You are here')).toBeInTheDocument()
  })

  it('closes with a real Request a Demo CTA, not a dead-end banner', () => {
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    const ctas = screen.getAllByRole('link', { name: 'Request a Demo' })
    expect(ctas.length).toBeGreaterThan(0)
    for (const cta of ctas) {
      expect(cta).toHaveAttribute('href', '/public-portal/request-demo')
    }
  })

  it('pages render at 390px without the desktop nav', () => {
    setViewportWidth(390)
    const Page = componentOf('PublicPortal.Services')
    renderPublic(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Our Services' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('Support channels are live actions, not decorated dead ends', () => {
    const Page = componentOf('PublicPortal.Support')
    renderPublic(<Page />)
    const channels = screen.getByRole('navigation', { name: 'Support channels' })
    const hrefs = Array.from(channels.querySelectorAll('a')).map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/public-portal/contact', 'tel:+966112345678', 'mailto:info@salisauto.sa'])
  })

  it('Insurance quote CTAs lead to the contact page — no fake quote flow', () => {
    const Page = componentOf('PublicPortal.Insurance')
    renderPublic(<Page />)
    const quotes = screen.getAllByRole('link', { name: 'Get Quote' })
    expect(quotes).toHaveLength(2)
    for (const quote of quotes) {
      expect(quote).toHaveAttribute('href', '/public-portal/contact')
    }
  })

  it('catalogue cards are informational, not links to nowhere', () => {
    const PartsAccessories = componentOf('PublicPortal.PartsAccessories')
    renderPublic(<PartsAccessories />)
    // Six services + eight parts + six accessories, each a plain tile.
    expect(screen.getAllByRole('article')).toHaveLength(20)
    expect(screen.getByRole('region', { name: 'Services' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Parts' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Accessories' })).toBeInTheDocument()
  })

  it('Blog has no fabricated posts — an honest empty state instead', () => {
    const Blog = componentOf('PublicPortal.Blog')
    renderPublic(<Blog />)
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(screen.getByText('No posts published yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'contact us' })).toHaveAttribute('href', '/public-portal/contact')
  })
})
