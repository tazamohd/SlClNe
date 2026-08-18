import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** System maintenance banner — PUBLIC terminal-state screen shown when the
 *  whole app is offline for upgrades. No app shell, no role check: this must
 *  render even for a visitor with no session at all. */
export function Maintenance() {
  const { t } = usePreferences()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-page p-6 font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute -bottom-[150px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.08),transparent_65%)] blur-[64px]" />
      </div>

      <div className="relative z-[1] flex max-w-[420px] animate-fade-up flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="flex h-[100px] w-[100px] animate-[spin_8s_linear_infinite] items-center justify-center rounded-full border-[3px] border-dashed border-[rgba(10,94,215,.2)]">
            <Icon name="Cog" size={44} className="text-salis-blue opacity-60" />
          </div>
          <div className="absolute -top-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_2px_8px_rgba(10,94,215,.4)]">
            <Icon name="Wrench" size={14} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-[22px] font-extrabold text-heading">
            {t('System Under Maintenance')}
          </h1>
          <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
            {t("We're upgrading the system to serve you better. We'll be back shortly.")}
          </p>
        </div>

        <div className="box-border flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted">{t('Est. Return')}</span>
            <span className="font-mono font-semibold text-salis-blue" dir="ltr">
              ~30 {t('min')}
            </span>
          </div>
          <div className="h-1 rounded-full bg-inset">
            <div className="h-full w-[65%] rounded-full bg-salis-gradient transition-[width] duration-1000 ease-salis" />
          </div>
        </div>

        <p className="m-0 font-action text-xs text-faint">
          {t('Need help?')}{' '}
          <a href="mailto:support@salisauto.com" className="font-semibold">
            support@salisauto.com
          </a>
        </p>
      </div>
    </div>
  )
}
