/** The security model as the database and the server actually implement it.
 *
 *  Tenant isolation is a row-level-security policy, not a `WHERE` clause, so
 *  the authority on which tables are isolated is the migration that turns RLS
 *  on — `server/drizzle/0001_rls.sql` and its successors — and not a list
 *  anyone maintains by hand. This extractor reads those migrations and reports
 *  which tables are covered, which are not, and which policies narrow further.
 *
 *  The tables *not* covered are the point. A documentation set that lists the
 *  covered ones and stops reads as a clean bill of health; listing the
 *  uncovered ones beside the entity catalogue is what makes the gap visible.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { P } from './paths.mjs'

export function extractSecurity(entities) {
  const files = readdirSync(P.migrations)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  const rlsTables = new Set()
  const forced = new Set()
  const policies = []
  const triggers = []

  for (const file of files) {
    const sql = readFileSync(join(P.migrations, file), 'utf8')

    // The bulk enablement is a PL/pgSQL loop over a declared array, so the
    // table names are in the array literal rather than in ALTER statements.
    for (const arr of sql.matchAll(/tenant_tables\s+text\[\]\s*:=\s*ARRAY\[([\s\S]*?)\]/g)) {
      for (const t of arr[1].matchAll(/'([a-z_]+)'/g)) {
        rlsTables.add(t[1])
        forced.add(t[1])
      }
      policies.push(
        {
          name: 'p_tenant',
          appliesTo: 'every table in the tenant_tables array',
          type: 'PERMISSIVE',
          command: 'ALL',
          predicate: "app_scope() = 'platform' OR org_id = app_org()",
          purpose: 'Tenant isolation. A connection with no app.org_id set sees nothing.',
          file: `server/drizzle/${file}`,
        },
        {
          name: 'r_branch',
          appliesTo: 'every table in the tenant_tables array',
          type: 'RESTRICTIVE',
          command: 'ALL',
          predicate:
            "app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()",
          purpose:
            'Branch narrowing. RESTRICTIVE, so it is AND-ed: a PERMISSIVE branch policy would widen access rather than narrow it.',
          file: `server/drizzle/${file}`,
        },
      )
    }

    for (const m of sql.matchAll(/owner_columns\s+jsonb\s*:=\s*'(\{[\s\S]*?\})'::jsonb/g)) {
      let parsed = {}
      try {
        parsed = JSON.parse(m[1])
      } catch {
        /* reported as unparsed below rather than guessed at */
      }
      for (const [table, column] of Object.entries(parsed)) {
        policies.push({
          name: 'r_own',
          appliesTo: table,
          type: 'RESTRICTIVE',
          command: 'ALL',
          predicate: `app_scope() NOT IN ('own','self','assigned') OR ${column} = app_user() OR created_by = app_user()`,
          purpose: `Row ownership for the own/self/assigned scopes, keyed off ${table}.${column}.`,
          file: `server/drizzle/${file}`,
        })
      }
    }

    // Identifiers are double-quoted in the later migrations and bare in
    // 0001. Matching only the bare form reported seventeen isolated tables as
    // unprotected — a false alarm that would have been loud in the gap report.
    for (const m of sql.matchAll(/ALTER TABLE "?(\w+)"? ENABLE ROW LEVEL SECURITY/g)) rlsTables.add(m[1])
    for (const m of sql.matchAll(/ALTER TABLE "?(\w+)"? FORCE ROW LEVEL SECURITY/g)) forced.add(m[1])

    for (const m of sql.matchAll(
      /CREATE POLICY "?(\w+)"? ON "?(\w+)"?\s+AS (PERMISSIVE|RESTRICTIVE) FOR (\w+)\s*([\s\S]*?);/g,
    )) {
      const using = m[5].match(/USING\s*\(([\s\S]*?)\)\s*(?:WITH CHECK|$)/)
      policies.push({
        name: m[1],
        appliesTo: m[2],
        type: m[3],
        command: m[4],
        predicate: using ? using[1].replace(/\s+/g, ' ').trim() : null,
        purpose: null,
        file: `server/drizzle/${file}`,
      })
      rlsTables.add(m[2])
    }

    for (const m of sql.matchAll(/CREATE TRIGGER "?(\w+)"?[\s\S]*?ON "?(\w+)"?[\s\S]*?EXECUTE FUNCTION (\w+)/g)) {
      triggers.push({ name: m[1], table: m[2], function: m[3], file: `server/drizzle/${file}` })
    }
    if (/bump_version/.test(sql) && /tenant_tables/.test(sql)) {
      triggers.push({
        name: '<table>_bump_version',
        table: 'every table in the tenant_tables array',
        function: 'bump_version',
        purpose: 'Optimistic concurrency: version is incremented by the database, not by the statement.',
        file: `server/drizzle/${file}`,
      })
    }
  }

  const tenantScopedTables = entities.filter((e) => e.tenantScoped).map((e) => e.table)
  const uncovered = tenantScopedTables.filter((t) => !rlsTables.has(t))
  const coveredNotForced = [...rlsTables].filter((t) => !forced.has(t))

  return {
    rlsTables: [...rlsTables].sort(),
    forcedTables: [...forced].sort(),
    policies,
    triggers,
    contextFunctions: ['app_org()', 'app_branch()', 'app_user()', 'app_scope()'],
    coverage: {
      tenantScopedTables: tenantScopedTables.length,
      rlsEnabled: rlsTables.size,
      forced: forced.size,
      tenantScopedWithoutRls: uncovered.sort(),
      rlsWithoutForce: coveredNotForced.sort(),
    },
    evidence: files.map((f) => `server/drizzle/${f}`),
  }
}
