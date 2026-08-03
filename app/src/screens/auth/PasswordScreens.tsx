import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard, Field } from '@/components/shell/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Password recovery. Both screens share the same bordered-card shape.
 *
 *  Changing a password while signed in is not a separate screen in the design
 *  — Profile carries it inline — so there is no ChangePassword here. */

const MIN_PASSWORD_LENGTH = 8

/** Request a reset link. Flips to a confirmation state in place. */
export function ForgotPassword() {
  const { t } = usePreferences()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    // Sends unconditionally in production — confirming whether an address is
    // registered would leak account existence.
    if (email.trim()) setSent(true)
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <AuthCard
        logo
        title={sent ? t('Check your email') : t('Reset Password')}
        description={
          sent
            ? t('We sent a password reset link to your email address')
            : t("We'll send a reset link to your email")
        }
        footer={
          <Link
            to="/login"
            className="mt-4 block text-center font-action text-[13px] font-medium"
          >
            {t('Back to Sign In')}
          </Link>
        }
      >
        {sent ? null : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label={t('Email')} htmlFor="reset-email">
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full">
              {t('Send Reset Link')}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  )
}

/** Set a new password from a reset link. */
export function ResetPassword() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // The prototype silently did nothing when the two fields disagreed. Say why.
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const mismatch = confirm.length > 0 && password !== confirm

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (password.length < MIN_PASSWORD_LENGTH || password !== confirm) return
    toast.show({ title: t('Success'), description: t('Password updated') })
    setTimeout(() => navigate('/login', { replace: true }), 700)
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <AuthCard logo title={t('Create New Password')}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field
            label={t('New Password')}
            htmlFor="new-pw"
            hint={t('Must be at least 8 characters')}
          >
            <Input
              id="new-pw"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={submitted && tooShort}
              dir="ltr"
            />
          </Field>
          <Field label={t('Confirm Password')} htmlFor="confirm-pw">
            <Input
              id="confirm-pw"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              invalid={mismatch}
              dir="ltr"
            />
          </Field>
          {mismatch ? (
            <p role="alert" className="text-xs text-salis-orange">
              {t('Passwords do not match')}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full">
            {t('Reset Password')}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
