/** Reverse-engineers the data model out of `server/src/db/schema.ts`.
 *
 *  The schema file is the only place the physical model exists — the Drizzle
 *  table definitions are what `drizzle-kit` emits migrations from — so the
 *  entity catalogue, the data dictionary and every ERD are derived from it
 *  rather than transcribed. A hand-written ERD drifts the first time a column
 *  is added; this one cannot, because `docs:check` re-runs the parse and
 *  compares.
 *
 *  This is a text parse, not a TypeScript one. That is a deliberate trade: it
 *  needs no build step and no running database, and the schema file uses one
 *  consistent shape throughout (`export const x = pgTable('y', { ... })`).
 *  Anything it cannot parse is reported rather than silently dropped, so the
 *  failure mode is a visible gap and not a quietly incomplete catalogue.
 */
import { readFileSync } from 'node:fs'
import { P } from './paths.mjs'

/** Replaces every comment with spaces of the same length.
 *
 *  The brace/paren/quote walkers below are text scanners, not a TypeScript
 *  parser, so an apostrophe in prose ("the caller's side") reads as an opening
 *  string literal and desynchronises everything after it — one table went
 *  missing from the catalogue exactly that way. Blanking rather than deleting
 *  keeps every offset identical, so comment text can still be recovered from
 *  the original source by the same index. */
function blankComments(source) {
  const out = source.split('')
  let i = 0
  let inString = null
  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]
    if (inString) {
      if (ch === '\\') { i += 2; continue }
      if (ch === inString) inString = null
      i += 1
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; i += 1; continue }
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2)
      const stop = end === -1 ? source.length : end + 2
      for (let k = i; k < stop; k += 1) if (out[k] !== '\n') out[k] = ' '
      i = stop
      continue
    }
    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i)
      const stop = end === -1 ? source.length : end
      for (let k = i; k < stop; k += 1) out[k] = ' '
      i = stop
      continue
    }
    i += 1
  }
  return out.join('')
}

const TYPE_MAP = {
  varchar: 'varchar',
  text: 'text',
  integer: 'integer',
  bigint: 'bigint',
  boolean: 'boolean',
  timestamp: 'timestamptz',
  date: 'date',
  jsonb: 'jsonb',
  doublePrecision: 'double precision',
}

/** Splits a balanced `{...}` body at top-level commas. Column definitions
 *  contain nested braces (`{ length: 26 }`) and parentheses, so a naive
 *  `split(',')` mis-slices them. */
function topLevelSegments(body) {
  const out = []
  let depth = 0
  let current = ''
  let inString = null
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]
    if (inString) {
      current += ch
      if (ch === inString && body[i - 1] !== '\\') inString = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      current += ch
      continue
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1
    if (ch === '}' || ch === ')' || ch === ']') depth -= 1
    if (ch === ',' && depth === 0) {
      out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) out.push(current)
  return out
}

/** Reads forward from `start` (the index of an opening bracket) to its match. */
function balanced(source, start, open, close) {
  let depth = 0
  let inString = null
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i]
    if (inString) {
      if (ch === inString && source[i - 1] !== '\\') inString = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/** The doc comment immediately above a declaration, flattened to one line. */
function leadingComment(source, declIndex) {
  const before = source.slice(0, declIndex)
  const close = before.lastIndexOf('*/')
  if (close === -1) return null
  // Only count it if nothing but whitespace sits between the comment and the
  // declaration — otherwise an unrelated earlier comment gets attributed here.
  if (before.slice(close + 2).trim() !== '') return null
  // The nearest preceding `/*` — not the nearest `/**`. A section banner
  // (`/* ---- workshop core ---- */`) is a comment too, and skipping past it
  // to an earlier doc comment swallowed hundreds of lines of unrelated source
  // into one entity's description.
  const open = before.lastIndexOf('/*', close - 1)
  if (open === -1 || before.slice(open, open + 3) !== '/**') return null
  return before
    .slice(open + 3, close)
    .split('\n')
    .map((l) => l.replace(/^\s*\*?\s?/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseColumn(segment) {
  const nameMatch = segment.match(/^\s*(\w+)\s*:\s*(\w+)\s*\(/)
  if (!nameMatch) return null
  const [, property, builder] = nameMatch
  const colMatch = segment.match(/\(\s*'([^']+)'/)
  const column = colMatch ? colMatch[1] : property
  const lengthMatch = segment.match(/length:\s*(\w+)/)
  const defaultMatch = segment.match(/\.default\(([^)]*)\)/)
  const refMatch = segment.match(/\.references\(\s*\(\)\s*=>\s*(\w+)\.(\w+)/)
  return {
    property,
    column,
    type: TYPE_MAP[builder] ?? builder,
    length: lengthMatch ? lengthMatch[1] : null,
    notNull: segment.includes('.notNull()'),
    primaryKey: segment.includes('.primaryKey()'),
    unique: segment.includes('.unique()'),
    hasDefault: segment.includes('.default'),
    default: defaultMatch ? defaultMatch[1].trim() || 'now()' : segment.includes('.defaultNow()') ? 'now()' : null,
    references: refMatch ? { table: refMatch[1], column: refMatch[2] } : null,
    money: /_halalas$/.test(column),
    presentational: /_label$/.test(column),
  }
}

const UNIVERSAL = [
  'id',
  'org_id',
  'branch_id',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'deleted_at',
  'version',
]

/** The `tenant`/`audit` spreads expand at runtime, not in the text. Parsing
 *  them once here means every table that spreads them reports the columns it
 *  actually has in Postgres rather than the columns literally typed in its
 *  body. */
function parseSpreads(source) {
  const spreads = {}
  for (const name of ['tenant', 'audit', 'softDelete', 'stamps']) {
    const decl = source.indexOf(`const ${name} = {`)
    if (decl === -1) continue
    const open = source.indexOf('{', decl)
    const close = balanced(source, open, '{', '}')
    if (close === -1) continue
    spreads[name] = topLevelSegments(source.slice(open + 1, close))
      .map(parseColumn)
      .filter(Boolean)
  }
  return spreads
}

export function extractEntities() {
  const original = readFileSync(P.schema, 'utf8')
  const source = blankComments(original)
  const spreads = parseSpreads(source)
  const entities = []
  const unparsed = []

  const declRe = /export const (\w+) = pgTable\(/g
  let match
  while ((match = declRe.exec(source))) {
    const [, property] = match
    const parenStart = source.indexOf('(', match.index + `export const ${property} = pgTable`.length - 1)
    const parenEnd = balanced(source, parenStart, '(', ')')
    if (parenEnd === -1) {
      unparsed.push(property)
      continue
    }
    const call = source.slice(parenStart + 1, parenEnd)
    const tableMatch = call.match(/^\s*'([^']+)'/)
    if (!tableMatch) {
      unparsed.push(property)
      continue
    }
    const table = tableMatch[1]
    const bodyStart = call.indexOf('{')
    const bodyEnd = balanced(call, bodyStart, '{', '}')
    const body = call.slice(bodyStart + 1, bodyEnd)

    const columns = []
    for (const segment of topLevelSegments(body)) {
      const trimmed = segment.trim()
      const spread = trimmed.match(/^\.\.\.(\w+)/)
      if (spread) {
        columns.push(...(spreads[spread[1]] ?? []))
        continue
      }
      const col = parseColumn(segment)
      if (col) columns.push(col)
    }

    // The third `pgTable` argument, when present, carries indexes and
    // composite uniques.
    const after = call.slice(bodyEnd + 1)
    const indexes = []
    for (const m of after.matchAll(/(uniqueIndex|index)\(\s*'([^']+)'\s*\)\s*\.on\(([^)]*)\)/g)) {
      indexes.push({
        name: m[2],
        unique: m[1] === 'uniqueIndex',
        columns: [...m[3].matchAll(/\w+\.(\w+)/g)].map((c) => c[1]),
      })
    }

    const columnNames = new Set(columns.map((c) => c.column))
    entities.push({
      id: `ENT-${table.toUpperCase().replace(/_/g, '-')}`,
      property,
      table,
      description: leadingComment(original, match.index),
      columns,
      indexes,
      primaryKey: columns.filter((c) => c.primaryKey).map((c) => c.column),
      foreignKeys: columns
        .filter((c) => c.references)
        .map((c) => ({ column: c.column, referencesProperty: c.references.table, referencesColumn: c.references.column })),
      tenantScoped: columnNames.has('org_id'),
      branchScoped: columnNames.has('branch_id'),
      softDelete: columnNames.has('deleted_at'),
      versioned: columnNames.has('version'),
      audited: columnNames.has('created_by') && columnNames.has('updated_by'),
      moneyColumns: columns.filter((c) => c.money).map((c) => c.column),
      presentationalColumns: columns.filter((c) => c.presentational).map((c) => c.column),
      missingUniversal: UNIVERSAL.filter((u) => !columnNames.has(u)),
    })
  }

  // Resolve foreign keys from the Drizzle property name to the SQL table name.
  const byProperty = new Map(entities.map((e) => [e.property, e]))
  for (const entity of entities) {
    for (const fk of entity.foreignKeys) {
      fk.referencesTable = byProperty.get(fk.referencesProperty)?.table ?? fk.referencesProperty
    }
  }

  return { entities, unparsed, source: 'server/src/db/schema.ts' }
}
