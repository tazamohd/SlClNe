import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'
import { Badge } from './Badge'
import { Button } from './Button'

export interface FilterGroup {
  id: string
  label: string
  icon?: string
  options: readonly string[]
}

export interface ActiveFilter {
  groupId: string
  value: string
}

export interface AdvancedFiltersProps {
  groups: readonly FilterGroup[]
  active: readonly ActiveFilter[]
  onSelect: (groupId: string, value: string) => void
  onRemove: (groupId: string, value: string) => void
  onClear: () => void
  className?: string
}

export function AdvancedFilters({
  groups,
  active,
  onSelect,
  onRemove,
  onClear,
  className,
}: AdvancedFiltersProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const isActive = (groupId: string, value: string) =>
    active.some((a) => a.groupId === groupId && a.value === value)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className={cn('flex gap-4', isMobile ? 'flex-col' : '')}>
        {groups.map((group) => (
          <div key={group.id} className="flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              {group.icon ? <Icon name={group.icon} size={12} /> : null}
              {t(group.label)}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((opt) => {
                const selected = isActive(group.id, opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => (selected ? onRemove(group.id, opt) : onSelect(group.id, opt))}
                    className={cn(
                      'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                        : 'border-border bg-transparent text-body hover:border-salis-blue'
                    )}
                  >
                    {t(opt)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {active.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {active.map((a) => {
            const group = groups.find((g) => g.id === a.groupId)
            return (
              <Badge
                key={`${a.groupId}-${a.value}`}
                background="rgba(10,94,215,.1)"
                color="var(--salis-blue)"
              >
                {group ? `${t(group.label)}: ` : ''}
                {t(a.value)}
                <button
                  type="button"
                  onClick={() => onRemove(a.groupId, a.value)}
                  className="ms-1 cursor-pointer border-none bg-transparent p-0 text-inherit opacity-60 hover:opacity-100"
                  aria-label={t('Remove filter')}
                >
                  &times;
                </button>
              </Badge>
            )
          })}
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t('Clear All')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
