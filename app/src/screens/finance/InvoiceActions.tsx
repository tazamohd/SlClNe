import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { queryKeys } from '@/data/useCollection'
import type { Action } from '@/data/types'
import { cancelInvoice, issueInvoice, writeFailureMessage } from './api'
import { fromHalalas, invoiceMoney } from './money'
import type { PayableInvoice } from './RecordPaymentModal'
import { paymentBlockedReason } from './RecordPaymentModal'

/** The lifecycle actions on an invoice: issue it, cancel it, take money for it.
 *
 *  `Invoices.dc.html` draws a row of buttons per invoice and wires none of
 *  them — three of the twenty-three dead CTAs. Each one here calls the API and
 *  reports what the API said; none of them changes anything locally and hopes.
 */
export function useInvoiceLifecycle() {
  const { t } = usePreferences()
  const toast = useToast()
  const modal = useModal()
  const client = useQueryClient()
  const { canApprove } = useSession()
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = useCallback(() => {
    for (const key of ['invoices', 'invoiceLines', 'invoicePayments', 'receipts'] as const) {
      void client.invalidateQueries({ queryKey: queryKeys.all(key) })
    }
  }, [client])

  const issue = useCallback(
    async (invoice: PayableInvoice): Promise<boolean> => {
      const money = invoiceMoney(invoice)
      const totalSar = fromHalalas(money.totalHalalas)
      /* The ceiling is enforced by the API — `POST /invoices/:id/issue` calls
       * `requireApproval` before it commits anything. Saying so up front is
       * courtesy, not a check: the attempt is still made, and the server's
       * answer is what the user is told. */
      const overCeiling = money.totalHalalas > 0 && !canApprove(totalSar)

      const confirmed = await modal.confirm({
        title: 'Issue this invoice?',
        description: overCeiling
          ? 'Issuing commits the amount to the customer and the invoice becomes immutable. This total is above your approval ceiling, so the server will refuse it — it has to be issued by someone whose ceiling covers it.'
          : 'Issuing commits the amount to the customer. The invoice becomes immutable and a ZATCA hash is assigned to it.',
        icon: 'Send',
        confirmLabel: 'Issue invoice',
        variant: 'lifecycle',
      })
      if (!confirmed) return false

      setBusy(invoice.id)
      try {
        await issueInvoice(invoice._id ?? invoice.id)
        refresh()
        toast.show({
          title: t('Invoice issued'),
          description: t('It is now open for payment and can no longer be edited.'),
        })
        return true
      } catch (error) {
        toast.show({
          title: t('Not issued'),
          description: t(writeFailureMessage(error, 'The invoice could not be issued.')),
          error: true,
        })
        return false
      } finally {
        setBusy(null)
      }
    },
    [canApprove, modal, refresh, t, toast]
  )

  const cancel = useCallback(
    async (invoice: PayableInvoice): Promise<boolean> => {
      const confirmed = await modal.confirm({
        title: 'Cancel this invoice?',
        description:
          'A cancelled invoice can no longer take a payment. Money already received against it stays recorded and has to be refunded separately.',
        icon: 'CircleX',
        confirmLabel: 'Cancel invoice',
        cancelLabel: 'Keep it',
        destructive: true,
        variant: 'lifecycle',
      })
      if (!confirmed) return false

      setBusy(invoice.id)
      try {
        await cancelInvoice(invoice._id ?? invoice.id)
        refresh()
        toast.show({ title: t('Invoice cancelled') })
        return true
      } catch (error) {
        toast.show({
          title: t('Not cancelled'),
          description: t(writeFailureMessage(error, 'The invoice could not be cancelled.')),
          error: true,
        })
        return false
      } finally {
        setBusy(null)
      }
    },
    [modal, refresh, t, toast]
  )

  return { issue, cancel, busy }
}

/** Which actions this role and this invoice's status allow.
 *
 *  Status first, permission second, and both are advisory — the API re-checks
 *  every one of them. What this decides is whether a button appears, not
 *  whether the action is permitted. */
export function invoiceActionsFor(
  invoice: PayableInvoice,
  can: (module: string, action: Action) => boolean
): { pay: boolean; issue: boolean; cancel: boolean } {
  const draft = invoice.status === 'draft'
  const closed = invoice.status === 'cancelled'
  return {
    pay: can('payments', 'c') && paymentBlockedReason(invoice) === null,
    issue: can('invoices', 'e') && draft,
    cancel: can('invoices', 'e') && !closed,
  }
}

export function InvoiceRowActions({
  invoice,
  onRecordPayment,
  /** Compact icon buttons for a table row; labelled buttons on a mobile card. */
  labelled,
}: {
  invoice: PayableInvoice
  onRecordPayment: (invoice: PayableInvoice) => void
  labelled?: boolean
}) {
  const { t } = usePreferences()
  const { can } = useSession()
  const { issue, cancel, busy } = useInvoiceLifecycle()
  const allowed = invoiceActionsFor(invoice, can)
  const pending = busy === invoice.id

  if (!allowed.pay && !allowed.issue && !allowed.cancel) {
    return <span className="text-[11px] text-muted">{t('No actions')}</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allowed.pay ? (
        <Action
          icon="CreditCard"
          label="Record payment"
          labelled={labelled}
          disabled={pending}
          onClick={() => onRecordPayment(invoice)}
        />
      ) : null}
      {allowed.issue ? (
        <Action
          icon="Send"
          label="Issue"
          labelled={labelled}
          disabled={pending}
          onClick={() => void issue(invoice)}
        />
      ) : null}
      {allowed.cancel ? (
        <Action
          icon="CircleX"
          label="Cancel invoice"
          labelled={labelled}
          disabled={pending}
          onClick={() => void cancel(invoice)}
        />
      ) : null}
    </div>
  )
}

function Action({
  icon,
  label,
  labelled,
  disabled,
  onClick,
}: {
  icon: string
  label: string
  labelled?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const { t } = usePreferences()
  return (
    <Button
      variant="subtle"
      size="sm"
      disabled={disabled}
      aria-label={t(label)}
      title={t(label)}
      onClick={(event) => {
        // These sit inside a clickable row; the row must not also navigate.
        event.stopPropagation()
        onClick()
      }}
    >
      <Icon name={icon} size={14} />
      {labelled ? t(label) : null}
    </Button>
  )
}
