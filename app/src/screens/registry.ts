/** Where each domain declares the screens it has built.
 *
 *  `routes/index.tsx` held three hand-maintained maps of every screen in the
 *  product. That is fine while one person edits it, and the wrong shape for ten
 *  domain agents working at once: every one of them would add lines to the same
 *  three objects in the same file. The dependency graph names that file as the
 *  worst place in the repository to have contention, so this removes it from the
 *  contention set entirely.
 *
 *  Each domain owns a barrel under `screens/domains/` that nobody else edits,
 *  and this composes them. Adding a domain is one import, written once by the
 *  orchestrator.
 *
 *  A screen's chrome is a component the domain supplies, not a name resolved
 *  from a central table — because `PortalShell`, `PublicShell` and `KioskShell`
 *  do not exist yet, and a table listing them would be a second file two agents
 *  had to edit at the same time to build them. The domain that builds a shell
 *  imports it in its own barrel.
 */
import type { ComponentType, ReactNode } from 'react'

/** Chrome a screen renders inside: anything that takes children. */
export type Shell = ComponentType<{ children: ReactNode }>

export interface ScreenEntry {
  component: ComponentType
  /** Omit for the operational shell. `null` renders the screen bare, which is
   *  what the unauthenticated chain and the terminal states want. */
  shell?: Shell | null
  /** Skip the permission check. Only for screens that are genuinely public —
   *  the auth chain and the error pages. Everything else is gated. */
  ungated?: boolean
}

/** A domain's contribution, keyed by the screen name the registry uses. A bare
 *  component is the common case; the object form says something about chrome. */
export type DomainScreens = Record<string, ScreenEntry | ComponentType>

export function entryOf(value: ScreenEntry | ComponentType): ScreenEntry {
  return typeof value === 'function' ? { component: value } : value
}

/** Merges the domain barrels, refusing to let two of them claim one screen.
 *
 *  A silent overwrite would be near-impossible to diagnose from the symptom:
 *  the screen renders, just not the one its author wrote. */
export function composeScreens(
  domains: Record<string, DomainScreens>
): Record<string, ScreenEntry> {
  const merged: Record<string, ScreenEntry> = {}
  const claimedBy: Record<string, string> = {}

  for (const [domain, screens] of Object.entries(domains)) {
    for (const [name, value] of Object.entries(screens)) {
      const previous = claimedBy[name]
      if (previous) {
        throw new Error(
          `Two domains claim the screen "${name}": ${previous} and ${domain}. ` +
            `One is building something the other already owns — check ` +
            `project-control/OWNERSHIP.json before deciding which.`
        )
      }
      claimedBy[name] = domain
      merged[name] = entryOf(value)
    }
  }
  return merged
}
