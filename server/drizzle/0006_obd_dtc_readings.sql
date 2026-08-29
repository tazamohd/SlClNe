-- F-029: per-device DTC readings — the device↔dtc link a re-scan or clear-codes
-- command records. The live OBD command is an EXTERNAL_DEPENDENCY; the reading
-- it produces is real, persisted, tenant-scoped data.
--
-- Same universal tenant/audit columns and the same RLS + version-bump
-- discipline every tenant table gets in 0001: tenant isolation permissive
-- (platform sees all, everyone else their own org), branch narrowing
-- restrictive, version bumped by the database. A cross-tenant read returns no
-- row (a 404 at the API), never a 403.
--
-- A new migration rather than an edit to an applied one: 0001–0005 are history.

CREATE TABLE IF NOT EXISTS "obd_dtc_readings" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"device_id" varchar(26) NOT NULL,
	"device_code" varchar(32),
	"dtc_code" varchar(16) NOT NULL,
	"description" varchar(300),
	"severity" varchar(16),
	"source" varchar(16) NOT NULL,
	"cleared" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"mock" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "obd_dtc_readings" ADD CONSTRAINT "obd_dtc_readings_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "obd_dtc_readings_device_idx" ON "obd_dtc_readings" ("org_id","device_id");
--> statement-breakpoint
ALTER TABLE "obd_dtc_readings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "obd_dtc_readings" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "obd_dtc_readings" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "obd_dtc_readings" AS RESTRICTIVE FOR ALL
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
CREATE TRIGGER obd_dtc_readings_bump_version BEFORE UPDATE ON "obd_dtc_readings"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
