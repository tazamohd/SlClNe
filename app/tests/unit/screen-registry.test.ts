/** The W2 seam: ten domain agents adding screens without meeting in one file.
 *
 *  What is actually being tested is the failure mode, not the happy path. Two
 *  domains claiming one screen name used to be impossible because there was one
 *  table and one author; with ten barrels it is an ordinary mistake, and the
 *  symptom — the screen renders, just not the one its author wrote — is close to
 *  undiagnosable from the browser. It has to fail loudly at composition. */
import { describe, expect, it } from 'vitest'
import { composeScreens, entryOf } from '@/screens/registry'

const A = () => null
const B = () => null
const Shell = ({ children }: { children: React.ReactNode }) => children

describe('composeScreens', () => {
  it('merges domains that claim different screens', () => {
    const merged = composeScreens({ workshop: { JobCards: A }, crm: { Customers: B } })
    expect(Object.keys(merged).sort()).toEqual(['Customers', 'JobCards'])
    expect(merged.JobCards.component).toBe(A)
  })

  it('throws naming both domains when two claim one screen', () => {
    expect(() => composeScreens({ workshop: { Invoices: A }, accounting: { Invoices: B } })).toThrow(
      /Two domains claim the screen "Invoices": workshop and accounting/
    )
  })

  it('names OWNERSHIP.json in the error, because that is where the answer is', () => {
    expect(() => composeScreens({ parts: { Inventory: A }, procurement: { Inventory: B } })).toThrow(
      /OWNERSHIP\.json/
    )
  })

  it('keeps the shell the domain supplied, and distinguishes bare from default', () => {
    const merged = composeScreens({
      portals: { CustomerPortal: { component: A, shell: Shell } },
      website: { 'PublicPortal.Landing': { component: B, shell: null } },
      workshop: { JobCards: A },
    })
    expect(merged.CustomerPortal.shell).toBe(Shell)
    // `null` is "no chrome"; absent is "the operational shell". Collapsing the
    // two would put an AppShell around the landing page.
    expect(merged['PublicPortal.Landing'].shell).toBeNull()
    expect(merged.JobCards.shell).toBeUndefined()
  })

  it('accepts a bare component as shorthand for the common case', () => {
    expect(entryOf(A)).toEqual({ component: A })
    expect(entryOf({ component: A, ungated: true })).toEqual({ component: A, ungated: true })
  })
})
