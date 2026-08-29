-- HR: employees, payroll (runs + lines), timesheets and leave requests —
-- vertical B.
--
-- An employee belongs to a department (0002's `departments`) and a branch, and
-- carries a base salary. Salary is sensitive: `salary_halalas` is presented as
-- `salaryHalalas` and nulled on the way out for the roles the `Employee salary`
-- field rule hides it from (server-side GLOBAL_REDACTIONS). Payroll is a run
-- (one month) with lines (one per employee); a line's net is
-- `gross + allowances - deductions` and a run's totals are the sums of its
-- lines, frozen when the run is posted. A posted run cannot be reopened or
-- edited (§5b). Timesheets store worked minutes as an integer (no float);
-- leave requests carry an approver for segregation of duties.
--
-- Every table gets the universal tenant/audit columns and the same RLS +
-- version-bump discipline every tenant table gets in 0001: tenant isolation
-- permissive (platform sees all, everyone else their own org), branch narrowing
-- restrictive, version bumped by the database. A cross-tenant read returns no
-- row (a 404 at the API), never a 403. Money is integer halalas. A new
-- migration rather than an edit to an applied one: 0001-0008 are history.

CREATE TABLE IF NOT EXISTS "employees" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"employee_number" varchar(40) NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"title" varchar(160),
	"department_id" varchar(26),
	"hire_date" date,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"salary_halalas" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_runs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"period" varchar(7) NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"gross_halalas" bigint DEFAULT 0 NOT NULL,
	"allowances_halalas" bigint DEFAULT 0 NOT NULL,
	"deductions_halalas" bigint DEFAULT 0 NOT NULL,
	"net_halalas" bigint DEFAULT 0 NOT NULL,
	"posted_at" timestamp with time zone,
	"posted_by" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"payroll_run_id" varchar(26) NOT NULL,
	"employee_id" varchar(26) NOT NULL,
	"employee_name" varchar(200) NOT NULL,
	"gross_halalas" bigint DEFAULT 0 NOT NULL,
	"allowances_halalas" bigint DEFAULT 0 NOT NULL,
	"deductions_halalas" bigint DEFAULT 0 NOT NULL,
	"net_halalas" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timesheets" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"employee_id" varchar(26) NOT NULL,
	"employee_name" varchar(200) NOT NULL,
	"work_date" date NOT NULL,
	"clock_in" varchar(5),
	"clock_out" varchar(5),
	"minutes" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'submitted' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_requests" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"employee_id" varchar(26) NOT NULL,
	"employee_name" varchar(200) NOT NULL,
	"type" varchar(24) DEFAULT 'annual' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer DEFAULT 1 NOT NULL,
	"status" varchar(16) DEFAULT 'submitted' NOT NULL,
	"reason" text,
	"approver_id" varchar(26),
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "employees" ADD CONSTRAINT "employees_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "employees_org_number_idx" ON "employees" ("org_id","employee_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employees_org_idx" ON "employees" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_runs_org_period_idx" ON "payroll_runs" ("org_id","period");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_runs_org_idx" ON "payroll_runs" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_lines_run_idx" ON "payroll_lines" ("org_id","payroll_run_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timesheets_employee_idx" ON "timesheets" ("org_id","employee_id","work_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_requests_employee_idx" ON "leave_requests" ("org_id","employee_id","status");
--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "employees" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "payroll_runs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "payroll_runs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "payroll_lines" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "payroll_lines" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "timesheets" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "timesheets" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "leave_requests" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "employees" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "employees" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "payroll_runs" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "payroll_runs" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "payroll_lines" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "payroll_lines" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "timesheets" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "timesheets" AS RESTRICTIVE FOR ALL
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
CREATE POLICY p_tenant ON "leave_requests" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "leave_requests" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER employees_bump_version BEFORE UPDATE ON "employees"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER payroll_runs_bump_version BEFORE UPDATE ON "payroll_runs"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER payroll_lines_bump_version BEFORE UPDATE ON "payroll_lines"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER timesheets_bump_version BEFORE UPDATE ON "timesheets"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE TRIGGER leave_requests_bump_version BEFORE UPDATE ON "leave_requests"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
CREATE INDEX employees_live_idx ON "employees" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX payroll_runs_live_idx ON "payroll_runs" (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX payroll_lines_live_idx ON "payroll_lines" (org_id, payroll_run_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX timesheets_live_idx ON "timesheets" (org_id, employee_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX leave_requests_live_idx ON "leave_requests" (org_id, employee_id) WHERE deleted_at IS NULL;
