import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { Footer } from '@/screens/public/sections/Footer'

/** The marketing chrome all ten `PublicPortal.*.dc.html` designs share: a
 *  64px sticky header — logo, centred nav, theme toggle, sign-in — and the
 *  shared footer. Rendered `ungated`, entirely outside `RequireAccess`: a
 *  visitor with no session must see every page in this shell.
 *
 *  Two deliberate additions over the design source, both required by the
 *  product brief rather than drawn in the handoff:
 *  - a language toggle (Arabic is mandatory on the public site and the design
 *    files expose language only as an editor prop), and
 *  - a mobile pattern — the designs ship no `PublicPortal.*.Mobile.dc.html`,
 *    so below the app's 860px breakpoint the centred nav becomes a hamburger
 *    disclosure panel. That pattern is this shell's own, not the handoff's.
 */
const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
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
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-salis-blue px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>

      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-sidebar px-4 md:px-10">
        <Link
          to="/public-portal/landing"
          className="flex items-center gap-2 no-underline hover:no-underline"
          aria-label={t('SALIS AUTO home')}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
            <Icon name="Car" size={16} />
          </span>
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('Switch language')}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2 font-action text-[13px] font-medium text-muted"
          >
            <Icon name="Globe" size={16} />
            <span lang={language === 'ar' ? 'ar' : 'en'}>
              {language === 'ar' ? 'English' : 'عربي'}
            </span>
          </button>
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
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-heading"
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
          className="sticky top-16 z-10 flex flex-col border-b border-border bg-sidebar px-4 py-2"
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
        </nav>
      ) : null}

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
