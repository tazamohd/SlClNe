import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

interface SocialProvider {
  icon: string
  name: string
  iconBg: string
  iconColor: string
  hoverBorder: string
}

const PROVIDERS: SocialProvider[] = [
  {
    icon: 'Chrome',
    name: 'Google',
    iconBg: 'rgba(10,94,215,.08)',
    iconColor: '#0A5ED7',
    hoverBorder: 'rgba(10,94,215,.4)',
  },
  {
    icon: 'Apple',
    name: 'Apple',
    iconBg: 'rgba(11,31,59,.08)',
    iconColor: '#0B1F3B',
    hoverBorder: 'rgba(11,31,59,.4)',
  },
  {
    icon: 'Building2',
    name: 'Microsoft',
    iconBg: 'rgba(11,179,255,.08)',
    iconColor: '#0BB3FF',
    hoverBorder: 'rgba(11,179,255,.4)',
  },
]

/** Social login — Google, Apple, Microsoft buttons. */
export function SocialLogin() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const chevron = rtl ? 'ChevronLeft' : 'ChevronRight'

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <div className={`flex flex-col gap-5 rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_95%,transparent)] shadow-lg backdrop-blur-[24px] ${isMobile ? 'p-4' : 'p-7'}`}>
        {/* Header */}
        <div className="flex flex-col items-center gap-2.5">
          <BrandMark width={isMobile ? 90 : 110} />
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('Sign In')}</h2>
          <p className="text-[13px] text-muted">{t('Choose how to sign in')}</p>
        </div>

        {/* Provider buttons */}
        <div className="flex flex-col gap-2.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.name}
              type="button"
              aria-label={`${t('Continue with')} ${p.name}`}
              className={cn(
                'flex h-[54px] w-full cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-border bg-card px-4',
                'font-action text-sm font-medium text-body',
                'transition-all duration-150 hover:-translate-y-px hover:shadow-lg'
              )}
              style={
                { '--hover-border': p.hoverBorder } as React.CSSProperties
              }
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: p.iconBg, color: p.iconColor }}
              >
                <Icon name={p.icon} size={18} />
              </span>
              <span className="flex-1 text-start">
                {t('Continue with')} {p.name}
              </span>
              <Icon name={chevron} size={16} className="text-muted" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2.5">
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span className="text-xs font-medium text-muted">{t('OR')}</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        {/* Email sign in */}
        <Link to="/login" className="no-underline hover:no-underline">
          <Button size="lg" className="w-full gap-2">
            <Icon name="Mail" size={16} />
            {t('Sign in with Email')}
          </Button>
        </Link>

        {/* SSO link */}
        <div className="flex items-center justify-center gap-1">
          <Icon name="Building2" size={14} className="text-muted" />
          <Link to="/sso-login" className="font-action text-[13px] font-medium">
            {t('Use SSO instead')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
