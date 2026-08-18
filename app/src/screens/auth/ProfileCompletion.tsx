import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Post-invite step that fills in the fields an invite/SSO sign-up skips.
 *
 *  Public, full-page auth-chain screen — no app shell, no role check, since
 *  it runs before the session has a role to check against. Demo data
 *  pre-fills the form, same as the design; Continue hands off to
 *  `/role-selection`. */
export function ProfileCompletion() {
  const { t } = usePreferences()
  const toast = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('Khalid Al-Amri')
  const [phone, setPhone] = useState('+966 55 123 4567')

  const initial = name.trim().charAt(0).toUpperCase() || '?'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      toast.show({ title: t('Error'), description: t('Please fill in all fields'), error: true })
      return
    }
    navigate('/role-selection')
  }

  return (
    <AuthLayout className="mx-auto max-w-[440px]">
      <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-[18px] flex flex-col items-center gap-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-[22px] font-bold text-white">
            {initial}
          </span>
          <h2 className="font-display text-lg font-bold text-heading">
            {t('Profile Completion')}
          </h2>
          <p className="text-[13px] text-muted">{t('Tell us a bit about yourself')}</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full-name" className="font-action text-xs font-medium text-heading">
              {t('Full Name')}
            </label>
            <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="font-action text-xs font-medium text-heading">
              {t('Phone')}
            </label>
            <Input
              id="phone"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="font-mono text-[13px]"
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            {t('Continue')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
