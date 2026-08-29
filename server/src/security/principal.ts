/** Who is asking.
 *
 *  The access token is verified here; issuing it, refreshing it and the login
 *  routes belong to `server/src/auth/**` (Agent 06). This module deliberately
 *  has **no development bypass header** — a test signs a real token with the
 *  same secret, because a bypass that exists in the code is a bypass that will
 *  one day be enabled in the wrong environment.
 *
 *  The `scope` claim is **not** trusted. Data scope is derived from the role
 *  against `RBAC.md`, so a tampered token cannot widen what its holder sees.
 */
import { jwtVerify, type JWTPayload } from 'jose'
import { roleId, scopeOf, type RoleId } from '@salis/contract'
import { unauthenticated } from '../http/errors'
import type { Principal } from '../db/tenant'

export interface TokenClaims extends JWTPayload {
  sub?: string
  role?: string
  org_id?: string
  branch_id?: string | null
  name?: string
}

export interface Verifier {
  verify(token: string): Promise<Principal>
}

export function createVerifier(config: {
  secret: string
  issuer: string
  audience: string
}): Verifier {
  const key = new TextEncoder().encode(config.secret)
  return {
    async verify(token: string): Promise<Principal> {
      let claims: TokenClaims
      try {
        const result = await jwtVerify(token, key, {
          issuer: config.issuer,
          audience: config.audience,
        })
        claims = result.payload as TokenClaims
      } catch {
        throw unauthenticated('The access token is missing, expired or invalid.')
      }
      return principalFromClaims(claims)
    },
  }
}

export function principalFromClaims(claims: TokenClaims): Principal {
  const parsedRole = roleId.safeParse(claims.role)
  if (!parsedRole.success) throw unauthenticated('The access token carries no usable role.')
  if (!claims.sub) throw unauthenticated('The access token carries no subject.')
  if (!claims.org_id) throw unauthenticated('The access token carries no organization.')

  const role: RoleId = parsedRole.data
  return {
    userId: claims.sub,
    orgId: claims.org_id,
    branchId: claims.branch_id ?? null,
    role,
    /** Derived, never read from the token. */
    scope: scopeOf(role),
    name: typeof claims.name === 'string' ? claims.name : undefined,
  }
}

export function bearerToken(header: string | undefined): string {
  if (!header) throw unauthenticated()
  const [kind, value] = header.split(' ')
  if (kind?.toLowerCase() !== 'bearer' || !value) throw unauthenticated()
  return value.trim()
}
