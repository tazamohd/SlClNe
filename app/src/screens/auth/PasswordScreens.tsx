import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard, Field } from '@/components/shell/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { API_URL } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Password recovery. Both screens share the same bordered-card shape.
 *
 *  Changing a password while signed in is not a separate screen in the design
 *  — Profile carries it inline — so there is no ChangePassword here.
 *
 *  With an API configured these post to `POST /auth/forgot-password` and
 *  `POST /auth/reset-password`. Without one they say plainly that nothing was
 *  sent, rather than showing "Check your email" for a mail nobody sent and
 *  "Password updated" for a password nobody changed. */

/** Matches the server's `MIN_PASSWORD_LENGTH`. A client that accepted eight
 *  would send the user a rejection they had no way to anticipate. */
const MIN_PASSWORD_LENGTH = 12

async function postAuth(path: string, body: unknown): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = (await response.json().catch(() => null)) as {
      message?: string
      error?: { message?: string }
    } | null
    return {
      ok: response.ok,
      message: response.ok
        ? (payload?.message ?? '')
        : (payload?.error?.message ?? 'That request could not be completed.'),
    }
  } catch {
    return { ok: false, message: 'The server could not be reached.' }
  }
}

/** Request a reset link. Flips to a confirmation state in place. */
export function ForgotPassword() {
  const { t } = usePreferences()
  const { live } = useSession()
  const isMobile = useIsMobile()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    if (!live) {
      /* No API, so no mail. Saying "check your email" here would be a
       * confirmation of something that did not happen. */
      setProblem(
        t('This build has no API configured, so no email was sent. Recovery needs the server.')
      )
      return
    }
    setBusy(true)
    const result = await postAuth('/forgot-password', { email: email.trim() })
    setBusy(false)
    if (!result.ok) {
      setProblem(result.message)
      return
    }
    /* The server answers identically whether or not the address exists, so this
     * confirmation discloses nothing. */
    setProblem(null)
    setSent(true)
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
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
        className={isMobile ? 'p-4' : undefined}
      >
        {sent ? null : (
          <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
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
            {problem ? (
              <p role="alert" className="text-xs text-salis-orange">
                {problem}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? t('Sending…') : t('Send Reset Link')}
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
  const { live } = useSession()
  const isMobile = useIsMobile()
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  /** The recovery token from the emailed link. */
  const recoveryToken = params.get('token') ?? ''

  // The prototype silently did nothing when the two fields disagreed. Say why.
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const mismatch = confirm.length > 0 && password !== confirm

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setProblem(null)
    if (password.length < MIN_PASSWORD_LENGTH || password !== confirm) return

    if (!live) {
      /* Nothing to change a password on. The prototype toasted "Password
       * updated" here, which is a success message for work that did not
       * happen. */
      setProblem(
        t('This build has no API configured, so no password was changed. Recovery needs the server.')
      )
      return
    }
    if (!recoveryToken) {
      setProblem(t('This link is missing its recovery token. Request a new reset link.'))
      return
    }

    setBusy(true)
    const result = await postAuth('/reset-password', { token: recoveryToken, password })
    setBusy(false)
    if (!result.ok) {
      setProblem(result.message)
      return
    }
    toast.show({
      title: t('Success'),
      /* The server revokes every session on a reset, so the next step really is
       * signing in again — the message is describing what happened, not
       * decorating it. */
      description: t('Password updated. Every device has been signed out.'),
    })
    setTimeout(() => navigate('/login', { replace: true }), 700)
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <AuthCard logo title={t('Create New Password')} className={isMobile ? 'p-4' : undefined}>
        <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
          <Field
            label={t('New Password')}
            htmlFor="new-pw"
            hint={`${t('Must be at least')} ${MIN_PASSWORD_LENGTH} ${t('characters')}`}
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
          {submitted && tooShort ? (
            <p role="alert" className="text-xs text-salis-orange">
              {`${t('Must be at least')} ${MIN_PASSWORD_LENGTH} ${t('characters')}`}
            </p>
          ) : null}
          {problem ? (
            <p role="alert" className="text-xs text-salis-orange">
              {problem}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? t('Saving…') : t('Reset Password')}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
