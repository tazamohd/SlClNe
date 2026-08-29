import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { AuthLayout } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

interface FieldErrors { name?: string; phone?: string }

function validate(values: { name: string; phone: string }): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  return errors
}

/** Complete your profile after signup — avatar, name, phone. */
export function ProfileCompletion() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = validate({ name, phone })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    if (!isLive) {
      toast.show({ title: t('Profile completion is not available yet') })
      return
    }

    toast.show({ title: t('Profile updated') })
  }

  /** First letter of the name, or a fallback icon. */
  const initial = name.trim() ? name.trim()[0].toUpperCase() : null

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[440px]'}>
      <div className={`rounded-2xl border border-border bg-card shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Avatar */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className={`flex items-center justify-center rounded-full bg-salis-gradient font-bold text-white ${isMobile ? 'h-14 w-14 text-[18px]' : 'h-16 w-16 text-[22px]'}`}>
            {initial ?? <Icon name="User" size={isMobile ? 20 : 24} />}
          </span>
          <h2 className={`font-display font-bold text-heading ${isMobile ? 'text-base' : 'text-lg'}`}>
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
              invalid={!!errors.name}
              aria-describedby={errors.name ? 'pc-name-error' : undefined}
            />
            {errors.name && <p id="pc-name-error" className="text-xs text-salis-orange">{t(errors.name)}</p>}
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
              invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'pc-phone-error' : undefined}
            />
            {errors.phone && <p id="pc-phone-error" className="text-xs text-salis-orange">{t(errors.phone)}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full">
            {t('Continue')}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
