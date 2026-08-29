import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Product intro. Leads into the language chain rather than straight to Login,
 *  so a first-time visitor sets language and region before being asked for
 *  credentials. */
export function Welcome() {
  const { t, rtl, toggleLanguage } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <main id="main-content" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,var(--tint-blue),transparent_65%)] blur-[64px]" />
        <div className="absolute bottom-0 start-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,.06),transparent_65%)] blur-[64px]" />
      </div>

      <div className="absolute end-4 top-4 z-50">
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-8 cursor-pointer rounded border border-border bg-card px-2.5 font-action text-xs text-muted focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {rtl ? 'English' : 'عربي'}
        </button>
      </div>

      <div className={`relative z-[1] flex animate-fade-up motion-reduce:animate-none flex-col items-center text-center ${isMobile ? 'max-w-full gap-4 p-3' : 'max-w-[420px] gap-6 p-4'}`}>
        <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" width={1024} height={1024} className={`h-auto ${isMobile ? 'w-[110px]' : 'w-[140px]'}`} />
        <div>
          <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-[28px]'}`}>
            {t('Welcome to SALIS AUTO')}
          </h1>
          <p className={`mt-2.5 font-action text-muted ${isMobile ? 'text-sm' : 'text-[15px]'}`}>
            {t('Integrated automotive workshop management system')}
          </p>
        </div>
        <Link
          to="/language-selection"
          className={`box-border inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-salis-gradient font-action font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline ${isMobile ? 'h-11 text-sm' : 'h-12 text-[15px]'}`}
        >
          {t('Get Started')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
        </Link>
      </div>
    </main>
  )
}
