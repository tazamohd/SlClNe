/** `scripts/lib/route-shells.mjs` — reading the chrome out of the route table.
 *
 *  The registry used to state the shell from a table of name patterns kept
 *  beside the generator, which says what a surface is *meant* to render in.
 *  That is a different claim from what the router does, and where they differed
 *  the registry was simply wrong: it called the kiosk's chrome `KioskShell`, a
 *  component that has never existed, while the route gave it `PortalShell` and
 *  with it the signed-in operator's name on a public terminal.
 *
 *  Reading the real answer means parsing TSX from a plain node script, so the
 *  parser is pinned here against the shapes `routes/index.tsx` actually uses —
 *  including the one that is easy to get wrong, below.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { routedShells, DEFAULT_SHELL, NO_SHELL } from '../../scripts/lib/route-shells.mjs'

/* Resolved from the vitest root (`app/`) rather than from `import.meta.url`,
 * which the test transform rewrites to a non-file scheme. */
const REAL_ROUTES = readFileSync(resolve(process.cwd(), 'src/routes/index.tsx'), 'utf8')

describe('reading a shell out of the route table', () => {
  it('takes the meta a barrel is given', () => {
    const src = `
      lazyBarrel(() => import('@/screens/domains/portals'), ['CustomerPortal', 'SupplierPortal'], { shell: PortalShell })
    `
    const shells = routedShells(src)
    expect(shells.get('CustomerPortal')).toBe('PortalShell')
    expect(shells.get('SupplierPortal')).toBe('PortalShell')
  })

  it('gives a barrel with no meta the operational shell', () => {
    const shells = routedShells(`lazyBarrel(() => import('@/x'), ['Dashboard'])`)
    expect(shells.get('Dashboard')).toBe(DEFAULT_SHELL)
  })

  it('distinguishes no chrome from the default, because the router does', () => {
    const shells = routedShells(`lazyBarrel(() => import('@/x'), ['KioskCheckIn'], { shell: null })`)
    expect(shells.get('KioskCheckIn')).toBe(NO_SHELL)
    expect(shells.get('KioskCheckIn')).not.toBe(DEFAULT_SHELL)
  })

  it('reads an ungated barrel with no shell as bare, not as the operational shell', () => {
    /* The asymmetry this parser exists to get right. A gated screen goes
     * through `RequireAccess`, whose `resolveShell` turns `undefined` into
     * `AppShell`. An ungated one is rendered by the branch above it, which
     * reads `entry.shell` directly and renders bare when it is falsy. Reading
     * `undefined` as `AppShell` in both places would put an operational
     * sidebar around every page of the sign-up chain in the registry. */
    const shells = routedShells(`lazyBarrel(() => import('@/x'), ['Register'], { ungated: true })`)
    expect(shells.get('Register')).toBe(NO_SHELL)
  })

  it('still honours an explicit shell on an ungated barrel', () => {
    const src = `lazyBarrel(() => import('@/x'), ['PublicPortal.Landing'], { shell: PublicShell, ungated: true })`
    expect(routedShells(src).get('PublicPortal.Landing')).toBe('PublicShell')
  })

  it('expands the legacy maps that asDomain names', () => {
    const src = `
      const APP_SCREENS: Record<string, ComponentType> = {
        Dashboard: lazyNamed(() => import('@/screens/dashboard/Dashboard'), 'Dashboard'),
        'Job-Cards': lazyNamed(() => import('@/screens/workshop/JobCards'), 'JobCards'),
      }
      const PUBLIC_SCREENS: Record<string, ComponentType> = {
        Login: lazyNamed(() => import('@/screens/auth/Login'), 'Login'),
      }
      composeScreens({
        'legacy:app': asDomain(APP_SCREENS, undefined),
        'legacy:auth': asDomain(PUBLIC_SCREENS, null, true),
      })
    `
    const shells = routedShells(src)
    /* Quoted and bare keys both, and the `lazyNamed(…)` values stepped over
     * rather than mistaken for the end of the literal. */
    expect(shells.get('Dashboard')).toBe(DEFAULT_SHELL)
    expect(shells.get('Job-Cards')).toBe(DEFAULT_SHELL)
    expect(shells.get('Login')).toBe(NO_SHELL)
  })

  it('says nothing about a screen the route table never names', () => {
    /* Absent, not defaulted: the registry needs to tell "routed with no chrome"
     * from "no route yet", and a spec screen is the second. */
    expect(routedShells(`lazyBarrel(() => import('@/x'), ['Dashboard'])`).has('Nope')).toBe(false)
  })
})

describe('against the real route table', () => {
  const shells = routedShells(REAL_ROUTES)

  it('reads a shell for the great majority of screens', () => {
    /* A parse that silently stopped matching would show up as a collapse here
     * long before anyone noticed the registry had gone quiet. */
    expect(shells.size).toBeGreaterThan(300)
  })

  it('agrees with the shells the routes visibly declare', () => {
    expect(shells.get('KioskCheckIn')).toBe(NO_SHELL)
    expect(shells.get('CustomerPortal')).toBe('PortalShell')
    expect(shells.get('TechnicianPortal')).toBe('PortalShell')
    expect(shells.get('PublicPortal.Landing')).toBe('PublicShell')
    expect(shells.get('CustomerApp.Home')).toBe('CustomerAppShell')
    expect(shells.get('Login')).toBe(NO_SHELL)
    expect(shells.get('Dashboard')).toBe(DEFAULT_SHELL)
  })

  it('names no shell this repository does not have', () => {
    /* `KioskShell` was in the registry for months. Nothing that is not either a
     * real component or the two sentinels may appear again. */
    const real = new Set([DEFAULT_SHELL, NO_SHELL, 'PortalShell', 'PublicShell', 'CustomerAppShell'])
    expect([...new Set(shells.values())].filter((s) => !real.has(s))).toEqual([])
  })
})
