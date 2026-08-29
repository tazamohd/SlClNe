import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { ROLES } from '@/data/rbac'
import { authenticate, apiBaseUrl, demoPassword } from '@/data/auth'
import type { Role, RoleId } from '@/data/types'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Sign-in with the 14 demo role cards.
 *
 *  Clicking a card fills the credentials; the user still presses Sign In. That
 *  two-step is deliberate — it proves the real form works rather than
 *  side-stepping it, and it's what the role-filtering demo depends on.
 *
 *  `authenticate()` posts to `/auth/login` and stores the JWT when
 *  `VITE_API_BASE_URL` is set, or validates the demo role otherwise — the
 *  screen is the same either way. The demo password the cards prefill matches
 *  the active mode (the backend's seeded password vs the design's demo one). */

export function Login() {
  const { t, rtl } = usePreferences()
  const { signIn } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [picked, setPicked] = useState<RoleId | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const demoPw = demoPassword()

  function fillFrom(role: Role) {
    setEmail(role.demo.email)
    setPassword(demoPw)
    setPicked(role.id as RoleId)
    setShowPassword(false)
    toast.show(
      {
        title: t('Credentials filled'),
        description: `${role.demo.email} · ${rtl ? role.ar : role.label}`,
      },
      2600
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const normalized = email.trim().toLowerCase()

    if (!normalized || !password) {
      toast.show({ title: t('Error'), description: t('Please fill in all fields'), error: true })
      return
    }

    setSubmitting(true)
    try {
      const session = await authenticate(normalized, password)
      signIn(session)
      toast.show({
        title: t('Signed in'),
        description: `${rtl ? session.user.ar : session.user.name} · ${session.user.roleLabel}`,
      })
      // Brief pause so the confirmation is readable before the route changes.
      setTimeout(() => navigate(session.user.destination, { replace: true }), 700)
    } catch {
      toast.show({
        title: t('Sign in failed'),
        description: apiBaseUrl()
          ? t('Check your email and password and try again.')
          : t('Pick a demo role to fill valid credentials.'),
        error: true,
      })
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout className="mx-auto max-w-[880px]">
      <div
        className="grid items-start gap-4"
        style={{ gridTemplateColumns: isMobile ? '1fr' : 'minmax(340px,400px) 1fr' }}
      >
        {/* ── Credentials ─────────────────────────────────────────────── */}
        <div className="rounded-lg border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
          <div className="flex flex-col gap-4 p-6 pb-0">
            <div className="flex justify-center">
              <BrandMark />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-heading">{t('Sign In')}</h2>
              <p className="mt-2 font-action text-sm text-muted">
                {t('Enter your credentials to access your account')}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-action text-xs font-medium tracking-[.025em] text-heading"
              >
                {t('Email')}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Icon name="Mail" size={20} />}
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="pw"
                className="font-action text-xs font-medium tracking-[.025em] text-heading"
              >
                {t('Password')}
              </label>
              <Input
                id="pw"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Icon name="Lock" size={20} />}
                dir="ltr"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={t("Toggle password visibility")}
                    className="flex cursor-pointer border-none bg-transparent p-0 text-muted"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((v) => !v)}
                className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-action text-[13px] text-body"
              >
                <span
                  className={cn(
                    'inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] transition-all duration-150',
                    remember
                      ? 'border-none bg-salis-gradient text-white'
                      : 'border-[1.5px] border-border-strong bg-inset text-transparent'
                  )}
                >
                  <Icon name="Check" size={12} strokeWidth={3} />
                </span>
                <span>{t('Remember this device')}</span>
              </button>
              <Link
                to="/forgot-password"
                className="font-action text-[13px] font-medium"
              >
                {t('Forgot password?')}
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full">
              {t('Sign In')}
            </Button>

            <p className="text-center font-action text-sm text-muted">
              {t("Don't have an account?")}{' '}
              <Link to="/register" className="font-semibold">
                {t('Register')}
              </Link>
            </p>
          </form>
        </div>

        {/* ── Demo roles ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[13px] rounded-lg border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] p-5 shadow-lg backdrop-blur-[24px]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex rounded bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue">
                <Icon name="Users" size={14} />
              </span>
              <p className="font-display text-sm font-bold text-heading">
                {t('Quick access — pick a role')}
              </p>
            </div>
            <p className="mt-[7px] text-pretty text-xs leading-[1.55] text-muted">
              {t(
                'Click any role to fill the email and password above, then press Sign In. Each role carries its own permissions, data scope and approval limit.'
              )}
            </p>
          </div>

          <div className="grid max-h-[428px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[7px] overflow-y-auto pe-0.5">
            {(ROLES as readonly Role[]).map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={picked === role.id}
                onSelect={() => fillFrom(role)}
              />
            ))}
          </div>

          <p className="flex gap-[7px] border-t border-border pt-[11px] text-[11.5px] leading-[1.5] text-muted">
            <Icon name="Info" size={13} className="mt-px flex-shrink-0 text-salis-blue" />
            <span>
              {t('Demo accounts only · shared password')}: {demoPw} ·{' '}
              {t('approval limits in SAR')}
            </span>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: Role
  selected: boolean
  onSelect: () => void
}) {
  const { t, rtl } = usePreferences()

  // Approval ceiling: unlimited, none, or thousands of SAR.
  const limit =
    role.limit === null ? t('Full') : role.limit === 0 ? '—' : `${role.limit / 1000}k`

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative flex min-h-[52px] w-full cursor-pointer items-center gap-[9px] rounded-[10px] border px-[11px] py-[9px] text-start',
        'transition-all duration-150 hover:-translate-y-px hover:border-[rgba(10,94,215,.4)] hover:shadow-lg',
        selected
          ? 'border-salis-blue bg-[#EFF4FD] shadow-[0_0_0_3px_#D7E5FA] dark:bg-[#10233D] dark:shadow-[0_0_0_3px_#173963]'
          : 'border-border bg-card'
      )}
    >
      <span
        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded"
        style={
          selected
            ? { background: 'var(--salis-gradient)', color: '#fff' }
            : { background: 'rgba(10,94,215,.09)', color: role.color }
        }
      >
        <Icon name={role.icon} size={15} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="block truncate text-[12.5px] font-semibold leading-[1.25] text-heading">
          {rtl ? role.ar : role.label}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-[11px] leading-[1.3] text-muted">
            {rtl ? role.demo.ar : role.demo.name}
          </span>
          <span
            className={cn(
              'flex-shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
              role.limit === null
                ? 'bg-salis-gradient text-white'
                : role.limit === 0
                  ? 'bg-inset text-muted'
                  : 'bg-[rgba(10,94,215,.1)] text-salis-blue'
            )}
          >
            {limit}
          </span>
        </span>
      </span>

      {selected ? (
        <span className="absolute top-[5px] flex h-4 w-4 items-center justify-center rounded-full bg-salis-blue text-white end-[5px]">
          <Icon name="Check" size={11} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  )
}
