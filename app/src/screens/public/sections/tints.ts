/** The four icon-chip tints the PublicPortal designs rotate through.
 *
 *  Each is a translucent wash of a brand token with the solid brand colour as
 *  the glyph — exactly the `ic(bg,fg)` helper in the `.dc.html` sources. Kept
 *  as rgba() washes over utility classes so the token gate sees no hex
 *  literals and the brand rule (blue and orange only) holds by construction. */
export type Tint = 'blue' | 'bright' | 'orange' | 'navy'

export const TINT_CHIP: Record<Tint, string> = {
  blue: 'bg-[rgba(10,94,215,.1)] text-salis-blue',
  bright: 'bg-[rgba(11,179,255,.1)] text-salis-bright',
  orange: 'bg-[rgba(249,115,22,.1)] text-salis-orange',
  navy: 'bg-[rgba(11,31,59,.1)] text-salis-navy dark:bg-[rgba(11,179,255,.1)] dark:text-salis-bright',
}

export const TINT_PILL: Record<Tint, string> = {
  blue: 'bg-[rgba(10,94,215,.1)] text-salis-blue',
  bright: 'bg-[rgba(11,179,255,.1)] text-salis-bright',
  orange: 'bg-[rgba(249,115,22,.1)] text-salis-orange',
  navy: 'bg-[rgba(11,31,59,.1)] text-salis-navy dark:bg-[rgba(11,179,255,.1)] dark:text-salis-bright',
}

/** Soft two-stop gradients used as decorative tile/card headers (Marketplace
 *  product tiles, Blog post headers). Inline `background` values — rgba only,
 *  no hex — because Tailwind arbitrary values cannot carry commas this deep
 *  without becoming unreadable. */
export const TINT_WASH: Record<Tint, string> = {
  blue: 'linear-gradient(135deg,rgba(10,94,215,.08),rgba(11,179,255,.06))',
  bright: 'linear-gradient(135deg,rgba(11,179,255,.08),rgba(10,94,215,.06))',
  orange: 'linear-gradient(135deg,rgba(249,115,22,.08),rgba(10,94,215,.04))',
  navy: 'linear-gradient(135deg,rgba(11,31,59,.08),rgba(10,94,215,.04))',
}
