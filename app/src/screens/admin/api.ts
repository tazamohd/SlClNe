/** The Users & Teams write path — creating a garage's own staff accounts.
 *
 *  Not a registered collection, so — exactly as `screens/hr/api.ts`,
 *  `screens/workshop/api.ts` and `screens/crm/api.ts` document — there is no
 *  base URL that turns `createHttpRepository` into it. This module makes the
 *  call itself and reads the bearer token from `getAccessToken`, the one
 *  source `repository.ts` attaches to every request.
 *
 *  `POST /admin/staff` is gated on `admin:c`, which today only `owner`,
 *  `superadmin` and `test` hold (the matrix gives `manager` view-only on
 *  `admin`) — a manager can load the list below but a create attempt answers
 *  403, and the screen shows the server's own message for that rather than
 *  hiding the button, since the server is the one source of truth for who may
 *  add staff. */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'

type TokenReader = () => string | null | undefined

let readAccessToken: TokenReader = getAccessToken

/** Supplies the bearer token to the calls that cannot go through the
 *  repository. See the module note. */
export function setAdminAccessTokenProvider(read: TokenReader): void {
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

async function call<TResult>(path: string, init: RequestInit = {}): Promise<TResult> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture build cannot perform this action. Set VITE_API_URL to run against the API.',
    )
  }
  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/${path}`, {
      ...init,
      headers: authHeaders(),
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

const get = <TResult>(path: string) => call<TResult>(path, { method: 'GET' })
const post = <TResult>(path: string, body: unknown) =>
  call<TResult>(path, { method: 'POST', body: JSON.stringify(body) })

/** The internal roles `POST /admin/staff` may create — mirrors the server's
 *  own `STAFF_ROLES` allowlist (`server/src/auth/service.ts`). Kept as a
 *  literal list here, not imported, because the app and the API are separate
 *  packages; the server is the one that actually enforces it. */
export const STAFF_ROLES = [
  'manager',
  'advisor',
  'technician',
  'qc',
  'parts',
  'accountant',
  'hr',
  'frontdesk',
  'callcenter',
  'procurement',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export interface StaffUser {
  id: string
  email: string
  name: string
  role: string
  baseRole: string
  orgId: string
  branchId: string | null
  status: string
}

export async function listStaff(): Promise<StaffUser[]> {
  const result = await get<{ users: StaffUser[] }>('admin/staff')
  return result.users
}

export interface CreateStaffInput {
  name: string
  email: string
  role: StaffRole
  branchId?: string
  mode: 'direct' | 'invite'
}

export type CreateStaffResult =
  | { mode: 'direct'; user: StaffUser; temporaryPassword: string }
  | { mode: 'invite'; user: StaffUser; expiresAt: string }

export function createStaff(input: CreateStaffInput): Promise<CreateStaffResult> {
  return post('admin/staff', input)
}

/** What to put in front of the user when a call above fails. The API's own
 *  wording wins wherever it has any — it is the only party that knows which
 *  rule refused. */
export function actionFailureMessage(error: unknown, fallback: string): string {
  if (error instanceof RepositoryError) {
    if (error.code === 'unauthenticated') return 'Your session has ended. Sign in and try again.'
    if (error.code === 'network') return 'The server could not be reached. Nothing was saved.'
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export { RepositoryError }
