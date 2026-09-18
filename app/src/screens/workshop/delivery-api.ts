/** Customer sign-off at delivery — the write path (Sprint 2, P0 backlog item
 *  4).
 *
 *  Same reasoning as `./inspection-api.ts`: capturing the signature is an
 *  action the generic collection route refuses on purpose
 *  (`POST /delivery-signoffs` 400s — see
 *  `packages/contract/src/entities/deliverySignoff.ts`), so this module
 *  calls the bespoke multipart route directly, carrying the same bearer
 *  token `data/repository.ts` attaches to every collection request. The
 *  checklist and odometer, once known, travel through the ordinary generic
 *  `PATCH` instead — `data/useCollection.ts`'s `useUpdate`, not this module.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'
import type { DeliverySignoffRow } from '@/data/repository'

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

/** `POST /job-cards/:id/delivery-signoff` — multipart, the only request in
 *  this module that is not JSON, because a signature image's bytes have no
 *  JSON representation worth sending. Refused with a conflict if a signature
 *  was already captured for this job card. */
export async function uploadDeliverySignature(jobCardId: string, signature: Blob): Promise<DeliverySignoffRow> {
  if (!isLive) return Promise.reject(unsupportedError('capture a delivery signature'))
  const form = new FormData()
  form.append('file', signature, 'signature.png')
  let response: Response
  try {
    response = await fetch(apiUrl(`job-cards/${encodeURIComponent(jobCardId)}/delivery-signoff`), {
      method: 'POST',
      headers: authHeaders(),
      body: form,
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }
  return readJson<DeliverySignoffRow>(response)
}
