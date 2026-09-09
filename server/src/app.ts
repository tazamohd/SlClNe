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
import { registerApprovalRoutes } from './routes/approvals'
import { registerBankRoutes } from './routes/bank'
import { registerCollectionRoutes } from './routes/collections'
import { registerCrmRoutes } from './routes/crm'
import { registerEstimateRoutes } from './routes/estimates'
import { registerEstimateOtpRoutes } from './routes/estimate-otp'
import { registerObdRoutes } from './routes/obd'
import { registerFinanceReportRoutes } from './routes/finance-reports'
import { registerFleetRoutes } from './routes/fleets'
import { registerHealthRoutes } from './routes/health'
import { registerHistoryRoutes } from './routes/history'
import { registerInsuranceClaimRoutes } from './routes/insurance-claims'
import { registerInventoryRoutes } from './routes/inventory'
import { registerInvoiceRoutes } from './routes/invoices'
import { registerLeaveRoutes } from './routes/leave'
import { registerPayrollRoutes } from './routes/payroll'
import { registerProcurementRoutes } from './routes/procurement'
import { registerProductReportRoutes } from './routes/product-reports'
import { registerPublicRoutes } from './routes/public'
import { registerWorkshopRoutes } from './routes/workshop'
import { registerWorkshopReportRoutes } from './routes/workshop-reports'
import { bearerToken, createVerifier } from './security/principal'
import { buildAuth, isPublicAuthPath, registerAuth, type AuthModule } from './auth'
import type { OtpTransport } from './auth'
import { loadIntegrationConfig } from './integrations/config'
import { obdBridgeFor, type ObdBridge } from './integrations/obd'
import type { Database } from './db/client'
import type { Env } from './env'

/** Paths served without an access token. Anything not listed is authenticated.
 *
 *  The authentication routes are the other entry: `isPublicAuthPath` keeps that
 *  list beside the handlers it describes rather than duplicating it here, where
 *  the two copies would drift. Everything else — including `/auth/me` and the
 *  device list — is authenticated by default. */
const PUBLIC_PATHS = new Set(['/health', '/ready', '/api/v1/public/leads'])

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

/** The driver's own error, dug out from under whatever wrapped it.
 *
 *  drizzle-orm 0.44 began wrapping every driver failure in a
 *  `DrizzleQueryError` whose message is the generated SQL and whose `code` is
 *  undefined; the `PostgresError` carrying the SQLSTATE moved to `.cause`.
 *  Reading `error.code` directly therefore stopped seeing 23505 and 23503, and
 *  a duplicate phone answered 500 instead of 409 — the failure was silent
 *  because both shapes are plain objects and neither TypeScript nor the
 *  driver complains about a property that is simply absent.
 *
 *  The chain is walked rather than the wrapper class imported, so this keeps
 *  working whether or not a given drizzle version wraps, and if a future one
 *  adds another layer. `code` is only trusted in SQLSTATE shape — five
 *  alphanumerics — so an unrelated error carrying, say, `code: 'ENOENT'` is
 *  not mistaken for a constraint violation. The depth bound is there because
 *  a cause chain is attacker-adjacent data and need not be acyclic. */
interface DriverError {
  code?: string
  constraint_name?: string
  constraint?: string
}

function driverErrorOf(error: unknown): DriverError | undefined {
  let current: unknown = error
  for (let depth = 0; depth < 8 && typeof current === 'object' && current !== null; depth += 1) {
    const code = (current as DriverError).code
    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return current as DriverError
    current = (current as { cause?: unknown }).cause
  }
  return undefined
}

/** The colliding column out of a 23505's constraint name (F-018).
 *
 *  Every unique index in the schema is named `<table>_org_<column>_idx`, so
 *  the middle segment is the field the form control is bound to: a duplicate
 *  phone/plate/VIN/SKU can land on its own field instead of at form level.
 *  The postgres driver reports it as `constraint_name`; `constraint` is read
 *  too in case a wrapper renames it. An unrecognised name yields undefined
 *  and the envelope stays field-less rather than guessing. */
function uniqueViolationField(driver: DriverError): string | undefined {
  const constraint = driver.constraint_name ?? driver.constraint
  if (typeof constraint !== 'string') return undefined
  const match = /^[a-z0-9_]+_org_([a-z0-9_]+)_idx$/.exec(constraint)
  if (!match?.[1]) return undefined
  /* Column names are snake_case; row fields are camelCase. */
  return match[1].replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())
}

/** The shared taxonomy's code for a framework-raised 4xx (F-018). */
function errorCodeForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'unauthenticated'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'conflict'
    case 422:
      return 'validation_failed'
    case 429:
      return 'rate_limited'
    default:
      return 'bad_request'
  }
}

export interface AppDeps {
  db: Database
  env: Env
  /** Overrides the OTP transport. Only the test suite passes one; in every
   *  other environment the transport comes from `OTP_TRANSPORT`, whose default
   *  refuses rather than pretending a code was delivered. */
  otpTransport?: OtpTransport
  /** Overrides the OBD bridge. Only the test suite passes one; otherwise the
   *  bridge comes from `OBD_TRANSPORT`, whose default refuses rather than
   *  faking a device scan (§40). */
  obdBridge?: ObdBridge
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

  /** This process serves JSON and nothing else — no HTML, no static files, no
   *  view engine — so the strictest policy is also the cheapest: deny every
   *  fetch directive outright. `useDefaults` is off because helmet's defaults
   *  are written for a page that loads scripts and styles; an API needs none of
   *  them. `frameguard: deny` over the SAMEORIGIN default for the same reason:
   *  nothing here is ever meant to be framed. */
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
  })
  await app.register(cors, {
    origin: deps.env.corsOrigins.length > 0 ? deps.env.corsOrigins : false,
    credentials: true,
    /** A header the browser cannot read is a header the client does not have.
     *  `retry-after` and the rate-limit trio are answers to the caller — how
     *  long to wait, how much budget is left — and the resend countdown on the
     *  verification screens already reads `retry-after`; unlisted here, every
     *  cross-origin read of them is `null`. */
    exposedHeaders: [
      'x-request-id',
      'retry-after',
      'ratelimit-limit',
      'ratelimit-remaining',
      'ratelimit-reset',
    ],
  })
  await app.register(rateLimit, {
    /** Emit `RateLimit-Limit` / `-Remaining` / `-Reset`: the names
     *  `docs/security-report.md` documents this API as returning, and the ones
     *  the IETF draft defines. Left off, `@fastify/rate-limit` emits its legacy
     *  `X-RateLimit-*` spelling instead, so a client following the documented
     *  contract saw no budget headers at all. Nothing reads the `x-` names. */
    enableDraftSpec: true,
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

  /* The external-integration adapters. Both default to refusing (§40): the OBD
   * bridge and the SMS transport are EXTERNAL_DEPENDENCY, and a test overrides
   * them with a mock rather than the app pretending they are live. */
  const integrationConfig = loadIntegrationConfig()
  const obdBridge = deps.obdBridge ?? obdBridgeFor(integrationConfig)

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
    /* 400, not 422, and the distinction is the one `docs/api.md` draws: a Zod
     * failure means the body never matched the schema, so no domain rule was
     * ever consulted. Every route that parses a body explicitly answers 400
     * here; this fallback answered 422, so the same malformed request got two
     * different codes depending on whether the route remembered to catch. */
    if (isZodError(error)) {
      const issue = error.issues[0]
      reply.code(400)
      return reply.send({
        error: {
          code: 'bad_request',
          message: issue?.message ?? 'The request failed validation.',
          ...(issue?.path.length ? { field: issue.path.join('.') } : {}),
          requestId: request.id,
        },
      })
    }

    const driver = driverErrorOf(error)
    const driverCode = driver?.code
    if (driver && driverCode === '23505') {
      /* F-018: the constraint name carries which column collided —
       * `customers_org_phone_idx` means the phone. Without the field, a
       * duplicate phone/plate/VIN lands at form level instead of on the
       * control that caused it. */
      const field = uniqueViolationField(driver)
      reply.code(409)
      return reply.send({
        error: {
          code: 'conflict',
          message: field ? `That ${field} is already in use.` : 'That value is already in use.',
          ...(field ? { field } : {}),
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
    /* F-018: Fastify itself raises 4xx errors — an empty or malformed JSON
     * body, an oversized payload, an unsupported media type, the rate
     * limiter's 429. Only 429 used to be honoured; everything else fell
     * through to the 500 branch, so a client's malformed request read as a
     * server fault. Any framework 4xx now passes through with its own status
     * and a code from the shared taxonomy. Framework messages are template
     * text ("Body cannot be empty…"), not stack traces, so they are safe to
     * forward — and useful, because they say what to fix. */
    const statusCode = (error as { statusCode?: number }).statusCode
    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
      reply.code(statusCode)
      return reply.send({
        error: {
          code: errorCodeForStatus(statusCode),
          message:
            statusCode === 429
              ? 'Too many requests.'
              : (error as { message?: string }).message || 'The request could not be processed.',
          requestId: request.id,
        },
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
      registerFinanceReportRoutes(api, { db: deps.db, env: deps.env })
      registerEstimateRoutes(api, { db: deps.db })
      registerWorkshopRoutes(api, { db: deps.db })
      registerHistoryRoutes(api, { db: deps.db })
      registerApprovalRoutes(api, { db: deps.db })
      registerWorkshopReportRoutes(api, { db: deps.db, env: deps.env })
      registerObdRoutes(api, { db: deps.db, bridge: obdBridge, config: integrationConfig })
      registerEstimateOtpRoutes(api, { db: deps.db })
      registerInventoryRoutes(api, { db: deps.db })
      registerCrmRoutes(api, { db: deps.db })
      registerBankRoutes(api, { db: deps.db })
      registerFleetRoutes(api, { db: deps.db })
      registerInsuranceClaimRoutes(api, { db: deps.db })
      registerPayrollRoutes(api, { db: deps.db })
      registerLeaveRoutes(api, { db: deps.db })
      registerProcurementRoutes(api, { db: deps.db })
      registerProductReportRoutes(api, { db: deps.db })
      registerPublicRoutes(api, { db: deps.db, env: deps.env })
    },
    { prefix: '/api/v1' },
  )

  return app
}
