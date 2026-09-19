-- Notifications (BLK-004). A per-tenant feed of job, appointment, invoice and
-- stock alerts a staff member can view, mark read and dismiss. NotificationCenter.tsx
-- rendered an honest GAP state because no `notifications` collection existed
-- anywhere in the system; this is that collection. A flat, writable directory
-- like `equipment_warranties`: no lines, no derived money, one lifecycle move
-- (unread -> read) through the generic router. Same universal columns, RLS +
-- version-bump discipline every tenant table gets since 0001/0010: tenant
-- isolation permissive (platform sees all, everyone else their own org),
-- branch narrowing restrictive, self-scope denied outright (a customer's
-- portal has no business reading the shop's own staff notification feed —
-- the same reasoning 0017 gave declined_jobs), version bumped by the
-- database.

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"category" varchar(16) DEFAULT 'system' NOT NULL,
	"severity" varchar(16) DEFAULT 'info' NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(300),
	"read_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_org_idx" ON "notifications" ("org_id","branch_id","read_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_org_created_idx" ON "notifications" ("org_id","created_at");
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "notifications" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "notifications" AS RESTRICTIVE FOR ALL
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
-- Deny-by-default for the `self` scope (0014's discipline). A customer must
-- never see the shop's own staff notification feed; there is no self
-- predicate to write, so the answer is a flat refusal rather than a
-- narrowing.
CREATE POLICY r_self ON "notifications" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER notifications_bump_version BEFORE UPDATE ON "notifications"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
