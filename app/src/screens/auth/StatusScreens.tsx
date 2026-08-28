import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** The four terminal-state screens: 403, session timeout, lockout, and the
 *  logout confirmation. They share a centred-card shape, so they live together
 *  rather than in four near-identical files. */

function StatusFrame({
  children,
  orbs,
  isMobile,
}: {
  children: React.ReactNode
  /** Each screen has its own backdrop tint. */
  orbs: React.ReactNode
  isMobile: boolean
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page font-ui">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {orbs}
      </div>
      <div className={`relative z-[1] flex animate-fade-up flex-col items-center text-center ${isMobile ? 'max-w-full gap-4 p-3' : 'max-w-[440px] gap-6 p-4'}`}>
        {children}
      </div>
    </div>
  )
}

/** 403 — signed in, but this role can't open the screen.
 *  Names the role you're actually holding, so the fix is obvious: switch
 *  account, or ask an admin for the module. */
export function Unauthorized() {
  const { t } = usePreferences()
  const { roleLabel } = useSession()
  const isMobile = useIsMobile()

  return (
    <StatusFrame
      isMobile={isMobile}
      orbs={
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.06),transparent_65%)] blur-[64px]" />
      }
    >
      {/* Three stacked, slightly rotated tiles — the design's layered shield. */}
      <div className={`relative ${isMobile ? 'h-[90px] w-[90px]' : 'h-[120px] w-[120px]'}`}>
        <div className="absolute inset-2.5 -rotate-6 rounded-[20px] bg-salis-blue/[.06]" />
        <div className="absolute inset-[5px] rotate-3 rounded-[20px] bg-tint-blue" />
        <div className="absolute inset-0 flex items-center justify-center rounded-[20px] border border-border bg-card shadow-lg">
          <div className="flex flex-col items-center gap-1">
            <Icon name="ShieldOff" size={isMobile ? 24 : 32} className="text-salis-blue" />
            <span className={`bg-salis-gradient-r bg-clip-text font-display font-black text-transparent ${isMobile ? 'text-xl' : 'text-[28px]'}`}>
              403
            </span>
          </div>
        </div>
      </div>

      <div>
        <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('Unauthorized')}</h1>
        <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
          {t("You don't have permission to access this page.")}
        </p>
      </div>

      <div className={`box-border flex w-full items-center gap-3 rounded-lg border border-border bg-card ${isMobile ? 'p-3' : 'p-4'}`}>
        <span className="flex rounded-[10px] bg-tint-blue p-2.5 text-salis-blue">
          <Icon name="Shield" size={isMobile ? 16 : 18} />
        </span>
        <div className="flex-1 text-start">
          <p className="text-[13px] font-semibold text-heading">{t('Required: Admin Role')}</p>
          <p className="mt-0.5 text-xs text-muted">
            {t('Your role')}: {roleLabel}
          </p>
        </div>
        <span className="rounded-full bg-tint-orange px-2.5 py-1 text-[11px] font-semibold text-salis-orange">
          {t('Denied')}
        </span>
      </div>

      <div className={`flex w-full gap-2.5 ${isMobile ? 'flex-col' : ''}`}>
        <Link
          to="/dashboard"
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded bg-salis-gradient font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
        >
          <Icon name="Home" size={16} />
          {t('Go to Dashboard')}
        </Link>
        <Link
          to="/login"
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded border-[1.5px] border-border-strong bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
        >
          <Icon name="LogIn" size={16} />
          {t('Switch Account')}
        </Link>
      </div>
    </StatusFrame>
  )
}

/** Session timeout. Shows when it lapsed so the user can tell an idle timeout
 *  from a server-side revocation. */
export function SessionExpired() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const [at] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })

  return (
    <StatusFrame
      isMobile={isMobile}
      orbs={
        <div className="absolute start-0 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.08),transparent_65%)] blur-[64px]" />
      }
    >
      <span className={`relative inline-flex items-center justify-center ${isMobile ? 'h-[60px] w-[60px]' : 'h-[76px] w-[76px]'}`}>
        <svg width={isMobile ? 60 : 76} height={isMobile ? 60 : 76} className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx={isMobile ? 30 : 38} cy={isMobile ? 30 : 38} r={isMobile ? 25 : 32} fill="none" stroke="rgba(11,179,255,.15)" strokeWidth="4" />
          <circle
            cx={isMobile ? 30 : 38}
            cy={isMobile ? 30 : 38}
            r={isMobile ? 25 : 32}
            fill="none"
            stroke="var(--salis-blue-bright)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={isMobile ? '157' : '201'}
            strokeDashoffset={isMobile ? '47' : '60'}
          />
        </svg>
        <Icon name="TimerOff" size={isMobile ? 22 : 28} className="text-salis-bright" />
      </span>
      <h1 className={`font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
        {t('Session Expired')}
      </h1>
      <p className="font-action text-sm text-muted">
        {t('Your session has expired. Please sign in again.')}
      </p>
      <p className="font-mono text-[11px] text-faint" dir="ltr">
        {rtl ? 'انتهت الجلسة الساعة ' : 'Timed out at '}
        {at}
      </p>
      <Link
        to="/login"
        className={`mt-2 inline-flex items-center justify-center whitespace-nowrap rounded bg-salis-gradient font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline ${isMobile ? 'h-10 px-5' : 'h-11 px-6'}`}
      >
        {t('Sign In')}
      </Link>
    </StatusFrame>
  )
}

/** Lockout after repeated failed sign-ins. The countdown is live — a static
 *  "15:00" would keep claiming 15 minutes no matter how long you waited. */
export function AccountLocked() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60
  ).padStart(2, '0')}`

  return (
    <StatusFrame
      isMobile={isMobile}
      orbs={
        <>
          <div className="absolute -bottom-[100px] -end-[100px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,.08),transparent_65%)] blur-[64px]" />
          <div className="absolute -start-[100px] -top-[100px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.06),transparent_65%)] blur-[64px]" />
        </>
      }
    >
      <div className={`relative flex items-center justify-center rounded-[24px] border-2 border-salis-orange/[.15] bg-salis-orange/[.08] ${isMobile ? 'h-20 w-20' : 'h-24 w-24'}`}>
        <Icon name="Lock" size={isMobile ? 28 : 36} className="text-salis-orange" />
        <div className="absolute -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-salis-orange text-xs font-extrabold text-white shadow-[0_2px_8px_rgba(249,115,22,.4)] -end-1.5">
          !
        </div>
      </div>

      <div>
        <h1 className={`font-display font-black text-heading ${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('Account Locked')}</h1>
        <p className="mt-2 font-action text-sm leading-[1.5] text-muted">
          {t('Your account has been locked for security reasons.')}
        </p>
      </div>

      <div className={`box-border flex w-full flex-col gap-2.5 rounded-lg border border-border bg-card ${isMobile ? 'p-3' : 'p-4'}`}>
        <Row label={t('Reference')}>
          <span className="font-mono font-semibold text-heading" dir="ltr">
            LK-2026-4471
          </span>
        </Row>
        <Divider />
        <Row label={t('Failed attempts')}>
          <span className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-salis-orange" />
            ))}
          </span>
        </Row>
        <Divider />
        <Row label={t('Unlocks in')}>
          <span className="font-mono font-bold text-salis-orange" dir="ltr">
            {countdown}
          </span>
        </Row>
      </div>

      <div className={`flex w-full gap-2.5 ${isMobile ? 'flex-col' : ''}`}>
        <Link
          to="/login"
          className="inline-flex h-12 flex-1 items-center justify-center rounded border-[1.5px] border-border-strong bg-transparent font-action text-sm font-medium text-body no-underline hover:no-underline"
        >
          {t('Back to Sign In')}
        </Link>
        <Link
          to="/support"
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded border-none bg-salis-orange font-action text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(249,115,22,.3)] hover:text-white hover:no-underline"
        >
          <Icon name="Headphones" size={16} />
          {t('Contact Support')}
        </Link>
      </div>
    </StatusFrame>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-border" />
}

/** Logout confirmation, shown over a navy scrim.
 *
 *  Reachable now: in the prototypes every sidebar Logout linked straight to
 *  Login and this screen was orphaned. */
export function LogoutConfirmation() {
  const { t } = usePreferences()
  const { signOut } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  function confirm() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-salis-navy/[.5] font-ui">
      <div className={`w-full animate-fade-up ${isMobile ? 'max-w-full px-3' : 'max-w-[360px] p-4'}`}>
        <div className={`rounded-lg border border-border bg-card text-center shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
          <span className="mb-3.5 inline-flex rounded-full bg-tint-orange p-3.5 text-salis-orange">
            <Icon name="LogOut" size={isMobile ? 20 : 24} />
          </span>
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-base' : 'text-lg'}`}>{t('Confirm Logout')}</h2>
          <p className="mb-5 mt-2 font-action text-sm text-muted">
            {t('Are you sure you want to log out?')}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded border border-border bg-transparent font-action text-sm font-medium text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={confirm}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded border-none bg-salis-orange font-action text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
            >
              {t('Logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
