/** Screens owned by agent 09 — Customers / CRM.
 *
 *  Customers, vehicles, fleets and their detail pages; leads, opportunities, campaigns, segments and CRM tasks.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { CustomerDetail } from '../registry/CustomerDetail'
import { VehicleDetail } from '../registry/VehicleDetail'
import { CustomerFeedback } from '../registry/CustomerFeedback'
import { FleetContract } from '../registry/FleetContract'
import { LeadDetail } from '../crm/LeadDetail'
import { CRMCalendar } from '../crm/CRMCalendar'
import { CustomersList } from '../crm/CustomersList'

export const SCREENS: DomainScreens = {
  CustomerDetail,
  VehicleDetail,
  CustomerFeedback,
  FleetContract,
  LeadDetail,
  CRMCalendar,
  'Customers-List': CustomersList,
}
