/** Departments — the org-structure directory `server/src/db/schema.ts`'s
 *  `departments` table holds (`DATA_MODEL.md` §Departments). Read by
 *  Staff-Directory/HR-Management (`app/src/screens/hr/StaffDirectory.tsx`) to
 *  label an employee's department, and managed from the Departments screen
 *  (`app/src/screens/accounting/Accounting.tsx`)'s "Add Department" form
 *  (`app/src/screens/accounting/DepartmentFormModal.tsx`).
 *
 *  `headcount` is accepted rather than derived: nothing links an employee row
 *  to a department id yet (`employees.departmentId` is a free column, not a
 *  foreign key any write path resolves), so there is no count to compute it
 *  from — same honest-gap reasoning as `fleets`' `vehicleCount` would use if
 *  it *couldn't* be derived. A future join replaces this rather than papering
 *  over it with a client-supplied number pretending to be authoritative.
 */
import { z } from 'zod'
import { nonEmpty } from '../primitives'

export const departmentCreate = z.object({
  name: nonEmpty.max(200),
  head: z.string().max(200).optional(),
  headcount: z.number().int().min(0).max(100_000).default(0),
  costCenter: z.string().max(40).optional(),
  branchLabel: z.string().max(160).optional(),
  icon: z.string().max(64).optional(),
})

export const departmentUpdate = departmentCreate.partial()

export type DepartmentCreate = z.infer<typeof departmentCreate>
export type DepartmentUpdate = z.infer<typeof departmentUpdate>
