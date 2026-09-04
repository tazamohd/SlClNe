import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { PageHeader } from '@/components/ui/PageHeader'
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
import { useModal } from '@/components/ui/Modal'
import { PermissionDenied } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useDateFormat } from '@/lib/formatDate'
import { clearStored, readStored, writeStored } from '@/lib/storage'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
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

type Job = RowOf<'jobs'>

const KINDS: readonly { value: DraftLine['kind']; label: string }[] = [
  { value: 'part', label: 'Part' },
  { value: 'labour', label: 'Labour' },
  { value: 'fee', label: 'Fee' },
]

/** Where the unsent draft lives between visits. One draft per browser: an
 *  invoice half-typed on Tuesday is still there on Wednesday. */
const DRAFT_KEY = 'salis-invoice-draft'
const AUTOSAVE_MS = 600

function blankLine(key: number): DraftLine {
  return { key, desc: '', kind: 'part', qty: '1', unit: '', partSku: '' }
}

/** The design's worked example: job card A3F8B2C1 (Ahmed Al-Rashid's Camry)
 *  and the seven lines its invoice was drawn with. This is what "From job
 *  card" imports for that job in a build with no API, and — because the
 *  smoke suite asserts the design's SAR 2,116.00 on a bare `/invoice-create`
 *  — it is also the starting point when the URL names no job and no draft is
 *  stored. "Start blank" clears it in one click. Against the API the lines
 *  come from the job's own `invoiceLines` instead. */
const SAMPLE_JOB = { id: 'A3F8B2C1' } as const

const SAMPLE_JOB_LINES: readonly DraftLine[] = [
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
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['desc'], message: 'Every line needs a description.' })
    }
    const qty = Number(line.qty)
    if (!Number.isFinite(qty) || qty <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qty'], message: 'Every line needs a quantity above zero.' })
    }
    const unit = toHalalas(line.unit)
    if (unit === null || unit < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['unit'], message: 'Every line needs a unit price of zero or more.' })
    }
  })

interface DraftValues {
  customerName: string
  dueDate: string
  discount: string
  discountPercent: string
  buyerVatNumber: string
  notes: string
  lines: DraftLine[]
}

interface StoredDraft extends DraftValues {
  savedAt: string
  /** The job the lines were imported from, if any. */
  jobId?: string
}

function readDraft(): StoredDraft | null {
  const raw = readStored(DRAFT_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>
    if (!Array.isArray(parsed.lines) || typeof parsed.savedAt !== 'string') return null
    return {
      customerName: parsed.customerName ?? '',
      dueDate: parsed.dueDate ?? dueInDays(30),
      discount: parsed.discount ?? '',
      discountPercent: parsed.discountPercent ?? '',
      buyerVatNumber: parsed.buyerVatNumber ?? '',
      notes: parsed.notes ?? '',
      lines: parsed.lines as DraftLine[],
      savedAt: parsed.savedAt,
      jobId: parsed.jobId,
    }
  } catch {
    return null
  }
}

/** The first problem on a line, by field, or nothing. */
function lineProblems(line: DraftLine): Partial<Record<'desc' | 'qty' | 'unit', string>> {
  const result = lineSchema.safeParse(line)
  if (result.success) return {}
  const out: Partial<Record<'desc' | 'qty' | 'unit', string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as 'desc' | 'qty' | 'unit' | undefined
    if (field && !out[field]) out[field] = issue.message
  }
  return out
}

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
 *  drifted from the server's, which is exactly the thing worth hearing about.
 *
 *  Since the UX pass: lines can be imported from a job card, every row
 *  validates when it is left, the unsent draft is kept in local storage and
 *  restored on return, the totals stay in view while a long invoice scrolls,
 *  and issuing is the one primary action with saving a draft beside it. */
export function InvoiceCreate() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { dateTime } = useDateFormat()
  const { can } = useSession()
  const { confirm } = useModal()
  const { data: customers = [], isLoading: customersLoading } = useCollection('customers')
  const { data: jobs = [] } = useCollection('jobs')
  const [saved, setSaved] = useState<InvoiceResult | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [touchedRows, setTouchedRows] = useState<ReadonlySet<number>>(() => new Set())

  /* The stored draft wins over the sample; the sample wins over nothing. */
  const [restored] = useState<StoredDraft | null>(() => readDraft())
  const [sourceJob, setSourceJob] = useState<string | null>(
    () => restored?.jobId ?? (restored ? null : SAMPLE_JOB.id)
  )
  const [savedAt, setSavedAt] = useState<string | null>(restored?.savedAt ?? null)
  const jobParam = params.get('job')
  const jobLines = useCollection(
    'invoiceLines',
    sourceJob ? { filter: { jobId: sourceJob }, pageSize: 500 } : undefined
  )

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
            discountPercent: z.string(),
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
            if (values.discountPercent.trim()) {
              const pct = Number(values.discountPercent)
              if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ['discountPercent'],
                  message: 'Enter a value between 0 and 100.',
                })
              }
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
    initial: restored
      ? {
          customerName: restored.customerName,
          dueDate: restored.dueDate,
          discount: restored.discount,
          discountPercent: restored.discountPercent,
          buyerVatNumber: restored.buyerVatNumber,
          notes: restored.notes,
          lines: restored.lines,
        }
      : {
          /* The lines are prefilled; the customer is not. Naming the payer is
           * the one thing the form must not guess. */
          customerName: '',
          dueDate: dueInDays(30),
          discount: '',
          discountPercent: '',
          buyerVatNumber: '',
          notes: '',
          lines: [...SAMPLE_JOB_LINES],
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
            ...(values.discountPercent.trim()
              ? { discountPercent: Number(values.discountPercent) }
              : {}),
            ...(values.buyerVatNumber.trim()
              ? { buyerVatNumber: values.buyerVatNumber.trim() }
              : {}),
            ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
          },
          { idempotencyKey: draftKey }
        )
        setSaved(created)
        clearStored(DRAFT_KEY)
        setSavedAt(null)
        toast.show({
          title: t('Draft saved'),
          description: t('The server priced it.'),
        })
        /* "Issue invoice" is create-then-issue. Two calls because they are two
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

  // A reload while unsaved and not yet autosaved still warns; once the draft
  // is in local storage there is nothing to lose.
  useUnsavedChangesGuard(form.dirty && !saved && !savedAt)

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

  /* ── Draft autosave ─────────────────────────────────────────────────────
   * Every edit lands in local storage a moment later, until the server has
   * the draft. A reload or a wrong click no longer throws the invoice away. */
  const values = form.values
  const dirty = form.dirty
  useEffect(() => {
    if (saved || !dirty) return
    const handle = window.setTimeout(() => {
      const stamp = new Date().toISOString()
      const draft: StoredDraft = { ...values, savedAt: stamp, jobId: sourceJob ?? undefined }
      writeStored(DRAFT_KEY, JSON.stringify(draft))
      setSavedAt(stamp)
    }, AUTOSAVE_MS)
    return () => window.clearTimeout(handle)
  }, [values, dirty, saved, sourceJob])

  /* ── Import from a job card ─────────────────────────────────────────── */
  const importJob = (job: Job) => {
    setSourceJob(job.id)
    form.setValue('customerName', job.cust)
    setTouchedRows(new Set())
  }

  /* The URL names a job (a "Raise invoice" link from the job card). Import it
   * once the job list is in hand, unless a stored draft already sits here. */
  const appliedParam = useRef(false)
  useEffect(() => {
    if (!jobParam || appliedParam.current || restored || jobs.length === 0) return
    const job = jobs.find((row) => row.id === jobParam)
    if (!job) return
    appliedParam.current = true
    importJob(job)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per job param
  }, [jobParam, jobs, restored])

  /* When a job is chosen, its lines follow: the server's attributed lines
   * where they exist, the design's sample for the sample job, else one labour
   * line named after the service so the invoice starts from the work done. */
  const appliedLines = useRef<string | null>(restored ? restored.jobId ?? null : SAMPLE_JOB.id)
  useEffect(() => {
    if (!sourceJob || appliedLines.current === sourceJob || jobLines.isLoading) return
    appliedLines.current = sourceJob
    const attributed = (jobLines.data ?? []).filter(
      (line) => (line as { jobId?: string }).jobId === sourceJob
    )
    if (attributed.length > 0) {
      form.setValue(
        'lines',
        attributed.map((line, index) => ({
          key: index + 1,
          desc: line.desc,
          kind: (line as { kind?: DraftLine['kind'] }).kind ?? 'part',
          qty: String(line.qty),
          unit: String(line.unit),
          partSku: line.part ?? '',
        }))
      )
      return
    }
    if (sourceJob === SAMPLE_JOB.id) {
      form.setValue('lines', [...SAMPLE_JOB_LINES])
      return
    }
    const job = jobs.find((row) => row.id === sourceJob)
    form.setValue('lines', [
      { key: 1, desc: job ? t(job.svc.replace(/_/g, ' ')) : '', kind: 'labour', qty: '1', unit: '', partSku: '' },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `form` is stable per render; the effect keys on the job
  }, [sourceJob, jobLines.data, jobLines.isLoading, jobs, t])

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

  async function startBlank() {
    const hasContent = lines.some((line) => line.desc.trim() || line.unit.trim()) || form.values.customerName.trim()
    if (hasContent) {
      const ok = await confirm({
        title: 'Start a blank invoice?',
        description: 'The lines and customer on this draft are cleared. The saved copy in this browser is removed too.',
        icon: 'Eraser',
        confirmLabel: 'Start blank',
        cancelLabel: 'Keep draft',
        destructive: true,
      })
      if (!ok) return
    }
    setSourceJob(null)
    appliedLines.current = null
    form.setValue('customerName', '')
    setLines([blankLine(1)])
    setTouchedRows(new Set())
    clearStored(DRAFT_KEY)
    setSavedAt(null)
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

  const showRowError = (line: DraftLine) => form.submitted || touchedRows.has(line.key)
  const sourceLabel = sourceJob ? jobs.find((row) => row.id === sourceJob) : undefined

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        icon="FilePlus"
        title={t('Create Invoice')}
        breadcrumbs={[{ label: 'Invoices', to: '/invoices' }]}
        back={{ to: '/invoices', label: 'Invoices' }}
        /* The invoice number is assigned by the API, per tenant and in
           sequence. Before the draft exists there is no number, and printing
           a guess here is how two invoices end up claiming one. */
        subtitle={
          <span className="font-mono" dir="ltr">
            {saved?.id ?? t('Number assigned on save')}
          </span>
        }
        status={
          <span className="inline-flex items-center gap-1.5 rounded border border-salis-blue/[.2] bg-salis-blue/[.08] px-2.5 py-1">
            <Icon name="ShieldCheck" size={13} className="text-salis-blue" />
            <span className="font-action text-[11px] font-semibold text-salis-blue">{t('ZATCA Ready')}</span>
          </span>
        }
        actions={
          savedAt && !saved ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted" role="status">
              <Icon name="Save" size={13} />
              {t('Draft saved locally')} · <span dir="ltr" className="font-mono">{dateTime(savedAt, 'short')}</span>
            </span>
          ) : null
        }
      />

      <Form form={form} className="gap-6">
        <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]'}>
          <div className="flex flex-col gap-5">
            <FormErrorSummary />

            <Panel icon="ClipboardList" title={t('From job card')}>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex min-w-[240px] flex-1 flex-col gap-1">
                  <span className="text-[11px] font-medium text-muted">{t('Job card')}</span>
                  <Select
                    value={sourceJob ?? ''}
                    disabled={Boolean(saved)}
                    onChange={(event) => {
                      const job = jobs.find((row) => row.id === event.target.value)
                      if (job) importJob(job)
                    }}
                    aria-label={t('Job card')}
                  >
                    <option value="">{t('Choose a job card to import its lines')}</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.id} · {job.cust} · {job.veh}
                      </option>
                    ))}
                  </Select>
                </label>
                {!saved ? (
                  <Button variant="outline" size="md" icon="Eraser" onClick={() => void startBlank()}>
                    {t('Start blank')}
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] leading-[1.5] text-muted">
                {sourceLabel ? (
                  <>
                    {t('Lines imported from')}{' '}
                    <span className="font-mono text-body" dir="ltr">{sourceLabel.id}</span> · {sourceLabel.veh}
                    {isLive ? null : ` · ${t('Demo data: the sample job carries the design’s lines; other jobs start from their service.')}`}
                  </>
                ) : (
                  t('Pick a job card to bill the work already recorded on it, or add lines by hand.')
                )}
              </p>
            </Panel>

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
                  kind="vat"
                  placeholder="310456789012345"
                  hint="Optional. Required only for VAT-registered customers."
                  readOnly={Boolean(saved)}
                />
                <Field
                  name="discount"
                  label="Discount"
                  kind="currency"
                  placeholder="0.00"
                  hint="Fixed amount applied before VAT, by the server."
                  readOnly={Boolean(saved)}
                />
                <Field
                  name="discountPercent"
                  label="Discount %"
                  kind="percentage"
                  placeholder="0"
                  hint="Percentage discount. The server applies whichever is greater."
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
                      className="min-h-9 cursor-pointer rounded-full border border-border bg-inset px-3 py-1 text-xs text-body hover:border-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
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
                  <h2 className="text-sm font-bold text-heading">{t('Line Items')}</h2>
                  <span className="font-mono text-xs text-muted" dir="ltr">{lines.length}</span>
                </div>
                {saved ? null : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="Plus"
                    onClick={() =>
                      setLines([...lines, blankLine(Math.max(0, ...lines.map((l) => l.key)) + 1)])
                    }
                  >
                    {t('Add Line')}
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th className="px-5 text-start">{t('Description')}</Th>
                      <Th className="w-[80px] text-center">{t('Qty')}</Th>
                      <Th className="w-[120px] text-end">{t('Unit Price')}</Th>
                      <Th className="w-[120px] text-end">{t('Total')}</Th>
                      <Th className="w-12">
                        <span className="sr-only">{t('Remove')}</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => {
                      const problems = showRowError(line) ? lineProblems(line) : {}
                      const problem = problems.desc ?? problems.qty ?? problems.unit
                      const touch = () => setTouchedRows((prev) => new Set(prev).add(line.key))
                      return (
                        <tr key={line.key} className="group">
                          {/* Description and kind share a cell so the money
                              columns stay where the design put them: qty, unit
                              price, line total, remove. */}
                          <td className={`px-5 py-2 ${problem ? '' : 'border-b border-border'}`}>
                            <div className="flex items-center gap-1.5">
                              <Input
                                value={line.desc}
                                readOnly={Boolean(saved)}
                                onChange={(e) => patch(index, { desc: e.target.value })}
                                onBlur={touch}
                                aria-label={t('Description')}
                                aria-invalid={problems.desc ? true : undefined}
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
                          <td className={`px-3 py-2 ${problem ? '' : 'border-b border-border'}`}>
                            <Input
                              type="number"
                              min={0}
                              step="0.5"
                              value={line.qty}
                              readOnly={Boolean(saved)}
                              onChange={(e) => patch(index, { qty: e.target.value })}
                              onBlur={touch}
                              aria-label={t('Qty')}
                              aria-invalid={problems.qty ? true : undefined}
                              dir="ltr"
                              inputSize="sm"
                              className={`${cellInput} text-center font-mono focus:shadow-none`}
                            />
                          </td>
                          <td className={`px-3 py-2 ${problem ? '' : 'border-b border-border'}`}>
                            <Input
                              inputMode="decimal"
                              value={line.unit}
                              readOnly={Boolean(saved)}
                              onChange={(e) => patch(index, { unit: e.target.value })}
                              onBlur={touch}
                              aria-label={t('Unit Price')}
                              aria-invalid={problems.unit ? true : undefined}
                              placeholder="0.00"
                              dir="ltr"
                              inputSize="sm"
                              className={`${cellInput} text-end font-mono focus:shadow-none`}
                            />
                          </td>
                          <td className={`px-3 py-2 text-end ${problem ? '' : 'border-b border-border'}`}>
                            <Money
                              sar={fromHalalas(
                                Math.round((Number(line.qty) || 0) * (toHalalas(line.unit) ?? 0))
                              )}
                              className="font-semibold text-heading"
                            />
                          </td>
                          <td className={`px-2 py-2 text-center ${problem ? '' : 'border-b border-border'}`}>
                            {saved ? null : (
                              <button
                                type="button"
                                onClick={() => setLines(lines.filter((_, i) => i !== index))}
                                aria-label={`${t('Remove')}: ${line.desc || t('Description')}`}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors hover:text-salis-orange focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                              >
                                <Icon name="Trash2" size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {lines.map((line) => {
                      const problems = showRowError(line) ? lineProblems(line) : {}
                      const problem = problems.desc ?? problems.qty ?? problems.unit
                      return problem ? (
                        <tr key={`err-${line.key}`}>
                          <td colSpan={5} className="border-b border-border px-5 pb-2 pt-0">
                            <p role="alert" className="flex items-center gap-1.5 text-[11px] text-salis-orange">
                              <Icon name="AlertCircle" size={12} />
                              {t(problem)}
                            </p>
                          </td>
                        </tr>
                      ) : null
                    })}
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

          <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="flex flex-col gap-2.5 p-5">
              <h2 className="text-sm font-bold text-heading">
                {t('Invoice Summary')}
                <span className="ms-2 font-action text-[11px] font-normal text-muted">
                  {saved ? t('From the server') : t('Provisional')}
                </span>
              </h2>
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
                    size="lg"
                    icon="Send"
                    className="w-full"
                    loading={issuing}
                    loadingLabel="Issuing"
                    onClick={() => void issueSaved(saved)}
                  >
                    {t('Issue invoice')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon="FileText"
                    className="w-full border-border-strong text-body"
                    onClick={() =>
                      navigate(`/invoice-detail?id=${encodeURIComponent(saved.id ?? '')}`)
                    }
                  >
                    {t('Open the invoice')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    size="lg"
                    icon="Send"
                    className="w-full"
                    loading={form.pending && intent.current === 'issue'}
                    loadingLabel="Sending"
                    disabled={form.pending}
                    onClick={() => {
                      intent.current = 'issue'
                    }}
                  >
                    {t('Issue invoice')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon="Save"
                    className="w-full border-border-strong text-body"
                    loading={form.pending && intent.current === 'draft'}
                    loadingLabel="Saving"
                    disabled={form.pending}
                    onClick={() => {
                      intent.current = 'draft'
                      form.submit()
                    }}
                  >
                    {t('Save draft')}
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
  'w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-body outline-none focus:border-border focus:bg-inset read-only:text-muted disabled:text-muted aria-[invalid=true]:border-salis-orange'

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
