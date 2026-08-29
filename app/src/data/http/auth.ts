/** The auth half of the HTTP contract (`project/handoff/API_ENDPOINTS.md`
 *  §Auth), a sibling to the repository client.
 *
 *  `POST /auth/login` → `{accessToken, refreshToken, user}`; the access token
 *  is stored as `salis-token` and sent `Authorization: Bearer`. `/auth/refresh`
 *  rotates the pair, `/auth/logout` revokes the refresh token, `/auth/me`
 *  returns the current user. */
import { ApiClient, type ClientOptions } from './client'

/** The signed-in user the server returns — shape-identical to the backend's
 *  `publicUser`. Never carries the password hash. */
export interface AuthUser {
  id: string
  email: string
  name: string
  /** Arabic display name. */
  ar: string
  role: string
  scope: string
  orgId: string | null
  branchId: string | null
  /** English role label, for the sidebar badge. */
  roleLabel: string
  /** Approval ceiling in SAR: `null` = unlimited, `0` = none. */
  approvalLimit: number | null
  /** Route to land on after sign-in. */
  destination: string
}

/** What a successful login/refresh yields. In mock mode the tokens are null —
 *  there is no server to issue them — but the `user` is fully populated. */
export interface Session {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

/** Auth calls over an `ApiClient`. Login and refresh need no token; `me` does,
 *  so it flows through the client's `getToken`. */
export class AuthApi {
  private readonly client: ApiClient

  constructor(options: ClientOptions) {
    // Never retry auth calls through onAuthFailure — a 401 from /auth/login IS
    // the answer (bad credentials), and refreshing here would recurse.
    this.client = new ApiClient({ ...options, onAuthFailure: undefined })
  }

  async login(email: string, password: string): Promise<Session> {
    return this.client.post<AuthResponse>('/auth/login', { email, password })
  }

  async refresh(refreshToken: string): Promise<Session> {
    return this.client.post<AuthResponse>('/auth/refresh', { refreshToken })
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.post<void>('/auth/logout', { refreshToken })
  }

  async me(): Promise<AuthUser> {
    const { user } = await this.client.get<{ user: AuthUser }>('/auth/me')
    return user
  }
}
