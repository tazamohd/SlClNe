import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { PageHeader, type PageHeaderMeta } from '@/components/ui/PageHeader'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { StageNotice } from './StageNotice'
import { RAIL_STAGES, STAGE_ROUTES, type JobRow } from './stages'
import type { JobStageValue } from './useJobStage'

/** The frame the six stage screens share.
 *
 *  Each of them used to assemble the same five things by hand — a back link, a
 *  header, the stage rail, the notice, then its own form — and each did it a
 *  little differently: two hand-rolled the header, one dropped the rail, the
 *  primary button sat wherever the last edit left it. This puts the skeleton in
 *  one place. The header is compact because a stage screen is a step inside a
 *  job card, not a destination of its own; breadcrumbs say so on a desktop and
 *  the back link says so on a phone (the header picks). The primary action
 *  lives in a footer row on a desktop and in a 48px bar pinned to the bottom of
 *  a phone, where a thumb expects it. */
export const WORKSHOP_CRUMBS = [
  { label: 'Workshop' },
  { label: 'Job Cards', to: '/job-cards' },
] as const

export function StageFrame({
  icon,
  title,
  stage,
  subtitle,
  meta,
  actions,
  notice,
  children,
  className,
}: {
  icon: string
  /** English source string. */
  title: string
  stage: JobStageValue
  /** Defaults to "JC · customer" from the resolved job card. */
  subtitle?: ReactNode
  meta?: readonly PageHeaderMeta[]
  /** The stage's buttons — one primary, at most one secondary. */
  actions?: ReactNode
  /** Sits between the rail and the form: a draft caption, a duty warning. */
  notice?: ReactNode
  children: ReactNode
  className?: string
}) {
  const isMobile = useIsMobile()
  const job = stage.job

  return (
    <div className={cn('flex max-w-[1200px] animate-fade-up flex-col gap-5 motion-reduce:animate-none sm:gap-6', className)}>
      <PageHeader
        variant="compact"
        icon={icon}
        title={title}
        breadcrumbs={WORKSHOP_CRUMBS}
        back={{ to: '/job-cards', label: 'Back to Job Cards' }}
        subtitle={subtitle ?? <JobLine job={job} />}
        meta={meta}
      />

      <StageRail job={job} current={stage.stageLabel} />

      <StageNotice stage={stage} />
      {notice}

      {children}

      {actions ? isMobile ? <StageActionBar>{actions}</StageActionBar> : (
        <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div>
      ) : null}
    </div>
  )
}

/** "A3F8B2C1 · Ahmed Al-Rashid", pinned LTR; an em dash until the card loads. */
function JobLine({ job }: { job: JobRow | undefined }) {
  return <span dir="ltr">{job ? `${job.id} · ${job.cust}` : '—'}</span>
}

/** The six-step rail, with the steps already passed drawn as links into their
 *  screens for this job card.
 *
 *  The shared `WorkflowStepper` draws the same rail but knows nothing about
 *  routes; this is the workshop's own copy of it with links, and the two are
 *  kept visually identical on purpose (same dots, same weights, same rule)
 *  so a job card looks the same on every screen that shows it. */
export function StageRail({
  job,
  current,
  className,
}: {
  job: JobRow | undefined
  /** The rail label to mark as current. */
  current: string
  className?: string
}) {
  const { t } = usePreferences()
  const currentIndex = WORKSHOP_STAGES.indexOf(current as (typeof WORKSHOP_STAGES)[number])
  const query = job ? `?id=${encodeURIComponent(job.id)}` : ''

  return (
    <Card className={cn('flex items-center overflow-x-auto rounded-lg px-3 py-3 sm:px-6 sm:py-4', className)}>
      <ol aria-label={t('Workshop stages')} className="flex w-full min-w-max list-none items-center gap-1 p-0 sm:min-w-0 sm:gap-0">
        {RAIL_STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isDone = index < currentIndex
          const route = STAGE_ROUTES[stage.id]
          const linked = Boolean(job) && Boolean(route) && isDone
          const body = (
            <>
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
                {t(stage.label)}
              </span>
            </>
          )
          const shape = 'flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded px-1 sm:gap-2'
          return (
            <li key={stage.id} className="flex min-w-0 flex-1 items-center">
              {linked ? (
                <Link
                  to={`${route}${query}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    shape,
                    'no-underline transition-colors hover:text-salis-blue hover:no-underline',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
                  )}
                >
                  {body}
                </Link>
              ) : (
                <div className={shape} aria-current={isCurrent ? 'step' : undefined}>
                  {body}
                </div>
              )}
              {index < RAIL_STAGES.length - 1 ? (
                <div className={cn('mx-2.5 h-0.5 flex-1 rounded-sm', isDone ? 'bg-salis-blue' : 'bg-border')} />
              ) : null}
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

/** The phone's action bar: pinned to the bottom of the scroll, 48px controls,
 *  above the safe-area inset. Children are the stage's buttons; each grows to
 *  share the width so two of them read as one row. */
export function StageActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-sticky -mx-4 -mb-4 mt-2 flex items-center gap-2 border-t border-border bg-card/95 px-4 py-2 backdrop-blur',
        'pb-[calc(.5rem+env(safe-area-inset-bottom))] [&>*]:min-h-[48px] [&>*]:flex-1',
        className
      )}
    >
      {children}
    </div>
  )
}

/** One row of an overflow menu — a full-width control the `PageHeader`'s
 *  "More actions" popover lists. `destructive` draws it orange (the palette's
 *  warning colour; there is no red). */
export function MenuAction({
  icon,
  label,
  onClick,
  destructive,
  disabled,
}: {
  icon: string
  /** English source string. */
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  const { t } = usePreferences()
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded border-none bg-transparent px-2.5 text-start font-action text-[13px]',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue disabled:cursor-not-allowed disabled:opacity-50',
        destructive
          ? 'text-salis-orange hover:bg-salis-orange/[.08]'
          : 'text-heading hover:bg-salis-blue/[.06] hover:text-salis-blue'
      )}
    >
      <Icon name={icon} size={15} />
      {t(label)}
    </button>
  )
}
