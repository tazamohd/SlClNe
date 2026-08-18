import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site nav — six primary links plus the mobile toggle.
 *  Renders its own header/footer chrome (no AppShell/RequireAccess): this is
 *  the SALIS AUTO website, not the app. Mirrors PublicPortalLanding's chrome
 *  so every /public-portal/* page reads as one site. */
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Home', href: '/public-portal/landing' },
  { label: 'About', href: '/public-portal/about' },
  { label: 'Services', href: '/public-portal/services' },
  { label: 'Marketplace', href: '/public-portal/marketplace' },
  { label: 'Contact', href: '/public-portal/contact' },
  { label: 'Blog', href: '/public-portal/blog' },
]

/** Footer link columns. Every entry that has a real sibling route under
 *  /public-portal/* is a router Link; the design-only labels with no
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

// Same demo catalogue as the reference design and the customer-app
// marketplace, with categories layered on so the filter row is functional
// rather than decorative (the design's product grid had none).
const CATEGORIES = ['All', 'Oil & Filters', 'Brakes', 'Battery', 'Accessories'] as const

const PRODUCTS: ReadonlyArray<{ name: string; price: number; icon: string; cat: string }> = [
  { name: 'Oil Filter (Toyota)', price: 45, icon: 'Droplets', cat: 'Oil & Filters' },
  { name: 'Brake Pads (Front)', price: 310, icon: 'Disc', cat: 'Brakes' },
  { name: 'Air Filter (Universal)', price: 95, icon: 'Wind', cat: 'Oil & Filters' },
  { name: 'Spark Plug Set', price: 140, icon: 'Zap', cat: 'Accessories' },
  { name: 'Battery 12V', price: 380, icon: 'Battery', cat: 'Battery' },
  { name: 'Wiper Blades', price: 65, icon: 'Waves', cat: 'Accessories' },
  { name: 'Coolant 4L', price: 75, icon: 'Thermometer', cat: 'Oil & Filters' },
  { name: 'Transmission Fluid', price: 120, icon: 'Cog', cat: 'Oil & Filters' },
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
            aria-current={link.href === '/public-portal/marketplace' ? 'page' : undefined}
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

function ProductGrid() {
  const { t } = usePreferences()
  const [category, setCategory] = useState<string>('All')

  const products =
    category === 'All' ? PRODUCTS : PRODUCTS.filter((product) => product.cat === category)

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up px-4 py-12 sm:px-10 sm:py-16">
      <h1 className="mb-2 text-center font-display text-[28px] font-black text-heading sm:text-[40px]">
        {t('Parts Marketplace')}
      </h1>
      <p className="mb-8 text-center font-ui text-sm text-muted sm:mb-10 sm:text-base">
        {t('Quality auto parts delivered to your doorstep')}
      </p>

      <div role="tablist" aria-label={t('Category')} className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={category === option}
            onClick={() => setCategory(option)}
            className={cn(
              'cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 font-action text-[12px] font-semibold',
              category === option
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted'
            )}
          >
            {t(option)}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState icon="ShoppingBag" title={t('Nothing in this category')} />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 ease-salis hover:shadow-lg"
            >
              <div className="flex h-[140px] items-center justify-center bg-[linear-gradient(135deg,rgba(10,94,215,.06),rgba(11,179,255,.06))]">
                <Icon name={product.icon} size={40} className="text-salis-blue opacity-30" />
              </div>
              <div className="p-3.5">
                <p className="m-0 font-ui text-sm font-semibold text-heading">{t(product.name)}</p>
                <Money
                  sar={product.price}
                  className="mt-1.5 block font-mono text-base font-bold text-salis-blue"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** SALIS AUTO public marketing site — the marketplace at /public-portal/marketplace.
 *  Ported from PublicPortal.Marketplace.dc.html. This is website chrome, not
 *  app chrome: it renders its own header/nav/footer and carries no AppShell
 *  or RequireAccess, matching every other page under /public-portal/*. */
export function PublicPortalMarketplace() {
  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <SiteHeader />
      <main className="flex-1">
        <ProductGrid />
      </main>
      <SiteFooter />
    </div>
  )
}
