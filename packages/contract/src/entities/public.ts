/** The public, unauthenticated marketing lead form (F-025, Part 7).
 *
 *  This is the one schema an anonymous caller's body is validated against, so
 *  it is deliberately narrow: exactly the fields the marketing site's Contact
 *  form collects, each bounded, and `.strict()` so an unknown key is a 400
 *  rather than silently ignored — a public endpoint must not accept fields it
 *  does not model. There is no `orgId` field: a public lead lands in a single
 *  server-configured organization, never one the caller names, so tenant
 *  selection is not part of this contract at all.
 *
 *  Customer self-registration, added below, is the one public schema that does
 *  name a tenant, and it says at length why and what bounds it.
 */
import { z } from 'zod'
import { email, nonEmpty, phone, ulid } from '../primitives'

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

/** Customer self-registration at a named garage.
 *
 *  Unlike `publicLeadCreate`, this one **does** let the caller name a tenant:
 *  a customer signs up with a particular workshop, and there is no other way
 *  for an unauthenticated visitor to say which. That is a deliberate widening
 *  of the public plane, and it is bounded on four sides:
 *
 *   - the id must parse as a ULID and name an organization that is `active`
 *     and not soft-deleted, or the request is refused as a bad request — the
 *     same answer it gets for an id that does not exist, so the endpoint does
 *     not become a way to ask which tenants exist;
 *   - the account is created `pending` and can do nothing until a one-time
 *     code sent to the phone number is verified. `service.login` already
 *     refuses any account that is not `active`, so this needs no new gate;
 *   - the role is fixed at `customer` — the body has no field to ask for
 *     another, and `.strict()` refuses the key if it tries;
 *   - the rate limit on the route is the public plane's, not the API's.
 *
 *  `email` is required even though `handoff/README.md` writes it optional:
 *  `users.email` is the login identifier and is `NOT NULL`, so an account
 *  without one could be created and never signed into. Better to ask for it
 *  than to synthesise an address the customer does not know they have. */
export const publicCustomerRegister = z
  .object({
    garageId: ulid,
    name: nonEmpty.max(160),
    phone,
    email,
    password: nonEmpty.max(200),
  })
  .strict()

export type PublicCustomerRegister = z.infer<typeof publicCustomerRegister>

/** The code from the SMS, against the number it was sent to. */
export const publicCustomerVerify = z.object({ phone, code: nonEmpty.max(16) }).strict()
export type PublicCustomerVerify = z.infer<typeof publicCustomerVerify>

/** Another code to the same number. Throttled server-side. */
export const publicCustomerResend = z.object({ phone }).strict()
export type PublicCustomerResend = z.infer<typeof publicCustomerResend>
