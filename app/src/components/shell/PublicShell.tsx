import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { Footer } from '@/screens/public/sections/Footer'

/** The marketing chrome the nine remaining `PublicPortal.*.dc.html` designs
 *  share: a 64px sticky header — logo, centred nav, theme toggle, sign-in —
 *  and the shared footer. Rendered `ungated`, entirely outside `RequireAccess`:
 *  a visitor with no session must see every page in this shell.
 *
 *  Two deliberate additions over the design source, both required by the
 *  product brief rather than drawn in the handoff:
 *  - a language toggle (Arabic is mandatory on the public site and the design
 *    files expose language only as an editor prop), and
 *  - a mobile pattern — the designs ship no `PublicPortal.*.Mobile.dc.html`,
 *    so below the app's 860px breakpoint the centred nav becomes a hamburger
 *    disclosure panel. That pattern is this shell's own, not the handoff's.
 *
 *  `Marketplace` (Tier A) was retired in favour of two Tier B pages, `Parts &
 *  Accessories` and `Deals & Offers` — both composed from the section system
 *  rather than a `.dc.html` source, same as `Pricing` or `Workshop`.
 *
 *  "Request a Demo" is the one persistent commercial CTA — present here in
 *  the desktop bar and the mobile menu, so it never depends on how far a
 *  visitor has scrolled or which page they landed on. */
const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Industries', to: '/public-portal/industries' },
  { label: 'Integrations', to: '/public-portal/integrations' },
  { label: 'Security', to: '/public-portal/security' },
  { label: 'Pricing', to: '/public-portal/pricing' },
  { label: 'Contact', to: '/public-portal/contact' },
] as const

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'text-[13px] font-medium no-underline transition-colors hover:text-salis-blue hover:no-underline',
    isActive ? 'text-salis-blue' : 'text-body'
  )
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { t, theme, toggleTheme, language, toggleLanguage } = usePreferences()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Navigating from the open menu must close it — a panel that lingers over
  // the next page is the classic hamburger bug.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-viewport flex-col bg-page font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-salis-blue px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>

      {/* The bar sticks to the top of a page that now paints under the status
          bar, so it pads itself clear of the inset and grows by the same amount
          rather than losing 16px of its 64px row. */}
      <header className="sticky top-0 z-10 flex h-[calc(4rem+var(--safe-top))] items-center gap-4 border-b border-border bg-sidebar pt-safe-top ps-[calc(1rem+var(--safe-start))] pe-[calc(1rem+var(--safe-end))] md:ps-[calc(2.5rem+var(--safe-start))] md:pe-[calc(2.5rem+var(--safe-end))]">
        <Link
          to="/public-portal/landing"
          className="flex items-center gap-2 no-underline hover:no-underline"
          aria-label={t('SALIS AUTO home')}
        >
          <img
            src="/assets/logo-blue-orange.png"
            alt=""
            width={500}
            height={500}
            className="h-10 w-10 object-contain"
          />
          <span dir="ltr" className="font-display text-base font-extrabold text-heading">
            SALIS AUTO
          </span>
        </Link>

        {!isMobile ? (
          <nav
            aria-label={t('Main navigation')}
            className="flex flex-1 items-center justify-center gap-6"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {t(link.label)}
              </NavLink>
            ))}
          </nav>
        ) : (
          <span className="flex-1" />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('Switch language')}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2 font-action text-[13px] font-medium text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name="Globe" size={16} />
            <span lang={language === 'ar' ? 'ar' : 'en'}>
              {language === 'ar' ? 'English' : 'عربي'}
            </span>
          </button>
          {!isMobile ? (
            <Link
              to="/public-portal/request-demo"
              className="inline-flex h-9 items-center rounded-lg border border-salis-blue px-4 font-action text-[13px] font-semibold text-salis-blue no-underline hover:no-underline"
            >
              {t('Request a Demo')}
            </Link>
          ) : null}
          <Link
            to="/login"
            className="inline-flex h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:no-underline"
          >
            {t('Sign In')}
          </Link>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t('Menu')}
              aria-expanded={menuOpen}
              aria-controls="public-mobile-menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
            >
              <Icon name={menuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          ) : null}
        </div>
      </header>

      {isMobile && menuOpen ? (
        <nav
          id="public-mobile-menu"
          aria-label={t('Main navigation')}
          className="sticky top-[calc(4rem+var(--safe-top))] z-10 flex flex-col border-b border-border bg-sidebar py-2 ps-[calc(1rem+var(--safe-start))] pe-[calc(1rem+var(--safe-end))]"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-2 py-3 text-[15px] font-medium no-underline hover:no-underline',
                  isActive ? 'bg-salis-blue/[.08] text-salis-blue' : 'text-body'
                )
              }
            >
              {t(link.label)}
            </NavLink>
          ))}
          <Link
            to="/public-portal/request-demo"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-salis-gradient px-4 font-action text-[15px] font-semibold text-white no-underline hover:no-underline"
          >
            {t('Request a Demo')}
          </Link>
        </nav>
      ) : null}

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
