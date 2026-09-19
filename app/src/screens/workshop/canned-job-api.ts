/** Canned Jobs — the catalog write path (build-order item 5).
 *
 *  Same reasoning as `./inspection-api.ts`: creating and updating a canned
 *  job replace every line and reprice the bundle, an operation the generic
 *  collection route refuses on purpose (`POST /canned-jobs` 400s — see
 *  `packages/contract/src/entities/cannedJob.ts`), so this module calls the
 *  bespoke routes directly, carrying the same bearer token
 *  `data/repository.ts` attaches to every collection request.
 *
 *  Applying a package *to* an estimate needs none of this: it is a plain
 *  `PATCH /estimates/:id` with the merged `lines` array, which the estimate
 *  is already writable through — `useUpdate('estimates')` from
 *  `data/useCollection.ts` is the right tool for that, not a function here.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'
import type { CannedJobRow } from '@/data/repository'

export interface CannedJobLineInput {
  description: string
  descriptionAr?: string
  kind: 'part' | 'labour'
  qty: number
  unitPriceHalalas: number
  partSku?: string
}

export interface CannedJobLineRow {
  id: string
  description: string
  descriptionAr?: string | null
  kind: string
  qty: number
  unitPriceHalalas: number
  partSku?: string | null
  sort: number
}

export interface CannedJobInput {
  name: string
  nameAr?: string
  category?: string
  description?: string
  lines: CannedJobLineInput[]
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

function apiUrl(path: string): string {
  return `${API_URL.replace(/\/$/, '')}/${path}`
}

function authHeaders(withBody: boolean): Headers {
  const headers = new Headers(
    withBody
      ? { accept: 'application/json', 'content-type': 'application/json' }
      : { accept: 'application/json' }
  )
  const token = getAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  return headers
}

async function readJson<TResult>(response: Response): Promise<TResult> {
  const text = await response.text()
  const parsed: unknown = text ? JSON.parse(text) : null
  if (!response.ok) throw errorFrom(parsed, response.status)
  return parsed as TResult
}

function unsupportedError(action: string): RepositoryError {
  return new RepositoryError(
    'unsupported',
    `The fixture repository cannot ${action}. Set VITE_API_URL to run against the API.`
  )
}

async function post<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) return Promise.reject(unsupportedError('save a canned job'))
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(body),
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<TResult>(response)
}

async function patch<TResult>(path: string, body: unknown): Promise<TResult> {
  if (!isLive) return Promise.reject(unsupportedError('save a canned job'))
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(body),
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<TResult>(response)
}

async function get<TResult>(path: string): Promise<TResult> {
  if (!isLive) return Promise.reject(unsupportedError('load a canned job'))
  let response: Response
  try {
    response = await fetch(apiUrl(path), { method: 'GET', headers: authHeaders(false), credentials: 'include' })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<TResult>(response)
}

/** `POST /canned-jobs`. Gated on `estimates:c` server-side — whoever can
 *  raise an estimate maintains the packages that get copied onto one. */
export function createCannedJob(input: CannedJobInput): Promise<CannedJobRow> {
  return post('canned-jobs', input)
}

/** `PATCH /canned-jobs/:id`. A `lines` array replaces every existing line
 *  and reprices the package; other fields may be sent alone. */
export function updateCannedJob(id: string, input: Partial<CannedJobInput> & { active?: boolean }): Promise<CannedJobRow> {
  return patch(`canned-jobs/${encodeURIComponent(id)}`, input)
}

/** `GET /canned-jobs/:id/lines` — the bundle's line items, the same shape
 *  `fetchEstimateLines` returns, so turning one into estimate lines is a
 *  field rename. */
export function fetchCannedJobLines(id: string): Promise<{ rows: CannedJobLineRow[] }> {
  return get(`canned-jobs/${encodeURIComponent(id)}/lines`)
}
