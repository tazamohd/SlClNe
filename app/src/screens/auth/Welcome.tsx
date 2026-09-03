import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Product intro — step 1 of the first-run chain. Leads into the language
 *  picker rather than straight to Login, so a first-time visitor sets
 *  language and region before being asked for credentials; a returning user
 *  takes the "Sign in" link underneath. */
const VALUES = [
  { icon: 'Wrench', text: 'Every job from check-in to delivery' },
  { icon: 'Receipt', text: 'Estimates, invoices and payments in SAR' },
  { icon: 'Languages', text: 'Arabic and English on any device' },
] as const

export function Welcome() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <AuthLayout step={{ index: 1, of: 4 }} className="mx-auto max-w-[460px]">
      <div className={`flex flex-col items-center text-center ${isMobile ? 'gap-4' : 'gap-6'}`}>
        <BrandMark width={isMobile ? 120 : 150} />
        <div>
          <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-[28px]'}`}>
            {t('Welcome to SALIS AUTO')}
          </h1>
          <p className={`mt-2.5 font-action text-muted ${isMobile ? 'text-sm' : 'text-[15px]'}`}>
            {t('Integrated automotive workshop management system')}
          </p>
        </div>

        <ul className="flex w-full flex-col gap-2 text-start">
          {VALUES.map((item) => (
            <li
              key={item.icon}
              className="flex min-h-[44px] items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-tint-blue text-salis-blue">
                <Icon name={item.icon} size={16} />
              </span>
              <span className="font-action text-[13px] font-medium text-heading">{t(item.text)}</span>
            </li>
          ))}
        </ul>

        <Link
          to="/language-selection"
          className={`box-border inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-salis-gradient font-action font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-all duration-200 hover:-translate-y-px hover:text-white hover:no-underline ${isMobile ? 'h-11 text-sm' : 'h-12 text-[15px]'}`}
        >
          {t('Get Started')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
        </Link>

        <p className="font-action text-sm text-muted">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="inline-flex min-h-[44px] items-center font-semibold">
            {t('Sign in')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
