import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

export interface TimelineStep {
  /** lucide icon name. */
  icon: string
  /** English source label — translated at render. */
  label: string
  /** Timestamp for completed steps; omit for pending ones. */
  time?: string
  done: boolean
}

/** Vertical progress rail. Completed steps carry a gradient dot; pending ones
 *  an outlined dot and a "Pending" label.
 *
 *  Used by JobDetail and the workshop stage screens. */
export function Timeline({ steps }: { steps: readonly TimelineStep[] }) {
  const { t } = usePreferences()

  return (
    <ol className="flex list-none flex-col p-0">
      {steps.map((step, index) => (
        <li key={step.label} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full',
                step.done
                  ? 'bg-salis-gradient text-white'
                  : 'border-[1.5px] border-border-strong bg-inset text-muted'
              )}
            >
              <Icon name={step.icon} size={14} />
            </span>
            {/* The connector stops at the last step so the rail doesn't
                dangle past the final dot. */}
            {index < steps.length - 1 ? (
              <span className="min-h-[24px] w-0.5 flex-1 bg-border" />
            ) : null}
          </div>
          <div className="pb-5">
            <p className="text-sm font-semibold text-heading">{t(step.label)}</p>
            <p className="mt-0.5 text-xs text-muted">{step.time ?? t('Pending')}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
