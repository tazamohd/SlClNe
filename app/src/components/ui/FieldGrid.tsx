import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from './Card'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Titled panel with a blue icon — the detail-screen equivalent of CardHeader,
 *  used for "Customer Info", "Vehicle Info", "Check-In Details". */
export function Panel({
  icon,
  title,
  children,
  className,
  action,
}: {
  icon: string
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <Card className={cn('flex flex-col gap-3.5 rounded-lg p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} className="text-salis-blue" />
          <h2 className="text-sm font-bold text-heading">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

/** Two-column label/value grid inside a Panel. */
export function FieldGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 }) {
  return (
    <div className={cn('grid gap-3', columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1')}>
      {children}
    </div>
  )
}

/** One read-only label/value pair.
 *
 *  `redacted` renders an em dash instead of the value — for fields the role
 *  may not see (FIELD_RULES). Hiding the value while keeping the row means the
 *  layout doesn't reshuffle per role, and the user can see the field exists. */
export function ReadField({
  label,
  value,
  code,
  emphasis,
  redacted,
}: {
  label: string
  value: ReactNode
  /** Latin content (plate, VIN, phone) — pinned LTR. */
  code?: boolean
  /** Renders heavier, for the fields that identify the record. */
  emphasis?: boolean
  redacted?: boolean
}) {
  const { t } = usePreferences()
  return (
    <div>
      <span className="font-action text-[11px] font-medium text-muted">{label}</span>
      {redacted ? (
        <p className="mt-1 text-sm text-faint" title={t('Hidden for your role')}>
          —
        </p>
      ) : (
        <p
          dir={code ? 'ltr' : undefined}
          className={cn(
            'mt-1',
            code ? 'font-mono text-[13px] text-body' : 'text-sm',
            emphasis ? 'font-semibold text-heading' : 'text-body'
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}
