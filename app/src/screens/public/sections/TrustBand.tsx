import { useT } from '@/providers/PreferencesProvider'

/** A trust-indicator strip — a muted headline like "Trusted by 500+ workshops
 *  across Saudi Arabia" followed by a horizontal row of partner/client names
 *  rendered as faded text placeholders with dot separators.
 *
 *  Follows the StatBand horizontal pattern but styled as a subdued confidence
 *  signal rather than a stat grid. */
export interface TrustBandProps {
  headline: string
  logos: readonly string[]
}

export function TrustBand({ headline, logos }: TrustBandProps) {
  const t = useT()
  return (
    <section className="px-5 py-10 text-center md:px-10 md:py-14">
      <p className="mb-6 mt-0 text-[13px] font-medium uppercase tracking-[.08em] text-muted">
        {t(headline)}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {logos.map((name, index) => (
          <span key={name} className="flex items-center gap-5">
            {index > 0 && (
              <span
                aria-hidden
                className="hidden h-1 w-1 rounded-full bg-salis-blue/[.25] sm:block"
              />
            )}
            <span className="text-[14px] font-semibold text-salis-navy/[.35] dark:text-white/[.3]">
              {name}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
