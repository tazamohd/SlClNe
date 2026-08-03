import { cn } from '@/lib/cn'

/** Selectable pill used for single-choice rows (fuel level) and multi-select
 *  sets (personal belongings).
 *
 *  Renders as a real `radio`/`checkbox` to assistive tech — the prototypes used
 *  bare `<button>`s, so a screen reader announced no group and no selected
 *  state. */
export function Chip({
  label,
  selected,
  onToggle,
  multi,
  className,
}: {
  label: string
  selected: boolean
  onToggle: () => void
  /** `true` for checkbox semantics, `false`/omitted for radio. */
  multi?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1.5 font-action text-xs font-medium',
        'transition-all duration-150',
        selected
          ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
          : 'border-border bg-inset text-muted hover:border-border-strong',
        className
      )}
    >
      {label}
    </button>
  )
}

/** Groups chips and announces them as one control. */
export function ChipGroup({
  label,
  multi,
  children,
  className,
}: {
  label: string
  multi?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={multi ? 'group' : 'radiogroup'}
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {children}
    </div>
  )
}
