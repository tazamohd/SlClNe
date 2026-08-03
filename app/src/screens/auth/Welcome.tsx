import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Product intro. Leads into the language chain rather than straight to Login,
 *  so a first-time visitor sets language and region before being asked for
 *  credentials. */
export function Welcome() {
  const { t, rtl, toggleLanguage } = usePreferences()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.1),transparent_65%)] blur-[64px]" />
        <div className="absolute bottom-0 start-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,.06),transparent_65%)] blur-[64px]" />
      </div>

      <div className="absolute end-4 top-4 z-50">
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-8 cursor-pointer rounded border border-border bg-card px-2.5 font-action text-xs text-muted"
        >
          {rtl ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="relative z-[1] flex max-w-[420px] animate-fade-up flex-col items-center gap-6 p-4 text-center">
        <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" className="h-auto w-[140px]" />
        <div>
          <h1 className="font-display text-[28px] font-black text-heading">
            {t('Welcome to SALIS AUTO')}
          </h1>
          <p className="mt-2.5 font-action text-[15px] text-muted">
            {t('Integrated automotive workshop management system')}
          </p>
        </div>
        <Link
          to="/language-selection"
          className="box-border inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Get Started')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
        </Link>
      </div>
    </div>
  )
}
