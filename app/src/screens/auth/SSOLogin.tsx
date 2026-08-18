import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { AuthCard, Field } from '@/components/shell/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Enterprise SSO handshake. A public auth-chain screen — the tenant types
 *  their company domain and continues to the identity provider, rather than
 *  entering a password here.
 *
 *  In production this posts the domain to discover the tenant's IdP and
 *  redirects there; the prototype just moves straight on to the dashboard. */
export function SSOLogin() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()
  const [domain, setDomain] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!domain.trim()) {
      toast.show({ title: t('Error'), description: t('Please fill in all fields'), error: true })
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout className="mx-auto max-w-[420px]">
      <AuthCard logo title={t('SSO Login')} description={t('Enter your credentials to access your account')}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label={t('Company Domain')} htmlFor="sso-domain">
            <Input
              id="sso-domain"
              type="text"
              autoComplete="off"
              placeholder="company.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              icon={<Icon name="Building2" size={20} />}
              dir="ltr"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            {t('Continue with SSO')}
          </Button>
        </form>
        <Link to="/login" className="mt-4 block text-center font-action text-[13px] font-medium">
          {t('Back to Sign In')}
        </Link>
      </AuthCard>
    </AuthLayout>
  )
}
