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
  { name: 'PublicPortal.Landing', h1: 'Workshop Management. Saudi Standard.', title: 'SALIS AUTO — Workshop Management, Saudi Standard' },
  { name: 'PublicPortal.About', h1: 'About SALIS AUTO', title: 'About — SALIS AUTO' },
  { name: 'PublicPortal.Services', h1: 'Our Services', title: 'Services — SALIS AUTO' },
  {
    name: 'PublicPortal.PartsAccessories',
    h1: 'Services, Parts & Accessories',
    title: 'Services, Parts & Accessories — SALIS AUTO',
  },
  { name: 'PublicPortal.DealsOffers', h1: 'Deals & Offers', title: 'Deals & Offers — SALIS AUTO' },
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
      screen.getByRole('heading', { level: 1, name: 'Workshop Management. Saudi Standard.' })
    ).toBeInTheDocument()
    // The Arrival page's hero CTA pair, both with real destinations. "Book a
    // 20-minute demo" repeats in the FAQ/next-steps content, hence getAllByRole.
    expect(screen.getAllByRole('link', { name: 'Book a 20-minute demo' })[0]).toHaveAttribute(
      'href',
      '/public-portal/book-demo'
    )
    expect(screen.getByRole('link', { name: /See where it.s headed/ })).toHaveAttribute('href', '#roadmap')
  })

  it('Landing renders in Arabic with the document flipped to RTL', () => {
    window.localStorage.setItem(STORAGE_KEYS.lang, 'ar')
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    expect(document.documentElement.dir).toBe('rtl')
    // The hero CTA carries the Arabic translation from `ar-overrides.ts`.
    expect(screen.getAllByRole('link', { name: 'احجز عرضاً لعشرين دقيقة' })[0]).toBeInTheDocument()
  })

  it('Landing switches its six in-page pages and mirrors the choice to the hash', () => {
    window.location.hash = ''
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    // Exactly one <h1> on the Arrival page at rest.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: /^System/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'The System' })).toBeInTheDocument()
    // Still exactly one <h1> — the Arrival page's markup is fully unmounted.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(window.location.hash).toBe('#system')
  })

  it("Grid's three portal doors link to the real portal routes, not a decorative dead end", () => {
    window.location.hash = ''
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /^Grid/ }))
    expect(screen.getByRole('link', { name: 'Open the customer portal' })).toHaveAttribute(
      'href',
      '/public-portal/customer-portal'
    )
    expect(screen.getByRole('link', { name: 'Open the technician portal' })).toHaveAttribute(
      'href',
      '/public-portal/technician-portal'
    )
    expect(screen.getByRole('link', { name: 'Open the supplier portal' })).toHaveAttribute(
      'href',
      '/public-portal/supplier-portal'
    )
  })

  it("Channel's handshake leads to a real demo booking and a real contact page, not a form that goes nowhere", () => {
    window.location.hash = ''
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /^Channel/ }))
    expect(screen.getByRole('link', { name: /Book a demo/ })).toHaveAttribute('href', '/public-portal/book-demo')
    expect(screen.getByRole('link', { name: 'Contact SALIS AUTO' })).toHaveAttribute('href', '/public-portal/contact')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('the command deck answers a real command with a real fact, entirely client-side', () => {
    const Page = componentOf('PublicPortal.Landing')
    renderPublic(<Page />)
    const input = screen.getByPlaceholderText('type a command, or `help`')
    fireEvent.change(input, { target: { value: 'status' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    // The deck's `status` answer states the real domain and role counts —
    // never an invented diagnostic or telemetry reading.
    expect(screen.getByText(/ZATCA Phase 2, live/)).toBeInTheDocument()
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

  it('Blog and catalogue cards are informational, not links to nowhere', () => {
    const Blog = componentOf('PublicPortal.Blog')
    const { unmount } = renderPublic(<Blog />)
    // Six post cards, none of them anchors.
    expect(screen.getAllByRole('article')).toHaveLength(6)
    unmount()

    const PartsAccessories = componentOf('PublicPortal.PartsAccessories')
    renderPublic(<PartsAccessories />)
    // Six services + eight parts + six accessories, each a plain tile.
    expect(screen.getAllByRole('article')).toHaveLength(20)
    expect(screen.getByRole('region', { name: 'Services' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Parts' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Accessories' })).toBeInTheDocument()
  })
})
