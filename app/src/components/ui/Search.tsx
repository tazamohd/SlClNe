import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

export interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  compact?: boolean
}

export function Search({ value, onChange, placeholder, className, compact }: SearchProps) {
  const { t } = usePreferences()
  return (
    <span className={cn('relative', className)}>
      <Icon
        name="Search"
        size={compact ? 14 : 16}
        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('Search...')}
        aria-label={placeholder ?? t('Search')}
        className={cn(
          'w-full rounded border border-border bg-inset ps-9 pe-3 text-[13px] text-heading outline-none',
          'transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
          compact ? 'h-8' : 'h-10',
        )}
      />
    </span>
  )
}
