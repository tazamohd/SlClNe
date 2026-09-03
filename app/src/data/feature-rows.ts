import { FEATURE_DEFS } from '@/screens/feature/definitions'

/** One row of a feature-kit table, addressed by the screen and panel it
 *  belongs to.
 *
 *  The kit screens used to carry their rows as literal arrays inside
 *  `definitions.ts`, rendered straight into a `<table>` with no loading, error
 *  or empty state and no sort or paging. Reading them through the repository
 *  seam gives every one of the ~48 kit routes the same states and table
 *  behaviour as a designed screen, and turns the day a real endpoint arrives
 *  into a one-line `collection` change on the def.
 *
 *  Client-local for now — see `CLIENT_LOCAL` in `repository.ts`. Rows are
 *  exactly the literal ones the definitions carried; a def whose panel had
 *  none stays honestly empty. */
export interface FeatureRow {
  id: string
  route: string
  section: string
  cells: readonly string[]
}

export const FEATURE_ROWS_SEED: readonly FeatureRow[] = FEATURE_DEFS.flatMap((def) =>
  (def.sections ?? []).flatMap((section) =>
    (section.rows ?? []).map((cells, index) => ({
      id: `${def.route}::${section.title}::${index}`,
      route: def.route,
      section: section.title,
      cells,
    }))
  )
)
