/** Customer feedback (`DATA_MODEL.md` §Feedback).
 *
 *  A rating and an optional comment against a job card / customer. Stored under
 *  the same tenant/branch/audit discipline as everything else, and read back
 *  only within the tenant that owns it.
 */
import { z } from 'zod'
import { ulid } from '../primitives'
import { appRow } from './common'

export const feedbackCreate = z.object({
  /** One to five stars, the scale the design's capture form shows. */
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  jobCardId: ulid.optional(),
  customerId: ulid.optional(),
  customerName: z.string().max(200).optional(),
})

export const feedbackUpdate = feedbackCreate.partial()

export type FeedbackCreate = z.infer<typeof feedbackCreate>
export type FeedbackUpdate = z.infer<typeof feedbackUpdate>

export const feedbackRow = appRow({
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  customer: z.string(),
  jobCardId: z.string().nullable(),
  customerId: z.string().nullable(),
})

export type FeedbackRow = z.infer<typeof feedbackRow>
