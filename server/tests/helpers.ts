import { buildApp } from '../src/app.js'
import { createDb, type DbHandle } from '../src/db/client.js'
import { loadDotEnvFile, loadEnv } from '../src/env.js'
import type { FastifyInstance, InjectOptions, HTTPMethods } from 'fastify'

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
  loadDotEnvFile()
  const envConfig = loadEnv()
  dbHandle = createDb(envConfig.DATABASE_URL)
  appInstance = await buildApp({ db: dbHandle.db, env: envConfig })
  await appInstance.ready()
  apiInstance = createApi(appInstance)
}

export async function teardownDb(): Promise<void> {
  if (appInstance) await appInstance.close()
  if (dbHandle) await dbHandle.close()
}

export async function login(email: string, password = 'salis1234'): Promise<string> {
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
