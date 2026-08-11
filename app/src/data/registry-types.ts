/** Types for the generated capability registry.
 *
 *  Hand-written, like `types.ts` — the generated file is checked against these,
 *  so a change in the generator that breaks a shape fails typecheck rather than
 *  failing silently wherever routes and tests read it. */

/** How complete a dimension is. `PARTIAL` means the screen renders that
 *  dimension but nobody has verified it; `VERIFIED` requires evidence. */
export type Coverage = 'MISSING' | 'PARTIAL' | 'DONE' | 'VERIFIED' | 'N/A'

/** What the release gates expect of a capability.
 *  - `PRODUCT` must satisfy the full Definition of Done.
 *  - `REFERENCE_ONLY` is a live pattern gallery or spec rendering, not a product
 *    screen — real, but exempt from product rules.
 *  - `EXTERNAL_DEPENDENCY` ships UI, adapter and failure states, but cannot show
 *    real data until a credential, device or service exists. Its blocker names
 *    the dependency.
 *  - `NOT_IN_SCOPE` is deliberately excluded, with the reason recorded. */
export type Category = 'PRODUCT' | 'REFERENCE_ONLY' | 'EXTERNAL_DEPENDENCY' | 'NOT_IN_SCOPE'

export type Surface =
  | 'app' | 'auth' | 'portal' | 'customer-app' | 'public' | 'kiosk' | 'native'
  | 'call-center' | 'reference'

/** `A-designed` reproduces a `.Mobile.dc.html`; `B-responsive` is designed from
 *  the system because no mobile design exists. Conflating the two produces the
 *  wrong output for both. */
export type MobileType = 'A-designed' | 'B-responsive' | 'native-frame' | 'N/A'

/** Progression, not a boolean. `IMPLEMENTED` only means a real component
 *  renders — it is the floor, not the Definition of Done. */
export type CapabilityStatus =
  | 'DISCOVERED' | 'PLANNED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'DATA_BACKED'
  | 'TESTED' | 'VISUAL_VERIFIED' | 'PRODUCTION_READY'
  | 'BLOCKED' | 'REFERENCE_ONLY' | 'DEPRECATED' | 'REDIRECT'

/** Computed by the generator, never authored. These are the queries that a
 *  hardcoded screen count hides. */
export type RegistryFlag =
  | 'PLACEHOLDER' | 'DUPLICATE' | 'ORPHANED' | 'UNREGISTERED' | 'UNTESTED'
  | 'DESKTOP_ONLY' | 'MOBILE_MISSING' | 'TABLET_MISSING'
  | 'ARABIC_MISSING' | 'RTL_BROKEN' | 'MOCK_ONLY' | 'NO_RBAC_MODULE'

/** The slice of the registry the app itself reads. The full record — coverage
 *  per dimension, CRUD, tests, evidence — lives in
 *  `project-control/MASTER_REGISTRY.json`, which the release gates read. */
export interface RegistryEntry {
  screenId: string
  name: string
  title: string
  route: string
  surface: Surface
  shell: string
  module: string | null
  category: Category
  domain: string
  /** Owning agent id from `project-control/OWNERSHIP.json`. */
  owner: string
  mobileType: MobileType
  status: CapabilityStatus
  flags: RegistryFlag[]
  /** Whether the sidebar reaches it. A product capability with no nav entry and
   *  no inbound link is unreachable however well it renders. */
  inNav: boolean
  designSource: string | null
  designMobileSource: string | null
  featureMapSource: string | null
}
