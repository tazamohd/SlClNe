import { useRef, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

/** Gradient tiles per stage, from CSS variables only. `gradient` is the
 *  brand pair; the rest shade the same blues, with orange kept for the stage
 *  where work waits on somebody. */
export type PipelineTone = 'gradient' | 'blue' | 'bright' | 'navy' | 'orange' | 'neutral'

const TILE: Record<PipelineTone, string> = {
  gradient: 'linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))',
  blue: 'linear-gradient(135deg,var(--salis-blue),var(--salis-blue-hover))',
  bright: 'linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))',
  navy: 'linear-gradient(135deg,var(--salis-navy),var(--navy-dark))',
  orange: 'linear-gradient(135deg,var(--salis-orange),var(--orange-light))',
  neutral: 'linear-gradient(135deg,var(--text-muted),var(--neutral-400))',
}

export interface PipelineStage {
  id: string
  /** English source string, translated here. */
  label: string
  count: number
  icon: string
  tone?: PipelineTone
  /** Where the stage drills into — usually the list filtered to it. */
  to?: string
}

/** The job pipeline strip: one glance at where work is stuck.
 *
 *  An ordered list of stages with live counts. Each step is a link (or a
 *  button when `onSelect` is given) so the strip doubles as a filter; arrow
 *  keys move between steps, the active one is announced. On a phone it
 *  scrolls horizontally with snap points rather than wrapping into a grid the
 *  eye cannot read as a sequence. */
export function PipelineStrip({
  stages,
  active,
  onSelect,
  label,
  className,
}: {
  stages: readonly PipelineStage[]
  active?: string
  onSelect?: (id: string) => void
  /** English source string naming the strip for assistive tech. */
  label: string
  className?: string
}) {
  const { t, rtl } = usePreferences()
  const listRef = useRef<HTMLOListElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-step]') ?? [])]
    const index = items.indexOf(event.currentTarget as HTMLElement)
    if (index < 0) return
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    let next = -1
    if (event.key === forward) next = (index + 1) % items.length
    else if (event.key === back) next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    if (next >= 0) {
      event.preventDefault()
      items[next].focus()
    }
  }

  return (
    <ol
      ref={listRef}
      aria-label={t(label)}
      data-testid="pipeline-strip"
      className={cn(
        'm-0 flex list-none gap-3 p-0',
        '-mx-4 snap-x snap-mandatory overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0',
        'sm:grid sm:grid-cols-3 sm:overflow-visible xl:grid-cols-6',
        className
      )}
    >
      {stages.map((stage, index) => {
        const isActive = active === stage.id
        const body = (
          <>
            <span
              className="flex rounded-lg p-2.5 text-white shadow-md"
              style={{ background: TILE[stage.tone ?? 'gradient'] }}
              aria-hidden
            >
              <Icon name={stage.icon} size={18} />
            </span>
            <span className="flex min-w-0 flex-col items-start text-start">
              <span dir="ltr" className="font-display text-2xl font-black leading-none text-heading tabular-nums">
                {stage.count}
              </span>
              <span className="mt-1 truncate text-xs font-medium text-muted">{t(stage.label)}</span>
            </span>
            {index < stages.length - 1 ? (
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 hidden -translate-y-1/2 text-faint end-[-14px] xl:block"
              >
                <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={14} />
              </span>
            ) : null}
          </>
        )
        const shape = cn(
          'relative flex min-h-[72px] w-full min-w-[150px] snap-start items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-start no-underline shadow-sm',
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg hover:no-underline motion-reduce:hover:translate-y-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
          isActive ? 'border-salis-blue bg-tint-blue' : 'border-border'
        )
        return (
          <li key={stage.id} className="flex min-w-[150px] sm:min-w-0">
            {onSelect ? (
              <button
                type="button"
                data-step
                aria-pressed={isActive}
                onClick={() => onSelect(stage.id)}
                onKeyDown={onKeyDown}
                className={cn(shape, 'cursor-pointer')}
              >
                {body}
              </button>
            ) : stage.to ? (
              <Link
                to={stage.to}
                data-step
                aria-current={isActive ? 'true' : undefined}
                onKeyDown={onKeyDown}
                className={shape}
              >
                {body}
              </Link>
            ) : (
              <div className={shape}>{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
