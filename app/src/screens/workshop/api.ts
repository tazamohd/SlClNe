/** The job-card write path.
 *
 *  Reads go through `useCollection` like everywhere else. Stage changes do not:
 *  `POST /jobs/:id/transition` is an action on a document, not a field update,
 *  and the difference is the whole point. The server runs the stage machine
 *  there (`checkStageTransition`), re-checks `jobcards:e`, and — moving into
 *  `delivery` — runs the segregation-of-duties check over this job card's audit
 *  trail before it will let anyone pass its own repair (F-004).
 *
 *  A `PATCH /jobs/:id` with `{ stage }` would also persist, and is exactly what
 *  this module must never do: the generic collection route accepts `stage` and
 *  runs neither gate, so the UI would be handing users a documented way around
 *  the quality control the server built. Stage moves come through here or not
 *  at all.
 *
 *  ### Why the transport looks the way it does
 *
 *  `data/repository.ts` owns the one authenticated HTTP path in the app. It
 *  holds the access token in a module screens deliberately cannot read from and
 *  attaches it to every request — but it only exposes *collections*, and
 *  `transition` and `assign` are actions, not collections. There is no base URL
 *  that turns `createHttpRepository` into either of them (the trick that works
 *  for `/invoices/:id/payments` needs the last path segment to be a registered
 *  endpoint name, and neither of these is).
 *
 *  So this module makes the call itself and needs the bearer token, which is
 *  not exported. The fix is a small addition to a file this agent does not own
 *  and is recorded in the handover; until it lands
 *  `setWorkshopAccessTokenProvider` is unwired in production and a transition
 *  against a live API returns its 401, which the screen reports as the failure
 *  it is rather than the success it did not have. The tests wire it directly,
 *  so the request shape, the gating and the error mapping are proven either
 *  way.
 */
import { API_URL, RepositoryError, isLive } from '@/data/repository'
import type { JobStage } from './stages'

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = () => null

/** Supplies the bearer token to the calls that cannot go through the
 *  repository. See the module note. */
export function setWorkshopAccessTokenProvider(read: TokenReader): void {
  readAccessToken = read
}

interface ErrorBody {
  error?: { code?: string; message?: string; field?: string; requestId?: string }
}

function errorFrom(body: unknown, status: number): RepositoryError {
  const envelope = (body ?? {}) as ErrorBody
  return new RepositoryError(
    (envelope.error?.code as RepositoryError['code']) ?? 'internal',
    envelope.error?.message ?? `Request failed with status ${status}.`,
    { field: envelope.error?.field, status, requestId: envelope.error?.requestId }
  )
}

async function post<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture repository cannot change a job card. Set VITE_API_URL to run against the API.'
    )
  }
  const headers = new Headers({ accept: 'application/json', 'content-type': 'application/json' })
  const token = readAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const parsed: unknown = text ? JSON.parse(text) : null
  if (!response.ok) throw errorFrom(parsed, response.status)
  return parsed as TResult
}

/** Moves a job card to the next stage.
 *
 *  `ref` is the ULID or the business code — the route accepts either. The
 *  returned row is the job card *as the server left it*, which is the only
 *  version worth putting back in the cache. */
export function transitionJob(
  ref: string,
  to: JobStage,
  reason?: string
): Promise<Record<string, unknown>> {
  return post(`jobs/${encodeURIComponent(ref)}/transition`, reason ? { to, reason } : { to })
}

/** Assigns a technician. Separate from a PATCH because the route verifies the
 *  technician exists inside the caller's own tenant before it writes. */
export function assignJob(ref: string, techId: string): Promise<Record<string, unknown>> {
  return post(`jobs/${encodeURIComponent(ref)}/assign`, { techId })
}

/** What to put in front of the user when a stage change is refused.
 *
 *  The API's own wording wins wherever it has any: it is the only party that
 *  knows *which* rule refused — the stage machine, the permission matrix or the
 *  segregation-of-duties trail — and replacing "you performed the repair on
 *  this job card, so you may not also pass its quality check" with "something
 *  went wrong" is a downgrade, not a polish. */
export function transitionFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

/** A refusal the user cannot fix by retrying: their role, or their own hands
 *  being on both sides of a segregation-of-duties pair. */
export function isRefusal(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.code === 'forbidden' || error.code === 'rule_violated')
  )
}

export { RepositoryError }
