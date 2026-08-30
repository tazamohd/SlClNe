-- The audit log is append-only, and that has to hold for a statement that
-- matches no rows as well as one that matches many.
--
-- `audit_log_no_update` and `audit_log_no_delete` were FOR EACH ROW, so they
-- fired once per affected row and not at all when none were affected. Row
-- visibility is decided by RLS before the trigger is consulted, which left a
-- gap: outside a tenant context `p_tenant_read` matches nothing, so
-- `update audit_log set action = 'tampered'` touched no rows, raised nothing,
-- and returned success. Nothing was tampered with — there was nothing to
-- tamper with — but the caller could not tell a refusal from a no-op, and the
-- guarantee read as conditional on how much the caller could already see.
--
-- Statement-level triggers fire once per statement whether or not any row
-- matches, so the refusal no longer depends on RLS state, on the grant table,
-- or on whether the connected role happens to own the table. Nothing in the
-- application updates or deletes this table, so there is no legitimate caller
-- to break.
DROP TRIGGER IF EXISTS audit_log_no_update ON audit_log;
--> statement-breakpoint
DROP TRIGGER IF EXISTS audit_log_no_delete ON audit_log;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_is_immutable();
--> statement-breakpoint
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_is_immutable();
--> statement-breakpoint
-- TRUNCATE bypasses both of the above: it is neither an UPDATE nor a DELETE,
-- and it removes every row without producing one for a row-level trigger to
-- see. An append-only table that can be emptied in one statement is not
-- append-only, so it is refused on the same footing.
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_is_immutable();
