-- Insurance policies and claims (financial products) — vertical A.
--
-- A policy is the cover a customer holds on a vehicle; a claim is a request
-- against a policy, which may relate to a workshop repair. Both carry the
-- universal tenant/audit columns and get the same RLS + version-bump discipline
-- every tenant table gets in 0001: tenant isolation permissive (platform sees
-- all, everyone else their own org), branch narrowing restrictive, version
-- bumped by the database. A cross-tenant read returns no row (a 404 at the API),
-- never a 403.
--
-- Money is integer halalas (premium, coverage, claimed/approved amounts). A new
-- migration rather than an edit to an applied one: 0001-0006 are history.

CREATE TABLE IF NOT EXISTS "insurance_policies" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"policy_number" varchar(40) NOT NULL,
	"insurer" varchar(160) NOT NULL,
	"customer_id" varchar(26),
	"holder_name" varchar(200) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"type" varchar(24) DEFAULT 'comprehensive' NOT NULL,
	"premium_halalas" bigint DEFAULT 0 NOT NULL,
	"coverage_halalas" bigint DEFAULT 0 NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insurance_claims" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"claim_number" varchar(40) NOT NULL,
	"policy_id" varchar(26),
	"policy_number" varchar(40) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"job_card_id" varchar(26),
	"amount_claimed_halalas" bigint DEFAULT 0 NOT NULL,
	"amount_approved_halalas" bigint,
	"status" varchar(16) DEFAULT 'submitted' NOT NULL,
	"incident_date" date NOT NULL,
	"description" text NOT NULL,
	"submitted_by" varchar(26),
	"approved_by" varchar(26),
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "insurance_policies_org_number_idx" ON "insurance_policies" ("org_id","policy_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insurance_policies_org_idx" ON "insurance_policies" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "insurance_claims_org_number_idx" ON "insurance_claims" ("org_id","claim_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insurance_claims_policy_idx" ON "insurance_claims" ("org_id","policy_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insurance_claims_org_idx" ON "insurance_claims" ("org_id","branch_id","status");
--> statement-breakpoint
ALTER TABLE "insurance_policies" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "insurance_policies" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "insurance_claims" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "insurance_claims" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "insurance_policies" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "insurance_policies" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "insurance_claims" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "insurance_claims" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER insurance_policies_bump_version BEFORE UPDATE ON "insurance_policies"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER insurance_claims_bump_version BEFORE UPDATE ON "insurance_claims"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE INDEX insurance_policies_live_idx ON "insurance_policies" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX insurance_claims_live_idx ON "insurance_claims" (org_id, branch_id) WHERE deleted_at IS NULL;
