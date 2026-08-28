/** Auth chain the frontend expects (API_ENDPOINTS.md §Auth):
 *  POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me.
 *
 *  Login returns {accessToken, refreshToken, user}; the access token embeds
 *  {sub, role, org_id, branch_id, scope}. The frontend stores accessToken as
 *  `salis-token` and sends it as `Authorization: Bearer …`. */
import { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'
import { signAccessToken, newRefreshToken, verifyPassword, type AccessClaims } from '../auth/jwt.js'
import { requireAuth, handler } from '../auth/middleware.js'
import { roleMeta, destinationFor } from '../auth/rbac.js'
import { errors } from '../http.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({ refreshToken: z.string().min(1) })
const logoutSchema = z.object({ refreshToken: z.string().min(1) })

type UserRow = typeof schema.users.$inferSelect

/** The user object returned to the client — never the password hash. */
function publicUser(u: UserRow) {
  const meta = roleMeta(u.role)
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    ar: u.ar,
    role: u.role,
    scope: u.scope,
    orgId: u.orgId,
    branchId: u.branchId,
    roleLabel: meta.label,
    approvalLimit: meta.limit,
    destination: destinationFor(u.role),
  }
}

function claimsFor(u: UserRow): AccessClaims {
  return { sub: u.id, role: u.role, org_id: u.orgId, branch_id: u.branchId, scope: u.scope }
}

export function authRouter(): Router {
  const router = Router()

  router.post(
    '/auth/login',
    handler(async (req, res) => {
      const parsed = loginSchema.safeParse(req.body)
      if (!parsed.success) {
        const first = parsed.error.issues[0]
        throw errors.validation(first.message, String(first.path[0] ?? ''))
      }
      const db = getDb()
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, parsed.data.email.toLowerCase()))
        .limit(1)

      // Same error whether the email is unknown or the password is wrong — no
      // account enumeration.
      if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
        throw new (await import('../http.js')).AppError(401, 'invalid_credentials', 'Email or password is incorrect')
      }

      const accessToken = signAccessToken(claimsFor(user))
      const { token: refreshToken, expiresAt } = newRefreshToken()
      await db.insert(schema.refreshTokens).values({ token: refreshToken, userId: user.id, expiresAt })

      res.json({ accessToken, refreshToken, user: publicUser(user) })
    }),
  )

  router.post(
    '/auth/refresh',
    handler(async (req, res) => {
      const parsed = refreshSchema.safeParse(req.body)
      if (!parsed.success) throw errors.validation('refreshToken is required', 'refreshToken')
      const db = getDb()
      const [row] = await db
        .select()
        .from(schema.refreshTokens)
        .where(and(eq(schema.refreshTokens.token, parsed.data.refreshToken), eq(schema.refreshTokens.revoked, false)))
        .limit(1)

      if (!row || row.expiresAt.getTime() < Date.now()) {
        throw errors.unauthorized('Refresh token is invalid or expired')
      }
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, row.userId)).limit(1)
      if (!user) throw errors.unauthorized('Account no longer exists')

      // Rotate: revoke the used token, issue a fresh pair.
      await db.update(schema.refreshTokens).set({ revoked: true }).where(eq(schema.refreshTokens.token, row.token))
      const accessToken = signAccessToken(claimsFor(user))
      const { token: refreshToken, expiresAt } = newRefreshToken()
      await db.insert(schema.refreshTokens).values({ token: refreshToken, userId: user.id, expiresAt })

      res.json({ accessToken, refreshToken, user: publicUser(user) })
    }),
  )

  router.post(
    '/auth/logout',
    handler(async (req, res) => {
      const parsed = logoutSchema.safeParse(req.body)
      if (!parsed.success) throw errors.validation('refreshToken is required', 'refreshToken')
      const db = getDb()
      await db
        .update(schema.refreshTokens)
        .set({ revoked: true })
        .where(eq(schema.refreshTokens.token, parsed.data.refreshToken))
      res.status(204).end()
    }),
  )

  router.get(
    '/auth/me',
    requireAuth,
    handler(async (req, res) => {
      const db = getDb()
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.user!.sub)).limit(1)
      if (!user) throw errors.unauthorized('Account no longer exists')
      res.json({ user: publicUser(user) })
    }),
  )

  return router
}
