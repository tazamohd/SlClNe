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
          <img src="/assets/logo-blue-orange.png" alt="SALIS AUTO" width={1024} height={1024} className="h-auto w-[120px]" />
        ) : null}
        {icon ? (
          <span className="mb-3.5 inline-flex rounded-full bg-tint-blue p-3.5 text-salis-blue">
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

/** Field label + input wrapper with the design's 12px label treatment.
 *
 *  `error` (already translated) replaces the hint in Action Orange and is
 *  given `messageId` so the control can point `aria-describedby` at it. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  messageId,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string | null
  messageId?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-action text-xs font-medium text-heading">
        {label}
      </label>
      {children}
      {error ? (
        <span
          id={messageId}
          className="flex items-center gap-1.5 text-[11px] font-medium text-salis-orange"
        >
          <Icon name="AlertCircle" size={12} className="flex-shrink-0" />
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
