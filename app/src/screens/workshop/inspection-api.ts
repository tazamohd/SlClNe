/** The DVHC inspection-findings write path (Sprint 2, P0).
 *
 *  Same reasoning as `./api.ts`'s job-card actions: creating a finding and
 *  uploading its evidence are actions the generic collection route refuses on
 *  purpose (`POST /inspection-findings` and a direct `POST /inspection-media`
 *  both 400 — see `packages/contract/src/entities/inspection.ts`), so this
 *  module calls the bespoke routes directly, carrying the same bearer token
 *  `data/repository.ts` attaches to every collection request. The one request
 *  shape neither `./api.ts` nor `data/repository.ts` sends is multipart —
 *  there is no other way to hand the server a file's actual bytes.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'
import type { InspectionAnnotation, InspectionFindingRow, InspectionMediaRow } from '@/data/repository'

export type InspectionSeverity = 'ok' | 'monitor' | 'attention' | 'urgent' | 'unsafe'
export type InspectionMediaStage = 'before' | 'after'

export interface InspectionFindingInput {
  category: string
  categoryAr?: string
  item: string
  itemAr?: string
  severity?: InspectionSeverity
  internalNote?: string
  customerNote?: string
  estimateLineId?: string
}

export interface HealthCheckReport {
  jobCardId: string
  vehicle: string
  findings: {
    id: string
    category: string
    categoryAr: string | null
    item: string
    itemAr: string | null
    severity: InspectionSeverity
    customerNote: string | null
    media: {
      id: string
      kind: 'photo' | 'video'
      stage: InspectionMediaStage
      annotations: InspectionAnnotation[]
      url: string
    }[]
  }[]
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

function authHeaders(extra?: Record<string, string>): Headers {
  const headers = new Headers({ accept: 'application/json', ...extra })
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

async function postJson<TResult>(path: string, body: unknown): Promise<TResult> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: authHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify(body),
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<TResult>(response)
}

async function getJson<TResult>(path: string): Promise<TResult> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), { method: 'GET', headers: authHeaders(), credentials: 'include' })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<TResult>(response)
}

/** `POST /job-cards/:id/inspection-findings`. Gated on `jobcards:e`
 *  server-side — the technician's own grant, since recording a finding while
 *  walking an inspection is an edit to the job's own record, not the creation
 *  of a new one (which is why `jobcards:c`, which technician does not hold,
 *  is the wrong gate). */
export function createInspectionFinding(
  jobCardId: string,
  input: InspectionFindingInput
): Promise<InspectionFindingRow> {
  if (!isLive) return Promise.reject(unsupportedError('record an inspection finding'))
  return postJson(`job-cards/${encodeURIComponent(jobCardId)}/inspection-findings`, input)
}

/** `POST /inspection-findings/:id/media` — multipart, the only request in this
 *  app that is not JSON, because a file's bytes have no JSON representation
 *  worth sending. `stage` travels on the query string rather than as a second
 *  form field: the server reads it before the file part is guaranteed to have
 *  arrived, so a query parameter is the one encoding that cannot depend on
 *  field ordering. */
export async function uploadInspectionMedia(
  findingId: string,
  file: File,
  stage: InspectionMediaStage = 'before'
): Promise<InspectionMediaRow> {
  if (!isLive) return Promise.reject(unsupportedError('upload inspection evidence'))
  const form = new FormData()
  form.append('file', file, file.name)
  let response: Response
  try {
    response = await fetch(
      apiUrl(`inspection-findings/${encodeURIComponent(findingId)}/media?stage=${encodeURIComponent(stage)}`),
      { method: 'POST', headers: authHeaders(), body: form, credentials: 'include' }
    )
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<InspectionMediaRow>(response)
}

/** `GET /jobs/:id/health-check-report` — the customer-facing shape. Staff
 *  screens use the same call to preview exactly what the customer will see:
 *  the report is one shape for every caller, narrowed by RLS to whose job it
 *  is rather than by who is asking. */
export function fetchHealthCheckReport(jobCardId: string): Promise<HealthCheckReport> {
  if (!isLive) return Promise.reject(unsupportedError('load a health-check report'))
  return getJson(`jobs/${encodeURIComponent(jobCardId)}/health-check-report`)
}
