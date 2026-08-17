import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Public marketing nav — sibling `/public-portal/*` routes, no `/support`
 *  (that internal path resolves to the call-center screen, not this page). */
const NAV_LINKS = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
]

interface SupportChannel {
  icon: string
  title: string
  description: string
  detail?: string
  detailDir?: 'ltr'
  colorClass: string
  bgClass: string
}

/** Public support hub: channel cards for chat, phone and email — the site's
 *  own header/nav/footer, standalone (no AppShell, no auth gate). */
export function PublicPortalSupport() {
  const { t, theme, toggleTheme } = usePreferences()

  const channels: SupportChannel[] = [
    {
      icon: 'MessageCircle',
      title: t('Live Chat'),
      description: t('Chat with our support team in real-time'),
      detail: t('Available 24/7'),
      colorClass: 'text-salis-blue',
      bgClass: 'bg-[rgba(10,94,215,.08)]',
    },
    {
      icon: 'Phone',
      title: t('Call Us'),
      description: t('Speak to a specialist directly'),
      detail: '+966 11 234 5678',
      detailDir: 'ltr',
      colorClass: 'text-salis-bright',
      bgClass: 'bg-[rgba(11,179,255,.08)]',
    },
    {
      icon: 'Mail',
      title: t('Email'),
      description: t('Send us a detailed message'),
      detail: 'support@salisauto.sa',
      detailDir: 'ltr',
      colorClass: 'text-salis-orange',
      bgClass: 'bg-[rgba(249,115,22,.08)]',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-sidebar px-6 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-salis-gradient">
            <Icon name="Car" size={16} className="text-white" />
          </div>
          <span className="font-display text-base font-extrabold text-heading">
            {t('SALIS AUTO')}
          </span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-ui text-[13px] font-medium text-body no-underline transition-colors hover:text-salis-blue"
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
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <Link
            to="/login"
            className="inline-flex h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
          >
            {t('Sign In')}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] animate-fade-up px-6 py-12 md:px-10 md:py-[60px]">
          <h1 className="m-0 mb-2 text-center font-display text-[32px] font-black text-heading md:text-[40px]">
            {t('Help & Support')}
          </h1>
          <p className="m-0 mb-8 text-center text-base text-muted">{t("We're here to help")}</p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {channels.map((channel) => (
              <div
                key={channel.title}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 ease-salis hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
              >
                <span
                  className={`mb-3 inline-flex rounded-[14px] p-3 ${channel.bgClass} ${channel.colorClass}`}
                >
                  <Icon name={channel.icon} size={24} />
                </span>
                <h3 className="m-0 mb-1.5 text-base font-bold text-heading">{channel.title}</h3>
                <p className="m-0 text-[13px] text-muted">{channel.description}</p>
                {channel.detail ? (
                  <p
                    className="m-0 mt-3 font-action text-[13px] font-semibold text-heading"
                    dir={channel.detailDir}
                  >
                    {channel.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap gap-[60px] border-t border-border bg-sidebar p-10">
        <div className="min-w-[200px]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-salis-gradient">
              <Icon name="Car" size={14} className="text-white" />
            </div>
            <span className="font-display text-sm font-extrabold text-heading">
              {t('SALIS AUTO')}
            </span>
          </div>
          <p className="m-0 max-w-[240px] text-xs text-muted">
            {t('Integrated automotive workshop management system for Saudi Arabia.')}
          </p>
        </div>

        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Product')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('Features')}</span>
            <span className="text-[13px] text-body">{t('Pricing')}</span>
            <Link to="/public-portal/marketplace" className="text-[13px] text-body no-underline">
              {t('Marketplace')}
            </Link>
          </div>
        </div>

        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Company')}
          </p>
          <div className="flex flex-col gap-1.5">
            <Link to="/public-portal/about" className="text-[13px] text-body no-underline">
              {t('About')}
            </Link>
            <Link to="/public-portal/contact" className="text-[13px] text-body no-underline">
              {t('Contact')}
            </Link>
            <Link to="/public-portal/blog" className="text-[13px] text-body no-underline">
              {t('Blog')}
            </Link>
          </div>
        </div>

        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Support')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('Help Center')}</span>
            <Link to="/public-portal/faq" className="text-[13px] text-body no-underline">
              {t('FAQ')}
            </Link>
            <span className="text-[13px] text-body">{t('Terms')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
