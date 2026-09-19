/** `GET /organization` — the caller's own tenant's registration identity.
 *
 *  Authenticated but ungated, the same as `GET /auth/me`: a business's own
 *  VAT and Commercial Registration numbers are not a secret from anyone
 *  signed into that business, and the compliance-settings screens that show
 *  them (`ZATCASettings`, `VATSettings`) carry no RBAC module in the design
 *  at all. `organizations` is not itself a `tenant`-shaped table — it is the
 *  tenant — so this reads it the same way `routes/invoices.ts`'s issue path
 *  already does: scoped to `principal.orgId` inside the caller's `withTenant`
 *  transaction, not through the generic collection router (which every
 *  entry requires an RBAC module for).
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { organizations } from '../db/schema'
import { withTenant } from '../db/tenant'
import { principalOf } from '../http/context'
import { notFound } from '../http/errors'
import type { RouteDeps } from './collections'

export function registerOrganizationRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.get('/organization', async (request) => {
    const principal = principalOf(request)
    return withTenant(deps.db, principal, async (tx) => {
      const [row] = await tx
        .select({
          name: organizations.name,
          vatNumber: organizations.vatNumber,
          crNumber: organizations.crNumber,
        })
        .from(organizations)
        .where(and(eq(organizations.id, principal.orgId), isNull(organizations.deletedAt)))
        .limit(1)
      if (!row) throw notFound('Organization')
      return {
        name: row.name,
        vatNumber: row.vatNumber,
        crNumber: row.crNumber,
      }
    })
  })
}
