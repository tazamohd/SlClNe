import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { fleetRenewBody } from '@contract'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Form, FormErrorSummary, useZodForm } from '@/components/ui/Form'
import { parseSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { NoWritesNotice, serverFieldError } from './writes'
import { RepositoryError, actionFailureMessage, renewFleet } from '../crm/api'

/** Renew Contract — the design's action on `FleetContract`, made real against
 *  `POST /fleets/:id/renew` (F-027).
 *
 *  A renewal is a specific action, not an arbitrary patch: the server moves the
 *  term forward, records the new value and sets the contract status back to
 *  active in one step. The new end date is the one required input — a renewal
 *  with no term is not a renewal — and the rest refine the new term. Display
 *  money ("SAR 240,000") is turned back into the integer halalas the API stores.
 *  Against the fixtures the action refuses honestly with the "set VITE_API_URL"
 *  state rather than faking the renewal. */
const TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'custom', label: 'Custom' },
] as const

const renewForm = z
  .object({
    contractEndDate: z.string(),
    contractValue: z.string(),
    contractStartDate: z.string(),
    renewalDate: z.string(),
    contractType: z.string(),
  })
  .transform((values) => {
    const value = values.contractValue.trim()
    const start = values.contractStartDate.trim()
    const renewal = values.renewalDate.trim()
    const type = values.contractType.trim()
    return {
      contractEndDate: values.contractEndDate.trim(),
      ...(value ? { contractValueHalalas: Math.round(parseSar(value) * 100) } : {}),
      ...(start ? { contractStartDate: start } : {}),
      ...(renewal ? { renewalDate: renewal } : {}),
      ...(type ? { contractType: type } : {}),
    }
  })
  .pipe(fleetRenewBody)

type RenewFormValues = z.input<typeof renewForm>

export function FleetRenewModal({
  open,
  onClose,
  fleetRef,
  fleetName,
}: {
  open: boolean
  onClose: () => void
  /** The fleet's ULID or its business id — the route accepts either. */
  fleetRef: string
  fleetName: string
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()

  const form = useZodForm({
    schema: renewForm,
    initial: {
      contractEndDate: '',
      contractValue: '',
      contractStartDate: '',
      renewalDate: '',
      contractType: '',
    } satisfies RenewFormValues,
    async onSubmit(values) {
      try {
        await renewFleet(fleetRef, values)
      } catch (cause) {
        const attributed = serverFieldError(cause)
        if (attributed) throw attributed
        throw new Error(
          cause instanceof RepositoryError
            ? actionFailureMessage(cause, t('The contract could not be renewed.'))
            : t('The contract could not be renewed.'),
        )
      }
      // The row's contract term and status changed server-side; refresh the
      // fleets collection so the detail reflects the renewed contract.
      void client.invalidateQueries({ queryKey: ['fleets'] })
      toast.show({ title: t('Contract renewed'), description: fleetName })
      onClose()
    },
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="crud"
      icon="FileSignature"
      title={t('Renew Contract')}
      dismissible={!form.pending}
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={onClose} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <Button size="lg" onClick={() => form.submit()} disabled={form.pending}>
            {form.pending ? t('Renewing...') : t('Renew Contract')}
          </Button>
        </>
      }
    >
      <NoWritesNotice />
      <Form form={form}>
        <FormErrorSummary />
        <Field name="contractEndDate" label="New End Date" kind="date" required />
        <Field name="contractStartDate" label="New Start Date" kind="date" />
        <Field name="renewalDate" label="Renewal Reminder" kind="date" />
        <Field name="contractValue" label="Contract Value" kind="currency" placeholder="240,000" />
        <Field name="contractType" label="Contract Type" kind="select" options={TYPE_OPTIONS} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={form.pending}>
          {t('Renew Contract')}
        </button>
      </Form>
    </Modal>
  )
}
