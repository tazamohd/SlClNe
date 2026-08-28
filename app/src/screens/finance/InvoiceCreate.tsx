import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Money, SummaryRow } from '@/components/ui/Money'
import { Panel } from '@/components/ui/FieldGrid'
import {
  Field,
  Form,
  FormErrorSummary,
  ServerValidationError,
  useUnsavedChangesGuard,
  useZodForm,
} from '@/components/ui/Form'
import { PermissionDenied } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { isLive } from '@/data/repository'
import {
  createInvoice,
  issueInvoice,
  newIdempotencyKey,
  writeFailureMessage,
  type InvoiceLineInput,
  type InvoiceResult,
} from './api'
import { computeInvoiceTotals, fromHalalas, toHalalas } from './money'

/** A line as the editor holds it: money as the user typed it, converted to
 *  halalas only at the boundary. */
interface DraftLine {
  key: number
  desc: string
  kind: InvoiceLineInput['kind']
  qty: string
  unit: string
  partSku: string
}

const KINDS: readonly { value: DraftLine['kind']; label: string }[] = [
  { value: 'part', label: 'Part' },
  { value: 'labour', label: 'Labour' },
  { value: 'fee', label: 'Fee' },
]

function blankLine(key: number): DraftLine {
  return { key, desc: '', kind: 'part', qty: '1', unit: '', partSku: '' }
}

/** The line items the design shows, as a starting point rather than as the
 *  invoice. Every one of them is editable and removable. */
const INITIAL_LINES: DraftLine[] = [
  { key: 1, desc: 'Brake Pads (Front) — Repair', kind: 'part', qty: '1', unit: '310', partSku: '' },
  { key: 2, desc: 'Oil Filter (Toyota) — Maintenance', kind: 'part', qty: '2', unit: '45', partSku: '' },
  { key: 3, desc: 'Air Filter (Universal)', kind: 'part', qty: '1', unit: '95', partSku: '' },
  { key: 4, desc: 'Diagnostics — 1.5h', kind: 'labour', qty: '1', unit: '225', partSku: '' },
  { key: 5, desc: 'Brake Repair — 2h Labor', kind: 'labour', qty: '1', unit: '360', partSku: '' },
  { key: 6, desc: 'Multi-Point Inspection', kind: 'labour', qty: '1', unit: '170', partSku: '' },
  { key: 7, desc: 'Maintenance — Oil Change', kind: 'labour', qty: '1', unit: '590', partSku: '' },
]

const lineSchema = z
  .object({
    key: z.number(),
    desc: z.string(),
    kind: z.enum(['part', 'labour', 'fee']),
    qty: z.string(),
    unit: z.string(),
    partSku: z.string(),
  })
  .superRefine((line, ctx) => {
    if (!line.desc.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a description.' })
    }
    const qty = Number(line.qty)
    if (!Number.isFinite(qty) || qty <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a quantity above zero.' })
    }
    const unit = toHalalas(line.unit)
    if (unit === null || unit < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a unit price of zero or more.' })
    }
  })

/** Raise a ZATCA tax invoice.
 *
 *  The design's "Add Line" button was decorative and its totals were fixed
 *  strings. Here the lines are real, the draft is created by the API, and —
 *  this is the part that matters — **the invoice's totals are the server's**.
 *
 *  While the draft is being composed there is no invoice yet, so the summary
 *  shows a provisional figure computed from the same rule the server applies,
 *  labelled as provisional. The moment the draft is saved that panel is
 *  replaced by the subtotal, VAT and total the API returned. If the two
 *  disagree the screen says so rather than picking the friendlier one — a
 *  difference there means the client's transcription of the VAT rule has
 *  drifted from the server's, which is exactly the thing worth hearing about. */
export function InvoiceCreate() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const { can } = useSession()
  const { data: customers = [], isLoading: customersLoading } = useCollection('customers')
  const [saved, setSaved] = useState<InvoiceResult | null>(null)
  const [issuing, setIssuing] = useState(false)

  /* One key per draft, so a double-clicked "Save Draft" — or a retry after a
   * timeout — returns the invoice already created instead of raising a second
   * one with the same lines. */
  const [draftKey] = useState(() => newIdempotencyKey('inv'))

  /** Which button started this submit. `useZodForm.submit` carries no payload,
   *  and both buttons validate the same form, so the intent rides beside it. */
  const intent = useRef<'draft' | 'issue'>('draft')

  const form = useZodForm({
    schema: useMemo(
      () =>
        z
          .object({
            customerName: z.string().trim().min(1, 'Name the customer this invoice bills.'),
            dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Give a due date.'),
            discount: z.string(),
            buyerVatNumber: z.string(),
            notes: z.string(),
            lines: z.array(lineSchema).min(1, 'Add at least one line item before sending.'),
          })
          .superRefine((values, ctx) => {
            if (values.discount.trim() && toHalalas(values.discount) === null) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['discount'],
                message: 'That is not an amount.',
              })
            }
            if (values.buyerVatNumber.trim() && !/^3\d{13}3$/.test(values.buyerVatNumber.trim())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['buyerVatNumber'],
                message: 'A Saudi VAT number is 15 digits, starting and ending with 3.',
              })
            }
          }),
      []
    ),
    initial: {
      customerName: '',
      dueDate: dueInDays(30),
      discount: '',
      buyerVatNumber: '',
      notes: '',
      lines: INITIAL_LINES,
    },
    async onSubmit(values) {
      try {
        const created = await createInvoice(
          {
            customerName: values.customerName.trim(),
            ...customerIdFor(customers, values.customerName),
            dueDate: values.dueDate,
            lines: values.lines.map(toLineInput),
            ...(values.discount.trim()
              ? { discountHalalas: Math.max(0, toHalalas(values.discount) ?? 0) }
              : {}),
            ...(values.buyerVatNumber.trim()
              ? { buyerVatNumber: values.buyerVatNumber.trim() }
              : {}),
            ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
          },
          { idempotencyKey: draftKey }
        )
        setSaved(created)
        toast.show({
          title: t('Draft saved'),
          description: t('The server priced it.'),
        })
        /* "Send Invoice" is create-then-issue. Two calls because they are two
         * decisions server-side — pricing and committing — and the second can
         * be refused on its own (the approval ceiling). A refusal there leaves
         * a real saved draft, which the screen then offers to issue again. */
        if (intent.current === 'issue') await issueSaved(created)
      } catch (error) {
        const message = writeFailureMessage(error, 'The invoice could not be saved.')
        const field = (error as { field?: string } | null)?.field
        throw new ServerValidationError(
          field && field in values ? { [field]: message } : {},
          message
        )
      }
    },
  })

  const { confirmDiscard } = useUnsavedChangesGuard(form.dirty && !saved)

  const lines = form.values.lines
  const provisional = useMemo(
    () =>
      computeInvoiceTotals(
        lines.map((line) => ({
          qty: Number(line.qty) || 0,
          unitPriceHalalas: toHalalas(line.unit) ?? 0,
        })),
        Math.max(0, toHalalas(form.values.discount) ?? 0)
      ),
    [lines, form.values.discount]
  )

  if (!can('invoices', 'c')) {
    return (
      <PermissionDenied
        description={t('Your role can view invoices but not raise them.')}
        action={
          <Link to="/invoices" className="font-action text-[13px] font-medium">
            {t('Invoices')}
          </Link>
        }
      />
    )
  }

  function setLines(next: DraftLine[]) {
    form.setValue('lines', next)
  }

  async function leave(to: string) {
    if (await confirmDiscard()) navigate(to)
  }

  async function issueSaved(invoice: InvoiceResult) {
    setIssuing(true)
    try {
      const issued = await issueInvoice(invoice._id ?? invoice.id ?? '')
      setSaved(issued)
      toast.show({
        title: t('Invoice issued'),
        description: t('It is now open for payment and can no longer be edited.'),
      })
      navigate(`/invoice-detail?id=${encodeURIComponent(issued.id ?? invoice.id ?? '')}`)
    } catch (error) {
      /* The draft exists and is priced; only the commit was refused. Saying so
       * is the difference between "nothing happened" and "it is saved but not
       * sent" — and the user has to know which. */
      toast.show({
        title: t('Saved, not issued'),
        description: t(writeFailureMessage(error, 'The invoice could not be issued.')),
        error: true,
      })
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => void leave('/invoices')}
          className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-action text-[13px] text-muted focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Invoices')}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="FilePlus" size={isMobile ? 20 : 28} />
            </div>
          </div>
          <div>
            <h1 className={isMobile ? 'font-display text-xl font-black text-heading' : 'font-display text-[26px] font-black text-heading'}>
              {t('Create Invoice')}
            </h1>
            {/* The invoice number is assigned by the API, per tenant and in
                sequence. Before the draft exists there is no number, and
                printing a guess here is how two invoices end up claiming one. */}
            <p className="mt-0.5 font-mono text-sm text-muted" dir="ltr">
              {saved?.id ?? t('Number assigned on save')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-[rgba(10,94,215,.2)] bg-[rgba(10,94,215,.08)] px-3 py-1.5">
          <Icon name="ShieldCheck" size={14} className="text-salis-blue" />
          <span className="font-action text-xs font-semibold text-salis-blue">
            {t('ZATCA Ready')}
          </span>
        </div>
      </div>

      <Form form={form} className="gap-6">
        <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]'}>
          <div className="flex flex-col gap-5">
            <FormErrorSummary />

            <Panel icon="User" title={t('Bill To')}>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field
                  name="customerName"
                  label="Customer"
                  required
                  placeholder={t('Ahmed Al-Rashid')}
                  readOnly={Boolean(saved)}
                />
                <Field
                  name="dueDate"
                  label="Due date"
                  kind="date"
                  required
                  readOnly={Boolean(saved)}
                />
                <Field
                  name="buyerVatNumber"
                  label="VAT registration"
                  placeholder="310456789012345"
                  hint="Optional. Required only for VAT-registered customers."
                  readOnly={Boolean(saved)}
                />
                <Field
                  name="discount"
                  label="Discount"
                  kind="currency"
                  placeholder="0.00"
                  hint="Applied before VAT, by the server."
                  readOnly={Boolean(saved)}
                />
              </div>
              {customersLoading && !saved ? (
                <p className="mt-3 text-xs text-muted">{t('Loading customers...')}</p>
              ) : customers.length > 0 && !saved ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {customers.slice(0, 6).map((customer) => (
                    <button
                      key={customer.name}
                      type="button"
                      onClick={() => form.setValue('customerName', customer.name)}
                      className="cursor-pointer rounded-full border border-border bg-inset px-2.5 py-1 text-xs text-body hover:border-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                    >
                      {customer.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </Panel>

            <Card>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Icon name="List" size={16} className="text-salis-blue" />
                  <h3 className="text-sm font-bold text-heading">{t('Line Items')}</h3>
                </div>
                {saved ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLines([...lines, blankLine(Math.max(0, ...lines.map((l) => l.key)) + 1)])
                    }
                  >
                    <Icon name="Plus" size={12} />
                    {t('Add Line')}
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th className="px-5 text-start">{t('Description')}</Th>
                      <Th className="w-[70px] text-center">{t('Qty')}</Th>
                      <Th className="w-[110px] text-end">{t('Unit Price')}</Th>
                      <Th className="w-[110px] text-end">{t('Total')}</Th>
                      <Th className="w-10">
                        <span className="sr-only">{t('Remove')}</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={line.key}>
                        {/* Description and kind share a cell so the money
                            columns stay where the design put them: qty, unit
                            price, line total, remove. */}
                        <td className="border-b border-border px-5 py-2">
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={line.desc}
                              readOnly={Boolean(saved)}
                              onChange={(e) => patch(index, { desc: e.target.value })}
                              aria-label={t('Description')}
                              placeholder={t('Description')}
                              inputSize="sm"
                              className={`${cellInput} focus:shadow-none`}
                            />
                            <Select
                              value={line.kind}
                              disabled={Boolean(saved)}
                              onChange={(e) =>
                                patch(index, { kind: e.target.value as DraftLine['kind'] })
                              }
                              aria-label={t('Kind')}
                              className={`${cellInput} w-[104px] flex-shrink-0`}
                            >
                              {KINDS.map((kind) => (
                                <option key={kind.value} value={kind.value}>
                                  {t(kind.label)}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </td>
                        <td className="border-b border-border px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.5"
                            value={line.qty}
                            readOnly={Boolean(saved)}
                            onChange={(e) => patch(index, { qty: e.target.value })}
                            aria-label={t('Qty')}
                            dir="ltr"
                            inputSize="sm"
                            className={`${cellInput} text-center font-mono focus:shadow-none`}
                          />
                        </td>
                        <td className="border-b border-border px-3 py-2">
                          <Input
                            inputMode="decimal"
                            value={line.unit}
                            readOnly={Boolean(saved)}
                            onChange={(e) => patch(index, { unit: e.target.value })}
                            aria-label={t('Unit Price')}
                            placeholder="0.00"
                            dir="ltr"
                            inputSize="sm"
                            className={`${cellInput} text-end font-mono focus:shadow-none`}
                          />
                        </td>
                        <td className="border-b border-border px-3 py-2 text-end">
                          <Money
                            sar={fromHalalas(
                              Math.round((Number(line.qty) || 0) * (toHalalas(line.unit) ?? 0))
                            )}
                            className="font-semibold text-heading"
                          />
                        </td>
                        <td className="border-b border-border px-2 py-2 text-center">
                          {saved ? null : (
                            <button
                              type="button"
                              onClick={() => setLines(lines.filter((_, i) => i !== index))}
                              aria-label={`${t('Remove')}: ${line.desc || t('Description')}`}
                              className="flex cursor-pointer items-center justify-center rounded border-none bg-transparent p-1 text-muted transition-colors hover:text-salis-orange focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {form.errors.lines && (form.submitted || form.touched.lines) ? (
                <p
                  role="alert"
                  className="border-t border-border px-5 py-2.5 text-[13px] text-salis-orange"
                >
                  {t(form.errors.lines)}
                </p>
              ) : null}
            </Card>

            <Field
              name="notes"
              label="Notes"
              kind="textarea"
              rows={2}
              placeholder={t('Payment instructions, warranty terms...')}
              readOnly={Boolean(saved)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2.5 p-5">
              <h3 className="text-sm font-bold text-heading">
                {t('Invoice Summary')}
                <span className="ms-2 font-action text-[11px] font-normal text-muted">
                  {saved ? t('From the server') : t('Provisional')}
                </span>
              </h3>
              <SummaryRow
                label={t('Subtotal')}
                halalas={saved?.subtotalHalalas ?? provisional.subtotalHalalas}
              />
              {(saved?.discountHalalas ?? provisional.discountHalalas) > 0 ? (
                <SummaryRow
                  label={t('Discount')}
                  halalas={-(saved?.discountHalalas ?? provisional.discountHalalas)}
                />
              ) : null}
              <SummaryRow
                label={t('VAT (15%)')}
                halalas={saved?.taxHalalas ?? provisional.taxHalalas}
              />
              <div className="flex justify-between border-t border-border pt-2.5 text-xl font-extrabold text-heading">
                <span>{t('Total')}</span>
                <Money
                  sar={fromHalalas(saved?.totalHalalas ?? provisional.totalHalalas)}
                  className="font-extrabold"
                />
              </div>
              <p className="text-[11px] leading-[1.5] text-muted">
                {saved
                  ? t('Priced by the server from the lines above, at the ZATCA rate.')
                  : t('A preview. The server prices the invoice when the draft is saved.')}
              </p>
              {saved && drift(saved, provisional) ? (
                <p className="text-[11px] leading-[1.5] text-salis-orange">
                  {t(
                    'The preview and the server disagree about this invoice. The server’s figures are shown; the difference is a defect worth reporting.'
                  )}
                </p>
              ) : null}
            </Card>

            <div className="flex flex-col gap-2.5">
              {saved ? (
                <>
                  <Button
                    type="button"
                    className="h-11 w-full"
                    disabled={issuing}
                    onClick={() => void issueSaved(saved)}
                  >
                    <Icon name="Send" size={14} />
                    {issuing ? t('Issuing...') : t('Issue Invoice')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full border-border-strong text-body"
                    onClick={() =>
                      navigate(`/invoice-detail?id=${encodeURIComponent(saved.id ?? '')}`)
                    }
                  >
                    <Icon name="FileText" size={14} />
                    {t('Open the invoice')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full border-border-strong text-body"
                    disabled={form.pending}
                    onClick={() => {
                      intent.current = 'draft'
                      form.submit()
                    }}
                  >
                    <Icon name="Save" size={14} />
                    {form.pending && intent.current === 'draft'
                      ? t('Saving...')
                      : t('Save Draft')}
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={form.pending}
                    onClick={() => {
                      intent.current = 'issue'
                    }}
                  >
                    <Icon name="Send" size={14} />
                    {form.pending && intent.current === 'issue'
                      ? t('Sending...')
                      : t('Send Invoice')}
                  </Button>
                </>
              )}
              {!isLive ? (
                <p className="text-[11px] leading-[1.5] text-muted">
                  {t(
                    'This build has no API configured, so an invoice cannot be raised. Set VITE_API_URL to save a draft.'
                  )}
                </p>
              ) : null}
            </div>

            <Card className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={14} className="text-salis-blue" />
                <p className="font-action text-xs font-bold text-heading">{t('Tax Invoice')}</p>
              </div>
              <p className="text-[11px] leading-[1.5] text-muted">
                {t('ZATCA-compliant e-invoice. Scan the QR to verify with the tax authority.')}
              </p>
              <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted">{t('Seller')}</span>
                  <span className="text-body">SALIS AUTO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t('VAT Registration')}</span>
                  <span className="font-mono text-body" dir="ltr">
                    300123456700003
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  )

  function patch(index: number, change: Partial<DraftLine>) {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...change } : line)))
  }
}

const cellInput =
  'w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-body outline-none focus:border-border focus:bg-inset read-only:text-muted disabled:text-muted'

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`border-b border-border px-3 py-2.5 font-action text-[11px] font-semibold uppercase tracking-[.03em] text-muted ${className}`}
    >
      {children}
    </th>
  )
}


function toLineInput(line: DraftLine): InvoiceLineInput {
  return {
    description: line.desc.trim(),
    kind: line.kind,
    qty: Number(line.qty),
    unitPriceHalalas: Math.max(0, toHalalas(line.unit) ?? 0),
    ...(line.partSku.trim() ? { partSku: line.partSku.trim() } : {}),
  }
}

/** ISO date `days` from today, for the default payment term. */
function dueInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/** The customer's server id, when the register knows one. Without it the API
 *  still takes the name — an invoice to a walk-in is a real invoice. */
function customerIdFor(
  customers: readonly { name: string; _id?: string }[],
  name: string
): { customerId?: string } {
  const match = customers.find((customer) => customer.name === name.trim())
  return match?._id ? { customerId: match._id } : {}
}

/** True when the server's pricing differs from the preview's. */
function drift(
  saved: InvoiceResult,
  provisional: { subtotalHalalas: number; taxHalalas: number; totalHalalas: number }
): boolean {
  return (
    typeof saved.totalHalalas === 'number' &&
    (saved.subtotalHalalas !== provisional.subtotalHalalas ||
      saved.taxHalalas !== provisional.taxHalalas ||
      saved.totalHalalas !== provisional.totalHalalas)
  )
}
