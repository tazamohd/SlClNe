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
import { ClientPortalDashboard } from '../portals/client/ClientPortalDashboard'
import { ClientPortalVehicles } from '../portals/client/ClientPortalVehicles'
import { ClientPortalAppointments } from '../portals/client/ClientPortalAppointments'
import { ClientPortalInvoices } from '../portals/client/ClientPortalInvoices'
import { ClientPortalProfile } from '../portals/client/ClientPortalProfile'
import { ClientPortalServiceHistory } from '../portals/client/ClientPortalServiceHistory'
import { ClientPortalLiveTracking } from '../portals/client/ClientPortalLiveTracking'
import { ClientPortalReminders } from '../portals/client/ClientPortalReminders'
import { ClientPortalReviewChat } from '../portals/client/ClientPortalReviewChat'
import { TechnicianPortalDashboard } from '../portals/technician/TechnicianPortalDashboard'
import { TechnicianPortalMyJobs } from '../portals/technician/TechnicianPortalMyJobs'
import { TechnicianPortalTimeClock } from '../portals/technician/TechnicianPortalTimeClock'
import { TechnicianPortalParts } from '../portals/technician/TechnicianPortalParts'
import { TechnicianPortalDocumentation } from '../portals/technician/TechnicianPortalDocumentation'
import { TechnicianPortalProfile } from '../portals/technician/TechnicianPortalProfile'
import { TechnicianPortalAttendance } from '../portals/technician/TechnicianPortalAttendance'
import { TechnicianPortalGuides } from '../portals/technician/TechnicianPortalGuides'
import { TechnicianPortalSoftware } from '../portals/technician/TechnicianPortalSoftware'
import { TechnicianMobile } from '../portals/technician/TechnicianMobile'
import { TechnicianAppHome } from '../portals/technician/TechnicianAppHome'
import { TechnicianAppJobs } from '../portals/technician/TechnicianAppJobs'
import { TechnicianAppClock } from '../portals/technician/TechnicianAppClock'
import { TechnicianAppLookup } from '../portals/technician/TechnicianAppLookup'
import { TechnicianAppProfile } from '../portals/technician/TechnicianAppProfile'
import { PurchaseAgentDashboard } from '../portals/purchase/PurchaseAgentDashboard'
import { PurchaseAgentTasks } from '../portals/purchase/PurchaseAgentTasks'
import { PurchaseAgentQuotations } from '../portals/purchase/PurchaseAgentQuotations'
import { PurchaseAgentPayments } from '../portals/purchase/PurchaseAgentPayments'
import { PurchaseAgentDelivery } from '../portals/purchase/PurchaseAgentDelivery'
import { PurchaseAgentOrders } from '../portals/purchase/PurchaseAgentOrders'
import { PurchaseAgentSuppliers } from '../portals/purchase/PurchaseAgentSuppliers'
import { PurchaseAgentInventory } from '../portals/purchase/PurchaseAgentInventory'
import { PurchaseAgentPriceCompare } from '../portals/purchase/PurchaseAgentPriceCompare'
import { PurchaseAgentTracking } from '../portals/purchase/PurchaseAgentTracking'
import { PurchaseAgentReports } from '../portals/purchase/PurchaseAgentReports'
import { VendorSupplierPortal } from '../portals/vendor/VendorSupplierPortal'
import { PortalDashboard } from '../portals/misc/PortalDashboard'
import { PortalAppointments } from '../portals/misc/PortalAppointments'
import { PortalInvoices } from '../portals/misc/PortalInvoices'
import { PortalVehicles } from '../portals/misc/PortalVehicles'
import { PortalCommunications } from '../portals/misc/PortalCommunications'
import { CustomerAppBooking } from '../customer-app/CustomerAppBooking'
import { CustomerAppVehicles } from '../customer-app/CustomerAppVehicles'
import { CustomerAppPayments } from '../customer-app/CustomerAppPayments'

export const SCREENS: DomainScreens = {
  TechnicianPortal: { component: TechnicianPortal, shell: PortalShell },
  'TechnicianPortal.JobDetail': { component: TechnicianPortalJobDetail, shell: PortalShell },
  CustomerPortal: { component: CustomerPortal, shell: PortalShell },
  'CustomerPortal.Booking': { component: CustomerPortalBooking, shell: PortalShell },
  SupplierPortal: { component: SupplierPortal, shell: PortalShell },
  'SupplierPortal.Orders': { component: SupplierPortalOrders, shell: PortalShell },
  'Kiosk-Check-In': { component: KioskCheckIn, shell: null },
  'Client-Portal-Dashboard': { component: ClientPortalDashboard, shell: PortalShell },
  'Client-Portal-Vehicles': { component: ClientPortalVehicles, shell: PortalShell },
  'Client-Portal-Appointments': { component: ClientPortalAppointments, shell: PortalShell },
  'Client-Portal-Invoices': { component: ClientPortalInvoices, shell: PortalShell },
  'Client-Portal-Profile': { component: ClientPortalProfile, shell: PortalShell },
  'Client-Portal-Service-History': { component: ClientPortalServiceHistory, shell: PortalShell },
  'Client-Portal-Live-Tracking': { component: ClientPortalLiveTracking, shell: PortalShell },
  'Client-Portal-Reminders': { component: ClientPortalReminders, shell: PortalShell },
  'Client-Portal-Review-Chat': { component: ClientPortalReviewChat, shell: PortalShell },
  'Technician-Portal-Dashboard': { component: TechnicianPortalDashboard, shell: PortalShell },
  'Technician-Portal-My-Jobs': { component: TechnicianPortalMyJobs, shell: PortalShell },
  'Technician-Portal-Time-Clock': { component: TechnicianPortalTimeClock, shell: PortalShell },
  'Technician-Portal-Parts': { component: TechnicianPortalParts, shell: PortalShell },
  'Technician-Portal-Documentation': { component: TechnicianPortalDocumentation, shell: PortalShell },
  'Technician-Portal-Profile': { component: TechnicianPortalProfile, shell: PortalShell },
  'Technician-Portal-Attendance': { component: TechnicianPortalAttendance, shell: PortalShell },
  'Technician-Portal-Guides': { component: TechnicianPortalGuides, shell: PortalShell },
  'Technician-Portal-Software': { component: TechnicianPortalSoftware, shell: PortalShell },
  'Technician-Mobile': { component: TechnicianMobile, shell: PortalShell },
  'Technician-App-Home': { component: TechnicianAppHome, shell: PortalShell },
  'Technician-App-Jobs': { component: TechnicianAppJobs, shell: PortalShell },
  'Technician-App-Clock': { component: TechnicianAppClock, shell: PortalShell },
  'Technician-App-Lookup': { component: TechnicianAppLookup, shell: PortalShell },
  'Technician-App-Profile': { component: TechnicianAppProfile, shell: PortalShell },
  'Purchase-Agent-Dashboard': { component: PurchaseAgentDashboard, shell: PortalShell },
  'Purchase-Agent-Tasks': { component: PurchaseAgentTasks, shell: PortalShell },
  'Purchase-Agent-Quotations': { component: PurchaseAgentQuotations, shell: PortalShell },
  'Purchase-Agent-Payments': { component: PurchaseAgentPayments, shell: PortalShell },
  'Purchase-Agent-Delivery': { component: PurchaseAgentDelivery, shell: PortalShell },
  'Purchase-Agent-Orders': { component: PurchaseAgentOrders, shell: PortalShell },
  'Purchase-Agent-Suppliers': { component: PurchaseAgentSuppliers, shell: PortalShell },
  'Purchase-Agent-Inventory': { component: PurchaseAgentInventory, shell: PortalShell },
  'Purchase-Agent-Price-Compare': { component: PurchaseAgentPriceCompare, shell: PortalShell },
  'Purchase-Agent-Tracking': { component: PurchaseAgentTracking, shell: PortalShell },
  'Purchase-Agent-Reports': { component: PurchaseAgentReports, shell: PortalShell },
  'Vendor-Supplier-Portal': { component: VendorSupplierPortal, shell: PortalShell },
  'Portal-Dashboard': { component: PortalDashboard, shell: PortalShell },
  'Portal-Appointments': { component: PortalAppointments, shell: PortalShell },
  'Portal-Invoices': { component: PortalInvoices, shell: PortalShell },
  'Portal-Vehicles': { component: PortalVehicles, shell: PortalShell },
  'Portal-Communications': { component: PortalCommunications, shell: PortalShell },
  'Customer-App-Booking': { component: CustomerAppBooking, shell: PortalShell },
  'Customer-App-Vehicles': { component: CustomerAppVehicles, shell: PortalShell },
  'Customer-App-Payments': { component: CustomerAppPayments, shell: PortalShell },
}
