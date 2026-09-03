import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { writeStored, STORAGE_KEYS } from '@/lib/storage'
import { REGION_CITIES, storedRegion } from './firstRun'

/** City picker — step 3 of the first-run chain. The choice scopes which branch
 *  a customer signs up against — `POST /public/customers/register` carries it
 *  alongside `garageId` (README §6b), so it's persisted rather than kept in
 *  component state, and Login reads it back for its summary chip. */
export function RegionSelection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [picked, setPicked] = useState<string>(storedRegion)

  const select = (city: string) => {
    writeStored(STORAGE_KEYS.region, city)
    setPicked(city)
  }

  return (
    <AuthLayout step={{ index: 3, of: 4, back: '/language-selection' }} className="mx-auto max-w-[460px]">
      <div className={`flex w-full flex-col ${isMobile ? 'gap-4' : 'gap-5'}`}>
        <div className="text-center">
          <img
            src="/assets/logo-blue-orange.png"
            alt="SALIS AUTO"
            width={1024}
            height={1024}
            className={`mx-auto h-auto ${isMobile ? 'w-[80px]' : 'w-[100px]'}`}
          />
          <h1 className={`mt-3 font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {t('Select your region')}
          </h1>
        </div>

        <div className="flex flex-col gap-2" role="group" aria-label={t('Region')}>
          {REGION_CITIES.map((city) => {
            const on = picked === city
            return (
              <button
                key={city}
                type="button"
                aria-pressed={on}
                onClick={() => select(city)}
                className={cn(
                  'box-border flex h-12 w-full cursor-pointer items-center gap-2.5 rounded px-4',
                  'font-action text-sm font-medium transition-all duration-150 hover:border-salis-blue/40 hover:shadow-sm',
                  on
                    ? 'border-[1.5px] border-salis-blue bg-salis-blue/[.06] text-salis-blue'
                    : 'border border-border bg-card text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
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
          // The default is persisted too, so Login's chip shows what was chosen
          // even when the user accepted the pre-selected city.
          onClick={() => writeStored(STORAGE_KEYS.region, picked)}
          className="box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-all duration-200 hover:-translate-y-px hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
      </div>
    </AuthLayout>
  )
}
