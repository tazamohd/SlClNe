/** The one implementation of "which `t()` keys does this file use, and which
 *  are translated".
 *
 *  It lived inside `check-i18n.mjs`, so anything else needing the same answer
 *  re-derived it with a regex and quietly disagreed. The registry did exactly
 *  that: a cruder pattern counted long gap-notice strings as untranslated
 *  literals where the gate classifies them dynamic, and reported ten screens
 *  as an Arabic gap on a codebase the gate calls fully covered. Two answers to
 *  one question is worse than either answer.
 *
 *  Imported by `check-i18n.mjs` and `build-registry.mjs`. Neither may
 *  reimplement it. */
import { readFileSync } from 'node:fs'

// ── Extract the keys defined by a `Record<string,string>` module ─────────────
// Both ar.ts (JSON-stringified) and ar-overrides.ts keep one entry per line with
// the key as a leading string literal, so a single line-anchored regex covers
// both without evaluating the TS.
const KEY_RE = /^\s*"((?:\\.|[^"\\])*)"\s*:/gm
export function recordKeys(file) {
  const text = readFileSync(file, 'utf8')
  const keys = new Set()
  for (const m of text.matchAll(KEY_RE)) keys.add(JSON.parse(`"${m[1]}"`))
  return keys
}

// ── Scan one source file for `t(...)` call sites ─────────────────────────────
// Returns { literals: string[], dynamic: number }. A call counts as a literal
// only when its sole argument is a plain string closed immediately by `)`; a
// template with `${…}` interpolation or anything else is dynamic.
const UNESCAPE = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' }
export function scanFile(text) {
  const literals = []
  let dynamic = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== 't' || text[i + 1] !== '(') continue
    const prev = text[i - 1]
    if (prev && /[\w.$]/.test(prev)) continue // part of an identifier / member access
    let j = i + 2
    while (j < text.length && /\s/.test(text[j])) j++
    const quote = text[j]
    if (quote !== '"' && quote !== "'" && quote !== '`') {
      dynamic++ // t(identifier), t(a ?? 'b'), t(expr) …
      continue
    }
    // Read the string literal, unescaping as we go.
    let value = ''
    let interpolated = false
    let closed = false
    let k = j + 1
    for (; k < text.length; k++) {
      const c = text[k]
      if (c === '\\') {
        const n = text[++k]
        value += UNESCAPE[n] ?? n
      } else if (c === quote) {
        closed = true
        break
      } else if (quote === '`' && c === '$' && text[k + 1] === '{') {
        interpolated = true
        value += c
      } else {
        value += c
      }
    }
    if (!closed) {
      dynamic++
      continue
    }
    // The literal must be the whole argument: next non-space char is `)`.
    let m = k + 1
    while (m < text.length && /\s/.test(text[m])) m++
    if (interpolated || text[m] !== ')') dynamic++
    else literals.push(value)
    i = k
  }
  return { literals, dynamic }
}
