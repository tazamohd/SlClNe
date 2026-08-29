/** The public, unauthenticated marketing lead form (F-025, Part 7).
 *
 *  This is the one schema an anonymous caller's body is validated against, so
 *  it is deliberately narrow: exactly the fields the marketing site's Contact
 *  form collects, each bounded, and `.strict()` so an unknown key is a 400
 *  rather than silently ignored — a public endpoint must not accept fields it
 *  does not model. There is no `orgId` field: a public lead lands in a single
 *  server-configured organization, never one the caller names, so tenant
 *  selection is not part of this contract at all.
 */
import { z } from 'zod'
import { email, nonEmpty, phone } from '../primitives'

export const publicLeadCreate = z
  .object({
    name: nonEmpty.max(160),
    /** At least one way to reach the enquirer; both are validated when present
     *  and the route requires that one be given. */
    email: email.optional(),
    phone: phone.optional(),
    company: z.string().max(200).optional(),
    message: z.string().max(2000).optional(),
    /** Where the visitor came from, if the site knows — bounded free text, not
     *  a channel the caller can use to smuggle markup. */
    source: z.string().max(64).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'Provide an email or a phone number so we can reply.',
    path: ['email'],
  })

export type PublicLeadCreate = z.infer<typeof publicLeadCreate>
