/** The authorization model, read from the contract package the server
 *  enforces with.
 *
 *  `packages/contract/src/rbac.ts` is the single matrix: the server's
 *  `security/permissions.ts` reads it directly, and the frontend copy in
 *  `app/src/data/generated/rbac.ts` is asserted identical by
 *  `server/tests/rbac-parity.test.ts`. So the matrix in the documentation is
 *  this file, not a third transcription of it — a third copy is exactly how
 *  the five-letter/six-letter grant confusion recorded in that source
 *  survived as long as it did.
 */
import { readFileSync } from 'node:fs'
import { P } from './paths.mjs'

const ACTION_NAMES = {
  v: 'view',
  c: 'create',
  e: 'edit',
  d: 'delete',
  a: 'approve',
  x: 'export',
}

/** The object literal a declaration opens, from its first `{` to the matching
 *  one. Slicing to the end of the file instead is how one block's parse walks
 *  into the next. */
function boundedBlock(source, declaration) {
  const start = source.indexOf(declaration)
  if (start === -1) return ''
  const open = source.indexOf('{', start)
  if (open === -1) return ''
  let depth = 0
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open, i + 1)
    }
  }
  return source.slice(open)
}

export function extractRbac() {
  const source = readFileSync(P.contractRbac, 'utf8')

  const enumOf = (name) => {
    const block = source.match(new RegExp(`export const ${name} = z\\.enum\\(\\[([\\s\\S]*?)\\]\\)`))
    return block ? [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : []
  }

  const modules = enumOf('moduleId')
  const roles = enumOf('roleId')
  const scopes = enumOf('dataScope')

  // The PERMS block must be bounded at its own closing brace, not read to the
  // end of the file. `hr`, `callcenter` and `procurement` are each both a
  // module and a role, so an unbounded scan ran on into ROLE_META, matched
  // those three role entries as if they were module rows, and overwrote their
  // real grants with an empty object — three of twenty-eight modules silently
  // reported as denied to everyone.
  const matrix = {}
  const permsBlock = boundedBlock(source, 'export const PERMS')
  for (const row of permsBlock.matchAll(/'([a-z]+)':\s*\{([^}]*)\}/g)) {
    const moduleName = row[1]
    if (!modules.includes(moduleName)) continue
    matrix[moduleName] = {}
    for (const cell of row[2].matchAll(/'([a-z]+)':\s*'([vcedax]*)'/g)) {
      matrix[moduleName][cell[1]] = cell[2]
    }
  }

  // Role metadata: data scope and approval ceiling.
  const roleMeta = {}
  const metaBlock = boundedBlock(source, 'export const ROLE_META')
  for (const row of metaBlock.matchAll(/'?([a-z]+)'?:\s*\{([^}]*)\}/g)) {
    if (!roles.includes(row[1])) continue
    const scope = row[2].match(/scope:\s*'([^']+)'/)
    // The source states the ceiling in riyals (`limitSar`); the server
    // compares halalas. Converting here keeps both units in the catalogue so
    // a reader never has to guess which one a number is in.
    const limit = row[2].match(/limitSar:\s*([\w.]+)/)
    const limitSar = limit ? (limit[1] === 'null' ? null : Number(limit[1])) : undefined
    roleMeta[row[1]] = {
      scope: scope ? scope[1] : null,
      approvalLimitSar: limitSar,
      approvalCeilingHalalas: limitSar === null || limitSar === undefined ? limitSar : limitSar * 100,
      unlimited: limitSar === null,
    }
  }

  // Segregation of duties pairs.
  const sod = []
  const sodBlock = source.match(/export const SOD[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (sodBlock) {
    for (const m of sodBlock[1].matchAll(/\{([^}]*)\}/g)) {
      const entry = {}
      for (const field of m[1].matchAll(/(\w+):\s*'([^']*)'/g)) entry[field[1]] = field[2]
      if (Object.keys(entry).length) sod.push(entry)
    }
  }

  // Field-level redaction.
  const hiddenFields = []
  const hiddenBlock = source.match(/export const FIELD_RULES[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (hiddenBlock) {
    for (const m of hiddenBlock[1].matchAll(/\{\s*field:\s*'([^']+)'\s*,\s*ar:\s*'([^']*)'\s*,\s*hidden:\s*\[([^\]]*)\]/g)) {
      hiddenFields.push({
        field: m[1],
        fieldAr: m[2],
        hiddenFrom: [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1]),
      })
    }
  }

  const cells = []
  for (const moduleName of modules) {
    for (const role of roles) {
      const grant = matrix[moduleName]?.[role] ?? ''
      cells.push({
        module: moduleName,
        role,
        grant,
        actions: [...grant].map((a) => ACTION_NAMES[a]).filter(Boolean),
        denied: grant === '',
      })
    }
  }

  return {
    modules,
    roles,
    scopes,
    actions: ACTION_NAMES,
    matrix,
    roleMeta,
    sod,
    hiddenFields,
    cells,
    totals: {
      modules: modules.length,
      roles: roles.length,
      cells: cells.length,
      granted: cells.filter((c) => !c.denied).length,
      denied: cells.filter((c) => c.denied).length,
    },
    evidence: 'packages/contract/src/rbac.ts',
  }
}
