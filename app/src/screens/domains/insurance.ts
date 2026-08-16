/** Screens owned by agent 13 — Insurance / Fleet / Loans.
 *
 *  Policies, claims, fleet contracts and the loan lifecycle.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { InsuranceClaims } from '../insurance/InsuranceClaims'

/** The `Insurance-Claims` feature-map screen (route `/insurance-claims`),
 *  graduated from the placeholder to the real workspace. Keyed by the exact
 *  registry name so the router's spec-screen branch renders it in place of the
 *  kit. A bare component, so it renders in the operational shell. */
export const SCREENS: DomainScreens = {
  'Insurance-Claims': InsuranceClaims,
}
