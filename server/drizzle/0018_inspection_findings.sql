-- Digital Vehicle Health Check — inspection findings & media (Sprint 2, P0).
--
-- `WorkshopInspection.tsx` walked a six-category checklist and kept every
-- verdict in local React state — no table backed it, so the result of an
-- inspection evaporated the moment the tab closed and nothing could link a
-- finding to the estimate line it justified. Two tables fix that: a finding
-- per checklist point, and photo/video evidence attached to it, with an
-- annotation overlay (arrows/boxes/text) stored beside each piece of media
-- rather than burned into the image.
--
-- RLS follows 0017's discipline (tenant + branch narrowing, version-bump
-- trigger) plus one more layer neither `declined_jobs` nor `estimate_lines`
-- needed together: **real** `r_own` and `r_self` policies, both narrowing
-- rather than denying. `r_own` matters because, unlike a declined job — which
-- no own-scoped principal ever reads — a technician's own job card is
-- exactly where a finding is created; without it, `r_branch` alone would
-- leave every job's findings in the branch readable to any technician, not
-- only their assigned ones (the class of leak 0002/0014 closed on
-- `job_cards` itself). `r_self` matters because a customer *is* meant to see
-- their own vehicle's findings — the whole point of a "customer-facing clean
-- report" — just never `internal_note`, which is row data, not a row this
-- policy could deny outright.
--
-- Both resolve through the identical predicate, `job_card_id IN (SELECT id
-- FROM job_cards)`: `job_cards`' own policies already narrow correctly for
-- `own` (assigned technician) and `self` (customer_id = app_customer()), and
-- a subquery run under the caller's own RLS context can only ever return job
-- cards the caller could already see — the same idiom 0014 uses for
-- `estimate_lines`/`invoice_lines`.
--
-- `internal_note` is kept off a customer's screen at the *column* level
-- instead: `FIELD_RULES` gets a new "Inspection internal notes" rule hiding
-- it from `customer` (and `supplier`, who has no business here either), and
-- `server/src/registry.ts`'s `REDACTIONS` nulls it on the way out — the same
-- mechanism that already keeps a technician from seeing a part's cost or a
-- salary from reaching a role that should not have it. RLS decides which
-- *rows* a role may reach; `REDACTIONS` decides which *columns* of those rows
-- survive presentation. The two are complementary, not redundant, and using
-- the second for a genuinely row-visible-but-column-sensitive field is the
-- established pattern rather than a new one.

CREATE TABLE IF NOT EXISTS "inspection_findings" (
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
	"category" varchar(64) NOT NULL,
	"category_ar" varchar(64),
	"item" varchar(120) NOT NULL,
	"item_ar" varchar(120),
	"severity" varchar(16) DEFAULT 'ok' NOT NULL,
	"internal_note" text,
	"customer_note" text,
	"estimate_line_id" varchar(26),
	"recorded_by" varchar(26)
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inspection_findings_job_idx" ON "inspection_findings" ("org_id","job_card_id");
--> statement-breakpoint
ALTER TABLE "inspection_findings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "inspection_findings" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "inspection_findings" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "inspection_findings" AS RESTRICTIVE FOR ALL
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
-- `own`/`assigned` (technician): narrowed to findings on a job card the
-- caller can already see under `job_cards`' own `r_own` — i.e. assigned to
-- them or created by them. Without this, `r_branch` alone would hand a
-- technician every finding in the branch, not only their own jobs'.
CREATE POLICY r_own ON "inspection_findings" AS RESTRICTIVE FOR ALL
  USING (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
-- `self` (customer): narrowed to findings on a job card the customer can
-- already see under `job_cards`' own `r_self` — their own vehicle's visit,
-- nothing else in the branch. `internal_note` is redacted at the column
-- level (see the header), not by denying the row.
CREATE POLICY r_self ON "inspection_findings" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
CREATE TRIGGER inspection_findings_bump_version BEFORE UPDATE ON "inspection_findings"
  FOR EACH ROW EXECUTE FUNCTION bump_version();

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inspection_media" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"finding_id" varchar(26) NOT NULL,
	"job_card_id" varchar(26) NOT NULL,
	"kind" varchar(8) NOT NULL,
	"stage" varchar(8) DEFAULT 'before' NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"annotations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"uploaded_by" varchar(26)
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "inspection_media" ADD CONSTRAINT "inspection_media_org_id_organizations_id_fk"
    FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inspection_media_finding_idx" ON "inspection_media" ("org_id","finding_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inspection_media_job_idx" ON "inspection_media" ("org_id","job_card_id");
--> statement-breakpoint
ALTER TABLE "inspection_media" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "inspection_media" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "inspection_media" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "inspection_media" AS RESTRICTIVE FOR ALL
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
CREATE POLICY r_own ON "inspection_media" AS RESTRICTIVE FOR ALL
  USING (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() NOT IN ('own','assigned') OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
-- Media carries no internal-only field, so nothing to redact at the column
-- level — a customer's own job's evidence is simply visible, the same
-- narrowing as findings above.
CREATE POLICY r_self ON "inspection_media" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards))
  WITH CHECK (app_scope() <> 'self' OR job_card_id IN (SELECT id FROM job_cards));
--> statement-breakpoint
CREATE TRIGGER inspection_media_bump_version BEFORE UPDATE ON "inspection_media"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
