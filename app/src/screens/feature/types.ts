import type { Stat } from '@/components/shell/FeatureScreen'

/** Declarative description of a feature screen.
 *
 *  The 211 screens with no `.dc.html` design share one shape (see
 *  `FeatureScreen.tsx`), and their reference screenshots differ mainly in
 *  content: which stats, which tabs, which table. Describing them as data keeps
 *  them consistent and reviewable side by side, and any screen that grows real
 *  behaviour graduates to its own component — `Inventory` already has.
 *
 *  This is not a shortcut around the designs. These screens have no design; the
 *  alternative is 211 separate interpretations of the same layout. */
export interface FeatureDef {
  /** Spec number, e.g. "036" — ties back to project/spec-shots/. */
  id: string
  /** Route path. Must match the generated spec-screens entry. */
  route: string
  title: string
  subtitle?: string
  /** lucide icon for the header tile. */
  icon: string
  /** Primary action button label, if the screenshot shows one. */
  action?: { label: string; icon: string }
  tabs?: readonly { id: string; label: string; icon?: string }[]
  stats?: readonly Stat[]
  /** Panels below the stat row. */
  sections?: readonly FeatureSection[]
}

export interface FeatureSection {
  title: string
  subtitle?: string
  /** Column headers for a table panel. */
  columns?: readonly string[]
  /** Rows, each a list of cell strings matching `columns`. */
  rows?: readonly (readonly string[])[]
  /** Shown when there are no rows — most of these screens are empty in the
   *  reference app, and saying so plainly beats a blank panel. */
  empty?: { icon?: string; title: string; description?: string }
  /** Renders a search field in the panel toolbar. */
  searchable?: boolean
}
