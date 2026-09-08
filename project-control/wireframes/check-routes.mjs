#!/usr/bin/env node
/** Assert that every route the wireframe gallery prints is a route the app serves.
 *
 *  The gallery is hand-drawn — the wireframes are SVG-ish HTML and stay that way.
 *  The one thing worth machine-checking is the route strings, because a wireframe
 *  captioned with a URL that 404s costs the next reader ten minutes.
 *
 *  Three claims are checked:
 *    1. Every route printed in a browser-frame URL bar (`.wf-url`), a caption
 *       `<code>`, or a route-flow chip exists verbatim in `.routes-reference.tsv`
 *       (generated from `project-control/MASTER_REGISTRY.json`).
 *    2. Every card marked `DESIGN PROPOSAL · NOT BUILT` prints no route *of its
 *       own* — its frame carries `class="wf proposal"` and its URL bar says so in
 *       words. Its flow still names its neighbours, which is the point of a flow,
 *       so the leak check reads only the card's own url bar and caption.
 *    3. Every card carries a route flow, and exactly the steps the card itself
 *       draws are lit — a flow whose lit chip disagrees with the caption is a
 *       flow that has drifted from the screen underneath it.
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
 *  A caption may name two sibling routes separated by ' · '.
 *
 *  `sources` narrows which of the three places to read. The not-built check
 *  passes the card's own two, because a flow chip naming a neighbouring route is
 *  a claim about that neighbour, not about this card. */
function printedRoutes(html, sources = ['url bar', 'caption', 'flow']) {
  const found = []
  const push = (raw, source) => {
    for (const part of raw.split('·')) {
      const token = part.trim().replace(new RegExp(`^${HOST}`), '')
      // Only tokens that look like a route are claims about routing. A caption
      // that names a shared component (`Skeletons`) is not.
      if (token.startsWith('/')) found.push({ route: token, source })
    }
  }
  if (sources.includes('url bar')) {
    for (const [, raw] of html.matchAll(/<span class="wf-url">([^<]*)<\/span>/g)) {
      if (raw.trim() === NO_ROUTE) continue
      push(raw, 'url bar')
    }
  }
  if (sources.includes('caption')) {
    for (const [, raw] of html.matchAll(/<div class="cap">.*?<code>([^<]*)<\/code>/g)) {
      push(raw, 'caption')
    }
  }
  if (sources.includes('flow')) {
    for (const [, raw] of html.matchAll(FLOW_CHIP)) push(raw, 'flow')
  }
  return found
}

/** One chip of a route flow: a label and the route it lives at. A chip for a
 *  screen that was never routed says `not built` instead, which `push` drops
 *  because it does not start with a slash. */
const FLOW_CHIP = /<span class="node[^"]*"><b>[^<]*<\/b><code>([^<]*)<\/code><\/span>/g

/** The routes a card's flow lights up, i.e. the steps it claims to draw. */
function litRoutes(card) {
  const lit = []
  for (const [, classes, route] of card.matchAll(
    /<span class="node([^"]*)"><b>[^<]*<\/b><code>([^<]*)<\/code>/g
  )) {
    if (/\bon\b/.test(classes)) lit.push(route.trim())
  }
  return lit
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
  let flows = 0
  for (const card of cards(html)) {
    const name = (card.match(/<b>([^<]*)<\/b>/) ?? [, '(unnamed card)'])[1]
    const proposed = card.includes('DESIGN PROPOSAL · NOT BUILT')
    const dashed = card.includes('class="wf proposal"')
    const wordless = card.includes(NO_ROUTE)

    // A card drawing a screen carries the flow that screen sits in. The
    // reference section at the end draws universal states, which belong to no
    // route and so to no flow.
    const own = printedRoutes(`<div class="screen">${card}`, ['caption']).map((p) => p.route)
    if (card.includes('class="routeflow"')) {
      flows += 1
      const lit = litRoutes(card)
      if (!lit.length) failures.push(`card "${name}": its flow lights up no step`)
      const missing = own.filter((route) => !lit.includes(route))
      const extra = lit.filter((route) => route !== 'not built' && !own.includes(route))
      for (const route of missing) {
        failures.push(`card "${name}" draws ${route} but its flow does not light that step`)
      }
      for (const route of extra) {
        failures.push(`card "${name}" lights ${route} in its flow but does not draw it`)
      }
      if (proposed && lit.some((route) => route !== 'not built')) {
        failures.push(`card "${name}" is marked not built but lights a routed step`)
      }
    } else if (own.length) {
      failures.push(`card "${name}" prints a route but carries no route flow`)
    }

    if (!proposed && !dashed && !wordless) continue
    proposals += 1
    if (!(proposed && dashed && wordless)) {
      failures.push(
        `card "${name}": a not-built card needs the badge, the dashed frame and the wordless URL bar — ` +
          `has badge=${proposed}, dashed=${dashed}, wordless=${wordless}`
      )
    }
    // Only the card's own two places: a flow chip naming a neighbour is a claim
    // about that neighbour, and every flow route is checked against the registry
    // above regardless.
    const leaked = printedRoutes(`<div class="screen">${card}`, ['url bar', 'caption'])
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
      `${flows} route flow(s) agree with the screen they sit above; ` +
      `${proposals} card(s) marked not built print none of their own.`
  )
}

main()
