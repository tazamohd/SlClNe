/** The chrome each screen actually renders in, read from `routes/index.tsx`.
 *
 *  The registry used to take this from a table of name patterns kept beside the
 *  generator. That table states what a surface is *meant* to render in, which
 *  is a different claim from what the router does, and the two had drifted: it
 *  called the kiosk's chrome `KioskShell`, a component that has never existed,
 *  while the route gave it `PortalShell` — and with it the signed-in operator's
 *  name and a Logout button on a terminal facing the public.
 *
 *  So this reads the route table instead. It is a parser rather than an import
 *  because `routes/index.tsx` is TSX full of `lazy(() => import(…))`, and the
 *  generator is a plain node script that must not need a bundler to answer a
 *  question the source text already answers.
 *
 *  Three shapes carry a shell, and all three live in that one file:
 *
 *    asDomain(APP_SCREENS, undefined)          — the legacy maps, declared above
 *    lazyBarrel(() => import(…), [names], { shell: PortalShell })
 *    lazyBarrel(() => import(…), [names])      — no meta: the operational shell
 *
 *  `undefined` and an absent meta both mean the operational shell; `null` means
 *  no chrome at all. The distinction is the whole point — see `ScreenEntry` —
 *  so it is preserved here rather than collapsed into a falsy check.
 */

/** What the route table gives a screen when it says nothing: `AppShell`. */
export const DEFAULT_SHELL = 'AppShell'
/** What `shell: null` means, spelled for a document rather than for code. */
export const NO_SHELL = 'none'

/** The keys of an object literal `const NAME: … = { Key: …, 'Quoted-Key': … }`.
 *  Only top-level keys: the values are `lazyNamed(() => import('…'), 'X')`
 *  calls whose own parentheses must not be mistaken for the literal's end. */
function objectKeys(src, name) {
  const start = src.indexOf(`const ${name}`)
  if (start === -1) return []
  const open = src.indexOf('{', start)
  if (open === -1) return []
  const keys = []
  let depth = 0
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) break
    } else if (depth === 1 && /['"\w]/.test(ch)) {
      /* A key is at depth 1 and followed by a colon. Anything else at this
       * depth is part of a value that has already been stepped over. */
      const rest = src.slice(i)
      const match = /^(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$.-]*))\s*:/.exec(rest)
      if (match) {
        keys.push(match[1] ?? match[2] ?? match[3])
        i += match[0].length - 1
      }
    }
  }
  return keys
}

/** The shell a meta object asks for.
 *
 *  `undefined` does not mean the same thing on both sides of the router, and
 *  the difference is easy to get wrong. A **gated** screen goes through
 *  `RequireAccess`, whose `resolveShell` maps `undefined` to `AppShell`. An
 *  **ungated** one is rendered by the branch above it, which reads
 *  `entry.shell` directly and renders the screen bare when it is falsy. So
 *  `{ ungated: true }` with no shell is no chrome, not the operational shell —
 *  which is right, because every screen in that barrel is an auth-chain page
 *  that brings its own `AuthLayout`.
 *
 *  `{ shell: PortalShell }` → `'PortalShell'`; `{ shell: null }` → `'none'`. */
function shellOfMeta(meta) {
  const fallback = meta && /ungated\s*:\s*true/.test(meta) ? NO_SHELL : DEFAULT_SHELL
  if (!meta) return DEFAULT_SHELL
  const match = /shell\s*:\s*([A-Za-z_$][\w$]*|null|undefined)/.exec(meta)
  if (!match) return fallback
  if (match[1] === 'null') return NO_SHELL
  if (match[1] === 'undefined') return fallback
  return match[1]
}

/** screen name → the shell its route renders it in. Screens the route table
 *  never names are absent, which is how the caller tells "routed with no
 *  chrome" from "not routed at all". */
export function routedShells(routesSrc) {
  const shells = new Map()
  const claim = (name, shell) => {
    if (name) shells.set(name, shell)
  }

  /* asDomain(MAP, ShellExpr, …) — the three legacy maps. */
  for (const m of routesSrc.matchAll(
    /asDomain\(\s*(\w+)\s*,\s*([A-Za-z_$][\w$]*|null|undefined)/g,
  )) {
    const shell = m[2] === 'null' ? NO_SHELL : m[2] === 'undefined' ? DEFAULT_SHELL : m[2]
    for (const key of objectKeys(routesSrc, m[1])) claim(key, shell)
  }

  /* lazyBarrel(loader, [ 'A', 'B' ], meta?) — every domain barrel. The name
   * list and the optional meta are taken from the same call, so a barrel that
   * is split in two (as the kiosk is) is read as the two calls it is. */
  for (const m of routesSrc.matchAll(
    /lazyBarrel\(\s*\(\)\s*=>\s*import\([^)]*\)\s*,\s*\[([\s\S]*?)\]\s*(?:,\s*(\{[\s\S]*?\})\s*)?\)/g,
  )) {
    const shell = shellOfMeta(m[2])
    for (const name of m[1].matchAll(/'([^']+)'/g)) claim(name[1], shell)
  }

  return shells
}
