import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { procurementApi, procurementUnavailableReason } from '@/screens/network/Procurement'

/** Procurement server support — landed (F-022).
 *
 *  Wave W2 tranche 2 asked for the requisition lifecycle, purchase-order raise
 *  and approve within the ceiling, and receiving against the order. Agent 05
 *  built all of it, so the assertions below now pin the *presence* of each
 *  endpoint rather than its absence — the reverse ratchet has flipped. What
 *  stays a gap is the last mile the boundary owns: `Procurement.tsx`'s
 *  `procurementApi()` still returns null until agent 11 wires the transport in
 *  `app/src/data/repository.ts` (`createProcurementApi`) to these screens, so
 *  the screens keep rendering the honest absent-capability state until then.
 */

const HERE = path.dirname(fileURLToPath(new URL(import.meta.url)))
const REPO = path.resolve(HERE, '..', '..')

const read = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8')

const registry = read('server/src/registry.ts')
const schema = read('server/src/db/schema.ts')
const sod = read('server/src/security/sod.ts')
const appTs = read('server/src/app.ts')
const movementContract = read('packages/contract/src/entities/part.ts')

const routeFiles = fs
  .readdirSync(path.join(REPO, 'server/src/routes'))
  .filter((name) => name.endsWith('.ts'))

describe('requisitions now exist server-side', () => {
  it('registers a `requisitions` collection under /procurement/requisitions', () => {
    expect(registry).toMatch(/key:\s*'requisitions'/)
    expect(registry).toMatch(/path:\s*'procurement\/requisitions'/)
  })

  it('has a requisitions table with its lines in the schema', () => {
    expect(schema).toMatch(/pgTable\(\s*'requisitions'/)
    expect(schema).toMatch(/pgTable\(\s*'requisition_lines'/)
  })
})

describe('purchase orders are now reachable', () => {
  it('keeps the purchase_order tables, with received_qty for receiving', () => {
    expect(schema).toMatch(/pgTable\(\s*'purchase_orders'/)
    expect(schema).toMatch(/pgTable\(\s*'purchase_order_lines'/)
    expect(schema).toMatch(/received_qty/)
  })

  it('registers a `purchaseOrders` collection under /procurement/purchase-orders', () => {
    expect(registry).toMatch(/key:\s*'purchaseOrders'/)
    expect(registry).toMatch(/procurement\/purchase-orders/)
  })

  it('serves the procurement routes — raise, approve (ceiling + SOD) and receive (received ≤ ordered)', () => {
    expect(routeFiles).toContain('procurement.ts')
    const procurement = read('server/src/routes/procurement.ts')
    expect(procurement).toMatch(/purchase-orders\/:id\/approve/)
    expect(procurement).toMatch(/purchase-orders\/:id\/receive/)
    expect(procurement).toMatch(/requireApproval/)
    expect(procurement).toMatch(/requireDifferentApprover/)
    expect(appTs).toMatch(/registerProcurementRoutes/)
  })
})

describe('the server now observes the purchase-order SOD pair', () => {
  it('the four procurement activities still resolve, and the PO pair is audit-observable', () => {
    // The activity names come from the SOD table and are all still present.
    for (const activity of [
      'Raise purchase order',
      'Approve purchase order',
      'Create supplier',
      'Approve supplier payment',
    ]) {
      expect(sod).toContain(`'${activity}'`)
    }
    // The purchase-order pair moved from UNOBSERVABLE to a SIGNATURES entry:
    // raising writes a `create` and approving an `approve` on `purchase_order`.
    expect(sod).toMatch(/entity: 'purchase_order'/)
    // The supplier-payment side still has no route, so its pair stays unenforced.
    expect(sod).toMatch(/no supplier-payment approval route exists yet/)
  })
})

describe('the inventory movement endpoint still cannot stand in for receiving', () => {
  it('movementCreate carries no ordered quantity or purchase-order link', () => {
    // Receiving has its own endpoint that loads the PO line and checks
    // received_qty; the generic movement contract deliberately does not.
    expect(movementContract).not.toMatch(/purchaseOrderId/)
    expect(movementContract).not.toMatch(/orderedQty|ordered_qty/)
    expect(movementContract).toMatch(/ref/)
  })
})

describe('the client still awaits its transport wiring', () => {
  it('procurementApi() is null — agent 11 wires the screen to createProcurementApi next', () => {
    expect(procurementApi()).toBeNull()
  })

  it('the unavailable reason names the missing support, not a vague error', () => {
    const reason = procurementUnavailableReason()
    expect(reason.length).toBeGreaterThan(40)
    expect(reason).toMatch(/API|server/i)
  })
})
