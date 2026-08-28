import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

export function PageHeader({
  icon,
  title,
  subtitle,
  compact,
}: {
  icon: string
  title: string
  subtitle: ReactNode
  compact?: boolean
}) {
  const { t } = usePreferences()
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={compact
            ? 'absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg'
            : 'absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl'}
          aria-hidden
        />
        <div
          className={compact
            ? 'relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]'
            : 'relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]'}
        >
          <Icon name={icon} size={compact ? 20 : 28} />
        </div>
      </div>
      <div>
        <h1 className={compact
          ? 'font-display text-xl font-black text-heading'
          : 'font-display text-[30px] font-black text-heading'}
        >
          {t(title)}
        </h1>
        <p className={compact ? 'mt-0.5 text-sm text-muted' : 'mt-0.5 text-[13px] text-muted'}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
