/** The request's tenant context, pushed into PostgreSQL.
 *
 *  Every query runs inside a transaction that has first executed
 *  `SET LOCAL app.org_id = …`. The RLS policies in `drizzle/0001_rls.sql` read
 *  those settings, so a handler that forgets a `WHERE org_id = …` still cannot
 *  see another tenant's rows — and a handler that *adds* one is writing a
 *  second, redundant defence rather than the only one.
 */
import { sql } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { DataScope, RoleId } from '@salis/contract'
import type { Database } from './client'

export interface Principal {
  userId: string
  orgId: string
  branchId: string | null
  role: RoleId
  scope: DataScope
  /** The `customers` row this principal *is*, for a portal login.
   *
   *  Only the `self` scope reads it, and it is the only thing that scope
   *  narrows by: `drizzle/0014`'s `r_self` policies compare `customer_id`
   *  against `app_customer()`. Null for staff, and null for a self-scoped
   *  account with no link — which sees nothing rather than everything, because
   *  NULL matches no row. */
  customerId?: string | null
  /** Display name, used for audit readability only. */
  name?: string
}

/** A transaction with the tenant context already applied. */
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0] extends PgTransaction<
  infer TQ,
  infer TS,
  infer TR
>
  ? PgTransaction<TQ, TS, TR>
  : never

export async function applyTenantContext(tx: Tx, principal: Principal): Promise<void> {
  await tx.execute(sql`
    select
      set_config('app.org_id',    ${principal.orgId},          true),
      set_config('app.branch_id', ${principal.branchId ?? ''}, true),
      set_config('app.user_id',   ${principal.userId},         true),
      set_config('app.scope',     ${principal.scope},          true),
      set_config('app.customer_id', ${principal.customerId ?? ''}, true)
  `)
}

/** Runs `fn` in a transaction scoped to `principal`.
 *
 *  Everything a request touches happens here: the isolation and the atomicity
 *  are the same boundary, so a mutation and the audit row that records it
 *  either both land or neither does. */
export async function withTenant<T>(
  db: Database,
  principal: Principal,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyTenantContext(tx as Tx, principal)
    return fn(tx as Tx)
  })
}

/** The migration and seed paths need a context too — RLS is FORCE-d, so even
 *  the table owner is subject to it. */
export function systemPrincipal(orgId: string, userId: string): Principal {
  return { userId, orgId, branchId: null, role: 'owner', scope: 'all', name: 'system' }
}
