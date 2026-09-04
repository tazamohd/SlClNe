import { useCallback } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import {
  Field,
  Form,
  FormActions,
  FormErrorSummary,
  SubmitButton,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { parseSar } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { useCreate } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { asFormError, idempotencyKey } from './movementApi'
import type { Part } from './partFields'

/* ────────────────────────────────────────────────────────────── adding a part */

const partSchema = z.object({
  name: z.string().trim().min(1, 'Enter the part name.').max(160),
  sku: z
    .string()
    .trim()
    .min(1, 'Enter the SKU.')
    .max(64, 'A SKU can be at most 64 characters.'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter the sell price.')
    .refine((value) => parseSar(value) >= 0, 'A price cannot be negative.'),
  reorder: z
    .string()
    .trim()
    .min(1, 'Enter the reorder point.')
    .regex(/^\d+$/, 'The reorder point must be a whole number of units.'),
  opening: z
    .string()
    .trim()
    .min(1, 'Enter the opening quantity.')
    .regex(/^\d+$/, 'The opening quantity must be a whole number of units.'),
})

/** Creating a part is the only place an opening quantity is ever set. Every
 *  later change to it is a movement, which is what makes the opening term of
 *  the §A11 equation a constant rather than something a screen can revise. */
export function AddPartModal({ onClose }: { onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const create = useCreate('parts')

  const form = useZodForm({
    schema: partSchema,
    initial: { name: '', sku: '', price: '', reorder: '', opening: '' },
    async onSubmit(values) {
      try {
        await create.mutateAsync({
          input: {
            name: values.name,
            sku: values.sku,
            priceHalalas: Math.round(parseSar(values.price) * 100),
            reorderLevel: Number(values.reorder),
            openingStock: Number(values.opening),
            backorderable: false,
          } as Partial<Part>,
          options: { idempotencyKey: idempotencyKey() },
        })
      } catch (error) {
        throw asFormError(error)
      }
      toast.show({ title: t('Part added'), description: values.name })
      onClose()
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !form.pending)
  const close = useCallback(() => {
    void confirmDiscard().then((ok) => {
      if (ok) onClose()
    })
  }, [confirmDiscard, onClose])

  return (
    <Modal
      open
      onClose={close}
      variant="crud"
      icon="Plus"
      title={t('Add Part')}
      description={t('A new part starts at its opening quantity. Everything after that is a movement.')}
    >
      <Form form={form}>
        <FormErrorSummary />
        <Field name="name" label="Part Name" required placeholder={t('Oil Filter (Toyota)')} />
        <Field name="sku" label="SKU" required placeholder={t('OF-TY-118')} />
        <Field name="price" label="Sell Price" kind="currency" required />
        <Field
          name="reorder"
          label="Reorder At"
          required
          hint="The level at which this part shows in Alerts."
        />
        <Field
          name="opening"
          label="Opening Quantity"
          required
          hint="Whole units on the shelf today. It cannot be edited later — correct it with an adjustment."
        />
        <FormActions note>
          <Button variant="subtle" size="lg" onClick={close} disabled={form.pending}>
            {t('Cancel')}
          </Button>
          <SubmitButton label="Add Part" />
        </FormActions>
      </Form>
    </Modal>
  )
}
