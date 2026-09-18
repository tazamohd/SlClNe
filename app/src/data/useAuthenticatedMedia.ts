import { useEffect, useState } from 'react'
import { API_URL, getAccessToken, isLive } from './repository'

/** Fetches a protected file through the authenticated route it is actually
 *  served from — today, DVHC evidence at `GET /inspection-media/:id/file` —
 *  and hands the caller a local object URL. A plain `<img src>` cannot carry a
 *  bearer token, and that route is gated exactly like the row is (RLS plus
 *  `jobcards:v`), so an unauthenticated `<img>` tag would 401 instead of
 *  rendering. Revokes the object URL on cleanup so a screen with many photos
 *  does not leak memory.
 *
 *  `relativeUrl` is joined onto `API_URL` the way every bespoke action path in
 *  `screens/workshop/api.ts`/`inspection-api.ts` is (no leading slash, no
 *  `/api/v1` prefix — see `server/src/registry.ts`'s `inspectionMedia`
 *  collection for why the server emits it that way). */
export function useAuthenticatedMediaUrl(relativeUrl: string | undefined): { src: string | null; error: boolean } {
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!relativeUrl || !isLive) {
      setSrc(null)
      setError(!isLive)
      return
    }
    let cancelled = false
    let objectUrl: string | null = null
    setError(false)

    async function load() {
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL.replace(/\/$/, '')}/${relativeUrl}`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`status ${response.status}`)
        const blob = await response.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      } catch {
        if (!cancelled) setError(true)
      }
    }
    void load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [relativeUrl])

  return { src, error }
}
