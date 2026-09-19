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
import { PortalShell } from '@/components/shell/PortalShell'
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

  it('puts the procurement portal in PortalShell, not the operational AppShell (F-024)', () => {
    /* F-009/F-024: these two render AppShell despite the registry recording
     * PortalShell, because PortalShell did not exist yet when they were
     * built. It exists now — `routes/index.tsx` splits them out of
     * APP_SCREENS into their own `asDomain(..., PortalShell)` entry rather
     * than moving the whole map's default shell. */
    for (const name of ['ProcurementPortal', 'ProcurementPortal.Requisitions']) {
      expect(SCREEN_ENTRIES[name]?.shell, name).toBe(PortalShell)
    }
  })

  it('routes every screen name a domain barrel declares', () => {
    /* `lazyBarrel` composes `SCREEN_ENTRIES` from an EXPLICIT array of screen
     * names per domain, written once in `routes/index.tsx` — not from the
     * barrel module's own export keys. A name present in a barrel's `SCREENS`
     * but missing from that array renders `PendingScreen` at runtime even
     * though the registry marks it IMPLEMENTED, which nothing above this
     * catches (the previous test explicitly skips a name `routes/index.tsx`
     * hasn't routed yet, deferring to `screen-registry.test.ts` — which only
     * unit-tests `composeScreens` against fake fixture data, not any real
     * barrel). This bit twice in one session — Voice-Commands/Voice-Command-
     * Interface in the `ai` domain, then five new PublicPortal screens in
     * `website` — both times caught only by the much slower Playwright smoke
     * suite. This is the fast, unit-level guard for the same defect class. */
    const missing: string[] = []
    for (const [domain, barrel] of Object.entries(BARRELS)) {
      for (const name of Object.keys(barrel.SCREENS)) {
        if (!SCREEN_ENTRIES[name]) missing.push(`${domain}/${name}`)
      }
    }
    expect(missing).toEqual([])
  })
})
