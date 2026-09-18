-- Journal lines (DF-001, DF-003): the table that makes the ledger double-entry.
--
-- `journal_entries` carried a single debit and a single credit per row and no
-- account reference at all, so an "entry" could not say which accounts it
-- moved. That is why `checkJournalBalanced` — which takes *lines* and requires
-- at least two — had no caller it could possibly have had: there were no lines
-- to give it.
--
-- This adds them. A journal entry is now a header plus two or more lines, each
-- naming an account and carrying a debit or a credit. `account_code` is stored
-- beside `account_id` deliberately: the code is what a person reads on a trial
-- balance and what a posting rule is written against, and it must stay legible
-- in the row even if the account is later renamed.
--
-- Same discipline as every other tenant table since 0001: tenant isolation
-- permissive, branch narrowing restrictive, FORCE so the owning role is subject
-- to both, and the version bumped by the database rather than by the statement.
-- A new migration rather than an edit to an applied one: 0000-0014 are history.

CREATE TABLE IF NOT EXISTS "journal_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"journal_entry_id" varchar(26) NOT NULL,
	"account_id" varchar(26) NOT NULL,
	"account_code" varchar(24) NOT NULL,
	"debit_halalas" bigint DEFAULT 0 NOT NULL,
	"credit_halalas" bigint DEFAULT 0 NOT NULL,
	"narration" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_lines_entry_idx" ON "journal_lines" ("org_id","journal_entry_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_lines_account_idx" ON "journal_lines" ("org_id","account_id");
--> statement-breakpoint
ALTER TABLE "journal_lines" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "journal_lines" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON "journal_lines" AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY r_branch ON "journal_lines" AS RESTRICTIVE FOR ALL
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
-- Deny-by-default for the `self` scope, the same discipline 0014 applied to
-- every RLS-enabled table. A customer must never see the general ledger: it
-- carries every other customer's revenue, the workshop's margin and its
-- payables. There is no self predicate to write, so the answer is a flat
-- refusal rather than a narrowing.
--
-- `tests/customer-self-scope.test.ts` asserts this holds for every table RLS is
-- on, which is how the omission was caught here rather than in a portal.
CREATE POLICY r_self ON "journal_lines" AS RESTRICTIVE FOR ALL
  USING (app_scope() <> 'self')
  WITH CHECK (app_scope() <> 'self');
--> statement-breakpoint
CREATE TRIGGER journal_lines_bump_version BEFORE UPDATE ON "journal_lines"
  FOR EACH ROW EXECUTE FUNCTION bump_version();
--> statement-breakpoint
-- The posting routes write entries that are already posted and already
-- balanced. A draft header with no lines is the shape the seed carries, so the
-- constraint is on the lines, not on the header.
ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "source" varchar(32);
--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "source_id" varchar(26);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_entries_source_idx" ON "journal_entries" ("org_id","source","source_id");
