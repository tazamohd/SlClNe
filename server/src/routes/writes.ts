/** The WRITE half of the REST contract (API_ENDPOINTS.md): POST/PATCH/DELETE
 *  plus the state actions the built screens use.
 *
 *  Every write reuses the same CollectionDef registry the read side (collections.ts)
 *  is built from, so a resource's columns, RBAC module and served shape stay in
 *  one place. Writes are RBAC-gated by ACTION — create→'c', update→'e',
 *  delete→'x', a state transition→'e' — mirroring how the reads gate on 'v'.
 *
 *  Bodies are Zod-validated against the table's own column types; a bad body is
 *  422 `{error:{code,message,field}}`. The created/updated row is returned in
 *  the exact contract shape (surrogate `pk` never selected), and a DELETE that
 *  hit nothing (or a PATCH/transition on a missing id) is 404. */
import { Router, type Request } from 'express'
import { eq } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'
import { requireAuth, requireModule, handler } from '../auth/middleware.js'
import { AppError, errors } from '../http.js'
import { COLLECTIONS, selectMap, type CollectionDef } from './collections.js'

/** A collection's write id column: its natural id when one exists, else the
 *  surrogate `pk`. The pk is addressable in the URL but still never returned. */
function idColumn(def: CollectionDef): string {
  return def.idField ?? 'pk'
}

/** Resolves the `:id` URL param to the value used in the WHERE clause, coercing
 *  the surrogate pk to an integer. A non-integer pk param can never match a
 *  real row, so it is a 404 rather than a 422. */
function idValue(def: CollectionDef, raw: string): string | number {
  if (def.idField) return raw
  const n = Number(raw)
  if (!Number.isInteger(n)) throw errors.notFound(`No record with id=${raw}`)
  return n
}

/** Zod validator for one column, keyed off the Drizzle column's data type. */
function fieldSchema(col: PgColumn): z.ZodTypeAny {
  switch (col.dataType) {
    case 'number':
      return z.number().int()
    case 'boolean':
      return z.boolean()
    default:
      return z.string()
  }
}

/** Body schema for a create: every contract column required, unknown keys
 *  rejected (`.strict()`) so a typo is a loud 422 not a silently-dropped field. */
function createSchema(def: CollectionDef): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {}
  for (const c of def.columns) shape[c] = fieldSchema(def.table[c] as PgColumn)
  return z.object(shape).strict()
}

/** Body schema for a partial update: same fields, all optional, but at least
 *  one must be present and unknown keys are still rejected. */
function updateSchema(def: CollectionDef): z.ZodType {
  return createSchema(def)
    .partial()
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' })
}

/** Raises the contract's 422 from the first Zod issue, naming the field. */
function raiseValidation(error: z.ZodError): never {
  const first = error.issues[0]
  throw errors.validation(first.message, String(first.path[0] ?? ''))
}

// ── Job state machine ────────────────────────────────────────────────────────
// States mirror STAGE_BY_STATUS in the frontend's JobCardDetail. A transition
// must name a real target state (else 422) and be reachable from the current
// one (else 409) — the server is the authority, never the client.
const JOB_STATES = ['pending', 'assigned', 'in_progress', 'completed', 'delivered', 'cancelled'] as const
const JOB_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['assigned', 'in_progress', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['delivered'],
  delivered: [],
  cancelled: [],
}
const transitionSchema = z.object({ to: z.string().min(1) }).strict()

export function writesRouter(): Router {
  const router = Router()

  for (const def of COLLECTIONS) {
    if (!def.writable) continue
    const col = idColumn(def)

    // ── Create ──
    router.post(
      def.path,
      requireAuth,
      requireModule(def.module, 'c'),
      handler(async (req: Request, res) => {
        const parsed = createSchema(def).safeParse(req.body)
        if (!parsed.success) raiseValidation(parsed.error)
        const db = getDb() as any
        const [row] = await db.insert(def.table).values(parsed.data).returning(selectMap(def))
        res.status(201).json(row)
      }),
    )

    // ── Update (partial) ──
    router.patch(
      `${def.path}/:id`,
      requireAuth,
      requireModule(def.module, 'e'),
      handler(async (req: Request, res) => {
        const parsed = updateSchema(def).safeParse(req.body)
        if (!parsed.success) raiseValidation(parsed.error)
        const db = getDb() as any
        const rows = await db
          .update(def.table)
          .set(parsed.data as Record<string, unknown>)
          .where(eq(def.table[col], idValue(def, req.params.id)))
          .returning(selectMap(def))
        if (rows.length === 0) throw errors.notFound(`No record with id=${req.params.id}`)
        res.json(rows[0])
      }),
    )

    // ── Delete ──
    router.delete(
      `${def.path}/:id`,
      requireAuth,
      requireModule(def.module, 'x'),
      handler(async (req: Request, res) => {
        const db = getDb() as any
        const rows = await db
          .delete(def.table)
          .where(eq(def.table[col], idValue(def, req.params.id)))
          .returning({ pk: def.table.pk })
        if (rows.length === 0) throw errors.notFound(`No record with id=${req.params.id}`)
        res.status(204).end()
      }),
    )
  }

  // ── State action: job transition (POST /jobs/:id/transition) ──
  router.post(
    '/jobs/:id/transition',
    requireAuth,
    requireModule('jobcards', 'e'),
    handler(async (req: Request, res) => {
      const parsed = transitionSchema.safeParse(req.body)
      if (!parsed.success) raiseValidation(parsed.error)
      const to = parsed.data.to
      if (!JOB_STATES.includes(to as (typeof JOB_STATES)[number])) {
        throw errors.validation(`Unknown job state "${to}"`, 'to')
      }
      const db = getDb() as any
      const [job] = await db
        .select(selectMap(COLLECTIONS.find((c) => c.path === '/jobs')!))
        .from(schema.jobs)
        .where(eq(schema.jobs.id, req.params.id))
        .limit(1)
      if (!job) throw errors.notFound(`No job with id=${req.params.id}`)

      const allowed = JOB_TRANSITIONS[job.st as string] ?? []
      if (!allowed.includes(to)) {
        throw new AppError(409, 'invalid_transition', `A job in "${job.st}" cannot move to "${to}"`, 'to')
      }
      const [updated] = await db
        .update(schema.jobs)
        .set({ st: to })
        .where(eq(schema.jobs.id, req.params.id))
        .returning(selectMap(COLLECTIONS.find((c) => c.path === '/jobs')!))
      res.json(updated)
    }),
  )

  // ── State action: issue an invoice (POST /invoices/:id/issue) ──
  // Locks the invoice by moving it to `issued`. ZATCA QR generation is a
  // documented follow-up; the state lock is the part the built screens need.
  router.post(
    '/invoices/:id/issue',
    requireAuth,
    requireModule('invoices', 'e'),
    handler(async (req: Request, res) => {
      const db = getDb() as any
      const invoiceDef = COLLECTIONS.find((c) => c.path === '/invoices')!
      const [invoice] = await db
        .update(schema.invoices)
        .set({ status: 'issued' })
        .where(eq(schema.invoices.id, req.params.id))
        .returning(selectMap(invoiceDef))
      if (!invoice) throw errors.notFound(`No invoice with id=${req.params.id}`)
      res.json(invoice)
    }),
  )

  return router
}
