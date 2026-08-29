-- F-028: the two report-source collections BankReconciliation and CustomReports
-- need.
--
-- Both are new tables with the universal tenant/audit columns and the same
-- RLS + version-bump discipline every tenant table gets in 0001: tenant
-- isolation is permissive (platform sees all, everyone else sees their own
-- org), branch narrowing is restrictive, and the row version is bumped by the
-- database. A cross-tenant read therefore returns no row (a 404 at the API),
-- never a 403.
--
-- A new migration rather than an edit to an applied one: 0001–0004 are history.

CREATE TABLE IF NOT EXISTS "bank_statements" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"statement_date" date NOT NULL,
	"description" varchar(300) NOT NULL,
	"reference" varchar(64),
	"bank_account" varchar(120),
	"amount_halalas" bigint DEFAULT 0 NOT NULL,
	"direction" varchar(8) NOT NULL,
	"matched" boolean DEFAULT false NOT NULL,
	"matched_receipt_id" varchar(26),
	"matched_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bank_statements_org_idx" ON "bank_statements" ("org_id","matched");
--> statement-breakpoint
ALTER TABLE "bank_statements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "bank_statements" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "bank_statements" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "bank_statements" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER bank_statements_bump_version BEFORE UPDATE ON "bank_statements"
  FOR EACH ROW EXECUTE FUNCTION bump_version();

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_reports" (
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
	"source" varchar(64),
	"owner_name" varchar(200),
	"definition" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_reports_org_idx" ON "saved_reports" ("org_id","created_by");
--> statement-breakpoint
ALTER TABLE "saved_reports" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "saved_reports" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "saved_reports" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "saved_reports" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER saved_reports_bump_version BEFORE UPDATE ON "saved_reports"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
