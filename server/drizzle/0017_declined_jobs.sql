-- Declined Job Tracking & Follow-Up (Sprint 1, P0).
--
-- A row per estimate line — or per whole estimate — a customer said no to.
-- Its own table rather than a status column on estimate_lines: the follow-up
-- lifecycle (contacted, reconsidering, expired…) is a sales workflow, not part
-- of the estimate's own document lifecycle, and keeping them apart means a
-- follow-up bug can never touch an estimate's money. New tables get the same
-- universal columns, RLS + version-bump discipline every tenant table gets in
-- 0001/0010: tenant isolation permissive (platform sees all, everyone else
-- their own org), branch narrowing restrictive, version bumped by the
-- database. A cross-tenant read returns no row (a 404 at the API), never 403.

CREATE TABLE IF NOT EXISTS "declined_jobs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"estimate_id" varchar(26) NOT NULL,
	"estimate_line_id" varchar(26),
	"job_card_id" varchar(26),
	"customer_id" varchar(26),
	"customer_name" varchar(200) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"advisor_id" varchar(26),
	"description" varchar(300) NOT NULL,
	"reason_category" varchar(32) DEFAULT 'other' NOT NULL,
	"reason_notes" text,
	"safety_severity" varchar(16) DEFAULT 'monitor' NOT NULL,
	"value_halalas" bigint DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'declined' NOT NULL,
	"follow_up_date" date,
	"follow_up_notes" text,
	"declined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "declined_jobs" ADD CONSTRAINT "declined_jobs_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "declined_jobs_org_idx" ON "declined_jobs" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "declined_jobs_estimate_idx" ON "declined_jobs" ("org_id","estimate_id");
--> statement-breakpoint
-- One *active* tracking row per line: re-declining an already-tracked line is
-- a follow-up update, not a second record. Partial, so a resolved line can be
-- declined again on a later visit, and a whole-estimate decline
-- (estimate_line_id null) is never constrained by this index.
CREATE UNIQUE INDEX IF NOT EXISTS "declined_jobs_line_once_idx" ON "declined_jobs" ("org_id","estimate_line_id")
  WHERE "estimate_line_id" is not null and "status" = 'declined' and "deleted_at" is null;
--> statement-breakpoint
ALTER TABLE "declined_jobs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "declined_jobs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "declined_jobs" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "declined_jobs" AS RESTRICTIVE FOR ALL
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
-- Deny-by-default for the `self` scope (0014's discipline, extended to every
-- table created since — 0015 did the same for journal_lines). A customer must
-- never see this table: it carries an advisor's internal reason notes and
-- follow-up plan about a job the customer themselves declined. There is no
-- self predicate to write, so the answer is a flat refusal rather than a
-- narrowing. Without this, `r_branch` alone would have left every declined
-- job in the branch readable to a self-scoped principal — exactly the leak
-- 0014 fixed elsewhere; `tests/customer-self-scope.test.ts` is what catches a
-- table that ships without it.
CREATE POLICY r_self ON "declined_jobs" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER declined_jobs_bump_version BEFORE UPDATE ON "declined_jobs"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
