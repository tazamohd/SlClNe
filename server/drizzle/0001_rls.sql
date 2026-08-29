-- Row-level security, optimistic-concurrency and audit immutability.
--
-- Tenant isolation lives here rather than in a `WHERE` clause, because a
-- `WHERE` clause is something a developer has to remember and a policy is
-- something the database applies whether they remembered or not.
--
-- Note on policy combination: multiple PERMISSIVE policies are OR-ed, so
-- adding a "branch scope" permissive policy beside a "tenant scope" one would
-- *widen* access rather than narrow it. The narrowing policies below are
-- therefore RESTRICTIVE, which is AND-ed. (`RBAC.md`'s illustrative snippet
-- shows three permissive policies; taken literally it would let a branch-scoped
-- user read the whole organization.)

--> statement-breakpoint
-- Request context, set per transaction by the API with SET LOCAL. Each reader
-- returns NULL when unset, and every policy compares against it — so a
-- connection with no context set sees nothing at all. Failing closed is the
-- only safe default for an isolation primitive.
CREATE OR REPLACE FUNCTION app_org() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog AS
$$ SELECT nullif(current_setting('app.org_id', true), '') $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_branch() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog AS
$$ SELECT nullif(current_setting('app.branch_id', true), '') $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_user() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog AS
$$ SELECT nullif(current_setting('app.user_id', true), '') $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_scope() RETURNS text
  LANGUAGE sql STABLE PARALLEL SAFE SET search_path = pg_catalog AS
$$ SELECT nullif(current_setting('app.scope', true), '') $$;

--> statement-breakpoint
-- Optimistic concurrency. The version is bumped by the database, not by the
-- statement, so a hand-written UPDATE cannot leave a stale version behind and
-- let the next writer overwrite a change they never saw.
CREATE OR REPLACE FUNCTION bump_version() RETURNS trigger
  LANGUAGE plpgsql AS
$$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

--> statement-breakpoint
-- The audit log is append-only for everyone, including the table owner.
CREATE OR REPLACE FUNCTION audit_log_is_immutable() RETURNS trigger
  LANGUAGE plpgsql AS
$$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

--> statement-breakpoint
DO $$
DECLARE
  tenant_tables text[] := ARRAY[
    'branches','users','user_sessions','fleets','customers','vehicles','services',
    'job_cards','appointments','estimates','estimate_lines','invoices','invoice_lines',
    'payments','receipts','parts','inventory_movements','purchase_orders',
    'purchase_order_lines','technicians','departments','leads','opportunities',
    'campaigns','segments','crm_tasks','chart_of_accounts','journal_entries','expenses',
    'obd_devices','dtc_codes','oem_tools','integrations','kb_procedures','approval_lines',
    'diag_stages','diag_findings','diag_parts','diag_labour','diag_copies','ai_agents',
    'conversations','support_tickets'
  ];
  -- Tables that narrow again under the own / self / assigned scopes, and the
  -- column that decides who owns the row.
  owner_columns jsonb := '{
    "job_cards": "assigned_tech_id",
    "appointments": "technician_id",
    "crm_tasks": "created_by",
    "user_sessions": "user_id"
  }'::jsonb;
  t text;
  owner_col text;
  predicate text;
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    -- FORCE, so the migration role that owns the table is subject to the same
    -- policies. Without it the owner silently bypasses isolation.
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

    EXECUTE format($p$
      CREATE POLICY p_tenant ON %I AS PERMISSIVE FOR ALL
        USING (app_scope() = 'platform' OR org_id = app_org())
        WITH CHECK (app_scope() = 'platform' OR org_id = app_org())
    $p$, t);

    EXECUTE format($p$
      CREATE POLICY r_branch ON %I AS RESTRICTIVE FOR ALL
        USING (
          app_scope() NOT IN ('branch','own','self','assigned','external')
          OR branch_id IS NULL
          OR branch_id = app_branch()
        )
        WITH CHECK (
          app_scope() NOT IN ('branch','own','self','assigned','external')
          OR branch_id IS NULL
          OR branch_id = app_branch()
        )
    $p$, t);

    owner_col := owner_columns ->> t;
    IF owner_col IS NOT NULL THEN
      predicate := format(
        $c$app_scope() NOT IN ('own','self','assigned')
           OR %I = app_user()
           OR created_by = app_user()$c$, owner_col);
      EXECUTE format(
        'CREATE POLICY r_own ON %I AS RESTRICTIVE FOR ALL USING (%s) WITH CHECK (%s)',
        t, predicate, predicate);
    END IF;

    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION bump_version()',
      t || '_bump_version', t);
  END LOOP;
END $$;

--> statement-breakpoint
-- Organizations: a tenant sees itself, the platform role sees all of them.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_self ON organizations AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR id = app_org())
  WITH CHECK (app_scope() = 'platform' OR id = app_org());
--> statement-breakpoint
CREATE TRIGGER organizations_bump_version BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION bump_version();

--> statement-breakpoint
-- Audit log: org-scoped for reads, insert-only, never updated or deleted.
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant_read ON audit_log AS PERMISSIVE FOR SELECT
  USING (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE POLICY p_tenant_write ON audit_log AS PERMISSIVE FOR INSERT
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_immutable();
--> statement-breakpoint
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_immutable();

--> statement-breakpoint
-- Idempotency records are tenant-scoped: one organization's replay protection
-- must not be visible to, or collide with, another's.
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE idempotency_keys FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON idempotency_keys AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());

--> statement-breakpoint
-- Subscription requests and support tickets belong to a tenant; the remaining
-- control-plane tables (applications, system health, OTP challenges) are
-- pre-tenant by nature and are reachable only through platform-scoped routes.
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE subscription_requests FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY p_tenant ON subscription_requests AS PERMISSIVE FOR ALL
  USING (app_scope() = 'platform' OR org_id = app_org())
  WITH CHECK (app_scope() = 'platform' OR org_id = app_org());

--> statement-breakpoint
-- A deleted_at value is a soft delete, and every query filters on it. The
-- partial indexes keep those queries on an index rather than a sequential scan.
CREATE INDEX customers_live_idx ON customers (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX vehicles_live_idx ON vehicles (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX job_cards_live_idx ON job_cards (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX invoices_live_idx ON invoices (org_id, branch_id) WHERE deleted_at IS NULL;
--> statement-breakpoint
CREATE INDEX parts_live_idx ON parts (org_id, branch_id) WHERE deleted_at IS NULL;
