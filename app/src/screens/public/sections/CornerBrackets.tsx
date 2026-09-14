/** Four small corner-bracket accents — the instrument-panel framing borrowed
 *  from the "SALIS AUTO 2030" design study (its `.panel .corner` treatment),
 *  adapted to the site's own light palette and brand tokens rather than that
 *  study's dark HUD theme. Purely decorative: drop into any `relative`
 *  container to give a data-forward block (a stat band, a plan card, a
 *  product tile) an instrument-panel read instead of a plain card.
 *
 *  `aria-hidden` on every accent — a sighted-only flourish with nothing for
 *  a screen reader to announce. */
export function CornerBrackets() {
  return (
    <>
      <i
        aria-hidden="true"
        className="pointer-events-none absolute -start-px -top-px h-3 w-3 border-s-2 border-t-2 border-salis-bright"
      />
      <i
        aria-hidden="true"
        className="pointer-events-none absolute -end-px -top-px h-3 w-3 border-e-2 border-t-2 border-salis-bright"
      />
      <i
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px -start-px h-3 w-3 border-b-2 border-s-2 border-salis-bright"
      />
      <i
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px -end-px h-3 w-3 border-b-2 border-e-2 border-salis-bright"
      />
    </>
  )
}
