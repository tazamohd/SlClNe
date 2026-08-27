import { useCallback, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
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
import { queryKeys } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import {
  PAYMENT_METHODS,
  newIdempotencyKey,
  recordPayment,
  writeFailureMessage,
  type PaymentMethod,
} from './api'
import { fromHalalas, invoiceMoney, toHalalas } from './money'

/** The row this dialog can be opened over: anything carrying an invoice
 *  reference and the server's money columns. */
export interface PayableInvoice {
  id: string
  cust: string
  status: string
  _id?: string
  subtotalHalalas?: number
  taxHalalas?: number
  discountHalalas?: number
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
  amount?: string
}

/** One user's attempt at one payment, and the key that makes it safe to retry.
 *
 *  The key is minted per *attempt*, not per request: every retry of the same
 *  amount — a double-click, a reload, a resend after a timeout — carries the
 *  key the first attempt used, and the server returns the payment it already
 *  took instead of taking a second one. Change the amount and it is a different
 *  payment, so it gets a different key; reusing the old one there is the case
 *  the API answers with a 409, and rightly.
 *
 *  Exported for `app/tests/finance-payment.test.tsx`, which is where "the
 *  client actually uses idempotency" stops being a claim. */
export function useIdempotentAttempt(): (signature: string) => string {
  const attempt = useRef<{ signature: string; key: string } | null>(null)
  return useCallback((signature: string) => {
    if (attempt.current?.signature === signature) return attempt.current.key
    const key = newIdempotencyKey('pay')
    attempt.current = { signature, key }
    return key
  }, [])
}

/** Why this invoice cannot take a payment, or null when it can.
 *
 *  The server decides — these are the same rules from
 *  `packages/contract/src/rules/money.ts`, restated in front of the user so a
 *  refusal arrives before they type an amount rather than after they submit
 *  one. Enforcement is still the API's; this is the courtesy. */
export function paymentBlockedReason(invoice: PayableInvoice): string | null {
  if (invoice.status === 'cancelled') return 'A cancelled invoice cannot take a payment.'
  if (invoice.status === 'draft') return 'An invoice must be issued before it can take a payment.'
  const money = invoiceMoney(invoice)
  if (money.fromServer && money.balanceHalalas <= 0) return 'This invoice is settled in full.'
  return null
}

export function RecordPaymentModal({
  invoice,
  open,
  onClose,
}: {
  invoice: PayableInvoice
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const client = useQueryClient()
  const keyFor = useIdempotentAttempt()
  const [settled, setSettled] = useState<{ amountHalalas: number; balanceHalalas: number } | null>(
    null
  )

  const money = invoiceMoney(invoice)
  const blocked = paymentBlockedReason(invoice)
  const reference = invoice._id ?? invoice.id

  /** The balance is the server's figure. A fixture build has no balance column
   *  at all, so the ceiling check is skipped rather than guessed — the API
   *  applies it regardless, and inventing one here would refuse payments the
   *  server would have accepted. */
  const schema = useMemo(
    () =>
      z
        .object({
          amount: z.string(),
          method: z.string(),
          reference: z.string(),
          paidOn: z.string(),
          note: z.string(),
        })
        .superRefine((values, ctx) => {
          const halalas = toHalalas(values.amount)
          if (halalas === null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['amount'],
              message: 'Enter the amount received.',
            })
            return
          }
          if (halalas <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['amount'],
              message: 'A payment must be greater than zero.',
            })
          }
          if (money.fromServer && halalas > money.balanceHalalas) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['amount'],
              message: 'A payment cannot exceed the outstanding balance.',
            })
          }
          if (!values.method) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['method'],
              message: 'Choose how the payment was made.',
            })
          }
        })
        .transform((values) => ({
          amountHalalas: toHalalas(values.amount) ?? 0,
          method: values.method as PaymentMethod,
          reference: values.reference.trim(),
          paidOn: values.paidOn,
          note: values.note.trim(),
        })),
    [money.fromServer, money.balanceHalalas]
  )

  const form = useZodForm({
    schema,
    initial: {
      amount:
        money.fromServer && money.balanceHalalas > 0
          ? fromHalalas(money.balanceHalalas).toFixed(2)
          : '',
      method: 'Mada',
      reference: '',
      paidOn: new Date().toISOString().slice(0, 10),
      note: '',
    },
    async onSubmit(values) {
      /* The signature is the payment, not the click. Two clicks of the same
       * amount are one attempt and carry one key. */
      const signature = [
        reference,
        values.amountHalalas,
        values.method,
        values.reference,
        values.paidOn,
      ].join('|')

      try {
        const result = await recordPayment(
          reference,
          {
            amountHalalas: values.amountHalalas,
            method: values.method,
            ...(values.reference ? { reference: values.reference } : {}),
            ...(values.paidOn ? { paidOn: values.paidOn } : {}),
            ...(values.note ? { note: values.note } : {}),
          },
          keyFor(signature)
        )

        /* The remaining balance shown next is the server's, taken from the
         * invoice it returned — not this page's arithmetic. */
        const after = result.invoice
        setSettled({
          amountHalalas: values.amountHalalas,
          balanceHalalas:
            typeof after?.balanceHalalas === 'number'
              ? after.balanceHalalas
              : typeof after?.totalHalalas === 'number' && typeof after?.paidHalalas === 'number'
                ? after.totalHalalas - after.paidHalalas
                : money.balanceHalalas - values.amountHalalas,
        })

        for (const key of ['invoices', 'invoicePayments', 'receipts'] as const) {
          void client.invalidateQueries({ queryKey: queryKeys.all(key) })
        }
        toast.show({
          title: t('Payment recorded'),
          description: t('The receipt has been raised against this invoice.'),
        })
      } catch (error) {
        const message = writeFailureMessage(error, 'The payment could not be recorded.')
        /* A rule the server names a field for belongs on that field. Anything
         * else is a form-level failure — never a success toast. */
        const field = (error as { field?: string } | null)?.field
        throw new ServerValidationError(
          field === 'amountHalalas' ? { amount: message } : {},
          message
        )
      }
    },
  })

  function close() {
    setSettled(null)
    form.reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={settled ? 'Payment recorded' : 'Record payment'}
      variant="capture"
      icon={settled ? 'CircleCheck' : 'CreditCard'}
      description={
        settled ? undefined : `${invoice.id} · ${invoice.cust}`
      }
      footer={
        settled ? (
          <Button size="lg" onClick={close}>
            {t('Done')}
          </Button>
        ) : blocked ? (
          <Button variant="outline" size="lg" onClick={close}>
            {t('Close')}
          </Button>
        ) : undefined
      }
    >
      {settled ? (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-body">
            {t('Recorded against')}{' '}
            <span dir="ltr" className="font-mono text-heading">
              {invoice.id}
            </span>
            .
          </p>
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-body">{t('Amount received')}</span>
            <Money sar={fromHalalas(settled.amountHalalas)} className="font-semibold text-heading" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-body">{t('Balance due')}</span>
            <Money
              sar={fromHalalas(settled.balanceHalalas)}
              className={
                settled.balanceHalalas > 0
                  ? 'font-bold text-salis-orange'
                  : 'font-bold text-salis-blue'
              }
            />
          </div>
          <p className="text-[11px] text-muted">
            {t('Balance as the server reports it after this payment.')}
          </p>
        </div>
      ) : blocked ? (
        <p role="alert" className="flex items-start gap-2.5 text-[13px] text-body">
          <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
          {t(blocked)}
        </p>
      ) : (
        <Form form={form}>
          <FormErrorSummary />

          {money.fromServer ? (
            <div className="flex items-center justify-between rounded border border-border bg-inset px-3 py-2.5 text-[13px]">
              <span className="text-body">{t('Balance due')}</span>
              <Money
                sar={fromHalalas(money.balanceHalalas)}
                className="font-semibold text-heading"
              />
            </div>
          ) : (
            <p className="rounded border border-border bg-inset px-3 py-2.5 text-[13px] text-muted">
              {t('This build has no API configured, so the outstanding balance is unknown.')}
            </p>
          )}

          <Field
            name="amount"
            label="Amount received"
            kind="currency"
            required
            placeholder="0.00"
            hint="The amount the customer handed over, not the invoice total."
          />
          <Field
            name="method"
            label="Method"
            kind="select"
            required
            placeholder={t('Select a method')}
            options={PAYMENT_METHODS.map((method) => ({ value: method, label: method }))}
          />
          <Field name="reference" label="Reference" placeholder={t('TXN-884201')} />
          <Field name="paidOn" label="Received on" kind="date" />
          <Field name="note" label="Note" kind="textarea" rows={2} />

          {!isLive ? (
            <p className="text-[11px] text-muted">
              {t('Writes need the API. Set VITE_API_URL to record a real payment.')}
            </p>
          ) : null}

          <FormActions>
            <Button type="button" variant="outline" size="lg" onClick={close}>
              {t('Cancel')}
            </Button>
            <SubmitButton label="Record payment" />
          </FormActions>
        </Form>
      )}
    </Modal>
  )
}
