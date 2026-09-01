import { buildApp } from '../src/app.js'
import { withAuthPlane } from '../src/auth/context.js'
import { createDb, type DbHandle } from '../src/db/client.js'
import { users } from '../src/db/schema.js'
import { systemPrincipal } from '../src/db/tenant.js'
import { loadDotEnvFile, loadEnv } from '../src/env.js'
import { SEED } from '../scripts/seed.js'
import type { FastifyInstance, InjectOptions, HTTPMethods } from 'fastify'

/** The password the seeded identities get, for this database, at setup time.
 *
 *  `scripts/seed.ts` ships no password hashes on the stated grounds that a
 *  seeded credential is a credential in a repository, so every demo user
 *  arrives with `password_hash` null and `verifyPassword` short-circuits to
 *  false. Suites that mint a JWT never noticed; the two that sign in through
 *  `POST /auth/login` — collections and writes — could not get past the front
 *  door, and had never run.
 *
 *  Twelve characters minimum, because `checkPasswordPolicy` says so. The
 *  literal these suites carried, `salis1234`, is nine: the service would have
 *  refused to set it even if something had tried, which is why no amount of
 *  seeding would have rescued them. Override with TEST_DEMO_PASSWORD. */
export const TEST_PASSWORD = process.env.TEST_DEMO_PASSWORD ?? 'salis-test-password'

let appInstance: FastifyInstance
let dbHandle: DbHandle

interface TestResponse {
  status: number
  body: any
  headers: Record<string, string | string[] | undefined>
}

interface RequestChain extends PromiseLike<TestResponse> {
  set(headers: Record<string, string>): RequestChain
  send(body: unknown): RequestChain
}

/** Routes that live on the root app rather than under the API prefix. */
const ROOT_PATHS = new Set(['/health', '/ready'])

/** Resolves a test's path against the prefix the app actually mounts.
 *
 *  `buildApp` registers every resource under `/api/v1` and leaves only the
 *  health probes at the root. These suites were written against bare paths —
 *  `api.get('/jobs')` — so every request landed on nothing and came back 404.
 *  That was invisible for as long as the suites died at login instead, which is
 *  the failure that hid this one.
 *
 *  A path that already names the prefix is passed through untouched, so a test
 *  that wants to be explicit still can. */
function resolvePath(url: string): string {
  if (url.startsWith('/api/')) return url
  const [pathname] = url.split('?')
  if (ROOT_PATHS.has(pathname)) return url
  return `/api/v1${url}`
}

function createChain(app: FastifyInstance, method: HTTPMethods, url: string): RequestChain {
  const opts: InjectOptions = {
    method: method as InjectOptions['method'],
    url: resolvePath(url),
    headers: {},
  }

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

/** Gives every seeded identity a password, through the same service an
 *  administrator would use.
 *
 *  Deliberately not a direct `update users set password_hash`: routing it
 *  through `setPassword` means these suites sign in against the argon2
 *  parameters, password policy and audit trail the product actually runs,
 *  rather than a hash this file decided was good enough. It is the pattern
 *  `auth.test.ts` already uses for the same reason.
 *
 *  Idempotent in effect — it rewrites the same value on every setup — and
 *  scoped to the seed organization, so a second tenant's users stay
 *  password-less and the cross-tenant tests keep meaning something. */
async function grantDemoPasswords(): Promise<void> {
  const actor = systemPrincipal(SEED.orgId, SEED.systemUserId)
  const rows = await withAuthPlane(dbHandle.db, async (tx) =>
    tx.select({ id: users.id, orgId: users.orgId }).from(users),
  )
  for (const row of rows) {
    if (row.orgId !== SEED.orgId) continue
    await appInstance.auth.service.setPassword(actor, { userId: row.id }, TEST_PASSWORD, {})
  }
}

export async function setupDb(): Promise<void> {
  loadDotEnvFile()
  const envConfig = loadEnv()
  dbHandle = createDb(envConfig.DATABASE_URL)
  appInstance = await buildApp({ db: dbHandle.db, env: envConfig })
  await appInstance.ready()
  await grantDemoPasswords()
  apiInstance = createApi(appInstance)
}

export async function teardownDb(): Promise<void> {
  if (appInstance) await appInstance.close()
  if (dbHandle) await dbHandle.close()
}

export async function login(email: string, password = TEST_PASSWORD): Promise<string> {
  const res = await apiInstance.post('/api/v1/auth/login').send({ email, password })
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`)
  return (res.body as Record<string, unknown>).accessToken as string
}

export const EMAILS = {
  owner: 'owner@salisauto.sa',
  technician: 'tech@salisauto.sa',
  accountant: 'finance@salisauto.sa',
  advisor: 'advisor@salisauto.sa',
}
