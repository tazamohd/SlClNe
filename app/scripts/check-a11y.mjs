/** The accessibility gate — a static linter over the JSX, run without a browser.
 *
 *  There is no chromium in CI here, so an axe-core runtime sweep cannot run: it
 *  needs a real DOM with computed styles and a live accessibility tree. What we
 *  *can* do without a browser is catch the structural mistakes that axe would
 *  otherwise flag at runtime — the ones that live in the source markup rather
 *  than in the rendered result — before they reach a screen. That is what this
 *  does, by tokenising each `.tsx` into its JSX opening tags and checking six
 *  anti-patterns against them.
 *
 *  It is deliberately a *source* check, not a semantic one, so it trades a
 *  little precision for running anywhere. The heuristics below name their own
 *  blind spots; where a rule cannot prove a violation statically (a name that
 *  arrives through a spread, a label wired up in a parent) it stays silent
 *  rather than cry wolf, because a linter screens ignore is worse than none.
 *
 *  Ratchets against BASELINE: it exits non-zero the moment the total climbs
 *  above the number recorded when this landed, so a regression fails the build
 *  while the known, screen-level backlog (documented in docs/A11Y_AUDIT.md)
 *  does not. Lower BASELINE as that backlog is burned down.
 *
 *      node scripts/check-a11y.mjs [--list]
 *
 *  The seven rules, each mapping to an axe-core rule family:
 *    img-alt              <img> with no `alt`                        (image-alt)
 *    noninteractive-role  onClick/onKeyDown on a non-interactive
 *                         element missing `role` or `tabIndex`       (interactive-role)
 *    control-name         <button> with no text and no aria-label    (button-name)
 *    field-label          <input>/<select>/<textarea> with no label,
 *                         id, aria-label or aria-labelledby          (label)
 *    link-name            <a> with no text and no aria-label         (link-name)
 *    svg-hidden           raw <svg> that is neither aria-hidden nor
 *                         a labelled role="img"                      (svg-img-alt)
 *    button-type          <button> without explicit type attribute   (n/a)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Total violations when this checker landed, after the shared UI primitives
 *  were fixed. The residue is screen- and shell-level and is tracked, file by
 *  file, in docs/A11Y_AUDIT.md. The gate fails when the count rises above this,
 *  so new screens cannot quietly reintroduce a pattern the primitives solved.
 *  Ratchet it downward — never up — as screens are fixed. */
const BASELINE = 0

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(APP, 'src')
const listAll = process.argv.includes('--list')

// ── File walk ────────────────────────────────────────────────────────────────

function tsxFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...tsxFiles(full))
    else if (entry.name.endsWith('.tsx')) out.push(full)
  }
  return out
}

// ── JSX tokeniser ────────────────────────────────────────────────────────────
//
// A regex cannot slice a JSX opening tag apart on its own: attribute values hold
// `>` inside arrow functions (`onClick={() => …}`) and inside strings, so the
// naive `<[^>]*>` stops in the wrong place. This scans character by character,
// tracking brace depth and skipping string literals, so the `>` it stops on is
// the real end of the tag. Comments and the string/template bodies are stepped
// over so their contents are never mistaken for markup.

/** Every JSX opening tag in `src`, each with its raw attribute text and, for a
 *  non-self-closing element, the inner source up to its matching close tag. */
function scanTags(src) {
  const tags = []
  let i = 0
  const n = src.length

  while (i < n) {
    const ch = src[i]

    // Skip line and block comments so `// <img>` in prose is never a tag.
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i)
      i = nl === -1 ? n : nl
      continue
    }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i)
      i = end === -1 ? n : end + 2
      continue
    }

    // A tag opens at `<` followed by a name char (or `/` for a close tag, which
    // we don't emit but must step past cleanly).
    if (ch === '<' && /[A-Za-z/]/.test(src[i + 1] ?? '')) {
      const start = i
      const nameMatch = /^<\/?([A-Za-z][A-Za-z0-9.]*)/.exec(src.slice(i, i + 40))
      if (!nameMatch) {
        i += 1
        continue
      }
      const name = nameMatch[1]
      // Walk to the tag's closing `>` at brace depth 0, skipping strings.
      let j = i + nameMatch[0].length
      let depth = 0
      let selfClosing = false
      while (j < n) {
        const c = src[j]
        if (c === '{') depth++
        else if (c === '}') depth--
        else if (depth === 0 && (c === '"' || c === "'" || c === '`')) {
          j = skipString(src, j)
          continue
        } else if (c === '{' || c === '}') {
          // handled above
        } else if (depth === 0 && c === '>') {
          selfClosing = src[j - 1] === '/'
          break
        }
        j++
      }
      const attrs = src.slice(i + nameMatch[0].length, j).replace(/\/$/, '')
      // Inner source for an open element, so control/link name rules can read
      // the text between the tags. Depth-counted on this tag name; buttons and
      // anchors do not nest inside themselves in this codebase, so a counter is
      // enough and far cheaper than a full parse.
      const isClose = nameMatch[0].startsWith('</')
      // Close tags are stepped over — they matter for `readInner`'s depth count
      // but are never themselves subjects of a rule.
      if (!isClose) {
        const inner = selfClosing ? null : readInner(src, j + 1, name)
        tags.push({ name, attrs, inner, offset: start })
      }
      i = j + 1
      continue
    }

    i++
  }
  return tags
}

/** Advance past a string or template literal that starts at `q`. */
function skipString(src, q) {
  const quote = src[q]
  let k = q + 1
  while (k < src.length) {
    if (src[k] === '\\') {
      k += 2
      continue
    }
    if (src[k] === quote) return k + 1
    k++
  }
  return k
}

/** Source between `<name …>` at `from` and its matching `</name>`. */
function readInner(src, from, name) {
  let depth = 1
  let i = from
  const open = new RegExp(`<${name}[\\s/>]`)
  const close = `</${name}`
  while (i < src.length) {
    if (src[i] === '<') {
      const rest = src.slice(i, i + name.length + 3)
      if (rest.startsWith(close)) {
        depth--
        if (depth === 0) return src.slice(from, i)
      } else if (open.test(src.slice(i, i + name.length + 2))) {
        depth++
      }
    }
    i++
  }
  return src.slice(from, i)
}

// ── Attribute helpers ────────────────────────────────────────────────────────

const has = (attrs, attr) => new RegExp(`(^|\\s)${attr}(=|\\s|$)`).test(attrs)
const hasSpread = (attrs) => attrs.includes('{...')

/** Is the control at `offset` wrapped by a `<label>`? A field nested in a label
 *  is named implicitly by that label's text (the Checklist/Chip pattern), so it
 *  needs no `id` or `aria-label`. Labels don't nest, so the last unmatched
 *  `<label` before the offset is enough to prove containment. */
function insideLabel(src, offset) {
  const before = src.slice(0, offset)
  return before.lastIndexOf('<label') > before.lastIndexOf('</label')
}

/** Does the inner source carry a discernible accessible name? True when, after
 *  the presentational children (icons, decorative svg) are removed, anything
 *  text-bearing is left — literal words, or an expression that interpolates a
 *  label/children/translation. Icon-only controls fall through to a violation. */
function hasTextContent(inner) {
  if (inner == null) return true // no body captured — do not guess
  let body = inner
    .replace(/<Icon\b[^>]*\/>/g, '')
    .replace(/<Icon\b[\s\S]*?<\/Icon>/g, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/<[^>]*aria-hidden[^>]*>/g, '')
  // Any letter or digit left after the icons are gone is a visible name — a
  // pagination "1" and a phone number "+966…" name their controls as surely as
  // a word does.
  if (/[A-Za-z0-9]/.test(stripTags(body))) return true
  // An expression that pulls in a name: t('…'), {children}, {label}, {title}.
  if (/\{[^}]*\b(t|children|label|title|name|heading|text)\b[^}]*\}/.test(body)) return true
  return false
}

const stripTags = (s) => s.replace(/<[^>]*>/g, ' ')

const NON_INTERACTIVE = new Set(['div', 'span', 'li', 'p', 'section', 'article', 'header', 'footer'])

// ── Rules ────────────────────────────────────────────────────────────────────

const RULES = {
  'img-alt': {
    title: 'Image missing alt text',
    axe: 'image-alt',
    test: (tag) => tag.name === 'img' && !has(tag.attrs, 'alt'),
  },
  'noninteractive-role': {
    title: 'Click/key handler on a non-interactive element without role + tabIndex',
    axe: 'interactive-role',
    test: (tag) => {
      if (!NON_INTERACTIVE.has(tag.name)) return false
      const handler = has(tag.attrs, 'onClick') || has(tag.attrs, 'onKeyDown')
      if (!handler) return false
      // A handler needs *both* a role announcing what it is and a tabIndex
      // putting it in the tab order — missing either makes it keyboard-dead.
      return !(has(tag.attrs, 'role') && has(tag.attrs, 'tabIndex'))
    },
  },
  'control-name': {
    title: 'Button with no accessible name (no text, no aria-label)',
    axe: 'button-name',
    test: (tag) => {
      if (tag.name !== 'button') return false
      if (hasSpread(tag.attrs)) return false // name may arrive through the spread
      if (has(tag.attrs, 'aria-label') || has(tag.attrs, 'aria-labelledby') || has(tag.attrs, 'title'))
        return false
      return !hasTextContent(tag.inner)
    },
  },
  'field-label': {
    title: 'Form control with no label, id, aria-label or aria-labelledby',
    axe: 'label',
    test: (tag, src) => {
      if (!['input', 'select', 'textarea'].includes(tag.name)) return false
      if (hasSpread(tag.attrs)) return false // id/aria may arrive through the spread
      if (/type=(['"])(hidden|submit|button|reset)\1/.test(tag.attrs)) return false
      if (insideLabel(src, tag.offset)) return false // named by its wrapping label
      // An `id` is how a sibling `<label htmlFor>` reaches this control; we cannot
      // see the label statically, so an id is taken as evidence one exists.
      return !(
        has(tag.attrs, 'id') ||
        has(tag.attrs, 'aria-label') ||
        has(tag.attrs, 'aria-labelledby')
      )
    },
  },
  'link-name': {
    title: 'Link with no discernible text',
    axe: 'link-name',
    test: (tag) => {
      if (tag.name !== 'a') return false
      if (hasSpread(tag.attrs)) return false
      if (has(tag.attrs, 'aria-label') || has(tag.attrs, 'aria-labelledby') || has(tag.attrs, 'title'))
        return false
      return !hasTextContent(tag.inner)
    },
  },
  'svg-hidden': {
    title: 'Raw <svg> neither aria-hidden nor a labelled role="img"',
    axe: 'svg-img-alt',
    test: (tag) => {
      if (tag.name !== 'svg') return false
      if (has(tag.attrs, 'aria-hidden')) return false
      // A meaningful graphic must both claim the image role and carry a name.
      const labelled = has(tag.attrs, 'aria-label') || has(tag.attrs, 'aria-labelledby')
      return !(/role=(['"])img\1/.test(tag.attrs) && labelled)
    },
  },
  'button-type': {
    title: 'Button without explicit type (defaults to submit inside forms)',
    axe: 'n/a',
    test: (tag) => {
      if (tag.name !== 'button') return false
      if (hasSpread(tag.attrs)) return false
      return !has(tag.attrs, 'type')
    },
  },
}

// ── Run ──────────────────────────────────────────────────────────────────────

function lineOf(src, offset) {
  let line = 1
  for (let i = 0; i < offset && i < src.length; i++) if (src[i] === '\n') line++
  return line
}

const findings = Object.fromEntries(Object.keys(RULES).map((id) => [id, []]))

for (const file of tsxFiles(SRC).sort()) {
  const src = fs.readFileSync(file, 'utf8')
  const rel = path.relative(APP, file)
  const tags = scanTags(src)
  for (const tag of tags) {
    for (const [id, rule] of Object.entries(RULES)) {
      if (rule.test(tag, src)) findings[id].push(`${rel}:${lineOf(src, tag.offset)}`)
    }
  }
}

let total = 0
const bold = (s) => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s)
const dim = (s) => (process.stdout.isTTY ? `\x1b[2m${s}\x1b[0m` : s)

console.log(bold('\nAccessibility check — static JSX scan\n'))
for (const [id, rule] of Object.entries(RULES)) {
  const hits = findings[id]
  total += hits.length
  const head = `  ${hits.length === 0 ? '·' : '✗'} ${id.padEnd(20)} ${hits.length}`
  console.log(hits.length ? bold(head) : dim(head), dim(rule.title))
  if (hits.length && (listAll || hits.length <= 25)) {
    for (const hit of hits) console.log(`      ${hit}`)
  } else if (hits.length) {
    for (const hit of hits.slice(0, 25)) console.log(`      ${hit}`)
    console.log(dim(`      … and ${hits.length - 25} more (run with --list)`))
  }
}

console.log(`\n  ${bold('Total')}  ${total}   ${dim(`baseline ${BASELINE}`)}\n`)

if (total > BASELINE) {
  console.error(
    `Accessibility gate failed: ${total} violations exceed the baseline of ${BASELINE}.\n` +
      `Fix the new violation, or if it is a deliberate, reviewed exception, adjust BASELINE in scripts/check-a11y.mjs.\n`
  )
  process.exit(1)
}
process.exit(0)
