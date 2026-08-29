import { usePreferences } from '@/providers/PreferencesProvider'

export function Toggle({
  on,
  onToggle,
  label,
  disabled,
}: {
  on: boolean
  onToggle: () => void
  label: string
  disabled?: boolean
}) {
  const { rtl } = usePreferences()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={
        'relative h-6 w-[44px] flex-shrink-0 cursor-pointer rounded-full border-none p-0.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 ' +
        (on ? 'bg-salis-gradient' : 'bg-border-strong')
      }
    >
      <span
        className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
        style={{
          transform: on
            ? `translateX(${rtl ? '-20px' : '20px'})`
            : 'translateX(0)',
        }}
      />
    </button>
  )
}
