import { useId, useState, type ReactNode } from 'react'
import type { z } from 'zod'
import { Field } from '@/components/shell/AuthCard'
import type { ZodForm } from '@/components/ui/Form'
import { Input, type InputProps } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { usePreferences } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

/** A labelled control bound to a `useZodForm` by name, for the auth screens.
 *
 *  `Form.tsx`'s `Field` covers the app's data-entry kinds; the auth chain
 *  needs three things it does not offer — a leading icon, a password control
 *  with its own toggle and meter, and a fixed `id` (`#email`, `#pw`) that the
 *  end-to-end suite addresses. The binding rules are the same: errors wait
 *  for a blur or a refused submit, and `rule` — the field's slice of the
 *  schema — is parsed on blur so the message arrives while the user is still
 *  on the field rather than at the bottom of the form. */
export interface AuthFormFieldProps<TValues extends Record<string, unknown>> {
  form: ZodForm<TValues>
  name: keyof TValues & string
  /** English source string. */
  label: string
  /** Fixed element id; defaults to the form's own scheme so focus-first-error
   *  can find it. */
  id?: string
  type?: 'text' | 'email' | 'tel' | 'number'
  /** Render a `PasswordInput` with this autocomplete hint. */
  password?: 'current-password' | 'new-password'
  /** Password only — show the strength meter. */
  strength?: boolean
  autoComplete?: string
  /** Raw placeholder; codes and addresses are not translated. */
  placeholder?: string
  /** English source string, translated at render. */
  placeholderKey?: string
  icon?: ReactNode
  /** Latin runs — emails, codes, phone numbers — are pinned LTR. */
  ltr?: boolean
  mono?: boolean
  inputMode?: InputProps['inputMode']
  /** English source string shown under the field while there is no error. */
  hint?: string
  required?: boolean
  /** The field's own schema, parsed on blur for inline validation. */
  rule?: z.ZodTypeAny
  inputSize?: InputProps['inputSize']
  min?: number
  max?: number
}

export function AuthFormField<TValues extends Record<string, unknown>>({
  form,
  name,
  label,
  id,
  type = 'text',
  password,
  strength,
  autoComplete,
  placeholder,
  placeholderKey,
  icon,
  ltr,
  mono,
  inputMode,
  hint,
  required,
  rule,
  inputSize,
  min,
  max,
}: AuthFormFieldProps<TValues>) {
  const { t } = usePreferences()
  const [blurError, setBlurError] = useState<string | null>(null)
  const fallbackId = useId()
  const controlId = id ?? `${form.id}-${name}`
  const messageId = `${fallbackId}-message`

  const raw = form.values[name]
  const value = typeof raw === 'string' ? raw : ''
  const message = form.errors[name] ?? blurError
  const showError = Boolean(message) && (form.touched[name] || form.submitted)

  const onChange = (next: string) => {
    setBlurError(null)
    form.setValue(name, next as TValues[typeof name])
  }
  const onBlur = () => {
    form.markTouched(name)
    if (!rule) return
    const parsed = rule.safeParse(value)
    setBlurError(parsed.success ? null : (parsed.error.issues[0]?.message ?? null))
  }

  const shared = {
    id: controlId,
    name,
    value,
    required,
    invalid: showError,
    'aria-describedby': showError || hint ? messageId : undefined,
    placeholder: placeholderKey ? t(placeholderKey) : placeholder,
    icon,
    inputSize,
  } as const

  return (
    <Field
      label={t(label)}
      htmlFor={controlId}
      hint={hint ? t(hint) : undefined}
      error={showError ? t(message ?? '') : null}
      messageId={messageId}
    >
      {password ? (
        <PasswordInput
          {...shared}
          autoComplete={password}
          strength={strength}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <Input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
          dir={ltr ? 'ltr' : undefined}
          className={cn(mono && 'font-mono text-[13px]')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </Field>
  )
}
