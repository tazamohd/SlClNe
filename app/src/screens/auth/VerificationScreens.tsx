import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard } from '@/components/shell/AuthCard'
import { CodeInput } from '@/components/ui/CodeInput'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { API_URL } from '@/data/repository'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'

const CODE_LENGTH = 6
/** Resend throttle from README §6b — the server enforces the same 60 seconds
 *  and answers 429 with a `retry-after`; this is the client half of it. */
const RESEND_SECONDS = 60

/** Where the flow that sent the code says it went — a phone number or an email
 *  address, carried in router state so this screen never has to invent one. */
function destinationFrom(state: unknown): string | null {
  if (state && typeof state === 'object' && 'destination' in state) {
    const value = (state as { destination?: unknown }).destination
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

function maskDestination(destination: string | null): string {
  if (!destination) return '—'
  if (destination.includes('@')) {
    const [name, domain] = destination.split('@')
    return `${(name ?? '').slice(0, 2)}•••@${domain ?? ''}`
  }
  return `${destination.slice(0, 5)} •••• ${destination.slice(-3)}`
}

/** A locally-issued code for the fixture build.
 *
 *  With no API there is nothing to verify a code against, and accepting any six
 *  digits would be a screen that reports success it did not check. So the demo
 *  issues its own code, shows it under a label saying exactly what it is, and
 *  verifies against that one. The check is real; only the delivery is local. */
function issueLocalCode(): string {
  const random = new Uint32Array(1)
  crypto.getRandomValues(random)
  return String((random[0] as number) % 10 ** CODE_LENGTH).padStart(CODE_LENGTH, '0')
}

/** SMS one-time code, sent during customer self-signup. */
export function OTPVerification() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { live } = useSession()
  const isMobile = useIsMobile()

  const destination = destinationFrom(location.state)
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const [busy, setBusy] = useState(false)
  const [localCode, setLocalCode] = useState(() => (live ? null : issueLocalCode()))

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const verify = useCallback(async () => {
    const entered = code.replace(/\s/g, '')
    if (entered.length < CODE_LENGTH) {
      toast.show({ title: t('Error'), description: t('Enter the 6-digit code'), error: true })
      return
    }

    if (!live) {
      if (entered !== localCode) {
        toast.show({ title: t('Error'), description: t('That code is not correct.'), error: true })
        return
      }
      navigate('/dashboard', { replace: true })
      return
    }

    if (!destination) {
      /* Reaching this screen without knowing where the code went means the
       * flow that sent it did not pass it on. Saying so beats verifying
       * against nothing and reporting success. */
      toast.show({
        title: t('Error'),
        description: t('This link is missing the number the code was sent to. Request a new code.'),
        error: true,
      })
      return
    }

    setBusy(true)
    let ok = false
    let message = t('That code is not correct.')
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ destination, otp: entered }),
      })
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string }
      } | null
      ok = response.ok
      if (!ok) message = body?.error?.message ?? message
    } catch {
      message = t('The server could not be reached.')
    }
    setBusy(false)

    if (!ok) {
      toast.show({ title: t('Error'), description: message, error: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }, [code, destination, live, localCode, navigate, t, toast])

  const resend = useCallback(async () => {
    setCooldown(RESEND_SECONDS)
    if (!live) {
      const next = issueLocalCode()
      setLocalCode(next)
      toast.show({ title: t('Resend Code'), description: `${t('Development code')}: ${next}` })
      return
    }
    if (!destination) {
      toast.show({
        title: t('Error'),
        description: t('This link is missing the number the code was sent to. Request a new code.'),
        error: true,
      })
      return
    }
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/request-otp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ channel: destination.includes('@') ? 'email' : 'sms', destination }),
    }).catch(() => null)
    if (!response || !response.ok) {
      const seconds = Number(response?.headers.get('retry-after') ?? RESEND_SECONDS)
      toast.show({
        title: t('Resend Code'),
        description: `${t('Another code can be requested in')} ${seconds}s`,
        error: true,
      })
      return
    }
    toast.show({ title: t('Resend Code'), description: t('A new code is on its way.') })
  }, [destination, live, t, toast])

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <AuthCard
        center
        icon="MessageSquareText"
        title={t('OTP Verification')}
        description={
          <>
            {t('Enter the 6-digit code sent to')}{' '}
            {/* Saudi numbers are Latin digits inside Arabic copy — pinned LTR
                so the country code doesn't jump to the wrong end. */}
            <span className="font-semibold text-heading" dir="ltr">
              {destination ? maskDestination(destination) : '+966 55 •••• 471'}
            </span>
          </>
        }
        className={isMobile ? 'p-4' : undefined}
      >
        <CodeInput value={code} onChange={setCode} length={CODE_LENGTH} autoFocus />
        <Button size="lg" className="w-full" onClick={() => void verify()} disabled={busy}>
          {busy ? t('Verifying…') : t('Verify')}
        </Button>

        {localCode ? (
          /* Labelled, not hidden. This build has no messaging provider, so the
             code was issued here and delivered nowhere — and the screen says
             so rather than implying an SMS arrived. */
          <p className="mt-3 rounded border border-border bg-inset px-3 py-2 text-[12px] text-muted">
            {t('No messaging provider is configured in this build. Code issued locally')}:{' '}
            <span className="font-mono font-bold text-heading" dir="ltr">
              {localCode}
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-[13px] text-muted">
          {t("Didn't receive a code?")}{' '}
          {/* Throttled rather than a live link that could be hammered. */}
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => void resend()}
            className={cn(
              'border-none bg-transparent p-0 font-semibold',
              cooldown > 0 ? 'cursor-not-allowed text-faint' : 'cursor-pointer text-salis-blue'
            )}
          >
            {cooldown > 0 ? `${t('Resend Code')} (${cooldown}s)` : t('Resend Code')}
          </button>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}

/** Authenticator-app code, for accounts with 2FA enabled.
 *
 *  TOTP has no server-side enrolment store and no adapter: `POST /auth/2fa/*`
 *  answers 503 naming what is missing. So against a live API this screen says
 *  the factor is unavailable instead of accepting a code nothing could check,
 *  and in the fixture build it verifies against a locally-issued code the same
 *  way `OTPVerification` does. */
export function TwoFactorVerification() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const { live } = useSession()
  const isMobile = useIsMobile()
  const [code, setCode] = useState('')
  const [localCode, setLocalCode] = useState(() => (live ? null : issueLocalCode()))

  function verify() {
    const entered = code.replace(/\s/g, '')
    if (entered.length < CODE_LENGTH) {
      toast.show({ title: t('Error'), description: t('Enter the 6-digit code'), error: true })
      return
    }
    if (live) {
      toast.show({
        title: t('Two-Factor Verification'),
        description: t(
          'Two-factor sign-in is not available on this deployment: no authenticator has been enrolled.'
        ),
        error: true,
      })
      return
    }
    if (entered !== localCode) {
      toast.show({ title: t('Error'), description: t('That code is not correct.'), error: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <AuthCard
        center
        icon="ShieldCheck"
        title={t('Two-Factor Verification')}
        description={t('Enter the code from your authenticator app')}
        className={isMobile ? 'p-4' : undefined}
      >
        <CodeInput value={code} onChange={setCode} length={CODE_LENGTH} autoFocus />
        <Button size="lg" className="w-full" onClick={verify}>
          {t('Verify')}
        </Button>
        {localCode ? (
          <p className="mt-3 rounded border border-border bg-inset px-3 py-2 text-[12px] text-muted">
            {t('No authenticator is enrolled in this build. Code issued locally')}:{' '}
            <span className="font-mono font-bold text-heading" dir="ltr">
              {localCode}
            </span>{' '}
            <button
              type="button"
              onClick={() => setLocalCode(issueLocalCode())}
              className="cursor-pointer border-none bg-transparent p-0 font-semibold text-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {t('Refresh')}
            </button>
          </p>
        ) : null}
        <p className="mt-3.5 text-xs text-faint">
          {rtl ? 'يتم تحديث الرمز كل 30 ثانية' : 'Code refreshes every 30 seconds'}
        </p>
      </AuthCard>
    </AuthLayout>
  )
}

/** Device PIN entry with an on-screen keypad. */
export function CreatePIN() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [pin, setPin] = useState('')

  // Four digits in and the PIN is set — advance to biometric enrolment.
  useEffect(() => {
    if (pin.length < 4) return
    const timer = setTimeout(() => navigate('/biometric-setup'), 300)
    return () => clearTimeout(timer)
  }, [pin, navigate])

  const press = (key: string) => {
    if (key === '⌫') setPin((p) => p.slice(0, -1))
    else if (key) setPin((p) => (p.length < 4 ? p + key : p))
  }

  return (
    <AuthLayout controls={false} className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[340px]'}>
      <div className="flex flex-col items-center gap-5">
        <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('Create PIN')}</h2>

        <div className="flex gap-3" dir="ltr" role="status" aria-label={`${pin.length} of 4 digits entered`}>
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className={cn(
                'h-4 w-4 rounded-full border border-border',
                i < pin.length ? 'bg-salis-gradient' : 'bg-inset'
              )}
            />
          ))}
        </div>

        <div className={`grid gap-3 ${isMobile ? 'grid-cols-[repeat(3,56px)]' : 'grid-cols-[repeat(3,64px)]'}`}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, index) =>
            key ? (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                aria-label={key === '⌫' ? 'Delete' : key}
                className={`cursor-pointer rounded-full border border-border bg-card font-display font-bold text-heading transition-colors duration-150 hover:bg-inset ${isMobile ? 'h-14 w-14 text-lg' : 'h-16 w-16 text-xl'} focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2`}
              >
                {key}
              </button>
            ) : (
              <span key={`gap-${index}`} />
            )
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

/** Optional biometric enrolment. Skippable — the design offers both paths. */
export function BiometricSetup() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <AuthLayout controls={false} className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[360px]'}>
      <div className={`flex flex-col items-center text-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
        <span className={`inline-flex animate-pulse motion-reduce:animate-none rounded-full bg-tint-blue text-salis-blue ${isMobile ? 'p-4' : 'p-[22px]'}`}>
          <Icon name="Fingerprint" size={isMobile ? 32 : 40} />
        </span>
        <h1 className={`font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('Biometric Setup')}</h1>
        <p className="font-action text-sm text-muted">
          {t('Use your fingerprint or face to sign in faster')}
        </p>
        <Link
          to="/dashboard"
          className="mt-2 box-border inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          {t('Continue')}
        </Link>
        <Link
          to="/dashboard"
          className="whitespace-nowrap font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          {t('Skip for now')}
        </Link>
      </div>
    </AuthLayout>
  )
}
