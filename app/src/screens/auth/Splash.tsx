import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** How long the boot screen holds before Welcome, matching the design. */
export const SPLASH_MS = 2200

/** Boot screen. Auto-advances to Welcome after 2.2s, matching the design.
 *
 *  The prototype's version was a dead end for keyboard and screen-reader users
 *  — nothing to activate, no announcement. The timer stays (it's the designed
 *  behaviour) but the region is announced and the whole screen is a skip
 *  target, so nobody is stuck waiting on it. Under "reduce motion" the fade,
 *  the halo pulse and the progress sweep are dropped; the redirect keeps the
 *  same timer, because the wait is the product's, not the animation's. */
export function Splash() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/welcome', { replace: true }), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <main id="main-content">
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

      <div
        data-testid="splash-stage"
        className={cn(
          'relative z-[1] flex flex-col items-center',
          !reducedMotion && 'animate-fade-up motion-reduce:animate-none',
          isMobile ? 'gap-4' : 'gap-6'
        )}
      >
        <div className="relative">
          <div
            className={cn(
              'absolute -inset-5 rounded-[20px] bg-salis-gradient opacity-25 blur-[28px]',
              !reducedMotion && 'animate-pulse motion-reduce:animate-none'
            )}
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
          <div className={cn('h-full rounded-full bg-salis-gradient-r', reducedMotion ? 'w-full' : 'w-3/5')} />
        </div>
        <p role="status" className="font-action text-[13px] text-muted">
          {t('Loading...')}
        </p>
      </div>
    </button>
    </main>
  )
}
