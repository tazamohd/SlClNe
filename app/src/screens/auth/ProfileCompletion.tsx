import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

/** Complete your profile after signup — avatar, name, phone. */
export function ProfileCompletion() {
  const { t } = usePreferences()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
  }

  /** First letter of the name, or a fallback icon. */
  const initial = name.trim() ? name.trim()[0].toUpperCase() : null

  return (
    <AuthLayout className="mx-auto max-w-[440px]">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        {/* Avatar */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-[22px] font-bold text-white">
            {initial ?? <Icon name="User" size={24} />}
          </span>
          <h2 className="font-display text-lg font-bold text-heading">
            {t('Complete Your Profile')}
          </h2>
          <p className="text-[13px] text-muted">{t('Tell us a bit about yourself')}</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pc-name"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Full Name')}
            </label>
            <Input
              id="pc-name"
              autoComplete="name"
              placeholder={t('Full Name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Icon name="User" size={20} />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pc-phone"
              className="font-action text-xs font-medium tracking-[.025em] text-heading"
            >
              {t('Phone')}
            </label>
            <Input
              id="pc-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+966 5X XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Icon name="Phone" size={20} />}
              dir="ltr"
              className="font-mono text-[13px]"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!isLive}>
            {t('Continue')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
