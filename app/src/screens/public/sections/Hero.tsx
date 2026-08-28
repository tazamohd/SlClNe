import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'

/** The landing hero — badge pill, gradient display heading, subtitle, and a
 *  primary/secondary CTA pair — as `PublicPortal.Landing.dc.html` draws it.
 *
 *  Configured per page (§32): every string and destination is a prop, so a
 *  Tier B page next tranche composes this rather than re-implementing it.
 *  Copy passes through `t()` inside, so callers hand over English source
 *  strings exactly as everywhere else in the app. */
export interface HeroCta {
  label: string
  to: string
}

export interface HeroProps {
  badge: string
  title: string
  description: string
  primaryCta: HeroCta
  secondaryCta?: HeroCta
}

export function Hero({ badge, title, description, primaryCta, secondaryCta }: HeroProps) {
  const t = useT()
  return (
    <section className="relative overflow-hidden px-5 py-14 text-center md:px-10 md:py-20">
      {/* Decorative radial glow, anchored to the inline end like the design's
          `right:0` (logical, so it mirrors under RTL). */}
      <div
        aria-hidden
        className="absolute end-0 top-0 h-[600px] w-[600px] rounded-full blur-[64px]"
        style={{ background: 'radial-gradient(circle, rgba(10,94,215,.06), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-[720px] animate-fade-up motion-reduce:animate-none">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-salis-blue/[.08] px-3.5 py-1 text-[13px] font-semibold text-salis-blue">
          {t(badge)}
        </span>
        <h1 className="m-0 bg-salis-gradient-r bg-clip-text font-display text-4xl font-black leading-[1.1] text-transparent md:text-[52px]">
          {t(title)}
        </h1>
        <p className="mx-auto mb-0 mt-5 max-w-[540px] text-base leading-[1.6] text-muted md:text-lg">
          {t(description)}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={primaryCta.to}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-salis-gradient px-7 font-action text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_rgba(10,94,215,.3)] hover:no-underline"
          >
            {t(primaryCta.label)}
          </Link>
          {secondaryCta ? (
            <Link
              to={secondaryCta.to}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-salis-blue px-7 font-action text-[15px] font-medium text-salis-blue no-underline hover:no-underline"
            >
              {t(secondaryCta.label)}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
