import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { procurementApi, procurementUnavailableReason } from '@/screens/network/Procurement'

/** The procurement server gaps, pinned.
 *
 *  Wave W2 tranche 2 asked for the requisition lifecycle, purchase-order raise
 *  and approve within the ceiling, and receiving against the order. The server
 *  supports **none** of it: there is no procurement collection, no route, no
 *  seed row. Faking any step client-side is the §60 violation this project
 *  exists to kill, so the screens render the capability absent and each `GAP:`
 *  test below pins the exact missing endpoint by asserting its absence in the
 *  server source.
 *
 *  These tests are ratchets in reverse: **when agent 05 lands an endpoint, the
 *  matching test fails**, which is the signal to write the HTTP transport in
 *  `screens/network/Procurement.tsx` (`procurementApi`) and delete the pin.
 *  None of them asserts a guarantee the code does not have.
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

describe('GAP: requisitions do not exist server-side', () => {
  it('GAP: no `requisitions` collection is registered — GET/POST /procurement/requisitions, PATCH /procurement/requisitions/:id and POST /procurement/requisitions/:id/decide are all missing', () => {
    expect(registry).not.toMatch(/key:\s*'requisitions'/)
    expect(registry).not.toMatch(/path:\s*'procurement\/requisitions'/)
  })

  it('GAP: there is not even a requisitions table in the schema — storage and endpoints are both owed', () => {
    expect(schema).not.toMatch(/pgTable\(\s*'requisitions'/)
  })
})

describe('GAP: purchase orders are stored but unreachable', () => {
  it('the schema HAS purchase_orders and purchase_order_lines, with received_qty ready for receiving', () => {
    // The gap is exposure, not storage: the tables exist, carry submittedBy /
    // approvedBy for the SOD pair and receivedQty for the receiving invariant,
    // and sit in the RLS list. Nothing serves them.
    expect(schema).toMatch(/pgTable\(\s*'purchase_orders'/)
    expect(schema).toMatch(/pgTable\(\s*'purchase_order_lines'/)
    expect(schema).toMatch(/received_qty/)
    expect(schema).toMatch(/'purchase_orders',\s*\n\s*'purchase_order_lines'/)
  })

  it('GAP: no `purchaseOrders` collection is registered — GET/POST /procurement/purchase-orders is missing', () => {
    expect(registry).not.toMatch(/key:\s*'purchaseOrders'/)
    expect(registry).not.toMatch(/purchase-orders/)
  })

  it('GAP: no route module touches procurement — POST /procurement/purchase-orders/:id/approve (ceiling + SOD) and POST /procurement/purchase-orders/:id/receive (received ≤ ordered) are missing', () => {
    expect(routeFiles).not.toContain('procurement.ts')
    for (const file of routeFiles) {
      expect(read(`server/src/routes/${file}`)).not.toMatch(/procurement/i)
    }
    expect(appTs).not.toMatch(/[Pp]rocurement/)
  })
})

describe('GAP: the server itself declares the SOD activities unwired', () => {
  it('sod.ts lists all four procurement activities as having no route to write their audit rows', () => {
    // The activity names come from the SOD table; the server keeps an UNWIRED
    // note per activity. When any of these disappears from sod.ts a route has
    // started writing the audit row — wire the screen to it.
    for (const activity of [
      'Raise purchase order',
      'Approve purchase order',
      'Create supplier',
      'Approve supplier payment',
    ]) {
      expect(sod).toContain(`'${activity}'`)
    }
    expect(sod).toMatch(/no purchase-order route writes an audit row yet/)
    expect(sod).toMatch(/no purchase-order approval route exists yet/)
    expect(sod).toMatch(/suppliers are not a server-side entity yet/)
    expect(sod).toMatch(/no supplier-payment approval route exists yet/)
  })
})

describe('GAP: the inventory movement endpoint cannot stand in for receiving', () => {
  it('movementCreate carries no ordered quantity or purchase-order link, so "received ≤ ordered" is unenforceable there', () => {
    // POST /inventory/:id/movement books stock in, but its contract has only a
    // free-text `ref` — no purchaseOrderId, no ordered quantity to check
    // against. Routing PO receiving through it would accept any over-receipt
    // silently, which is exactly what the invariant forbids. Receiving needs
    // its own endpoint that loads the PO line and checks received_qty.
    expect(movementContract).not.toMatch(/purchaseOrderId/)
    expect(movementContract).not.toMatch(/orderedQty|ordered_qty/)
    expect(movementContract).toMatch(/ref/)
  })
})

describe('the client says all of this out loud', () => {
  it('procurementApi() is null — there is nothing to point a transport at', () => {
    expect(procurementApi()).toBeNull()
  })

  it('the unavailable reason names the missing server support, not a vague error', () => {
    const reason = procurementUnavailableReason()
    expect(reason.length).toBeGreaterThan(40)
    expect(reason).toMatch(/API|server/i)
  })
})
