import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import {
  Field,
  Form,
  FormActions,
  FormErrorSummary,
  ServerValidationError,
  SubmitButton,
  useZodForm,
} from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { queryKeys, useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import { PAYMENT_METHODS, createReceipt, writeFailureMessage, type PaymentMethod } from './api'
import { fromHalalas, invoiceMoney } from './money'

/** Raise a receipt against an invoice.
 *
 *  Distinct from the receipt a payment raises for itself: taking money writes a
 *  cleared receipt for the amount received, in the same transaction, and this
 *  is the other kind — the document issued for a balance that has not cleared
 *  yet. The API decides the amount from the invoice's own balance and marks it
 *  pending; this screen names the invoice and the method and nothing else.
 *
 *  `Receipts` drew a "New Receipt" button and wired it to nothing. */
export function RaiseReceiptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const { data: invoices = [] } = useCollection('invoices')
  const [raised, setRaised] = useState<string | null>(null)

  /** Only invoices that could carry a receipt: issued, not cancelled, and with
   *  something still outstanding. A receipt for a settled invoice is a
   *  duplicate of one that already exists. */
  const options = useMemo(
    () =>
      invoices
        .filter((invoice) => {
          if (invoice.status === 'cancelled' || invoice.status === 'draft') return false
          const money = invoiceMoney(invoice)
          return !money.fromServer || money.balanceHalalas > 0
        })
        .map((invoice) => ({
          value: (invoice as { _id?: string })._id ?? invoice.id,
          label: `${invoice.id} · ${invoice.cust}`,
          balance: invoiceMoney(invoice).balanceHalalas,
          known: invoiceMoney(invoice).fromServer,
        })),
    [invoices]
  )

  const form = useZodForm({
    schema: useMemo(
      () =>
        z.object({
          invoiceId: z.string().min(1, 'Choose the invoice this receipt settles.'),
          method: z.string().min(1, 'Choose how the money is being taken.'),
        }),
      []
    ),
    initial: { invoiceId: '', method: 'Cash' },
    async onSubmit(values) {
      try {
        await createReceipt({
          invoiceId: values.invoiceId,
          method: values.method as PaymentMethod,
        })
        setRaised(options.find((option) => option.value === values.invoiceId)?.label ?? null)
        void client.invalidateQueries({ queryKey: queryKeys.all('receipts') })
        toast.show({
          title: t('Receipt raised'),
          description: t('It stays pending until the money clears.'),
        })
      } catch (error) {
        const message = writeFailureMessage(error, 'The receipt could not be raised.')
        throw new ServerValidationError({}, message)
      }
    },
  })

  const chosen = options.find((option) => option.value === form.values.invoiceId)

  function close() {
    setRaised(null)
    form.reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={raised ? 'Receipt raised' : 'New receipt'}
      variant="crud"
      icon={raised ? 'CircleCheck' : 'Receipt'}
      description={raised ? undefined : 'The API takes the amount from the invoice’s balance.'}
      footer={
        raised ? (
          <Button size="lg" onClick={close}>
            {t('Done')}
          </Button>
        ) : undefined
      }
    >
      {raised ? (
        <p className="text-[13px] text-body">
          {t('Raised against')} <span className="font-mono text-heading">{raised}</span>.{' '}
          {t('It stays pending until the money clears.')}
        </p>
      ) : (
        <Form form={form}>
          <FormErrorSummary />

          {options.length === 0 ? (
            <p className="rounded border border-border bg-inset px-3 py-2.5 text-[13px] text-muted">
              {t('Every invoice is settled or cancelled. There is nothing to receipt.')}
            </p>
          ) : (
            <>
              <Field
                name="invoiceId"
                label="Invoice"
                kind="select"
                required
                placeholder="Choose an invoice"
                options={options.map(({ value, label }) => ({ value, label }))}
              />
              {chosen?.known ? (
                <div className="flex items-center justify-between rounded border border-border bg-inset px-3 py-2.5 text-[13px]">
                  <span className="text-body">{t('Balance due')}</span>
                  <Money
                    sar={fromHalalas(chosen.balance)}
                    className="font-semibold text-heading"
                  />
                </div>
              ) : null}
              <Field
                name="method"
                label="Method"
                kind="select"
                required
                options={PAYMENT_METHODS.map((method) => ({ value: method, label: method }))}
              />
            </>
          )}

          {!isLive ? (
            <p className="text-[11px] text-muted">
              {t('Writes need the API. Set VITE_API_URL to raise a real receipt.')}
            </p>
          ) : null}

          <FormActions>
            <Button type="button" variant="outline" size="lg" onClick={close}>
              {t('Cancel')}
            </Button>
            <SubmitButton label="Raise receipt" />
          </FormActions>
        </Form>
      )}
    </Modal>
  )
}
