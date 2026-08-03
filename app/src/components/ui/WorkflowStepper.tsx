import { cn } from '@/lib/cn'
import { Card } from './Card'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The six workshop stages, in order. Every stage screen shows the same rail
 *  with its own position marked — in the design each screen hardcoded its own
 *  copy of the list, which is how they drift. */
export const WORKSHOP_STAGES = [
  'Check-In',
  'Inspection',
  'Estimate',
  'Repair',
  'Quality Check',
  'Delivery',
] as const

export type WorkshopStage = (typeof WORKSHOP_STAGES)[number]

/** Horizontal stage rail. Stages before `current` read as done, `current` is
 *  filled with the gradient, later ones are outlined. */
export function WorkflowStepper({
  current,
  stages = WORKSHOP_STAGES,
}: {
  current: WorkshopStage | string
  stages?: readonly string[]
}) {
  const { t } = usePreferences()
  const currentIndex = stages.indexOf(current)

  return (
    <Card className="flex items-center overflow-x-auto rounded-lg px-6 py-4">
      <ol className="flex w-full list-none items-center p-0">
        {stages.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isDone = index < currentIndex
          return (
            <li key={stage} className="flex min-w-0 flex-1 items-center">
              <div
                className="flex items-center gap-2 whitespace-nowrap"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                    isCurrent
                      ? 'bg-salis-gradient text-white shadow-[0_2px_8px_rgba(10,94,215,.3)]'
                      : isDone
                        ? 'bg-salis-blue text-white'
                        : 'border-[1.5px] border-border-strong bg-inset text-muted'
                  )}
                >
                  {isDone ? (
                    <Icon name="Check" size={12} strokeWidth={3} />
                  ) : (
                    <span className={cn('text-[11px]', isCurrent ? 'font-bold' : 'font-semibold')}>
                      {index + 1}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'font-action text-xs font-semibold',
                    isCurrent ? 'text-salis-blue' : isDone ? 'text-heading' : 'text-muted'
                  )}
                >
                  {t(stage)}
                </span>
              </div>
              {index < stages.length - 1 ? (
                <div
                  className={cn(
                    'mx-2.5 h-0.5 flex-1 rounded-sm',
                    isDone ? 'bg-salis-blue' : 'bg-border'
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
