import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { queryKeys, useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import { isRefusal, transitionFailureMessage, transitionJob } from './api'
import { railLabelFor, type JobRow, type JobStage } from './stages'

/** What every stage screen in the workshop loop shares.
 *
 *  The six screens used to hold their progress in component state: pressing
 *  "Complete Check-In" showed a toast and navigated, and nothing anywhere
 *  recorded that the vehicle had been checked in. Reload and the job card was
 *  exactly where it started. That is the failure §60 names outright — a stage
 *  that appears to advance and did not persist — so `advance` is a request, and
 *  the screen only moves on once the server has said yes.
 *
 *  Four states, all of them the user's business: idle, saving, refused
 *  (permission, a rule, or segregation of duties) and failed (the network, or
 *  a build with no API behind it). None of them navigates.
 */
export type StageStatus = 'idle' | 'saving' | 'error'

export interface JobStageValue {
  /** The record the screen is acting on, once it has loaded. */
  job: JobRow | undefined
  jobs: readonly JobRow[]
  loading: boolean
  loadError: string | null
  reload: () => void
  /** The stage the *server* says this card is at, as a rail label. */
  stageLabel: string
  status: StageStatus
  /** The server's reason for refusing, or a transport failure. */
  error: string | null
  /** True when the refusal is final — a role, a rule, a duty conflict. Retrying
   *  the same request with the same person will be refused again. */
  refused: boolean
  /** The client's half of the permission check. The server re-checks; this only
   *  decides what the screen offers (§36). */
  mayAdvance: boolean
  /** Requests the move. Resolves true only when the server persisted it. */
  advance: (to: JobStage, options?: { reason?: string; then?: string }) => Promise<boolean>
  /** Clears a refusal so the user can change something and try again. */
  dismissError: () => void
}

/** Resolves the job card from `?id=`, and turns a stage move into a request.
 *
 *  `?id=` carries the business code the design shows (`A3F8B2C1`). Without one
 *  the first card is used, which is what the prototypes did and what makes the
 *  stage screens openable from the sidebar. */
export function useJobStage(): JobStageValue {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [params] = useSearchParams()

  const jobs = useCollection('jobs')
  const [status, setStatus] = useState<StageStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [refused, setRefused] = useState(false)

  const rows = (jobs.data ?? []) as readonly JobRow[]
  const requested = params.get('id')
  const job = requested ? rows.find((row) => row.id === requested) : rows[0]

  const advance = useCallback(
    async (to: JobStage, options: { reason?: string; then?: string } = {}) => {
      if (!job) return false
      setStatus('saving')
      setError(null)
      setRefused(false)
      try {
        await transitionJob(job._id ?? job.id, to, options.reason)
      } catch (cause) {
        setStatus('error')
        setRefused(isRefusal(cause))
        const message = transitionFailureMessage(cause, t('The stage could not be changed.'))
        setError(message)
        toast.show({ title: t(railLabelFor(to)), description: message, error: true })
        return false
      }

      /* The server is the authority on what the record now says — stage,
       * status, version, who passed QC. Refetch rather than patch a guess in. */
      await client.invalidateQueries({ queryKey: queryKeys.all('jobs') })
      setStatus('idle')
      toast.show({ title: t(railLabelFor(to)), description: job.id })
      if (options.then) {
        navigate(`${options.then}?id=${encodeURIComponent(job.id)}`)
      }
      return true
    },
    [client, job, navigate, t, toast]
  )

  return {
    job,
    jobs: rows,
    loading: jobs.isLoading,
    loadError: jobs.isError ? (jobs.error?.message ?? t("Couldn't load this")) : null,
    reload: () => void jobs.refetch(),
    stageLabel: railLabelFor(job?.stage),
    status,
    error,
    refused,
    // `jobcards:e` is what `POST /jobs/:id/transition` requires. Passing QC
    // additionally requires `a`, which the QC screen checks for itself.
    mayAdvance: can('jobcards', 'e') && isLive,
    advance,
    dismissError: () => {
      setError(null)
      setRefused(false)
      setStatus('idle')
    },
  }
}
