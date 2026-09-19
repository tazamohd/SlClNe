-- Equipment warranties (BLK-004). Cover on the shop's own tools and fixed
-- assets — a lift, a scanner, a paint booth — not a customer's vehicle. A
-- flat, writable directory like `suppliers`: create, edit, delete, and one
-- lifecycle move (active -> claimed) through the generic router, gated on
-- `accounting:c/e/d`. Same universal columns, RLS + version-bump discipline
-- every tenant table gets since 0001/0010: tenant isolation permissive
-- (platform sees all, everyone else their own org), branch narrowing
-- restrictive, self-scope denied outright (a customer has no more business
-- browsing the shop's equipment warranties than its parts costs — the same
-- reasoning 0017 gave declined_jobs), version bumped by the database.

CREATE TABLE IF NOT EXISTS "equipment_warranties" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"warranty_number" varchar(32) NOT NULL,
	"item_name" varchar(200) NOT NULL,
	"provider" varchar(200) NOT NULL,
	"coverage" varchar(24) DEFAULT 'full' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"claimed_at" timestamp with time zone,
	"claim_notes" text,
	"notes" text
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "equipment_warranties" ADD CONSTRAINT "equipment_warranties_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "equipment_warranties_org_number_idx" ON "equipment_warranties" ("org_id","warranty_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "equipment_warranties_org_idx" ON "equipment_warranties" ("org_id","branch_id","status");
--> statement-breakpoint
ALTER TABLE "equipment_warranties" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "equipment_warranties" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "equipment_warranties" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "equipment_warranties" AS RESTRICTIVE FOR ALL
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
-- Deny-by-default for the `self` scope (0014's discipline). A customer must
-- never see the shop's own equipment warranties; there is no self predicate
-- to write, so the answer is a flat refusal rather than a narrowing.
CREATE POLICY r_self ON "equipment_warranties" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER equipment_warranties_bump_version BEFORE UPDATE ON "equipment_warranties"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
