import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** One entry in the provider list — brand name stays raw Latin (dir="ltr"),
 *  everything else runs through t(). */
interface Provider {
  id: string
  icon: string
  name: string
  iconBg: string
  iconColor: string
}

const PROVIDERS: Provider[] = [
  { id: 'google', icon: 'Chrome', name: 'Google', iconBg: 'rgba(10,94,215,.08)', iconColor: 'var(--salis-blue)' },
  { id: 'apple', icon: 'Apple', name: 'Apple', iconBg: 'rgba(11,31,59,.08)', iconColor: 'var(--salis-navy)' },
  {
    id: 'microsoft',
    icon: 'Building2',
    name: 'Microsoft',
    iconBg: 'rgba(11,179,255,.08)',
    iconColor: 'var(--salis-blue-bright)',
  },
]

/** Provider picker in the sign-in chain — Google/Apple/Microsoft, then a
 *  fallback to the email form or enterprise SSO. A public auth-chain screen:
 *  full-page layout, no app shell, no role check.
 *
 *  In production each button redirects to the provider's OAuth consent
 *  screen; the prototype has no real identity providers to hand off to, so —
 *  like SSOLogin — picking one just continues straight to the dashboard. */
export function SocialLogin() {
  const { t, rtl } = usePreferences()
  const navigate = useNavigate()
  const chevron = rtl ? 'ChevronLeft' : 'ChevronRight'

  function continueWith() {
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_95%,transparent)] p-7 shadow-lg backdrop-blur-[24px]">
        <div className="flex flex-col items-center gap-2.5">
          <BrandMark width={110} />
          <h2 className="font-display text-xl font-bold text-heading">{t('Sign In')}</h2>
          <p className="text-[13px] text-muted">{t('Choose how to sign in')}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={continueWith}
              className={
                'flex h-[54px] cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-border ' +
                'bg-card px-4 font-action text-sm font-medium text-body transition-all duration-150 ' +
                'hover:-translate-y-px hover:border-salis-blue hover:bg-[rgba(10,94,215,.04)] hover:shadow-lg'
              }
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: provider.iconBg, color: provider.iconColor }}
              >
                <Icon name={provider.icon} size={18} />
              </span>
              <span className="flex-1 text-start">
                {t('Continue with')} <span dir="ltr">{provider.name}</span>
              </span>
              <Icon name={chevron} size={16} className="text-muted" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase text-muted">{t('or')}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          to="/login"
          className={
            'flex h-[50px] items-center justify-center gap-2 rounded-[10px] bg-salis-gradient font-action ' +
            'text-sm font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] ' +
            'hover:text-white hover:no-underline'
          }
        >
          <Icon name="Mail" size={16} />
          {t('Sign in with Email')}
        </Link>

        <div className="flex items-center justify-center gap-1">
          <Icon name="Building2" size={14} className="text-muted" />
          <Link to="/ssologin" className="font-action text-[13px] font-medium">
            {t('Use SSO instead')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
