import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Text input matching the design's field treatment: inset fill that turns
 *  card-coloured on focus, with a 3px brand ring.
 *
 *  `icon` renders a leading glyph and reserves room for it — positioned with
 *  `inset-inline-start` so it flips under RTL without a second rule. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: ReactNode
  /** Trailing control, e.g. a password visibility toggle. */
  trailing?: ReactNode
  /** Marks the field invalid and colours the border. */
  invalid?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'h-9 text-[13px]',
  md: 'h-11 text-sm',
  lg: 'h-12 text-sm',
} as const

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, trailing, invalid, inputSize = 'lg', className, ...props },
  ref
) {
  return (
    <span className="relative flex items-center">
      {icon ? (
        <span className="pointer-events-none absolute z-[1] flex text-muted start-3">{icon}</span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded border bg-inset px-3.5 font-action text-heading outline-none',
          'transition-all duration-200 ease-salis',
          'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          invalid ? 'border-salis-orange' : 'border-border',
          icon && 'ps-10',
          trailing && 'pe-11',
          SIZES[inputSize],
          className
        )}
        {...props}
      />
      {trailing ? <span className="absolute flex end-3">{trailing}</span> : null}
    </span>
  )
})
