/** CRM — leads, opportunities and tasks (`DATA_MODEL.md` §CRM).
 *
 *  The lead pipeline the design renders carries free-text stages
 *  (`"Qualified"`, `"negotiation"`) whose casing and vocabulary differ between
 *  leads and opportunities, so `stage` is a bounded string rather than an enum:
 *  an enum here would reject a value the seed itself loads from the fixtures.
 *  Money is halalas; a client never sends a formatted `"SAR 45,000"`.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty } from '../primitives'
import { appRow } from './common'

/* ------------------------------------------------------------------- leads */

export const leadCreate = z.object({
  name: nonEmpty.max(160),
  company: z.string().max(200).optional(),
  valueHalalas: halalas.default(0),
  source: z.string().max(64).optional(),
  stage: nonEmpty.max(32).default('new'),
  leadDate: isoDate.optional(),
  score: z.number().int().min(0).max(100).optional(),
})

export const leadUpdate = leadCreate.partial()

export type LeadCreate = z.infer<typeof leadCreate>
export type LeadUpdate = z.infer<typeof leadUpdate>

export const leadRow = appRow({
  name: z.string(),
  company: z.string(),
  value: z.string(),
  source: z.string(),
  stage: z.string(),
  date: z.string(),
  score: z.number().int(),
})

export type LeadRow = z.infer<typeof leadRow>

/** Converting a lead to an opportunity. Everything the new opportunity needs
 *  that the lead does not already carry: the design's lead has no owner,
 *  probability or close date, so the convert action supplies them. All
 *  optional — a conversion with no extra input still produces a coherent
 *  opportunity from the lead's own fields. */
export const leadConvertBody = z.object({
  ownerName: z.string().max(200).optional(),
  probabilityPct: z.number().int().min(0).max(100).optional(),
  closeDate: isoDate.optional(),
  stage: nonEmpty.max(32).optional(),
})

export type LeadConvertBody = z.infer<typeof leadConvertBody>

/* ----------------------------------------------------------- opportunities */

export const opportunityCreate = z.object({
  name: nonEmpty.max(160),
  company: z.string().max(200).optional(),
  valueHalalas: halalas.default(0),
  stage: nonEmpty.max(32),
  probabilityPct: z.number().int().min(0).max(100).optional(),
  closeDate: isoDate.optional(),
  ownerName: z.string().max(200).optional(),
})

export const opportunityUpdate = opportunityCreate.partial()

export type OpportunityCreate = z.infer<typeof opportunityCreate>
export type OpportunityUpdate = z.infer<typeof opportunityUpdate>

export const opportunityRow = appRow({
  name: z.string(),
  company: z.string(),
  value: z.string(),
  stage: z.string(),
  prob: z.string(),
  close: z.string(),
  owner: z.string(),
})

export type OpportunityRow = z.infer<typeof opportunityRow>

/* --------------------------------------------------------------- crm tasks */

export const crmTaskPriority = z.enum(['low', 'medium', 'high', 'urgent'])
export type CrmTaskPriority = z.infer<typeof crmTaskPriority>

export const crmTaskStatus = z.enum(['todo', 'in_progress', 'done'])
export type CrmTaskStatus = z.infer<typeof crmTaskStatus>

export const crmTaskCreate = z.object({
  title: nonEmpty.max(300),
  assignedTo: z.string().max(200).optional(),
  dueDate: isoDate.optional(),
  priority: crmTaskPriority.default('medium'),
  status: crmTaskStatus.default('todo'),
  type: z.string().max(24).optional(),
})

export const crmTaskUpdate = crmTaskCreate.partial()

export type CrmTaskCreate = z.infer<typeof crmTaskCreate>
export type CrmTaskUpdate = z.infer<typeof crmTaskUpdate>

export const crmTaskRow = appRow({
  title: z.string(),
  assigned: z.string(),
  due: z.string(),
  priority: crmTaskPriority,
  status: crmTaskStatus,
  type: z.string(),
})

export type CrmTaskRow = z.infer<typeof crmTaskRow>
