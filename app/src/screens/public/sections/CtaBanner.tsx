import { Link } from 'react-router-dom'
import { useT } from '@/providers/PreferencesProvider'

/** A full-width call-to-action banner — gradient background with white text,
 *  centered heading, description, and one or two CTA buttons.
 *
 *  The primary CTA is a white pill with blue text (inverted from the Hero's
 *  gradient button); the optional secondary CTA is a white-outlined ghost
 *  button. Uses `bg-salis-gradient` for the background, consistent with the
 *  Hero's gradient vocabulary. */
export interface CtaBannerProps {
  title: string
  description: string
  primaryCta: { label: string; to: string }
  secondaryCta?: { label: string; to: string }
}

export function CtaBanner({ title, description, primaryCta, secondaryCta }: CtaBannerProps) {
  const t = useT()
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px] rounded-2xl bg-salis-gradient px-6 py-12 text-center md:px-12 md:py-16">
        <h2 className="mb-3 mt-0 font-display text-3xl font-black text-white md:text-[36px]">
          {t(title)}
        </h2>
        <p className="mx-auto mb-8 mt-0 max-w-[540px] text-base leading-[1.6] text-[rgba(255,255,255,.85)]">
          {t(description)}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={primaryCta.to}
            className="inline-flex h-12 items-center justify-center rounded-[10px] bg-white px-7 font-action text-[15px] font-semibold text-salis-blue no-underline shadow-[0_8px_24px_rgba(0,0,0,.15)] hover:no-underline"
          >
            {t(primaryCta.label)}
          </Link>
          {secondaryCta ? (
            <Link
              to={secondaryCta.to}
              className="inline-flex h-12 items-center justify-center rounded-[10px] border-[1.5px] border-white px-7 font-action text-[15px] font-medium text-white no-underline hover:no-underline"
            >
              {t(secondaryCta.label)}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
