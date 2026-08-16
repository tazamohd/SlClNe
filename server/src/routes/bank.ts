/** The one bank-reconciliation write: matching a statement line to a book entry.
 *
 *  The `bankStatements` collection is read-only through the generic router
 *  (registry.ts). Reconciling a line is the only mutation, and it lives here
 *  because it is more than a column write: it must be idempotent, so that a
 *  reconciliation replayed after a dropped response does not toggle a line back
 *  off or double-audit it. Gated on `accounting:e` — the edit grant on the
 *  module BankReconciliation declares — which the accountant holds.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { bankStatementMatch } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { bankStatements } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function statementDef() {
  const def = collectionByKey('bankStatements')
  if (!def) throw new Error('collection "bankStatements" is not registered')
  return def
}

export function registerBankRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/bank-statements/:id/match', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'e')

    const parsed = bankStatementMatch.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid match.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    const result = await withTenant(deps.db, principal, async (tx) => {
      /* Lock the line for the transaction so two concurrent matches cannot both
       * pass the "not yet matched" check. */
      const line = await loadStatement(tx, id, { forUpdate: true })

      /* Idempotent: a line already reconciled returns as-is rather than being
       * re-stamped or 409-ing. A replay is a no-op, so a retried request after a
       * dropped response settles to the same state. */
      if (line.matched) {
        return {
          status: 200,
          body: presentRow(statementDef(), principal, line as Record<string, unknown>),
        }
      }

      const [updated] = await tx
        .update(bankStatements)
        .set({
          matched: true,
          matchedReceiptId: parsed.data.receiptId ?? null,
          matchedAt: sql`now()`,
          updatedBy: principal.userId,
        })
        .where(and(eq(bankStatements.id, line.id), eq(bankStatements.version, line.version)))
        .returning()
      if (!updated) throw notFound('Bank statement line')

      await writeAudit(tx, {
        actor: principal,
        action: 'transition',
        entity: 'bank_statement',
        entityId: line.id,
        before: { matched: line.matched, matchedReceiptId: line.matchedReceiptId },
        after: { matched: true, matchedReceiptId: updated.matchedReceiptId },
        reason: 'reconciled to book entry',
        ...metaOf(request),
      })

      return {
        status: 200,
        body: presentRow(statementDef(), principal, updated as Record<string, unknown>),
      }
    })

    reply.code(result.status)
    return result.body
  })
}

type StatementRow = typeof bankStatements.$inferSelect

async function loadStatement(
  tx: Tx,
  id: string,
  options: { forUpdate?: boolean } = {},
): Promise<StatementRow> {
  const base = tx
    .select()
    .from(bankStatements)
    .where(and(eq(bankStatements.id, id), isNull(bankStatements.deletedAt)))
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Bank statement line')
  return row
}
