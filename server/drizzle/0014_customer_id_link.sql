-- The `self` scope, which until now narrowed nothing.
--
-- `ROLE_META` gives the customer role `scope: 'self'`, and `CustomerPortal.tsx`
-- says in as many words that "own-scope does the filtering … because the
-- server's RLS says so". It did not. `0001_rls.sql` narrows `self` twice —
-- `r_branch` by branch, and `r_own` on the four tables carrying an owner
-- column — and `r_own`'s owner columns are `assigned_tech_id`,
-- `technician_id`, `created_by` and `user_id`. None of them is the customer.
--
-- So a self-scoped principal reading `vehicles` saw every vehicle in the
-- branch, and reading `job_cards` saw none of their own. The reason nobody had
-- noticed is that the customer role held no `v` on either table, so the portal
-- only ever rendered error alerts. Granting it the modules its screens read is
-- the point of this change, and doing that without an identity narrowing would
-- turn four error alerts into a branch-wide data leak.
--
-- Three things happen here:
--
--   1. `users.customer_id` — the link the schema never had. A `users` row is
--      an account; a `customers` row is a person the workshop bills. Nothing
--      joined them, so "which customer is this principal" had no answer.
--   2. `app_customer()`, set per transaction beside the existing context
--      readers, returning NULL when unset so a connection with no context set
--      matches nothing.
--   3. `r_self`, a RESTRICTIVE policy on every RLS-enabled table, **denying by
--      default**. A table is visible under `self` only if it is named in the
--      map below. That is the opposite of the `r_own` design, and deliberately
--      so: `r_own` lists the tables it narrows and lets the rest through,
--      which is why granting the customer `jobcards: v` would otherwise have
--      handed them `kb_procedures`, `dtc_codes` and every `diag_*` row in the
--      branch along with their own job card.
--
-- `tests/customer-self-scope.test.ts` asserts the deny-by-default holds for
-- every RLS-enabled table, so a table added by a later migration fails the
-- suite rather than quietly becoming readable.

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "customer_id" varchar(26);
--> statement-breakpoint
CREATE INDEX "users_customer_idx" ON "users" USING btree ("org_id","customer_id");

--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_customer() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog AS
$$ SELECT nullif(current_setting('app.customer_id', true), '') $$;

--> statement-breakpoint
-- `r_own` must stop claiming to narrow `self`. Its predicate asks whether the
-- caller is the assigned technician or the row's creator, and a customer is
-- neither — so on `job_cards` and `appointments` it evaluated to false for the
-- one scope it was meant to help, hiding a customer's own service from them.
--
-- Each policy is restated in full rather than patched, because the two tables
-- do not share a predicate: `0002_own_scope_tech.sql` already rewrote
-- `job_cards` to resolve the assignment through `technicians.user_id` (F-015),
-- and regenerating it from `0001`'s template would silently undo that. The
-- only change on each is the scope list.
--
-- `user_sessions` and its `self` entry are left alone: there `app_user()`
-- genuinely is the owner, and a customer managing their own sessions must stay
-- narrowed by it.

--> statement-breakpoint
DROP POLICY r_own ON job_cards;
--> statement-breakpoint
CREATE POLICY r_own ON job_cards AS RESTRICTIVE FOR ALL
  USING (
    app_scope() NOT IN ('own','assigned')
    OR created_by = app_user()
    OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())
  )
  WITH CHECK (
    app_scope() NOT IN ('own','assigned')
    OR created_by = app_user()
    OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())
  );

--> statement-breakpoint
DROP POLICY r_own ON appointments;
--> statement-breakpoint
CREATE POLICY r_own ON appointments AS RESTRICTIVE FOR ALL
  USING (
    app_scope() NOT IN ('own','assigned')
    OR technician_id = app_user()
    OR created_by = app_user()
  )
  WITH CHECK (
    app_scope() NOT IN ('own','assigned')
    OR technician_id = app_user()
    OR created_by = app_user()
  );

--> statement-breakpoint
DROP POLICY r_own ON crm_tasks;
--> statement-breakpoint
CREATE POLICY r_own ON crm_tasks AS RESTRICTIVE FOR ALL
  USING (app_scope() NOT IN ('own','assigned') OR created_by = app_user())
  WITH CHECK (app_scope() NOT IN ('own','assigned') OR created_by = app_user());

--> statement-breakpoint
DO $$
DECLARE
  -- What a self-scoped principal may reach, and how the row is tied to them.
  -- `services` is the workshop's price list, which the booking screen needs and
  -- which is not anybody's private data. The line tables narrow through their
  -- parent: the subquery runs under the caller's own RLS, so `invoice_lines`
  -- resolves to the lines of the invoices this customer can already see.
  self_predicates jsonb := '{
    "users":               "id = app_user()",
    "user_sessions":       "user_id = app_user()",
    "customers":           "id = app_customer()",
    "vehicles":            "customer_id = app_customer()",
    "job_cards":           "customer_id = app_customer()",
    "appointments":        "customer_id = app_customer()",
    "estimates":           "customer_id = app_customer()",
    "invoices":            "customer_id = app_customer()",
    "customer_feedback":   "customer_id = app_customer()",
    "insurance_policies":  "customer_id = app_customer()",
    "loan_contracts":      "customer_id = app_customer()",
    "estimate_lines":      "estimate_id IN (SELECT id FROM estimates)",
    "invoice_lines":       "invoice_id IN (SELECT id FROM invoices)",
    "services":            "true"
  }'::jsonb;
  -- The request plumbing writes these under whatever principal is in hand: the
  -- audit row for a customer's booking, its idempotency record, and the
  -- organization row `/auth/me` reads back. Denying them would break the very
  -- mutation the grants exist to allow, and none is reachable through a
  -- collection route the customer role holds.
  plumbing text[] := ARRAY['audit_log','idempotency_keys','organizations'];
  t text;
  predicate text;
BEGIN
  FOR t IN
    SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relrowsecurity
       AND c.relkind = 'r'
       AND n.nspname = current_schema()
       AND NOT (c.relname = ANY (plumbing))
     ORDER BY c.relname
  LOOP
    predicate := format('app_scope() <> %L OR (%s)', 'self',
                        coalesce(self_predicates ->> t, 'false'));
    EXECUTE format(
      'CREATE POLICY r_self ON %I AS RESTRICTIVE FOR ALL USING (%s) WITH CHECK (%s)',
      t, predicate, predicate);
  END LOOP;
END $$;
