/** The chrome a screen actually gets, against the chrome its domain asked for.
 *
 *  `screen-registry.test.ts` proves `composeScreens` keeps the shell a domain
 *  supplies. That is true and was never the problem: almost nothing reaches
 *  `composeScreens` with the barrel's own entry. `routes/index.tsx` wraps each
 *  barrel in `lazyBarrel`, which reads `.component` and nothing else, then
 *  applies one `meta` to every name in the list. A `shell` written beside a
 *  component in a barrel is therefore discarded without a word.
 *
 *  It cost the kiosk. `domains/portals.ts` declares `KioskCheckIn` as
 *  `shell: null`, its docstring says it renders fullscreen with no chrome, and
 *  the screen registry records it as its own surface — and it drew
 *  `PortalShell` anyway, which on a public terminal shows the signed-in
 *  operator's name, their role and a Logout button to whoever walks up.
 *
 *  So this compares the two declarations directly. It is not about the kiosk:
 *  any barrel that states a shell the route table then contradicts fails here,
 *  which is the only way the barrel's `shell` field means anything.
 */
import { describe, expect, it } from 'vitest'
import { SCREEN_ENTRIES } from '@/routes'
import { entryOf, type DomainScreens } from '@/screens/registry'
import * as portals from '@/screens/domains/portals'
import * as website from '@/screens/domains/website'
import * as workshop from '@/screens/domains/workshop'
import * as accounting from '@/screens/domains/accounting'
import * as crm from '@/screens/domains/crm'
import * as hr from '@/screens/domains/hr'
import * as parts from '@/screens/domains/parts'
import * as procurement from '@/screens/domains/procurement'
import * as insurance from '@/screens/domains/insurance'
import * as ai from '@/screens/domains/ai'

const BARRELS: Record<string, { SCREENS: DomainScreens }> = {
  portals,
  website,
  workshop,
  accounting,
  crm,
  hr,
  parts,
  procurement,
  insurance,
  ai,
}

describe('the shell a screen renders in', () => {
  it('is the one its domain barrel declares, for every screen that declares one', () => {
    const contradicted: string[] = []
    for (const [domain, barrel] of Object.entries(BARRELS)) {
      for (const [name, value] of Object.entries(barrel.SCREENS)) {
        /* A bare component says nothing about chrome and takes the route
         * table's default. Only an explicit object form is a claim. */
        if (typeof value === 'function') continue
        const declared = entryOf(value).shell
        if (!('shell' in entryOf(value))) continue

        const routed = SCREEN_ENTRIES[name]
        if (!routed) continue // not routed yet; `screen-registry` covers that
        if (routed.shell !== declared) {
          contradicted.push(
            `${domain}/${name}: barrel says ${String(declared?.name ?? declared)}, ` +
              `routes give ${String(routed.shell?.name ?? routed.shell)}`,
          )
        }
      }
    }
    expect(contradicted).toEqual([])
  })

  it('leaves the kiosk bare, because its terminal is public', () => {
    /* Named on its own as well as covered by the sweep above: this is the case
     * that has to keep holding, and a reader should not have to reconstruct it
     * from a generic assertion. `null` is "no chrome"; `undefined` would be the
     * operational shell, which is a different and wrong answer. */
    expect(SCREEN_ENTRIES.KioskCheckIn).toBeDefined()
    expect(SCREEN_ENTRIES.KioskCheckIn.shell).toBeNull()
  })

  it('still puts the actual portals in PortalShell', () => {
    /* The negative control for the change that made the kiosk bare: pulling one
     * name out of the portals barrel must not have taken its neighbours with
     * it. */
    for (const name of ['CustomerPortal', 'CustomerPortal.Booking', 'TechnicianPortal']) {
      expect(SCREEN_ENTRIES[name]?.shell, name).toBeTruthy()
    }
  })
})
