import { type LucideProps } from 'lucide-react'
import { ICONS } from './icon-registry'


/** lucide icon looked up by name.
 *
 *  Replaces the prototypes' `<salis-icon name="Wrench" size="16">` web
 *  component. A name-keyed lookup is not an accident of the port — icon names
 *  arrive as data (nav groups, role rows, badge tables), so they can't be
 *  static imports.
 *
 *  Defaults match the design system: 2px stroke, round caps and joins
 *  (README §7). Import the icon directly from `lucide-react` instead when the
 *  name is known at author time — that tree-shakes.
 *
 *  The registry is generated from the names the design bundle actually
 *  references, so this ships ~230 glyphs rather than lucide's full ~1500, with
 *  `ALIASES` above covering the names the generator misses. A name in neither
 *  warns in dev and renders nothing rather than crashing the screen; add it to
 *  the `extra` list in scripts/port-design-data.mjs. */
export interface IconProps extends Omit<LucideProps, 'ref' | 'size'> {
  name: string
  size?: number
}

export function Icon({ name, size = 16, strokeWidth = 2, ...props }: IconProps) {
  const Glyph = ICONS[name]
  if (!Glyph) {
    if (import.meta.env.DEV) console.warn(`[Icon] unknown lucide icon: ${name}`)
    return null
  }
  // An icon is decorative by default: the label beside it carries the meaning,
  // so the glyph is hidden from the accessibility tree to spare a screen reader
  // announcing the same thing twice. When the glyph *is* the meaning — an icon-
  // only control, a status dot with no text — the caller passes `aria-label`
  // (or `aria-labelledby`), which opts it back in as a named `img` and stands
  // the default `aria-hidden` down. Both come after nothing else can override.
  const meaningful = props['aria-label'] != null || props['aria-labelledby'] != null
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      {...(meaningful ? { role: 'img' } : { 'aria-hidden': true })}
      {...props}
    />
  )
}
