/** `GET /organization` — the caller's own tenant's registration identity, and
 *  the VAT rate its invoices are priced at.
 *
 *  Three different kinds of fact meet on the compliance screens, and this
 *  endpoint keeps them apart rather than flattening them into one "settings"
 *  blob:
 *
 *  1. **Recorded** — `organizations.vat_number` and `organizations.cr_number`.
 *     A registration number is a genuine property of the organization: it is
 *     issued to it, it is stored on its row, and `POST /invoices/:id/issue`
 *     reads it, stamps it onto the invoice and into the ZATCA QR payload, and
 *     *refuses to issue at all* when it is null. So this is not a display
 *     value — it is the seller identity on every tax document the workshop
 *     produces. Null is returned as null, never as a plausible-looking number:
 *     "not recorded" is a state the screen must be able to show, because it is
 *     the state in which invoicing is blocked.
 *  2. **Enforced** — `vatRateBps`, from `env.VAT_RATE_BPS`. The *same* read the
 *     invoice pricing rule and the tax-return endpoint make, so a screen
 *     showing it cannot quote a rate the ledger did not charge. A deployment
 *     running at another rate makes this number move with it. The compliance
 *     screens previously printed a literal `15%` that merely *coincided* with
 *     it (BLK-004).
 *  3. **Derived** — nothing here. Every monetary total belongs to
 *     `routes/finance-reports.ts`, which sums it in SQL over the whole tenant
 *     scope; this endpoint returns no money.
 *
 *  **This is a read, and only a read, on purpose.** The rate is deployment
 *  configuration: the server reads it from the environment, so a database-backed
 *  editable rate would be a control the enforcement ignores — a tax setting
 *  that looks authoritative and changes nothing. Recording a VAT number is a
 *  genuine administrative act, but it belongs to whatever owns organization
 *  administration, not to a tax screen, and no such write exists yet.
 *
 *  **Authenticated but ungated**, the same as `GET /auth/me`. Two changes built
 *  this endpoint independently and disagreed here: one gated it on
 *  `accounting:v` by analogy with `GET /accounting/tax/return`. That analogy
 *  does not hold. The tax-return endpoint returns *monetary totals*; this one
 *  returns the organization's own name, its own registration numbers and the
 *  rate — every one of which `POST /invoices/:id/issue` stamps onto each
 *  invoice the workshop hands out, including to the technician who worked the
 *  job and the customer who pays it. A gate over data printed on every invoice
 *  protects nothing and only looks protective. The compliance *screens* are
 *  separately mapped to `accounting` in `SCREEN_MODULE`, which is a real
 *  narrowing and stands.
 *
 *  `organizations` is not itself a `tenant`-shaped table — it *is* the tenant —
 *  so this reads it the way `routes/invoices.ts`'s issue path already does:
 *  scoped to `principal.orgId` inside the caller's `withTenant` transaction,
 *  not through the generic collection router (whose every entry requires an
 *  RBAC module).
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { organizations } from '../db/schema'
import { withTenant } from '../db/tenant'
import { principalOf } from '../http/context'
import { notFound } from '../http/errors'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface OrganizationDeps {
  db: Database
  env: Env
}

export function registerOrganizationRoutes(app: FastifyInstance, deps: OrganizationDeps): void {
  app.get('/organization', async (request) => {
    const principal = principalOf(request)

    return withTenant(deps.db, principal, async (tx) => {
      const [row] = await tx
        .select({
          name: organizations.name,
          nameAr: organizations.nameAr,
          vatNumber: organizations.vatNumber,
          crNumber: organizations.crNumber,
        })
        .from(organizations)
        .where(and(eq(organizations.id, principal.orgId), isNull(organizations.deletedAt)))
        .limit(1)
      if (!row) throw notFound('Organization')

      return {
        name: row.name,
        nameAr: row.nameAr,
        /* Null when the organization has recorded none. The screen says
         * "not recorded" and names the consequence; it does not substitute a
         * number, and neither does this. */
        vatNumber: row.vatNumber,
        crNumber: row.crNumber,
        /* The rate the pricing rule charges at, read from the one place it is
         * configured. Reported in basis points, like every other rate on this
         * API, so the client never has to reconstruct it from a percentage. */
        vatRateBps: deps.env.VAT_RATE_BPS,
        /* Says out loud where that number came from, so a screen can label it
         * as deployment configuration rather than as an editable setting. */
        vatRateSource: 'deployment-configuration' as const,
      }
    })
  })
}
