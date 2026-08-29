import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** The four button treatments used across the designs.
 *
 *  - `primary`   — brand gradient, lifts on hover. One per view.
 *  - `outline`   — 1.5px blue rule, transparent fill. Secondary action.
 *  - `ghost`     — text-only until hovered. Inline/tertiary action.
 *  - `subtle`    — bordered card-coloured chip that fills with gradient on
 *                  hover. Used for toolbar controls (Quick Actions, filters). */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-none bg-salis-gradient text-white font-semibold shadow-[0_4px_12px_rgba(10,94,215,.25)] ' +
    'hover:bg-salis-gradient-hover hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(10,94,215,.35)]',
  outline:
    'border-[1.5px] border-salis-blue bg-transparent text-salis-blue font-medium ' +
    'hover:bg-salis-blue/[.08]',
  ghost:
    'border-none bg-transparent text-salis-blue font-medium hover:bg-salis-blue/[.08]',
  subtle:
    'border border-border bg-card text-heading ' +
    'hover:bg-salis-gradient hover:text-white hover:border-transparent',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-9 px-3.5 text-[13px]',
  lg: 'h-12 px-4 text-[15px]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-action',
        'cursor-pointer transition-all duration-200 ease-salis',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
})
