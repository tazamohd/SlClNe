import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

/** SSO / enterprise login — enter company domain and redirect. */
export function SSOLogin() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!domain.trim()) {
      setError('Please enter your company domain.')
      return
    }
    setError('')

    if (!isLive) {
      toast.show({
        title: t('SSO is not available yet'),
        description: t('Please use the standard login to access the application.'),
      })
      return
    }

    toast.show({ title: t('Redirecting to SSO provider…') })
  }

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[420px]'}>
      <div className={`rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] text-center shadow-lg backdrop-blur-[24px] ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="mb-3 flex justify-center">
          <BrandMark width={isMobile ? 90 : 110} />
        </div>
        <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('SSO Login')}</h2>
        <p className="mt-2 mb-5 font-action text-[13px] text-muted">
          {t('Enter your company domain to sign in via SSO')}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4 text-start">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sso-domain"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Company Domain')}
            </label>
            <Input
              id="sso-domain"
              autoComplete="url"
              placeholder="company.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              icon={<Icon name="Building2" size={20} />}
              dir="ltr"
              invalid={!!error}
              aria-describedby={error ? 'sso-domain-error' : undefined}
            />
            {error && <p id="sso-domain-error" className="text-xs text-salis-orange">{t(error)}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full">
            {t('Continue with SSO')}
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-4 inline-block font-action text-[13px] font-medium"
        >
          {t('Back to Sign In')}
        </Link>
      </div>
    </AuthLayout>
  )
}
