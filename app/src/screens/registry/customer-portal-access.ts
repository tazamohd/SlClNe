/** `POST /customers/:id/portal-access` (Phase B) — the staff-initiated way a
 *  customer gets a login, beside the public phone-OTP self-signup this
 *  module never touches.
 *
 *  Not a registered collection action, so — exactly as `screens/hr/api.ts`
 *  and `screens/admin/api.ts` document — there is no base URL that turns
 *  `createHttpRepository` into it. This makes the call itself and reads the
 *  bearer token from `getAccessToken`, the one source `repository.ts`
 *  attaches to every request.
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'

interface ErrorBody {
  error?: { code?: string; message?: string; requestId?: string }
}

export interface PortalAccessGrant {
  user: { id: string; email: string; name: string; role: string }
  expiresAt: string
}

export async function grantCustomerPortalAccess(customerId: string): Promise<PortalAccessGrant> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture build cannot perform this action. Set VITE_API_URL to run against the API.',
    )
  }
  const headers = new Headers({ accept: 'application/json', 'content-type': 'application/json' })
  const token = getAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(
      `${API_URL.replace(/\/$/, '')}/customers/${encodeURIComponent(customerId)}/portal-access`,
      { method: 'POST', headers, credentials: 'include' },
    )
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const body: unknown = text ? JSON.parse(text) : null
  if (!response.ok) {
    const envelope = (body ?? {}) as ErrorBody
    throw new RepositoryError(
      (envelope.error?.code as RepositoryError['code']) ?? 'internal',
      envelope.error?.message ?? `Request failed with status ${response.status}.`,
      { status: response.status, requestId: envelope.error?.requestId },
    )
  }
  return body as PortalAccessGrant
}
