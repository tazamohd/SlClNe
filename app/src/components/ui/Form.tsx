import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Button } from './Button'
import { Chip, ChipGroup } from './Chip'
import { Icon } from './Icon'
import { Input } from './Input'
import { useModal } from './Modal'
import { formatSar, parseSar } from './Money'

/** The form system, built on the zod schema that will also guard the endpoint.
 *
 *  One schema is the validator here and the contract there (MASTER_ARCHITECTURE
 *  §Target), so a rule cannot be enforced on one side and forgotten on the
 *  other. What the design's `UI.FormValidation.dc.html` shows statically —
 *  field states, inline messages, a summary banner, a disabled submit — is
 *  behaviour here.
 *
 *  Errors are Action Orange and valid states are blue. The palette has no red
 *  and no green (README §7), so "the border went red" is not a thing this
 *  product can say. */

/** Thrown by a submit handler to move a server rejection onto the fields that
 *  caused it. Anything else that throws becomes a form-level message, because a
 *  failure with no field to attach to still has to be visible. */
export class ServerValidationError extends Error {
  readonly fields: Record<string, string>

  constructor(fields: Record<string, string>, message?: string) {
    super(message ?? 'The server rejected this submission.')
    this.name = 'ServerValidationError'
    this.fields = fields
  }
}

export interface ZodForm<TValues extends Record<string, unknown>> {
  /** Stable prefix for every control's `id` — also what focus-first-error uses. */
  id: string
  values: TValues
  /** Field messages, from zod or from the server. */
  errors: Record<string, string>
  /** Fields the user has left at least once. Errors stay hidden until then. */
  touched: Record<string, boolean>
  /** Fields that differ from the values the form opened with. */
  dirtyFields: Record<string, boolean>
  /** True once any field differs from its initial value. */
  dirty: boolean
  /** True while `onSubmit` is in flight — the submit button is disabled. */
  pending: boolean
  /** True after the first submit attempt; errors then show without a blur. */
  submitted: boolean
  /** A rejection that belongs to the form rather than to one field. */
  formError: string | null
  setValue: <TName extends keyof TValues & string>(name: TName, value: TValues[TName]) => void
  markTouched: (name: string) => void
  submit: (event?: FormEvent) => void
  /** Back to `initial`, or to `next` when the record was saved and reloaded. */
  reset: (next?: TValues) => void
}

/** Two values count as the same when they are the same scalar, or arrays with
 *  the same members — enough for dirty tracking over the field kinds below. */
function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => Object.is(item, b[index]))
  }
  return Object.is(a, b)
}

function errorsFromZod(error: z.ZodError): { fields: Record<string, string>; form: string | null } {
  const fields: Record<string, string> = {}
  let form: string | null = null
  for (const issue of error.issues) {
    const name = issue.path.length ? String(issue.path[0]) : ''
    if (!name) form ??= issue.message
    else fields[name] ??= issue.message
  }
  return { fields, form }
}

export function useZodForm<TIn extends Record<string, unknown>, TOut>(options: {
  schema: z.ZodType<TOut, z.ZodTypeDef, TIn>
  initial: TIn
  /** Throw `ServerValidationError` to attach a rejection to specific fields. */
  onSubmit: (values: TOut) => void | Promise<void>
}): ZodForm<TIn> {
  const { schema, initial, onSubmit } = options
  const id = useId()
  const [values, setValues] = useState<TIn>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // The baseline dirty is measured against. State rather than a ref: a
  // successful save re-baselines, and the form has to *re-render* clean —
  // a mutated ref would leave the guard armed over no unsaved edits.
  const [baseline, setBaseline] = useState<TIn>(initial)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  // Latest handler without re-creating `submit` on every render of the caller.
  const submitHandler = useRef(onSubmit)
  submitHandler.current = onSubmit

  const dirtyFields = useMemo(() => {
    const out: Record<string, boolean> = {}
    for (const key of Object.keys(values)) {
      if (!sameValue(values[key], baseline[key])) out[key] = true
    }
    return out
  }, [values, baseline])
  const dirty = Object.keys(dirtyFields).length > 0

  const setValue = useCallback<ZodForm<TIn>['setValue']>((name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    // A field the user is fixing must stop shouting as soon as it is valid
    // again, not at the next submit.
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }, [])

  const markTouched = useCallback((name: string) => {
    setTouched((current) => (current[name] ? current : { ...current, [name]: true }))
  }, [])

  const reset = useCallback(
    (next?: TIn) => {
      const target = next ?? baseline
      setBaseline(target)
      setValues(target)
      setErrors({})
      setTouched({})
      setSubmitted(false)
      setFormError(null)
    },
    [baseline]
  )

  const submit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault()
      setSubmitted(true)
      setFormError(null)

      const parsed = schema.safeParse(values)
      if (!parsed.success) {
        const mapped = errorsFromZod(parsed.error)
        setErrors(mapped.fields)
        setFormError(mapped.form)
        focusFirstError(id, Object.keys(mapped.fields))
        return
      }

      setErrors({})
      const outcome = submitHandler.current(parsed.data)
      if (!(outcome instanceof Promise)) {
        setBaseline(values)
        return
      }

      setPending(true)
      outcome
        .then(() => {
          if (!alive.current) return
          // Saved: these values are the new clean state, so the unsaved-changes
          // guard stands down.
          setBaseline(values)
        })
        .catch((error: unknown) => {
          if (!alive.current) return
          if (error instanceof ServerValidationError) {
            setErrors(error.fields)
            setFormError(Object.keys(error.fields).length ? null : error.message)
            focusFirstError(id, Object.keys(error.fields))
            return
          }
          setFormError(error instanceof Error ? error.message : 'The request failed.')
        })
        .finally(() => {
          if (alive.current) setPending(false)
        })
    },
    [id, schema, values]
  )

  useBeforeUnloadGuard(dirty && !pending)

  return {
    id,
    values,
    errors,
    touched,
    dirtyFields,
    dirty,
    pending,
    submitted,
    formError,
    setValue,
    markTouched,
    submit,
    reset,
  }
}

function fieldId(formId: string, name: string): string {
  return `${formId}-${name}`
}

/** Moves focus to the first field the submit rejected. Without this a keyboard
 *  user has to hunt for the message they cannot see. */
function focusFirstError(formId: string, names: readonly string[]) {
  const first = names[0]
  if (!first) return
  const element = document.getElementById(fieldId(formId, first))
  if (element) element.focus()
}

/** Warns before a reload or a tab close while edits are unsaved. */
export function useBeforeUnloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [active])
}

/** In-app half of the unsaved-changes guard: `await confirmDiscard()` before
 *  navigating away or closing the dialog a form sits in. Resolves immediately
 *  when there is nothing to lose. Requires a `ModalProvider`. */
export function useUnsavedChangesGuard(dirty: boolean): {
  confirmDiscard: () => Promise<boolean>
} {
  const { confirm } = useModal()
  useBeforeUnloadGuard(dirty)

  const confirmDiscard = useCallback(async () => {
    if (!dirty) return true
    return confirm({
      title: 'Discard your changes?',
      description: 'This form has edits that have not been saved. Leaving now loses them.',
      icon: 'AlertTriangle',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep Editing',
      destructive: true,
    })
  }, [confirm, dirty])

  return { confirmDiscard }
}

// ── The form element ────────────────────────────────────────────────────────

const FormContext = createContext<ZodForm<Record<string, unknown>> | null>(null)

function useFormContext(): ZodForm<Record<string, unknown>> {
  const value = useContext(FormContext)
  if (!value) throw new Error('Field must be used within a Form')
  return value
}

export function Form<TValues extends Record<string, unknown>>({
  form,
  children,
  className,
}: {
  form: ZodForm<TValues>
  children: ReactNode
  className?: string
}) {
  // One cast at the boundary: callers keep their field names typed against the
  // schema, while `Field` addresses the form by string name.
  const shared = form as unknown as ZodForm<Record<string, unknown>>
  return (
    <FormContext.Provider value={shared}>
      <form onSubmit={form.submit} noValidate className={cn('flex flex-col gap-3.5', className)}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

/** The design's orange summary banner, above the fields it refers to. Renders
 *  nothing until a submit has actually been refused. */
export function FormErrorSummary() {
  const { t } = usePreferences()
  const form = useFormContext()
  const count = Object.keys(form.errors).length
  if (!form.submitted || (!count && !form.formError)) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-3.5 py-3"
    >
      <Icon name="AlertTriangle" size={15} className="mt-0.5 flex-shrink-0 text-salis-orange" />
      <div>
        <p className="font-action text-[13px] font-semibold text-heading">
          {form.formError ?? t('Check the highlighted fields')}
        </p>
        {count ? (
          // The count is a numeral, not part of the sentence — interpolating it
          // into a translated string would break the moment Arabic reorders it.
          <p className="mt-0.5 text-[13px] text-muted">
            <span dir="ltr" className="font-mono">
              {count}
            </span>{' '}
            {t('fields need attention before this form can be saved.')}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Footer row: the required-fields note the design carries, then the actions. */
export function FormActions({ children, note }: { children: ReactNode; note?: boolean }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-1">
      {note ? <span className="text-[11px] text-muted">{t('* Required fields')}</span> : null}
      <span className="flex-1" />
      {children}
    </div>
  )
}

/** Submit button. Disabled while the submission is in flight, so a slow save
 *  cannot be fired twice — the ledger screens make that a correctness issue,
 *  not a cosmetic one. */
export function SubmitButton({ label, children }: { label?: string; children?: ReactNode }) {
  const { t } = usePreferences()
  const form = useFormContext()
  return (
    <Button type="submit" size="lg" disabled={form.pending}>
      {children}
      {form.pending ? t('Saving...') : t(label ?? 'Save Changes')}
    </Button>
  )
}

// ── Fields ──────────────────────────────────────────────────────────────────

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'daterange'
  | 'select'
  | 'searchselect'
  | 'multiselect'
  | 'file'
  | 'vin'
  | 'vat'
  | 'signature'

export interface FieldOption {
  value: string
  /** English source string — translated at render. */
  label: string
}

export interface FieldProps {
  name: string
  /** English source string — translated at render, so Arabic works. */
  label: string
  kind?: FieldKind
  placeholder?: string
  /** Shown under the field while there is no error, as the design's helper
   *  text is ("Optional. Required only for VAT-registered customers."). */
  hint?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  /** Choices for `select` and `multiselect`. */
  options?: readonly FieldOption[]
  rows?: number
  /** `file` only — the accept filter, e.g. `.pdf,image/*`. */
  accept?: string
  /** `file` only — allow more than one. */
  multiple?: boolean
  className?: string
}

export function Field({
  name,
  label,
  kind = 'text',
  placeholder,
  hint,
  required,
  readOnly,
  disabled,
  options,
  rows = 3,
  accept,
  multiple,
  className,
}: FieldProps) {
  const { t } = usePreferences()
  const form = useFormContext()

  const id = fieldId(form.id, name)
  const messageId = `${id}-message`
  const error = form.errors[name]
  // A message the user has not yet earned is noise: errors wait for a blur, or
  // for the submit that refused the form.
  const showError = Boolean(error) && (form.touched[name] || form.submitted)
  const describedBy = showError || hint ? messageId : undefined

  const raw = form.values[name]
  const onBlur = () => form.markTouched(name)

  /** What every control needs; the typed extras are added per element, because
   *  `<select>` has no placeholder and a file input has no readonly. */
  const common = {
    id,
    name,
    disabled,
    onBlur,
    'aria-invalid': showError || undefined,
    'aria-describedby': describedBy,
  } as const
  const textish = {
    ...common,
    required,
    readOnly,
    placeholder: placeholder ? t(placeholder) : undefined,
  } as const

  let control: ReactNode
  switch (kind) {
    case 'textarea':
      control = (
        <textarea
          {...textish}
          rows={rows}
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value)}
          className={cn(
            'w-full resize-y rounded border bg-inset px-3.5 py-2.5 font-ui text-sm text-heading outline-none',
            'transition-all duration-200 ease-salis',
            'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            showError ? 'border-salis-orange' : 'border-border'
          )}
        />
      )
      break

    case 'select':
      control = (
        <select
          {...common}
          required={required}
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value)}
          className={cn(
            'h-12 w-full rounded border bg-inset px-3 font-action text-sm text-heading outline-none',
            'transition-all duration-200 ease-salis',
            'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            showError ? 'border-salis-orange' : 'border-border'
          )}
        >
          <option value="">{t(placeholder ?? 'Select')}</option>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      )
      break

    case 'multiselect': {
      const selected = Array.isArray(raw) ? (raw as string[]) : []
      control = (
        <ChipGroup label={t(label)} multi>
          {(options ?? []).map((option) => (
            <Chip
              key={option.value}
              multi
              label={t(option.label)}
              selected={selected.includes(option.value)}
              onToggle={() => {
                form.markTouched(name)
                form.setValue(
                  name,
                  selected.includes(option.value)
                    ? selected.filter((value) => value !== option.value)
                    : [...selected, option.value]
                )
              }}
            />
          ))}
        </ChipGroup>
      )
      break
    }

    case 'file':
      control = (
        <FileField
          id={id}
          name={name}
          disabled={disabled}
          describedBy={describedBy}
          accept={accept}
          multiple={multiple}
          files={Array.isArray(raw) ? (raw as File[]) : []}
          invalid={showError}
          onBlur={onBlur}
          onFiles={(files) => {
            form.markTouched(name)
            form.setValue(name, files)
          }}
        />
      )
      break

    case 'currency':
      control = (
        <Input
          {...textish}
          inputMode="decimal"
          dir="ltr"
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value)}
          invalid={showError}
          className="font-mono"
          // The prefix sits inside the field, and `Input` positions it with a
          // logical inset so Arabic puts it on the correct edge.
          icon={<span className="font-mono text-[11px] font-semibold">SAR</span>}
        />
      )
      break

    case 'percentage':
      control = (
        <Input
          {...textish}
          type="number"
          min={0}
          max={100}
          step="any"
          inputMode="decimal"
          dir="ltr"
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value)}
          invalid={showError}
          className="font-mono"
          trailing={<span className="font-mono text-[11px] font-semibold text-muted">%</span>}
        />
      )
      break

    case 'daterange': {
      const parts = typeof raw === 'string' ? raw.split('|') : ['', '']
      const fromVal = parts[0] ?? ''
      const toVal = parts[1] ?? ''
      const dateClass = cn(
        'h-12 w-full rounded border bg-inset px-3.5 font-mono text-sm text-heading outline-none',
        'transition-all duration-200 ease-salis',
        'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        showError ? 'border-salis-orange' : 'border-border'
      )
      control = (
        <div className="flex items-center gap-2">
          <input
            {...common}
            type="date"
            dir="ltr"
            required={required}
            readOnly={readOnly}
            value={fromVal}
            onChange={(event) => form.setValue(name, `${event.target.value}|${toVal}`)}
            aria-label={t('From date')}
            className={dateClass}
          />
          <span className="flex-shrink-0 text-xs text-muted">{t('to')}</span>
          <input
            id={`${id}-to`}
            name={`${name}-to`}
            type="date"
            dir="ltr"
            disabled={disabled}
            readOnly={readOnly}
            value={toVal}
            onChange={(event) => form.setValue(name, `${fromVal}|${event.target.value}`)}
            onBlur={onBlur}
            aria-label={t('To date')}
            className={dateClass}
          />
        </div>
      )
      break
    }

    case 'searchselect':
      control = (
        <SearchSelectField
          id={id}
          name={name}
          disabled={disabled}
          placeholder={placeholder ? t(placeholder) : undefined}
          options={options ?? []}
          value={typeof raw === 'string' ? raw : ''}
          invalid={showError}
          onBlur={onBlur}
          onChange={(value) => {
            form.markTouched(name)
            form.setValue(name, value)
          }}
          describedBy={describedBy}
        />
      )
      break

    case 'vin':
      control = (
        <Input
          {...textish}
          dir="ltr"
          maxLength={17}
          pattern="[A-HJ-NPR-Z0-9]{17}"
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value.toUpperCase())}
          invalid={showError}
          className="font-mono uppercase"
        />
      )
      break

    case 'vat':
      control = (
        <Input
          {...textish}
          dir="ltr"
          maxLength={15}
          inputMode="numeric"
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value.replace(/\D/g, ''))}
          invalid={showError}
          className="font-mono"
        />
      )
      break

    case 'signature':
      control = (
        <SignatureField
          id={id}
          name={name}
          disabled={disabled}
          value={typeof raw === 'string' ? raw : ''}
          invalid={showError}
          onBlur={onBlur}
          onChange={(dataUrl) => {
            form.markTouched(name)
            form.setValue(name, dataUrl)
          }}
          describedBy={describedBy}
        />
      )
      break

    default: {
      const type =
        kind === 'email' ? 'email' : kind === 'phone' ? 'tel' : kind === 'date' ? 'date' : 'text'
      // Latin runs — phone numbers and ISO dates — are pinned LTR and
      // monospaced, or the bidi algorithm reorders their digits in Arabic.
      const latin = kind === 'phone' || kind === 'date'
      control = (
        <Input
          {...textish}
          type={type}
          dir={latin ? 'ltr' : undefined}
          value={typeof raw === 'string' ? raw : ''}
          onChange={(event) => form.setValue(name, event.target.value)}
          invalid={showError}
          className={latin ? 'font-mono' : undefined}
        />
      )
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="font-action text-xs font-medium text-heading">
        {t(label)}
        {required ? (
          <span aria-hidden className="text-salis-orange">
            {' *'}
          </span>
        ) : null}
      </label>
      {control}
      {kind === 'currency' ? <CurrencyPreview value={raw} /> : null}
      {showError ? (
        <span
          id={messageId}
          className="flex items-center gap-1.5 text-[11px] font-medium text-salis-orange"
        >
          <Icon name="AlertCircle" size={12} className="flex-shrink-0" />
          {t(error ?? '')}
        </span>
      ) : hint ? (
        <span id={messageId} className="flex items-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0" />
          {t(hint)}
        </span>
      ) : null}
    </div>
  )
}

/** Echoes what the typed amount will be stored as. Formatting is the one place
 *  a currency field can silently disagree with the ledger, so it is shown. */
function CurrencyPreview({ value }: { value: unknown }) {
  if (typeof value !== 'string' || !value.trim()) return null
  const amount = parseSar(value)
  if (!amount) return null
  return (
    <span dir="ltr" className="font-mono text-[11px] text-muted">
      {formatSar(amount)}
    </span>
  )
}

/** The design's drop zone (Upload Files / Upload Image), plus the native input
 *  behind it — a drop target alone is unreachable from a keyboard. */
function FileField({
  id,
  name,
  accept,
  multiple,
  files,
  invalid,
  disabled,
  onFiles,
  onBlur,
  describedBy,
}: {
  id: string
  name: string
  accept?: string
  multiple?: boolean
  files: readonly File[]
  invalid?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  onBlur: () => void
  describedBy?: string
}) {
  const { t } = usePreferences()
  const [over, setOver] = useState(false)

  const add = (incoming: FileList | null) => {
    if (!incoming?.length) return
    const list = [...incoming]
    onFiles(multiple ? [...files, ...list] : list.slice(0, 1))
  }

  return (
    <div className="flex flex-col gap-2">
      {/* The input leads the label in source, not just for the `htmlFor` pairing
          but so the drop zone can be its `peer`: the native control is visually
          hidden, so its focus ring has to be borrowed by the label a keyboard
          user actually sees. Order is invisible here — the input is `sr-only`. */}
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onBlur={onBlur}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onChange={(event) => add(event.target.files)}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          if (!disabled) add(event.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-7 text-center',
          'transition-colors duration-150',
          'peer-focus-visible:border-salis-blue peer-focus-visible:ring-2 peer-focus-visible:ring-salis-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card',
          disabled && 'cursor-not-allowed opacity-60',
          invalid
            ? 'border-salis-orange'
            : over
              ? 'border-salis-blue bg-salis-blue/[.04]'
              : 'border-border bg-inset'
        )}
      >
        <Icon name="Upload" size={28} className="text-muted" />
        <span className="font-action text-[13px] font-semibold text-heading">
          {t('Drop files here')}
        </span>
        <span className="text-[11px] text-muted">{t('or click to browse')}</span>
      </label>
      {files.length ? (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded border border-border bg-inset px-2.5 py-1.5"
            >
              <Icon name="FileText" size={14} className="flex-shrink-0 text-salis-blue" />
              <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-[11px] text-body">
                {file.name}
              </span>
              <button
                type="button"
                aria-label={`${t('Remove')} ${file.name}`}
                onClick={() => onFiles(files.filter((_, at) => at !== index))}
                className="flex cursor-pointer border-none bg-transparent p-0 text-muted"
              >
                <Icon name="X" size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** A select with a search/filter input. When the user types, options are filtered.
 *  A native `<select>` sits behind the visual control so it works when JS is
 *  disabled and stays accessible to screen readers. */
function SearchSelectField({
  id,
  name,
  disabled,
  placeholder,
  options,
  value,
  invalid,
  onBlur,
  onChange,
  describedBy,
}: {
  id: string
  name: string
  disabled?: boolean
  placeholder?: string
  options: readonly FieldOption[]
  value: string
  invalid?: boolean
  onBlur: () => void
  onChange: (value: string) => void
  describedBy?: string
}) {
  const { t } = usePreferences()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) => t(option.label).toLowerCase().includes(needle))
  }, [options, search, t])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        onBlur()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onBlur])

  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <div ref={containerRef} className="relative">
      {/* Native select for no-JS fallback and screen readers. */}
      <select
        id={id}
        name={name}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="sr-only"
        tabIndex={-1}
      >
        <option value="">{placeholder ?? t('Select')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>

      {/* Visual search-select trigger. */}
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open) }}
        disabled={disabled}
        className={cn(
          'flex h-12 w-full cursor-pointer items-center justify-between rounded border bg-inset px-3 font-action text-sm outline-none',
          'transition-all duration-200 ease-salis',
          'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          invalid ? 'border-salis-orange' : 'border-border'
        )}
      >
        <span className={value ? 'text-heading' : 'text-muted'}>
          {selectedLabel ? t(selectedLabel) : (placeholder ?? t('Select'))}
        </span>
        <Icon name="ChevronDown" size={14} className="flex-shrink-0 text-muted" />
      </button>

      {/* Dropdown with a search input and the filtered option list. */}
      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
          <div className="p-2">
            <input
              type="text"
              aria-label={t('Search...')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Search...')}
              className="w-full rounded border border-border bg-inset px-3 py-2 text-sm text-heading outline-none focus:border-salis-blue"
              autoFocus
            />
          </div>
          <ul className="max-h-[200px] overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">{t('No results found')}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                      setSearch('')
                      onBlur()
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center border-none px-3 py-2 text-start text-sm transition-colors',
                      option.value === value
                        ? 'bg-salis-blue/[.08] font-semibold text-salis-blue'
                        : 'bg-transparent text-body hover:bg-inset'
                    )}
                  >
                    {t(option.label)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/** A canvas-based signature pad. Shows a bordered drawing area where the user can
 *  sign with pointer events. Has a "Clear" button. Stores the result as a data
 *  URL string. If empty, shows placeholder text. */
function SignatureField({
  id,
  name,
  disabled,
  value,
  invalid,
  onBlur,
  onChange,
  describedBy,
}: {
  id: string
  name: string
  disabled?: boolean
  value: string
  invalid?: boolean
  onBlur: () => void
  onChange: (dataUrl: string) => void
  describedBy?: string
}) {
  const { t } = usePreferences()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  function pointFrom(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return
    const context = canvasRef.current?.getContext('2d')
    const point = pointFrom(event)
    if (!context || !point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    const computed = getComputedStyle(canvasRef.current!)
    context.strokeStyle =
      computed.getPropertyValue('--salis-blue').trim() || computed.getPropertyValue('color')
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const context = canvasRef.current?.getContext('2d')
    const point = pointFrom(event)
    if (!context || !point) return
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  function end() {
    if (!drawingRef.current) return
    drawingRef.current = false
    const canvas = canvasRef.current
    if (canvas) {
      onChange(canvas.toDataURL('image/png'))
      onBlur()
    }
  }

  function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
    onBlur()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          id={id}
          width={600}
          height={180}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label={name}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-[180px] w-full touch-none rounded border-[1.5px] border-dashed bg-inset text-salis-blue',
            'transition-all duration-200',
            disabled && 'cursor-not-allowed opacity-60',
            invalid ? 'border-salis-orange' : 'border-border-strong'
          )}
        />
        {value ? null : (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
            <Icon name="PenTool" size={22} />
            <span className="text-xs">{t('Tap to sign')}</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        disabled={disabled || !value}
        className="flex h-[30px] cursor-pointer items-center gap-1.5 self-end rounded-md border border-border bg-transparent px-3 font-action text-xs text-muted transition-colors hover:border-salis-orange hover:text-salis-orange disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      >
        <Icon name="Eraser" size={13} />
        {t('Clear')}
      </button>
    </div>
  )
}
