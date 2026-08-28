/** Central configuration. Read once, validated, never logs secrets. */
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(1).default('dev-only-change-me'),
  ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(60 * 60 * 24 * 14),
  DEMO_PASSWORD: z.string().min(4).default('salis1234'),
  DATABASE_URL: z.string().optional(),
})

export const env = schema.parse(process.env)

/** Comma-separated CORS origins → array, `*` passes through. */
export const corsOrigins = env.CORS_ORIGIN === '*'
  ? '*'
  : env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)

/** True when a real Postgres URL is configured; false → zero-setup PGlite. */
export const usesPostgres = Boolean(env.DATABASE_URL)
