/** The API surface, read out of the route files rather than transcribed.
 *
 *  Two shapes produce endpoints and both are covered:
 *
 *  1. `server/src/registry.ts` describes each collection once, and
 *     `routes/collections.ts` generates eight uniform routes per collection
 *     (list, export, detail, create, update, delete, bulk-update,
 *     bulk-delete), gated by the collection's permission module. A
 *     hand-written endpoint list would have to be corrected every time a
 *     collection is added; this one follows.
 *  2. Everything with behaviour of its own — estimates, invoices, payments,
 *     procurement, OBD, auth — declares `app.<verb>(path)` explicitly.
 *
 *  Permission, tenant scope and idempotency are read from the handler body
 *  where the source states them, and left `null` where it does not, so an
 *  undocumented guard shows up as a gap instead of an invented claim.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { P } from './paths.mjs'

const PREFIX = '/api/v1'

function blankComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))
}

/** The slice of source belonging to one handler: from its `app.verb(` to the
 *  next one, which is close enough to attribute a `requirePermission` call to
 *  the route that makes it. */
function handlerBodies(source) {
  const marks = [...source.matchAll(/\n\s*app\.(get|post|patch|put|delete)\(\s*([`'"])((?:[^`'"\\]|\\.)*)\2/g)]
  return marks.map((m, i) => ({
    method: m[1].toUpperCase(),
    rawPath: m[3],
    body: source.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : source.length),
  }))
}

/** Module constants declared at the top of a route file
 *  (`const CLAIM_MODULE = 'insurance'`). A handler that guards with the
 *  constant rather than a literal would otherwise report its permission as
 *  `(dynamic: …)`, which is accurate but useless — the value is right there in
 *  the file. */
function moduleConstants(source) {
  const constants = new Map()
  for (const m of source.matchAll(/const (\w*MODULE\w*)\s*(?::[^=]+)?=\s*'([^']+)'/g)) {
    constants.set(m[1], m[2])
  }
  return constants
}

function guardsIn(body, constants = new Map()) {
  const permission = body.match(/requirePermission\(\s*\w+\s*,\s*'([^']+)'\s*,\s*'([^']+)'/)
  const dynamicPermission = body.match(/requirePermission\(\s*\w+\s*,\s*([\w.]+)\s*,\s*'([^']+)'/)
  const resolved = dynamicPermission ? constants.get(dynamicPermission[1]) : null
  return {
    permissionModule: permission
      ? permission[1]
      : resolved
        ? resolved
        : dynamicPermission
          ? `(dynamic: ${dynamicPermission[1]})`
          : null,
    permissionAction: permission ? permission[2] : dynamicPermission ? dynamicPermission[2] : null,
    requiresApproval: /requireApproval\(/.test(body),
    idempotent: /idempotenc/i.test(body),
    audited: /recordAudit|writeAudit|audit\(/.test(body),
    transactional: /\.transaction\(|withTransaction/.test(body),
    validates: /\.parse\(|safeParse\(/.test(body),
    emitsOtp: /otp/i.test(body),
  }
}

/** `server/src/registry.ts` parsed for the fields the API contract needs. */
export function extractCollections() {
  const source = blankComments(readFileSync(P.collections, 'utf8'))
  const collections = []
  for (const m of source.matchAll(/define\(\{([\s\S]*?)\n  \}\)/g)) {
    const body = m[1]
    const str = (field) => {
      const hit = body.match(new RegExp(`\\b${field}:\\s*'([^']*)'`))
      return hit ? hit[1] : null
    }
    const list = (field) => {
      const hit = body.match(new RegExp(`\\b${field}:\\s*\\[([^\\]]*)\\]`))
      return hit ? [...hit[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : []
    }
    const key = str('key')
    if (!key) continue
    const defaultSort = body.match(/defaultSort:\s*\{\s*column:\s*'([^']+)'\s*,\s*dir:\s*'([^']+)'/)
    collections.push({
      key,
      path: str('path') ?? key,
      table: (body.match(/table:\s*s\.(\w+)/) ?? [])[1] ?? null,
      module: str('module'),
      entity: str('entity'),
      search: list('search'),
      sortable: list('sortable'),
      filterable: list('filterable'),
      codeColumn: str('codeColumn'),
      defaultSort: defaultSort ? { column: defaultSort[1], dir: defaultSort[2] } : null,
      writable: /writable:\s*true/.test(body),
    })
  }
  return collections
}

/** The eight routes `routes/collections.ts` generates, and the grant each one
 *  checks. Read from that file so a change to the guard shows up here. */
function genericRouteShapes() {
  const source = blankComments(readFileSync(join(P.routesDir, 'collections.ts'), 'utf8'))
  const shapes = []
  const constants = moduleConstants(source)
  for (const h of handlerBodies(source)) {
    const suffix = h.rawPath.replace(/^\$\{base\}/, '').replace(/^base$/, '')
    const guards = guardsIn(h.body, constants)
    const action = (h.body.match(/requirePermission\([^)]*?'([vcedax])'\s*\)/) ?? [])[1] ?? guards.permissionAction
    shapes.push({
      method: h.method,
      suffix: suffix === 'base' ? '' : suffix,
      action,
      guards,
      purpose:
        suffix.includes('export') ? 'Export the filtered collection as a file'
        : suffix.includes('bulk-update') ? 'Apply one patch to many rows'
        : suffix.includes('bulk-delete') ? 'Soft-delete many rows'
        : suffix.includes(':id') && h.method === 'GET' ? 'Read one row by ULID or business code'
        : suffix.includes(':id') && h.method === 'PATCH' ? 'Update one row (optimistic concurrency on version)'
        : suffix.includes(':id') && h.method === 'DELETE' ? 'Soft-delete one row'
        : h.method === 'POST' ? 'Create one row'
        : 'List the collection with search, sort, filter and pagination',
    })
  }
  return shapes
}

export function extractApi(collections) {
  const endpoints = []

  // 1 — generated collection routes.
  const shapes = genericRouteShapes()
  for (const collection of collections) {
    for (const shape of shapes) {
      const isWrite = ['POST', 'PATCH', 'DELETE'].includes(shape.method)
      if (isWrite && !collection.writable) continue
      endpoints.push({
        id: `API-${collection.key}-${shape.method}${shape.suffix.replace(/[^a-z-]/gi, '') || '-list'}`.toUpperCase(),
        method: shape.method,
        path: `${PREFIX}/${collection.path}${shape.suffix}`,
        source: 'server/src/routes/collections.ts (generated from server/src/registry.ts)',
        kind: 'GENERATED',
        domain: collection.module,
        purpose: `${shape.purpose} — ${collection.entity ?? collection.key}.`,
        authentication: 'Bearer access token (required; app.ts authenticates by default)',
        permissionModule: collection.module,
        permissionAction: shape.action,
        tenantScope: 'org_id via Postgres row-level security (server/drizzle/0001_rls.sql)',
        branchScope: 'branch_id where the principal is branch-scoped',
        entity: collection.entity,
        table: collection.table,
        search: collection.search,
        sortable: collection.sortable,
        filterable: collection.filterable,
        defaultSort: collection.defaultSort,
        idempotent: shape.guards.idempotent,
        audited: shape.guards.audited,
      })
    }
  }

  // 2 — explicitly declared routes.
  const files = [
    ...readdirSync(P.routesDir).filter((f) => f.endsWith('.ts') && f !== 'collections.ts').map((f) => ({ file: `server/src/routes/${f}`, abs: join(P.routesDir, f) })),
    { file: 'server/src/auth/routes.ts', abs: P.authRoutes },
  ]
  for (const { file, abs } of files) {
    const source = blankComments(readFileSync(abs, 'utf8'))
    const constants = moduleConstants(source)
    for (const h of handlerBodies(source)) {
      if (h.rawPath.includes('${')) {
        // `routes/history.ts` generates `/<collection>/:id/history` per
        // collection; expand it rather than emitting a template string.
        if (file.endsWith('history.ts')) {
          for (const collection of collections) {
            endpoints.push(
              explicitEndpoint(h, `/${collection.path}/:id/history`, file, collection.module, collections, constants),
            )
          }
        }
        continue
      }
      endpoints.push(explicitEndpoint(h, h.rawPath, file, null, collections, constants))
    }
  }

  return endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
}

function explicitEndpoint(h, path, file, domainHint, collections, constants) {
  const guards = guardsIn(h.body, constants)
  const isProbe = path === '/health' || path === '/ready'
  const isAuth = file.includes('auth/routes.ts')
  const isPublic = path.startsWith('/public') || isProbe
  const domain =
    domainHint ??
    guards.permissionModule ??
    (isAuth ? 'auth' : collections.find((c) => path.startsWith(`/${c.path}`))?.module ?? 'platform')
  return {
    id: `API-${h.method}-${path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`.toUpperCase(),
    method: h.method,
    path: isProbe ? path : `${PREFIX}${path}`,
    source: file,
    kind: 'EXPLICIT',
    domain,
    purpose: null,
    authentication: isPublic
      ? 'None — listed in PUBLIC_PATHS or isPublicAuthPath (server/src/app.ts)'
      : 'Bearer access token (required)',
    // `routes/history.ts` resolves its module from the collection definition
    // at runtime, so the literal in the source is a variable. The caller knows
    // which collection this expansion is for; prefer that over `(dynamic: …)`.
    permissionModule: domainHint ?? guards.permissionModule,
    permissionAction: guards.permissionAction,
    requiresApproval: guards.requiresApproval,
    tenantScope: isPublic ? 'none — unauthenticated surface' : 'org_id via Postgres row-level security',
    branchScope: isPublic ? 'n/a' : 'branch_id where the principal is branch-scoped',
    idempotent: guards.idempotent,
    audited: guards.audited,
    transactional: guards.transactional,
    validates: guards.validates,
  }
}
