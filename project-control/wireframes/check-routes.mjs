#!/usr/bin/env node
/** Assert that every route the wireframe gallery prints is a route the app serves.
 *
 *  The gallery is hand-drawn — the wireframes are SVG-ish HTML and stay that way.
 *  The one thing worth machine-checking is the route strings, because a wireframe
 *  captioned with a URL that 404s costs the next reader ten minutes.
 *
 *  Two claims are checked:
 *    1. Every route printed in a browser-frame URL bar (`.wf-url`) or a caption
 *       `<code>` exists verbatim in `.routes-reference.tsv` (generated from
 *       `project-control/MASTER_REGISTRY.json`).
 *    2. Every card marked `DESIGN PROPOSAL · NOT BUILT` prints no route at all —
 *       its frame carries `class="wf proposal"` and its URL bar says so in words.
 *
 *  Run: node project-control/wireframes/check-routes.mjs
 *  Exit 0 when the page is honest, 1 with a report when it is not. */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PAGE = join(here, 'template.html')
const REFERENCE = join(here, '.routes-reference.tsv')

/** The browser frames print a host on some cards and a bare path on others.
 *  Both are the same claim about a route. */
const HOST = 'salisauto.com'

/** Wording a card uses in place of a URL when the screen was never routed. */
const NO_ROUTE = 'no route — not in the registry'

function registryRoutes() {
  const lines = readFileSync(REFERENCE, 'utf8').trim().split('\n')
  const [header, ...rows] = lines
  if (!header.startsWith('route\t')) {
    throw new Error(`${REFERENCE}: expected a 'route' first column, got ${header}`)
  }
  return new Set(rows.map((row) => row.split('\t')[0]))
}

/** Every route-shaped token the page prints, with where it came from.
 *  A caption may name two sibling routes separated by ' · '. */
function printedRoutes(html) {
  const found = []
  const push = (raw, source) => {
    for (const part of raw.split('·')) {
      const token = part.trim().replace(new RegExp(`^${HOST}`), '')
      // Only tokens that look like a route are claims about routing. A caption
      // that names a shared component (`Skeletons`) is not.
      if (token.startsWith('/')) found.push({ route: token, source })
    }
  }
  for (const [, raw] of html.matchAll(/<span class="wf-url">([^<]*)<\/span>/g)) {
    if (raw.trim() === NO_ROUTE) continue
    push(raw, 'url bar')
  }
  for (const [, raw] of html.matchAll(/<div class="cap">.*?<code>([^<]*)<\/code>/g)) {
    push(raw, 'caption')
  }
  return found
}

/** Each `<div class="screen">…</div>` card, so a proposal card can be checked
 *  as a whole: badge, dashed frame and wordless URL bar have to agree. */
function cards(html) {
  return html.split('<div class="screen">').slice(1)
}

function main() {
  const html = readFileSync(PAGE, 'utf8')
  const routes = registryRoutes()
  const failures = []

  const printed = printedRoutes(html)
  for (const { route, source } of printed) {
    if (!routes.has(route)) failures.push(`unknown route ${route} (printed in a ${source})`)
  }

  let proposals = 0
  for (const card of cards(html)) {
    const proposed = card.includes('DESIGN PROPOSAL · NOT BUILT')
    const dashed = card.includes('class="wf proposal"')
    const wordless = card.includes(NO_ROUTE)
    if (!proposed && !dashed && !wordless) continue
    proposals += 1
    const name = (card.match(/<b>([^<]*)<\/b>/) ?? [, '(unnamed card)'])[1]
    if (!(proposed && dashed && wordless)) {
      failures.push(
        `card "${name}": a not-built card needs the badge, the dashed frame and the wordless URL bar — ` +
          `has badge=${proposed}, dashed=${dashed}, wordless=${wordless}`
      )
    }
    const leaked = printedRoutes(`<div class="screen">${card}`)
    for (const { route } of leaked) {
      failures.push(`card "${name}" is marked not built but still prints ${route}`)
    }
  }

  const unique = new Set(printed.map((p) => p.route))
  if (failures.length) {
    console.error(`FAIL — ${failures.length} problem(s) in ${PAGE}`)
    for (const failure of failures) console.error(`  · ${failure}`)
    process.exit(1)
  }
  console.log(
    `PASS — ${printed.length} printed route(s), ${unique.size} distinct, all in the registry; ` +
      `${proposals} card(s) marked not built print none.`
  )
}

main()
