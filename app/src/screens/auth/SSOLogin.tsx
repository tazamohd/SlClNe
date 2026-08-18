import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

/** SSO / enterprise login — enter company domain and redirect. */
export function SSOLogin() {
  const { t } = usePreferences()
  const [domain, setDomain] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <div className="rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface-card)_85%,transparent)] p-6 text-center shadow-lg backdrop-blur-[24px]">
        <div className="mb-3 flex justify-center">
          <BrandMark width={110} />
        </div>
        <h2 className="font-display text-xl font-bold text-heading">{t('SSO Login')}</h2>
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
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!isLive}>
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
