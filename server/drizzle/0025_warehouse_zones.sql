-- Warehouse zones (BLK-004). The physical bays, racks and bins stock is put
-- away in. `app/src/screens/inventory/InternalWarehouse.tsx` rendered a
-- hardcoded six-row `ZONES = [...]` array — every `capacity`, `utilized` and
-- `itemCount` invented — and then computed its four KPIs *from* that
-- fabrication, so the arithmetic was internally consistent and every input was
-- made up. This table, plus `parts.zone_code` below, is what it reads instead.
--
-- ─── Recorded vs derived, decided here rather than left implicit ───────────
--
-- This table records only what is genuinely a property of the **zone**: its
-- code, name, what it is for, how much it can hold, and whether it is in
-- service. It deliberately carries **no item count and no utilisation
-- percentage**.
--
-- Those are facts about **stock**, not about the bay, so they are derived:
-- `parts.zone_code` says which zone each part is stored in, and a zone's item
-- count is the number of parts assigned to it while its stored quantity is the
-- sum of their `on_hand`. Utilisation is that quantity over `capacity_units`.
-- A derived number cannot drift from the inventory it describes, because it
-- *is* that inventory; a recorded `item_count` column would have been a second
-- answer to a question the stock ledger already answers, and would have been
-- wrong the first time a part moved.
--
-- `capacity_units` is the one recorded number on the row, and that is correct
-- rather than a compromise: how many units a bay holds is a property of the
-- bay, and nothing in the ledger could tell you. A zone with
-- `capacity_units = 0` is "not measured", and the screen shows no percentage
-- for it rather than dividing by zero.
--
-- `status` is `active` / `maintenance` / `closed` and never `full`, for the
-- same reason: fullness is derived from the stock actually in the zone.
-- `maintenance_since` is written from the status transition in
-- `server/src/writers.ts`, never accepted as input — the discipline
-- `equipment_warranties.claimed_at` and `declined_jobs.resolved_at` use.
--
-- Scope, stated plainly: a part sits in exactly one zone, and its whole
-- `on_hand` is counted there. Splitting one SKU's quantity across several bins
-- would need a `(part, zone, qty)` table and a rule tying the sum of those
-- quantities to `parts.on_hand` — a real invariant, and a bigger change than
-- this one. `InternalWarehouse.tsx` says "one zone per part" on the screen
-- rather than implying a bin-level model it does not have.

CREATE TABLE IF NOT EXISTS "warehouse_zones" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_ar" varchar(120),
	"kind" varchar(16) DEFAULT 'storage' NOT NULL,
	"capacity_units" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"maintenance_since" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- A unique *constraint*, not merely a unique index, because `parts.zone_code`
-- references these two columns: Postgres accepts only a constraint as the
-- target of a foreign key. The constraint creates the index
-- `schema.ts`'s `uniqueIndex('warehouse_zones_org_code_idx')` names, so the two
-- descriptions of the table agree.
DO $$ BEGIN
  ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_org_code_idx" UNIQUE ("org_id","code");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "warehouse_zones_org_idx" ON "warehouse_zones" ("org_id","branch_id","status");
--> statement-breakpoint
-- The zone reference on stock. By code rather than by id: the code is what is
-- painted on the floor and what a screen groups on, and a composite foreign
-- key `(org_id, zone_code)` → `warehouse_zones (org_id, code)` makes it a real
-- reference anyway — same-tenant by construction, since `org_id` is part of
-- the key, so a part can never point at another organization's bay. `ON
-- DELETE restrict` because a bay that still holds stock is not a bay you can
-- delete; empty it first.
ALTER TABLE "parts" ADD COLUMN IF NOT EXISTS "zone_code" varchar(16);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts" ADD CONSTRAINT "parts_zone_code_warehouse_zones_fk"
    FOREIGN KEY ("org_id","zone_code") REFERENCES "public"."warehouse_zones"("org_id","code") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_org_zone_idx" ON "parts" ("org_id","zone_code");
--> statement-breakpoint
-- RLS, written out literally rather than in a `DO $$ ... EXECUTE format(...)`
-- loop: `tools/docs/check.mjs`'s coverage check reads these statements as
-- text, and a looped policy is invisible to it even though Postgres applies it
-- correctly. Identical discipline to 0017/0022/0023/0024: tenant isolation
-- permissive (platform sees all, everyone else only their own org), branch
-- narrowing restrictive, and `self` — a customer on the portal — denied
-- outright, since where this workshop racks its stock is none of a customer's
-- business.
--> statement-breakpoint
ALTER TABLE "warehouse_zones" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "warehouse_zones" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "warehouse_zones" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "warehouse_zones" AS RESTRICTIVE FOR ALL
  USING (
    app_scope() NOT IN ('branch','own','self','assigned','external')
    OR branch_id IS NULL
    OR branch_id = app_branch()
  )
  WITH CHECK (
    app_scope() NOT IN ('branch','own','self','assigned','external')
    OR branch_id IS NULL
    OR branch_id = app_branch()
  );
--> statement-breakpoint
CREATE POLICY r_self ON "warehouse_zones" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER warehouse_zones_bump_version BEFORE UPDATE ON "warehouse_zones"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
