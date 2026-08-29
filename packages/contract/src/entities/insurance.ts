/** Insurance policies and claims (financial products).
 *
 *  A policy is the cover a customer holds on a vehicle; a claim is a request
 *  against a policy, which may relate to a workshop repair. Both are read-only
 *  across the generic router — a claim moves through its lifecycle by named
 *  actions (submit, approve, reject, pay), modelled on the estimate approval so
 *  the ceiling and segregation-of-duties controls are the same ones. Money is
 *  an integer count of halalas; no total is ever computed on the client.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

export const insurancePolicyType = z.enum(['comprehensive', 'third_party', 'own_damage'])
export type InsurancePolicyType = z.infer<typeof insurancePolicyType>

export const insurancePolicyStatus = z.enum(['active', 'expired', 'cancelled'])
export type InsurancePolicyStatus = z.infer<typeof insurancePolicyStatus>

export const insuranceClaimStatus = z.enum([
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'paid',
])
export type InsuranceClaimStatus = z.infer<typeof insuranceClaimStatus>

/** Submitting a claim. The claimed amount is what the customer asks for; the
 *  approved amount is decided later, by the adjuster, at approval. No total is
 *  accepted beyond the single claimed figure. */
export const insuranceClaimCreate = z.object({
  policyId: ulid,
  vehicleId: ulid.optional(),
  vehicleLabel: z.string().max(160).optional(),
  /** A claim may relate to a repair, or to none. */
  jobCardId: ulid.optional(),
  amountClaimedHalalas: halalas,
  incidentDate: isoDate,
  description: nonEmpty.max(2000),
})
export type InsuranceClaimCreate = z.infer<typeof insuranceClaimCreate>

/** Approving a claim. The adjuster may approve less than was claimed; omitting
 *  the figure approves the claimed amount in full. The approved amount is what
 *  the ceiling is checked against. */
export const insuranceClaimApproveBody = z.object({
  approvedAmountHalalas: halalas.optional(),
  reason: z.string().max(500).optional(),
})
export type InsuranceClaimApproveBody = z.infer<typeof insuranceClaimApproveBody>

export const insurancePolicyRow = appRow({
  /** `INS-POL-0001` — the human policy number the design shows. */
  policyNumber: z.string(),
  insurer: z.string(),
  type: insurancePolicyType,
  holder: z.string(),
  customerId: ulid.nullable(),
  vehicleId: ulid.nullable(),
  vehicleLabel: z.string(),
  /** `"SAR 1,200"` — formatted from `premiumHalalas` at the boundary. */
  premium: z.string(),
  premiumHalalas: z.number().int().min(0),
  coverage: z.string(),
  coverageHalalas: z.number().int().min(0),
  start: z.string(),
  end: z.string(),
  status: insurancePolicyStatus,
})
export type InsurancePolicyRow = z.infer<typeof insurancePolicyRow>

export const insuranceClaimRow = appRow({
  /** `INS-CLM-0001` — the human claim number. */
  claimNumber: z.string(),
  policyId: ulid.nullable(),
  policyNumber: z.string(),
  vehicleId: ulid.nullable(),
  vehicleLabel: z.string(),
  jobCardId: ulid.nullable(),
  amountClaimed: z.string(),
  amountClaimedHalalas: z.number().int().min(0),
  /** Null until the claim is approved. */
  amountApproved: z.string().nullable(),
  amountApprovedHalalas: z.number().int().min(0).nullable(),
  status: insuranceClaimStatus,
  incidentDate: z.string(),
  description: z.string(),
  /** Who raised the claim, and who approved it once one has — the segregation
   *  of duties pair, as on the estimate. */
  submittedBy: ulid.nullable(),
  approvedBy: ulid.nullable(),
})
export type InsuranceClaimRow = z.infer<typeof insuranceClaimRow>
