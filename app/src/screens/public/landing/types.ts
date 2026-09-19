/** `t` is `useT()` from PreferencesProvider: `(source: string) => string`. Kept
 *  as one shared alias so the homepage's own section components (`Hero`,
 *  `ProofBand`, `ProductMockups`, `ReleaseTimeline`, `SocialProofBand`) don't
 *  each redeclare it. */
export type T = (source: string) => string
