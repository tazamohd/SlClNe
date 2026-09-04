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
 *  The product mock is a bay board with the shape of the real one — four bays,
 *  a job card, a plate, an amount in SAR and a status — built from tokens, no
 *  imagery, nothing a screen reader has to describe (it is `aria-hidden`).
 *  Behind it, the brand's circuit trace (SA-BRD-002) drawn with token colours. */
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
      {mock ? <TraceBackdrop /> : null}
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

        {mock ? <BayBoardMock /> : null}
      </div>
    </section>
  )
}

/** The brand's circuit trace behind the hero, in token colours through
 *  Tailwind's fill/stroke utilities. Mirrors under RTL with the layout. */
function TraceBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={7}
      className="pointer-events-none absolute -end-24 -top-10 hidden h-[420px] w-[840px] opacity-[.16] lg:block rtl:-scale-x-100 dark:opacity-[.28]"
    >
      <path d="M22 160H118L160 118H262" className="stroke-salis-bright" />
      <path d="M62 44H140L182 86H300L342 44" className="stroke-salis-blue" />
      <path d="M204 176H318L362 132" className="stroke-salis-orange" />
      <path d="M22 100H84" className="stroke-salis-bright" />
      <circle cx="22" cy="160" r="10" className="fill-salis-bright" />
      <circle cx="262" cy="118" r="10" className="fill-page stroke-salis-bright" />
      <circle cx="62" cy="44" r="10" className="fill-salis-orange" />
      <circle cx="342" cy="44" r="10" className="fill-page stroke-salis-blue" />
      <circle cx="362" cy="132" r="10" className="fill-salis-orange" />
      <circle cx="204" cy="176" r="10" className="fill-page stroke-salis-orange" />
      <circle cx="84" cy="100" r="10" className="fill-page stroke-salis-bright" />
    </svg>
  )
}

/** A bay board with the shape of the real one. Figures are fixed and
 *  illustrative; the block is `aria-hidden` so nothing is read out as data.
 *  Plates, ids and amounts are Latin and isolated with `dir="ltr"`. */
function BayBoardMock() {
  const t = useT()
  const rows = [
    { bay: 1, job: 'JC-4F2A', plate: 'RUH 4821', amount: 'SAR 1,245.00', status: t('In repair'), warn: false },
    { bay: 2, job: 'JC-4F2B', plate: 'RUH 1157', amount: 'SAR 380.00', status: t('QC'), warn: false },
    { bay: 3, job: 'JC-4F2C', plate: 'RUH 9930', amount: 'SAR 2,910.50', status: t('Awaiting parts'), warn: true },
    { bay: 4, job: 'JC-4F2D', plate: 'RUH 2204', amount: 'SAR 640.00', status: t('Delivered'), warn: false },
  ]
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-[560px] animate-fade-up motion-reduce:animate-none"
    >
      <div className="absolute -inset-4 rounded-[28px] bg-salis-blue/[.08] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_48px_-12px_rgba(11,31,59,.25)]">
        <div className="flex items-center justify-between gap-3 bg-salis-navy px-4 py-3 text-white">
          <span className="font-action text-sm font-semibold">
            {t('Bay board')} · {t('Main branch')}
          </span>
          <span dir="ltr" className="font-mono text-xs text-white/70">
            03 Sep 2026 · 09:40
          </span>
        </div>
        <ul className="m-0 list-none divide-y divide-border p-0">
          {rows.map((row) => (
            <li
              key={row.job}
              className="grid grid-cols-[1.2fr_auto_auto] items-center gap-3 px-4 py-3 text-sm sm:grid-cols-[1.2fr_auto_auto_auto]"
            >
              <span>
                <span className="font-semibold text-heading">
                  {t('Bay')} {row.bay}
                </span>
                <span dir="ltr" className="block font-mono text-xs text-muted">
                  {row.job}
                </span>
              </span>
              <span dir="ltr" className="hidden font-mono text-xs text-muted sm:inline">
                {row.plate}
              </span>
              <span dir="ltr" className="font-mono text-sm tabular-nums text-heading">
                {row.amount}
              </span>
              <span
                className={
                  'justify-self-end whitespace-nowrap rounded-full px-2.5 py-0.5 font-action text-xs font-semibold ' +
                  (row.warn ? 'bg-tint-orange text-salis-orange-hover' : 'bg-tint-blue text-salis-blue')
                }
              >
                {row.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <div className="flex flex-1 items-center gap-1.5">
            <span className="h-2 flex-[3] rounded-full bg-salis-blue" />
            <span className="h-2 flex-[2] rounded-full bg-salis-bright" />
            <span className="h-2 flex-[2] rounded-full bg-salis-blue/[.45]" />
            <span className="h-2 flex-1 rounded-full bg-border" />
          </div>
          <span className="whitespace-nowrap font-mono text-[11px] text-muted">
            {t('6 stages, one job card')}
          </span>
        </div>
      </div>
    </div>
  )
}
