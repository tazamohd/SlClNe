/** Shared shape for a `.chrono`-style rail entry — the homepage's own release
 *  timeline (`homepage/ReleaseTimeline.tsx`) and the company-story rail on
 *  `../CompanyStory.tsx` render the same shape. Kept in one place so the two
 *  cannot drift into two different shapes. A type only: every string these
 *  describe is produced by a literal `t(...)` call at its call site in a
 *  `.tsx` file, never here, since `check-i18n` reads call sites statically. */
export interface EraRow {
  /** The big figure in the gutter: a release number, or a chapter numeral. */
  readonly year: string
  /** The small caps line under it: `Alpha`, `You are here`, `The problem`. */
  readonly status: string
  readonly headline: string
  readonly body: string
}
