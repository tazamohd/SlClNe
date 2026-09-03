import { memo, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** A card that leads somewhere: hover lift, blue-tinted border, a focus
   *  ring for the keyboard. The design's stat and pipeline tiles. */
  interactive?: boolean
}

/** Surface panel: 16px radius, hairline border, small shadow. The unit every
 *  dashboard metric, chart and table sits in. */
export const Card = memo(function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        interactive &&
          'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 active:translate-y-0',
        className
      )}
      {...props}
    />
  )
})

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
        <h2 className="text-xl font-bold text-heading">{title}</h2>
      </div>
      {action}
    </div>
  )
}
