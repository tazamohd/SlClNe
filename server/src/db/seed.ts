/** Seeds the DB from the exact design-bundle fixtures the frontend renders
 *  (copied verbatim into seed-data.ts from app/src/data/generated/tables.ts),
 *  plus one login account per role. Idempotent: skips a table that already has
 *  rows, so repeated `npm run dev` starts don't duplicate data. */
import { sql } from 'drizzle-orm'
import type { Db } from './index.js'
import * as schema from './schema.js'
import { ROLES } from '../auth/rbac.js'
import { hashPassword } from '../auth/jwt.js'
import { env } from '../env.js'
import * as T from './seed-data.js'

async function isEmpty(db: Db, table: any): Promise<boolean> {
  const rows = await db.select({ n: sql<number>`count(*)` }).from(table)
  return Number(rows[0]?.n ?? 0) === 0
}

async function seedTable(db: Db, table: any, rows: readonly any[]): Promise<void> {
  if (rows.length === 0) return
  if (!(await isEmpty(db, table))) return
  await db.insert(table).values(rows as any[])
}

export async function seed(db: Db): Promise<void> {
  // Login accounts — one per role, sharing the demo password (dev convenience).
  if (await isEmpty(db, schema.users)) {
    const roles = ROLES as unknown as ReadonlyArray<{
      id: string
      scope: string
      demo: { name: string; ar: string; email: string }
    }>
    const passwordHash = hashPassword(env.DEMO_PASSWORD)
    await db.insert(schema.users).values(
      roles.map((r) => ({
        id: `user-${r.id}`,
        email: r.demo.email,
        passwordHash,
        role: r.id,
        name: r.demo.name,
        ar: r.demo.ar,
        scope: r.scope,
      })),
    )
  }

  await seedTable(db, schema.jobs, T.JOBS)
  await seedTable(db, schema.appointments, T.APPOINTMENTS)
  await seedTable(db, schema.estimates, T.ESTIMATES)
  await seedTable(db, schema.invoices, T.INVOICES)
  await seedTable(db, schema.receipts, T.RECEIPTS)
  await seedTable(db, schema.customers, T.CUSTOMERS)
  await seedTable(db, schema.vehicles, T.VEHICLES)
  await seedTable(db, schema.fleets, T.FLEETS)
  await seedTable(db, schema.parts, T.PARTS)
  await seedTable(db, schema.technicians, T.TECHS)
  await seedTable(db, schema.leads, T.LEADS)
  await seedTable(db, schema.opportunities, T.OPPORTUNITIES)
  await seedTable(db, schema.crmTasks, T.CRM_TASKS)
  await seedTable(db, schema.segments, T.SEGMENTS)
  await seedTable(db, schema.campaigns, T.CAMPAIGNS)
  await seedTable(db, schema.chartOfAccounts, T.ACCOUNTS_COA)
  await seedTable(db, schema.journalEntries, T.JOURNAL_ENTRIES)
  await seedTable(db, schema.expenses, T.EXPENSES_DATA)
  await seedTable(db, schema.aiAgents, T.AI_AGENTS)
  await seedTable(db, schema.conversations, T.CONVERSATIONS)
  await seedTable(db, schema.kbProcedures, T.KB_PROCEDURES)
}
