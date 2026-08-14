-- F-017: a transfer must not take stock off the organization's books. The
-- route now writes the paired credit row in the same transaction as the
-- debit; `transfer_id` is the shared identifier that makes the pairing
-- provable from the ledger rather than inferred from timestamps.
--> statement-breakpoint
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS transfer_id varchar(26);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS inventory_movements_transfer_idx
  ON inventory_movements (org_id, transfer_id) WHERE transfer_id IS NOT NULL;

--> statement-breakpoint
-- Branches are the organization's directory, not row-scoped data: a
-- branch-scoped storekeeper has to be able to *name* a transfer destination,
-- which the generic r_branch narrowing made impossible (each branches row
-- carries its own id as branch_id, so a branch-scoped user saw only their own
-- branch). Tenant isolation (p_tenant) still applies unchanged; only the
-- branch narrowing is lifted, and only on this table.
DROP POLICY IF EXISTS r_branch ON branches;
