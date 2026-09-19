/** Parts Network (BLK-004) — a garage-to-garage / garage-to-dealer parts
 *  supply network: the members this workshop trades parts with, the requests it
 *  broadcasts, the quotations that come back, and the orders an accepted
 *  quotation becomes. `PartsNetwork.tsx` and `Procurement.tsx`'s three network
 *  views all rendered an honest "no data source yet" shell because none of this
 *  existed anywhere in the system.
 *
 *  **The tenant boundary.** Nothing in this domain crosses it. Every row is
 *  owned by one organization and visible only to it, under the same RLS policy
 *  set `equipmentWarranties` and `notifications` carry. What is modelled is
 *  each tenant's *own record* of its network activity: `direction` says whether
 *  a request went out or came in, and the counterparty is a member in this
 *  tenant's own directory, never a foreign `orgId`.
 *  `server/drizzle/0024_parts_network.sql` sets out at length why genuine
 *  cross-org sharing is deliberately out of scope rather than faked by widening
 *  the tenant policy.
 *
 *  Members, requests and quotations are writable through the generic collection
 *  router — flat rows, no lines, one lifecycle move each. **Accepting a
 *  quotation is not**: it must reject the request's other quotations, move the
 *  request to `ordered` and create the order, all in one transaction, so it has
 *  a bespoke route (`POST /parts-network/quotations/:id/accept`) the way
 *  procurement's approvals do. `acceptQuotationBody` below is what that route
 *  takes.
 *
 *  Every `code` (`NWM-0001`, `NRQ-0001`, `NQT-0001`, `NOR-0001`) and every
 *  status timestamp is assigned server-side from the transition, never accepted
 *  as input — the discipline `equipmentWarranties.claimedAt` set.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

/* ----------------------------------------------------------------- members */

export const partsNetworkMemberKind = z.enum(['garage', 'dealer', 'store', 'supplier'])
export type PartsNetworkMemberKind = z.infer<typeof partsNetworkMemberKind>

export const partsNetworkMemberStatus = z.enum(['active', 'pending', 'suspended'])
export type PartsNetworkMemberStatus = z.infer<typeof partsNetworkMemberStatus>

export const partsNetworkMemberCreate = z.object({
  name: nonEmpty.max(200),
  nameAr: z.string().max(200).optional(),
  kind: partsNetworkMemberKind.optional(),
  city: z.string().max(120).optional(),
  contactName: z.string().max(200).optional(),
  contactPhone: z.string().max(32).optional(),
  contactEmail: z.string().max(254).optional(),
  /** Reuse over invention: a member that is also one of this workshop's own
   *  vendors points at that `suppliers` row rather than duplicating it. */
  supplierId: ulid.nullable().optional(),
  status: partsNetworkMemberStatus.optional(),
  /** Tenths — 4.6 stars is `46` — so a rating is integer arithmetic for the
   *  same reason money is halalas. */
  ratingTenths: z.number().int().min(0).max(50).nullable().optional(),
  notes: z.string().max(2000).optional(),
})
export type PartsNetworkMemberCreate = z.infer<typeof partsNetworkMemberCreate>

export const partsNetworkMemberUpdate = partsNetworkMemberCreate.partial()
export type PartsNetworkMemberUpdate = z.infer<typeof partsNetworkMemberUpdate>

export const partsNetworkMemberRow = appRow({
  /** `NWM-0001` — the human member code. */
  id: z.string(),
  code: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  kind: partsNetworkMemberKind,
  city: z.string().nullable(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  supplierId: z.string().nullable(),
  status: partsNetworkMemberStatus,
  ratingTenths: z.number().nullable(),
  /** `46` presented as `4.6`; null when unrated, never a fabricated default. */
  rating: z.number().nullable(),
  notes: z.string().nullable(),
})
export type PartsNetworkMemberRow = z.infer<typeof partsNetworkMemberRow>

/* ---------------------------------------------------------------- requests */

/** `outgoing` — this workshop asked the network. `incoming` — a member asked
 *  this workshop. Both are this tenant's own rows; see the header. */
export const partsNetworkDirection = z.enum(['outgoing', 'incoming'])
export type PartsNetworkDirection = z.infer<typeof partsNetworkDirection>

export const partsNetworkUrgency = z.enum(['low', 'normal', 'high', 'urgent'])
export type PartsNetworkUrgency = z.infer<typeof partsNetworkUrgency>

export const partsNetworkRequestStatus = z.enum(['open', 'quoted', 'ordered', 'closed', 'cancelled'])
export type PartsNetworkRequestStatus = z.infer<typeof partsNetworkRequestStatus>

export const partsNetworkRequestCreate = z.object({
  direction: partsNetworkDirection.optional(),
  memberId: ulid.nullable().optional(),
  memberName: z.string().max(200).optional(),
  partSku: z.string().max(64).optional(),
  partName: nonEmpty.max(200),
  partNumber: z.string().max(64).optional(),
  qty: z.number().int().min(1).max(100000).optional(),
  urgency: partsNetworkUrgency.optional(),
  vehicleInfo: z.string().max(200).optional(),
  jobCode: z.string().max(32).optional(),
  neededBy: isoDate.optional(),
  status: partsNetworkRequestStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type PartsNetworkRequestCreate = z.infer<typeof partsNetworkRequestCreate>

/** `direction` is fixed at creation: a request that came in cannot be
 *  relabelled as one that went out, which would rewrite who asked whom. */
export const partsNetworkRequestUpdate = partsNetworkRequestCreate.partial().omit({ direction: true })
export type PartsNetworkRequestUpdate = z.infer<typeof partsNetworkRequestUpdate>

export const partsNetworkRequestRow = appRow({
  /** `NRQ-0001` — the human request code. */
  id: z.string(),
  code: z.string(),
  direction: partsNetworkDirection,
  memberId: z.string().nullable(),
  memberName: z.string().nullable(),
  partSku: z.string().nullable(),
  partName: z.string(),
  partNumber: z.string().nullable(),
  qty: z.number(),
  urgency: partsNetworkUrgency,
  vehicleInfo: z.string().nullable(),
  jobCode: z.string().nullable(),
  neededBy: z.string().nullable(),
  status: partsNetworkRequestStatus,
  /** Maintained by the server as quotations arrive, never posted. */
  quotationCount: z.number(),
  quotedAt: z.string().nullable(),
  orderedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  notes: z.string().nullable(),
})
export type PartsNetworkRequestRow = z.infer<typeof partsNetworkRequestRow>

/* -------------------------------------------------------------- quotations */

export const partsNetworkCondition = z.enum(['new', 'used', 'oem', 'aftermarket'])
export type PartsNetworkCondition = z.infer<typeof partsNetworkCondition>

export const partsNetworkQuotationStatus = z.enum(['pending', 'accepted', 'rejected', 'withdrawn'])
export type PartsNetworkQuotationStatus = z.infer<typeof partsNetworkQuotationStatus>

/** `status` is **not** accepted on create: a quotation is born `pending`, and
 *  the only way to `accepted` is the accept route, which also has to reject the
 *  siblings and raise the order. A create that could declare itself accepted
 *  would leave the request and the order behind. */
export const partsNetworkQuotationCreate = z.object({
  requestId: ulid,
  memberId: ulid.nullable().optional(),
  memberName: nonEmpty.max(200),
  unitPriceHalalas: halalas,
  qtyAvailable: z.number().int().min(0).max(100000).optional(),
  leadTimeDays: z.number().int().min(0).max(3650).nullable().optional(),
  condition: partsNetworkCondition.optional(),
  warrantyMonths: z.number().int().min(0).max(600).nullable().optional(),
  notes: z.string().max(2000).optional(),
})
export type PartsNetworkQuotationCreate = z.infer<typeof partsNetworkQuotationCreate>

/** `requestId` is fixed, and `accepted` is refused here so the one transition
 *  with invariants behind it cannot be reached by a plain `PATCH`. Withdrawing
 *  or rejecting a quotation carries no invariant, so both stay ordinary writes. */
export const partsNetworkQuotationUpdate = partsNetworkQuotationCreate
  .partial()
  .omit({ requestId: true })
  .extend({ status: z.enum(['pending', 'rejected', 'withdrawn']).optional() })
export type PartsNetworkQuotationUpdate = z.infer<typeof partsNetworkQuotationUpdate>

export const partsNetworkQuotationRow = appRow({
  /** `NQT-0001` — the human quotation code. */
  id: z.string(),
  code: z.string(),
  requestId: z.string(),
  memberId: z.string().nullable(),
  memberName: z.string(),
  unitPriceHalalas: z.number(),
  /** `unitPriceHalalas` formatted, so two screens cannot disagree about it. */
  unitPrice: z.string(),
  qtyAvailable: z.number(),
  leadTimeDays: z.number().nullable(),
  condition: partsNetworkCondition,
  warrantyMonths: z.number().nullable(),
  status: partsNetworkQuotationStatus,
  acceptedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  notes: z.string().nullable(),
})
export type PartsNetworkQuotationRow = z.infer<typeof partsNetworkQuotationRow>

/* ------------------------------------------------------------------ orders */

/** `outbound` — this workshop buys. `inbound` — this workshop fulfils. */
export const partsNetworkOrderDirection = z.enum(['outbound', 'inbound'])
export type PartsNetworkOrderDirection = z.infer<typeof partsNetworkOrderDirection>

export const partsNetworkOrderStatus = z.enum(['placed', 'shipped', 'received', 'cancelled'])
export type PartsNetworkOrderStatus = z.infer<typeof partsNetworkOrderStatus>

/** An order is normally *born* from the accept route, which is why nothing here
 *  accepts a total: `totalHalalas` is `qty × unitPriceHalalas`, summed by the
 *  server. A direct create exists for an order agreed outside the quotation
 *  flow (a phone call to a member), which is why `requestId`/`quotationId` are
 *  optional rather than required. */
export const partsNetworkOrderCreate = z.object({
  requestId: ulid.nullable().optional(),
  quotationId: ulid.nullable().optional(),
  memberId: ulid.nullable().optional(),
  memberName: nonEmpty.max(200),
  direction: partsNetworkOrderDirection.optional(),
  partName: nonEmpty.max(200),
  qty: z.number().int().min(1).max(100000).optional(),
  unitPriceHalalas: halalas.optional(),
  trackingRef: z.string().max(64).optional(),
  expectedAt: isoDate.optional(),
  notes: z.string().max(2000).optional(),
})
export type PartsNetworkOrderCreate = z.infer<typeof partsNetworkOrderCreate>

/** The lifecycle (`placed` → `shipped` → `received`, or `cancelled`) is a plain
 *  field write: each move sets its own timestamp server-side and touches
 *  nothing else, so it needs no bespoke route the way accepting a quotation
 *  does. `quotationId`/`requestId` are fixed — an order cannot be re-pointed at
 *  a different quotation after the fact. */
export const partsNetworkOrderUpdate = partsNetworkOrderCreate
  .partial()
  .omit({ requestId: true, quotationId: true })
  .extend({ status: partsNetworkOrderStatus.optional() })
export type PartsNetworkOrderUpdate = z.infer<typeof partsNetworkOrderUpdate>

export const partsNetworkOrderRow = appRow({
  /** `NOR-0001` — the human order code. */
  id: z.string(),
  code: z.string(),
  requestId: z.string().nullable(),
  quotationId: z.string().nullable(),
  memberId: z.string().nullable(),
  memberName: z.string(),
  direction: partsNetworkOrderDirection,
  partName: z.string(),
  qty: z.number(),
  unitPriceHalalas: z.number(),
  totalHalalas: z.number(),
  /** `totalHalalas` formatted at the single boundary that formats money. */
  total: z.string(),
  status: partsNetworkOrderStatus,
  trackingRef: z.string().nullable(),
  expectedAt: z.string().nullable(),
  shippedAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  notes: z.string().nullable(),
})
export type PartsNetworkOrderRow = z.infer<typeof partsNetworkOrderRow>

/* ------------------------------------------------------- accept a quotation */

/** `POST /parts-network/quotations/:id/accept`. Everything the resulting order
 *  needs beyond the quotation itself is optional: the quantity defaults to the
 *  request's, the price and the member come from the quotation, and the total
 *  is computed. Nothing about the money is accepted here. */
export const acceptQuotationBody = z.object({
  /** How many to order, when it differs from what the request asked for.
   *  Refused above the quoting member's stated availability. */
  qty: z.number().int().min(1).max(100000).optional(),
  expectedAt: isoDate.optional(),
  notes: z.string().max(2000).optional(),
})
export type AcceptQuotationBody = z.infer<typeof acceptQuotationBody>
