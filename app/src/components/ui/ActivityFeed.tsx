import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'
import { Card } from './Card'

export interface ActivityItem {
  id: string
  icon: string
  color?: string
  user: string
  action: string
  target?: string
  targetTo?: string
  time: string
  detail?: ReactNode
}

export interface ActivityFeedProps {
  items: readonly ActivityItem[]
  title?: string
  maxItems?: number
  className?: string
}

export function ActivityFeed({ items, title, maxItems, className }: ActivityFeedProps) {
  const { t } = usePreferences()
  const visible = maxItems ? items.slice(0, maxItems) : items

  return (
    <Card className={cn('flex flex-col gap-3.5 p-5', className)}>
      {title ? (
        <div className="flex items-center gap-2">
          <Icon name="Activity" size={16} className="text-salis-blue" />
          <h2 className="text-sm font-bold text-heading">{t(title)}</h2>
        </div>
      ) : null}
      <div className="flex flex-col divide-y divide-border">
        {visible.map((a) => (
          <div key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: `${a.color ?? 'var(--salis-blue)'}15` }}
            >
              <Icon name={a.icon} size={16} style={{ color: a.color ?? 'var(--salis-blue)' }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-body">
                <span className="font-semibold text-heading">{a.user}</span>{' '}
                {t(a.action)}
                {a.target ? (
                  <>
                    {' '}
                    <span className="font-mono text-xs text-salis-blue">{a.target}</span>
                  </>
                ) : null}
              </p>
              {a.detail ? <div className="mt-1 text-xs text-muted">{a.detail}</div> : null}
              <span className="text-xs text-muted">{t(a.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
