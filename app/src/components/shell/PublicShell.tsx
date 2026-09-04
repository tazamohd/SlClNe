import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { Footer } from '@/screens/public/sections/Footer'
import { ShellContext } from './ShellContext'

const PUBLIC_SHELL = { kind: 'public' } as const

/** How far the page scrolls before the header takes its compact form. */
const SHRINK_AT_PX = 24

/** The marketing chrome all ten `PublicPortal.*.dc.html` designs share: a
 *  sticky header — logo, centred nav, theme toggle, sign-in — and the shared
 *  footer. Rendered `ungated`, entirely outside `RequireAccess`: a visitor
 *  with no session must see every page in this shell.
 *
 *  Three deliberate additions over the design source, required by the
 *  product brief rather than drawn in the handoff:
 *  - a language toggle (Arabic is mandatory on the public site and the design
 *    files expose language only as an editor prop);
 *  - a mobile pattern — the designs ship no `PublicPortal.*.Mobile.dc.html`,
 *    so below the app's 860px breakpoint the centred nav becomes a hamburger
 *    disclosure panel whose rows are ≥44px; and
 *  - a persistent "Book a Demo" link on desktop beside Sign In.
 *
 *  The header is 64px at the top of the page and 56px once the visitor has
 *  scrolled. The switch is a class toggle, not an animated height — nothing
 *  under it reflows mid-scroll — and only the shadow and the logo's scale
 *  transition, both compositor-friendly.
 */
const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'Products', to: '/public-portal/products' },
  { label: 'Pricing', to: '/public-portal/pricing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
] as const

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex min-h-[44px] items-center text-[13px] font-medium no-underline transition-colors hover:text-salis-blue hover:no-underline',
    isActive ? 'text-salis-blue' : 'text-body'
  )
}

function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const read = () => setScrolled(window.scrollY > SHRINK_AT_PX)
    read()
    window.addEventListener('scroll', read, { passive: true })
    return () => window.removeEventListener('scroll', read)
  }, [])
  return scrolled
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { t, theme, toggleTheme, language, toggleLanguage } = usePreferences()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()

  // Navigating from the open menu must close it — a panel that lingers over
  // the next page is the classic hamburger bug.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <ShellContext.Provider value={PUBLIC_SHELL}>
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-salis-blue px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>

      <header
        data-scrolled={scrolled || undefined}
        className={cn(
          'sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-sidebar/95 px-4 backdrop-blur transition-shadow duration-200 md:px-10',
          scrolled ? 'h-14 shadow-sm' : 'h-16'
        )}
      >
        <Link
          to="/public-portal/landing"
          className="flex min-h-[44px] items-center gap-2 no-underline hover:no-underline"
          aria-label={t('SALIS AUTO home')}
        >
          {/* Vector masters (SA-BRD-002): full colour on the light header, reversed on the navy one. */}
          <img
            src="/assets/logo-full-colour.svg"
            alt=""
            width={500}
            height={500}
            className={cn(
              'h-10 w-10 object-contain transition-transform duration-200 motion-reduce:transition-none dark:hidden',
              scrolled && 'scale-90'
            )}
          />
          <img
            src="/assets/logo-reversed-white.svg"
            alt=""
            width={500}
            height={500}
            className={cn(
              'hidden h-10 w-10 object-contain transition-transform duration-200 motion-reduce:transition-none dark:block',
              scrolled && 'scale-90'
            )}
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

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('Switch language')}
            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2 font-action text-[13px] font-medium text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name="Globe" size={16} />
            <span lang={language === 'ar' ? 'ar' : 'en'}>
              {language === 'ar' ? 'English' : 'عربي'}
            </span>
          </button>
          {!isMobile ? (
            <Link
              to="/public-portal/book-demo"
              className="inline-flex h-11 items-center rounded-lg border border-salis-blue px-4 font-action text-[13px] font-semibold text-salis-blue no-underline transition-colors hover:bg-salis-blue/[.06] hover:no-underline"
            >
              {t('Book a Demo')}
            </Link>
          ) : null}
          <Link
            to="/login"
            className="inline-flex h-11 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:no-underline"
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
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
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
          className={cn(
            'sticky z-10 flex flex-col border-b border-border bg-sidebar px-4 py-2',
            scrolled ? 'top-14' : 'top-16'
          )}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center rounded-lg px-3 text-[15px] font-medium no-underline hover:no-underline',
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
    </ShellContext.Provider>
  )
}
