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
 *  So this module makes the call itself and needs the bearer token. It reads it
 *  from `getAccessToken`, the same source `repository.ts` attaches to every
 *  collection request, so a live transition now carries the caller's identity
 *  instead of returning a 401. `setWorkshopAccessTokenProvider` remains for the
 *  tests, which override the reader directly — so the request shape, the gating
 *  and the error mapping are proven without a session.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'
import type { JobStage } from './stages'

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

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

function authHeaders(withBody: boolean): Headers {
  const headers = new Headers(
    withBody
      ? { accept: 'application/json', 'content-type': 'application/json' }
      : { accept: 'application/json' }
  )
  const token = readAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  return headers
}

async function post<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture repository cannot change a job card. Set VITE_API_URL to run against the API.'
    )
  }
  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      method: 'POST',
      headers: authHeaders(true),
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

/** A read that is a sub-resource action, not a registered collection. The
 *  estimate lines live under `GET /estimates/:id/lines`, which the repository
 *  seam does not model — only whole collections. */
async function get<TResult>(path: string): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture repository does not serve estimate line items. Set VITE_API_URL to run against the API.'
    )
  }
  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      method: 'GET',
      headers: authHeaders(false),
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

/** Approves an estimate.
 *
 *  `POST /estimates/:id/approve` — not a field update, an action that runs the
 *  freshness check, the SAR ceiling and segregation of duties in that order
 *  (server `routes/estimates.ts`). The client `canApprove` gate only mirrors
 *  the ceiling and authority so the button reads honestly; the server is the
 *  boundary and answers all three. `ref` is the ULID or the `EST-…` code. */
export function approveEstimate(ref: string, reason?: string): Promise<Record<string, unknown>> {
  return post(`estimates/${encodeURIComponent(ref)}/approve`, reason ? { reason } : {})
}

/** Rejects an estimate. The server requires a reason. */
export function rejectEstimate(ref: string, reason: string): Promise<Record<string, unknown>> {
  return post(`estimates/${encodeURIComponent(ref)}/reject`, { reason })
}

/** Declines one line of an estimate (Sprint 1, P0 — Declined Job Tracking).
 *
 *  `POST /estimates/:id/lines/:lineId/decline` — an action, not a field
 *  update: the server creates the tracked follow-up record atomically with
 *  the decline, snapshotting the line's description and value so the two can
 *  never drift apart. A second decline of the same line while the first is
 *  still active is a 409, which the caller surfaces rather than retries. */
export function declineEstimateLine(
  estimateRef: string,
  lineId: string,
  input: {
    reasonCategory: 'cost' | 'timing' | 'second_opinion' | 'not_urgent' | 'trust' | 'other'
    reasonNotes?: string
    safetySeverity: 'monitor' | 'attention' | 'urgent' | 'unsafe'
    followUpDate?: string
  }
): Promise<Record<string, unknown>> {
  return post(
    `estimates/${encodeURIComponent(estimateRef)}/lines/${encodeURIComponent(lineId)}/decline`,
    input
  )
}

/** `GET /reports/declined-jobs` — lost/recovered revenue, decline reasons and
 *  advisor conversion, all summed server-side (§A10: never re-derived from a
 *  page of rows). */
export function fetchDeclinedJobsReport(): Promise<DeclinedJobsReport> {
  return get('reports/declined-jobs')
}

export interface DeclinedJobsReport {
  lostRevenueHalalas: number
  recoveredRevenueHalalas: number
  openCount: number
  resolvedCount: number
  byReason: { reason: string; count: number; valueHalalas: number }[]
  byAdvisor: {
    advisorId: string | null
    declinedCount: number
    recoveredCount: number
    recoveredHalalas: number
  }[]
}

/** Approves one row of the unified approval queue.
 *
 *  The queue is mixed — estimates, requisitions, purchase orders and insurance
 *  claims — and each source has its own approve route. The server names the
 *  right one per row (`approvePath`), so the client posts to the endpoint that
 *  actually decides that document instead of re-deriving it from `kind`; the
 *  first version of this screen posted every decision to
 *  `/estimates/:id/approve`, which is a 404 for three of the four sources.
 *
 *  The path is validated before use. It comes from our own API, but it is
 *  interpolated into a URL, so anything that could escape the API root — a
 *  scheme, a leading slash, a `..` segment — is refused rather than fetched. */
export function approveQueueItem(path: string, reason?: string): Promise<Record<string, unknown>> {
  return post(requireApiPath(path), reason ? { reason } : {})
}

/** Rejects one row of the queue. Every source that has a reject route requires
 *  a reason; a row whose `rejectPath` is null has no reject route at all and
 *  must not reach here. */
export function rejectQueueItem(path: string, reason: string): Promise<Record<string, unknown>> {
  return post(requireApiPath(path), { reason })
}

/** A relative, single-rooted API path: no scheme, no host, no leading slash and
 *  no parent segment. */
export function requireApiPath(path: string): string {
  const ok =
    /^[A-Za-z0-9][A-Za-z0-9\-_/.]*$/.test(path) &&
    !path.includes('//') &&
    !path.split('/').includes('..')
  if (!ok) {
    throw new RepositoryError('unsupported', `The server named an action path this client will not call: ${path}`)
  }
  return path
}

/** The estimate's line items, from `GET /estimates/:id/lines`. */
export function fetchEstimateLines(ref: string): Promise<{ rows: EstimateLineRow[] }> {
  return get(`estimates/${encodeURIComponent(ref)}/lines`)
}

/** The line shape the estimates router returns — the raw drizzle row, not a
 *  presented one, so money is in halalas. */
export interface EstimateLineRow {
  id: string
  description: string
  descriptionAr?: string | null
  kind: string
  qty: number
  unitPriceHalalas: number
  partSku?: string | null
  sort: number
}

export interface EstimateLineInput {
  description: string
  descriptionAr?: string
  kind: 'part' | 'labour'
  qty: number
  unitPriceHalalas: number
  partSku?: string
}

async function patch<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture repository cannot change an estimate. Set VITE_API_URL to run against the API.'
    )
  }
  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      method: 'PATCH',
      headers: authHeaders(true),
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

/** Replaces an estimate's line items — `PATCH /estimates/:id`'s existing
 *  full-replace-and-recompute behaviour (`server/src/routes/estimates.ts`),
 *  the same one editing an estimate's own lines already runs. Applying a
 *  canned job (`CannedJobs.tsx`'s catalog) is this call with the existing
 *  lines plus the package's own, not a second write path: appending would
 *  need a new endpoint, replacing needs none. */
export function replaceEstimateLines(ref: string, lines: EstimateLineInput[]): Promise<Record<string, unknown>> {
  return patch(`estimates/${encodeURIComponent(ref)}`, { lines })
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

/** The OBD bridge and the SMS provider are external dependencies (§40): the
 *  server ships them as adapter-plus-mock and refuses the live command with a
 *  503 `external_dependency_unavailable` until a bridge is deployed. A screen
 *  meets that as the honest "not connected yet" state — never a failure toast and
 *  never a faked success. The server carries the status, and older transports may
 *  land it as the code, so both are checked. */
export function isExternalDependency(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.status === 503 || error.code === 'external_dependency_unavailable')
  )
}

export { RepositoryError }
