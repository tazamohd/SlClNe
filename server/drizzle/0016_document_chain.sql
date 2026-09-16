-- The document chain, joined (DF-007).
--
-- Three links existed only as re-keying: an approved estimate did not point at
-- the invoice raised from it, a verified customer OTP signature lived in the
-- audit trail and nowhere on the estimate, and a kept appointment did not point
-- at the job card it became. Each column below is one of those links.
--
-- The two partial unique indexes make the "raise it twice" case impossible in
-- the database rather than only in the route that checks for it. Partial, so
-- the many invoices with no estimate behind them (a parts sale, a fee) and the
-- job cards opened at the counter are unaffected, and a soft-deleted document
-- frees its source to be raised again.
--
-- `customer_signed_at` is the customer saying yes. It is deliberately NOT the
-- estimate's `status`: moving an estimate to `approved` is the shop authorising
-- the spend, which `POST /estimates/:id/approve` gates on the approval ceiling
-- and on segregation of duties. An OTP from the customer must not route around
-- either, so the signature is its own fact on the row.

ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "customer_signed_at" timestamptz;
--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "customer_signature_channel" varchar(16);
--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "customer_signature_challenge_id" varchar(26);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "estimate_id" varchar(26);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_estimate_idx" ON "invoices" ("org_id","estimate_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_estimate_once_idx" ON "invoices" ("org_id","estimate_id") WHERE "estimate_id" is not null and "deleted_at" is null;
--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN IF NOT EXISTS "appointment_id" varchar(26);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_cards_appointment_idx" ON "job_cards" ("org_id","appointment_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "job_cards_appointment_once_idx" ON "job_cards" ("org_id","appointment_id") WHERE "appointment_id" is not null and "deleted_at" is null;
