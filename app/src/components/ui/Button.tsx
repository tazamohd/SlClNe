import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

/** The button treatments used across the designs.
 *
 *  - `primary`     — brand gradient, lifts on hover. One per view.
 *  - `outline`     — 1.5px blue rule, transparent fill. Secondary action.
 *  - `ghost`       — text-only until hovered. Inline/tertiary action.
 *  - `subtle`      — bordered card-coloured chip that fills with gradient on
 *                    hover. Used for toolbar controls (Quick Actions, filters).
 *  - `destructive` — solid Action Orange, no gradient. Deletes, voids,
 *                    deactivations: the design reserves this for exactly those
 *                    and never uses red (README §7). */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'destructive'
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
  destructive:
    'border-none bg-salis-orange text-white font-semibold shadow-none ' +
    'hover:bg-salis-orange-hover hover:-translate-y-px',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-9 px-3.5 text-[13px]',
  lg: 'h-12 px-4 text-[15px]',
}

/** Square footprint for an icon-only control: never below the 40px the a11y
 *  audit set for glyph controls, 48px at `lg` for the technician's thumb. */
const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 w-9 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-12 w-12 p-0',
}

const ICON_SIZES: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 }

interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** In-flight submit. Disables the control, announces `aria-busy`, and keeps
   *  the label in the box (invisible) so the button does not change width —
   *  a jumping footer is how a second click lands on the wrong control. The
   *  indicator is a pulse, never a spinner (design: Motion & Loading). */
  loading?: boolean
  /** English source string for the busy announcement. Default "Loading". */
  loadingLabel?: string
  /** Leading lucide glyph. */
  icon?: string
  /** Hook for tests and smoke checks; rendered as `data-testid`. */
  testId?: string
}

/** An icon-only button must carry an accessible name — the type makes a
 *  nameless one a compile error rather than an audit finding. */
export type ButtonProps =
  | (ButtonBaseProps & { iconOnly?: false })
  | (ButtonBaseProps & { iconOnly: true; 'aria-label': string })

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    loading = false,
    loadingLabel,
    icon,
    iconOnly = false,
    testId,
    disabled,
    children,
    ...props
  },
  ref
) {
  const { t } = usePreferences()
  const busyText = t(loadingLabel ?? 'Loading')

  return (
    <button
      ref={ref}
      type={type}
      data-testid={testId}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-action',
        'cursor-pointer transition-all duration-200 ease-salis',
        'active:translate-y-0 active:scale-[.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        'disabled:pointer-events-none disabled:opacity-50',
        loading && 'disabled:opacity-90',
        VARIANTS[variant],
        iconOnly ? ICON_ONLY_SIZES[size] : SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span
          role="status"
          className="absolute inset-0 flex items-center justify-center gap-2"
        >
          <span
            aria-hidden
            className="h-3.5 w-3.5 flex-shrink-0 animate-pulse rounded-[3px] bg-current opacity-60 motion-reduce:animate-none"
          />
          <span className="sr-only">{busyText}</span>
        </span>
      ) : null}
      {/* `contents` keeps the children laid out by the button itself, so a
          caller's `justify-between` or `w-full` still applies; the wrapper
          exists only to hide the label while the pulse is shown. */}
      <span className={cn('contents', loading && 'invisible')}>
        {icon ? <Icon name={icon} size={ICON_SIZES[size]} /> : null}
        {children}
      </span>
    </button>
  )
})
