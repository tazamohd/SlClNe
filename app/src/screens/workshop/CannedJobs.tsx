import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import {
  Field,
  Form,
  FormErrorSummary,
  ServerValidationError,
  useZodForm,
} from '@/components/ui/Form'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { queryKeys, useCollection, type RowOf } from '@/data/useCollection'
import { isLive, RepositoryError } from '@/data/repository'
import { createCannedJob, fetchCannedJobLines, updateCannedJob } from './canned-job-api'

type CannedJob = RowOf<'cannedJobs'>

interface DraftLine {
  key: number
  desc: string
  kind: 'part' | 'labour'
  qty: string
  unit: string
}

const KINDS: readonly { value: DraftLine['kind']; label: string }[] = [
  { value: 'part', label: 'Part' },
  { value: 'labour', label: 'Labour' },
]

function blankLine(key: number): DraftLine {
  return { key, desc: '', kind: 'part', qty: '1', unit: '' }
}

/** SAR string → halalas, same rounding rule every money field in this app
 *  applies at the boundary. */
function toHalalas(value: string): number | null {
  const digits = value.replace(/[^\d.]/g, '')
  if (!digits) return null
  const parsed = Number.parseFloat(digits)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.round(parsed * 100)
}

const lineSchema = z
  .object({ key: z.number(), desc: z.string(), kind: z.enum(['part', 'labour']), qty: z.string(), unit: z.string() })
  .superRefine((line, ctx) => {
    if (!line.desc.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a description.' })
    }
    const qty = Number(line.qty)
    if (!Number.isFinite(qty) || qty <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a quantity above zero.' })
    }
    const unit = toHalalas(line.unit)
    if (unit === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Every line needs a unit price of zero or more.' })
    }
  })

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name the package.'),
  nameAr: z.string(),
  category: z.string(),
  description: z.string(),
  lines: z.array(lineSchema).min(1, 'Add at least one line before saving.'),
})

function linesFromJob(job: CannedJob | null): DraftLine[] {
  return job ? [] : [blankLine(1)]
}

/** Canned Jobs — predefined, priced service packages (build-order item 5).
 *
 *  An estimate is priced line by line, with no way to reuse a standard
 *  bundle — the same "Standard Oil Change" used to get retyped from scratch
 *  on every visit, at whatever price the advisor remembered. This screen is
 *  the catalog: create or retire a named package, price it from its own
 *  lines the same way `POST /estimates` prices an estimate (never a client-
 *  sent total — `server/src/routes/canned-jobs.ts`). Applying one to a real
 *  estimate happens from `WorkshopEstimate.tsx`, which copies these lines
 *  into the estimate's own `PATCH` rather than referencing this row live —
 *  so a later catalog price change never moves an estimate someone already
 *  priced from it. */
export function CannedJobs() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const client = useQueryClient()
  const invalidate = () => void client.invalidateQueries({ queryKey: queryKeys.all('cannedJobs') })
  const jobs = useCollection('cannedJobs', { pageSize: 200, sort: 'name:asc' })
  const rows = (jobs.data ?? []) as readonly CannedJob[]

  const [editing, setEditing] = useState<CannedJob | null | 'new'>(null)
  const mayWrite = can('estimates', 'c') && isLive

  if (jobs.isLoading) return <Loading label={t('Loading canned jobs...')} />
  if (jobs.isError) {
    return <ErrorState title={t("Couldn't load this")} description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
  }

  return (
    <div className="flex max-w-[1100px] flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          icon="PackagePlus"
          title={t('Canned Jobs')}
          subtitle={t('Predefined, priced service packages an advisor can drop onto an estimate')}
        />
        {mayWrite && editing === null ? (
          <Button onClick={() => setEditing('new')}>
            <Icon name="Plus" size={16} />
            {t('New Package')}
          </Button>
        ) : null}
      </div>

      {!isLive ? (
        <div role="note" className="flex items-start gap-3 rounded-xl border border-border bg-inset p-3.5">
          <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-muted" />
          <p className="text-xs leading-relaxed text-body">
            {t('This build has no API configured, so the catalog cannot be saved. Set VITE_API_URL to see it.')}
          </p>
        </div>
      ) : null}

      {editing !== null ? (
        <CannedJobEditor
          key={editing === 'new' ? 'new' : editing._id}
          job={editing === 'new' ? null : editing}
          onDone={() => {
            setEditing(null)
            invalidate()
          }}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {rows.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="PackageSearch"
            title={t('No canned jobs yet')}
            description={t('Bundle a standard visit into a named, priced package advisors can reuse.')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((job) => (
            <Card key={job._id} className="flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-heading">{job.name}</p>
                  {job.category ? <p className="text-[11px] text-muted">{job.category}</p> : null}
                </div>
                {job.active ? null : (
                  <Badge background="var(--tint-neutral)" color="var(--text-muted)">
                    {t('Inactive')}
                  </Badge>
                )}
              </div>
              <Money sar={job.priceHalalas / 100} className="text-lg font-extrabold text-heading" />
              <p className="text-[11px] text-muted">
                {job.lineCount} {t(job.lineCount === 1 ? 'line item' : 'line items')}
              </p>
              {mayWrite ? (
                <div className="mt-1 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(job)}>
                    <Icon name="Pencil" size={12} />
                    {t('Edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void toggleActive(job, toast, t, invalidate)}
                  >
                    <Icon name={job.active ? 'EyeOff' : 'Eye'} size={12} />
                    {t(job.active ? 'Retire' : 'Reactivate')}
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

async function toggleActive(
  job: CannedJob,
  toast: ReturnType<typeof useToast>,
  t: (key: string) => string,
  onDone: () => void
) {
  try {
    await updateCannedJob(job._id!, { active: !job.active })
    toast.show({ title: t(job.active ? 'Package retired' : 'Package reactivated'), description: job.name })
    onDone()
  } catch (cause) {
    toast.show({
      title: t('Could not update'),
      description: cause instanceof RepositoryError ? cause.message : t('Something went wrong. Nothing was saved.'),
      error: true,
    })
  }
}

function CannedJobEditor({
  job,
  onDone,
  onCancel,
}: {
  job: CannedJob | null
  onDone: () => void
  onCancel: () => void
}) {
  const { t } = usePreferences()
  const toast = useToast()
  const [initialLines, setInitialLines] = useState<DraftLine[] | null>(job ? null : linesFromJob(null))
  const [loadingLines, setLoadingLines] = useState(Boolean(job))

  useMemo(() => {
    if (!job) return
    fetchCannedJobLines(job._id!)
      .then(({ rows }) => {
        setInitialLines(
          rows.length > 0
            ? rows.map((row, index) => ({
                key: index + 1,
                desc: row.description,
                kind: row.kind === 'labour' ? 'labour' : 'part',
                qty: String(row.qty),
                unit: (row.unitPriceHalalas / 100).toFixed(2),
              }))
            : [blankLine(1)]
        )
      })
      .catch(() => setInitialLines([blankLine(1)]))
      .finally(() => setLoadingLines(false))
    // Runs once per editor instance — `job` is fixed for the component's
    // lifetime (the parent remounts a fresh editor per selection via `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadingLines || initialLines === null) return <Loading label={t('Loading package...')} />

  return (
    <CannedJobForm
      job={job}
      initialLines={initialLines}
      onDone={onDone}
      onCancel={onCancel}
      toast={toast}
      t={t}
    />
  )
}

function CannedJobForm({
  job,
  initialLines,
  onDone,
  onCancel,
  toast,
  t,
}: {
  job: CannedJob | null
  initialLines: DraftLine[]
  onDone: () => void
  onCancel: () => void
  toast: ReturnType<typeof useToast>
  t: (key: string) => string
}) {
  const form = useZodForm({
    schema: formSchema,
    initial: {
      name: job?.name ?? '',
      nameAr: job?.nameAr ?? '',
      category: job?.category ?? '',
      description: job?.description ?? '',
      lines: initialLines,
    },
    async onSubmit(values) {
      const lines = values.lines.map((line) => ({
        description: line.desc.trim(),
        kind: line.kind,
        qty: Number(line.qty),
        unitPriceHalalas: toHalalas(line.unit) ?? 0,
      }))
      try {
        if (job) {
          await updateCannedJob(job._id!, {
            name: values.name.trim(),
            nameAr: values.nameAr.trim() || undefined,
            category: values.category.trim() || undefined,
            description: values.description.trim() || undefined,
            lines,
          })
        } else {
          await createCannedJob({
            name: values.name.trim(),
            nameAr: values.nameAr.trim() || undefined,
            category: values.category.trim() || undefined,
            description: values.description.trim() || undefined,
            lines,
          })
        }
        toast.show({ title: t(job ? 'Package updated' : 'Package created'), description: values.name.trim() })
        onDone()
      } catch (error) {
        const message =
          error instanceof RepositoryError ? error.message : t('The canned job could not be saved.')
        const field = (error as { field?: string } | null)?.field
        throw new ServerValidationError(field && field in values ? { [field]: message } : {}, message)
      }
    },
  })

  const lines = form.values.lines as DraftLine[]
  function setLines(next: DraftLine[]) {
    form.setValue('lines', next)
  }
  function patchLine(index: number, change: Partial<DraftLine>) {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...change } : line)))
  }

  const price = lines.reduce((sum, line) => sum + (Number(line.qty) || 0) * ((toHalalas(line.unit) ?? 0) / 100), 0)

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Form form={form} className="gap-4">
        <FormErrorSummary />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field name="name" label="Name" required placeholder={t('Standard Oil Change')} />
          <Field name="nameAr" label="Name (Arabic)" placeholder="تغيير زيت عادي" />
          <Field name="category" label="Category" placeholder={t('Maintenance')} />
        </div>
        <Field name="description" label="Description" kind="textarea" rows={2} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-heading">{t('Line Items')}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines([...lines, blankLine(Math.max(0, ...lines.map((l) => l.key)) + 1)])}
            >
              <Icon name="Plus" size={12} />
              {t('Add Line')}
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            {lines.map((line, index) => (
              <div key={line.key} className="flex flex-wrap items-center gap-1.5 rounded border border-border p-2">
                <Input
                  value={line.desc}
                  onChange={(e) => patchLine(index, { desc: e.target.value })}
                  aria-label={t('Description')}
                  placeholder={t('Description')}
                  inputSize="sm"
                  className="min-w-[160px] flex-1"
                />
                <Select
                  value={line.kind}
                  onChange={(e) => patchLine(index, { kind: e.target.value as DraftLine['kind'] })}
                  aria-label={t('Kind')}
                  className="w-[104px] flex-shrink-0"
                >
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {t(k.label)}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  value={line.qty}
                  onChange={(e) => patchLine(index, { qty: e.target.value })}
                  aria-label={t('Qty')}
                  dir="ltr"
                  inputSize="sm"
                  className="w-[70px] flex-shrink-0 text-center font-mono"
                />
                <Input
                  inputMode="decimal"
                  value={line.unit}
                  onChange={(e) => patchLine(index, { unit: e.target.value })}
                  aria-label={t('Unit Price')}
                  placeholder="0.00"
                  dir="ltr"
                  inputSize="sm"
                  className="w-[100px] flex-shrink-0 text-end font-mono"
                />
                <button
                  type="button"
                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                  aria-label={`${t('Remove')}: ${line.desc || t('Description')}`}
                  className="flex flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-1.5 text-muted hover:text-salis-orange focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
          {form.errors.lines && (form.submitted || form.touched.lines) ? (
            <p role="alert" className="text-[13px] text-salis-orange">
              {t(form.errors.lines)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <span className="text-[11px] text-muted">{t('List Price')}</span>
            <Money sar={price} className="ms-2 text-base font-extrabold text-heading" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={form.pending}>
              {form.pending ? t('Saving...') : t('Save Package')}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  )
}
