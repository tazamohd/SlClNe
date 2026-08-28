import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site — About. Standalone (own header/nav/footer, no
 *  AppShell/RequireAccess) since it lives outside the authenticated product,
 *  same as the other `/public-portal/*` pages it links to. */

const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
] as const

const STATS = [
  { value: '500+', label: 'Workshops' },
  { value: '50K+', label: 'Vehicles Serviced' },
  { value: '13', label: 'Cities' },
] as const

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '/public-portal/services' },
      { label: 'Pricing', to: '/public-portal/services' },
      { label: 'Marketplace', to: '/public-portal/marketplace' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/public-portal/about' },
      { label: 'Contact', to: '/public-portal/contact' },
      { label: 'Blog', to: '/public-portal/blog' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', to: '/public-portal/support' },
      { label: 'FAQ', to: '/public-portal/faq' },
      { label: 'Terms', to: '/public-portal/support' },
    ],
  },
] as const

export function PublicPortalAbout() {
  const { t, rtl, theme, toggleTheme } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <header className="sticky top-0 z-10 border-b border-border bg-sidebar">
        <div className="flex h-16 flex-shrink-0 items-center gap-4 px-4 sm:px-10">
          <Link to="/public-portal/landing" className="flex items-center gap-2 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
              <Icon name="Car" size={16} className="text-white" />
            </span>
            <span className="font-display text-base font-extrabold text-heading" dir="ltr">
              SALIS AUTO
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={link.to === '/public-portal/about' ? 'page' : undefined}
                className={cn(
                  'text-[13px] font-medium no-underline transition-colors duration-150 hover:text-salis-blue',
                  link.to === '/public-portal/about' ? 'text-salis-blue' : 'text-body'
                )}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <button
              type="button"
              aria-label={t('Toggle theme')}
              onClick={toggleTheme}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted transition-colors duration-150 hover:text-salis-blue"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
            </button>
            <Link
              to="/login"
              className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
            >
              {t('Sign In')}
            </Link>
            <button
              type="button"
              aria-label={t('Menu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-heading md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Icon name="Menu" size={18} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="flex flex-col gap-1 border-t border-border bg-sidebar p-4 md:hidden" dir={rtl ? 'rtl' : 'ltr'}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-[14px] font-medium no-underline transition-colors',
                  link.to === '/public-portal/about' ? 'bg-[rgba(10,94,215,.08)] text-salis-blue' : 'text-body hover:bg-[rgba(10,94,215,.04)]'
                )}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] animate-fade-up px-4 py-12 sm:px-10 sm:py-16">
          <h1 className="mb-4 font-display text-[32px] font-black text-heading sm:text-[40px]">
            {t('About SALIS AUTO')}
          </h1>
          <p className="mb-8 text-base leading-[1.7] text-muted">
            {t(
              "SALIS AUTO is Saudi Arabia's leading automotive workshop management platform. We empower garages of all sizes with powerful digital tools to streamline operations, delight customers, and grow revenue."
            )}
          </p>

          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-6 text-center"
              >
                <h3 className="m-0 font-display text-4xl font-black text-salis-blue" dir="ltr">
                  {stat.value}
                </h3>
                <p className="mt-1.5 text-[13px] text-muted">{t(stat.label)}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-2xl font-bold text-heading">{t('Our Mission')}</h2>
          <p className="text-[15px] leading-[1.7] text-body">
            {t(
              'To digitize every automotive workshop in Saudi Arabia, enabling world-class service delivery through technology, data, and AI — aligned with Vision 2030.'
            )}
          </p>
        </div>
      </main>

      <footer className="flex flex-wrap gap-12 border-t border-border bg-sidebar px-4 py-10 sm:gap-16 sm:px-10">
        <div className="min-w-[200px]">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient">
              <Icon name="Car" size={14} className="text-white" />
            </span>
            <span className="font-display text-sm font-extrabold text-heading" dir="ltr">
              SALIS AUTO
            </span>
          </div>
          <p className="max-w-[240px] text-xs text-muted">
            {t('Integrated automotive workshop management system for Saudi Arabia.')}
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {t(column.heading)}
            </p>
            <div className="flex flex-col gap-1.5">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[13px] text-body no-underline hover:text-salis-blue"
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </footer>
    </div>
  )
}
