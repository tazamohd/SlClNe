/** Builds the master capability registry — the authoritative release inventory.
 *
 *  Everything here is *discovered*, never transcribed. Screen counts in plans and
 *  READMEs are dated snapshots; this file is what the release gates, the route
 *  tests and the follow-up deck actually read. If a hand-written total ever
 *  disagrees with this output, the total is stale.
 *
 *      node scripts/build-registry.mjs
 *
 *  Emits:
 *    project-control/MASTER_REGISTRY.json      the full inventory
 *    project-control/STATUS.json               rollups per surface, module, agent
 *    project-control/TEST_STATUS.json          suite coverage derived from the specs
 *    project-control/BLOCKERS.json             computed blockers (flags that gate release)
 *    project-control/tracker/tracker-data.json dataset for the follow-up deck
 *    src/data/generated/master-registry.ts     typed export the app routes/tests read
 *    docs/SALIS_AUTO_MASTER_MATRIX.md          the per-capability matrix
 *    docs/MASTER_SCOPE_REGISTRY.md             inventory by surface
 *    docs/MASTER_GAP_REPORT.md                 what is missing, by severity
 *    docs/MASTER_RBAC_MATRIX.md                the live 14 x 28 matrix
 *    docs/MASTER_DEPENDENCY_GRAPH.md           wave/group dependency order
 *    docs/MASTER_AGENT_OWNERSHIP.md            path globs per agent
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { recordKeys, scanFile } from './lib/i18n-scan.mjs'
import { arabicStateFrom, layoutFacts } from './lib/screen-facts.mjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const PROJECT = path.join(REPO, 'project')
const CONTROL = path.join(REPO, 'project-control')
const DOCS = path.join(REPO, 'docs')

const read = (p) => fs.readFileSync(p, 'utf8')
const readApp = (rel) => read(path.join(APP, rel))
/** The three shapes the date stamp is written in. Each captures the date, so
 *  the same list both locates a stamp and bounds what may be masked out of it. */
const STAMP_PATTERNS = [
  /"generatedAt":\s*"(\d{4}-\d{2}-\d{2})"/,
  /REGISTRY_GENERATED_AT = '(\d{4}-\d{2}-\d{2})'/,
  /build-registry\.mjs on (\d{4}-\d{2}-\d{2})/,
]

/** Replaces the date *inside each stamp* with a fixed placeholder, leaving any
 *  other date in the file alone. Anchoring to the stamp shapes rather than
 *  replacing the bare date value matters both ways: a data field that happens
 *  to hold the old stamp's date must not be masked away (that would hide real
 *  drift), and one holding a date the stamp has since moved past must not be
 *  left unmasked on one side only (that would put the churn back). */
const maskStamps = (text) =>
  STAMP_PATTERNS.reduce((t, re) => t.replace(re, (m, d) => m.replace(d, '0000-00-00')), text)

/** A checkout's line endings are the reader's, not the generator's: git's
 *  Windows default hands back CRLF for blobs stored as LF. Comparing raw would
 *  make every file differ on those machines and defeat the guard entirely. */
const normalise = (text) => text.replace(/\r\n/g, '\n')

/** Writes only when something other than the date changed, and reports whether
 *  it did — `null` for a file left alone.
 *
 *  Every generated file carries `generatedAt`, so a regeneration on a later day
 *  rewrote all twelve of them with one line different and nothing else. CI's
 *  "registry is current" step is a `git diff --exit-code`, so that turned a
 *  content check into a calendar check — red on any run dated after the last
 *  regeneration, for a diff of twelve identical date lines.
 *
 *  Deriving the stamp from the last commit rather than the wall clock narrowed
 *  it but did not close it: the stamp then moves on *every* commit, including
 *  the ones that touch nothing this script reads, so an unrelated commit a day
 *  later still reddened the step. Filtering `git log` by input path would fix
 *  that locally and break it on CI, where `actions/checkout` clones to depth 1
 *  and there is no history to filter.
 *
 *  So the guard is content, not history, and needs neither. Compare the new
 *  body against the old with the stamps masked out: identical means only the
 *  date moved, and the file on disk is left exactly as it is. The stamp
 *  therefore records when the content last changed, which is what a reader
 *  wants from it anyway, and regeneration is idempotent everywhere — shallow
 *  clone, deep clone, CRLF checkout, or no git at all. */
const write = (abs, body) => {
  if (fs.existsSync(abs)) {
    const prev = fs.readFileSync(abs, 'utf8')
    if (normalise(maskStamps(prev)) === normalise(maskStamps(body))) return null
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
  return path.relative(REPO, abs)
}
/** Generated `.ts` files are JSON literals after the `= `, so this is exact
 *  rather than a regex approximation of the same thing. */
const literal = (rel) => {
  const s = readApp(rel)
  const i = s.indexOf('= [') >= 0 ? s.indexOf('= [') : s.indexOf('= {')
  const open = s[i + 2]
  const close = open === '[' ? s.lastIndexOf(']') : s.lastIndexOf('}')
  return JSON.parse(s.slice(i + 2, close + 1))
}

// ── sources ──────────────────────────────────────────────────────────────────

const SCREENS = literal('src/data/generated/screens.ts')
const SPEC_SCREENS = literal('src/data/generated/spec-screens.ts')
const NAV = literal('src/data/generated/nav.ts')
const rbacSrc = readApp('src/data/generated/rbac.ts')
const pickObject = (src, name) => {
  const start = src.indexOf(`export const ${name}`)
  const brace = src.indexOf('{', start)
  let depth = 0
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return JSON.parse(src.slice(brace, i + 1))
  }
  throw new Error(`could not read ${name}`)
}
const PERMS = pickObject(rbacSrc, 'PERMS')
const SCREEN_MODULE = pickObject(rbacSrc, 'SCREEN_MODULE')
const ROLES = JSON.parse(rbacSrc.slice(rbacSrc.indexOf('['), rbacSrc.indexOf('\n]') + 2))
/** Careful: the declaration is `readonly string[] = [...]`, so the first `]`
 *  after the name belongs to the *type*, not the array. Slicing to it yields an
 *  empty list and silently mis-flags every ungated screen. Find the `[` that
 *  follows the `=` instead. */
const ungatedStart = rbacSrc.indexOf('[', rbacSrc.indexOf('=', rbacSrc.indexOf('RBAC_UNGATED')))
const UNGATED = JSON.parse(rbacSrc.slice(ungatedStart, rbacSrc.indexOf(']', ungatedStart) + 1))

const routesSrc = readApp('src/routes/index.tsx')
const featureDefsSrc = readApp('src/screens/feature/definitions.ts')
const smokeSrc = readApp('scripts/smoke.mjs')

/** Which screens are wired to a real component. Read from the lookup tables
 *  rather than guessed from files, so a component that exists but reaches no
 *  route is still counted as missing — which is what it is. */
function screensIn(src, tableName) {
  const start = src.indexOf(`const ${tableName}`)
  if (start < 0) return new Set()
  const brace = src.indexOf('{', start)
  let depth = 0, end = brace
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) { end = i; break }
  }
  const body = src.slice(brace + 1, end)
  const names = new Set()
  // Quoted keys — `'CustomerApp.Home': X`. A quoted string followed by a colon
  // is unambiguously a key, so no line anchor is needed; that anchor was the bug.
  for (const m of body.matchAll(/'([^']+)'\s*:/g)) names.add(m[1])
  // Shorthand or identifier keys — `JobCardDetail`. Neither a leading newline
  // nor a trailing comma may be required: `= { JobCardDetail }` on one line, and
  // a final entry with no trailing comma, must both count. Both forms are exactly
  // what the barrel template and the agent briefs demonstrate, and dropping them
  // miscounts a built screen as a placeholder — the §A1 failure this file exists
  // to prevent. Over-matching a value identifier (the `X` in `Name: X`) is
  // harmless: the set is only ever queried by real screen names, which a value is
  // not, so a false member is inert.
  for (const m of body.matchAll(/([A-Z][\w]*)\s*(?=[,:}\n]|$)/g)) names.add(m[1])
  return names
}

/** The per-domain barrels under `src/screens/domains/`.
 *
 *  W2 runs ten domain agents at once, and the three tables in routes/index.tsx
 *  were the file all ten of them would have had to edit — the exact contention
 *  DEPENDENCIES.json names as the worst failure mode. Each domain now declares
 *  its screens in a barrel nobody else touches. This has to read them too, or
 *  every screen the wave builds would be invisible here and the registry would
 *  under-report the product for the whole wave. */
function domainScreens() {
  const dir = path.join(APP, 'src/screens/domains')
  if (!fs.existsSync(dir)) return new Set()
  const names = new Set()
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue
    for (const n of screensIn(read(path.join(dir, file)), 'SCREENS')) names.add(n)
  }
  return names
}

const IMPL = {
  public: screensIn(routesSrc, 'PUBLIC_SCREENS'),
  app: screensIn(routesSrc, 'APP_SCREENS'),
  customerApp: screensIn(routesSrc, 'CUSTOMER_APP_SCREENS'),
  domains: domainScreens(),
}
const KIT_ROUTES = new Set([...featureDefsSrc.matchAll(/route: '([^']+)'/g)].map((m) => m[1]))
/** Route coverage moved into the smoke runner itself: it reads this registry and
 *  checks every entry, so grepping it for route literals now matches nothing.
 *  Two distinct facts are worth tracking separately — that a route is visited at
 *  all, and that something specific is asserted about what it renders. A visit
 *  with no assertion is the weakest possible test, and counting it as coverage
 *  is how a suite comes to look thorough while proving very little. */
const SMOKE_READS_REGISTRY = /master-registry/.test(smokeSrc)
const SMOKE_CONTENT_ROUTES = new Set(
  [...smokeSrc.matchAll(/^\s*'([^']+)':\s*['"]/gm)].map((m) => m[1]).filter((r) => r.startsWith('/'))
)
const NAV_SCREENS = new Set(
  NAV.flatMap((g) => g.items ?? []).map((i) => i.screen).filter(Boolean)
)

/** The design bundle on disk — the check against a SCREEN_MAP that fell behind. */
const designFiles = fs.existsSync(PROJECT)
  ? fs.readdirSync(PROJECT).filter((f) => f.endsWith('.dc.html'))
  : []
const designDesktop = new Set(designFiles.filter((f) => !f.includes('.Mobile.')).map((f) => f.replace('.dc.html', '')))
const designMobile = new Set(designFiles.filter((f) => f.includes('.Mobile.')).map((f) => f.replace('.Mobile.dc.html', '')))

/** `[registryName, componentName]` for every screen the app declares.
 *
 *  A declaration maps the registry's name for a screen onto the component that
 *  renders it — `'General-Ledger': GeneralLedger` — and the two are spelled
 *  differently on purpose: the registry name comes from the spec, the component
 *  name is a JS identifier. Anything that detects a fact by reading a component
 *  therefore has to come back through this table, or it reports on a name the
 *  registry never asks about.
 *
 *  Three shapes, because the app uses three. Domain barrels declare a screen
 *  bare (`'General-Ledger': GeneralLedger`) or as an object naming a shell
 *  beside the component; the route table declares one as
 *  `lazyNamed(() => import(…), 'ExportName')`. Each shape missed is a block of
 *  the registry that reads as a gap because nothing looked, not because
 *  anything is wrong with the screen — the route-table shape alone accounted
 *  for all nineteen CustomerApp / PartsNetwork entries.
 *
 *  The key charset is `[\w.-]`, not `\w`: over half the registry is
 *  hyphenated — 205 of 424 entries — and a word class stops at the first
 *  hyphen, so those keys matched a fragment or nothing, silently capping every
 *  detector that reads this table. */
const BARREL_ALIASES = (() => {
  const pairs = []
  const OBJECT_FORM = /['"]?([\w.-]+?)['"]?\s*:\s*\{\s*component\s*:\s*(\w+)/g
  //  ScreenName: wrapper(ImportedName)   or   ScreenName: ImportedName,
  const BARE_FORM = /['"]?([\w.-]+?)['"]?\s*:\s*(?:\w+\()?\s*([A-Z]\w*)\s*\)?\s*[,}]/g
  //  ScreenName: lazyNamed(() => import('@/screens/…'), 'ExportName')
  const LAZY_NAMED = /(?:const\s+)?['"]?([\w.-]+)['"]?\s*[:=]\s*lazyNamed\(\s*\(\)\s*=>\s*import\(\s*'[^']+'\s*\)\s*,\s*'(\w+)'/gs
  const STRUCTURAL = new Set(['component', 'shell'])
  const collect = (src, patterns) => {
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        if (STRUCTURAL.has(m[1])) continue
        pairs.push([m[1], m[2]])
      }
    }
  }
  const domainsDir = path.join(APP, 'src/screens/domains')
  if (fs.existsSync(domainsDir)) {
    for (const f of fs.readdirSync(domainsDir).filter((n) => n.endsWith('.ts'))) {
      try {
        collect(fs.readFileSync(path.join(domainsDir, f), 'utf8'), [OBJECT_FORM, BARE_FORM])
      } catch (_) { /* skip unreadable */ }
    }
  }
  collect(routesSrc, [LAZY_NAMED])
  return pairs
})()

/** Screens whose source file already contains a useIsMobile / isMobile branch.
 *  This is how the builder upgrades a designed-mobile screen from MISSING → DONE
 *  once an agent has actually wired up the mobile layout. */
const mobileImplemented = (() => {
  const names = new Set()
  const screensDir = path.join(APP, 'src/screens')
  if (!fs.existsSync(screensDir)) return names
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.tsx')) continue
      try {
        const src = fs.readFileSync(full, 'utf8')
        if (!src.includes('useIsMobile') && !src.includes('isMobile')) continue
        for (const m of src.matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)) {
          names.add(m[1])
        }
      } catch (_) { /* skip unreadable */ }
    }
  }
  walk(screensDir)

  // Also resolve domain barrel aliases: a barrel maps ScreenName → ImportedComponent,
  // so if the ImportedComponent is in our set, the ScreenName should be too.
  for (const [screenName, componentName] of BARREL_ALIASES) {
    if (names.has(componentName)) names.add(screenName)
  }

  return names
})()

/** Screens whose source file imports Loading / ErrorState / EmptyState from
 *  the UI States module. Maps component name → { loading, error, empty }. */
const stateImplemented = (() => {
  const map = new Map()
  const screensDir = path.join(APP, 'src/screens')
  if (!fs.existsSync(screensDir)) return map
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.tsx')) continue
      try {
        const src = fs.readFileSync(full, 'utf8')
        const hasLoading = src.includes('Loading') && (src.includes('isLoading') || src.includes('<Loading'))
        const hasError = src.includes('ErrorState') || (src.includes('isError') && src.includes('error'))
        const hasEmpty = src.includes('EmptyState') || src.includes('empty') && (src.includes('length === 0') || src.includes('.length'))
        if (!hasLoading && !hasError && !hasEmpty) continue
        for (const m of src.matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)) {
          map.set(m[1], { loading: hasLoading, error: hasError, empty: hasEmpty })
        }
      } catch (_) { /* skip unreadable */ }
    }
  }
  walk(screensDir)

  for (const [screenName, componentName] of BARREL_ALIASES) {
    if (map.has(componentName) && !map.has(screenName)) map.set(screenName, map.get(componentName))
  }

  return map
})()

/** Screens that read through the repository seam, and the collections they ask
 *  for. Maps component name → { keys: string[] }.
 *
 *  `dataBacked` and `dataSource` were a hardcoded `false` and `[]`, so every
 *  product screen carried MOCK_ONLY — "renders, but from fixtures rather than
 *  an API" — whatever it actually did, the total read 0, and BLK-002 ("no
 *  capability is backed by real data") could never close. A flag that cannot
 *  clear says nothing about the thing it names.
 *
 *  What makes a screen data-backed is concrete here: `repository.ts` resolves
 *  to the HTTP client when VITE_API_URL is set and to fixtures when it is not,
 *  and the hooks below are the only way through that seam. A screen that calls
 *  one shows real rows against a real server; a screen that does not renders
 *  local constants and will not, however the build is configured. Nothing in
 *  `components/` calls the seam — the shared pieces take their data as props —
 *  so reading the screen's own source is the whole answer rather than a
 *  first approximation of it.
 *
 *  This measures wiring, not correctness: it says a screen asks the repository
 *  for a collection, not that what it renders is right. */
const SEAM_CALL =
  /\buse(?:PagedCollection|Collection|Entity|Create|Update|Delete|Bulk)\s*(?:<[^>]*>)?\s*\(\s*['"]([\w./-]+)['"]/g
const SEAM_ANY = /\buse(?:PagedCollection|Collection|Entity|Create|Update|Delete|Bulk|Repository)\b/

const dataBackedScreens = (() => {
  const map = new Map()
  const screensDir = path.join(APP, 'src/screens')
  if (!fs.existsSync(screensDir)) return map

  /** Attributed per exported function, not per file. `crm/Crm.tsx` exports ten
   *  screens and each fetches its own collection, so crediting the file's whole
   *  set to all of them would have said LeadPipeline reads aiAgents. Each
   *  export owns the source from its own signature to the next one. */
  const scan = (src) => {
    const starts = [...src.matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)]
    const direct = new Map()
    starts.forEach((m, i) => {
      const body = src.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : src.length)
      direct.set(m[1], {
        body,
        keys: [...new Set([...body.matchAll(SEAM_CALL)].map((k) => k[1]))].sort(),
      })
    })
    /* A screen that renders a sibling from the same file rather than fetching
     * for itself — the three Campaigns wrappers are exactly this — is backed by
     * whatever that sibling reads. One level only: this resolves the wrapper
     * case without pretending to be a call graph. */
    for (const [name, own] of direct) {
      if (own.keys.length) continue
      const inherited = new Set()
      for (const [other, sib] of direct) {
        if (other === name || !sib.keys.length) continue
        if (new RegExp(`<${other}\\b|\\b${other}\\s*\\(`).test(own.body)) {
          for (const k of sib.keys) inherited.add(k)
        }
      }
      if (inherited.size) own.keys = [...inherited].sort()
    }
    return direct
  }

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.tsx')) continue
      try {
        const src = fs.readFileSync(full, 'utf8')
        if (!SEAM_ANY.test(src)) continue
        for (const [name, { keys }] of scan(src)) {
          if (!keys.length) continue
          const prev = map.get(name)?.keys ?? []
          map.set(name, { keys: [...new Set([...prev, ...keys])].sort() })
        }
      } catch (_) { /* skip unreadable */ }
    }
  }
  walk(screensDir)

  /* Through the barrel, same as the detectors above. Without this the registry
   * asks about `Customers-List` while this map only knows `CustomersList`, so a
   * wired screen registered under a spec name reads as unwired for ever. */
  for (const [screenName, componentName] of BARREL_ALIASES) {
    if (map.has(componentName) && !map.has(screenName)) map.set(screenName, map.get(componentName))
  }

  return map
})()

/** Routes the smoke suite actually loads at a tablet viewport, read from its
 *  own table so the two cannot drift. Today that is four routes. */
const SMOKE_TABLET_ROUTES = new Set(
  [...smokeSrc.matchAll(/\{\s*w:\s*(\d+)\s*,\s*h:\s*\d+\s*,\s*label:\s*'[^']*'\s*,\s*route:\s*'([^']+)'/g)]
    .filter((m) => Number(m[1]) >= 768 && Number(m[1]) <= 1024)
    .map((m) => m[2])
)

/** Routes the smoke suite actually renders right-to-left, read the same way.
 *  A route qualifies only where the run asserts `documentElement.dir`, so the
 *  set is what a browser has confirmed flips, not a list I keep by hand. */
const RTL_VERIFIED_ROUTES = new Set(
  [...smokeSrc.matchAll(/BASE\s*\+\s*'([^']+)'/g)]
    .filter((m, i, all) => {
      /* Look only as far as the next navigation: an assertion after that one
       * belongs to the route it loaded, not to this one. */
      const end = all[i + 1]?.index ?? smokeSrc.length
      return /documentElement\.dir/.test(smokeSrc.slice(m.index, end))
    })
    .map((m) => m[1])
)

/** Per-screen layout facts — whether the file hard-codes a physical direction,
 *  and whether it carries a breakpoint in the tablet range — keyed by component
 *  name. The two predicates live in `lib/screen-facts.mjs` so a test can show
 *  each firing and not firing; see the note there on why that matters. */
const screenIntl = (() => {
  const map = new Map()
  const screensDir = path.join(APP, 'src/screens')
  if (!fs.existsSync(screensDir)) return map
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.tsx')) continue
      try {
        const src = fs.readFileSync(full, 'utf8')
        const facts = layoutFacts(src)
        for (const m of src.matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)) {
          const prev = map.get(m[1])
          map.set(m[1], prev
            ? { physical: prev.physical || facts.physical,
                tabletBreakpoints: prev.tabletBreakpoints || facts.tabletBreakpoints }
            : { ...facts })
        }
      } catch (_) { /* skip unreadable */ }
    }
  }
  walk(screensDir)
  for (const [screenName, componentName] of BARREL_ALIASES) {
    if (map.has(componentName) && !map.has(screenName)) map.set(screenName, map.get(componentName))
  }
  return map
})()

/** Per-screen Arabic state, decided by the same scanner `check-i18n` runs.
 *
 *  Deliberately not a regex of my own: my first attempt counted a key as
 *  untranslated when the gate counted it dynamic, so the registry claimed ten
 *  Arabic gaps on a codebase the gate reports fully covered. `scanFile` draws
 *  the literal/dynamic line once, and both readers now sit on that line. */
const arabicFacts = (() => {
  const map = new Map()
  const screensDir = path.join(APP, 'src/screens')
  if (!fs.existsSync(screensDir)) return map
  let covered
  try {
    covered = new Set([
      ...recordKeys(path.join(APP, 'src/data/generated/ar.ts')),
      ...recordKeys(path.join(APP, 'src/data/ar-overrides.ts')),
    ])
  } catch (_) {
    return map // no dictionary to judge against; leave every screen unclaimed
  }
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.tsx')) continue
      try {
        const { literals, dynamic } = scanFile(fs.readFileSync(full, 'utf8'))
        const facts = {
          /* A screen with no `t()` at all is not "fully translated" — it is
           * not translated. Certifying it on an empty set is the same false
           * clear as the constants this replaced, from the other side. */
          translated: literals.length > 0,
          uncovered: literals.some((k) => !covered.has(k)),
          dynamic: dynamic > 0,
        }
        for (const m of fs.readFileSync(full, 'utf8').matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)) {
          const prev = map.get(m[1])
          map.set(m[1], prev
            ? { translated: prev.translated || facts.translated,
                uncovered: prev.uncovered || facts.uncovered,
                dynamic: prev.dynamic || facts.dynamic }
            : { ...facts })
        }
      } catch (_) { /* skip unreadable */ }
    }
  }
  walk(screensDir)
  for (const [screenName, componentName] of BARREL_ALIASES) {
    if (map.has(componentName) && !map.has(screenName)) map.set(screenName, map.get(componentName))
  }
  return map
})()

/** Every spec screen with no component of its own is rendered by the feature
 *  kit's single view, so that file is what a visitor to one of those routes
 *  actually sees, and it is what these three facts are true or false of. The
 *  component's name is read from the route table rather than written here. */
const KIT_COMPONENT = routesSrc.match(/<(\w+)\s+def=\{/)?.[1] ?? null

/** The source a screen's facts come from: its own component, or the kit view
 *  where the kit is what renders the route. `undefined` means neither — the
 *  screen cannot be measured from here, which is not the same as being wrong,
 *  and the three helpers below must not report it as a gap. */
const factsFor = (map, name, route) =>
  map.get(name) ?? (KIT_COMPONENT && KIT_ROUTES.has(route) ? map.get(KIT_COMPONENT) : undefined)

const tabletStateOf = (name, route, built) => {
  if (!built) return 'MISSING'
  if (SMOKE_TABLET_ROUTES.has(route)) return 'DONE'
  const facts = factsFor(screenIntl, name, route)
  if (!facts) return 'PARTIAL' // built; nothing readable to judge it by
  return facts.tabletBreakpoints ? 'PARTIAL' : 'MISSING'
}
const arabicStateOf = (name, route, built) => {
  if (!built) return 'MISSING'
  const facts = factsFor(arabicFacts, name, route)
  if (!facts) return 'PARTIAL'
  return arabicStateFrom(facts)
}
const rtlStateOf = (name, route, built) => {
  if (!built) return 'MISSING'
  if (factsFor(screenIntl, name, route)?.physical) return 'MISSING'
  return RTL_VERIFIED_ROUTES.has(route) ? 'VERIFIED' : 'PARTIAL'
}

// ── classification ───────────────────────────────────────────────────────────

/** Surface, shell and owning agent, in priority order. First match wins. */
const SURFACE_RULES = [
  [/^UI\./,                     'reference',    'none',              'ui',          '04'],
  [/^(Index|FlowSpec|RBACSpec)$/, 'reference',  'none',              'ui',          '02'],
  [/^PublicPortal\./,           'public',       'PublicShell',       'website',     '17'],
  [/^Native\./,                 'native',       'CustomerAppShell',  'portals',     '16'],
  [/^KioskCheckIn/,             'kiosk',        'KioskShell',        'portals',     '16'],
  [/^CallCenter/,               'call-center',  'AppShell',          'portals',     '16'],
  [/^(CustomerPortal|TechnicianPortal|SupplierPortal|ProcurementPortal)/, 'portal', 'PortalShell', 'portals', '16'],
  [/^CustomerApp\./,            'customer-app', 'CustomerAppShell',  'customerapp', '16'],
  [/^(Splash|Welcome|LanguageSelection|RegionSelection|Login|Register|SSOLogin|SocialLogin|ForgotPassword|ResetPassword|OTPVerification|TwoFactorVerification|CreatePIN|BiometricSetup|RoleSelection|WorkspaceSelection|OrganizationSelection|ProfileCompletion|InviteAcceptance|Onboarding|TermsConditions|PrivacyPolicy|Maintenance|Error404|Unauthorized|SessionExpired|AccountLocked|LogoutConfirmation)$/,
                                'auth',         'AuthLayout',        'auth',        '06'],
  [/^(Dashboard|JobCards|JobDetail|JobCardDetail|Workshop|Appointments|AppointmentCalendar|OBDDiagnostics|DiagnosticReport|TechnicianKB|TechnicianSchedule|Technicians|Estimates|EstimateDetail|ApprovalInbox|CustomerApproval|WorkshopReports)/,
                                'app',          'AppShell',          'workshop',    '08'],
  [/^(Customers|CustomerDetail|CustomerFeedback|Vehicles|VehicleDetail|FleetManagement|FleetContract|Lead|Opportunities|Campaigns|EmailMarketing|SMSCampaigns|WhatsAppCampaigns|CustomerSegments|CRM)/,
                                'app',          'AppShell',          'crm',         '09'],
  [/^(Inventory|Parts)/,        'app',          'AppShell',          'parts',       '10'],
  [/^(Procurement|PurchaseOrder)/, 'app',       'AppShell',          'procurement', '11'],
  [/^(Invoice|Payments|ChartOfAccounts|JournalEntries|Expenses|Receipts|Departments|BankReconciliation|TaxManagement|Financial|Executive|Operational|BIDashboard|Reports|ReportsAnalytics|CustomReports|SalesReports|InsuranceReports|LoanReports|InventoryReports)/,
                                'app',          'AppShell',          'accounting',  '12'],
  [/^HRPayroll/,                'app',          'AppShell',          'hr',          '14'],
  [/^(AI|Agent|ConversationHistory|PromptLibrary|KnowledgeBase|WorkflowBuilder|AutomationRules|ModelSettings)/,
                                'app',          'AppShell',          'ai',          '15'],
]
const DEFAULT_RULE = ['app', 'AppShell', 'admin', '—']
const classify = (name) => {
  const hit = SURFACE_RULES.find(([re]) => re.test(name))
  return hit ? { surface: hit[1], shell: hit[2], domain: hit[3], owner: hit[4] } : {
    surface: DEFAULT_RULE[0], shell: DEFAULT_RULE[1], domain: DEFAULT_RULE[2], owner: DEFAULT_RULE[3],
  }
}

const DOMAIN_LABEL = {
  workshop: 'Workshop & Mini ERP', crm: 'Customers, vehicles & CRM', parts: 'Parts & inventory',
  procurement: 'Procurement', accounting: 'Accounting & reporting', hr: 'HR & payroll',
  ai: 'AI & automation', admin: 'Administration', auth: 'Auth & onboarding',
  portals: 'Portals, call centre & kiosk', customerapp: 'Customer mobile app',
  website: 'Public website', ui: 'Shared UI & reference', featuremap: 'Feature map (no design)',
}
const DOMAIN_GROUP = {
  workshop: 'G5', crm: 'G4/G8', parts: 'G6', procurement: 'G6', accounting: 'G7', hr: 'G8',
  ai: 'G9', admin: 'G9', auth: 'G3', portals: 'G10', customerapp: 'G10', website: 'G11',
  ui: 'G2', featuremap: 'G12',
}
const DOMAIN_AGENT = {
  workshop: '08', crm: '09', parts: '10', procurement: '11', accounting: '12', hr: '14',
  ai: '15', admin: '—', auth: '06', portals: '16', customerapp: '16', website: '17',
  ui: '04', featuremap: '08–17',
}

/** Capabilities that need a credential, a device or a paid service we do not
 *  have. They still ship UI + adapter + failure state (§40) — they are exempt
 *  only from "renders real data", and each names its dependency. */
const EXTERNAL = {
  'Drone Inspection': 'drone hardware + flight service',
  'VR Showroom': 'VR headset + 3D asset pipeline',
  'Quantum Computing': 'no available quantum backend',
  'Wearable Integration': 'wearable device SDK',
  'Security Cameras': 'on-site NVR/RTSP feed',
  'Digital Signage': 'signage player hardware',
  'Blockchain Service History': 'chain endpoint + wallet',
  'Smart Contracts': 'chain endpoint + wallet',
  'Voice Commands': 'speech provider credential',
  'Voice Command Interface': 'speech provider credential',
  'AR Repair Guide': 'AR device + tracked models',
  'AR Overlay': 'AR device + tracked models',
  'Drone Inspection ': 'drone hardware + flight service',
}

const permissionsFor = (screen) => {
  const mod = SCREEN_MODULE[screen]
  if (!mod) return { module: UNGATED.includes(screen) ? 'ungated' : null, permissions: [] }
  const grants = PERMS[mod] ?? {}
  return {
    module: mod,
    permissions: Object.entries(grants)
      .filter(([, actions]) => actions)
      .map(([role, actions]) => `${role}:${actions}`),
  }
}

// ── build the entries ────────────────────────────────────────────────────────

const NOT_STARTED = { desktop: 'MISSING', tablet: 'MISSING', mobile: 'MISSING', responsive: 'MISSING',
  arabic: 'MISSING', rtl: 'MISSING', accessibility: 'MISSING' }

const entries = []

for (const s of SCREENS) {
  const { surface, shell, domain, owner } = classify(s.name)
  const built =
    IMPL.public.has(s.name) ||
    IMPL.app.has(s.name) ||
    IMPL.customerApp.has(s.name) ||
    IMPL.domains.has(s.name)
  const isReference = surface === 'reference'
  const { module, permissions } = permissionsFor(s.name)
  const hasMobileDesign = s.hasMobile || designMobile.has(s.name)

  entries.push({
    screenId: `D-${s.name}`,
    name: s.name,
    title: s.name.replace(/\./g, ' · '),
    route: s.route,
    surface,
    shell: built ? shell : shell,
    module,
    permissions,
    category: isReference ? 'REFERENCE_ONLY' : 'PRODUCT',
    domain,
    owner,
    source: ['design'],
    designSource: designDesktop.has(s.name) ? `project/${s.name}.dc.html` : null,
    designMobileSource: hasMobileDesign ? `project/${s.name}.Mobile.dc.html` : null,
    featureMapSource: null,
    mobileType: hasMobileDesign ? 'A-designed' : surface === 'native' ? 'native-frame' : 'B-responsive',
    purpose: s.purpose,
    // Coverage. `built` means the route renders a real component — it is the
    // floor, not the Definition of Done, so nothing above DONE is claimed here.
    desktop: built ? 'DONE' : 'MISSING',
    tablet: tabletStateOf(s.name, s.route, built),
    mobile: built && mobileImplemented.has(s.name) ? 'DONE' : built && !hasMobileDesign ? 'PARTIAL' : 'MISSING',
    responsive: built && mobileImplemented.has(s.name) ? 'DONE' : built && !hasMobileDesign ? 'PARTIAL' : 'MISSING',
    arabic: arabicStateOf(s.name, s.route, built),
    rtl: rtlStateOf(s.name, s.route, built),
    loadingState: built && stateImplemented.get(s.name)?.loading ? 'DONE' : 'MISSING',
    emptyState: built && stateImplemented.get(s.name)?.empty ? 'DONE' : 'MISSING',
    errorState: built && stateImplemented.get(s.name)?.error ? 'DONE' : 'MISSING',
    successState: 'MISSING',
    accessibility: 'MISSING',
    dataBacked: built && dataBackedScreens.has(s.name),
    dataSource: (built && dataBackedScreens.get(s.name)?.keys) || [],
    crud: { create: false, read: built, update: false, delete: false },
    approval: false, export: false, print: false, notifications: false, audit: false,
    tests: { unit: false, integration: false, e2e: SMOKE_READS_REGISTRY || SMOKE_CONTENT_ROUTES.has(s.route) },
    e2eContent: SMOKE_CONTENT_ROUTES.has(s.route),
    visualTests: false, accessibilityTests: false, securityTests: false, performanceTest: false,
    inNav: NAV_SCREENS.has(s.name),
    status: built ? 'IMPLEMENTED' : 'DISCOVERED',
    blockers: [],
    dependencies: [],
    evidence: [],
    flags: [],
  })
}

for (const s of SPEC_SCREENS) {
  if (s.designScreen) continue // already covered by its design entry
  const kit = KIT_ROUTES.has(s.route)
  // A domain barrel claiming this name means an agent built the real screen,
  // which outranks the feature kit's generic rendering of the same spec.
  const owned = IMPL.domains.has(s.name)
  const external = EXTERNAL[s.title]
  entries.push({
    screenId: `F-${s.id}`,
    name: s.name,
    title: s.title,
    route: s.route,
    surface: 'app',
    shell: 'AppShell',
    ...permissionsFor(s.name),
    category: external ? 'EXTERNAL_DEPENDENCY' : 'PRODUCT',
    domain: 'featuremap',
    owner: DOMAIN_AGENT.featuremap,
    source: ['feature-map'],
    designSource: null,
    designMobileSource: null,
    featureMapSource: s.screenshot ? `project/${s.screenshot}` : null,
    mobileType: 'B-responsive',
    purpose: s.purpose,
    desktop: owned ? 'DONE' : kit ? 'PARTIAL' : 'MISSING',
    tablet: tabletStateOf(s.name, s.route, owned || kit),
    mobile: owned || kit ? 'PARTIAL' : 'MISSING',
    responsive: owned || kit ? 'PARTIAL' : 'MISSING',
    arabic: arabicStateOf(s.name, s.route, owned || kit),
    rtl: rtlStateOf(s.name, s.route, owned || kit),
    loadingState: (owned || kit) && stateImplemented.get(s.name)?.loading ? 'DONE' : 'MISSING',
    emptyState: (owned || kit) && stateImplemented.get(s.name)?.empty ? 'DONE' : 'MISSING',
    errorState: (owned || kit) && stateImplemented.get(s.name)?.error ? 'DONE' : 'MISSING',
    successState: 'MISSING',
    accessibility: 'MISSING',
    dataBacked: (owned || kit) && dataBackedScreens.has(s.name),
    dataSource: ((owned || kit) && dataBackedScreens.get(s.name)?.keys) || [],
    crud: { create: false, read: owned || kit, update: false, delete: false },
    approval: false, export: false, print: false, notifications: false, audit: false,
    tests: { unit: false, integration: false, e2e: SMOKE_READS_REGISTRY || SMOKE_CONTENT_ROUTES.has(s.route) },
    e2eContent: SMOKE_CONTENT_ROUTES.has(s.route),
    visualTests: false, accessibilityTests: false, securityTests: false, performanceTest: false,
    inNav: false,
    status: owned || kit ? 'IMPLEMENTED' : 'DISCOVERED',
    blockers: external ? [`EXTERNAL_DEPENDENCY: ${external}`] : [],
    dependencies: [],
    evidence: [],
    flags: [],
  })
}

// ── computed flags ───────────────────────────────────────────────────────────

const byRoute = new Map()
for (const e of entries) {
  if (!byRoute.has(e.route)) byRoute.set(e.route, [])
  byRoute.get(e.route).push(e)
}

for (const e of entries) {
  const f = e.flags
  const product = e.category === 'PRODUCT'
  const rendered = e.status === 'IMPLEMENTED'

  if (product && !rendered) f.push('PLACEHOLDER')          // renders PendingScreen today
  if (byRoute.get(e.route).length > 1) f.push('DUPLICATE') // two entries claim one route
  if (rendered && e.mobileType === 'A-designed' && e.mobile !== 'DONE') f.push('MOBILE_MISSING')
  if (rendered && e.mobile === 'MISSING' && e.mobileType !== 'native-frame') f.push('DESKTOP_ONLY')
  if (rendered && e.tablet === 'MISSING') f.push('TABLET_MISSING')
  if (rendered && e.arabic !== 'VERIFIED') f.push('ARABIC_MISSING')
  /* Only a real hazard, not merely "no RTL run has looked at this". The flag
   * says broken; firing it on every clean-but-unexercised screen is what made
   * it meaningless. Absence of verification is carried by `rtl: 'PARTIAL'`. */
  if (rendered && e.rtl === 'MISSING') f.push('RTL_BROKEN')
  if (product && !e.tests.e2e) f.push('UNTESTED')
  if (product && e.tests.e2e && !e.e2eContent && rendered) f.push('NO_CONTENT_ASSERTION')
  if (product && rendered && !e.dataBacked) f.push('MOCK_ONLY')
  if (product && e.surface !== 'auth' && e.surface !== 'public' && !e.module) f.push('NO_RBAC_MODULE')
}

/** A `.dc.html` on disk that no registry entry claims. This is the check that
 *  catches SCREEN_MAP.md falling behind the design bundle. */
const registeredNames = new Set(entries.map((e) => e.name))
const unregistered = [...designDesktop].filter((n) => !registeredNames.has(n))

/** A screen component that no route reaches. Walks imports from routes/index.tsx
 *  outward, so a component used only by another screen still counts as reached. */
function reachableScreenFiles() {
  const screensDir = path.join(APP, 'src/screens')
  const all = []
  ;(function walk(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name)
      if (f.isDirectory()) walk(p)
      else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) all.push(p)
    }
  })(screensDir)

  // Both alias and relative imports — a helper module pulled in as './types'
  // is reached just as surely as one imported as '@/screens/...'.
  // Dynamic imports — `import('@/screens/domains/workshop')` — must be walked
  // too, otherwise every screen loaded through `lazyBarrel()` or `lazyNamed()`
  // appears orphaned.
  const importsOf = (src) => [
    ...src.matchAll(/from '([^']+)'/g),
    ...src.matchAll(/import\('([^']+)'\)/g),
  ].map((m) => m[1])
  const resolve = (spec, fromFile) => {
    const base = spec.startsWith('@/') ? path.join(APP, 'src', spec.slice(2))
      : spec.startsWith('.') ? path.resolve(path.dirname(fromFile), spec)
      : null
    if (!base) return null
    for (const cand of [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')]) {
      if (fs.existsSync(cand)) return cand
    }
    return null
  }
  const routesFile = path.join(APP, 'src/routes/index.tsx')
  const reached = new Set()
  const queue = importsOf(routesSrc).map((s) => resolve(s, routesFile)).filter(Boolean)
  while (queue.length) {
    const file = queue.pop()
    if (reached.has(file)) continue
    reached.add(file)
    for (const spec of importsOf(read(file))) {
      const r = resolve(spec, file)
      if (r && !reached.has(r)) queue.push(r)
    }
  }
  return { all, reached }
}
const { all: screenFiles, reached } = reachableScreenFiles()

/** Unreachable on purpose, and reviewed as such.
 *
 *  Each file here is the pre-kit implementation of feature-map routes that
 *  render the generic `FeatureScreenView` today, kept as the reference for
 *  building the real screen. It stays unwired deliberately: routing one would
 *  put a legacy screen back in front of users. Removing an entry is how that
 *  reference retires; adding one needs the same argument, or this list becomes
 *  where dead code hides. Every other unreachable file is a bug.
 *
 *  Empty since the merge with main: the three files this list protected —
 *  admin/SystemScreens, emerging/EmergingTechScreens, enterprise/
 *  EnterpriseScreens — were deleted on main, which is the retirement the
 *  paragraph above describes. The mechanism stays for the next one.
 */
const RETAINED_REFERENCE = [].map((f) => path.normalize(f))

const unreached = screenFiles.filter((f) => !reached.has(f)).map((f) => path.relative(APP, f))
const retainedFiles = unreached.filter((f) => RETAINED_REFERENCE.includes(f))
const orphanFiles = unreached.filter((f) => !RETAINED_REFERENCE.includes(f))

// A path that stops existing should fail loudly rather than sit in the list
// forever pretending to protect something.
const staleRetained = RETAINED_REFERENCE.filter((f) => !fs.existsSync(path.join(APP, f)))
if (staleRetained.length) {
  console.error(`  RETAINED_REFERENCE names files that no longer exist: ${staleRetained.join(', ')}`)
  process.exitCode = 1
}

/** What the tablet sweep actually covers, read from the sweep itself.
 *
 *  `e2e/tablet.spec.ts` declares its viewports and its screens as literal
 *  tables, so the numbers reported here are the numbers that ran rather than a
 *  figure typed into this file and left to rot. No spec, no coverage. */
const tabletSpecPath = path.join(APP, 'e2e/tablet.spec.ts')
const tabletSweep = (() => {
  if (!fs.existsSync(tabletSpecPath)) return { present: false, viewports: 0, screens: 0 }
  const src = read(tabletSpecPath)
  const block = (name) => (new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\]`).exec(src) ?? [, ''])[1]
  const portrait = (block('PORTRAIT').match(/\{\s*name:/g) ?? []).length
  const screens = (block('SCREENS').match(/\{\s*path:/g) ?? []).length
  // Landscape is derived from portrait in the spec, so each device is two.
  return { present: portrait > 0, viewports: portrait * 2, screens }
})()

// ── rollups ──────────────────────────────────────────────────────────────────

const product = entries.filter((e) => e.category === 'PRODUCT')
const rendered = entries.filter((e) => e.status === 'IMPLEMENTED')
const count = (list, pred) => list.filter(pred).length

const totals = {
  capabilities: entries.length,
  product: product.length,
  referenceOnly: count(entries, (e) => e.category === 'REFERENCE_ONLY'),
  externalDependency: count(entries, (e) => e.category === 'EXTERNAL_DEPENDENCY'),
  rendered: rendered.length,
  placeholder: count(entries, (e) => e.flags.includes('PLACEHOLDER')),
  designedMobileOwed: count(entries, (e) => e.flags.includes('MOBILE_MISSING')),
  untested: count(entries, (e) => e.flags.includes('UNTESTED')),
  mockOnly: count(entries, (e) => e.flags.includes('MOCK_ONLY')),
  dataBacked: count(entries, (e) => e.dataBacked),
  e2eCovered: count(entries, (e) => e.tests.e2e),
  contentAsserted: count(entries, (e) => e.e2eContent),
  renderedWithoutAssertion: count(entries, (e) => e.status === 'IMPLEMENTED' && !e.e2eContent),
  hasLoadingState: count(entries, (e) => e.loadingState === 'DONE'),
  hasErrorState: count(entries, (e) => e.errorState === 'DONE'),
  hasEmptyState: count(entries, (e) => e.emptyState === 'DONE'),
  tabletVerified: count(entries, (e) => e.tablet === 'DONE'),
  arabicVerified: count(entries, (e) => e.arabic === 'VERIFIED'),
  rtlHazards: count(entries, (e) => e.rtl === 'MISSING'),
  unregisteredDesigns: unregistered.length,
  orphanScreenFiles: orphanFiles.length,
  productionReady: count(entries, (e) => e.status === 'PRODUCTION_READY'),
}

const groupBy = (list, key) => list.reduce((acc, e) => {
  const k = typeof key === 'function' ? key(e) : e[key]
  ;(acc[k] ??= []).push(e)
  return acc
}, {})

const rollup = (list) => ({
  total: list.length,
  rendered: count(list, (e) => e.status === 'IMPLEMENTED'),
  placeholder: count(list, (e) => e.flags.includes('PLACEHOLDER')),
  mobileOwed: count(list, (e) => e.flags.includes('MOBILE_MISSING')),
  e2e: count(list, (e) => e.tests.e2e),
  dataBacked: count(list, (e) => e.dataBacked),
})

const bySurface = Object.fromEntries(Object.entries(groupBy(entries, 'surface')).map(([k, v]) => [k, rollup(v)]))
const byDomain = Object.fromEntries(Object.entries(groupBy(entries, 'domain')).map(([k, v]) => [k, rollup(v)]))
const byModule = Object.fromEntries(
  Object.entries(groupBy(entries.filter((e) => e.module), 'module')).map(([k, v]) => [k, rollup(v)])
)

// ── emit ─────────────────────────────────────────────────────────────────────

/** The date the *inputs* last changed, not the date this ran.
 *
 *  A wall-clock stamp makes every generated file differ on any later day, which
 *  turns the "registry is current" CI check into a calendar check: it would have
 *  failed every run dated after the commit, for a diff of twelve identical date
 *  lines. Deriving it from the last commit keeps regeneration idempotent between
 *  commits, so that check tests content drift, which is what it is for.
 *
 *  `SOURCE_DATE` still overrides, and a repository with no commits yet falls
 *  back to today. */
function inputDate() {
  if (process.env.SOURCE_DATE) return process.env.SOURCE_DATE
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs'], { cwd: REPO, encoding: 'utf8' }).trim()
      || new Date().toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}
const stamp = inputDate()
const outputs = []

outputs.push(write(path.join(CONTROL, 'MASTER_REGISTRY.json'), JSON.stringify({
  generatedAt: stamp,
  generator: 'app/scripts/build-registry.mjs',
  note: 'Discovered from the repository. Never hand-edit; re-run the generator.',
  totals,
  unregisteredDesigns: unregistered,
  orphanScreenFiles: orphanFiles,
  entries,
}, null, 2) + '\n'))

outputs.push(write(path.join(CONTROL, 'STATUS.json'), JSON.stringify({
  generatedAt: stamp, totals, bySurface, byDomain, byModule,
}, null, 2) + '\n'))

outputs.push(write(path.join(CONTROL, 'TEST_STATUS.json'), JSON.stringify({
  generatedAt: stamp,
  suites: {
    unit:        { runner: 'vitest',     present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    component:   { runner: 'vitest+RTL', present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    integration: { runner: 'vitest+MSW', present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    api:         { runner: 'supertest',  present: false, covered: 0, of: 0,              note: 'W1 — Agent 05' },
    routeSmoke:  { runner: 'playwright', present: true,  covered: totals.e2eCovered, of: entries.length,
                   note: 'scripts/smoke.mjs — route checks parsed from the spec' },
    goldenPaths: { runner: 'playwright', present: false, covered: 0, of: 23,             note: 'W4 — Agent 23' },
    mobile:      { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 18' },
    tablet:      { runner: 'playwright', present: tabletSweep.present,
                   covered: tabletSweep.screens, of: entries.length,
                   note: tabletSweep.present
                     ? `e2e/tablet.spec.ts — ${tabletSweep.viewports} viewports x ${tabletSweep.screens} screens, one per layout family, plus a rotation across the 860px breakpoint`
                     : 'W3 — Agent 18' },
    rtl:         { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 19' },
    a11y:        { runner: 'axe',        present: false, covered: 0, of: entries.length, note: 'W3 — Agent 20' },
    visual:      { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 23' },
    security:    { runner: 'rbac-lab',   present: false, covered: 0, of: 14 * 28,        note: 'W3 — Agent 21' },
  },
}, null, 2) + '\n'))

/** Blockers are computed, not authored — a blocker you have to remember to add
 *  is a blocker you forget to add. The token gate records its own counts, so
 *  read them rather than duplicating the hue analysis here. */
const baselinePath = path.join(CONTROL, 'BASELINE.json')
const brandViolations = fs.existsSync(baselinePath)
  ? JSON.parse(read(baselinePath)).forbiddenColours ?? 0
  : 0

const blockers = [
  totals.placeholder && { id: 'BLK-001', severity: 'BLOCKER', title: `${totals.placeholder} product routes render PendingScreen`,
    detail: 'Violates the no-placeholder rule. Cleared only when every PRODUCT entry renders a real component.', owner: '01', wave: 'W2' },
  !totals.dataBacked && { id: 'BLK-002', severity: 'BLOCKER', title: 'No capability is backed by real data',
    detail: 'No server, database, persistence or server-side authorization exists. Gates the Definition of Done for every screen.', owner: '05', wave: 'W1' },
  { id: 'BLK-003', severity: 'BLOCKER', title: 'Three GitHub PATs were exposed in chat and are not confirmed rotated',
    detail: 'Rotate, then add secret scanning to CI. Do not reuse the exposed credentials.', owner: '06', wave: 'W0' },
  totals.mockOnly && { id: 'BLK-004', severity: 'CRITICAL', title: `${totals.mockOnly} rendered capabilities are mock-only`,
    detail: 'They render, but read fixtures rather than an API. Cleared per capability as G4+ lands.', owner: '05', wave: 'W2' },
  totals.untested && { id: 'BLK-005', severity: 'CRITICAL', title: `${totals.untested} product capabilities have no route check`,
    detail: 'Route coverage is generated from this registry once the test harness lands.', owner: '07', wave: 'W1' },
  totals.renderedWithoutAssertion && { id: 'BLK-012', severity: 'HIGH',
    title: `${totals.renderedWithoutAssertion} rendering capabilities are visited but assert nothing`,
    detail: 'The route is checked but no content assertion covers it. A visit with no assertion is the weakest possible test.',
    owner: '07', wave: 'W2' },
  totals.designedMobileOwed && { id: 'BLK-006', severity: 'HIGH', title: `${totals.designedMobileOwed} built screens owe their designed mobile layout`,
    detail: 'A .Mobile.dc.html exists and is not yet implemented. Card lists, not narrowed tables.', owner: '18', wave: 'W3' },
  !fs.existsSync(path.join(APP, 'src/components/ui/Modal.tsx')) && { id: 'BLK-007', severity: 'CRITICAL', title: 'No modal system, so 23 CTAs do nothing',
    detail: 'Blocks every create/edit/delete flow in the ERP.', owner: '04', wave: 'W1' },
  (!tabletSweep.present
    ? { id: 'BLK-008', severity: 'HIGH', title: 'No tablet verification anywhere',
        detail: '768/820/834/1024, portrait and landscape, has never been checked.', owner: '18', wave: 'W3' }
    : {
        id: 'BLK-008', severity: 'MEDIUM',
        title: `Tablet verification samples ${tabletSweep.screens} screens, not the full inventory`,
        detail:
          `e2e/tablet.spec.ts checks ${tabletSweep.viewports} viewports (768/820/834/1024, portrait ` +
          `and landscape) plus a rotation across the 860px breakpoint, against ${tabletSweep.screens} ` +
          'screens chosen one per layout family. It asserts no horizontal overflow, the shell the ' +
          'width implies, and touch-target size. That is a sample, not the inventory: a screen ' +
          'outside those families can still break at tablet width. Cleared when the sweep runs ' +
          'over every registered capability.',
        owner: '18', wave: 'W3',
      }),
  totals.unregisteredDesigns && { id: 'BLK-009', severity: 'MEDIUM', title: `${totals.unregisteredDesigns} designs are not in the registry`,
    detail: `Design files with no SCREEN_MAP entry: ${unregistered.join(', ')}`, owner: '02', wave: 'W0' },
  totals.orphanScreenFiles && { id: 'BLK-010', severity: 'MEDIUM', title: `${totals.orphanScreenFiles} screen files are unreachable from any route`,
    detail: orphanFiles.join(', '), owner: '02', wave: 'W0' },
  brandViolations && { id: 'BLK-011', severity: 'MEDIUM', title: `${brandViolations} hardcoded colours sit in a forbidden hue band`,
    detail: 'The brand permits blue and orange only. Run scripts/check-tokens.mjs for the offenders.', owner: '04', wave: 'W1' },
].filter(Boolean)

outputs.push(write(path.join(CONTROL, 'BLOCKERS.json'), JSON.stringify({
  generatedAt: stamp, open: blockers.length, blockers,
}, null, 2) + '\n'))

/** Dataset for the follow-up deck. Same shape build-tracker-data.mjs emitted,
 *  now sourced from the registry so the deck and the gates cannot disagree. */
const domainOrder = ['workshop', 'crm', 'parts', 'procurement', 'accounting', 'hr', 'ai', 'admin',
  'auth', 'portals', 'customerapp', 'website', 'ui', 'featuremap']
const trackerDomains = domainOrder
  .filter((id) => entries.some((e) => e.domain === id))
  .map((id) => ({
    id,
    label: DOMAIN_LABEL[id] ?? id,
    group: DOMAIN_GROUP[id] ?? '—',
    agent: DOMAIN_AGENT[id] ?? '—',
    items: entries.filter((e) => e.domain === id).map((e) => ({
      name: e.title,
      route: e.route,
      status: e.status === 'IMPLEMENTED' ? (e.source[0] === 'feature-map' ? 'kit' : 'built') : 'pending',
      mobile: e.mobileType === 'A-designed' ? 'designed' : 'responsive',
      mobileDone: e.mobile === 'DONE',
      source: e.source[0] === 'feature-map' ? 'spec' : 'design',
      category: e.category,
    })),
  }))
outputs.push(write(path.join(CONTROL, 'tracker/tracker-data.json'), JSON.stringify({
  generatedAt: stamp,
  domains: trackerDomains,
  totals: { total: entries.length, built: totals.rendered, designedMobile: count(entries, (e) => e.mobileType === 'A-designed') },
}, null, 2) + '\n'))

/** The typed slice the app itself reads — routes and generated tests bind to
 *  this, so adding a capability to the registry adds its route check for free. */
outputs.push(write(path.join(APP, 'src/data/generated/master-registry.ts'),
`// GENERATED by scripts/build-registry.mjs — do not edit by hand.
// The authoritative capability inventory. Routes and route tests are derived
// from this, so a capability cannot exist without appearing in coverage.
import type { RegistryEntry } from '../registry-types'

export const REGISTRY_GENERATED_AT = '${stamp}'

export const REGISTRY: readonly RegistryEntry[] = ${JSON.stringify(
  entries.map((e) => ({
    screenId: e.screenId, name: e.name, title: e.title, route: e.route, surface: e.surface,
    shell: e.shell, module: e.module, category: e.category, domain: e.domain, owner: e.owner,
    mobileType: e.mobileType, status: e.status, flags: e.flags, inNav: e.inNav,
    designSource: e.designSource, designMobileSource: e.designMobileSource,
    featureMapSource: e.featureMapSource,
  })), null, 2)}
`))

// ── documents ────────────────────────────────────────────────────────────────

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
const bar = (a, b) => {
  const n = Math.round((pct(a, b) / 100) * 20)
  return '█'.repeat(n) + '░'.repeat(20 - n)
}
const genHeader = (title, sub) =>
  `<!-- GENERATED by app/scripts/build-registry.mjs on ${stamp}. Do not edit by hand. -->\n\n# ${title}\n\n${sub}\n`

outputs.push(write(path.join(DOCS, 'SALIS_AUTO_MASTER_MATRIX.md'),
  genHeader('SALIS AUTO — Master Capability Matrix',
    `${totals.capabilities} capabilities · ${totals.rendered} rendering · ${totals.placeholder} placeholder · ${totals.dataBacked} data-backed.`) +
  '\n| Capability | Route | Surface | Module | Desktop | Tablet | Mobile | AR | RTL | Data | RBAC | Tests | Status |\n' +
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|\n' +
  entries.map((e) => [
    e.title, `\`${e.route}\``, e.surface, e.module ?? '—',
    e.desktop, e.tablet, e.mobile, e.arabic, e.rtl,
    e.dataBacked ? 'DONE' : 'MISSING',
    e.permissions.length ? `${e.permissions.length} roles` : '—',
    e.tests.e2e ? 'route' : '—',
    e.category === 'PRODUCT' ? e.status : e.category,
  ].join(' | ')).map((r) => `| ${r} |`).join('\n') + '\n'))

outputs.push(write(path.join(DOCS, 'MASTER_SCOPE_REGISTRY.md'),
  genHeader('SALIS AUTO — Scope Registry',
    'Every capability the product must ship, by surface and domain. Regenerate rather than edit.') +
  `\n## Totals\n\n| Metric | Count |\n|---|---|\n` +
  Object.entries(totals).map(([k, v]) => `| ${k.replace(/([A-Z])/g, ' $1').toLowerCase()} | ${v} |`).join('\n') +
  `\n\n## By surface\n\n| Surface | Total | Rendering | Placeholder | Mobile owed | Route-tested |\n|---|---|---|---|---|---|\n` +
  Object.entries(bySurface).map(([k, v]) =>
    `| ${k} | ${v.total} | ${v.rendered} | ${v.placeholder} | ${v.mobileOwed} | ${v.e2e} |`).join('\n') +
  `\n\n## By domain\n\n| Domain | Agent | Group | Progress | Rendering | Total |\n|---|---|---|---|---|---|\n` +
  Object.entries(byDomain).map(([k, v]) =>
    `| ${DOMAIN_LABEL[k] ?? k} | ${DOMAIN_AGENT[k] ?? '—'} | ${DOMAIN_GROUP[k] ?? '—'} | \`${bar(v.rendered, v.total)}\` ${pct(v.rendered, v.total)}% | ${v.rendered} | ${v.total} |`).join('\n') +
  `\n\n## By RBAC module\n\n| Module | Capabilities | Rendering |\n|---|---|---|\n` +
  Object.entries(byModule).sort().map(([k, v]) => `| ${k} | ${v.total} | ${v.rendered} |`).join('\n') + '\n'))

/** Every flag the generator can raise, and what raises it. Keyed here rather
 *  than inline in the table so a flag at zero still prints a row: a flag that
 *  disappears when it clears leaves a reader unable to tell "checked, clear"
 *  from "no longer checked", which is the same ambiguity as a flag that never
 *  clears. RTL_BROKEN reads 0 today and that is a result, not an absence. */
const FLAG_MEANINGS = {
  PLACEHOLDER: 'product route renders PendingScreen',
  MOCK_ONLY: 'renders, but from fixtures rather than an API',
  UNTESTED: 'no route check in the smoke suite',
  TABLET_MISSING: 'no md:/lg: layout in the source — nothing written for 768–1024',
  ARABIC_MISSING: 'Arabic not certified: an untranslated key, or keys built dynamically',
  RTL_BROKEN: 'a hard-coded physical side (ml-/pr-/text-left) the RTL flip will not mirror',
  MOBILE_MISSING: 'a .Mobile design exists and is not built',
  DESKTOP_ONLY: 'renders on desktop with no mobile treatment',
  DUPLICATE: 'two entries claim one route',
  NO_RBAC_MODULE: 'no RBAC module maps to this screen',
  NO_CONTENT_ASSERTION: 'the route is visited but nothing is asserted about it',
}
const flagCounts = entries.flatMap((e) => e.flags).reduce(
  (a, f) => ((a[f] = (a[f] ?? 0) + 1), a),
  Object.fromEntries(Object.keys(FLAG_MEANINGS).map((f) => [f, 0]))
)
outputs.push(write(path.join(DOCS, 'MASTER_GAP_REPORT.md'),
  genHeader('SALIS AUTO — Master Gap Report',
    'Computed from the registry. Every line is a query, not an opinion.') +
  `\n## Open blockers\n\n| ID | Severity | Title | Owner | Wave |\n|---|---|---|---|---|\n` +
  blockers.map((b) => `| ${b.id} | ${b.severity} | ${b.title} | ${b.owner} | ${b.wave} |`).join('\n') +
  `\n\n## Flags across the inventory\n\n| Flag | Count | Meaning |\n|---|---|---|\n` +
  Object.entries(flagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([f, n]) => `| ${f} | ${n} | ${FLAG_MEANINGS[f] ?? '—'} |`).join('\n') +
  `\n\n## Designs not in the registry\n\n${unregistered.length ? unregistered.map((u) => `- \`project/${u}.dc.html\``).join('\n') : '_None — the registry covers every design file._'}` +
  `\n\n## Screen files no route reaches\n\n${orphanFiles.length ? orphanFiles.map((o) => `- \`app/${o.split(path.sep).join('/')}\``).join('\n') : '_None._'}` +
  `\n\n## Retained as reference, deliberately not routed\n\nPre-kit implementations of feature-map routes that render \`FeatureScreenView\` today. Kept as the reference for building the real screen; routing one would put a legacy screen back in front of users. See \`RETAINED_REFERENCE\` in \`app/scripts/build-registry.mjs\`.\n\n${retainedFiles.length ? retainedFiles.map((o) => `- \`app/${o.split(path.sep).join('/')}\``).join('\n') : '_None._'}` +
  `\n\n## Placeholder routes by domain\n\n| Domain | Placeholder | Total |\n|---|---|---|\n` +
  Object.entries(byDomain).filter(([, v]) => v.placeholder).sort((a, b) => b[1].placeholder - a[1].placeholder)
    .map(([k, v]) => `| ${DOMAIN_LABEL[k] ?? k} | ${v.placeholder} | ${v.total} |`).join('\n') + '\n'))

const MODULES = [...new Set(Object.keys(PERMS))].sort()
outputs.push(write(path.join(DOCS, 'MASTER_RBAC_MATRIX.md'),
  genHeader('SALIS AUTO — RBAC Matrix (live)',
    `${ROLES.length} roles × ${MODULES.length} modules, read from \`PERMS\` in the generated data layer. ` +
    'Actions: v=view, c=create, e=edit, x=delete, a=approve. This is the matrix the app enforces — ' +
    'the server must be asserted equal to it, not written from this page.') +
  `\n| Module | ${ROLES.map((r) => r.id).join(' | ')} |\n|---|${ROLES.map(() => '---').join('|')}|\n` +
  MODULES.map((m) => `| ${m} | ${ROLES.map((r) => PERMS[m]?.[r.id] || '·').join(' | ')} |`).join('\n') +
  `\n\n## Approval ceilings\n\n| Role | Scope | Ceiling (SAR) |\n|---|---|---|\n` +
  ROLES.map((r) => `| ${r.label} | ${r.scope} | ${r.limit === null ? '∞' : r.limit.toLocaleString('en-US')} |`).join('\n') + '\n'))

/** Ownership and the dependency graph are authored as JSON and rendered here,
 *  so the prose can never disagree with what the orchestrator actually reads. */
const OWNERSHIP = JSON.parse(read(path.join(CONTROL, 'OWNERSHIP.json')))
const DEPS = JSON.parse(read(path.join(CONTROL, 'DEPENDENCIES.json')))

const capsFor = (agentId) => entries.filter((e) => e.owner === agentId).length
outputs.push(write(path.join(DOCS, 'MASTER_AGENT_OWNERSHIP.md'),
  genHeader('SALIS AUTO — Agent Ownership',
    'Who owns which paths. An agent does not edit another agent\'s files; a needed change outside your boundary is a request, not an edit.') +
  `\n## Serialised through Agent ${OWNERSHIP.shared.arbiter}\n\n${OWNERSHIP.shared.rule}\n\n` +
  OWNERSHIP.shared.paths.map((p) => `- \`${p}\``).join('\n') +
  `\n\n## Agents\n\n| # | Agent | Team | Capabilities owned | Paths |\n|---|---|---|---|---|\n` +
  OWNERSHIP.agents.map((a) => {
    const n = capsFor(a.id)
    const paths = (a.owns ?? []).length ? a.owns.map((p) => `\`${p}\``).join('<br>') : (a.sweeps ?? []).join('<br>') || '—'
    // A temporary grant is the one part of ownership most likely to be read
    // wrongly — it says a file is editable by somebody the permanent table says
    // it is not. Leaving it in the JSON and out of the document would make the
    // document quietly wrong about the only entry anyone needs to check twice.
    const granted = (a.grants ?? []).map((p) => `\`${p}\` *(granted)*`).join('<br>')
    return `| ${a.id} | ${a.name} | ${a.team} | ${n || '—'} | ${[paths, granted].filter(Boolean).join('<br>')} |`
  }).join('\n')
  + (OWNERSHIP.agents.some((a) => a.grantNote)
      ? '\n\n## Temporary grants\n\n' +
        OWNERSHIP.agents.filter((a) => a.grantNote)
          .map((a) => `**Agent ${a.id} — ${a.name}.** ${a.grantNote}`).join('\n\n')
      : '')
  + '\n'))

outputs.push(write(path.join(DOCS, 'MASTER_DEPENDENCY_GRAPH.md'),
  genHeader('SALIS AUTO — Dependency Graph',
    'What must land before what. Every edge is a technical dependency with its reason, not a preference.') +
  `\n## Waves\n\n| Wave | Name | Requires | Agents | Exit condition |\n|---|---|---|---|---|\n` +
  DEPS.waves.map((w) => `| ${w.id} | ${w.name} | ${w.requires.join(', ') || '—'} | ${w.agents.join(', ')} | ${w.exit} |`).join('\n') +
  `\n\n## Critical path\n\n\`${DEPS.criticalPath.join('\` → \`')}\`\n` +
  `\n## Edges\n\n| Blocks | Because |\n|---|---|\n` +
  DEPS.edges.map((e) => `| **${e.from}** → ${e.to} | ${e.why} |`).join('\n') +
  `\n\n## Safe to run concurrently\n\n` +
  DEPS.parallelSafe.map((set) => `- ${set.join(' · ')}`).join('\n') +
  `\n\n## Known contention points\n\n| File | Note |\n|---|---|\n` +
  Object.entries(DEPS.contention).map(([f, n]) => `| \`${f}\` | ${n} |`).join('\n') + '\n'))

console.log(`registry: ${totals.capabilities} capabilities · ${totals.rendered} rendering · ` +
  `${totals.placeholder} placeholder · ${totals.designedMobileOwed} mobile owed · ${blockers.length} blockers`)
if (unregistered.length) console.log(`  unregistered designs: ${unregistered.join(', ')}`)
if (orphanFiles.length) console.log(`  orphan screen files: ${orphanFiles.join(', ')}`)
if (retainedFiles.length) console.log(`  retained as reference, not routed: ${retainedFiles.length}`)
const changed = outputs.filter(Boolean)
for (const w of changed) console.log(`  wrote ${w}`)
const unchanged = outputs.length - changed.length
if (unchanged) console.log(`  ${unchanged} unchanged`)
