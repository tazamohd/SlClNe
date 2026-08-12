import { Icon } from '@/components/ui/Icon'
import { ServerValidationError } from '@/components/ui/Form'
import { isLive } from '@/data/repository'
import { RepositoryError } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The three things every write on a registry screen has to get right, in one
 *  place so the customer and vehicle forms cannot get them right differently. */

/** The ULID a mutation addresses a row by.
 *
 *  `RowOf<K>` is derived from the fixture tables in `data/generated`, which
 *  carry the columns the design bundle drew and not the entity metadata the API
 *  adds, so `_id` is not on the type even though every row the API returns has
 *  one. `useCollection`'s own `identify` does the same widening for the same
 *  reason. */
export function rowId(row: unknown): string | undefined {
  const candidate = row as { _id?: string; id?: string } | null | undefined
  if (typeof candidate?._id === 'string') return candidate._id
  return typeof candidate?.id === 'string' ? candidate.id : undefined
}

/** A validated form body, as the mutation hooks want it.
 *
 *  Same gap in the other direction: the body carries columns the API accepts
 *  (`email`, `mileageKm`, `customerId`) that the fixture-derived row type does
 *  not name. The cast is deliberate and narrow — the *shape* is guaranteed by
 *  the contract schema the values were just parsed through, which is a stronger
 *  guarantee than the row type would have given. */
export function asPatch<TRow>(values: object): Partial<TRow> {
  return values as unknown as Partial<TRow>
}

/** Turns a rejection the server attributed to a field into the error the form
 *  system puts on that field. Returns `undefined` when there is no field to
 *  attach it to, so the caller can raise it at form level instead.
 *
 *  The API sends `error.field` for anything its Zod guard refuses. It does not
 *  send one for a unique-constraint conflict — a duplicate phone, plate or VIN
 *  arrives as a 409 with "That value is already in use." and no field — so that
 *  one lands on the form rather than on the control that caused it. */
export function serverFieldError(cause: unknown): ServerValidationError | undefined {
  if (!(cause instanceof RepositoryError) || !cause.field) return undefined
  // `a.b` paths come from nested bodies; the form addresses top-level controls.
  const field = cause.field.split('.')[0]
  return new ServerValidationError({ [field]: cause.message })
}

/** Says so when this build has no API behind it.
 *
 *  `VITE_API_URL` unset means the fixture repository, which refuses writes by
 *  design rather than mutating an array and reporting a success the next reload
 *  would contradict. Telling the user before they fill the form in beats
 *  letting them find out on submit. */
export function NoWritesNotice() {
  const { t } = usePreferences()
  if (isLive) return null
  return (
    <p className="flex items-start gap-2 rounded border border-border bg-inset px-3 py-2 text-[13px] text-body">
      <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-muted" />
      {t('This build reads demo data. Saving needs the API — set VITE_API_URL.')}
    </p>
  )
}
