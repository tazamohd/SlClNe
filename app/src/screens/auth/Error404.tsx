import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** 404 — the URL doesn't match any known screen. Ungated: shown regardless of
 *  auth state (the catch-all route redirects here). The floating 404 and the two
 *  escape routes follow the same centred-card layout as the other status screens. */
export function Error404() {
  const { t, rtl } = usePreferences()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <main id="main-content" className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.06),transparent_65%)] blur-[64px]" />
      </div>

      <div className={`relative z-[1] flex animate-fade-up motion-reduce:animate-none flex-col items-center text-center ${isMobile ? 'max-w-full gap-4' : 'max-w-[400px] gap-6'}`}>
        {/* Floating 404 — the design's signature element. */}
        <div className="animate-float motion-reduce:animate-none">
          <span className={`bg-salis-gradient-r bg-clip-text font-display font-black leading-none text-transparent drop-shadow-[0_4px_20px_rgba(10,94,215,.2)] ${isMobile ? 'text-[80px]' : 'text-[120px]'}`}>
            404
          </span>
        </div>

        <div>
          <h1 className={`font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
            {t('Page Not Found')}
          </h1>
          <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
            {t("The page you're looking for doesn't exist or has been moved.")}
          </p>
        </div>

        <div className={`flex gap-2.5 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Link
            to="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-salis-gradient px-5 font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
          >
            <Icon name="Home" size={16} />
            {t('Go to Dashboard')}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-border-strong bg-transparent px-5 font-action text-sm font-medium text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            aria-label={t('Go Back')}
          >
            <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={16} />
            {t('Go Back')}
          </button>
        </div>
      </div>
    </main>
  )
}
