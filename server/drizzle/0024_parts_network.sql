-- Parts Network (BLK-004). A garage-to-garage / garage-to-dealer parts supply
-- network: a directory of members you trade with, part requests broadcast to
-- them, the quotations that come back, and the orders an accepted quotation
-- becomes. `PartsNetwork.tsx` and `Procurement.tsx`'s three network views all
-- rendered an honest "no data source yet" shell because none of this existed
-- as a collection; these four tables are that collection set.
--
-- ─── The tenant boundary, stated explicitly ────────────────────────────────
--
-- A trading network is the one domain in this product whose *business* concept
-- spans organizations, and it is worth being blunt about what these tables do
-- and do not do: **nothing here crosses the tenant boundary.** Every row
-- carries `org_id` and is visible only to that organization, under exactly the
-- same `p_tenant` / `r_branch` / `r_self` policy set `declined_jobs` (0017),
-- `equipment_warranties` (0022) and `notifications` (0023) carry.
--
-- That is a deliberate scope decision, not an oversight. Genuine cross-tenant
-- sharing would need three things this architecture does not have: a way for
-- one `organizations` row to be a registered participant in another's network
-- (there is no such link), a `p_tenant` policy widened from `org_id =
-- app_org()` to something like "or an org I share a network membership with"
-- (which would put every tenant's isolation guarantee behind a join through
-- user-writable rows), and an inter-tenant transport to carry a request from
-- one org's database to another's (there is none — the API is single-tenant
-- per request context). Widening `p_tenant` on business records to fake the
-- first two would be unsound sharing dressed as a feature, so it is not done.
--
-- What is modelled instead is each tenant's **own record of its network
-- activity** — the same thing a real garage keeps today: who it trades with,
-- what it asked for, what came back, what it ordered. `direction` on requests
-- and orders is what makes that honest: an `incoming` request is one this
-- tenant recorded as having been sent *to* it by a member, and an `inbound`
-- order is one it is fulfilling rather than buying. Both are this tenant's
-- rows, authored under its own `org_id`; the counterparty is named by
-- `member_id`, a row in this tenant's own directory, never a foreign
-- `org_id`. A non-member organization therefore sees nothing at all, which
-- `server/tests/parts-network.test.ts` proves at the HTTP boundary rather
-- than asserting here.
--
-- Reuse over invention (`suppliers` already exists): a member that is also one
-- of this workshop's own vendors points at its `suppliers` row through
-- `supplier_id` rather than duplicating the vendor concept, and a request that
-- is sourcing a part this workshop stocks carries that part's `parts.sku`.
--
-- Server-derived only: `code` is assigned sequentially per tenant, and every
-- `*_at` status timestamp below is written from the status transition in
-- `server/src/writers.ts`, never accepted as input — the same discipline
-- `equipment_warranties.claimed_at` and `declined_jobs.resolved_at` use.

CREATE TABLE IF NOT EXISTS "parts_network_members" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"kind" varchar(16) DEFAULT 'garage' NOT NULL,
	"city" varchar(120),
	"contact_name" varchar(200),
	"contact_phone" varchar(32),
	"contact_email" varchar(254),
	"supplier_id" varchar(26),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"rating_tenths" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts_network_requests" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"direction" varchar(16) DEFAULT 'outgoing' NOT NULL,
	"member_id" varchar(26),
	"member_name" varchar(200),
	"part_sku" varchar(64),
	"part_name" varchar(200) NOT NULL,
	"part_number" varchar(64),
	"qty" integer DEFAULT 1 NOT NULL,
	"urgency" varchar(16) DEFAULT 'normal' NOT NULL,
	"vehicle_info" varchar(200),
	"job_code" varchar(32),
	"needed_by" date,
	"status" varchar(16) DEFAULT 'open' NOT NULL,
	"quotation_count" integer DEFAULT 0 NOT NULL,
	"quoted_at" timestamp with time zone,
	"ordered_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts_network_quotations" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"request_id" varchar(26) NOT NULL,
	"member_id" varchar(26),
	"member_name" varchar(200) NOT NULL,
	"unit_price_halalas" bigint DEFAULT 0 NOT NULL,
	"qty_available" integer DEFAULT 0 NOT NULL,
	"lead_time_days" integer,
	"condition" varchar(16) DEFAULT 'new' NOT NULL,
	"warranty_months" integer,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts_network_orders" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"request_id" varchar(26),
	"quotation_id" varchar(26),
	"member_id" varchar(26),
	"member_name" varchar(200) NOT NULL,
	"direction" varchar(16) DEFAULT 'outbound' NOT NULL,
	"part_name" varchar(200) NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_price_halalas" bigint DEFAULT 0 NOT NULL,
	"total_halalas" bigint DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'placed' NOT NULL,
	"tracking_ref" varchar(64),
	"expected_at" date,
	"shipped_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts_network_members" ADD CONSTRAINT "parts_network_members_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts_network_requests" ADD CONSTRAINT "parts_network_requests_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts_network_quotations" ADD CONSTRAINT "parts_network_quotations_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts_network_orders" ADD CONSTRAINT "parts_network_orders_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- A member that is also one of this workshop's own vendors points at the
-- `suppliers` row rather than duplicating it. Same-tenant by construction:
-- both tables are under the same `org_id` policy, so a cross-tenant
-- `supplier_id` can never be read back even if one were written.
DO $$ BEGIN
  ALTER TABLE "parts_network_members" ADD CONSTRAINT "parts_network_members_supplier_id_suppliers_id_fk"
    FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "parts_network_quotations" ADD CONSTRAINT "parts_network_quotations_request_id_fk"
    FOREIGN KEY ("request_id") REFERENCES "public"."parts_network_requests"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parts_network_members_org_code_idx" ON "parts_network_members" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_network_members_org_idx" ON "parts_network_members" ("org_id","branch_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parts_network_requests_org_code_idx" ON "parts_network_requests" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_network_requests_org_idx" ON "parts_network_requests" ("org_id","branch_id","direction","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parts_network_quotations_org_code_idx" ON "parts_network_quotations" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_network_quotations_request_idx" ON "parts_network_quotations" ("org_id","request_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parts_network_orders_org_code_idx" ON "parts_network_orders" ("org_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_network_orders_org_idx" ON "parts_network_orders" ("org_id","branch_id","direction","status");
--> statement-breakpoint
-- RLS, written out per table rather than looped, so a reader (and
-- `tools/docs/check.mjs`'s coverage check) sees each table's policies where it
-- expects them. Identical discipline to 0017/0022/0023: tenant isolation
-- permissive (platform sees all, everyone else their own org), branch narrowing
-- restrictive, `self` denied outright — a customer's portal has no business
-- reading which garages this workshop buys parts from, what it pays them, or
-- what it quoted a competitor.
--> statement-breakpoint
ALTER TABLE "parts_network_members" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "parts_network_members" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "parts_network_members" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "parts_network_members" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "parts_network_members" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER parts_network_members_bump_version BEFORE UPDATE ON "parts_network_members"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
ALTER TABLE "parts_network_requests" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "parts_network_requests" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "parts_network_requests" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "parts_network_requests" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "parts_network_requests" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER parts_network_requests_bump_version BEFORE UPDATE ON "parts_network_requests"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
ALTER TABLE "parts_network_quotations" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "parts_network_quotations" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "parts_network_quotations" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "parts_network_quotations" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "parts_network_quotations" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER parts_network_quotations_bump_version BEFORE UPDATE ON "parts_network_quotations"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
ALTER TABLE "parts_network_orders" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "parts_network_orders" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "parts_network_orders" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "parts_network_orders" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_self ON "parts_network_orders" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER parts_network_orders_bump_version BEFORE UPDATE ON "parts_network_orders"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
