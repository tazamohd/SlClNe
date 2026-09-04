import { ServerValidationError } from '@/components/ui/Form'
import { API_URL, RepositoryError, getAccessToken, type RepositoryErrorCode } from '@/data/repository'
import type { MovementRow, MovementType } from './ledger'

/* ══════════════════════════════════════════════════ talking to the endpoint */

export interface MovementInput {
  type: MovementType
  qty: number
  ref?: string
  reason?: string
  toBranchId?: string
  /** Draw a consumption down against a held reservation (contract `movementCreate`). */
  fromReservation?: boolean
}

/** The body `POST`/`DELETE /inventory/:id/reservation` takes (contract
 *  `reservationBody`). A reservation is a hold on `parts.reserved`, not a ledger
 *  entry — it never appears as a movement type, so it has its own endpoint and
 *  its own input. */
export interface ReservationInput {
  qty: number
  ref?: string
  reason?: string
}

/** The stock-movement and reservation endpoints, as a seam a test can
 *  substitute. */
export interface MovementApi {
  list(partRef: string): Promise<MovementRow[]>
  /** `idempotencyKey` is what makes a retried receipt safe: the server replays
   *  the first result instead of receiving the stock twice. */
  record(partRef: string, input: MovementInput, idempotencyKey: string): Promise<MovementRow[]>
  /** Hold stock against `parts.reserved`. The server takes the row lock and
   *  refuses a hold larger than what is on hand (`checkReservation`). */
  reserve(partRef: string, input: ReservationInput): Promise<void>
  /** Give a held reservation back. The server refuses a release larger than the
   *  hold (`checkReservationRelease`). */
  release(partRef: string, input: ReservationInput): Promise<void>
}

/** Why the ledger cannot be reached, or null when it can.
 *
 *  `VITE_API_URL` unset means the app is reading the design fixtures: there is
 *  no server to ask, no ledger to read, and the fixture repository refuses
 *  writes by design rather than pretending they landed. Saying that plainly is
 *  the honest state — better than a disabled button with no reason, and far
 *  better than a form that appears to save. */
export function movementUnavailableReason(): string | null {
  if (!API_URL) {
    return 'Stock movements need the API. This build is reading design fixtures, which hold no ledger and refuse writes.'
  }
  return null
}

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the movement endpoints.
 *
 *  `data/repository.ts` owns the one authenticated HTTP path in the app — the
 *  session registers a token provider there and every collection request reads
 *  it. Both movement endpoints are actions on a part rather than collection
 *  CRUD, so neither can borrow that path: `createHttpRepository` can be pointed
 *  at a sub-collection, but `/inventory/:id/movement` is not one.
 *
 *  So the token arrives here instead, read from `getAccessToken` — the same
 *  source the repository attaches to every collection request — so a movement
 *  against a live API now carries the caller's identity instead of a 401. This
 *  setter remains for the tests, which override the reader directly, so the
 *  request shape and the error mapping are proven without a session. */
export function setInventoryAccessTokenProvider(read: TokenReader): void {
  readAccessToken = read
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; field?: string }
}

async function movementFetch<TResult>(path: string, init: RequestInit = {}): Promise<TResult> {
  const token = readAccessToken()
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body) headers.set('content-type', 'application/json')
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : null
  if (!response.ok) {
    const envelope = (body ?? {}) as ApiErrorBody
    throw new RepositoryError(
      (envelope.error?.code as RepositoryErrorCode) ?? 'internal',
      envelope.error?.message ?? `Request failed with status ${response.status}.`,
      { field: envelope.error?.field, status: response.status }
    )
  }
  return body as TResult
}

/** The live transport, or null when `movementUnavailableReason` has something
 *  to say — so a caller cannot accidentally fire a request that cannot work. */
export function httpMovementApi(): MovementApi | null {
  if (movementUnavailableReason()) return null
  return {
    async list(partRef) {
      const body = await movementFetch<{ rows?: MovementRow[] }>(
        `/inventory/${encodeURIComponent(partRef)}/movements`
      )
      return body?.rows ?? []
    },
    async record(partRef, input, idempotencyKey) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/movement`, {
        method: 'POST',
        headers: { 'idempotency-key': idempotencyKey },
        body: JSON.stringify(input),
      })
      return this.list(partRef)
    },
    async reserve(partRef, input) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/reservation`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },
    async release(partRef, input) {
      await movementFetch(`/inventory/${encodeURIComponent(partRef)}/reservation`, {
        method: 'DELETE',
        body: JSON.stringify(input),
      })
    },
  }
}

/** Turns a rejected request into something the form can show.
 *
 *  A field the server names becomes a field error; a permission or rule
 *  refusal becomes the form-level message, in the server's own words — it knows
 *  why (an approval ceiling, a segregation-of-duties pairing) and the client
 *  does not. */
export function asFormError(error: unknown): Error {
  if (!(error instanceof RepositoryError)) {
    return error instanceof Error ? error : new Error('The request failed.')
  }
  if (error.field) return new ServerValidationError({ [error.field]: error.message })
  if (error.code === 'forbidden') {
    return new ServerValidationError({}, error.message)
  }
  return new Error(error.message)
}

/** One key per submission attempt, so the retry of a request that timed out is
 *  replayed rather than received twice. */
export function idempotencyKey(): string {
  const globalCrypto = globalThis.crypto as Crypto | undefined
  if (globalCrypto?.randomUUID) return globalCrypto.randomUUID()
  return `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
