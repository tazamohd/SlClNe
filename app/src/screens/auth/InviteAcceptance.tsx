import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { API_URL, isLive } from '@/data/repository'

/** The server's `MIN_PASSWORD_LENGTH` (`server/src/auth/password.ts`). */
const MIN_PASSWORD_LENGTH = 12

interface InvitePreview {
  name: string
  email: string
}

async function fetchInvite(token: string): Promise<InvitePreview | null> {
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/invite/${encodeURIComponent(token)}`, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) return null
  return (await response.json()) as InvitePreview
}

async function acceptInvite(token: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `${API_URL.replace(/\/$/, '')}/auth/invite/${encodeURIComponent(token)}/accept`,
    {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    },
  )
  const text = await response.text()
  const body = text ? (JSON.parse(text) as { error?: { message?: string }; message?: string }) : null
  if (!response.ok) {
    return { ok: false, message: body?.error?.message ?? 'That invite link is invalid or has expired.' }
  }
  return { ok: true }
}

/** Accept an invite to a staff account created by `POST /admin/staff` (Phase
 *  A). The token in the link is the whole of what authorizes this screen —
 *  there is no session yet, by design: setting the first password *is* how
 *  one gets created.
 *
 *  Reads `?token=` rather than a path segment because the route this screen
 *  answers on (`/invite-acceptance`) is generated from the design bundle
 *  (`app/src/data/generated/screens.ts`) with no dynamic segment; changing
 *  that is a design-bundle edit, not something this screen should carry. */
export function InviteAcceptance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [loading, setLoading] = useState(isLive && Boolean(token))
  const [invalid, setInvalid] = useState(!token)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!isLive || !token) return
    let cancelled = false
    fetchInvite(token)
      .then((result) => {
        if (cancelled) return
        if (!result) setInvalid(true)
        else setPreview(result)
      })
      .catch(() => {
        if (!cancelled) setInvalid(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!password) {
      setError(t('Please enter a password.'))
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`))
      return
    }
    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'))
      return
    }
    setError(null)
    setBusy(true)
    try {
      const result = await acceptInvite(token, password)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setAccepted(true)
      toast.show({ title: t('Your password has been set') })
    } catch {
      setError(t('The server could not be reached. Nothing was saved.'))
    } finally {
      setBusy(false)
    }
  }

  const cardClass = `rounded-2xl border border-border bg-card text-center shadow-lg ${isMobile ? 'p-4' : 'p-6'}`

  if (!isLive) {
    /* No server to validate a token against in a fixture build. Consistent
     * with every other action this build cannot perform. */
    return (
      <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
        <div className={cardClass}>
          <span className={`mx-auto mb-3.5 flex items-center justify-center rounded-full bg-salis-gradient font-bold text-white ${isMobile ? 'h-12 w-12 text-lg' : 'h-14 w-14 text-xl'}`}>
            <Icon name="UserPlus" size={isMobile ? 18 : 22} />
          </span>
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-base' : 'text-lg'}`}>
            {t('Invitation')}
          </h2>
          <p className="mt-2 mb-5 font-action text-sm text-muted">
            {t('Set VITE_API_URL to run against the API and accept a real invite.')}
          </p>
          <Link
            to="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded border border-border bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
          >
            {t('Back to Sign In')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (accepted) {
    return (
      <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
        <div className={cardClass}>
          <span className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-salis-gradient text-xl font-bold text-white">
            <Icon name="CheckCircle" size={22} />
          </span>
          <h2 className="font-display text-lg font-bold text-heading">{t('Password set')}</h2>
          <p className="mt-2 mb-5 font-action text-sm text-muted">
            {t('Sign in with your new password to continue.')}
          </p>
          <Button size="md" className="w-full" onClick={() => navigate('/login')}>
            {t('Go to Sign In')}
          </Button>
        </div>
      </AuthLayout>
    )
  }

  if (loading) {
    return (
      <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
        <div className={cardClass}>
          <p className="font-action text-sm text-muted">{t('Loading invitation...')}</p>
        </div>
      </AuthLayout>
    )
  }

  if (invalid || !preview) {
    return (
      <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
        <div className={cardClass}>
          <span className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-tint-orange text-salis-orange">
            <Icon name="AlertTriangle" size={22} />
          </span>
          <h2 className="font-display text-lg font-bold text-heading">{t('Invalid invitation')}</h2>
          <p className="mt-2 mb-5 font-action text-sm text-muted">
            {t('That invite link is invalid or has expired. Ask whoever invited you to send a new one.')}
          </p>
          <Link
            to="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded border border-border bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
          >
            {t('Back to Sign In')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <form className={cardClass} onSubmit={(e) => void submit(e)}>
        <span className={`mx-auto mb-3.5 flex items-center justify-center rounded-full bg-salis-gradient font-bold text-white ${isMobile ? 'h-12 w-12 text-lg' : 'h-14 w-14 text-xl'}`}>
          <Icon name="UserPlus" size={isMobile ? 18 : 22} />
        </span>

        <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-base' : 'text-lg'}`}>
          {t('Set your password')}
        </h2>
        <p className="mt-2 mb-5 font-action text-sm text-muted">
          {t("You've been invited as")}{' '}
          <span className="font-semibold text-heading">{preview.name}</span> ({preview.email})
        </p>

        <div className="flex flex-col gap-3 text-start">
          <Input
            type="password"
            inputSize="lg"
            placeholder={t('New password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label={t('New password')}
            autoComplete="new-password"
            required
          />
          <Input
            type="password"
            inputSize="lg"
            placeholder={t('Confirm password')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label={t('Confirm password')}
            autoComplete="new-password"
            required
          />
          {error ? <p className="text-xs text-salis-orange">{error}</p> : null}
        </div>

        <div className="mt-4 flex gap-2.5">
          <Link
            to="/login"
            className="inline-flex h-11 flex-1 items-center justify-center rounded border border-border bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
          >
            {t('Decline')}
          </Link>
          <Button type="submit" size="md" className="flex-1" disabled={busy}>
            {busy ? t('Setting...') : t('Accept Invite')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
