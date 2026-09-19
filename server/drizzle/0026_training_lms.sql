-- Training LMS (BLK-004). The staff course catalogue, and the enrolments that
-- are what "32 enrolled, 88% complete" actually means.
-- `app/src/screens/hr/TrainingLMS.tsx` rendered a hardcoded eight-row
-- `MOCK_COURSES = [...]` array in which every `enrolled` head count and every
-- `completion` percentage was invented, and then computed its four KPIs *from*
-- those inventions — internally consistent arithmetic over entirely made-up
-- inputs, which is the sharpest form of what BLK-004 names. These two tables
-- are what it reads instead.
--
-- ─── Two tables, and why it is two ─────────────────────────────────────────
--
-- `enrolled` and `completion` are **aggregates over enrolments**, not
-- properties of a course. A `training_courses.enrolled_count` column would have
-- been exactly the mock's defect with a database behind it: a number someone
-- typed, presented as a fact about who in this workshop has actually been
-- trained, and wrong the moment anyone enrolled or finished.
--
-- So the model is a course and a roster:
--
--   * `training_courses` records only what is a property of the course — its
--     code, title, subject, how long it takes to sit, and where it is in its
--     own publish/archive lifecycle. It carries **no head count and no
--     completion percentage**, deliberately.
--   * `training_enrolments` is one row per (employee, course): a real
--     `employees` reference, the state that employee has reached, and when they
--     finished.
--
-- A course's head count is then the enrolments that name it, counted, and its
-- completion is how many of those reached `completed` over how many there are.
-- Neither is stored, so neither can disagree with the roster — they *are* the
-- roster. `training_enrolments.status = 'withdrawn'` is excluded from both: an
-- employee who started and stopped is not enrolled any more, and counting them
-- in the denominator would quietly depress every percentage.
--
-- What is recorded and cannot be derived: `duration_minutes` (how long a course
-- takes to sit is a property of the course; nothing in the roster knows it) and
-- the course's `status`. `duration_minutes = 0` means "not stated", and the
-- screen shows a dash rather than `0 hrs`. A course with no enrolments at all
-- shows a real `0` head count and a dash for completion — there is no
-- denominator — rather than being hidden or given a figure.
--
-- Server-derived only, never accepted as input: `published_at` / `archived_at`
-- on a course and `completed_at` on an enrolment are all written from the
-- status transition in `server/src/writers.ts`, and `employee_name` on an
-- enrolment is read from the referenced employee. Same discipline as
-- `equipment_warranties.claimed_at`, `declined_jobs.resolved_at` and
-- `warehouse_zones.maintenance_since`.

CREATE TABLE IF NOT EXISTS "training_courses" (
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
	"title" varchar(200) NOT NULL,
	"title_ar" varchar(200),
	"category" varchar(24) DEFAULT 'safety' NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "training_enrolments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"course_code" varchar(16) NOT NULL,
	"employee_id" varchar(26) NOT NULL,
	"employee_name" varchar(200) NOT NULL,
	"status" varchar(16) DEFAULT 'enrolled' NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "training_enrolments" ADD CONSTRAINT "training_enrolments_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- A unique *constraint*, not merely a unique index, because
-- `training_enrolments.course_code` references these two columns and Postgres
-- accepts only a constraint as the target of a foreign key. The constraint
-- creates the index `schema.ts`'s `uniqueIndex('training_courses_org_code_idx')`
-- names, so the two descriptions of the table agree.
DO $$ BEGIN
  ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_org_code_idx" UNIQUE ("org_id","code");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- The same technique on `employees`, for the same reason: an enrolment names an
-- employee by ULID, and referencing `(org_id, id)` rather than `(id)` alone
-- makes the reference **same-tenant by construction** — `org_id` is part of the
-- key, so a row in one organization can never point at another organization's
-- employee, whatever a writer does. `employees.id` is already the primary key,
-- so this constraint adds no new uniqueness; it exists to be a legal foreign-key
-- target, exactly as `warehouse_zones (org_id, code)` does for `parts.zone_code`
-- in 0025.
DO $$ BEGIN
  ALTER TABLE "employees" ADD CONSTRAINT "employees_org_id_key" UNIQUE ("org_id","id");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- The course reference on an enrolment. By code rather than by ULID because the
-- code is the catalogue identifier a screen groups on, and `present()` has no
-- join to resolve a surrogate key with. `ON DELETE restrict`: a course somebody
-- has been sent on is not a course you can delete — archive it.
DO $$ BEGIN
  ALTER TABLE "training_enrolments" ADD CONSTRAINT "training_enrolments_course_code_fk"
    FOREIGN KEY ("org_id","course_code") REFERENCES "public"."training_courses"("org_id","code") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- The employee reference. `ON DELETE restrict`, because an employee's training
-- record is part of why you keep the row: withdrawing them from the course is
-- the way out, not deleting the person underneath the history.
DO $$ BEGIN
  ALTER TABLE "training_enrolments" ADD CONSTRAINT "training_enrolments_employee_id_fk"
    FOREIGN KEY ("org_id","employee_id") REFERENCES "public"."employees"("org_id","id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_courses_org_idx" ON "training_courses" ("org_id","branch_id","status");
--> statement-breakpoint
-- One live enrolment per employee per course: a head count derived from the
-- roster is only trustworthy if the roster cannot hold the same person twice.
-- Partial on `deleted_at`, so a soft-deleted enrolment does not block a new one.
CREATE UNIQUE INDEX IF NOT EXISTS "training_enrolments_org_course_employee_idx"
  ON "training_enrolments" ("org_id","course_code","employee_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_enrolments_org_idx" ON "training_enrolments" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "training_enrolments_employee_idx" ON "training_enrolments" ("org_id","employee_id");
--> statement-breakpoint
-- RLS, written out literally per table rather than in a `DO $$ ... EXECUTE
-- format(...)` loop: `tools/docs/check.mjs`'s coverage check reads these
-- statements as text, and a looped policy is invisible to it even though
-- Postgres applies it correctly. Identical discipline to
-- 0017/0022/0023/0024/0025 — tenant isolation permissive (platform sees all,
-- everyone else only their own org), branch narrowing restrictive, and `self`
-- — a customer on the portal — denied outright: which of this workshop's staff
-- have passed which safety course is none of a customer's business, and an
-- employee's training record is personnel data.
--> statement-breakpoint
ALTER TABLE "training_courses" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "training_courses" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "training_courses" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "training_courses" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "training_courses" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER training_courses_bump_version BEFORE UPDATE ON "training_courses"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
ALTER TABLE "training_enrolments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "training_enrolments" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "training_enrolments" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "training_enrolments" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "training_enrolments" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER training_enrolments_bump_version BEFORE UPDATE ON "training_enrolments"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
