/** Screens owned by agent 11 — Procurement.
 *
 *  Requisitions, purchase orders, receiving and supplier management, each transition checked against the approval ceiling.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { PurchaseOrder } from '../network/ProcurementPurchaseOrder'

export const SCREENS: DomainScreens = {
  PurchaseOrder,
}
