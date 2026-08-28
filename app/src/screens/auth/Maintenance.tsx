import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** System maintenance page. Shown when the platform is being upgraded —
 *  a spinning cog, an estimated return, and the support email. Ungated:
 *  it must be reachable regardless of auth state since the API itself may
 *  be down. */
export function Maintenance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute bottom-[-150px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.08),transparent_65%)] blur-[64px]" />
      </div>

      <div className={`relative z-[1] flex animate-fade-up flex-col items-center text-center ${isMobile ? 'max-w-full gap-4' : 'max-w-[420px] gap-6'}`}>
        {/* Spinning cog with wrench badge — the design's maintenance motif. */}
        <div className="relative">
          <div className={`flex animate-spin-slow items-center justify-center rounded-full border-[3px] border-dashed border-salis-blue/[.2] ${isMobile ? 'h-[80px] w-[80px]' : 'h-[100px] w-[100px]'}`}>
            <Icon name="Cog" size={isMobile ? 34 : 44} className="text-salis-blue opacity-60" />
          </div>
          <div className="absolute -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_2px_8px_rgba(10,94,215,.4)] -end-1">
            <Icon name="Wrench" size={14} />
          </div>
        </div>

        <div>
          <h1 className={`font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
            {t('System Under Maintenance')}
          </h1>
          <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
            {t("We're upgrading the system to serve you better. We'll be back shortly.")}
          </p>
        </div>

        {/* Estimated return card with progress bar */}
        <div className={`box-border flex w-full flex-col gap-2 rounded-xl border border-border bg-card ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted">{t('Est. Return')}</span>
            <span className="font-mono font-semibold text-salis-blue" dir="ltr">
              ~30 {t('min')}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-inset">
            <div className="h-full w-[65%] rounded-full bg-salis-gradient transition-[width] duration-1000 ease-out" />
          </div>
        </div>

        <p className="text-xs text-faint">
          {t('Need help?')}{' '}
          <a
            href="mailto:support@salisauto.com"
            className="font-semibold text-salis-blue no-underline hover:underline"
          >
            support@salisauto.com
          </a>
        </p>
      </div>
    </div>
  )
}
