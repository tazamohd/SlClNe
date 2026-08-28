import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site — FAQ. Renders its own header/nav/footer, no
 *  AppShell — this is the anonymous-visitor site, not an authenticated
 *  screen. Answers are hidden behind a local-state accordion; only the
 *  question row and its icon are visible until a visitor expands it. */

const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
]

const FOOTER_COLUMNS = [
  { heading: 'Product', links: ['Features', 'Pricing', 'Marketplace'] },
  { heading: 'Company', links: ['About', 'Contact', 'Blog'] },
  { heading: 'Support', links: ['Help Center', 'FAQ', 'Terms'] },
]

const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'You can book through our app, website, or by calling any branch. Walk-ins are also welcome.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept cash, Mada, Visa/Mastercard, Apple Pay, and SALIS Wallet.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes, we use enterprise-grade encryption and comply with Saudi data protection regulations.',
  },
  {
    q: 'Do you offer warranty on repairs?',
    a: 'All repairs come with a 6-month or 10,000km warranty, whichever comes first.',
  },
  {
    q: "Can I track my vehicle's service status?",
    a: 'Yes, real-time tracking is available through the customer portal and mobile app.',
  },
  {
    q: 'Do you service all car brands?',
    a: 'We service all major brands including Toyota, Nissan, Hyundai, Lexus, Ford, GMC, and more.',
  },
] as const

export function PublicPortalFAQ() {
  const { t, rtl } = usePreferences()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)

  function toggle(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      {/* ── Site header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-sidebar">
        <div className="flex h-16 items-center gap-4 px-6 sm:px-10">
          <Link to="/public-portal/landing" className="flex items-center gap-2 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
              <Icon name="Car" size={16} className="text-white" />
            </span>
            <span className="font-display text-base font-extrabold text-heading">
              {t('SALIS AUTO')}
            </span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="font-action text-[13px] font-medium text-body no-underline hover:text-salis-blue"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
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
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-body no-underline transition-colors hover:bg-[rgba(10,94,215,.04)]"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto max-w-[800px] animate-fade-up px-4 py-12 sm:px-10 sm:py-[60px]">
          <h1 className="m-0 mb-2 text-center font-display text-[32px] font-black text-heading sm:text-[40px]">
            {t('FAQ')}
          </h1>
          <p className="m-0 mb-8 text-center text-base text-muted">
            {t('Frequently asked questions')}
          </p>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const open = expanded.has(index)
              return (
                <div
                  key={faq.q}
                  className="rounded-[14px] border border-border bg-card p-[18px]"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-start font-ui"
                  >
                    <HelpCircle size={16} strokeWidth={2} className="shrink-0 text-salis-blue" aria-hidden />
                    <span className="flex-1 text-[15px] font-semibold text-heading">
                      {t(faq.q)}
                    </span>
                    <Icon
                      name={open ? 'ChevronDown' : rtl ? 'ChevronLeft' : 'ChevronRight'}
                      size={16}
                      className="shrink-0 text-muted"
                    />
                  </button>
                  {open ? (
                    <p className="m-0 mt-2 ps-6 text-[13px] leading-relaxed text-muted">
                      {t(faq.a)}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* ── Site footer ─────────────────────────────────────────────── */}
      <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar p-6 sm:gap-[60px] sm:p-10">
        <div className="min-w-[200px]">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient">
              <Icon name="Car" size={14} className="text-white" />
            </span>
            <span className="font-display text-sm font-extrabold text-heading">
              {t('SALIS AUTO')}
            </span>
          </div>
          <p className="m-0 max-w-[240px] text-xs text-muted">
            {t('Integrated automotive workshop management system for Saudi Arabia.')}
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-[.05em] text-muted">
              {t(col.heading)}
            </p>
            <div className="flex flex-col gap-1.5">
              {col.links.map((link) => (
                <span key={link} className="text-[13px] text-body">
                  {t(link)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </footer>
    </div>
  )
}

export default PublicPortalFAQ
