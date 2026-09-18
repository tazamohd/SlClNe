-- Campaign CRUD gap + honest send dispatch (build-order item 7).
--
-- `start_date`/`end_date` back the campaign form's existing date fields,
-- which had no column to land in before this (the generic write route was
-- never registered for `campaigns` at all — see `server/src/registry.ts`).
-- `last_dispatched_at`/`last_dispatch_mock` record when
-- `POST /crm/campaigns/:id/send` last dispatched this campaign and whether
-- that came from the mock transport — never a delivery or recipient count,
-- since this deployment resolves no audience for a campaign to report one.
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "start_date" date;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "end_date" date;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "last_dispatched_at" timestamptz;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "last_dispatch_mock" boolean;
