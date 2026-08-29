import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site nav — six primary links plus the mobile toggle.
 *  Renders its own header/footer chrome (no AppShell/RequireAccess): this is
 *  the SALIS AUTO website, not the app. */
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Home', href: '/public-portal/landing' },
  { label: 'About', href: '/public-portal/about' },
  { label: 'Services', href: '/public-portal/services' },
  { label: 'Marketplace', href: '/public-portal/marketplace' },
  { label: 'Contact', href: '/public-portal/contact' },
  { label: 'Blog', href: '/public-portal/blog' },
]

interface Feature {
  title: string
  desc: string
  icon: string
  bg: string
  fg: string
}

const FEATURES: readonly Feature[] = [
  {
    title: 'Job Card Management',
    desc: 'Complete workflow from check-in to delivery with real-time tracking.',
    icon: 'ClipboardList',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
  },
  {
    title: 'Inventory Control',
    desc: 'Smart parts management with auto-reorder and supplier integration.',
    icon: 'Package',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
  },
  {
    title: 'ZATCA E-Invoicing',
    desc: 'Fully compliant Saudi electronic invoicing with QR codes.',
    icon: 'Receipt',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
  },
  {
    title: 'Fleet Management',
    desc: 'Multi-vehicle accounts with contract tracking and SLA monitoring.',
    icon: 'Truck',
    bg: 'rgba(11,31,59,.1)',
    fg: '#0B1F3B',
  },
  {
    title: 'AI Assistant',
    desc: 'Intelligent insights, automated reports, and smart scheduling.',
    icon: 'Sparkles',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
  },
  {
    title: 'Multi-Branch',
    desc: 'Centralized management across all your workshop locations.',
    icon: 'MapPin',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
  },
]

/** Footer link columns. Every entry that has a real sibling route under
 *  /public-portal/* is a router Link; the two design-only labels with no
 *  matching page (Pricing, Terms) stay as plain non-navigating text, same as
 *  the reference design where those anchors carry no href either. */
const FOOTER_COLUMNS: ReadonlyArray<{
  heading: string
  links: ReadonlyArray<{ label: string; href?: string }>
}> = [
  {
    heading: 'Product',
    links: [
      { label: 'Services', href: '/public-portal/services' },
      { label: 'Marketplace', href: '/public-portal/marketplace' },
      { label: 'Insurance', href: '/public-portal/insurance' },
      { label: 'Loans', href: '/public-portal/loans' },
      { label: 'Pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/public-portal/about' },
      { label: 'Contact', href: '/public-portal/contact' },
      { label: 'Blog', href: '/public-portal/blog' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', href: '/public-portal/support' },
      { label: 'FAQ', href: '/public-portal/faq' },
      { label: 'Terms' },
    ],
  },
]

function SiteLogo() {
  return (
    <Link
      to="/public-portal/landing"
      className="flex items-center gap-2 no-underline hover:no-underline"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
        <Icon name="Car" size={16} className="text-white" />
      </span>
      <span dir="ltr" className="font-display text-base font-extrabold text-heading">
        SALIS AUTO
      </span>
    </Link>
  )
}

function SiteHeader() {
  const { t, rtl, theme, toggleTheme } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-sidebar px-4 md:px-10">
      <SiteLogo />

      <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="font-ui text-[13px] font-medium text-body no-underline transition-colors duration-150 hover:text-salis-blue hover:no-underline"
          >
            {t(link.label)}
          </Link>
        ))}
      </nav>

      <div className="ms-auto flex items-center gap-2 md:ms-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={t('Toggle theme')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted"
        >
          <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
        </button>
        <Link
          to="/login"
          className="hidden h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline sm:inline-flex hover:text-white hover:no-underline"
        >
          {t('Sign In')}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={t('Menu')}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-heading md:hidden"
        >
          {menuOpen ? (
            <X size={18} strokeWidth={2} aria-hidden />
          ) : (
            <Icon name="Menu" size={18} />
          )}
        </button>
      </div>

      {menuOpen ? (
        <div
          className="absolute inset-x-0 top-16 z-10 flex flex-col gap-1 border-b border-border bg-sidebar p-4 md:hidden"
          dir={rtl ? 'rtl' : 'ltr'}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 font-ui text-sm font-medium text-body no-underline hover:bg-page hover:no-underline"
            >
              {t(link.label)}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-salis-gradient px-4 font-action text-sm font-semibold text-white no-underline hover:text-white hover:no-underline sm:hidden"
          >
            {t('Sign In')}
          </Link>
        </div>
      ) : null}
    </header>
  )
}

function Hero() {
  const { t, rtl } = usePreferences()

  return (
    <div className="relative overflow-hidden px-4 py-16 text-center sm:px-10 sm:py-20">
      <div
        className="pointer-events-none absolute end-0 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.06),transparent_70%)] blur-[64px]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-[720px] animate-fade-up motion-reduce:animate-none">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(10,94,215,.08)] px-3.5 py-1 font-ui text-[13px] font-semibold text-salis-blue">
          {t('Automotive ERP for Saudi Arabia')}
        </span>
        <h1 className="m-0 bg-salis-gradient-r bg-clip-text font-display text-[36px] font-black leading-[1.1] text-transparent sm:text-[52px]">
          {t('Manage Your Workshop with Confidence')}
        </h1>
        <p className="mx-auto mt-5 max-w-[540px] font-ui text-base text-muted sm:text-lg">
          {t(
            'SALIS AUTO is the all-in-one garage management system built for Saudi workshops — from single bays to franchise networks.'
          )}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-salis-gradient px-7 font-action text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_rgba(10,94,215,.3)] hover:text-white hover:no-underline sm:w-auto"
          >
            {t('Get Started')}
            <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
          </Link>
          <Link
            to="/public-portal/contact"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-salis-blue px-7 font-action text-[15px] font-medium text-salis-blue no-underline hover:no-underline sm:w-auto"
          >
            {t('Book a Demo')}
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureGrid() {
  const { t } = usePreferences()

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-10 sm:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 ease-salis hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
          >
            <span
              className="inline-flex rounded-[14px] p-3"
              style={{ background: feature.bg, color: feature.fg }}
            >
              <Icon name={feature.icon} size={22} />
            </span>
            <h3 className="mb-1.5 mt-3.5 font-ui text-[17px] font-bold text-heading">
              {t(feature.title)}
            </h3>
            <p className="m-0 font-ui text-[13px] leading-relaxed text-muted">
              {t(feature.desc)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SiteFooter() {
  const { t } = usePreferences()

  return (
    <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar px-4 py-10 sm:gap-16 sm:px-10">
      <div className="min-w-[200px]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient">
            <Icon name="Car" size={14} className="text-white" />
          </span>
          <span dir="ltr" className="font-display text-sm font-extrabold text-heading">
            SALIS AUTO
          </span>
        </div>
        <p className="m-0 max-w-[240px] font-ui text-xs text-muted">
          {t('Integrated automotive workshop management system for Saudi Arabia.')}
        </p>
      </div>
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.heading}>
          <p className="mb-2.5 mt-0 font-ui text-xs font-semibold uppercase tracking-wide text-muted">
            {t(column.heading)}
          </p>
          <div className="flex flex-col gap-1.5">
            {column.links.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-ui text-[13px] text-body no-underline hover:text-salis-blue hover:no-underline"
                >
                  {t(link.label)}
                </Link>
              ) : (
                <span key={link.label} className="font-ui text-[13px] text-body">
                  {t(link.label)}
                </span>
              )
            )}
          </div>
        </div>
      ))}
    </footer>
  )
}

/** SALIS AUTO public marketing site — the landing page at /public-portal/landing.
 *  Ported from PublicPortal.Landing.dc.html. This is website chrome, not app
 *  chrome: it renders its own header/nav/footer and carries no AppShell or
 *  RequireAccess, matching every other page under /public-portal/*. */
export function PublicPortalLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
      </main>
      <SiteFooter />
    </div>
  )
}
