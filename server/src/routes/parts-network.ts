/** Parts Network — accepting a quotation (BLK-004).
 *
 *  The one thing in this domain the generic collection router cannot do, for
 *  the same reason `canned-jobs.ts` and procurement's approvals do not go
 *  through it either: accepting a quotation is not a field write, it is four
 *  writes that have to happen together or not at all.
 *
 *  - the accepted quotation moves `pending` → `accepted`,
 *  - **every other pending quotation on the same request is rejected**, because
 *    a request is sourced once,
 *  - the request moves to `ordered`,
 *  - and the order is created, with its total computed from the quotation's
 *    unit price.
 *
 *  All four run inside one `withTenant` transaction together with the audit
 *  write, so a failure anywhere leaves no half-accepted request behind and the
 *  audit log never records an acceptance that did not happen. A plain `PATCH`
 *  could set `status: 'accepted'` and leave the siblings pending, the request
 *  `quoted` and no order anywhere, which is why the contract's
 *  `partsNetworkQuotationUpdate` omits `accepted` from the statuses it accepts.
 *
 *  Gated on `network:a` — placing an order against a quotation commits money,
 *  so it takes approval authority on the module, not merely the `e` that edits
 *  a row. Under the enforced matrix that is `owner`, `procurement` and `test`:
 *  `manager` and `parts` may maintain the directory and send requests but not
 *  commit the order, `supplier` may quote but not accept, and `technician`
 *  holds nothing on `network` at all.
 *
 *  Nothing here crosses the tenant boundary. Every row read or written is
 *  reached through `withTenant`, so RLS confines all of it to the caller's own
 *  organization; a quotation id from another tenant is a 404, not a 403.
 */
import { and, eq, isNull, ne } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { acceptQuotationBody } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { partsNetworkOrders, partsNetworkQuotations, partsNetworkRequests } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function def(key: 'partsNetworkQuotations' | 'partsNetworkOrders') {
  const found = collectionByKey(key)
  if (!found) throw new Error(`collection "${key}" is not registered`)
  return found
}

/** Either the ULID or the human `NQT-0001` code the design shows, the same
 *  thing every detail route in this product accepts. */
async function loadQuotation(tx: Tx, ref: string) {
  const [row] = await tx
    .select()
    .from(partsNetworkQuotations)
    .where(
      and(
        isNull(partsNetworkQuotations.deletedAt),
        ref.length === 26 ? eq(partsNetworkQuotations.id, ref) : eq(partsNetworkQuotations.code, ref),
      ),
    )
    .limit(1)
  if (!row) throw notFound('Quotation')
  return row
}

/** The next `NOR-0001` within the tenant, counted the same way
 *  `writers.ts` counts every other parts-network code. */
async function nextOrderCode(tx: Tx): Promise<string> {
  const rows = await tx.select({ id: partsNetworkOrders.id }).from(partsNetworkOrders)
  return `NOR-${String(rows.length + 1).padStart(4, '0')}`
}

export function registerPartsNetworkRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/parts-network/quotations/:id/accept', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'network', 'a')
    const parsed = acceptQuotationBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid acceptance.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    const result = await withTenant(deps.db, principal, async (tx) => {
      const quotation = await loadQuotation(tx, id)
      if (quotation.status !== 'pending') {
        throw ruleViolated(`Quotation ${quotation.code} is ${quotation.status} and cannot be accepted.`)
      }

      const [req] = await tx
        .select()
        .from(partsNetworkRequests)
        .where(
          and(eq(partsNetworkRequests.id, quotation.requestId), isNull(partsNetworkRequests.deletedAt)),
        )
        .limit(1)
      if (!req) throw notFound('Network request')
      if (req.status === 'ordered' || req.status === 'closed' || req.status === 'cancelled') {
        throw ruleViolated(`Request ${req.code} is ${req.status} and is no longer being sourced.`)
      }

      /* Default to what the request asked for; a caller may order fewer, never
       * more than the quoting member said they have. The quantity is the only
       * number this route takes — the price comes from the quotation and the
       * total is computed, so an accepted order cannot be cheaper than quoted. */
      const qty = parsed.data.qty ?? req.qty
      if (qty > quotation.qtyAvailable) {
        throw ruleViolated(
          `${quotation.memberName} quoted ${quotation.qtyAvailable} available; ${qty} cannot be ordered.`,
          'qty',
        )
      }
      const now = new Date()

      const [accepted] = await tx
        .update(partsNetworkQuotations)
        .set({ status: 'accepted', acceptedAt: now, rejectedAt: null, updatedBy: principal.userId })
        .where(eq(partsNetworkQuotations.id, quotation.id))
        .returning()
      if (!accepted) throw notFound('Quotation')

      /* A request is sourced once: every other quotation still pending on it is
       * rejected in the same transaction, so two members can never both hold an
       * accepted quote for one request. */
      const rejected = await tx
        .update(partsNetworkQuotations)
        .set({ status: 'rejected', rejectedAt: now, updatedBy: principal.userId })
        .where(
          and(
            eq(partsNetworkQuotations.requestId, req.id),
            ne(partsNetworkQuotations.id, quotation.id),
            eq(partsNetworkQuotations.status, 'pending'),
            isNull(partsNetworkQuotations.deletedAt),
          ),
        )
        .returning({ id: partsNetworkQuotations.id, code: partsNetworkQuotations.code })

      await tx
        .update(partsNetworkRequests)
        .set({ status: 'ordered', orderedAt: now, updatedBy: principal.userId })
        .where(eq(partsNetworkRequests.id, req.id))

      const orderId = ulid()
      const [order] = await tx
        .insert(partsNetworkOrders)
        .values({
          id: orderId,
          orgId: principal.orgId,
          branchId: req.branchId,
          code: await nextOrderCode(tx),
          requestId: req.id,
          quotationId: quotation.id,
          memberId: quotation.memberId,
          memberName: quotation.memberName,
          /* An `outgoing` request this workshop raised becomes an order it
           * placed; an `incoming` one it answered becomes an order it fulfils. */
          direction: req.direction === 'incoming' ? 'inbound' : 'outbound',
          partName: req.partName,
          qty,
          unitPriceHalalas: quotation.unitPriceHalalas,
          totalHalalas: qty * quotation.unitPriceHalalas,
          status: 'placed',
          expectedAt: parsed.data.expectedAt ?? null,
          notes: parsed.data.notes ?? null,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()
      if (!order) throw notFound('Network order')

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'parts_network_quotation',
        entityId: quotation.id,
        before: quotation as Record<string, unknown>,
        after: {
          ...(accepted as Record<string, unknown>),
          /* What else this acceptance moved, so the log carries the whole
           * transaction rather than only the row that names it. */
          rejectedQuotations: rejected.map((r) => r.code),
          orderCode: (order as Record<string, unknown>).code,
          requestCode: req.code,
        },
        ...metaOf(request),
      })

      return {
        quotation: presentRow(def('partsNetworkQuotations'), principal, accepted as Record<string, unknown>),
        order: presentRow(def('partsNetworkOrders'), principal, order as Record<string, unknown>),
        rejectedQuotationCodes: rejected.map((r) => r.code),
      }
    })

    reply.code(201)
    return result
  })
}
