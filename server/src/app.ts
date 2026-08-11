/** The Fastify application.
 *
 *  Order matters here: security headers, then rate limiting, then
 *  authentication, then routes. Authentication is an `onRequest` hook applied
 *  to everything except the two probes, so a route cannot be added later that
 *  quietly skips it — a new route is authenticated by default and has to be
 *  named explicitly to be public.
 */
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance } from 'fastify'
import { ApiError } from './http/errors'
import { loggerOptions } from './logger'
import { registerCollectionRoutes } from './routes/collections'
import { registerEstimateRoutes } from './routes/estimates'
import { registerHealthRoutes } from './routes/health'
import { registerInventoryRoutes } from './routes/inventory'
import { registerInvoiceRoutes } from './routes/invoices'
import { registerWorkshopRoutes } from './routes/workshop'
import { bearerToken, createVerifier } from './security/principal'
import { buildAuth, isPublicAuthPath, registerAuth, type AuthModule } from './auth'
import type { OtpTransport } from './auth'
import type { Database } from './db/client'
import type { Env } from './env'

/** Paths served without an access token. Anything not listed is authenticated.
 *
 *  The authentication routes are the other entry: `isPublicAuthPath` keeps that
 *  list beside the handlers it describes rather than duplicating it here, where
 *  the two copies would drift. Everything else — including `/auth/me` and the
 *  device list — is authenticated by default. */
const PUBLIC_PATHS = new Set(['/health', '/ready'])

const API_PREFIX = '/api/v1'

interface ZodLike {
  name: string
  issues: { message: string; path: (string | number)[] }[]
}

function isZodError(error: unknown): error is ZodLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ZodLike).name === 'ZodError' &&
    Array.isArray((error as ZodLike).issues)
  )
}

export interface AppDeps {
  db: Database
  env: Env
  /** Overrides the OTP transport. Only the test suite passes one; in every
   *  other environment the transport comes from `OTP_TRANSPORT`, whose default
   *  refuses rather than pretending a code was delivered. */
  otpTransport?: OtpTransport
}

declare module 'fastify' {
  interface FastifyInstance {
    /** The assembled authentication module, so an administrative caller or a
     *  test can use the same service the routes use rather than a second one
     *  built from different configuration. */
    auth: AuthModule
  }
}

export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerOptions(deps.env.LOG_LEVEL),
    /** Trust the proxy only for the client IP, which the rate limiter and the
     *  audit log need. */
    trustProxy: true,
  })

  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: deps.env.corsOrigins.length > 0 ? deps.env.corsOrigins : false,
    credentials: true,
    exposedHeaders: ['x-request-id'],
  })
  await app.register(rateLimit, {
    max: deps.env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
    /** The tenant, not just the address — one noisy branch behind a NAT must
     *  not exhaust the budget for the whole organization's office. */
    keyGenerator: (request) => `${request.principal?.orgId ?? 'anon'}:${request.ip}`,
  })

  if (!deps.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set: the API cannot verify access tokens')
  }
  const verifier = createVerifier({
    secret: deps.env.JWT_SECRET,
    issuer: deps.env.JWT_ISSUER,
    audience: deps.env.JWT_AUDIENCE,
  })

  const auth = buildAuth({ db: deps.db, env: deps.env, transport: deps.otpTransport })
  app.decorate('auth', auth)

  app.addHook('onRequest', async (request) => {
    const path = request.url.split('?')[0] ?? ''
    if (PUBLIC_PATHS.has(path)) return
    if (isPublicAuthPath(path, API_PREFIX)) return
    request.principal = await verifier.verify(bearerToken(request.headers.authorization))
  })

  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('x-request-id', request.id)
    return payload
  })

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      /* 4xx from a rule or a permission is expected traffic, not an incident:
       * logged at warn with its detail, never with a stack trace. */
      request.log.warn(
        { code: error.code, field: error.field, detail: error.detail },
        error.message,
      )
      reply.code(error.status)
      return reply.send(error.toBody(request.id))
    }

    /* Matched by name rather than `instanceof`: the contract package carries
     * its own Zod instance, and an `instanceof` check across the two would
     * miss the very errors this branch exists for. */
    if (isZodError(error)) {
      const issue = error.issues[0]
      reply.code(422)
      return reply.send({
        error: {
          code: 'validation_failed',
          message: issue?.message ?? 'The request failed validation.',
          ...(issue?.path.length ? { field: issue.path.join('.') } : {}),
          requestId: request.id,
        },
      })
    }

    const driverCode = (error as { code?: string }).code
    if (driverCode === '23505') {
      reply.code(409)
      return reply.send({
        error: {
          code: 'conflict',
          message: 'That value is already in use.',
          requestId: request.id,
        },
      })
    }
    if (driverCode === '23503') {
      reply.code(422)
      return reply.send({
        error: {
          code: 'rule_violated',
          message: 'That reference does not exist.',
          requestId: request.id,
        },
      })
    }
    if ((error as { statusCode?: number }).statusCode === 429) {
      reply.code(429)
      return reply.send({
        error: { code: 'rate_limited', message: 'Too many requests.', requestId: request.id },
      })
    }

    /* Anything else is ours. The client gets an id, never a driver message or
     * a stack — those name tables, columns and file paths. */
    request.log.error({ err: error }, 'unhandled error')
    reply.code(500)
    return reply.send({
      error: {
        code: 'internal',
        message: 'Something went wrong. Quote the request id when reporting this.',
        requestId: request.id,
      },
    })
  })

  app.setNotFoundHandler((request, reply) => {
    reply.code(404)
    return reply.send({
      error: { code: 'not_found', message: 'No such endpoint.', requestId: request.id },
    })
  })

  registerHealthRoutes(app, { db: deps.db })
  await app.register(
    async (api) => {
      registerAuth(api, auth)
      registerCollectionRoutes(api, { db: deps.db })
      registerInvoiceRoutes(api, { db: deps.db })
      registerEstimateRoutes(api, { db: deps.db })
      registerWorkshopRoutes(api, { db: deps.db })
      registerInventoryRoutes(api, { db: deps.db })
    },
    { prefix: '/api/v1' },
  )

  return app
}
