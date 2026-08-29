/** Authentication configuration.
 *
 *  Kept beside the module it configures rather than folded into `src/env.ts`,
 *  which belongs to another agent. Same rules apply: **no secret has a default
 *  literal**. Argon2 parameters and token lifetimes do have defaults, because a
 *  cost parameter is not a secret and a deployment that forgets one should get
 *  the OWASP figure rather than a weaker guess.
 *
 *  Every key here is documented in `server/.env.example` with no value beside
 *  it.
 */
import { z } from 'zod'

const schema = z.object({
  /** OWASP Password Storage Cheat Sheet, argon2id: m=19 MiB, t=2, p=1. */
  ARGON2_MEMORY_KIB: z.coerce.number().int().min(8192).max(1_048_576).default(19_456),
  ARGON2_TIME_COST: z.coerce.number().int().min(2).max(10).default(2),
  ARGON2_PARALLELISM: z.coerce.number().int().min(1).max(16).default(1),

  /** Minutes. `API_ENDPOINTS.md` §Auth: the access token is short-lived and the
   *  refresh token carries the session. */
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),

  /** Seconds between OTP sends to one destination (`handoff/README.md` §6b). */
  OTP_RESEND_SECONDS: z.coerce.number().int().min(30).max(600).default(60),
  OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(60).default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
  /** `unconfigured` (default) refuses to pretend a code was delivered.
   *  `log` writes it to the server log — a development transport, and it says
   *  so on every send. `memory` exists for the test suite. */
  OTP_TRANSPORT: z.enum(['unconfigured', 'log', 'memory']).default('unconfigured'),

  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),

  /** Per-route budgets for the unauthenticated endpoints. The global limiter
   *  keys on `orgId:ip`, and before sign-in there is no `orgId` — every
   *  anonymous caller in the world would otherwise share one bucket. */
  AUTH_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).max(100_000).default(20),
  LOGIN_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).max(100_000).default(10),

  /** Failed sign-ins from one identity before it is locked out, and for how
   *  long. Enforced in-process — see `loginThrottle` in `service.ts`. */
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(50).default(8),
  LOGIN_LOCKOUT_SECONDS: z.coerce.number().int().min(30).max(3600).default(300),

  /** Enterprise SSO and WebAuthn have no credentials in any environment this
   *  code has run in. Empty means unconfigured, and the routes say so with a
   *  503 rather than returning a fabricated success. */
  SSO_ISSUER_URL: z.string().default(''),
  SSO_CLIENT_ID: z.string().default(''),
  SSO_CLIENT_SECRET: z.string().default(''),
  WEBAUTHN_RP_ID: z.string().default(''),
  WEBAUTHN_ORIGIN: z.string().default(''),
})

export interface AuthConfig extends z.infer<typeof schema> {
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
  ssoConfigured: boolean
  webauthnConfigured: boolean
}

export function loadAuthConfig(source: NodeJS.ProcessEnv = process.env): AuthConfig {
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid authentication environment: ${detail}`)
  }
  const value = parsed.data
  return {
    ...value,
    accessTokenTtlSeconds: value.ACCESS_TOKEN_TTL_MINUTES * 60,
    refreshTokenTtlSeconds: value.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    ssoConfigured: Boolean(value.SSO_ISSUER_URL && value.SSO_CLIENT_ID && value.SSO_CLIENT_SECRET),
    webauthnConfigured: Boolean(value.WEBAUTHN_RP_ID && value.WEBAUTHN_ORIGIN),
  }
}
