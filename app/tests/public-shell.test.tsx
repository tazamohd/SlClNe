import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicShell } from '@/components/shell/PublicShell'
import { STORAGE_KEYS } from '@/lib/storage'
import { setViewportWidth } from '@/test-setup'

/** The marketing chrome must work for a visitor with no session: these tests
 *  mount it with PreferencesProvider and a router only — deliberately no
 *  SessionProvider, no QueryClient — because that is exactly the tree an
 *  `ungated` route renders into for an anonymous reader. */
function renderShell(children: ReactNode = <p>page body</p>, route = '/public-portal/landing') {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={<PublicShell>{children}</PublicShell>} />
        </Routes>
      </MemoryRouter>
    </PreferencesProvider>
  )
}

describe('PublicShell', () => {
  it('renders signed out — no session provider anywhere in the tree', () => {
    renderShell(<p>hello visitor</p>)
    expect(screen.getByText('hello visitor')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('carries the six design nav links, each to a real public route', () => {
    renderShell()
    const nav = screen.getAllByRole('navigation', { name: 'Main navigation' })[0]
    const links = Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'))
    expect(links).toEqual([
      '/public-portal/landing',
      '/public-portal/products',
      '/public-portal/pricing',
      '/public-portal/about',
      '/public-portal/contact',
      '/public-portal/blog',
    ])
  })

  it('links Sign In into the auth chain at /login', () => {
    renderShell()
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login')
  })

  it('switches to Arabic and flips the document to RTL', async () => {
    const user = userEvent.setup()
    renderShell()
    await user.click(screen.getByRole('button', { name: 'Switch language' }))
    expect(document.documentElement.dir).toBe('rtl')
    // The shell's own strings translate: Sign In has an Arabic key.
    expect(screen.getByRole('link', { name: 'تسجيل الدخول' })).toBeInTheDocument()
  })

  it('renders Arabic RTL from a stored preference, signed out', () => {
    window.localStorage.setItem(STORAGE_KEYS.lang, 'ar')
    renderShell()
    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByRole('link', { name: 'تسجيل الدخول' })).toBeInTheDocument()
  })

  it('collapses the nav into a hamburger menu at 390px', async () => {
    setViewportWidth(390)
    const user = userEvent.setup()
    renderShell()

    // Desktop nav is gone; the menu button is present and closed.
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(menu.querySelectorAll('a')).toHaveLength(6)

    // Navigating closes the panel. (The footer also carries an About link, so
    // scope the query to the menu panel.)
    await user.click(within(menu).getByRole('link', { name: 'About' }))
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
  })

  it('offers a skip link to the main content landmark', () => {
    renderShell()
    const skip = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skip).toHaveAttribute('href', '#main-content')
    expect(document.getElementById('main-content')).toBe(screen.getByRole('main'))
  })

  it('footer contains only links with real destinations', () => {
    renderShell()
    const footer = screen.getByRole('contentinfo')
    const links = Array.from(footer.querySelectorAll('a'))
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      // Every footer link is a real public route: a PublicPortal page or one of
      // the top-level legal pages. No dead CTAs, no authenticated URLs.
      expect(link.getAttribute('href')).toMatch(
        /^(\/public-portal\/|\/privacy-policy$|\/terms-conditions$|\/cookie-policy$)/
      )
    }
  })
})
