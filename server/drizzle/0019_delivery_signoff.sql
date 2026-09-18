-- Customer sign-off at delivery (Sprint 2, P0 backlog item 4).
--
-- `WorkshopSignature.tsx` captured a real canvas signature and
-- `WorkshopDelivery.tsx` walked a real six-item checklist, but neither
-- persisted anything: "Confirm Signature" only navigated to the next screen,
-- and "Complete Delivery" only advanced the job's stage — the checklist and
-- a fabricated odometer pair lived in local React state and vanished on
-- reload. This table gives the hand-off record a real backing row: the
-- customer's signature image, when they agreed, the checklist the advisor
-- actually completed, and the odometer reading taken at delivery.
--
-- One row per job card, born from the multipart signature-upload route
-- (`POST /job-cards/:id/delivery-signoff`) — the only place a signature
-- image's bytes can arrive, the same reasoning `inspection_media` uses.
-- Everything else about the row (checklist, odometer) is filled in later
-- through the generic collection's `PATCH`, once the advisor has actually
-- walked the checklist.
--
-- RLS follows 0018's discipline exactly: `p_tenant` (permissive tenant
-- narrowing), `r_branch` (restrictive branch narrowing), and real (not
-- flat-deny) `r_own`/`r_self` policies narrowing through `job_card_id IN
-- (SELECT id FROM job_cards)` — an advisor/technician sees only their own
-- job's sign-off, a customer sees only their own vehicle's, both narrowed by
-- `job_cards`' own policies rather than a second copy of that logic here.
-- Nothing on this row is shop-internal, so unlike `inspection_findings`
-- there is no column-level redaction to layer on top — a customer reading
-- their own delivery record is the point of the feature.

CREATE TABLE IF NOT EXISTS "delivery_signoffs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"job_card_id" varchar(26) NOT NULL,
	"signed_by_name" varchar(200) NOT NULL,
	"agreed_at" timestamp with time zone NOT NULL,
	"checklist" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"odometer_out" integer,
	"storage_key" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "delivery_signoffs" ADD CONSTRAINT "delivery_signoffs_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "delivery_signoffs_job_idx" ON "delivery_signoffs" ("org_id","job_card_id");
--> statement-breakpoint
ALTER TABLE "delivery_signoffs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "delivery_signoffs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "delivery_signoffs" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "delivery_signoffs" AS RESTRICTIVE FOR ALL
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
-- `own`/`assigned` (advisor/technician): narrowed to a sign-off on a job card
-- the caller can already see under `job_cards`' own `r_own` — without this,
-- `r_branch` alone would hand every sign-off in the branch to any own-scoped
-- principal, not only their own jobs'.
CREATE POLICY r_own ON "delivery_signoffs" AS RESTRICTIVE FOR ALL
  USING (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
-- `self` (customer): narrowed to the sign-off on a job card the customer can
-- already see under `job_cards`' own `r_self` — their own vehicle's
-- hand-off record, nothing else in the branch.
CREATE POLICY r_self ON "delivery_signoffs" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
CREATE TRIGGER delivery_signoffs_bump_version BEFORE UPDATE ON "delivery_signoffs"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
