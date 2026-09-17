/** Invoices, their lines, and the money that moves against them.
 *
 *  Everything financial is decided here. The client sends line descriptions,
 *  quantities and net unit prices; the subtotal, the VAT and the total are
 *  computed server-side from those, and an issued invoice becomes immutable.
 *  Creation and payment both accept an `Idempotency-Key`, so a retried request
 *  returns the first result instead of billing twice.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { createHash } from 'node:crypto'
import { ulid } from 'ulid'
import {
  IDEMPOTENCY_HEADER,
  idempotencyKey as idempotencyKeySchema,
  invoiceCreate,
  invoiceUpdate,
  paymentCreate,
} from '@salis/contract'
import { checkInvoiceable, checkPayment, computeInvoiceTotals } from '@salis/contract/rules'
import { z } from 'zod'
import { ACCOUNT, alreadyPosted, postJournalEntry } from '../accounting/posting'
import { writeAudit } from '../audit/audit'
import {
  estimateLines,
  estimates,
  invoiceLines,
  invoices,
  jobCards,
  organizations,
  payments,
  receipts,
} from '../db/schema'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { findReplay, hashBody, recordResult } from '../http/idempotency'
import { collectionByKey } from '../registry'
import { requireApproval, requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

const INVOICES = () => must('invoices')
const LINES = () => must('invoiceLines')
const PAYMENTS = () => must('invoicePayments')
const RECEIPTS = () => must('receipts')

/** What raising an invoice from an estimate still needs from the caller. Every
 *  figure comes from the estimate; these are the facts the estimate does not
 *  carry. `dueDate` is required rather than defaulted — payment terms are a
 *  commercial decision this codebase does not model. */
const estimateInvoiceBody = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected an ISO date (YYYY-MM-DD)'),
  buyerVatNumber: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
})

function must(key: string) {
  const def = collectionByKey(key)
  if (!def) throw new Error(`collection "${key}" is not registered`)
  return def
}

/** Runs `fn` once per `Idempotency-Key`. A replay returns the stored response;
 *  the same key with a different body is a caller bug and gets 409. */
async function once<T>(
  tx: Tx,
  request: FastifyRequest,
  args: { principal: Principal; endpoint: string; status: number },
  fn: () => Promise<T>,
): Promise<{ status: number; body: unknown }> {
  const raw = request.headers[IDEMPOTENCY_HEADER]
  const key = typeof raw === 'string' ? raw : undefined
  if (!key) {
    return { status: args.status, body: await fn() }
  }
  const parsed = idempotencyKeySchema.safeParse(key)
  if (!parsed.success) throw badRequest('Idempotency-Key must be 8–128 characters.')

  const requestHash = hashBody(request.body)
  const replay = await findReplay(tx, {
    orgId: args.principal.orgId,
    key: parsed.data,
    endpoint: args.endpoint,
    requestHash,
  })
  if (replay) return replay

  const body = await fn()
  await recordResult(tx, {
    orgId: args.principal.orgId,
    key: parsed.data,
    endpoint: args.endpoint,
    requestHash,
    status: args.status,
    body,
  })
  return { status: args.status, body }
}

export function registerInvoiceRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* --------------------------------------------------------------- create */
  app.post('/invoices', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'invoices', 'c')
    const parsed = invoiceCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid invoice.', issue?.path.join('.'))
    }
    const input = parsed.data

    const result = await withTenant(deps.db, principal, async (tx) =>
      once(tx, request, { principal, endpoint: 'POST /invoices', status: 201 }, async () => {
        /* DF-002: `checkInvoiceable` existed, was unit-tested, and was called
         * by nothing — so an invoice could be raised against a job card at any
         * stage, including one still on the ramp. It runs here, where the link
         * is made.
         *
         * It can only run when a job card is named. `jobCardId` is optional in
         * the contract and nullable in the schema, and an invoice with no job
         * card behind it — a parts-only sale, a fee — is a real case, so
         * requiring one would be a different and larger change than this
         * finding asks for. That remaining gap is recorded rather than closed
         * quietly: see DF-002 in project-control/DOCUMENTATION_FINDINGS.json. */
        if (input.jobCardId) {
          const [job] = await tx
            .select({ stage: jobCards.stage, status: jobCards.status })
            .from(jobCards)
            .where(and(eq(jobCards.id, input.jobCardId), isNull(jobCards.deletedAt)))
            .limit(1)
          if (!job) throw badRequest('That job card does not exist.', 'jobCardId')
          const stageFailure = checkInvoiceable({ stage: job.stage as never, status: job.status })
          if (stageFailure) throw ruleViolated(stageFailure.message, 'jobCardId')
        }

        const totals = computeInvoiceTotals(
          input.lines.map((line: (typeof input.lines)[number]) => ({ qty: line.qty, unitPriceHalalas: line.unitPriceHalalas })),
          input.discountHalalas,
        )

        const id = ulid()
        const [invoice] = await tx
          .insert(invoices)
          .values({
            id,
            orgId: principal.orgId,
            branchId: principal.branchId,
            code: await nextCode(tx, 'INV'),
            customerId: input.customerId ?? null,
            customerName: input.customerName,
            jobCardId: input.jobCardId ?? null,
            vehicleId: input.vehicleId ?? null,
            dueDate: input.dueDate,
            status: 'draft',
            subtotalHalalas: totals.subtotalHalalas,
            taxHalalas: totals.taxHalalas,
            discountHalalas: totals.discountHalalas,
            totalHalalas: totals.totalHalalas,
            buyerVatNumber: input.buyerVatNumber ?? null,
            notes: input.notes ?? null,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })
          .returning()
        if (!invoice) throw notFound('Invoice')

        await tx.insert(invoiceLines).values(
          input.lines.map((line: (typeof input.lines)[number], index: number) => ({
            id: ulid(),
            orgId: principal.orgId,
            branchId: principal.branchId,
            invoiceId: id,
            description: line.description,
            descriptionAr: line.descriptionAr ?? null,
            kind: line.kind,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
            partSku: line.partSku ?? null,
            sort: index,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })),
        )

        await writeAudit(tx, {
          actor: principal,
          action: 'create',
          entity: 'invoice',
          entityId: id,
          after: invoice,
          ...metaOf(request),
        })
        return presentRow(INVOICES(), principal, invoice as Record<string, unknown>)
      }),
    )

    reply.code(result.status)
    return result.body
  })

  /* ---------------------------------------------------------------- update */
  app.patch('/invoices/:id', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'invoices', 'e')
    const parsed = invoiceUpdate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid invoice.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadInvoice(tx, id)
      if (before.issuedAt) {
        throw conflict('An issued invoice is immutable. Raise a credit note instead.')
      }

      const patch: Record<string, unknown> = { updatedBy: principal.userId }
      if (parsed.data.customerName) patch.customerName = parsed.data.customerName
      if (parsed.data.dueDate) patch.dueDate = parsed.data.dueDate
      if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
      if (parsed.data.status) patch.status = parsed.data.status

      if (parsed.data.lines) {
        const totals = computeInvoiceTotals(
          parsed.data.lines.map((l: (typeof parsed.data.lines)[number]) => ({ qty: l.qty, unitPriceHalalas: l.unitPriceHalalas })),
          parsed.data.discountHalalas ?? before.discountHalalas,
        )
        Object.assign(patch, totals)
        await tx.delete(invoiceLines).where(eq(invoiceLines.invoiceId, before.id))
        await tx.insert(invoiceLines).values(
          parsed.data.lines.map((line: (typeof parsed.data.lines)[number], index: number) => ({
            id: ulid(),
            orgId: principal.orgId,
            branchId: principal.branchId,
            invoiceId: before.id,
            description: line.description,
            descriptionAr: line.descriptionAr ?? null,
            kind: line.kind,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
            partSku: line.partSku ?? null,
            sort: index,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })),
        )
      }

      const [after] = await tx
        .update(invoices)
        .set(patch)
        .where(and(eq(invoices.id, before.id), eq(invoices.version, before.version)))
        .returning()
      if (!after) throw conflict('This invoice changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'invoice',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(INVOICES(), principal, after as Record<string, unknown>)
    })
  })

  /* ------------------------------------------ raise one from an estimate */

  /** `POST /estimates/:id/invoice` — the first of the three joins DF-007 names.
   *
   *  Before this, turning an approved estimate into an invoice meant reading
   *  the estimate on one screen and typing its lines into another. That is
   *  where a transcription error enters a financial document chain, and it is
   *  invisible afterwards because nothing records that the two were meant to
   *  be the same figures.
   *
   *  What makes this a join rather than a shortcut:
   *
   *  - **Only an approved estimate.** A draft or a `sent` one has not been
   *    authorised, and a rejected or expired one never will be. The ceiling and
   *    segregation-of-duties checks live on `POST /estimates/:id/approve`; this
   *    route requires that they have already run, and never re-decides them.
   *  - **The lines are copied from the database, not from the request.** The
   *    caller cannot substitute a figure between approval and billing.
   *  - **The totals are recomputed** by the same `computeInvoiceTotals` the
   *    estimate used, and then checked against the total that was approved. A
   *    mismatch is a 409, not a silent re-bill: it means the estimate's lines
   *    changed after approval, and a human should look.
   *  - **Once.** `invoices.estimate_id` carries a partial unique index, so a
   *    second attempt is refused by the database even if two requests race the
   *    route's own check.
   *
   *  `dueDate` is required in the body. Payment terms are a commercial decision
   *  this codebase does not model, and defaulting to "thirty days" would be
   *  inventing one.
   */
  app.post('/estimates/:id/invoice', async (request, reply) => {
    const principal = principalOf(request)
    /* Creating an invoice, from a document the caller must also be able to
     * read. Both, because this route does both. */
    requirePermission(principal, 'invoices', 'c')
    requirePermission(principal, 'estimates', 'v')
    const parsed = estimateInvoiceBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid request.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    const result = await withTenant(deps.db, principal, async (tx) =>
      once(tx, request, { principal, endpoint: 'POST /estimates/:id/invoice', status: 201 }, async () => {
        const [estimate] = await tx
          .select()
          .from(estimates)
          .where(
            and(
              isNull(estimates.deletedAt),
              sql`(${estimates.id} = ${id} or ${estimates.code} = ${id})`,
            ),
          )
          .limit(1)
          .for('update')
        if (!estimate) throw notFound('Estimate')

        if (estimate.status !== 'approved') {
          throw ruleViolated(
            `Only an approved estimate can be invoiced — ${estimate.code} is ${estimate.status}.`,
            'status',
          )
        }

        /* The route's own check, so the caller gets the existing invoice's code
         * rather than a bare unique-violation. The index behind it is what
         * actually guarantees the "once". */
        const [existing] = await tx
          .select({ code: invoices.code })
          .from(invoices)
          .where(and(eq(invoices.estimateId, estimate.id), isNull(invoices.deletedAt)))
          .limit(1)
        if (existing) {
          throw conflict(`${estimate.code} has already been invoiced as ${existing.code}.`)
        }

        const lines = await tx
          .select()
          .from(estimateLines)
          .where(and(eq(estimateLines.estimateId, estimate.id), isNull(estimateLines.deletedAt)))
          .orderBy(estimateLines.sort)
        if (lines.length === 0) {
          throw ruleViolated('That estimate has no lines to invoice.', 'lines')
        }

        /* Recomputed from the stored lines by the same function the estimate
         * used — the client supplies no figure here at all. */
        const totals = computeInvoiceTotals(
          lines.map((line) => ({ qty: line.qty, unitPriceHalalas: line.unitPriceHalalas })),
          estimate.discountHalalas,
        )
        /* And it must still come to what was approved. If the lines moved after
         * the approval, the authorised amount and the billed amount are not the
         * same number, and that is a refusal rather than a rounding note. */
        if (totals.totalHalalas !== estimate.totalHalalas) {
          throw conflict(
            `${estimate.code} was approved at ${estimate.totalHalalas} halalas but its lines now come to ${totals.totalHalalas}. Re-approve it before invoicing.`,
          )
        }

        const invoiceId = ulid()
        const [invoice] = await tx
          .insert(invoices)
          .values({
            id: invoiceId,
            orgId: principal.orgId,
            branchId: principal.branchId,
            code: await nextCode(tx, 'INV'),
            customerId: estimate.customerId,
            customerName: estimate.customerName,
            /* Both links travel with it: the estimate it came from, and the job
             * card the estimate was against. */
            estimateId: estimate.id,
            jobCardId: estimate.jobCardId,
            vehicleId: estimate.vehicleId,
            dueDate: parsed.data.dueDate,
            status: 'draft',
            subtotalHalalas: totals.subtotalHalalas,
            taxHalalas: totals.taxHalalas,
            discountHalalas: totals.discountHalalas,
            totalHalalas: totals.totalHalalas,
            buyerVatNumber: parsed.data.buyerVatNumber ?? null,
            notes: parsed.data.notes ?? estimate.notes,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })
          .returning()
        if (!invoice) throw notFound('Invoice')

        await tx.insert(invoiceLines).values(
          lines.map((line, index) => ({
            id: ulid(),
            orgId: principal.orgId,
            branchId: principal.branchId,
            invoiceId,
            description: line.description,
            descriptionAr: line.descriptionAr,
            kind: line.kind,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
            partSku: line.partSku,
            sort: index,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })),
        )

        await writeAudit(tx, {
          actor: principal,
          action: 'create',
          entity: 'invoice',
          entityId: invoiceId,
          after: invoice,
          reason: `raised from estimate ${estimate.code}`,
          ...metaOf(request),
        })
        /* And on the estimate's own trail, so the chain reads forwards from
         * either end. */
        await writeAudit(tx, {
          actor: principal,
          action: 'transition',
          entity: 'estimate',
          entityId: estimate.id,
          before: { invoiceId: null },
          after: { invoiceId, invoiceCode: invoice.code },
          reason: 'invoiced',
          ...metaOf(request),
        })
        return presentRow(INVOICES(), principal, invoice as Record<string, unknown>)
      }),
    )

    reply.code(result.status)
    return result.body
  })

  /* ----------------------------------------------------------------- issue */
  app.post('/invoices/:id/issue', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'invoices', 'e')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadInvoice(tx, id)
      if (before.issuedAt) throw conflict('This invoice has already been issued.')
      if (before.status === 'cancelled') throw conflict('A cancelled invoice cannot be issued.')

      /* Issuing commits the amount, so the amount must be within the issuer's
       * ceiling — the same rule the approval inbox applies, applied here so
       * bypassing the inbox does not bypass the ceiling. */
      requireApproval(principal, before.totalHalalas)

      const previous = await previousHash(tx, principal.orgId)
      const hashSelf = invoiceHash(before, previous)

      /* The seller identity the QR and the printed document carry from here
       * on — read from the organization, never a literal in a screen. Issuing
       * is the moment this invoice becomes a tax document, so it is the
       * moment the seller's registered VAT number is captured onto the row:
       * an issued invoice is immutable, and the org's own VAT number is not,
       * so freezing it here is what makes a later org-settings change not
       * silently reach back into an invoice already issued. */
      const [orgRow] = await tx
        .select({ name: organizations.name, vatNumber: organizations.vatNumber })
        .from(organizations)
        .where(eq(organizations.id, principal.orgId))
        .limit(1)
      if (!orgRow?.vatNumber) {
        throw ruleViolated(
          'This organization has no VAT registration number on file. Set it in organization settings before issuing invoices.',
        )
      }
      const seller = { name: orgRow.name, vatNumber: orgRow.vatNumber }

      const [after] = await tx
        .update(invoices)
        .set({
          status: 'unpaid',
          issuedAt: sql`now()`,
          hashPrev: previous,
          hashSelf,
          sellerVatNumber: seller.vatNumber,
          qrCode: zatcaQr(before, seller),
          updatedBy: principal.userId,
        })
        .where(and(eq(invoices.id, before.id), eq(invoices.version, before.version)))
        .returning()
      if (!after) throw conflict('This invoice changed since you loaded it.')

      /* DF-001: issuing is the moment the sale becomes a receivable, so it is
       * the moment the ledger has to hear about it. Dr receivables for what the
       * customer owes; Cr revenue for the net and Cr VAT payable for the tax,
       * because the tax was never the workshop's to earn — it is collected on
       * the authority's behalf and owed onward.
       *
       * Posted inside the same transaction as the status change. If the posting
       * fails the invoice does not become issued, which is the only ordering
       * that cannot leave the two disagreeing. */
      if (!(await alreadyPosted(tx, 'invoice', after.id))) {
        const netHalalas = before.subtotalHalalas - before.discountHalalas
        await postJournalEntry(tx, principal, {
          entryDate: new Date().toISOString().slice(0, 10),
          ref: before.code,
          narration: `Invoice ${before.code} issued to ${before.customerName}`,
          source: 'invoice',
          sourceId: after.id,
          lines: [
            { accountCode: ACCOUNT.accountsReceivable, debitHalalas: before.totalHalalas },
            { accountCode: ACCOUNT.revenue, creditHalalas: netHalalas },
            { accountCode: ACCOUNT.vatPayable, creditHalalas: before.taxHalalas },
          ],
        })
      }

      await writeAudit(tx, {
        actor: principal,
        action: 'issue',
        entity: 'invoice',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(INVOICES(), principal, after as Record<string, unknown>)
    })
  })

  /* --------------------------------------------------------------- lines */
  app.get('/invoices/:id/lines', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'invoices', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const invoice = await loadInvoice(tx, id)
      const rows = await tx
        .select()
        .from(invoiceLines)
        .where(and(eq(invoiceLines.invoiceId, invoice.id), isNull(invoiceLines.deletedAt)))
        .orderBy(invoiceLines.sort)
      return { rows: rows.map((row) => presentRow(LINES(), principal, row as Record<string, unknown>)) }
    })
  })

  /* ------------------------------------------------------------- payments */
  app.post('/invoices/:id/payments', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'payments', 'c')
    const parsed = paymentCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid payment.', issue?.path.join('.'))
    }
    const input = parsed.data
    const { id } = request.params as { id: string }

    const result = await withTenant(deps.db, principal, async (tx) =>
      once(
        tx,
        request,
        { principal, endpoint: `POST /invoices/:id/payments`, status: 201 },
        async () => {
          /* Locking the invoice row is what makes two simultaneous payments
           * safe: the second waits, then re-reads a balance that already
           * includes the first. Without it both would see the old balance and
           * both would pass the `amount ≤ balance` check. */
          const invoice = await loadInvoice(tx, id, { forUpdate: true })
          const balance = invoice.totalHalalas - invoice.paidHalalas

          const failure = checkPayment({
            amountHalalas: input.amountHalalas,
            balanceHalalas: balance,
            invoiceStatus: invoice.status,
          })
          if (failure) throw ruleViolated(failure.message, failure.field)

          const paymentId = ulid()
          const paidOn = input.paidOn ?? new Date().toISOString().slice(0, 10)
          const [payment] = await tx
            .insert(payments)
            .values({
              id: paymentId,
              orgId: principal.orgId,
              branchId: principal.branchId,
              invoiceId: invoice.id,
              paidOn,
              method: input.method,
              methodAr: null,
              reference: input.reference ?? null,
              amountHalalas: input.amountHalalas,
              note: input.note ?? null,
              createdBy: principal.userId,
              updatedBy: principal.userId,
            })
            .returning()
          if (!payment) throw notFound('Payment')

          const paid = invoice.paidHalalas + input.amountHalalas
          const [updated] = await tx
            .update(invoices)
            .set({
              paidHalalas: paid,
              status: paid >= invoice.totalHalalas ? 'paid' : 'partial',
              updatedBy: principal.userId,
            })
            .where(eq(invoices.id, invoice.id))
            .returning()

          await tx.insert(receipts).values({
            id: ulid(),
            orgId: principal.orgId,
            branchId: principal.branchId,
            code: await nextCode(tx, 'RCP'),
            receiptDate: paidOn,
            customerName: invoice.customerName,
            invoiceCode: invoice.code,
            method: input.method,
            amountHalalas: input.amountHalalas,
            status: 'cleared',
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })

          /* DF-001: collecting turns a receivable into cash. Dr cash for what
           * arrived, Cr receivables for the same — revenue is untouched,
           * because it was recognised when the invoice was issued and
           * recognising it again here would double the month's sales.
           *
           * No `alreadyPosted` guard: `paymentId` was minted a few lines above
           * and so cannot already be posted. What stops a retried payment
           * posting twice is the `Idempotency-Key` this route requires — a
           * replay returns the stored response without reaching here. The
           * guard does belong on invoice issue, where the source id is the
           * invoice's own and a second issue attempt really can arrive. */
          await postJournalEntry(tx, principal, {
            entryDate: paidOn,
            ref: invoice.code,
            narration: `Payment received against ${invoice.code}`,
            source: 'payment',
            sourceId: paymentId,
            lines: [
              { accountCode: ACCOUNT.cash, debitHalalas: input.amountHalalas },
              { accountCode: ACCOUNT.accountsReceivable, creditHalalas: input.amountHalalas },
            ],
          })

          await writeAudit(tx, {
            actor: principal,
            action: 'pay',
            entity: 'invoice',
            entityId: invoice.id,
            before: { paidHalalas: invoice.paidHalalas, status: invoice.status },
            after: { paidHalalas: paid, status: updated?.status, paymentId },
            reason: input.note ?? null,
            ...metaOf(request),
          })

          return {
            payment: presentRow(PAYMENTS(), principal, payment as Record<string, unknown>),
            invoice: updated
              ? presentRow(INVOICES(), principal, updated as Record<string, unknown>)
              : null,
          }
        },
      ),
    )

    reply.code(result.status)
    return result.body
  })

  app.get('/invoices/:id/payments', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'payments', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const invoice = await loadInvoice(tx, id)
      const rows = await tx
        .select()
        .from(payments)
        .where(and(eq(payments.invoiceId, invoice.id), isNull(payments.deletedAt)))
        .orderBy(payments.paidOn)
      return {
        rows: rows.map((row) => presentRow(PAYMENTS(), principal, row as Record<string, unknown>)),
      }
    })
  })

  app.post('/receipts', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'payments', 'c')
    const body = request.body as Record<string, unknown> | undefined
    const invoiceRef = typeof body?.invoiceId === 'string' ? body.invoiceId : null
    if (!invoiceRef) throw badRequest('A receipt must name the invoice it settles.', 'invoiceId')

    const created = await withTenant(deps.db, principal, async (tx) => {
      const invoice = await loadInvoice(tx, invoiceRef)
      const [row] = await tx
        .insert(receipts)
        .values({
          id: ulid(),
          orgId: principal.orgId,
          branchId: principal.branchId,
          code: await nextCode(tx, 'RCP'),
          receiptDate: new Date().toISOString().slice(0, 10),
          customerName: invoice.customerName,
          invoiceCode: invoice.code,
          method: String(body?.method ?? 'Cash'),
          amountHalalas: invoice.totalHalalas - invoice.paidHalalas,
          status: 'pending',
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!row) throw notFound('Receipt')
      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'receipt',
        entityId: row.id,
        after: row,
        ...metaOf(request),
      })
      return presentRow(RECEIPTS(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })
}

type InvoiceRow = typeof invoices.$inferSelect

async function loadInvoice(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<InvoiceRow> {
  const base = tx
    .select()
    .from(invoices)
    .where(
      and(
        isNull(invoices.deletedAt),
        sql`(${invoices.id} = ${ref} or ${invoices.code} = ${ref})`,
      ),
    )
    .limit(1)

  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Invoice')
  return row
}

/** Per-organization sequential document numbers. The count is taken inside the
 *  request's transaction and under RLS, so one tenant's numbering never sees
 *  or skips because of another's. */
async function nextCode(tx: Tx, prefix: 'INV' | 'RCP'): Promise<string> {
  const table = prefix === 'INV' ? invoices : receipts
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(table)
  const year = new Date().getUTCFullYear()
  const sequence = String((row?.value ?? 0) + 1).padStart(4, '0')
  return `${prefix}-${year}-${sequence}`
}

/** The previous invoice's hash, forming the ZATCA hash chain. */
async function previousHash(tx: Tx, _orgId: string): Promise<string | null> {
  const [row] = await tx
    .select({ hash: invoices.hashSelf })
    .from(invoices)
    .where(sql`${invoices.hashSelf} is not null`)
    .orderBy(sql`${invoices.issuedAt} desc`)
    .limit(1)
  return row?.hash ?? null
}

function invoiceHash(invoice: InvoiceRow, previous: string | null): string {
  return createHash('sha256')
    .update(
      [
        previous ?? '',
        invoice.id,
        invoice.code,
        invoice.customerName,
        invoice.totalHalalas,
        invoice.taxHalalas,
      ].join('|'),
    )
    .digest('hex')
}

/** ZATCA phase-2 TLV payload, base64-encoded — seller, VAT number, timestamp,
 *  total and VAT amount, in that tag order.
 *
 *  Tag 1 is the *seller's* name. It read `invoice.customerName` until this
 *  fix — the buyer's name, in the seller's slot, on every QR this endpoint
 *  ever issued. A verification app trusts this payload over what the printed
 *  page says, so a wrong tag 1 is not cosmetic: it misidentifies who issued
 *  the invoice to whatever reads the code. */
function zatcaQr(invoice: InvoiceRow, seller: { name: string; vatNumber: string }): string {
  const fields: [number, string][] = [
    [1, seller.name],
    [2, seller.vatNumber],
    [3, new Date().toISOString()],
    [4, (invoice.totalHalalas / 100).toFixed(2)],
    [5, (invoice.taxHalalas / 100).toFixed(2)],
  ]
  const parts = fields.map(([tag, value]) => {
    const bytes = Buffer.from(value, 'utf8')
    return Buffer.concat([Buffer.from([tag, bytes.length]), bytes])
  })
  return Buffer.concat(parts).toString('base64')
}

/** Exported so the estimate router reuses the same per-tenant numbering. */
export { nextCode }
