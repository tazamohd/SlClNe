import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface ServiceEntry {
  name: string
  desc: string
  icon: string
  iconClass: string
}

const SERVICES: ServiceEntry[] = [
  {
    name: 'Maintenance',
    desc: 'Scheduled servicing and oil changes',
    icon: 'Wrench',
    iconClass: 'bg-salis-blue/10 text-salis-blue',
  },
  {
    name: 'Repair',
    desc: 'Engine, transmission & general repair',
    icon: 'Cog',
    iconClass: 'bg-salis-bright/10 text-salis-bright',
  },
  {
    name: 'Diagnostics',
    desc: 'Computer diagnostics & troubleshooting',
    icon: 'SearchCheck',
    iconClass: 'bg-salis-orange/10 text-salis-orange',
  },
  {
    name: 'Inspection',
    desc: 'Multi-point vehicle inspections',
    icon: 'ClipboardCheck',
    iconClass: 'bg-salis-navy/10 text-salis-navy',
  },
  {
    name: 'Tire Service',
    desc: 'Tire change, rotation & alignment',
    icon: 'CircleDot',
    iconClass: 'bg-salis-blue/10 text-salis-blue',
  },
  {
    name: 'Body & Paint',
    desc: 'Collision repair and repainting',
    icon: 'Car',
    iconClass: 'bg-salis-bright/10 text-salis-bright',
  },
  {
    name: 'AC Service',
    desc: 'AC repair, regas & maintenance',
    icon: 'Wind',
    iconClass: 'bg-salis-orange/10 text-salis-orange',
  },
  {
    name: 'Oil Change',
    desc: 'Full synthetic & conventional oil',
    icon: 'Droplets',
    iconClass: 'bg-salis-navy/10 text-salis-navy',
  },
]

const NAV_LINKS: { label: string; to: string }[] = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
]

/** Public marketing site page listing the workshop's service catalog.
 *  Standalone — renders its own header/nav/footer rather than the app shell,
 *  since it lives outside the authenticated product. */
export function PublicPortalServices() {
  const { t, rtl, theme, toggleTheme } = usePreferences()

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui" dir={rtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-sidebar px-4 sm:px-10">
        <Link to="/public-portal/landing" className="flex items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
            <Icon name="Car" size={16} className="text-white" />
          </div>
          <span className="font-display text-base font-extrabold text-heading">
            {t('SALIS AUTO')}
          </span>
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-3 overflow-x-auto sm:gap-6" aria-label={t('Primary')}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap text-[13px] font-medium text-body no-underline transition-colors hover:text-salis-blue"
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
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
            className="inline-flex h-9 items-center rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
          >
            {t('Sign In')}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1100px] animate-fade-up px-4 py-12 sm:px-10 sm:py-[60px]">
          <h1 className="m-0 mb-2 text-center font-display text-[28px] font-black text-heading sm:text-[40px]">
            {t('Our Services')}
          </h1>
          <p className="m-0 mb-10 text-center text-base text-muted">
            {t('Everything your workshop needs to deliver exceptional service')}
          </p>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className="cursor-pointer rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-salis-blue/30 hover:shadow-lg"
              >
                <span className={`inline-flex rounded-[14px] p-3.5 ${service.iconClass}`}>
                  <Icon name={service.icon} size={24} />
                </span>
                <h3 className="m-0 mb-1.5 mt-3 text-[15px] font-bold text-heading">
                  {t(service.name)}
                </h3>
                <p className="m-0 text-xs text-muted">{t(service.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar p-6 sm:gap-[60px] sm:p-10">
        <div className="min-w-[200px]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-salis-gradient">
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
            <span className="text-[13px] text-body">{t('Marketplace')}</span>
          </div>
        </div>
        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Company')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('About')}</span>
            <span className="text-[13px] text-body">{t('Contact')}</span>
            <span className="text-[13px] text-body">{t('Blog')}</span>
          </div>
        </div>
        <div>
          <p className="m-0 mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t('Support')}
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-body">{t('Help Center')}</span>
            <span className="text-[13px] text-body">{t('FAQ')}</span>
            <span className="text-[13px] text-body">{t('Terms')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
