import type { Stat } from '@/components/shell/FeatureScreen'
import type { CollectionKey } from '@/data/repository'

/** Declarative description of a feature screen.
 *
 *  The 211 screens with no `.dc.html` design share one shape (see
 *  `FeatureScreen.tsx`), and their reference screenshots differ mainly in
 *  content: which stats, which tabs, which table. Describing them as data keeps
 *  them consistent and reviewable side by side, and any screen that grows real
 *  behaviour graduates to its own component — `Inventory` already has.
 *
 *  This is not a shortcut around the designs. These screens have no design; the
 *  alternative is 211 separate interpretations of the same layout.
 *
 *  The UX pass added a second axis: a `layout` per screen, chosen from its
 *  purpose (a live monitor is not a list; a VIN decoder is a wizard), plus a
 *  hero figure, real actions, filters, related links and — where a real
 *  collection carries the rows — a `collection` binding. All optional; a def
 *  with none of them renders exactly as it did. The per-route choices live in
 *  `layouts.ts` and are merged over the base def at render time. */
export type FeatureLayout = 'list' | 'board' | 'calendar' | 'split' | 'wizard' | 'monitor' | 'gallery'

export interface FeatureAction {
  /** English source string. */
  label: string
  icon: string
  /** Exactly one `primary` per screen; the rest go behind "More actions". */
  intent?: 'primary' | 'secondary' | 'destructive'
  /** `route` navigates, `wizard` opens the screen's wizard as a sheet, `toast`
   *  acknowledges with the given message (for capabilities whose effect is
   *  server-side and not wired yet — the message must say so). */
  kind: 'route' | 'wizard' | 'toast'
  to?: string
  message?: string
}

export interface FeatureField {
  name: string
  /** English source string. */
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'tel'
  options?: readonly string[]
  required?: boolean
  /** Latin-only content (VIN, plate, SKU): pinned LTR. */
  ltr?: boolean
  placeholder?: string
}

export interface FeatureQuickLink {
  label: string
  icon: string
  to: string
}

export interface FeatureFilter {
  id: string
  /** English source string. */
  label: string
  /** Which cell of the section rows the chip matches. */
  column: number
  /** Omit to derive the options from the rows. */
  options?: readonly string[]
}

export interface FeatureHero {
  stat: Stat
  trend?: readonly number[]
  unit?: string
}

export interface FeatureBoard {
  columns: readonly { id: string; label: string; tone?: 'info' | 'warning' }[]
  /** Cell index whose text names the column a row sits in. */
  groupBy: number
}

export interface FeatureWizard {
  steps: readonly { id: string; label: string; icon: string; fields: readonly FeatureField[] }[]
  /** English source string for the final button. */
  submit: string
  /** Section whose table receives the created row. Defaults to the first. */
  section?: string
  /** Toast shown on completion. */
  done: string
}

export interface FeatureGauge {
  label: string
  /** Fixed value, or `fromRows` to count the section rows. */
  value?: number
  fromRows?: boolean
  max: number
  unit?: string
  tone?: 'info' | 'warning'
}

export interface FeatureMonitor {
  gauges: readonly FeatureGauge[]
  /** English source string for the feed panel. */
  feedTitle: string
}

export interface FeatureCalendar {
  /** Cell index carrying a parseable date. */
  dateColumn: number
  labelColumn: number
}

/** Bind a section to a real collection instead of the kit's own rows. */
export interface FeatureCollectionBinding {
  key: CollectionKey
  fields: readonly { header: string; key: string; code?: boolean; numeric?: boolean }[]
  filter?: Record<string, string | number | boolean>
}

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

  layout?: FeatureLayout
  hero?: FeatureHero
  actions?: readonly FeatureAction[]
  filters?: readonly FeatureFilter[]
  quickLinks?: readonly FeatureQuickLink[]
  emptyAction?: FeatureAction
  collection?: FeatureCollectionBinding
  board?: FeatureBoard
  wizard?: FeatureWizard
  monitor?: FeatureMonitor
  calendar?: FeatureCalendar
  /** Short note under the header for experimental or hardware-bound features. */
  notice?: string
}

export interface FeatureSection {
  title: string
  subtitle?: string
  /** Column headers for a table panel. */
  columns?: readonly string[]
  /** Rows, each a list of cell strings matching `columns`. Seeded into the
   *  `featureRows` collection at build time; screens read them through the
   *  repository seam, never from here directly. */
  rows?: readonly (readonly string[])[]
  /** Shown when there are no rows — most of these screens are empty in the
   *  reference app, and saying so plainly beats a blank panel. */
  empty?: { icon?: string; title: string; description?: string }
  /** Renders a search field in the panel toolbar. */
  searchable?: boolean
}
