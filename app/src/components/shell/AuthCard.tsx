import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

/** The bordered card most auth screens sit inside — logo or icon chip, title,
 *  optional description, then content. */
export function AuthCard({
  logo,
  icon,
  title,
  description,
  children,
  center,
  footer,
  className,
}: {
  /** Show the wordmark above the title. */
  logo?: boolean
  /** lucide name for a circular tinted icon chip instead of the wordmark. */
  icon?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  /** Centre-align the body (used by the code-entry screens). */
  center?: boolean
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-lg',
        center && 'text-center',
        className
      )}
    >
      <div className={cn('mb-4 flex flex-col gap-2.5', center ? 'items-center' : 'items-center')}>
        {logo ? (
          <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" className="h-auto w-[120px]" />
        ) : null}
        {icon ? (
          <span className="mb-3.5 inline-flex rounded-full bg-[rgba(10,94,215,.1)] p-3.5 text-salis-blue">
            <Icon name={icon} size={26} />
          </span>
        ) : null}
        <h2 className="text-center font-display text-xl font-bold text-heading">{title}</h2>
        {description ? (
          <p className="text-center font-action text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      {children}
      {footer}
    </div>
  )
}

/** Field label + input wrapper with the design's 12px label treatment. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-action text-xs font-medium text-heading">
        {label}
      </label>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  )
}
