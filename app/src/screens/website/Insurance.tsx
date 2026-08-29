import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'

interface InsurancePlan {
  name: string
  desc: string
  sar: number
  popular: boolean
  cta: string
  features: string[]
}

const PLANS: InsurancePlan[] = [
  {
    name: 'Comprehensive',
    desc: 'Full coverage including accidents, theft, and natural disasters',
    sar: 2400,
    popular: true,
    cta: 'Get Quote',
    features: [
      'Accident damage repair',
      'Theft & natural disaster protection',
      'Third-party liability',
      'Roadside assistance',
    ],
  },
  {
    name: 'Third Party',
    desc: 'Mandatory coverage for third-party liability',
    sar: 850,
    popular: false,
    cta: 'Get Quote',
    features: ['Third-party liability', 'Legal compliance', 'Basic roadside assistance'],
  },
]

const PARTNERS = [
  { name: 'Tawuniya', icon: 'ShieldCheck' },
  { name: 'Bupa Arabia', icon: 'Shield' },
  { name: 'Walaa', icon: 'ShieldCheck' },
  { name: 'Malath', icon: 'Shield' },
]

const NAV_LINKS: { label: string; to: string }[] = [
  { label: 'Home', to: '/public-portal/landing' },
  { label: 'About', to: '/public-portal/about' },
  { label: 'Services', to: '/public-portal/services' },
  { label: 'Marketplace', to: '/public-portal/marketplace' },
  { label: 'Contact', to: '/public-portal/contact' },
  { label: 'Blog', to: '/public-portal/blog' },
]

/** Public marketing site page — vehicle insurance plans. Standalone, renders
 *  its own header/nav/footer rather than the app shell, since it lives
 *  outside the authenticated product (matches the other `screens/website/*`
 *  pages, e.g. `Services.tsx`, `Contact.tsx`). */
export function PublicPortalInsurance() {
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
        <nav
          className="flex flex-1 items-center justify-center gap-3 overflow-x-auto sm:gap-6"
          aria-label={t('Primary')}
        >
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
        <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-4 py-12 sm:px-10 sm:py-[60px]">
          <h1 className="m-0 mb-2 font-display text-[28px] font-black text-heading sm:text-[40px]">
            {t('Vehicle Insurance')}
          </h1>
          <p className="m-0 mb-8 text-base text-muted">
            {t('Comprehensive and third-party coverage for your vehicles')}
          </p>

          {/* ── Plan cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.popular
                    ? 'rounded-2xl border-2 border-salis-blue bg-card p-6'
                    : 'rounded-2xl border border-border bg-card p-6'
                }
              >
                {plan.popular ? (
                  <span className="mb-3 inline-flex items-center rounded-full bg-[rgba(10,94,215,.1)] px-3 py-1 text-xs font-semibold text-salis-blue">
                    {t('Popular')}
                  </span>
                ) : (
                  <div className="mt-3" aria-hidden />
                )}
                <h3 className="m-0 mb-1.5 text-xl font-bold text-heading">{t(plan.name)}</h3>
                <p className="m-0 mb-4 text-[13px] text-muted">{t(plan.desc)}</p>
                <p className="m-0">
                  <Money
                    sar={plan.sar}
                    className={
                      plan.popular
                        ? 'font-display text-[28px] font-black text-salis-blue'
                        : 'font-display text-[28px] font-black text-heading'
                    }
                  />
                  <span className="text-sm font-normal text-muted">{t('/year')}</span>
                </p>

                <ul className="m-0 mb-2 mt-4 flex list-none flex-col gap-2 p-0">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[13px] text-body">
                      <Icon name="Check" size={14} className="shrink-0 text-salis-blue" />
                      {t(feature)}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={
                    plan.popular
                      ? 'mt-4 h-11 w-full cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-sm font-semibold text-white'
                      : 'mt-4 h-11 w-full cursor-pointer rounded-lg border-[1.5px] border-salis-blue bg-transparent font-action text-sm font-medium text-salis-blue'
                  }
                >
                  {t(plan.cta)}
                </button>
              </div>
            ))}
          </div>

          {/* ── Underwriting partners ────────────────────────────────── */}
          <div className="mt-12">
            <p className="m-0 mb-4 text-xs font-semibold uppercase tracking-[.05em] text-muted">
              {t('Underwritten by our insurance partners')}
            </p>
            <div className="flex flex-wrap gap-3">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5"
                >
                  <Icon name={partner.icon} size={16} className="text-salis-blue" />
                  <span dir="ltr" className="text-[13px] font-semibold text-heading">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap gap-10 border-t border-border bg-sidebar p-6 sm:gap-[60px] sm:p-10">
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
