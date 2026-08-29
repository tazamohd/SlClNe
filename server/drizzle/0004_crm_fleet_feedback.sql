-- F-027: the CRM/fleet write slice.
--
-- Two schema changes, both additive so the drop-and-rebuild harness and the
-- seed-fidelity proof stay green:
--
--   1. Fleet contract terms — type, value (halalas), the term dates, a renewal
--      date and a contact. Nullable, because the design's fleet fixtures carry
--      none of them; the seed fills coherent values after the fixtures load.
--   2. A `customer_feedback` table, with the universal tenant/audit columns and
--      the same RLS + version-bump discipline every tenant table gets in 0001.
--
-- A new migration rather than an edit to an applied one: 0001–0003 are history.

ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contract_type" varchar(32);
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contract_value_halalas" bigint;
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contract_start_date" date;
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contract_end_date" date;
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "renewal_date" date;
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contact_name" varchar(200);
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contact_phone" varchar(32);
--> statement-breakpoint
ALTER TABLE "fleets" ADD COLUMN IF NOT EXISTS "contact_email" varchar(254);

--> statement-breakpoint
-- The anchor that makes lead→opportunity conversion idempotent: once set, a
-- replay of POST /crm/leads/:id/convert returns this opportunity instead of
-- creating a second one.
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "converted_opportunity_id" varchar(26);

--> statement-breakpoint
-- F-025: the public marketing intake table. Its own table, not a row in the
-- qualified `leads` pipeline, because a raw web submission carries a contact
-- channel and a message and has no score or stage.
CREATE TABLE IF NOT EXISTS "public_leads" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(254),
	"phone" varchar(32),
	"company" varchar(200),
	"message" text,
	"source" varchar(64),
	"status" varchar(16) DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "public_leads" ADD CONSTRAINT "public_leads_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "public_leads_org_idx" ON "public_leads" ("org_id","status");
--> statement-breakpoint
ALTER TABLE "public_leads" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public_leads" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "public_leads" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "public_leads" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER public_leads_bump_version BEFORE UPDATE ON "public_leads"
  FOR EACH ROW EXECUTE FUNCTION bump_version();

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_feedback" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"job_card_id" varchar(26),
	"customer_id" varchar(26),
	"customer_name" varchar(200)
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_feedback_org_idx" ON "customer_feedback" ("org_id","branch_id");

--> statement-breakpoint
-- RLS, matching the tenant-table treatment in 0001: tenant isolation is
-- permissive (platform sees all, everyone else sees their own org), branch
-- narrowing is restrictive, and the row version is bumped by the database.
-- Cross-tenant reads therefore return no row (a 404 at the API), never a 403.
ALTER TABLE "customer_feedback" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "customer_feedback" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "customer_feedback" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "customer_feedback" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER customer_feedback_bump_version BEFORE UPDATE ON "customer_feedback"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
