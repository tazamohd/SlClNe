/** Warehouse zones (BLK-004) — the physical bays, racks and bins stock is
 *  put away in. `app/src/screens/inventory/InternalWarehouse.tsx` rendered a
 *  hardcoded six-row `ZONES` array whose `capacity`, `utilized` and
 *  `itemCount` were all invented, and then computed its KPIs from that
 *  fabrication; this is the collection those zones are read from instead.
 *
 *  ─── Recorded vs derived, stated once ────────────────────────────────────
 *
 *  A zone row records only what is genuinely a property of the *zone*:
 *  `code`, `name`, `kind`, how much it can hold (`capacityUnits`) and its
 *  lifecycle `status`. It deliberately carries **no** item count and **no**
 *  utilisation percentage. Those are facts about *stock*, not about the zone,
 *  so they are derived by counting the parts actually assigned to the zone
 *  through `parts.zoneCode` (`partCreate.zoneCode`) — a number that cannot
 *  drift from the inventory it describes, because it is that inventory.
 *
 *  `capacityUnits` is the one recorded number, and that is correct: how many
 *  units a bay holds is a property of the bay, which nothing in the stock
 *  ledger could tell you.
 *
 *  Writable through the generic collection router — the same shape
 *  `warrantyCreate`/`warrantyRow` gives `equipmentWarranties`: a flat
 *  directory with one lifecycle move (`active` ⇄ `maintenance`, or `closed`)
 *  and no lines or money behind it. `maintenanceSince` is never accepted as
 *  input, only derived server-side from the status transition
 *  (`server/src/writers.ts`), the same discipline
 *  `equipment_warranties.claimed_at` and `declined_jobs.resolved_at` use.
 */
import { z } from 'zod'
import { nonEmpty } from '../primitives'
import { appRow } from './common'

/** What the zone is for. `receiving`/`shipping` are the bays goods arrive at
 *  and leave from (Golden Path 7); `cold`/`hazmat` are storage under a
 *  handling constraint. */
export const warehouseZoneKind = z.enum(['storage', 'receiving', 'shipping', 'cold', 'hazmat'])
export type WarehouseZoneKind = z.infer<typeof warehouseZoneKind>

/** The zone's own lifecycle. Deliberately **not** `full`: whether a zone is
 *  full is derived from the stock in it against `capacityUnits`, and a
 *  recorded `full` flag would be a second, drifting answer to a question the
 *  inventory already answers. */
export const warehouseZoneStatus = z.enum(['active', 'maintenance', 'closed'])
export type WarehouseZoneStatus = z.infer<typeof warehouseZoneStatus>

export const warehouseZoneCreate = z.object({
  /** `A1` — the code painted on the floor. Server-assigned (`ZN-0001`,
   *  counted within the tenant) when a caller supplies none. */
  code: z.string().max(16).optional(),
  name: nonEmpty.max(120),
  nameAr: z.string().max(120).optional(),
  kind: warehouseZoneKind.optional(),
  /** How many stock units the zone can hold — recorded, because nothing in
   *  the ledger knows the size of a bay. Zero means "not measured", and the
   *  screen shows no percentage for such a zone rather than dividing by it. */
  capacityUnits: z.number().int().min(0).max(1_000_000).optional(),
  status: warehouseZoneStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type WarehouseZoneCreate = z.infer<typeof warehouseZoneCreate>

/** `code` is omitted: a zone's code is painted on the floor and referenced by
 *  every part assigned to it (`parts.zone_code`), so it is not renamed by a
 *  PATCH. */
export const warehouseZoneUpdate = warehouseZoneCreate.partial().omit({ code: true })
export type WarehouseZoneUpdate = z.infer<typeof warehouseZoneUpdate>

export const warehouseZoneRow = appRow({
  /** The zone code — the business identifier the design showed. */
  id: z.string(),
  code: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  kind: warehouseZoneKind,
  capacityUnits: z.number().int().min(0),
  status: warehouseZoneStatus,
  /** Null unless the zone is under maintenance; derived from the transition,
   *  never posted. */
  maintenanceSince: z.string().nullable(),
  notes: z.string().nullable(),
})
export type WarehouseZoneRow = z.infer<typeof warehouseZoneRow>
