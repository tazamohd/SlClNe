import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import type { Language } from '@/data/types'

/** Language picker + notification opt-in — the first screen of the signup
 *  chain (LanguageSelection → RegionSelection → Login).
 *
 *  Picking a language applies it immediately: the heading, the buttons and the
 *  page direction all flip under you, so you can see the choice before
 *  committing to it. */
export function LanguageSelection() {
  const { t, language, setLanguage, notifications, setNotifications, rtl } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      {/* Single blue orb at the top inline-end corner — this screen is quieter
          than Login, which carries three. */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute end-0 top-0 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.1),transparent_65%)] blur-[64px]" />
      </div>

      <div className={`relative z-[1] flex animate-fade-up flex-col items-center ${isMobile ? 'max-w-full gap-4 px-3 py-4' : 'max-w-[440px] gap-[22px] px-4 py-6'}`}>
        <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" className={`h-auto ${isMobile ? 'w-20' : 'w-28'}`} />
        <h1 className={`text-center font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
          {t('Choose your language')}
        </h1>

        <div className="flex w-full gap-3.5">
          <LanguageCard
            flag="🇬🇧"
            label={t('English')}
            selected={language === 'en'}
            onSelect={() => setLanguage('en')}
            value="en"
          />
          <LanguageCard
            flag="🇸🇦"
            label={t('Arabic')}
            selected={language === 'ar'}
            onSelect={() => setLanguage('ar')}
            value="ar"
          />
        </div>

        <div className={`flex w-full flex-col gap-3.5 rounded-lg border border-border bg-card ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-white shadow-[0_4px_10px_rgba(10,94,215,.25)]">
              <Icon name="Bell" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-action text-sm font-bold text-heading">{t('Stay in the loop')}</p>
              <p className="mt-0.5 text-pretty text-xs leading-[1.4] text-muted">
                {t(
                  'Turn on notifications to receive news, appointment reminders and job updates.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={() => setNotifications(!notifications)}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-3.5 py-3',
              'font-action text-[13.5px] font-semibold transition-all duration-150',
              notifications
                ? 'border-salis-blue bg-salis-blue/5 text-salis-blue dark:bg-salis-navy'
                : 'border-border bg-inset text-body'
            )}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  'h-2 w-2 flex-shrink-0 rounded-full',
                  notifications ? 'bg-salis-blue' : 'bg-[#94A3B8]'
                )}
              />
              <span>{t('Enable notifications')}</span>
            </span>
            {/* Knob position is driven by `rtl` rather than a CSS transform so
                the switch travels the correct way in Arabic. */}
            <span
              className={cn(
                'relative h-[22px] w-[38px] flex-shrink-0 rounded-full transition-colors duration-150',
                notifications ? 'bg-salis-blue' : 'bg-[#CBD5E1]'
              )}
            >
              <span
                className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-[left,right] duration-150"
                style={
                  rtl
                    ? { right: notifications ? 2 : 18 }
                    : { left: notifications ? 18 : 2 }
                }
              />
            </span>
          </button>

          <p className="text-center text-[11px] text-muted">
            {t('You can change this later in Settings.')}
          </p>
        </div>

        <Link
          to="/region-selection"
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </div>
  )
}

function LanguageCard({
  flag,
  label,
  selected,
  onSelect,
  value,
}: {
  flag: string
  label: string
  selected: boolean
  onSelect: () => void
  value: Language
}) {
  return (
    <button
      type="button"
      lang={value}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border p-5',
        'font-action transition-all duration-150',
        selected
          ? 'border-salis-blue bg-salis-blue/5 text-salis-blue dark:bg-salis-navy'
          : 'border-border bg-card text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
      )}
    >
      <span className="text-2xl" aria-hidden>
        {flag}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}
