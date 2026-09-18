/** Dispatching a campaign — `POST /crm/campaigns/:id/send`.
 *
 *  Not a field update: the server hands the campaign to a messaging transport
 *  and only then flips its status, so this goes through its own call rather
 *  than `useUpdate('campaigns')`. The transport is unconfigured by default
 *  (§40, EXTERNAL_DEPENDENCY) — a screen meets that the same way
 *  `OBDDiagnostics.tsx` meets a bridge that is not deployed, via
 *  `isExternalDependency`, never a fabricated "Sent".
 */
import { API_URL, RepositoryError, getAccessToken, isLive } from '@/data/repository'

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

/** The campaign row this action returns, in the shape `useCollection`
 *  presents it — enough to update the cache without a re-fetch. */
export async function sendCampaign(id: string): Promise<Record<string, unknown>> {
  if (!isLive) {
    throw new RepositoryError(
      'unsupported',
      'The fixture repository cannot dispatch a campaign. Set VITE_API_URL to run against the API.',
    )
  }
  const headers = new Headers({ accept: 'application/json' })
  const token = getAccessToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL.replace(/\/$/, '')}/crm/campaigns/${encodeURIComponent(id)}/send`, {
      method: 'POST',
      headers,
      credentials: 'include',
    })
  } catch {
    throw new RepositoryError('network', 'The server could not be reached.', { status: 0 })
  }

  const text = await response.text()
  const parsed: unknown = text ? JSON.parse(text) : null
  if (!response.ok) throw errorFrom(parsed, response.status)
  return parsed as Record<string, unknown>
}

/** The messaging provider is an external dependency (§40): the server ships it
 *  as adapter-plus-mock and refuses a live send with a 503
 *  `external_dependency_unavailable` until one is deployed. A screen meets
 *  that as the honest "not connected yet" state — never a failure toast and
 *  never a faked "Sent" — the same check `workshop/api.ts`'s
 *  `isExternalDependency` runs for the OBD bridge and the OTP transport. */
export function isMessagingUnavailable(error: unknown): boolean {
  return (
    error instanceof RepositoryError &&
    (error.status === 503 || (error.code as string) === 'external_dependency_unavailable')
  )
}
