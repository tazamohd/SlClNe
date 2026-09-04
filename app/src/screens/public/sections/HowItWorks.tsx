import { useT } from '@/providers/PreferencesProvider'

/** A numbered-steps rail — 3-4 steps showing how the product works.
 *
 *  An ordered list: the numbers are content, not decoration. On desktop the
 *  steps sit on one horizontal rail with a connecting line drawn in logical
 *  inset properties, so under Arabic the rail runs right-to-left and step 1
 *  is still where reading starts. On a phone the rail turns vertical. */
export interface Step {
  number: number
  title: string
  description: string
}

export interface HowItWorksProps {
  title: string
  steps: readonly Step[]
}

export function HowItWorks({ title, steps }: HowItWorksProps) {
  const t = useT()
  const count = steps.length
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <h2 className="mb-10 mt-0 text-center font-display text-3xl font-black text-heading md:mb-14 md:text-[36px]">
          {t(title)}
        </h2>

        <ol className="relative m-0 flex list-none flex-col gap-8 p-0 md:flex-row md:items-start md:gap-0">
          {/* The rail behind the numbers. Horizontal from `md`: spans from the
              centre of the first circle to the centre of the last, in inline
              (logical) terms so it mirrors under RTL. */}
          <span
            aria-hidden
            className="absolute top-6 hidden h-[2px] bg-salis-blue/[.15] md:block"
            style={{
              insetInlineStart: `${100 / count / 2}%`,
              insetInlineEnd: `${100 / count / 2}%`,
            }}
          />
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="relative flex gap-4 md:flex-1 md:flex-col md:items-center md:px-4 md:text-center"
            >
              {/* Vertical rail segment, phone only. */}
              {index < count - 1 ? (
                <span
                  aria-hidden
                  className="absolute start-5 top-12 h-[calc(100%-1rem)] w-[2px] bg-salis-blue/[.15] md:hidden"
                />
              ) : null}
              <span
                dir="ltr"
                className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient font-display text-[15px] font-bold tabular-nums text-white shadow-[0_4px_12px_rgba(10,94,215,.25)] md:mb-4 md:h-12 md:w-12"
              >
                {step.number}
              </span>
              <div className="pt-1.5 md:pt-0">
                <h3 className="mb-1.5 mt-0 text-[16px] font-bold text-heading">{t(step.title)}</h3>
                <p className="m-0 text-[13px] leading-[1.6] text-muted md:max-w-[220px]">
                  {t(step.description)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
