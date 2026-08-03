import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard } from '@/components/shell/AuthCard'
import { CodeInput } from '@/components/ui/CodeInput'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

const CODE_LENGTH = 6
/** Resend throttle from README §6b. */
const RESEND_SECONDS = 60

/** SMS one-time code, sent during customer self-signup. */
export function OTPVerification() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function verify() {
    if (code.replace(/\s/g, '').length < CODE_LENGTH) {
      toast.show({ title: t('Error'), description: t('Enter the 6-digit code'), error: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
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
              +966 55 •••• 471
            </span>
          </>
        }
      >
        <CodeInput value={code} onChange={setCode} length={CODE_LENGTH} autoFocus />
        <Button size="lg" className="w-full" onClick={verify}>
          {t('Verify')}
        </Button>
        <p className="mt-4 text-[13px] text-muted">
          {t("Didn't receive a code?")}{' '}
          {/* Throttled rather than a live link that could be hammered. */}
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => {
              setCooldown(RESEND_SECONDS)
              toast.show({ title: t('Resend Code'), description: t('A new code is on its way.') })
            }}
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

/** Authenticator-app code, for accounts with 2FA enabled. */
export function TwoFactorVerification() {
  const { t, rtl } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  function verify() {
    if (code.replace(/\s/g, '').length < CODE_LENGTH) {
      toast.show({ title: t('Error'), description: t('Enter the 6-digit code'), error: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <AuthCard
        center
        icon="ShieldCheck"
        title={t('Two-Factor Verification')}
        description={t('Enter the code from your authenticator app')}
      >
        <CodeInput value={code} onChange={setCode} length={CODE_LENGTH} autoFocus />
        <Button size="lg" className="w-full" onClick={verify}>
          {t('Verify')}
        </Button>
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
    <AuthLayout controls={false} className="mx-auto max-w-[340px]">
      <div className="flex flex-col items-center gap-5">
        <h2 className="font-display text-xl font-bold text-heading">{t('Create PIN')}</h2>

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

        <div className="grid grid-cols-[repeat(3,64px)] gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, index) =>
            key ? (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                aria-label={key === '⌫' ? 'Delete' : key}
                className="h-16 w-16 cursor-pointer rounded-full border border-border bg-card font-display text-xl font-bold text-heading transition-colors duration-150 hover:bg-inset"
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

  return (
    <AuthLayout controls={false} className="mx-auto max-w-[360px]">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex animate-pulse rounded-full bg-[rgba(10,94,215,.1)] p-[22px] text-salis-blue">
          <Icon name="Fingerprint" size={40} />
        </span>
        <h1 className="font-display text-xl font-extrabold text-heading">{t('Biometric Setup')}</h1>
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
