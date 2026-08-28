import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

export interface ChecklistItem {
  /** English source label. */
  label: string
  /** Optional lucide icon shown before the label. */
  icon?: string
}

/** Tick-list used by the QC and delivery gates.
 *
 *  Renders real checkboxes — the prototypes used `<button>` with a styled
 *  `<span>`, which announced nothing to a screen reader on a screen whose whole
 *  purpose is recording that someone verified each line. */
export function Checklist({
  items,
  checked,
  onToggle,
}: {
  items: readonly ChecklistItem[]
  checked: Readonly<Record<string, boolean>>
  onToggle: (label: string) => void
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const on = !!checked[item.label]
        return (
          <label
            key={item.label}
            className="flex cursor-pointer items-center gap-2.5 border-b border-border py-2.5 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(item.label)}
              className="sr-only peer"
            />
            <span
              aria-hidden
              className={cn(
                'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] transition-all duration-150',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-salis-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-page',
                on
                  ? 'border-none bg-salis-gradient text-white'
                  : 'border-[1.5px] border-border-strong bg-inset text-transparent'
              )}
            >
              <Icon name="Check" size={12} strokeWidth={3} />
            </span>
            {item.icon ? <Icon name={item.icon} size={14} className="text-muted" /> : null}
            <span className={cn('text-[13px]', on ? 'text-heading' : 'text-body')}>
              {t(item.label)}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/** `checked` map → how many of `items` are ticked. */
export function countChecked(
  items: readonly ChecklistItem[],
  checked: Readonly<Record<string, boolean>>
): number {
  return items.filter((item) => checked[item.label]).length
}
