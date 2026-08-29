-- F-015: `job_cards.assigned_tech_id` holds a `technicians.id`, but the r_own
-- policy compared it to `app_user()` — a *user* id. The two namespaces never
-- intersect, so an own-scoped technician saw no job assigned to them: the
-- technician portal's core list was empty for the exact user it exists for.
--
-- The policy now resolves the assignment through `technicians.user_id`. The
-- subquery runs under the caller's own RLS context (technicians is itself
-- policy-guarded), so it can only ever match technician rows the caller could
-- already see: their own organization, and under branch narrowing their own
-- branch. `created_by` is kept as the second leg, unchanged — a job someone
-- own-scoped created is still theirs even before it is assigned.
--
-- A new migration rather than an edit to 0001: applied migrations are history.

--> statement-breakpoint
DROP POLICY IF EXISTS r_own ON job_cards;
--> statement-breakpoint
CREATE POLICY r_own ON job_cards AS RESTRICTIVE FOR ALL
  USING (
    app_scope() NOT IN ('own','self','assigned')
    OR created_by = app_user()
    OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())
  )
  WITH CHECK (
    app_scope() NOT IN ('own','self','assigned')
    OR created_by = app_user()
    OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())
  );
--> statement-breakpoint
-- The lookup the policy (and the QC-independence check in the workshop route)
-- performs: technician row by user id.
CREATE INDEX IF NOT EXISTS technicians_user_idx ON technicians (org_id, user_id);
