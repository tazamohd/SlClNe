import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'

const NAV_LINKS: { label: string; to: string }[] = [
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

const LOAN_TERM_MONTHS = 60
const LOAN_APR_PERCENT = 3.5

/** Standard amortized monthly payment for a fixed-rate loan. The design's own
 *  calculator card was inert display text (a static "SAR 2,400" mock-up) —
 *  this port wires the two fields to real state so the estimate reacts to
 *  what the visitor types, seeded with the design's demo figures. */
function monthlyPayment(principal: number, aprPercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = aprPercent / 100 / 12
  if (monthlyRate === 0) return principal / months
  const factor = (1 + monthlyRate) ** months
  return (principal * monthlyRate * factor) / (factor - 1)
}

/** Public marketing site page with a live vehicle-loan calculator. Renders
 *  its own header/nav/footer, no AppShell/RequireAccess — this lives outside
 *  the authenticated product. Ported from PublicPortal.Loans.dc.html. */
export function PublicPortalLoans() {
  const { t, rtl, theme, toggleTheme } = usePreferences()

  const [vehiclePrice, setVehiclePrice] = useState(150_000)
  const [downPayment, setDownPayment] = useState(30_000)

  const downPaymentPercent = vehiclePrice > 0 ? Math.round((downPayment / vehiclePrice) * 100) : 0
  const loanAmount = Math.max(vehiclePrice - downPayment, 0)
  const estimatedMonthly = useMemo(
    () => monthlyPayment(loanAmount, LOAN_APR_PERCENT, LOAN_TERM_MONTHS),
    [loanAmount]
  )

  return (
    <div className="flex min-h-screen flex-col bg-page font-ui" dir={rtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-sidebar px-4 sm:px-10">
        <Link to="/public-portal/landing" className="flex items-center gap-2 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient">
            <Icon name="Car" size={16} className="text-white" />
          </span>
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <Link
            to="/login"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-salis-gradient px-4 font-action text-[13px] font-semibold text-white no-underline hover:text-white hover:no-underline"
          >
            {t('Sign In')}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] animate-fade-up motion-reduce:animate-none px-4 py-12 sm:px-10 sm:py-[60px]">
          <h1 className="m-0 mb-2 font-display text-[28px] font-black text-heading sm:text-[40px]">
            {t('Auto Financing')}
          </h1>
          <p className="m-0 mb-8 text-base text-muted">
            {t('Flexible vehicle financing options with competitive rates')}
          </p>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <h3 className="m-0 mb-5 text-xl font-bold text-heading">{t('Loan Calculator')}</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="loan-vehicle-price" className="text-xs font-medium text-body">
                  {t('Vehicle Price')}
                </label>
                <Input
                  id="loan-vehicle-price"
                  dir="ltr"
                  inputMode="numeric"
                  className="font-mono"
                  value={vehiclePrice.toLocaleString('en-US')}
                  onChange={(event) => setVehiclePrice(parseSar(event.target.value))}
                  aria-label={t('Vehicle Price')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="loan-down-payment" className="text-xs font-medium text-body">
                  {t('Down Payment')}
                </label>
                <Input
                  id="loan-down-payment"
                  dir="ltr"
                  inputMode="numeric"
                  className="font-mono"
                  value={`${downPayment.toLocaleString('en-US')} (${downPaymentPercent}%)`}
                  onChange={(event) => setDownPayment(parseSar(event.target.value))}
                  aria-label={t('Down Payment')}
                />
              </div>
            </div>

            <div className="mt-5 rounded-[14px] border border-salis-blue/15 bg-salis-blue/[.04] p-6 text-center">
              <p className="m-0 text-sm text-muted">{t('Estimated Monthly Payment')}</p>
              <p className="mt-2 font-display text-4xl font-black text-salis-blue">
                <Money sar={estimatedMonthly} />
              </p>
              <p className="mt-1.5 text-[13px] text-muted">
                <span dir="ltr">{LOAN_TERM_MONTHS}</span> {t('months at')}{' '}
                <span dir="ltr">{LOAN_APR_PERCENT}%</span> {t('APR')}
              </p>
            </div>

            <button
              type="button"
              className="mt-5 h-12 w-full cursor-pointer rounded-lg border-none bg-salis-gradient font-action text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]"
            >
              {t('Apply Now')}
            </button>
          </div>
        </div>
      </main>

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
