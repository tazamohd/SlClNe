import supertest from 'supertest'
import { createApp } from '../src/app.js'
import { initDb, closeDb } from '../src/db/index.js'
import { seed } from '../src/db/seed.js'

export const app = createApp()
export const api = supertest(app)

export async function setupDb(): Promise<void> {
  const db = await initDb()
  await seed(db)
}

export async function teardownDb(): Promise<void> {
  await closeDb()
}

/** Logs in a seeded role account and returns its access token. */
export async function login(email: string, password = 'salis1234'): Promise<string> {
  const res = await api.post('/auth/login').send({ email, password })
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`)
  return res.body.accessToken as string
}

export const EMAILS = {
  owner: 'owner@salisauto.sa',
  technician: 'tech@salisauto.sa',
  accountant: 'finance@salisauto.sa',
  advisor: 'advisor@salisauto.sa',
}
