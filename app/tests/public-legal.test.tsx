import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentType, ReactElement } from 'react'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicShell } from '@/components/shell/PublicShell'
import { SCREENS as WEBSITE_SCREENS } from '@/screens/domains/website'
import { entryOf } from '@/screens/registry'
import { STORAGE_KEYS } from '@/lib/storage'
import { setViewportWidth } from '@/test-setup'

/** The Tier C legal pages, mounted the way a signed-out visitor gets them:
 *  inside PublicShell, no SessionProvider in the tree. If either page reached
 *  for a session it would throw here. */
function renderPublic(ui: ReactElement) {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={['/']}>
        <PublicShell>{ui}</PublicShell>
      </MemoryRouter>
    </PreferencesProvider>
  )
}

function componentOf(name: string): ComponentType {
  const entry = WEBSITE_SCREENS[name]
  expect(entry, `${name} missing from the website barrel`).toBeDefined()
  return entryOf(entry).component
}

const PAGES = [
  { name: 'PrivacyPolicy', h1: 'Privacy Policy', title: 'Privacy Policy — SALIS AUTO' },
  { name: 'TermsConditions', h1: 'Terms & Conditions', title: 'Terms & Conditions — SALIS AUTO' },
] as const

describe('Tier C legal pages', () => {
  for (const page of PAGES) {
    it(`${page.name} renders signed-out with its h1, meta, effective date and version`, () => {
      const Page = componentOf(page.name)
      renderPublic(<Page />)

      const h1s = screen.getAllByRole('heading', { level: 1 })
      expect(h1s).toHaveLength(1)
      expect(h1s[0]).toHaveTextContent(page.h1)
      expect(document.title).toBe(page.title)
      expect(
        document.head.querySelector('meta[name="description"]')?.getAttribute('content')
      ).toBeTruthy()

      // Dated and versioned, like a real legal document — no public
      // "not reviewed by counsel" disclaimer (that made production look
      // careless; open review items are tracked in LEGAL_REVIEW_REQUIRED.md
      // instead of surfaced on the live page).
      const meta = screen.getByText(/^Effective date/i)
      expect(meta.textContent).toMatch(/Version/i)
      expect(screen.queryByText(/reviewed by legal counsel/i)).not.toBeInTheDocument()

      // No skipped heading levels.
      const levels = new Set(
        screen.getAllByRole('heading').map((h) => Number(h.tagName.slice(1)))
      )
      for (const level of levels) {
        if (level > 1) expect(levels, `h${level} without h${level - 1}`).toContain(level - 1)
      }
    })
  }

  it('renders at 390px with the mobile nav, not the desktop bar', () => {
    setViewportWidth(390)
    const Page = componentOf('PrivacyPolicy')
    renderPublic(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('Terms renders in Arabic with the document flipped to RTL', () => {
    window.localStorage.setItem(STORAGE_KEYS.lang, 'ar')
    const Page = componentOf('TermsConditions')
    renderPublic(<Page />)
    expect(document.documentElement.dir).toBe('rtl')
    window.localStorage.clear()
  })
})
