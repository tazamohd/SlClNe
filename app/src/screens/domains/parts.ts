/** Screens owned by agent 10 — Parts / Inventory.
 *
 *  Stock invariants, reservations and movements: inventory, spare parts, warehouses, the parts marketplace and the parts network.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { InventoryReports } from '../feature/InventoryReports'
import { InventoryManagement } from '../inventory/InventoryManagement'
import { InternalWarehouse } from '../inventory/InternalWarehouse'
import { SparePartsList } from '../parts/SparePartsList'
import { PartsMarketplace } from '../parts/PartsMarketplace'
import { DynamicPricing } from '../parts/DynamicPricing'
import { SuppliersList } from '../parts/SuppliersList'
import { AutomatedReordering } from '../parts/AutomatedReordering'
import { BarcodeScanner } from '../parts/BarcodeScanner'
import { Interactive3DParts } from '../parts/Interactive3DParts'
import { PurchaseOrdersList } from '../parts/PurchaseOrdersList'
import { PartsNetworkDashboardSpec } from '../parts/PartsNetworkDashboardSpec'
import { PartsNetworkMyRequests } from '../parts/PartsNetworkMyRequests'
import { PartsNetworkIncomingRequests } from '../parts/PartsNetworkIncomingRequests'

export const SCREENS: DomainScreens = {
  InventoryReports,
  'Inventory-Management': InventoryManagement,
  'Internal-Warehouse': InternalWarehouse,
  'Spare-Parts': SparePartsList,
  'Parts-Marketplace': PartsMarketplace,
  'Dynamic-Pricing': DynamicPricing,
  Suppliers: SuppliersList,
  'Automated-Reordering': AutomatedReordering,
  'Barcode-Scanner': BarcodeScanner,
  'Interactive-3D-Parts': Interactive3DParts,
  'Purchase-Orders': PurchaseOrdersList,
  'Parts-Network-Dashboard': PartsNetworkDashboardSpec,
  'Parts-Network-My-Requests': PartsNetworkMyRequests,
  'Parts-Network-Incoming-Requests': PartsNetworkIncomingRequests,
}
