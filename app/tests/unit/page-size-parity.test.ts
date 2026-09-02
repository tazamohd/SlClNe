/** `MAX_PAGE_SIZE` must equal the cap the API actually enforces.
 *
 *  The app deliberately does not depend on `@salis/contract`, so the ceiling is
 *  transcribed into `data/useCollection.ts`. This test imports the contract
 *  schema directly — tests may, `src/` may not — and asserts the two agree, the
 *  same guard `tests/finance-money.test.ts` puts on the transcribed VAT rule.
 *
 *  It exists because the drift already happened once and was invisible.
 *  `InvoiceDetail`, `InvoicePreview` and `InvoicePrint` asked for `pageSize:
 *  500` against a schema that caps at 200. The server does not clamp an
 *  over-large page — it refuses the request with `bad_request` — and a refused
 *  read reaches the screen as an empty list. So every invoice showed "No line
 *  items" and "No payments yet" beside a subtotal the server had computed
 *  correctly, and after a payment the invoice warned that its own payments did
 *  not add up to its paid figure. Nothing threw, and no test caught it.
 */
import { describe, expect, it } from 'vitest'
import { listQuery } from '../../../packages/contract/src/envelope'
import { MAX_PAGE_SIZE } from '@/data/useCollection'

/** The largest `pageSize` the contract accepts, discovered by asking it rather
 *  than by reading the number out of the source a second time. */
function contractMaxPageSize(): number {
  for (let size = 1; size <= 10_000; size += 1) {
    if (!listQuery.safeParse({ pageSize: size }).success) return size - 1
  }
  throw new Error('listQuery accepted a pageSize of 10000 — is it still capped?')
}

describe('MAX_PAGE_SIZE', () => {
  it('equals the cap the contract enforces', () => {
    expect(MAX_PAGE_SIZE).toBe(contractMaxPageSize())
  })

  it('is accepted by the contract, and one more is refused', () => {
    expect(listQuery.safeParse({ pageSize: MAX_PAGE_SIZE }).success).toBe(true)
    expect(listQuery.safeParse({ pageSize: MAX_PAGE_SIZE + 1 }).success).toBe(false)
  })

  it('is refused rather than clamped, which is why an over-large page reads as empty', () => {
    // The failure mode this whole guard exists for: the server does not quietly
    // reduce an over-large page, it rejects the call. A screen that treats a
    // rejected read as "no rows" then renders an empty table with no error.
    const refused = listQuery.safeParse({ pageSize: 500 })
    expect(refused.success).toBe(false)
  })
})
