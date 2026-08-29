-- Procurement (F-022): suppliers, requisitions (+ lines), and the columns that
-- turn the already-present purchase_orders / purchase_order_lines tables into a
-- reachable requisition → purchase order → receiving path.
--
-- The purchase-order tables and their RLS + version-bump discipline were laid
-- down in 0000/0001 but never exposed; this migration adds a supplier link, a
-- requisition link and the VAT breakdown to them, and a `sort` + Arabic
-- description to their lines. The three NEW tables get the universal
-- tenant/audit columns and the same RLS + version-bump discipline every tenant
-- table gets in 0001: tenant isolation permissive (platform sees all, everyone
-- else their own org), branch narrowing restrictive, version bumped by the
-- database. A cross-tenant read returns no row (a 404 at the API), never a 403.
-- Money is integer halalas; totals are server-computed. A new migration rather
-- than an edit to an applied one: 0000-0009 are history.

CREATE TABLE IF NOT EXISTS "suppliers" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"contact_name" varchar(200),
	"contact_phone" varchar(32),
	"contact_email" varchar(254),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requisitions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"requester_name" varchar(200) NOT NULL,
	"department" varchar(160),
	"priority" varchar(16) DEFAULT 'normal' NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"needed_by" date,
	"estimated_total_halalas" bigint DEFAULT 0 NOT NULL,
	"notes" text,
	"submitted_by" varchar(26),
	"approved_by" varchar(26),
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requisition_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"requisition_id" varchar(26) NOT NULL,
	"part_sku" varchar(64),
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"qty" integer NOT NULL,
	"est_unit_price_halalas" bigint NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "requisition_lines" ADD CONSTRAINT "requisition_lines_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- Expose the purchase-order tables the schema always carried: a supplier link,
-- the requisition they were raised from, the VAT breakdown, and notes.
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "supplier_id" varchar(26);
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "requisition_id" varchar(26);
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "subtotal_halalas" bigint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "tax_halalas" bigint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "notes" text;
--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "description_ar" varchar(300);
--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "sort" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_org_code_idx" ON "suppliers" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suppliers_org_idx" ON "suppliers" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "requisitions_org_code_idx" ON "requisitions" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requisitions_org_idx" ON "requisitions" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requisition_lines_req_idx" ON "requisition_lines" ("org_id","requisition_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_org_idx" ON "purchase_orders" ("org_id","branch_id","status");
--> statement-breakpoint
-- RLS + version-bump for the three new tables, identical in shape to 0001/0009.
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "suppliers" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requisitions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requisitions" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requisition_lines" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requisition_lines" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "suppliers" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "suppliers" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "requisitions" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "requisitions" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "requisition_lines" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "requisition_lines" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER suppliers_bump_version BEFORE UPDATE ON "suppliers"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER requisitions_bump_version BEFORE UPDATE ON "requisitions"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER requisition_lines_bump_version BEFORE UPDATE ON "requisition_lines"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE INDEX suppliers_live_idx ON "suppliers" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX requisitions_live_idx ON "requisitions" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX requisition_lines_live_idx ON "requisition_lines" (org_id, requisition_id) WHERE deleted_at IS NULL;
