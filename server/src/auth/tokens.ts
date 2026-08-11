/** Token issuing. Verification of the *access* token lives in
 *  `src/security/principal.ts`, which is what every request runs through; this
 *  module is the other half — it signs.
 *
 *  Two tokens, deliberately different in kind:
 *
 *  - The **access token** is a 15-minute JWT carrying
 *    `{sub, role, org_id, branch_id, scope}` exactly as `API_ENDPOINTS.md`
 *    §Auth specifies. It is a bearer credential and it is not revocable, which
 *    is why it is short.
 *  - The **refresh token** is a 30-day JWT that names a *session row*. The JWT
 *    only identifies the session and proves we issued it; the session row in
 *    the database decides whether it is still valid. That is what makes
 *    revocation and reuse detection possible at all — a self-contained
 *    refresh token cannot be taken back.
 *
 *  The refresh token carries a random `jti` whose SHA-256 is stored on the
 *  session row. The database never holds a usable token, only a digest of one,
 *  so a leaked table dump cannot be replayed.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { scopeOf, type RoleId } from '@salis/contract'

/** The refresh token is issued for a different audience than the API, so a
 *  refresh token presented as `Authorization: Bearer` fails verification
 *  instead of being accepted as an access token that never expires. */
export const REFRESH_AUDIENCE_SUFFIX = '-refresh'

export interface AccessTokenInput {
  userId: string
  role: RoleId
  orgId: string
  branchId: string | null
  name?: string
}

export interface TokenSigner {
  signAccessToken(input: AccessTokenInput): Promise<string>
  signRefreshToken(input: RefreshTokenInput): Promise<{ token: string; secretHash: string }>
  verifyRefreshToken(token: string): Promise<RefreshClaims>
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
}

export interface RefreshTokenInput {
  sessionId: string
  familyId: string
  userId: string
  orgId: string
  branchId: string | null
}

export interface RefreshClaims {
  sessionId: string
  familyId: string
  userId: string
  orgId: string
  branchId: string | null
  /** The random secret whose digest the session row stores. */
  secret: string
}

export class InvalidRefreshToken extends Error {
  constructor(message = 'That refresh token is not valid.') {
    super(message)
    this.name = 'InvalidRefreshToken'
  }
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/** Constant-time comparison, so a token digest cannot be recovered a byte at a
 *  time from response timing. */
export function digestsMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function createTokenSigner(config: {
  secret: string
  issuer: string
  audience: string
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
}): TokenSigner {
  if (!config.secret) {
    throw new Error('JWT_SECRET is not set: the API cannot issue access tokens')
  }
  const key = new TextEncoder().encode(config.secret)
  const refreshAudience = `${config.audience}${REFRESH_AUDIENCE_SUFFIX}`

  return {
    accessTokenTtlSeconds: config.accessTokenTtlSeconds,
    refreshTokenTtlSeconds: config.refreshTokenTtlSeconds,

    async signAccessToken(input) {
      return new SignJWT({
        role: input.role,
        org_id: input.orgId,
        branch_id: input.branchId,
        /* Included because the contract specifies it. The API does **not**
         * trust it: `principalFromClaims` derives scope from the role, so a
         * tampered claim cannot widen what its holder sees. */
        scope: scopeOf(input.role),
        ...(input.name ? { name: input.name } : {}),
      })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(input.userId)
        .setIssuer(config.issuer)
        .setAudience(config.audience)
        .setIssuedAt()
        .setExpirationTime(`${config.accessTokenTtlSeconds}s`)
        .sign(key)
    },

    async signRefreshToken(input) {
      const secret = randomBytes(32).toString('base64url')
      const token = await new SignJWT({
        sid: input.sessionId,
        fid: input.familyId,
        org_id: input.orgId,
        branch_id: input.branchId,
        secret,
      })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(input.userId)
        .setIssuer(config.issuer)
        .setAudience(refreshAudience)
        .setIssuedAt()
        .setExpirationTime(`${config.refreshTokenTtlSeconds}s`)
        .sign(key)
      return { token, secretHash: hashSecret(secret) }
    },

    async verifyRefreshToken(token) {
      let payload: Record<string, unknown>
      try {
        const result = await jwtVerify(token, key, {
          issuer: config.issuer,
          audience: refreshAudience,
        })
        payload = result.payload as Record<string, unknown>
      } catch {
        throw new InvalidRefreshToken('That refresh token is expired or invalid.')
      }
      const sessionId = payload.sid
      const familyId = payload.fid
      const userId = payload.sub
      const orgId = payload.org_id
      const secret = payload.secret
      if (
        typeof sessionId !== 'string' ||
        typeof familyId !== 'string' ||
        typeof userId !== 'string' ||
        typeof orgId !== 'string' ||
        typeof secret !== 'string'
      ) {
        throw new InvalidRefreshToken('That refresh token is missing required claims.')
      }
      const branchId = payload.branch_id
      return {
        sessionId,
        familyId,
        userId,
        orgId,
        branchId: typeof branchId === 'string' ? branchId : null,
        secret,
      }
    },
  }
}
