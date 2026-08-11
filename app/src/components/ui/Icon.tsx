import {
  BellRing,
  ChartBar,
  ChartColumn,
  ChartLine,
  ChartPie,
  CircleAlert,
  CircleCheckBig,
  FileDown,
  FileQuestion,
  HeartPulse,
  House,
  LifeBuoy,
  Lightbulb,
  MessagesSquare,
  PackageSearch,
  Radio,
  ScanEye,
  ScanLine,
  SquareCheck,
  TriangleAlert,
  Undo2,
  Video,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { ICONS } from './icon-registry'

/** Names the generated registry does not carry, resolved to the glyph they mean.
 *
 *  Two causes, both outside this file. lucide renamed a family of icons in
 *  v0.4xx (`AlertTriangle` → `TriangleAlert`, `CheckCircle` → `CircleCheckBig`,
 *  `Home` → `House`), and the design bundle still asks for the old names, so the
 *  generator's intersection with lucide's current key set silently dropped them.
 *  Separately, its scanner never collected single-letter names or names that
 *  only appear in hand-written screens — which is why the close `X` on every
 *  toast, and the warning triangle on QC, rendered nothing at all.
 *
 *  Resolved here rather than in a screen so one mapping serves every caller. The
 *  durable fix is in `scripts/port-design-data.mjs`, which this file cannot
 *  reach; until that lands, these are the names in use with no glyph behind
 *  them. */
const ALIASES: Record<string, LucideIcon> = {
  AlertCircle: CircleAlert,
  AlertTriangle: TriangleAlert,
  BarChart3: ChartColumn,
  BellRing,
  CheckCircle: CircleCheckBig,
  CheckSquare: SquareCheck,
  FileDown,
  FileQuestion,
  HeartPulse,
  Home: House,
  LifeBuoy,
  Lightbulb,
  LineChart: ChartLine,
  MessagesSquare,
  PackageSearch,
  PieChart: ChartPie,
  Radio,
  ScanEye,
  ScanLine,
  Undo2,
  VideoIcon: Video,
  X,
  // Not a rename — the bar-chart family split, and this is the one the reports
  // mean when they ask for horizontal bars.
  BarChart: ChartBar,
}

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
  const Glyph = ICONS[name] ?? ALIASES[name]
  if (!Glyph) {
    if (import.meta.env.DEV) console.warn(`[Icon] unknown lucide icon: ${name}`)
    return null
  }
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden {...props} />
}
