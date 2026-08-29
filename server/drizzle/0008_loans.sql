-- Auto-loan contracts and their repayment schedules (financial products) —
-- vertical A.
--
-- A contract is a financed principal at a rate over a term; its monthly
-- instalment is a real amortised figure the server computes at origination
-- (packages/contract/src/rules/loans.ts), stored here as integer halalas. The
-- repayments are the month-by-month schedule that instalment implies, and the
-- amounts sum to principal + interest across the schedule.
--
-- Same universal tenant/audit columns and the same RLS + version-bump
-- discipline every tenant table gets in 0001. A cross-tenant read returns no
-- row (a 404 at the API), never a 403. A new migration, not an edit to an
-- applied one: 0001-0007 are history.

CREATE TABLE IF NOT EXISTS "loan_contracts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"contract_number" varchar(40) NOT NULL,
	"customer_id" varchar(26),
	"borrower_name" varchar(200) NOT NULL,
	"principal_halalas" bigint DEFAULT 0 NOT NULL,
	"rate_bps" integer DEFAULT 0 NOT NULL,
	"term_months" integer NOT NULL,
	"start_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"monthly_instalment_halalas" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loan_repayments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"loan_contract_id" varchar(26) NOT NULL,
	"contract_number" varchar(40) NOT NULL,
	"sequence" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount_due_halalas" bigint DEFAULT 0 NOT NULL,
	"amount_paid_halalas" bigint DEFAULT 0 NOT NULL,
	"paid_date" date,
	"status" varchar(16) DEFAULT 'due' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "loan_contracts" ADD CONSTRAINT "loan_contracts_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "loan_repayments" ADD CONSTRAINT "loan_repayments_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "loan_contracts_org_number_idx" ON "loan_contracts" ("org_id","contract_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loan_contracts_org_idx" ON "loan_contracts" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loan_repayments_contract_idx" ON "loan_repayments" ("org_id","loan_contract_id","sequence");
--> statement-breakpoint
ALTER TABLE "loan_contracts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "loan_contracts" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "loan_repayments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "loan_repayments" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "loan_contracts" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "loan_contracts" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "loan_repayments" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "loan_repayments" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER loan_contracts_bump_version BEFORE UPDATE ON "loan_contracts"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER loan_repayments_bump_version BEFORE UPDATE ON "loan_repayments"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE INDEX loan_contracts_live_idx ON "loan_contracts" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX loan_repayments_live_idx ON "loan_repayments" (org_id, loan_contract_id) WHERE deleted_at IS NULL;
