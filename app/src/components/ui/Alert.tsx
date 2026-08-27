import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

type AlertVariant = 'info' | 'warning' | 'error' | 'neutral'

const VARIANT_STYLES: Record<AlertVariant, { bg: string; border: string; icon: string; iconColor: string }> = {
  info: {
    bg: 'bg-[rgba(10,94,215,.06)]',
    border: 'border-[rgba(10,94,215,.2)]',
    icon: 'Info',
    iconColor: 'text-salis-blue',
  },
  warning: {
    bg: 'bg-[rgba(249,115,22,.06)]',
    border: 'border-[rgba(249,115,22,.2)]',
    icon: 'AlertTriangle',
    iconColor: 'text-salis-orange',
  },
  error: {
    bg: 'bg-[rgba(220,38,38,.06)]',
    border: 'border-[rgba(220,38,38,.2)]',
    icon: 'AlertCircle',
    iconColor: 'text-[#dc2626]',
  },
  neutral: {
    bg: 'bg-[rgba(100,116,139,.06)]',
    border: 'border-[rgba(100,116,139,.2)]',
    icon: 'Info',
    iconColor: 'text-muted',
  },
}

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  icon?: string
  className?: string
  onDismiss?: () => void
}

export function Alert({ variant = 'info', title, children, icon, className, onDismiss }: AlertProps) {
  const { t } = usePreferences()
  const style = VARIANT_STYLES[variant]
  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        style.bg,
        style.border,
        className,
      )}
    >
      <span className={cn('mt-0.5 flex flex-shrink-0', style.iconColor)}>
        <Icon name={icon ?? style.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold text-heading">{title}</p> : null}
        <div className={cn('text-[13px] text-muted', title && 'mt-1')}>{children}</div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('Dismiss')}
          className="flex flex-shrink-0 cursor-pointer border-none bg-transparent p-0.5 text-muted transition-colors hover:text-heading"
        >
          <Icon name="X" size={16} />
        </button>
      ) : null}
    </div>
  )
}
