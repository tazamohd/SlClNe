/** Writing helpers shared by every generator.
 *
 *  Two things matter here. First, every generated file carries a banner naming
 *  the generator and the sources it was derived from, so a reader who finds a
 *  surprising number knows exactly where to check it and an editor who is
 *  about to hand-edit the file is told not to. Second, writes are idempotent:
 *  a file whose content has not changed is not rewritten, so `git status`
 *  after `docs:generate` shows real drift rather than a timestamp churn on
 *  every file in the tree.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { P } from './paths.mjs'

export const written = []

export function banner(generator, sources, extra = '') {
  return [
    '<!-- GENERATED FILE — DO NOT EDIT BY HAND.',
    `     Generator: tools/docs/generators/${generator}`,
    '     Regenerate: npm run docs:generate',
    '     Derived from:',
    ...sources.map((s) => `       - ${s}`),
    extra ? `     ${extra}` : null,
    '-->',
    '',
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/** Two generators writing the same path overwrite each other on every pass and
 *  the run never settles — a failure that presents as "generation did not
 *  stabilise" and gives no hint which file is at fault. Catching the collision
 *  where it happens names the file immediately. */
function assertSingleOwner(rel) {
  if (written.some((w) => w.path === rel)) {
    throw new Error(
      `Two generators wrote ${rel} in the same pass. Exactly one generator may own a path; ` +
        'rename one of them.',
    )
  }
}

export function write(absPath, content) {
  mkdirSync(dirname(absPath), { recursive: true })
  const normalised = content.endsWith('\n') ? content : `${content}\n`
  let previous = null
  try {
    previous = readFileSync(absPath, 'utf8')
  } catch {
    /* new file */
  }
  const rel = relative(P.root, absPath).replace(/\\/g, '/')
  assertSingleOwner(rel)
  if (previous === normalised) {
    written.push({ path: rel, changed: false })
    return false
  }
  writeFileSync(absPath, normalised)
  written.push({ path: rel, changed: true })
  return true
}

export function writeJson(absPath, value) {
  return write(absPath, JSON.stringify(value, null, 2))
}

/** A Markdown table from rows of plain values. Pipes inside a cell are
 *  escaped; an empty table renders an explicit "none" line rather than a
 *  headerless skeleton that reads as an oversight. */
export function table(headers, rows, emptyNote = '_None._') {
  if (!rows.length) return emptyNote
  const cell = (v) =>
    v === null || v === undefined || v === ''
      ? '—'
      : String(Array.isArray(v) ? v.join(', ') : v).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n')
}

export function mermaid(body) {
  return ['```mermaid', body.trim(), '```'].join('\n')
}

/** A Mermaid-safe identifier. Node ids cannot contain punctuation Mermaid
 *  reads as syntax, and a label containing a quote breaks the diagram
 *  silently — it renders as an error box rather than failing the build. */
export function mid(value) {
  return String(value).replace(/[^A-Za-z0-9_]/g, '_')
}

export function mlabel(value) {
  return String(value).replace(/["\[\]{}()|]/g, ' ').replace(/\s+/g, ' ').trim()
}
