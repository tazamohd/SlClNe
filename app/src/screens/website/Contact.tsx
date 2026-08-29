import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing site — Contact. Renders its own header/nav/footer, no
 *  AppShell — this is the anonymous-visitor site, not an authenticated
 *  screen. The form is local state only; submitting shows a confirmation
 *  toast rather than posting anywhere. */

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

const CONTACT_ROWS = [
  {
    icon: 'MapPin',
    color: 'text-salis-blue',
    bg: 'bg-[rgba(10,94,215,.08)]',
    label: 'Address',
    value: 'Al-Olaya District, Riyadh, KSA',
    ltr: false,
  },
  {
    icon: 'Phone',
    color: 'text-[#0BB3FF]',
    bg: 'bg-[rgba(11,179,255,.08)]',
    label: 'Phone',
    value: '+966 11 234 5678',
    ltr: true,
  },
  {
    icon: 'Mail',
    color: 'text-salis-orange',
    bg: 'bg-[rgba(249,115,22,.08)]',
    label: 'Email',
    value: 'info@salisauto.sa',
    ltr: true,
  },
  {
    icon: 'Clock',
    color: 'text-heading',
    bg: 'bg-[rgba(11,31,59,.08)]',
    label: 'Hours',
    value: 'Sat–Thu 8AM–8PM',
    ltr: false,
  },
] as const

export function PublicPortalContact() {
  const { t, rtl } = usePreferences()
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    toast.show({
      title: t('Message sent'),
      description: t("We'll get back to you shortly."),
    })
    setName('')
    setEmail('')
    setMessage('')
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
                className={
                  link.label === 'Contact'
                    ? 'font-action text-[13px] font-medium text-salis-blue no-underline'
                    : 'font-action text-[13px] font-medium text-body no-underline hover:text-salis-blue'
                }
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
                className={
                  link.label === 'Contact'
                    ? 'rounded-lg bg-[rgba(10,94,215,.08)] px-3 py-2.5 text-[14px] font-medium text-salis-blue no-underline'
                    : 'rounded-lg px-3 py-2.5 text-[14px] font-medium text-body no-underline transition-colors hover:bg-[rgba(10,94,215,.04)]'
                }
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
          <h1 className="m-0 mb-2 font-display text-[32px] font-black text-heading sm:text-[40px]">
            {t('Contact Us')}
          </h1>
          <p className="m-0 mb-8 text-base text-muted">{t('Get in touch with our team')}</p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-xs font-medium text-body">
                    {t('Name')}
                  </label>
                  <Input
                    id="contact-name"
                    placeholder={t('Your name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputSize="md"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-xs font-medium text-body">
                    {t('Email')}
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    inputSize="md"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-xs font-medium text-body">
                    {t('Message')}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder={t('How can we help?')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-y rounded-lg border border-border bg-inset p-3 font-ui text-sm text-heading outline-none transition-all duration-200 ease-salis focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('Send Message')}
                </Button>
              </form>
            </div>

            {/* Details + map */}
            <div className="flex flex-col gap-5">
              {CONTACT_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span
                    className={`flex rounded-xl p-2.5 ${row.bg} ${row.color}`}
                  >
                    <Icon name={row.icon} size={20} />
                  </span>
                  <div>
                    <p className="m-0 text-sm font-semibold text-heading">{t(row.label)}</p>
                    <p
                      className="m-0 mt-0.5 text-[13px] text-muted"
                      dir={row.ltr ? 'ltr' : undefined}
                    >
                      {row.ltr ? row.value : t(row.value)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-inset text-muted">
                <Icon name="MapPin" size={22} />
                <span className="font-action text-xs">{t('Map view')}</span>
              </div>
            </div>
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

export default PublicPortalContact
