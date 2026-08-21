/** The HTTP transport for the repository seam.
 *
 *  Conventions come from `project/handoff/API_ENDPOINTS.md`: list endpoints
 *  take `?page&pageSize&sort&q&filter[field]`, every error is
 *  `{error:{code,message,field?}}`, and timestamps are ISO 8601 UTC. */

export interface ListQuery {
  page?: number
  pageSize?: number
  /** `field:asc` or `field:desc`, per the contract. */
  sort?: string
  /** Free-text search. */
  q?: string
  /** Becomes `filter[key]=value`. Undefined and null entries are dropped so
   *  callers can pass optional filters without building the object twice. */
  filter?: Record<string, string | number | boolean | undefined | null>
}

/** The error envelope the API promises. Thrown for any non-2xx response so
 *  call sites get one shape to catch instead of guessing at the body. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Present on 422 field validation failures. */
    readonly field?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** 401/403 mean "re-authenticate or you may not"; the UI treats them
   *  differently from a 500, so make the check readable at call sites. */
  get isAuthFailure(): boolean {
    return this.status === 401 || this.status === 403
  }
}

export interface ClientOptions {
  baseUrl: string
  /** Called per request so a refreshed token is picked up without rebuilding
   *  the client. Returning null sends the request unauthenticated. */
  getToken?: () => string | null
  /** Injected in tests; defaults to the platform `fetch`. */
  fetchImpl?: typeof fetch
}

export function buildQuery(query: ListQuery = {}): string {
  const params = new URLSearchParams()
  if (query.page != null) params.set('page', String(query.page))
  if (query.pageSize != null) params.set('pageSize', String(query.pageSize))
  if (query.sort) params.set('sort', query.sort)
  if (query.q) params.set('q', query.q)
  for (const [key, value] of Object.entries(query.filter ?? {})) {
    if (value != null) params.set(`filter[${key}]`, String(value))
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

/** Joins base and path without doubling or dropping the slash between them. */
function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly getToken: () => string | null
  private readonly fetchImpl: typeof fetch

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl
    this.getToken = options.getToken ?? (() => null)
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis)
  }

  async request<T>(method: string, path: string, init: { query?: ListQuery; body?: unknown } = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const token = this.getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (init.body !== undefined) headers['Content-Type'] = 'application/json'

    const response = await this.fetchImpl(joinUrl(this.baseUrl, path) + buildQuery(init.query), {
      method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })

    if (!response.ok) throw await toApiError(response)

    // 204 carries no body; `DELETE` uses it.
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  get<T>(path: string, query?: ListQuery): Promise<T> {
    return this.request<T>('GET', path, { query })
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body })
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, { body })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }
}

/** Turns a failed response into an `ApiError`, tolerating a body that is not
 *  the documented envelope — a proxy or gateway can return HTML, and losing
 *  the status code behind a JSON parse error would hide what went wrong. */
async function toApiError(response: Response): Promise<ApiError> {
  let code = String(response.status)
  let message = response.statusText || 'Request failed'
  let field: string | undefined

  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string; field?: string } }
    if (body?.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
      field = body.error.field
    }
  } catch {
    /* not JSON — keep the status-derived message */
  }

  return new ApiError(response.status, code, message, field)
}
