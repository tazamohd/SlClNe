/** What a screen's source says about its tablet, RTL and Arabic readiness.
 *
 *  Split out of `build-registry.mjs` for one reason: these three decisions used
 *  to be constants — `tablet` was the literal 'MISSING', `arabic` and `rtl` were
 *  `built ? 'PARTIAL' : 'MISSING'` while their flags clear only on 'VERIFIED' —
 *  so TABLET_MISSING, ARABIC_MISSING and RTL_BROKEN fired on all 424 entries
 *  whatever any screen did, and could never fall. Replacing a constant with a
 *  detector only helps if the detector is itself checkable, and one buried in a
 *  1200-line generator is not. These are pure, exported, and pinned by
 *  `tests/unit/screen-facts.test.ts` in both directions: a detector that cannot
 *  be shown to fire is a constant wearing a regex.
 */

/** Tailwind classes that hard-code a physical side. `dir="rtl"` mirrors the
 *  logical utilities (`ms-`, `pe-`, `text-start`) and leaves these where they
 *  are, so one of them in a layout is a real right-to-left hazard.
 *
 *  Scoped to class tokens, and anchored. A plain scan for /left-|right-/ over
 *  the file matched `right-rail`, `right-hand` and `border-line` in English
 *  prose, and flagged `left-1/2 -translate-x-1/2`, which centres an element and
 *  is direction-neutral — six false hazards out of six. */
export const PHYSICAL_CLASS =
  /^(?:[\w-]+:)*(?:m[lr]-|p[lr]-|border-[lr]($|-)|rounded-[lr]($|-)|text-(?:left|right)$)/

/** A breakpoint prefix that takes effect somewhere in 768–1024, the range the
 *  tablet claim is about. `sm:` is below it and `xl:` above. */
export const TABLET_PREFIX = /^(?:md|lg):/

/** Every class token the file actually applies, read from `className=` only —
 *  so a word in a comment or a string of prose cannot register as layout. */
export function classNameTokens(src) {
  return [...src.matchAll(/className\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)]
    .flatMap((m) => (m[1] ?? m[2] ?? m[3] ?? '').split(/\s+/))
    .filter(Boolean)
}

/** `{ physical, tabletBreakpoints }` for one source file. */
export function layoutFacts(src) {
  const tokens = classNameTokens(src)
  return {
    physical: tokens.some((c) => PHYSICAL_CLASS.test(c)),
    tabletBreakpoints: tokens.some((c) => TABLET_PREFIX.test(c)),
  }
}

/** The Arabic state a screen's `t()` facts support.
 *
 *  `facts` comes from `i18n-scan`'s `scanFile`, which is the same pass
 *  `check-i18n` runs — deliberately, so the gate and the registry cannot give
 *  two answers about one file.
 *
 *    MISSING   a literal key with no Arabic, or no `t()` at all (a screen with
 *              no translated string renders English in Arabic mode; certifying
 *              it on an empty set is the same false clear as the constant this
 *              replaced, arrived at from the other side)
 *    PARTIAL   keys are built dynamically, so no static pass can prove them
 *    VERIFIED  every key is a literal and the dictionary covers it
 */
export function arabicStateFrom({ translated, uncovered, dynamic }) {
  if (uncovered) return 'MISSING'
  if (dynamic) return 'PARTIAL'
  return translated ? 'VERIFIED' : 'MISSING'
}
