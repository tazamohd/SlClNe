/** Screens owned by agent 16 — Portals.
 *
 *  Customer, technician and supplier portals, the call centre, the kiosk, the customer phone app and the native frames.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { PortalShell } from '@/components/shell/PortalShell'
import { TechnicianPortal } from '../portals/TechnicianPortal'
import { TechnicianPortalJobDetail } from '../portals/TechnicianPortalJobDetail'
import { CustomerPortal } from '../portals/CustomerPortal'
import { CustomerPortalBooking } from '../portals/CustomerPortalBooking'
import { SupplierPortal } from '../portals/SupplierPortal'
import { SupplierPortalOrders } from '../portals/SupplierPortalOrders'
import { KioskCheckIn } from '../portals/KioskCheckIn'

export const SCREENS: DomainScreens = {
  TechnicianPortal: { component: TechnicianPortal, shell: PortalShell },
  'TechnicianPortal.JobDetail': { component: TechnicianPortalJobDetail, shell: PortalShell },
  CustomerPortal: { component: CustomerPortal, shell: PortalShell },
  'CustomerPortal.Booking': { component: CustomerPortalBooking, shell: PortalShell },
  SupplierPortal: { component: SupplierPortal, shell: PortalShell },
  'SupplierPortal.Orders': { component: SupplierPortalOrders, shell: PortalShell },
  'Kiosk-Check-In': { component: KioskCheckIn, shell: null },
}
