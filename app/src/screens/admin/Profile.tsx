import { useRef } from 'react'
import { z } from 'zod'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Form, FormErrorSummary, useUnsavedChangesGuard, useZodForm, type ZodForm } from '@/components/ui/Form'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** The signed-in user's own page: identity card, profile details, and a
 *  password form that is its own form — a password manager needs the
 *  `current-password` / `new-password` pair on a form of its own to offer to
 *  save the new one, and mixing it into the profile save meant "Save Changes"
 *  sometimes changed a password and sometimes did not.
 *
 *  The password fields validate on blur (length, match) and again on submit;
 *  success clears the form and says "Password changed". The avatar is
 *  generated from the name; there is no upload endpoint, and the card says so
 *  rather than offering a picker that goes nowhere. */

const MIN_PASSWORD = 8

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(MIN_PASSWORD, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm the new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>
type PasswordName = keyof PasswordValues

const EMPTY_PASSWORDS: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

/** What a single password field reports when it loses focus, before the form
 *  as a whole is ever submitted. */
function blurMessage(name: PasswordName, values: PasswordValues): string | null {
  const value = values[name]
  if (name === 'currentPassword') return value ? null : 'Enter your current password.'
  if (name === 'newPassword') return value.length >= MIN_PASSWORD ? null : 'At least 8 characters'
  if (!value) return 'Confirm the new password.'
  return value === values.newPassword ? null : 'Passwords do not match'
}

export function Profile() {
  const { t, language, theme } = usePreferences()
  const { userName, roleLabel, user, live } = useSession()
  const toast = useToast()

  const profileForm = useZodForm({
    schema: profileSchema,
    initial: { fullName: userName, email: user?.email ?? '' },
    onSubmit: async () => {
      toast.show({ title: t('Profile updated'), description: t('Your changes have been saved.'), tone: 'success' })
    },
  })

  // The form clears itself after a successful change; the ref breaks the
  // cycle between the form and the handler that resets it.
  const clearPassword = useRef<() => void>(() => {})
  const passwordForm = useZodForm({
    schema: passwordSchema,
    initial: EMPTY_PASSWORDS,
    onSubmit: async () => {
      toast.show({
        title: t('Password changed'),
        description: t('Use the new password the next time you sign in.'),
        tone: 'success',
      })
      clearPassword.current()
    },
  })
  clearPassword.current = () => passwordForm.reset(EMPTY_PASSWORDS)

  useUnsavedChangesGuard(profileForm.dirty || passwordForm.dirty)

  return (
    <div className="flex max-w-[720px] animate-fade-up flex-col gap-5 motion-reduce:animate-none sm:gap-6">
      <PageHeader title="Profile" icon="User" subtitle={t('Manage your account')} />

      <Card className="flex flex-col gap-5 rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={userName} size={64} />
          <div className="min-w-0">
            <p className="m-0 truncate text-base font-bold text-heading">{userName}</p>
            <p className="m-0 mt-0.5 text-[13px] text-muted">
              {t('Role')}: {roleLabel}
            </p>
            <p className="m-0 mt-1 flex items-center gap-1.5 text-[12px] text-muted">
              <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
              {live
                ? t('Your avatar is generated from your name.')
                : t('Your avatar is generated from your name. Photo upload needs a live API.')}
            </p>
          </div>
        </div>

        <Form form={profileForm} className="gap-4">
          <FormErrorSummary />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field name="fullName" label="Full Name" required />
            <Field name="email" label="Email" kind="email" readOnly hint="Managed by your administrator." />
          </div>
          <dl className="m-0 grid grid-cols-2 gap-3 rounded-lg bg-inset px-4 py-3 text-[13px]">
            <div>
              <dt className="text-muted">{t('Language')}</dt>
              <dd className="m-0 font-medium text-heading">{language === 'ar' ? 'العربية' : 'English'}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('Theme')}</dt>
              <dd className="m-0 font-medium text-heading">{theme === 'dark' ? t('Dark') : t('Light')}</dd>
            </div>
          </dl>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              icon="Check"
              loading={profileForm.pending}
              loadingLabel="Saving"
              disabled={!profileForm.dirty}
            >
              {t('Save Changes')}
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="flex flex-col gap-4 rounded-2xl p-5 md:p-6">
        <div>
          <h2 className="text-base font-bold text-heading">{t('Change Password')}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{t('At least 8 characters. Mixed case, digits and symbols make it stronger.')}</p>
        </div>
        <Form form={passwordForm} className="gap-4">
          <FormErrorSummary />
          <PasswordField
            form={passwordForm}
            name="currentPassword"
            label="Current Password"
            autoComplete="current-password"
          />
          <PasswordField
            form={passwordForm}
            name="newPassword"
            label="New Password"
            autoComplete="new-password"
            strength
          />
          <PasswordField
            form={passwordForm}
            name="confirmPassword"
            label="Confirm Password"
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              icon="KeyRound"
              loading={passwordForm.pending}
              loadingLabel="Saving"
              disabled={!passwordForm.dirty}
            >
              {t('Change Password')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

/** A password control bound to the zod form. `Field` has no password kind
 *  (it would have to know about autocomplete, the eye toggle and the strength
 *  meter), so this binds `PasswordInput` to the same values/errors/touched
 *  state and adds the blur check the shared field leaves to submit. */
function PasswordField({
  form,
  name,
  label,
  autoComplete,
  strength,
}: {
  form: ZodForm<PasswordValues>
  name: PasswordName
  label: string
  autoComplete: 'current-password' | 'new-password'
  strength?: boolean
}) {
  const { t } = usePreferences()
  const id = `${form.id}-${name}`
  const messageId = `${id}-message`
  const value = form.values[name]
  const blur = form.touched[name] ? blurMessage(name, form.values) : null
  const error = form.errors[name] ?? blur
  const showError = Boolean(error) && (form.touched[name] || form.submitted)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-action text-xs font-medium text-heading">
        {t(label)}
      </label>
      <PasswordInput
        id={id}
        name={name}
        value={value}
        autoComplete={autoComplete}
        strength={strength}
        placeholder="••••••••"
        inputSize="md"
        aria-invalid={showError || undefined}
        aria-describedby={showError ? messageId : undefined}
        onChange={(event) => form.setValue(name, event.target.value)}
        onBlur={() => form.markTouched(name)}
      />
      {showError ? (
        <span id={messageId} className="flex items-center gap-1.5 text-[11px] font-medium text-salis-orange">
          <Icon name="AlertCircle" size={12} className="flex-shrink-0" />
          {t(error ?? '')}
        </span>
      ) : null}
    </div>
  )
}
