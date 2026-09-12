/** Shared shapes for data both `IndexPage` and `CommandDeck` read — kept in
 *  one place so the section on the page and the console's answer about it
 *  never drift apart. Types only: every string these describe is produced by
 *  a literal `t(...)` call at its call site in `IndexPage.tsx`, not here. */

export interface EraRow {
  readonly year: string
  readonly status: string
  readonly headline: string
  readonly body: string
}

export interface LedgerLine {
  readonly label: string
  readonly amount: string
}

export interface LedgerData {
  readonly total: string
  readonly lines: readonly LedgerLine[]
}
