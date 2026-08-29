/** The HR action write path — payroll posting and leave decisions.
 *
 *  Reads and the plain collection writes (create an employee, create a draft
 *  run, add a payroll line, submit a leave request) go through `useCollection` /
 *  the mutation hooks like everywhere else. Three operations do not, because they
 *  are *actions* on a document rather than field updates:
 *
 *   - `POST /payroll/runs/:id/post` — freezes a draft run's totals from its lines
 *     and moves it to `posted`. A `PATCH /payroll/runs/:id` with `{ status }`
 *     would persist the word but never sum the lines, and the writers refuse a
 *     status patch anyway, so posting has to come through here. **A posted run
 *     cannot be reopened** (§5b): the server refuses a second post with a 409.
 *   - `POST /leave-requests/:id/approve` and `/reject` — the reject requires a
 *     reason. Both are gated on `hr:a` server-side and record the approver for
 *     segregation of duties.
 *
 *  None is a registered collection, so — exactly as `screens/workshop/api.ts`
 *  and `screens/crm/api.ts` document — there is no base URL that turns
 *  `createHttpRepository` into them. This module makes the call itself and reads
 *  the bearer token from `getAccessToken`, the one source `repository.ts`
 *  attaches to every request, so a live action carries the caller's identity
 *  instead of returning a 401. `setHrAccessTokenProvider` remains for the tests,
 *  which override the reader directly so the request shape, the gating and the
 *  error mapping are proven without a session.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the calls that cannot go through the
 *  repository. See the module note. */
export function setHrAccessTokenProvider(read: TokenReader): void {
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
    { field: envelope.error?.field, status, requestId: envelope.error?.requestId },
  )
}

function authHeaders(): Headers {
  const headers = new Headers({ accept: 'application/json', 'content-type': 'application/json' })
  const token = readAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  return headers
}

async function post<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture build cannot perform this action. Set VITE_API_URL to run against the API.',
    )
  }
  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      method: 'POST',
      headers: authHeaders(),
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

/** Posts a draft payroll run. `ref` is the ULID or the `YYYY-MM` period the
 *  route accepts. The returned row is the run *as the server left it* — status
 *  `posted`, totals frozen from the lines — which is the only version worth
 *  putting back in the cache. A second post 409s (`conflict`): the run cannot be
 *  reopened, and the UI reflects that by hiding the action once posted. */
export function postPayrollRun(ref: string): Promise<Record<string, unknown>> {
  return post(`payroll/runs/${encodeURIComponent(ref)}/post`, {})
}

/** Approves a leave request. The reason is optional on approval. */
export function approveLeave(ref: string, reason?: string): Promise<Record<string, unknown>> {
  return post(`leave-requests/${encodeURIComponent(ref)}/approve`, reason ? { reason } : {})
}

/** Rejects a leave request. The server requires a reason. */
export function rejectLeave(ref: string, reason: string): Promise<Record<string, unknown>> {
  return post(`leave-requests/${encodeURIComponent(ref)}/reject`, { reason })
}

/** What to put in front of the user when an action is refused.
 *
 *  The API's own wording wins wherever it has any — it is the only party that
 *  knows which rule refused: the permission matrix, the posting invariant ("this
 *  payroll run is already posted and cannot be reopened"), a version conflict or
 *  a validation issue — so replacing its sentence with a generic one is a
 *  downgrade. Only the two failures the server has no sentence for get a client
 *  one. */
export function actionFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

/** A refusal the user cannot fix by retrying: their role forbids the action, a
 *  business rule stands in the way, or the run is already posted (a `conflict`
 *  the invariant produces — reloading shows it posted, retrying will not help). */
export function isRefusal(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.code === 'forbidden' ||
      error.code === 'rule_violated' ||
      error.code === 'conflict' ||
      error.code === 'version_conflict')
  )
}

export { RepositoryError }
