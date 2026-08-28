/** JWT + password helpers. Access tokens embed the claims the contract names:
 *  {sub, role, org_id, branch_id, scope} (API_ENDPOINTS.md §Auth). */
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../env.js'

export interface AccessClaims {
  sub: string
  role: string
  org_id: string
  branch_id: string
  scope: string
}

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL })
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, env.JWT_SECRET) as AccessClaims
}

/** Opaque refresh token — random, stored server-side, revocable on logout. */
export function newRefreshToken(): { token: string; expiresAt: Date } {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000),
  }
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10)
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash)
}
