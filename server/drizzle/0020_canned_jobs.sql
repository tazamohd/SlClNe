-- Canned Jobs — predefined, priced service packages (build-order item 5).
--
-- An estimate is priced line by line today, with no way to reuse a standard
-- bundle: the same "30k Mile Service" gets retyped from scratch on every
-- visit, at whatever price the advisor remembers. A canned job is a named,
-- priced bundle of the same shape `estimate_lines` already uses, so applying
-- one to an estimate is a straight copy into the estimate's own `PATCH`
-- (`server/src/routes/estimates.ts`'s existing full-replace-and-recompute),
-- not a second pricing engine.
--
-- `canned_job_lines` mirrors `estimate_lines` column for column on purpose —
-- copying a row from one to the other is a field rename, not a translation.
-- `canned_jobs.price_halalas`/`line_count` are stored, computed at write time
-- the same way `estimates.subtotal_halalas` is computed from its lines, never
-- derived from a join at read time.
--
-- RLS follows `0017`'s (declined_jobs) discipline exactly: `p_tenant`
-- (permissive tenant narrowing), `r_branch` (restrictive branch narrowing —
-- `branch_id IS NULL` means the catalog is shared across every branch of the
-- tenant, the same convention `services` uses), and a flat `r_self` denial.
-- A canned job carries the shop's own price list; a customer has no more
-- business browsing it than they do the parts catalog's cost column, and
-- there is no per-row predicate that would narrow it correctly, so the
-- answer is a flat refusal rather than a narrowing — `r_self` on every table
-- created since 0014 either narrows or denies; this one denies.

CREATE TABLE IF NOT EXISTS "canned_jobs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_ar" varchar(160),
	"category" varchar(64),
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"price_halalas" bigint DEFAULT 0 NOT NULL,
	"line_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "canned_jobs" ADD CONSTRAINT "canned_jobs_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canned_jobs_org_idx" ON "canned_jobs" ("org_id","branch_id","active");
--> statement-breakpoint
ALTER TABLE "canned_jobs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "canned_jobs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "canned_jobs" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "canned_jobs" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "canned_jobs" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER canned_jobs_bump_version BEFORE UPDATE ON "canned_jobs"
  FOR EACH ROW EXECUTE FUNCTION bump_version();

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canned_job_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"canned_job_id" varchar(26) NOT NULL,
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"kind" varchar(16) NOT NULL,
	"qty" double precision NOT NULL,
	"unit_price_halalas" bigint NOT NULL,
	"part_sku" varchar(64),
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "canned_job_lines" ADD CONSTRAINT "canned_job_lines_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canned_job_lines_job_idx" ON "canned_job_lines" ("org_id","canned_job_id");
--> statement-breakpoint
ALTER TABLE "canned_job_lines" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "canned_job_lines" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "canned_job_lines" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "canned_job_lines" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "canned_job_lines" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER canned_job_lines_bump_version BEFORE UPDATE ON "canned_job_lines"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
