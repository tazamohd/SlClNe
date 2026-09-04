import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import {
  Field,
  Form,
  FormActions,
  FormErrorSummary,
  ServerValidationError,
  SubmitButton,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Figure, FigureStrip } from './InventoryBits'
import { checkReservation, checkReservationRelease } from './ledger'
import { asFormError, type MovementApi, type ReservationInput } from './movementApi'
import { quantitySchema } from './movementKinds'
import { availableOf, partRef, reservedOf, type Part } from './partFields'

/* ─────────────────────────────────────────────────────────── reservations */

export type ReservationAction = 'reserve' | 'release'

/** Hold stock against open work, or give a hold back.
 *
 *  A reservation is not a movement: it does not touch on-hand or the ledger, it
 *  moves `parts.reserved` so that `Available = OnHand − Reserved` falls without
 *  any stock leaving the shelf. The endpoints are their own
 *  (`POST`/`DELETE /inventory/:id/reservation`), guarded by `checkReservation`
 *  and its release counterpart — a hold may not exceed what is on hand, a
 *  release may not exceed the hold — and the client mirrors both so an
 *  impossible request is refused on the field before the round trip. */
export function ReservationModal({
  action,
  part,
  api,
  onClose,
  onDone,
}: {
  action: ReservationAction
  part: Part
  api: MovementApi
  onClose: () => void
  onDone: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const ref = partRef(part)
  const reserved = reservedOf(part) ?? 0
  const available = availableOf(part) ?? part.stock - reserved
  const reserving = action === 'reserve'

  const form = useZodForm({
    schema: z.object({
      qty: quantitySchema,
      ref: z.string().trim().max(64, 'A reference can be at most 64 characters.'),
      reason: z.string().trim().max(500, 'A reason can be at most 500 characters.'),
    }),
    initial: { qty: '', ref: '', reason: '' },
    async onSubmit(values) {
      const qty = Number(values.qty)
      // The contract rules the server enforces, run early against the current
      // figures — the server still holds the row lock and decides.
      const failure = reserving
        ? checkReservation({ qty, onHand: part.stock, reserved })
        : checkReservationRelease({ qty, reserved })
      if (failure) throw new ServerValidationError({ [failure.field]: failure.message })

      const input: ReservationInput = {
        qty,
        ...(values.ref ? { ref: values.ref } : {}),
        ...(values.reason ? { reason: values.reason } : {}),
      }
      try {
        if (reserving) await api.reserve(ref, input)
        else await api.release(ref, input)
      } catch (error) {
        throw asFormError(error)
      }

      // A reservation changes `reserved`/`available` on the part row, not the
      // ledger, so it is the parts list that is re-read.
      await client.invalidateQueries({ queryKey: ['parts'] })
      toast.show({
        title: reserving ? t('Stock reserved') : t('Reservation released'),
        description: `${part.name}`,
      })
      onDone()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const projected = /^\d+$/.test(form.values.qty)
    ? reserved + (reserving ? Number(form.values.qty) : -Number(form.values.qty))
    : null

  return (
    <Modal
      open
      onClose={close}
      variant="lifecycle"
      icon={reserving ? 'Lock' : 'RotateCcw'}
      title={reserving ? 'Reserve Stock' : 'Release Reservation'}
      description={t(
        reserving
          ? 'Hold stock for open work. It stays on the shelf but leaves the available balance until it is consumed or released.'
          : 'Give a held reservation back to the available balance without moving any stock.'
      )}
      meta={
        <span dir="ltr" className="font-mono">
          {part.sku}
        </span>
      }
    >
      <Form form={form}>
        <FormErrorSummary />

        <FigureStrip part={part}>
          {projected === null ? null : (
            <Figure label="Reserved After" value={projected} tone="blue" />
          )}
        </FigureStrip>

        <Field
          name="qty"
          label={reserving ? 'Quantity To Reserve' : 'Quantity To Release'}
          required
          placeholder="0"
          hint={
            reserving
              ? `Whole units only. At most ${available} can be reserved.`
              : `Whole units only. At most ${reserved} can be released.`
          }
        />
        <Field
          name="ref"
          label={reserving ? 'Job Card / Order' : 'Reference'}
          hint={
            reserving
              ? 'The open work this stock is being held for.'
              : 'The hold being released, so it can be traced.'
          }
        />
        <Field
          name="reason"
          label="Reason"
          kind="textarea"
          rows={2}
          hint="Recorded on the reservation and in the audit log."
        />

        <FormActions>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={reserving ? 'Reserve Stock' : 'Release Reservation'} />
        </FormActions>
      </Form>
    </Modal>
  )
}
