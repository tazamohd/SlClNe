import { useState, type HTMLInputAutoCompleteAttribute } from 'react'
import type { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { ZodForm } from '@/components/ui/Form'
import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

/** A form control for the public lead forms, bound to a `useZodForm` form.
 *
 *  The app's shared `Field` knows nothing about `autoComplete`, `inputMode`
 *  or a phone/email keyboard — it was built for operational records, where a
 *  password manager and a mobile keyboard matter less than they do for a
 *  visitor typing an email on a phone. This binds the same form state
 *  (values, errors, touched, submitted) and adds:
 *
 *  - blur validation against the field's own zod rule, so a visitor hears
 *    about a malformed email when they leave the box, not after submit;
 *  - `autoComplete` / `inputMode`, and `dir="ltr"` on phone and email, which
 *    are Latin runs even under Arabic;
 *  - a label that stays exactly the source string (no asterisk), so the
 *    accessible name matches the copy. */
export type LeadFieldKind = 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select'

export interface LeadFieldProps<TValues extends Record<string, unknown>> {
  form: ZodForm<TValues>
  name: keyof TValues & string
  label: string
  kind?: LeadFieldKind
  /** The field's own rule, for validation on blur. */
  rule?: z.ZodTypeAny
  placeholder?: string
  autoComplete?: HTMLInputAutoCompleteAttribute
  rows?: number
  /** `select` only — English source labels, translated at render. */
  options?: readonly { value: string; label: string }[]
  disabled?: boolean
}

const INPUT_MODE: Partial<Record<LeadFieldKind, 'email' | 'tel'>> = { email: 'email', tel: 'tel' }

export function LeadField<TValues extends Record<string, unknown>>({
  form,
  name,
  label,
  kind = 'text',
  rule,
  placeholder,
  autoComplete,
  rows = 4,
  options,
  disabled,
}: LeadFieldProps<TValues>) {
  const t = useT()
  const [blurError, setBlurError] = useState<string | null>(null)

  const id = `${form.id}-${name}`
  const messageId = `${id}-error`
  const raw = form.values[name]
  const value = typeof raw === 'string' ? raw : ''
  const latin = kind === 'email' || kind === 'tel' || kind === 'date'

  const submitError = form.errors[name]
  const error = submitError ?? (form.touched[name] ? blurError : null)
  const showError = Boolean(error) && (form.touched[name] || form.submitted)

  const onChange = (next: string) => {
    form.setValue(name, next as TValues[typeof name])
    if (blurError) setBlurError(null)
  }

  const onBlur = () => {
    form.markTouched(name)
    if (!rule) return
    const parsed = rule.safeParse(value)
    setBlurError(parsed.success ? null : parsed.error.issues[0]?.message ?? null)
  }

  const shared = {
    id,
    name,
    disabled,
    onBlur,
    'aria-invalid': showError || undefined,
    'aria-describedby': showError ? messageId : undefined,
  } as const

  let control
  if (kind === 'textarea') {
    control = (
      <Textarea
        {...shared}
        rows={rows}
        value={value}
        placeholder={placeholder ? t(placeholder) : undefined}
        invalid={showError}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  } else if (kind === 'select') {
    control = (
      <Select
        {...shared}
        size="md"
        value={value}
        invalid={showError}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
      >
        <option value="">{t(placeholder ?? 'Select')}</option>
        {(options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </Select>
    )
  } else {
    control = (
      <Input
        {...shared}
        type={kind}
        inputSize="md"
        value={value}
        dir={latin ? 'ltr' : undefined}
        inputMode={INPUT_MODE[kind]}
        autoComplete={autoComplete}
        placeholder={placeholder ? (latin ? placeholder : t(placeholder)) : undefined}
        invalid={showError}
        className={cn(latin && 'font-mono')}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-heading">
        {t(label)}
      </label>
      {control}
      {showError ? (
        <p id={messageId} className="m-0 text-xs text-salis-orange">
          {t(error ?? '')}
        </p>
      ) : null}
    </div>
  )
}
