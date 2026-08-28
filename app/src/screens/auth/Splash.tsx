import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Boot screen. Auto-advances to Welcome after 2.2s, matching the design.
 *
 *  The prototype's version was a dead end for keyboard and screen-reader users
 *  — nothing to activate, no announcement. The timer stays (it's the designed
 *  behaviour) but the region is announced and the whole screen is a skip
 *  target, so nobody is stuck waiting on it. */
export function Splash() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/welcome', { replace: true }), 2200)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <button
      type="button"
      onClick={() => navigate('/welcome', { replace: true })}
      aria-label={t('Get Started')}
      className="relative flex min-h-screen w-full cursor-default items-center justify-center overflow-hidden border-none bg-page font-ui focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,var(--tint-blue),transparent_65%)] blur-[64px]" />
        <div className="absolute bottom-0 start-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--tint-bright),transparent_65%)] blur-[64px]" />
      </div>

      <div className={`relative z-[1] flex animate-fade-up motion-reduce:animate-none flex-col items-center ${isMobile ? 'gap-4' : 'gap-6'}`}>
        <div className="relative">
          <div
            className="absolute -inset-5 animate-pulse motion-reduce:animate-none rounded-[20px] bg-salis-gradient opacity-25 blur-[28px]"
            aria-hidden
          />
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            width={1024}
            height={1024}
            className={`relative h-auto ${isMobile ? 'w-[140px]' : 'w-[180px]'}`}
          />
        </div>
        <div className={`h-1 overflow-hidden rounded-full bg-salis-blue/[.12] ${isMobile ? 'w-32' : 'w-40'}`}>
          <div className="h-full w-3/5 rounded-full bg-salis-gradient-r" />
        </div>
        <p role="status" className="font-action text-[13px] text-muted">
          {t('Loading...')}
        </p>
      </div>
    </button>
  )
}
