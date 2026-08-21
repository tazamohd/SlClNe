import { useT } from '@/providers/PreferencesProvider'

/** A partner/integration logos section — title, subtitle, and a row of partner
 *  names rendered as pill badges in a flex-wrap layout.
 *
 *  Uses the same translucent blue wash as the tint system's pill variant,
 *  keeping the visual language consistent with IconCardGrid's tinted chips. */
export interface PartnerLogosProps {
  title: string
  subtitle: string
  partners: readonly string[]
}

export function PartnerLogos({ title, subtitle, partners }: PartnerLogosProps) {
  const t = useT()
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[960px] text-center">
        <h2 className="mb-2 mt-0 font-display text-3xl font-black text-heading md:text-[36px]">
          {t(title)}
        </h2>
        <p className="mx-auto mb-10 mt-0 max-w-[540px] text-base leading-[1.6] text-muted">
          {t(subtitle)}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {partners.map((name) => (
            <span
              key={name}
              className="rounded-full bg-[rgba(10,94,215,.08)] px-5 py-2 text-[13px] font-semibold text-salis-blue"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
