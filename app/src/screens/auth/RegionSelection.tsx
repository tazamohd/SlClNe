import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'

/** City picker. The choice scopes which branch a customer signs up against —
 *  `POST /public/customers/register` carries it alongside `garageId`
 *  (README §6b), so it's persisted rather than kept in component state. */
const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah'] as const

export function RegionSelection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [picked, setPicked] = useState<string>(
    () => readStored(STORAGE_KEYS.region) ?? 'Riyadh'
  )

  const select = (city: string) => {
    writeStored(STORAGE_KEYS.region, city)
    setPicked(city)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute bottom-0 start-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,var(--tint-bright),transparent_65%)] blur-[64px]" />
      </div>

      <div className={`relative z-[1] flex w-full animate-fade-up flex-col ${isMobile ? 'max-w-full gap-4 p-3' : 'max-w-[420px] gap-5 p-4'}`}>
        <div className="text-center">
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            className={`mx-auto h-auto ${isMobile ? 'w-[80px]' : 'w-[100px]'}`}
          />
          <h1 className={`mt-3 font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {t('Select your region')}
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          {CITIES.map((city) => {
            const on = picked === city
            return (
              <button
                key={city}
                type="button"
                aria-pressed={on}
                onClick={() => select(city)}
                className={cn(
                  'box-border flex h-12 w-full cursor-pointer items-center gap-2.5 rounded px-4',
                  'font-action text-sm font-medium transition-all duration-150',
                  on
                    ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue'
                    : 'border border-border bg-card text-body'
                )}
              >
                <Icon name="MapPin" size={16} />
                <span>{t(city)}</span>
                <span className="flex-1" />
                {on ? <Icon name="Check" size={16} /> : null}
              </button>
            )
          })}
        </div>

        <Link
          to="/login"
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </div>
  )
}
