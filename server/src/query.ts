/** List, search, sort, filter and paginate — once, for every collection.
 *
 *  Written here rather than per route so that the soft-delete filter and the
 *  pagination bound cannot be forgotten by the twenty-ninth router. An unknown
 *  sort or filter key is a 400 rather than a silent fallback: a typo that is
 *  quietly ignored looks exactly like data that is quietly wrong.
 */
import {
  and,
  asc,
  count as countRows,
  desc,
  eq,
  getTableColumns,
  ilike,
  isNull,
  or,
  type SQL,
} from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import type { ListQuery, PageMeta } from '@salis/contract'
import { badRequest, notFound } from './http/errors'
import type { CollectionDef } from './registry'
import type { Tx } from './db/tenant'

type Columns = Record<string, PgColumn>

function columnsOf(def: CollectionDef): Columns {
  return getTableColumns(def.table) as unknown as Columns
}

function column(def: CollectionDef, name: string): PgColumn {
  const found = columnsOf(def)[name]
  if (!found) throw badRequest(`Unknown column "${name}".`)
  return found
}

/** Filters arrive as strings on the query string; the column decides what they
 *  mean. Passing a string where the column is a boolean would otherwise fail
 *  in the driver as a type error rather than as a readable 400. */
function coerce(col: PgColumn, value: string | number | boolean): unknown {
  switch (col.dataType) {
    case 'boolean':
      if (typeof value === 'boolean') return value
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      throw badRequest(`"${String(value)}" is not a boolean.`, col.name)
    case 'number': {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) throw badRequest(`"${String(value)}" is not a number.`, col.name)
      return parsed
    }
    default:
      return String(value)
  }
}

export interface ListOptions {
  /** Extra predicates the route adds — a parent id, a date window. */
  extra?: SQL[]
}

export interface ListResult {
  rows: Record<string, unknown>[]
  page: PageMeta
}

export async function listRows(
  tx: Tx,
  def: CollectionDef,
  query: ListQuery,
  options: ListOptions = {},
): Promise<ListResult> {
  const cols = columnsOf(def)
  const conditions: SQL[] = [...(options.extra ?? [])]

  if (!query.includeDeleted && cols.deletedAt) {
    conditions.push(isNull(cols.deletedAt))
  }

  if (query.q) {
    const term = `%${query.q.replace(/[%_]/g, (m: string) => `\\${m}`)}%`
    const matches = def.search
      .map((name) => cols[name])
      .filter((col): col is PgColumn => Boolean(col))
      .map((col) => ilike(col, term))
    if (matches.length > 0) {
      const combined = or(...matches)
      if (combined) conditions.push(combined)
    }
  }

  for (const [field, value] of Object.entries(query.filter ?? {})) {
    if (!def.filterable.includes(field)) {
      throw badRequest(`"${field}" cannot be filtered on this collection.`, field)
    }
    const col = column(def, field)
    conditions.push(eq(col, coerce(col, value as string | number | boolean)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const sort = parseSort(def, query.sort)
  const sortColumn = column(def, sort.column)

  const [{ value: total }] = await tx
    .select({ value: countRows() })
    .from(def.table)
    .where(where)

  const offset = (query.page - 1) * query.pageSize
  const rows = (await tx
    .select()
    .from(def.table)
    .where(where)
    .orderBy(sort.dir === 'asc' ? asc(sortColumn) : desc(sortColumn), asc(cols.id as PgColumn))
    .limit(query.pageSize)
    .offset(offset)) as unknown as Record<string, unknown>[]

  return {
    rows,
    page: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  }
}

function parseSort(def: CollectionDef, raw: string | undefined): { column: string; dir: 'asc' | 'desc' } {
  if (!raw) return def.defaultSort
  const [field, dir = 'asc'] = raw.split(':')
  if (!field || !def.sortable.includes(field)) {
    throw badRequest(`"${field}" cannot be sorted on this collection.`, 'sort')
  }
  if (dir !== 'asc' && dir !== 'desc') throw badRequest('Sort direction must be asc or desc.', 'sort')
  return { column: field, dir }
}

/** Detail lookup by ULID or by the human business code the design shows.
 *
 *  Returns 404 when the row belongs to another tenant, because RLS makes it
 *  invisible rather than forbidden — which is the behaviour we want: a 403
 *  would confirm that the record exists. */
export async function findOne(
  tx: Tx,
  def: CollectionDef,
  ref: string,
  options: { includeDeleted?: boolean } = {},
): Promise<Record<string, unknown>> {
  const cols = columnsOf(def)
  const idMatch = eq(cols.id as PgColumn, ref)
  const codeCol = def.codeColumn ? cols[def.codeColumn] : undefined
  const match = codeCol ? or(idMatch, eq(codeCol, ref)) : idMatch

  const conditions: SQL[] = [match as SQL]
  if (!options.includeDeleted && cols.deletedAt) conditions.push(isNull(cols.deletedAt))

  const [row] = (await tx
    .select()
    .from(def.table)
    .where(and(...conditions))
    .limit(1)) as unknown as Record<string, unknown>[]

  if (!row) throw notFound(def.entity.replace(/_/g, ' '))
  return row
}
