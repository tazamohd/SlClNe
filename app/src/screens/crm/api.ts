/** The CRM / fleet action write path (F-027).
 *
 *  Reads and the plain collection writes (lead edit, task create, feedback
 *  submit) go through `useCollection` / the mutation hooks like everywhere else.
 *  Two operations do not, because they are *actions* on a document rather than
 *  field updates:
 *
 *  - `POST /crm/leads/:id/convert` creates an opportunity and edits the lead in
 *    one server transaction, checked against both the `crm:c` and `crm:e`
 *    grants and made idempotent server-side. A `PATCH /crm/leads/:id` with
 *    `{ stage: 'converted' }` would persist the stage but never create the
 *    opportunity, so the conversion has to come through here.
 *  - `POST /fleets/:id/renew` moves the contract term forward, records the new
 *    value and sets the status back to active in one step — a specific action,
 *    not an arbitrary patch of the same columns.
 *
 *  Neither is a registered collection, so — exactly as `screens/workshop/api.ts`
 *  documents — there is no base URL that turns `createHttpRepository` into them.
 *  This module makes the call itself and reads the bearer token from
 *  `getAccessToken`, the one source `repository.ts` attaches to every request,
 *  so a live action carries the caller's identity instead of returning a 401.
 *  `setCrmAccessTokenProvider` remains for the tests, which override the reader
 *  directly so the request shape, the gating and the error mapping are proven
 *  without a session.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'
import type { LeadConvertBody, FleetRenewBody } from '../../../../packages/contract/src/index'

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the calls that cannot go through the
 *  repository. See the module note. */
export function setCrmAccessTokenProvider(read: TokenReader): void {
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
      'The fixture repository cannot perform this action. Set VITE_API_URL to run against the API.',
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

/** Converts a lead to an opportunity. `ref` is the ULID or the lead's own id.
 *  The returned row is the *opportunity* the server created (or the existing one
 *  on an idempotent replay), which is what a success state links to. */
export function convertLead(
  ref: string,
  body: LeadConvertBody = {},
): Promise<Record<string, unknown>> {
  return post(`crm/leads/${encodeURIComponent(ref)}/convert`, body)
}

/** Renews a fleet contract. `contractEndDate` is required by the server; the
 *  rest move the term and value forward. Returns the fleet as the server left
 *  it — status back to active, new term recorded. */
export function renewFleet(ref: string, body: FleetRenewBody): Promise<Record<string, unknown>> {
  return post(`fleets/${encodeURIComponent(ref)}/renew`, body)
}

/** What to put in front of the user when an action is refused. The API's own
 *  wording wins wherever it has any — it is the only party that knows which rule
 *  refused (the permission matrix, a version conflict, a validation issue) — so
 *  replacing its sentence with a generic one is a downgrade. */
export function actionFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

/** A refusal the user cannot fix by retrying: their role forbids the action. */
export function isRefusal(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.code === 'forbidden' || error.code === 'rule_violated')
  )
}

export { RepositoryError }
