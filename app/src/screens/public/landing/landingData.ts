/** Shared shapes for the repeated blocks the six pages render — kept in one
 *  place so a rail on Arrival and a rail on Origin cannot drift into two
 *  different shapes. Types only: every string these describe is produced by a
 *  literal `t(...)` call at its call site in a `.tsx` file, never here, since
 *  `check-i18n` reads call sites statically and `ar-coverage.test.ts` only
 *  looks inside `src/screens/**\/*.tsx`. */

/** One entry on a `.chrono` rail — the release rail on Arrival (`0.1.0`,
 *  `Alpha`, …) and the company rail on Origin (`I`, `The problem`, …) are the
 *  same shape rendered twice. */
export interface EraRow {
  /** The big figure in the gutter: a release number, or a chapter numeral. */
  readonly year: string
  /** The small caps line under it: `Alpha`, `You are here`, `The problem`. */
  readonly status: string
  readonly headline: string
  readonly body: string
}

/** One priced line on the ZATCA invoice mock. */
export interface LedgerLine {
  readonly label: string
  readonly amount: string
}

export interface LedgerData {
  readonly total: string
  readonly lines: readonly LedgerLine[]
}
