/** Data endpoints for the collections the frontend's endpoints.ts actually
 *  lists. Each is RBAC-gated by its permission module and returns rows in the
 *  exact contract shape (the surrogate `pk` is never selected).
 *
 *  List params follow API_ENDPOINTS.md:
 *    ?page&pageSize&sort=field:dir&q=text&filter[field]=value
 *  Responses are bare arrays — the shape the frontend's rowsOf() expects most
 *  endpoints to return today. */
import { Router, type Request } from 'express'
import { and, asc, desc, eq, ilike, or, type SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema.js'
import { requireAuth, requireModule, handler } from '../auth/middleware.js'
import { errors } from '../http.js'
import { escapeIlike } from '../security.js'

interface CollectionDef {
  /** Path relative to the API root, matching ENDPOINTS in the frontend. */
  path: string
  /** RBAC permission module gating the collection. */
  module: string
  table: any
  /** Contract keys returned to the client (excludes surrogate `pk`). */
  columns: string[]
  /** Text columns matched by the free-text `q` param. */
  searchable: string[]
  /** Natural id column for the optional detail route, when one exists. */
  idField?: string
}

const COLLECTIONS: CollectionDef[] = [
  { path: '/jobs', module: 'jobcards', table: schema.jobs, columns: ['id', 'cust', 'veh', 'svc', 'st', 'pr'], searchable: ['id', 'cust', 'veh'], idField: 'id' },
  { path: '/appointments', module: 'appointments', table: schema.appointments, columns: ['time', 'cust', 'veh', 'plate', 'svc', 'status', 'bay', 'tech', 'mins'], searchable: ['cust', 'veh', 'plate', 'tech'] },
  { path: '/estimates', module: 'estimates', table: schema.estimates, columns: ['id', 'cust', 'veh', 'amount', 'status'], searchable: ['id', 'cust', 'veh'], idField: 'id' },
  { path: '/invoices', module: 'invoices', table: schema.invoices, columns: ['id', 'cust', 'amount', 'due', 'status'], searchable: ['id', 'cust'], idField: 'id' },
  { path: '/receipts', module: 'payments', table: schema.receipts, columns: ['id', 'date', 'customer', 'invoice', 'method', 'amount', 'status'], searchable: ['id', 'customer', 'invoice'], idField: 'id' },
  { path: '/customers', module: 'customers', table: schema.customers, columns: ['name', 'phone', 'vehicles', 'spent', 'last'], searchable: ['name', 'phone'] },
  { path: '/vehicles', module: 'vehicles', table: schema.vehicles, columns: ['plate', 'make', 'owner', 'mileage', 'last', 'status'], searchable: ['plate', 'make', 'owner'] },
  { path: '/fleets', module: 'vehicles', table: schema.fleets, columns: ['name', 'vehicles', 'active', 'contract'], searchable: ['name'] },
  { path: '/inventory', module: 'inventory', table: schema.parts, columns: ['name', 'sku', 'stock', 'reorder', 'price'], searchable: ['name', 'sku'] },
  { path: '/technicians', module: 'technicians', table: schema.technicians, columns: ['name', 'specialty', 'jobs', 'rating'], searchable: ['name', 'specialty'] },
  { path: '/crm/leads', module: 'crm', table: schema.leads, columns: ['name', 'company', 'value', 'source', 'stage', 'date', 'score'], searchable: ['name', 'company'] },
  { path: '/crm/opportunities', module: 'crm', table: schema.opportunities, columns: ['name', 'company', 'value', 'stage', 'prob', 'close', 'owner'], searchable: ['name', 'company', 'owner'] },
  { path: '/crm/tasks', module: 'crm', table: schema.crmTasks, columns: ['title', 'assigned', 'due', 'priority', 'status', 'type'], searchable: ['title', 'assigned'] },
  { path: '/crm/segments', module: 'crm', table: schema.segments, columns: ['name', 'count', 'rules', 'lastUpdated'], searchable: ['name', 'rules'] },
  { path: '/crm/campaigns', module: 'crm', table: schema.campaigns, columns: ['name', 'type', 'status', 'reach', 'opens', 'clicks', 'conversions', 'budget', 'spent'], searchable: ['name'] },
  { path: '/accounting/coa', module: 'accounting', table: schema.chartOfAccounts, columns: ['code', 'name', 'type', 'balance', 'children'], searchable: ['code', 'name', 'type'], idField: 'code' },
  { path: '/accounting/journal-entries', module: 'accounting', table: schema.journalEntries, columns: ['id', 'date', 'ref', 'narration', 'debit', 'credit', 'status'], searchable: ['id', 'ref', 'narration'], idField: 'id' },
  { path: '/accounting/expenses', module: 'accounting', table: schema.expenses, columns: ['id', 'date', 'category', 'vendor', 'amount', 'status'], searchable: ['id', 'category', 'vendor'], idField: 'id' },
  { path: '/ai/agents', module: 'ai', table: schema.aiAgents, columns: ['name', 'role', 'model', 'status', 'tasks', 'success', 'icon'], searchable: ['name', 'role', 'model'] },
  { path: '/ai/conversations', module: 'ai', table: schema.conversations, columns: ['title', 'user', 'msgs', 'date', 'tokens'], searchable: ['title', 'user'] },
  { path: '/kb/procedures', module: 'ai', table: schema.kbProcedures, columns: ['id', 'title', 'ar', 'cat', 'make', 'mins', 'torque', 'ar_torque', 'steps', 'views', 'tsb', 'media'], searchable: ['id', 'title', 'cat', 'make'], idField: 'id' },
]

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  sort: z.string().regex(/^[a-zA-Z_]+:(asc|desc)$/).optional(),
  q: z.string().max(200).optional(),
  filter: z.record(z.string(), z.string()).optional(),
})

function selectMap(def: CollectionDef): Record<string, PgColumn> {
  return Object.fromEntries(def.columns.map((c) => [c, def.table[c] as PgColumn]))
}

function buildWhere(def: CollectionDef, q: string | undefined, filter: Record<string, string> | undefined): SQL | undefined {
  const clauses: SQL[] = []
  if (q && def.searchable.length > 0) {
    const like = def.searchable.map((c) => ilike(def.table[c], `%${escapeIlike(q)}%`))
    const search = like.length === 1 ? like[0] : or(...like)
    if (search) clauses.push(search)
  }
  for (const [key, value] of Object.entries(filter ?? {})) {
    if (!def.columns.includes(key)) {
      throw errors.validation(`Unknown filter field "${key}"`, key)
    }
    clauses.push(eq(def.table[key], value))
  }
  if (clauses.length === 0) return undefined
  return clauses.length === 1 ? clauses[0] : and(...clauses)
}

export function collectionsRouter(): Router {
  const router = Router()

  for (const def of COLLECTIONS) {
    // ── List ──
    router.get(
      def.path,
      requireAuth,
      requireModule(def.module, 'v'),
      handler(async (req: Request, res) => {
        const parsed = listQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          const first = parsed.error.issues[0]
          throw errors.validation(first.message, String(first.path[0] ?? ''))
        }
        const { page, pageSize, sort, q, filter } = parsed.data
        const db = getDb()

        let query: any = db.select(selectMap(def)).from(def.table)
        const where = buildWhere(def, q, filter)
        if (where) query = query.where(where)

        if (sort) {
          const [field, dir] = sort.split(':')
          if (!def.columns.includes(field)) {
            throw errors.validation(`Cannot sort by "${field}"`, 'sort')
          }
          query = query.orderBy(dir === 'desc' ? desc(def.table[field]) : asc(def.table[field]))
        }

        query = query.limit(pageSize).offset((page - 1) * pageSize)
        res.json(await query)
      }),
    )

    // ── Detail (only where a natural id exists) ──
    if (def.idField) {
      const idField = def.idField
      router.get(
        `${def.path}/:id`,
        requireAuth,
        requireModule(def.module, 'v'),
        handler(async (req: Request, res) => {
          const db = getDb()
          const rows = await db
            .select(selectMap(def))
            .from(def.table)
            .where(eq(def.table[idField], req.params.id))
            .limit(1)
          if (rows.length === 0) throw errors.notFound(`No record with ${idField}=${req.params.id}`)
          res.json(rows[0])
        }),
      )
    }
  }

  return router
}

export const collectionPaths = COLLECTIONS.map((c) => c.path)
