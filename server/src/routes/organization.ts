/** The organization's own tax identity, and the VAT rate it is charged under.
 *
 *  One read, because the compliance screens were displaying both of these as
 *  hardcoded literals (BLK-004): a VAT registration number invented in a
 *  component, and a `15%` that merely coincided with the rate the server
 *  enforces. Three different kinds of fact meet on those screens, and this
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
 *  2. **Enforced** — `vatRateBps`, `env.VAT_RATE_BPS`. The *same* read the
 *     invoice pricing rule and the tax-return endpoint make, so a screen
 *     showing it cannot quote a rate the ledger did not charge. A deployment
 *     that runs at a different rate makes this number move with it.
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
 *  Gated on `accounting:v` — the same grant `GET /accounting/tax/return`
 *  requires, held by owner, superadmin, manager and accountant. Tax
 *  registration identity is read by the people who file, not by the workshop
 *  floor.
 */
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { organizations } from '../db/schema'
import { withTenant } from '../db/tenant'
import { notFound } from '../http/errors'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface OrganizationDeps {
  db: Database
  env: Env
}

export function registerOrganizationRoutes(app: FastifyInstance, deps: OrganizationDeps): void {
  /* ------------------------------------------- GET /organization/tax-profile */
  app.get('/organization/tax-profile', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const [row] = await tx
        .select({
          name: organizations.name,
          nameAr: organizations.nameAr,
          vatNumber: organizations.vatNumber,
          crNumber: organizations.crNumber,
        })
        .from(organizations)
        .where(eq(organizations.id, principal.orgId))
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
