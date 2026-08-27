import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading, ReadOnlyNotice } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { JobStageValue } from './useJobStage'

/** What a stage screen owes the user between pressing the button and the record
 *  changing: that the record is still loading, that it does not exist, why the
 *  button cannot be pressed, or why the server refused.
 *
 *  It sits *above* the stage's own form rather than replacing it. A checklist
 *  or a line-item table is worth reading while the job card resolves, and
 *  blanking the whole screen behind a spinner to say "loading" costs more than
 *  it tells. Orange, never red — a refusal is a warning in this palette
 *  (README §7). */
export function StageNotice({ stage }: { stage: JobStageValue }) {
  const { t } = usePreferences()

  if (stage.loadError) {
    return <ErrorState description={stage.loadError} onRetry={stage.reload} />
  }

  if (stage.loading) {
    return <Loading inline label="Loading job card..." />
  }

  if (!stage.job) {
    return (
      <Card role="alert" className="flex items-start gap-3 border-salis-orange/40 p-4">
        <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
          <Icon name="FileQuestion" size={18} />
        </span>
        <div>
          <p className="font-action text-sm font-semibold text-heading">
            {t('Job card not found')}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {t('It may have been deleted, or the link is out of date.')}
          </p>
        </div>
      </Card>
    )
  }

  if (stage.error) {
    return (
      <Card role="alert" className="flex items-start gap-3 border-salis-orange/40 p-4">
        <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
          <Icon name={stage.refused ? 'ShieldAlert' : 'CloudOff'} size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-action text-sm font-semibold text-heading">
            {t(stage.refused ? 'The server refused this' : "Couldn't save this")}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">{stage.error}</p>
          {stage.refused ? null : (
            <button
              type="button"
              onClick={stage.dismissError}
              className="mt-1.5 cursor-pointer border-none bg-transparent p-0 font-action text-[13px] font-medium text-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {t('Dismiss')}
            </button>
          )}
        </div>
      </Card>
    )
  }

  if (!stage.mayAdvance) {
    return (
      <ReadOnlyNotice
        message={t(
          'This stage cannot be saved from this build: your role does not hold edit on job cards, or no API is configured.'
        )}
      />
    )
  }

  return null
}

/** The label a stage button carries while the request is in flight. Saving is a
 *  state the user can see, not a hope. */
export function stageLabel(stage: JobStageValue, idle: string): string {
  return stage.status === 'saving' ? 'Saving...' : idle
}

/** A stage action is offered only when there is a record to act on, the role
 *  holds the grant, and nothing is already in flight. */
export function stageBusy(stage: JobStageValue): boolean {
  return !stage.job || !stage.mayAdvance || stage.status === 'saving'
}
