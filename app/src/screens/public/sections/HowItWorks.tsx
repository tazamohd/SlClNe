import { useT } from '@/providers/PreferencesProvider'

/** A numbered-steps workflow section — 3-4 steps showing how the product works.
 *
 *  Each step has a numbered circle in salis-blue, a title, and a description.
 *  Horizontal layout on desktop with connecting lines between steps; vertical
 *  stacked layout on mobile. The connecting line uses a subtle blue wash so it
 *  reads as decorative, not interactive. */
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
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <h2 className="mb-10 mt-0 text-center font-display text-3xl font-black text-heading md:mb-14 md:text-[36px]">
          {t(title)}
        </h2>

        {/* Desktop: horizontal with connecting lines */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            {/* Connecting line behind all steps */}
            <div
              aria-hidden
              className="absolute start-0 end-0 top-6 mx-auto h-[2px] bg-[rgba(10,94,215,.12)]"
              style={{ width: `${((steps.length - 1) / steps.length) * 100}%`, marginInlineStart: `${(100 / steps.length) / 2}%` }}
            />
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-1 flex-col items-center text-center px-4">
                <span
                  dir="ltr"
                  className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-salis-gradient text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]"
                >
                  {step.number}
                </span>
                <h2 className="mb-1.5 mt-0 text-[16px] font-bold text-heading">
                  {t(step.title)}
                </h2>
                <p className="m-0 max-w-[220px] text-[13px] leading-[1.6] text-muted">
                  {t(step.description)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical stacked */}
        <div className="flex flex-col gap-8 md:hidden">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  dir="ltr"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]"
                >
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="mt-2 w-[2px] flex-1 bg-[rgba(10,94,215,.12)]"
                  />
                )}
              </div>
              <div className="pb-2 pt-1.5">
                <h2 className="mb-1 mt-0 text-[15px] font-bold text-heading">
                  {t(step.title)}
                </h2>
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {t(step.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
