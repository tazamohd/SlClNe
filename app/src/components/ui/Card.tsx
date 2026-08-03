import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/** Surface panel: 16px radius, hairline border, small shadow. The unit every
 *  dashboard metric, chart and table sits in. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        className
      )}
      {...props}
    />
  )
}

/** Card header with the design's gradient icon chip and 20px title. */
export function CardHeader({
  icon,
  title,
  action,
  className,
}: {
  /** lucide icon name for the gradient chip. */
  icon?: string
  title: ReactNode
  /** Right-aligned control, e.g. a "View All" button. */
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex rounded-lg bg-salis-gradient p-2 text-white shadow-[0_10px_15px_-3px_rgba(10,94,215,.25)]">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
        <h3 className="text-xl font-bold text-heading">{title}</h3>
      </div>
      {action}
    </div>
  )
}
