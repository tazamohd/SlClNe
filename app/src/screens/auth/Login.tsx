import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Form, FormErrorSummary, useZodForm } from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { ROLES, destinationFor } from '@/data/rbac'
import type { Role, RoleId } from '@/data/types'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { AuthFormField } from './AuthFormField'
import { emailFromState, storedRegion } from './firstRun'

/** Sign-in — the last step of the first-run chain.
 *
 *  Two paths through the same form, chosen by whether this build has an API:
 *
 *  - **Live** (`VITE_API_URL` set): the credentials go to `POST /auth/login`,
 *    which decides. The role arrives in a signed token; nothing on this screen
 *    picks one. The demo cards are hidden, because a card that filled a
 *    password no server holds would only be a way to fail.
 *  - **Demo** (every build until the API is deployed): the design's role
 *    picker, folded into a disclosure under the form. Clicking a card fills
 *    the credentials and the user still presses Sign In — the two-step is
 *    deliberate, it exercises the real form rather than side-stepping it.
 *
 *  Validation is inline: a field says what is wrong when it is left, and a
 *  refused submit puts a summary above the form. The prototype's toast-only
 *  errors vanished before a screen reader finished announcing them.
 *
 *  The demo password is a fixture, not a credential: no server accepts it, and
 *  the seed deliberately ships no password hashes at all. */
const DEMO_PASSWORD = 'Demo@1234'

/** The demo panel opens by itself where there is room beside the form. */
const DESKTOP_QUERY = '(min-width: 1024px)'

export const loginEmailRule = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .email('Please enter a valid email address.')
export const loginPasswordRule = z.string().min(1, 'Please enter your password.')

interface LoginValues extends Record<string, unknown> {
  email: string
  password: string
  remember: boolean
}

/** Built per render language so the form-level message — which the summary
 *  shows verbatim — is already in the user's words. */
function buildLoginSchema(t: (source: string) => string) {
  return z
    .object({ email: loginEmailRule, password: loginPasswordRule, remember: z.boolean() })
    .superRefine((values, ctx) => {
      if (!values.email && !values.password) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('Please fill in all fields') })
      }
    })
}

export function Login() {
  const { t, rtl, language } = usePreferences()
  const { signIn, signInWithPassword, live } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const panelId = useId()

  const [picked, setPicked] = useState<RoleId | null>(null)
  const [demoOpen, setDemoOpen] = useState(isDesktop)
  useEffect(() => setDemoOpen(isDesktop), [isDesktop])

  const schema = useMemo(() => buildLoginSchema(t), [t])
  const form = useZodForm<LoginValues, z.output<typeof schema>>({
    schema,
    initial: { email: emailFromState(location.state) ?? '', password: '', remember: true },
    onSubmit: async (values) => {
      const normalized = values.email.toLowerCase()

      if (live) {
        const result = await signInWithPassword(normalized, values.password)
        if (!result.ok) throw new Error(result.message)
        /* Where they land follows from the role the server returned, never
         * from anything typed into this form. */
        navigate(destinationFor(result.role), { replace: true })
        return
      }

      const role = (ROLES as readonly Role[]).find((r) => r.demo.email === normalized)
      if (!role || values.password !== DEMO_PASSWORD) {
        throw new Error(t('Pick a demo role to fill valid credentials.'))
      }

      signIn(role.id as RoleId)
      toast.show({
        title: t('Signed in'),
        description: `${rtl ? role.demo.ar : role.demo.name} · ${rtl ? role.ar : role.label}`,
      })
      // Brief pause so the confirmation is readable before the route changes;
      // the button stays busy for it, so a second press cannot land.
      await new Promise((resolve) => setTimeout(resolve, 700))
      navigate(destinationFor(role.id), { replace: true })
    },
  })

  function fillFrom(role: Role) {
    form.setValue('email', role.demo.email)
    form.setValue('password', DEMO_PASSWORD)
    setPicked(role.id as RoleId)
    toast.show(
      {
        title: t('Credentials filled'),
        description: `${role.demo.email} · ${rtl ? role.ar : role.label}`,
      },
      2600
    )
  }

  const region = storedRegion()
  const remember = form.values.remember

  return (
    <AuthLayout step={{ index: 4, of: 4, back: '/region-selection' }} className="mx-auto max-w-[960px]">
      <div
        className={cn(
          'grid items-start gap-4',
          live ? 'justify-items-center' : 'lg:grid-cols-[minmax(0,440px)_1fr]'
        )}
      >
        {/* ── Credentials ─────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-[440px] rounded-lg border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px] lg:mx-0">
          <div className="flex flex-col items-center gap-4 p-6 pb-0">
            <BrandMark width={150} />
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-heading">{t('Sign In')}</h2>
              <p className="mt-2 font-action text-sm text-muted">
                {t('Enter your credentials to access your account')}
              </p>
            </div>
            {/* What the first three steps chose, with one way back to change it. */}
            <p className="inline-flex min-h-[36px] flex-wrap items-center justify-center gap-x-2 rounded-full border border-border bg-inset px-3 text-xs text-muted">
              <Icon name="Globe" size={13} className="text-salis-blue" />
              <span className="font-medium text-heading">
                {language === 'ar' ? t('Arabic') : t('English')} · {t(region)}
              </span>
              <Link
                to="/region-selection"
                className="inline-flex min-h-[36px] items-center font-semibold"
              >
                {t('Change')}
              </Link>
            </p>
          </div>

          <Form form={form} className="gap-4 p-6">
            <FormErrorSummary />

            <AuthFormField
              form={form}
              name="email"
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              icon={<Icon name="Mail" size={20} />}
              ltr
              rule={loginEmailRule}
            />

            <AuthFormField
              form={form}
              name="password"
              label="Password"
              id="pw"
              password="current-password"
              placeholder="••••••••"
              icon={<Icon name="Lock" size={20} />}
              rule={loginPasswordRule}
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => form.setValue('remember', !remember)}
                className="flex min-h-[44px] cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-action text-[13px] text-body focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
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
                className="inline-flex min-h-[44px] items-center font-action text-[13px] font-medium"
              >
                {t('Forgot password?')}
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={form.pending}
              loadingLabel="Signing in…"
            >
              {t('Sign In')}
            </Button>

            <p className="text-center font-action text-sm text-muted">
              {t("Don't have an account?")}{' '}
              <Link to="/register" className="inline-flex min-h-[44px] items-center font-semibold">
                {t('Register')}
              </Link>
            </p>
          </Form>
        </div>

        {/* ── Demo roles ──────────────────────────────────────────────────
            Hidden once an API is configured: against a real server these cards
            would fill a password nobody holds, and offering a role picker
            beside a real sign-in form invites the reading that picking a role
            grants it. It does not — the server decides — but the screen should
            not suggest otherwise. */}
        {live ? null : (
          <section className="w-full rounded-lg border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] shadow-lg backdrop-blur-[24px]">
            <button
              type="button"
              aria-expanded={demoOpen}
              aria-controls={panelId}
              onClick={() => setDemoOpen((open) => !open)}
              className="flex min-h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-5 py-3 text-start transition-colors duration-150 hover:bg-tint-blue/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-salis-blue"
            >
              <span className="flex rounded bg-tint-blue p-1.5 text-salis-blue">
                <Icon name="Users" size={14} />
              </span>
              <span className="flex-1 font-display text-sm font-bold text-heading">
                {t('Explore with a demo role')}
              </span>
              <Icon
                name={demoOpen ? 'ChevronUp' : 'ChevronDown'}
                size={16}
                className="text-muted"
              />
            </button>

            <div id={panelId} hidden={!demoOpen} className="flex flex-col gap-[13px] border-t border-border p-5">
              <div>
                <p className="font-action text-[13px] font-semibold text-heading">
                  {t('Quick access — pick a role')}
                </p>
                <p className="mt-1 text-pretty text-xs leading-[1.55] text-muted">
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
                  {t('Demo accounts only · shared password')}:{' '}
                  <span className="font-mono" dir="ltr">
                    {DEMO_PASSWORD}
                  </span>{' '}
                  · {t('approval limits in SAR')}
                </span>
              </p>
            </div>
          </section>
        )}
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
        'transition-all duration-150 hover:-translate-y-px hover:border-salis-blue/[.4] hover:shadow-lg',
        selected
          ? 'border-salis-blue bg-salis-blue/5 shadow-[0_0_0_3px_var(--ring-light)] dark:bg-salis-navy dark:shadow-[0_0_0_3px_var(--ring-dark)]'
          : 'border-border bg-card focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
      )}
    >
      <span
        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded"
        style={
          selected
            ? { background: 'var(--salis-gradient)', color: 'white' }
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
              'flex-shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold',
              role.limit === null
                ? 'bg-salis-gradient text-white'
                : role.limit === 0
                  ? 'bg-inset text-muted'
                  : 'bg-tint-blue text-salis-blue'
            )}
            dir="ltr"
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
