/** Configuration, validated once at boot.
 *
 *  Every secret comes from the environment. There is no default literal for
 *  one: a missing `JWT_SECRET` stops the process here rather than letting the
 *  API run on a value an attacker can read in the repository. */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Reads `server/.env` into `process.env` without overwriting anything already
 *  set, so a real deployment's environment always wins over a developer's file.
 *  The file itself is git-ignored; only `.env.example` is committed. */
export function loadDotEnvFile(file = resolve(ROOT, '.env')): void {
  let contents: string
  try {
    contents = readFileSync(file, 'utf8')
  } catch {
    return
  }
  for (const line of contents.split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!match?.[1]) continue
    if (process.env[match[1]] !== undefined) continue
    process.env[match[1]] = (match[2] ?? '').replace(/^["']|["']$/g, '')
  }
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_ADMIN_URL: z.string().optional(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

  JWT_SECRET: z.string().optional(),
  JWT_ISSUER: z.string().default('salis-auto'),
  JWT_AUDIENCE: z.string().default('salis-auto-api'),

  CORS_ORIGINS: z.string().default(''),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(300),

  /** The organization a public, unauthenticated marketing lead lands in
   *  (F-025). The caller never chooses an org; every public lead is written to
   *  exactly this one, so a public POST can never escalate into another
   *  tenant. Defaults to the primary demo org so the endpoint works out of the
   *  box in development and test; a real deployment sets this to its marketing
   *  organization's id. */
  PUBLIC_LEAD_ORG_ID: z.string().default('01JAAAAAAAAAAAAAAAAAAAAAA1'),
  /** Tight per-IP ceiling for the public lead form, independent of the
   *  authenticated API's budget. A contact form does not get 300 requests a
   *  minute from one address without being abuse. */
  PUBLIC_LEAD_RATE_LIMIT: z.coerce.number().int().min(1).default(5),

  /** The ZATCA VAT rate, in basis points, as the tax-return endpoint reports it
   *  (§A37). Configuration, not a literal in a handler: a Saudi rate change is a
   *  deployment setting, and the figure the return endpoint echoes always names
   *  the rate it was computed under. Defaults to the contract's standard rate
   *  (1500 bps = 15%), the same constant `computeInvoiceTotals` charges at. */
  VAT_RATE_BPS: z.coerce.number().int().min(0).max(10_000).default(1500),
})

export type Env = z.infer<typeof schema> & { corsOrigins: string[] }

let cached: Env | null = null

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (source === process.env) loadDotEnvFile()
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment: ${detail}`)
  }
  const value = parsed.data
  if (value.NODE_ENV === 'production' && !value.JWT_SECRET) {
    throw new Error('JWT_SECRET is required outside development')
  }
  return {
    ...value,
    corsOrigins: value.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  }
}

export function env(): Env {
  cached ??= loadEnv()
  return cached
}

/** Test helper — lets a suite build an app against an ephemeral database. */
export function setEnv(value: Env): void {
  cached = value
}
