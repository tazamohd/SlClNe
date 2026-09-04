import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useT } from '@/providers/PreferencesProvider'

/** The landing hero — badge pill, gradient display heading, subtitle, one
 *  primary CTA and a text-link secondary, beside a CSS-only product mock.
 *
 *  Configured per page (§32): every string and destination is a prop, so a
 *  Tier B page composes this rather than re-implementing it. Copy passes
 *  through `t()` inside, so callers hand over English source strings exactly
 *  as everywhere else in the app.
 *
 *  The product mock is a dashboard-shaped composition of tinted blocks — no
 *  imagery, no screenshot to go stale, nothing a screen reader has to
 *  describe (it is `aria-hidden`). It stands in for the real thing the way a
 *  wireframe does: a sidebar, a header, a stat row, a pipeline and a table. */
export interface HeroCta {
  label: string
  to: string
}

export interface HeroProps {
  badge: string
  title: string
  description: string
  primaryCta: HeroCta
  /** Rendered as a text link with a chevron, never a second button. */
  secondaryCta?: HeroCta
  /** Hide the product mock — a Tier B page with its own illustration. */
  mock?: boolean
}

export function Hero({ badge, title, description, primaryCta, secondaryCta, mock = true }: HeroProps) {
  const t = useT()
  return (
    <section className="relative overflow-hidden px-5 py-14 md:px-10 md:py-20">
      {/* Decorative radial glow, anchored to the inline end like the design's
          `right:0` (logical, so it mirrors under RTL). */}
      <div
        aria-hidden
        className="absolute end-0 top-0 h-[600px] w-[600px] rounded-full blur-[64px]"
        style={{ background: 'radial-gradient(circle, rgba(10,94,215,.06), transparent 70%)' }}
      />
      <div
        className={
          mock
            ? 'relative mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14'
            : 'relative mx-auto max-w-[720px]'
        }
      >
        <div
          className={
            'animate-fade-up motion-reduce:animate-none ' +
            (mock ? 'text-center lg:text-start' : 'text-center')
          }
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-salis-blue/[.08] px-3.5 py-1 text-[13px] font-semibold text-salis-blue">
            <Icon name="Sparkles" size={13} />
            {t(badge)}
          </span>
          <h1 className="m-0 bg-salis-gradient-r bg-clip-text font-display text-4xl font-black leading-[1.1] text-transparent md:text-[56px]">
            {t(title)}
          </h1>
          <p
            className={
              'mb-0 mt-5 max-w-[540px] text-base leading-[1.6] text-muted md:text-lg ' +
              (mock ? 'mx-auto lg:mx-0' : 'mx-auto')
            }
          >
            {t(description)}
          </p>
          <div
            className={
              'mt-8 flex flex-col items-center gap-4 sm:flex-row ' +
              (mock ? 'justify-center lg:justify-start' : 'justify-center')
            }
          >
            <Link
              to={primaryCta.to}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-salis-gradient px-7 font-action text-[15px] font-semibold text-white no-underline shadow-[0_8px_24px_rgba(10,94,215,.3)] transition-transform hover:-translate-y-0.5 hover:no-underline motion-reduce:hover:translate-y-0"
            >
              {t(primaryCta.label)}
            </Link>
            {secondaryCta ? (
              <Link
                to={secondaryCta.to}
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 font-action text-[15px] font-medium text-salis-blue no-underline hover:underline"
              >
                {t(secondaryCta.label)}
                <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
              </Link>
            ) : null}
          </div>
        </div>

        {mock ? <ProductMock /> : null}
      </div>
    </section>
  )
}

/** Dashboard-shaped composition of tinted blocks. Decorative only. */
function ProductMock() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-[520px] animate-fade-up motion-reduce:animate-none"
    >
      <div className="absolute -inset-4 rounded-[28px] bg-salis-blue/[.06] blur-2xl" />
      <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_48px_-12px_rgba(11,31,59,.25)]">
        {/* Sidebar */}
        <div className="hidden w-[72px] flex-shrink-0 flex-col gap-3 border-e border-border bg-sidebar p-3 sm:flex">
          <span className="h-8 w-8 rounded-lg bg-salis-gradient" />
          <span className="mt-2 h-2 w-10 rounded bg-salis-blue/[.35]" />
          <span className="h-2 w-8 rounded bg-border" />
          <span className="h-2 w-9 rounded bg-border" />
          <span className="h-2 w-7 rounded bg-border" />
          <span className="h-2 w-10 rounded bg-border" />
        </div>
        {/* Page */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="h-3 w-28 rounded bg-salis-navy/[.35] dark:bg-white/[.35]" />
            <span className="h-6 w-16 rounded-md bg-salis-gradient" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="flex h-14 flex-col justify-end gap-1 rounded-lg bg-tint-blue p-2">
              <span className="h-1.5 w-8 rounded bg-salis-blue/[.35]" />
              <span className="h-2.5 w-12 rounded bg-salis-blue" />
            </span>
            <span className="flex h-14 flex-col justify-end gap-1 rounded-lg bg-tint-bright p-2">
              <span className="h-1.5 w-8 rounded bg-salis-bright/[.35]" />
              <span className="h-2.5 w-10 rounded bg-salis-bright" />
            </span>
            <span className="flex h-14 flex-col justify-end gap-1 rounded-lg bg-tint-orange p-2">
              <span className="h-1.5 w-8 rounded bg-salis-orange/[.35]" />
              <span className="h-2.5 w-9 rounded bg-salis-orange" />
            </span>
          </div>
          {/* Pipeline */}
          <div className="flex items-center gap-1.5">
            <span className="h-2 flex-[3] rounded-full bg-salis-blue" />
            <span className="h-2 flex-[2] rounded-full bg-salis-bright" />
            <span className="h-2 flex-[2] rounded-full bg-salis-blue/[.45]" />
            <span className="h-2 flex-1 rounded-full bg-border" />
          </div>
          {/* Table rows */}
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {[0, 1, 2, 3].map((row) => (
              <span key={row} className="flex items-center gap-3 px-3 py-2">
                <span className="h-5 w-5 flex-shrink-0 rounded-full bg-tint-blue" />
                <span className="h-2 flex-1 rounded bg-border" />
                <span className="h-2 w-10 rounded bg-border" />
                <span
                  className={
                    'h-4 w-12 rounded-full ' +
                    (row === 1 ? 'bg-tint-orange' : 'bg-tint-blue')
                  }
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
