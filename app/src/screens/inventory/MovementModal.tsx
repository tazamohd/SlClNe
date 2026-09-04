import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { Icon } from '@/components/ui/Icon'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Figure, FigureStrip } from './InventoryBits'
import { checkMovement, movementDelta } from './ledger'
import { asFormError, idempotencyKey, type MovementApi } from './movementApi'
import { movementSchema, type MovementKind } from './movementKinds'
import { backorderableOf, partRef, reservedOf, type Part } from './partFields'

/* ══════════════════════════════════════════════════ recording a movement */

/** One movement of one kind against one part.
 *
 *  The same rule the endpoint applies is run early so an impossible movement
 *  is refused on the field rather than as a round trip. The server still
 *  decides: it holds the row lock and the current quantity. */
export function MovementModal({
  kind,
  part,
  api,
  onClose,
  onRecorded,
}: {
  kind: MovementKind
  part: Part
  api: MovementApi
  onClose: () => void
  onRecorded: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const ref = partRef(part)
  const reserved = reservedOf(part) ?? 0
  const backorderable = backorderableOf(part)

  // A consumption may draw its quantity from a held reservation, which lifts the
  // unreserved-balance bound and replaces it with the reservation's own — but
  // only when there is a reservation to draw on, so it is offered only then.
  const canDrawReservation = kind.allowFromReservation === true && reserved > 0
  const [fromReservation, setFromReservation] = useState(false)

  const schema = useMemo(() => movementSchema(kind), [kind])

  const form = useZodForm({
    schema,
    initial: { qty: '', ref: '', reason: '', toBranchId: '' },
    async onSubmit(values) {
      const qty = Number(values.qty)
      const drawsReservation = canDrawReservation && fromReservation
      const failure = checkMovement({
        type: kind.type,
        qty,
        onHand: part.stock,
        reserved,
        backorderable,
        fromReservation: drawsReservation,
      })
      if (failure) throw new ServerValidationError({ [failure.field]: failure.message })

      try {
        await api.record(
          ref,
          {
            type: kind.type,
            qty,
            ...(values.ref ? { ref: values.ref } : {}),
            ...(values.reason ? { reason: values.reason } : {}),
            ...(values.toBranchId ? { toBranchId: values.toBranchId } : {}),
            ...(drawsReservation ? { fromReservation: true } : {}),
          },
          idempotencyKey()
        )
      } catch (error) {
        throw asFormError(error)
      }

      await client.invalidateQueries({ queryKey: ['inventory-movements', ref] })
      await client.invalidateQueries({ queryKey: ['parts'] })
      toast.show({
        title: t('Movement recorded'),
        description: `${t(kind.label)} — ${part.name}`,
      })
      onRecorded()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)

  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  const projected = /^\d+$/.test(form.values.qty)
    ? part.stock + movementDelta(kind.type, Number(form.values.qty))
    : null

  return (
    <Modal
      open
      onClose={close}
      variant="lifecycle"
      icon={kind.icon}
      destructive={kind.destructive}
      title={kind.title}
      description={t(kind.description)}
      meta={
        <span dir="ltr" className="font-mono">
          {part.sku}
        </span>
      }
    >
      <Form form={form}>
        <FormErrorSummary />

        {kind.warning ? (
          <p
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-3.5 py-3 text-[13px] text-body"
          >
            <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
            {t(kind.warning)}
          </p>
        ) : null}

        <FigureStrip part={part}>
          {projected === null ? null : (
            <Figure label="After This Movement" value={projected} tone="blue" />
          )}
        </FigureStrip>

        <Field
          name="qty"
          label={kind.quantityLabel}
          required
          placeholder="0"
          hint={kind.note ?? 'Whole units only.'}
        />
        {canDrawReservation ? (
          <label className="flex cursor-pointer items-start gap-2.5 rounded border border-border bg-inset px-3.5 py-2.5 text-[13px] text-body">
            <input
              type="checkbox"
              checked={fromReservation}
              onChange={(event) => setFromReservation(event.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-salis-blue"
            />
            <span>
              {t('Draw this consumption from the held reservation.')}{' '}
              <span dir="ltr" className="font-mono text-muted">
                {reserved}
              </span>{' '}
              {t('units are reserved; a draw is bounded by that, and releases the hold as it goes.')}
            </span>
          </label>
        ) : null}
        {kind.needsBranch ? (
          <Field
            name="toBranchId"
            label="Destination Branch Id"
            required
            placeholder="01JB7KQ2M4N8P0R2T4V6X8Z0AB"
            hint="Entered rather than chosen: no endpoint lists branches yet, and the API records the destination as a branch id."
          />
        ) : null}
        <Field name="ref" label={kind.refLabel} hint={kind.refHint} />
        <Field
          name="reason"
          label="Reason"
          kind="textarea"
          rows={2}
          required={kind.reasonRequired}
          hint="Recorded on the movement and in the audit log."
        />

        <FormActions note={kind.reasonRequired}>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label={kind.label} />
        </FormActions>
      </Form>
    </Modal>
  )
}
