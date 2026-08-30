import { SignJWT } from 'jose'
import { buildApp } from '../src/app.js'
import { createDb, type DbHandle } from '../src/db/client.js'
import type { FastifyInstance, InjectOptions, HTTPMethods } from 'fastify'
import type { Env } from '../src/env.js'
import { resetDatabase } from './harness.js'
import { SEED } from '../scripts/seed.js'

let appInstance: FastifyInstance
let dbHandle: DbHandle
let envInstance: Env

interface TestResponse {
  status: number
  body: any
  headers: Record<string, string | string[] | undefined>
}

interface RequestChain extends PromiseLike<TestResponse> {
  set(headers: Record<string, string>): RequestChain
  send(body: unknown): RequestChain
}

function createChain(app: FastifyInstance, method: HTTPMethods, url: string): RequestChain {
  const opts: InjectOptions = { method: method as InjectOptions['method'], url, headers: {} }

  async function execute(): Promise<TestResponse> {
    const res = await app.inject(opts)
    let body: TestResponse['body']
    try {
      body = res.json()
    } catch {
      body = {}
    }
    return { status: res.statusCode, body, headers: res.headers as TestResponse['headers'] }
  }

  const chain: RequestChain = {
    set(headers: Record<string, string>) {
      opts.headers = { ...(opts.headers as Record<string, string>), ...headers }
      return chain
    },
    send(body: unknown) {
      opts.payload = body as string
      return chain
    },
    then(resolve, reject) {
      return execute().then(resolve, reject)
    },
  }
  return chain
}

function createApi(app: FastifyInstance) {
  return {
    get: (url: string) => createChain(app, 'GET', url),
    post: (url: string) => createChain(app, 'POST', url),
    patch: (url: string) => createChain(app, 'PATCH', url),
    delete: (url: string) => createChain(app, 'DELETE', url),
    put: (url: string) => createChain(app, 'PUT', url),
  }
}

type Api = ReturnType<typeof createApi>
let apiInstance: Api

export { apiInstance as api }

export async function setupDb(): Promise<void> {
  /** Build the schema the same way every other suite does. This used to call
   *  `loadEnv()` and connect straight to DATABASE_URL, which has no tables:
   *  the two suites on this helper died at login with `relation "users" does
   *  not exist`, and vitest reported their assertions as skipped rather than
   *  failed — so they looked switched off rather than broken. */
  const envConfig = await resetDatabase()
  envInstance = envConfig
  dbHandle = createDb(envConfig.DATABASE_URL)
  appInstance = await buildApp({ db: dbHandle.db, env: envConfig })
  await appInstance.ready()
  apiInstance = createApi(appInstance)
}

export async function teardownDb(): Promise<void> {
  if (appInstance) await appInstance.close()
  if (dbHandle) await dbHandle.close()
}

/** Mints a token directly rather than posting credentials.
 *
 *  `scripts/seed.ts` sets no passwords on purpose — "a seeded password hash in
 *  a repository is a credential in a repository" — so there was never a
 *  password this could send, and every caller died at 401 before reaching what
 *  it meant to assert. `harness.ts` has always signed its own tokens for the
 *  same reason; this is that approach, for the two suites still on this helper.
 *
 *  The role travels with the address because the seeded identities are fixed by
 *  `RBAC.md`; `EMAILS` maps each to the role the token must carry. */
export async function login(email: string): Promise<string> {
  const role = ROLE_BY_EMAIL[email]
  if (!role) throw new Error(`no seeded role for ${email} — add it to EMAILS`)
  const secret = new TextEncoder().encode(envInstance.JWT_SECRET as string)
  return new SignJWT({
    role,
    org_id: SEED.orgId,
    branch_id: SEED.mainBranchId,
    name: `${role} tester`,
    scope: 'platform',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(`01JUSER${role.toUpperCase().padEnd(18, 'X').slice(0, 18)}`)
    .setIssuer(envInstance.JWT_ISSUER)
    .setAudience(envInstance.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export const EMAILS = {
  owner: 'owner@salisauto.sa',
  technician: 'tech@salisauto.sa',
  accountant: 'finance@salisauto.sa',
  advisor: 'advisor@salisauto.sa',
}

const ROLE_BY_EMAIL: Record<string, string> = {
  [EMAILS.owner]: 'owner',
  [EMAILS.technician]: 'technician',
  [EMAILS.accountant]: 'accountant',
  [EMAILS.advisor]: 'advisor',
}
