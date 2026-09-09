/** Renders the deck from its template plus the generated datasets.
 *  Run after `npm run registry` so the deck reads the current registry, and
 *  after `npm run golden` so it reads the current golden-path run.
 *      node project-control/tracker/build-deck.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const load = (p) => fs.readFileSync(path.join(here, p), 'utf8')
const embed = (p) => JSON.stringify(JSON.parse(load(p)))
/** The golden-path run may not have happened yet. `null` is the honest value
 *  for that, and the template renders it as UNMEASURED rather than as zero
 *  passing — which is the whole reason the panel stopped being a checkbox. */
const embedOptional = (p) => (fs.existsSync(path.join(here, p)) ? embed(p) : 'null')

let html = load('template.html')
for (const [token, file] of [['__DATA__', 'tracker-data.json'],
                             ['__PLAN__', 'plan-structure.json'],
                             ['__LIVE__', '../AGENTS_LIVE.json']]) {
  if (!html.includes(token)) throw new Error(`template is missing ${token}`)
  html = html.replace(token, embed(file))
}
if (!html.includes('__GOLDEN__')) throw new Error('template is missing __GOLDEN__')
html = html.replace('__GOLDEN__', embedOptional('../GOLDEN_PATHS.json'))

const out = path.join(here, 'deck.html')
fs.writeFileSync(out, html)
console.log(`deck: ${(html.length / 1024).toFixed(0)} kB → ${path.relative(path.resolve(here, '../..'), out)}`)
