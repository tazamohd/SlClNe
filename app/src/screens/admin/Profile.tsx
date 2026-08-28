import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

const MIN_PW = 8

function validatePassword(t: (s: string) => string, current: string, next: string, confirm: string) {
  const errors: { current?: string; next?: string; confirm?: string } = {}
  if (!current) errors.current = t('Required')
  if (!next) errors.next = t('Required')
  else if (next.length < MIN_PW) errors.next = t('At least 8 characters')
  if (!confirm) errors.confirm = t('Required')
  else if (confirm !== next) errors.confirm = t('Passwords do not match')
  return errors
}

export function Profile() {
  const { t, language, theme } = usePreferences()
  const { userName, roleLabel, user } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()

  const [fullName, setFullName] = useState(userName)
  const [email] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwErrors, setPwErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})

  function handleSave() {
    if (currentPassword || newPassword || confirmPassword) {
      const errors = validatePassword(t, currentPassword, newPassword, confirmPassword)
      setPwErrors(errors)
      if (Object.keys(errors).length > 0) {
        toast.show({ title: t('Validation error'), description: t('Please fix the highlighted fields.'), error: true })
        return
      }
    }
    toast.show({ title: t('Profile updated'), description: t('Your changes have been saved.') })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwErrors({})
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="User" size={24} />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-heading">{t('Profile')}</h1>
            <p className="mt-0.5 text-xs text-muted">{t('Manage your account')}</p>
          </div>
        </div>

        <Card className="rounded-2xl p-4">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={userName} size={56} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-heading">{userName}</p>
              <p className="text-xs text-muted">{t('Role')}: {roleLabel}</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            <div className="py-2">
              <MobileCardHeader title={t('Full Name')} />
              <MobileCardRow value={fullName || '—'} />
            </div>
            <div className="py-2">
              <MobileCardHeader title={t('Email')} />
              <MobileCardRow value={<span dir="ltr">{email || '—'}</span>} />
            </div>
            <div className="py-2">
              <MobileCardHeader title={t('Language')} />
              <MobileCardRow value={language === 'ar' ? 'العربية' : 'English'} />
            </div>
            <div className="py-2">
              <MobileCardHeader title={t('Theme')} />
              <MobileCardRow value={theme === 'dark' ? t('Dark') : t('Light')} />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-4">
          <h2 className="mb-3 text-base font-bold text-heading">{t('Change Password')}</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-current-pw" className="font-action text-xs font-medium text-body">{t('Current Password')}</label>
              <Input
                id="m-current-pw"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={Boolean(pwErrors.current)}
              />
              {pwErrors.current ? <span className="text-[11px] text-salis-orange">{pwErrors.current}</span> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-new-pw" className="font-action text-xs font-medium text-body">{t('New Password')}</label>
              <Input
                id="m-new-pw"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={Boolean(pwErrors.next)}
              />
              {pwErrors.next ? <span className="text-[11px] text-salis-orange">{pwErrors.next}</span> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-confirm-pw" className="font-action text-xs font-medium text-body">{t('Confirm Password')}</label>
              <Input
                id="m-confirm-pw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(pwErrors.confirm)}
              />
              {pwErrors.confirm ? <span className="text-[11px] text-salis-orange">{pwErrors.confirm}</span> : null}
            </div>
          </div>
        </Card>

        <Button className="self-end" onClick={handleSave}>
          <Icon name="Check" size={16} />
          {t('Save Changes')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" style={{ maxWidth: 640 }}>
      <h1 className="font-display text-[30px] font-black text-heading">{t('Profile')}</h1>

      <Card className="rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-4">
          <Avatar name={userName} size={64} />
          <div>
            <p className="text-base font-bold text-heading">{userName}</p>
            <p className="mt-0.5 text-[13px] text-muted">{t('Role')}: {roleLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-name" className="font-action text-xs font-medium text-body">{t('Full Name')}</label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-email" className="font-action text-xs font-medium text-body">{t('Email')}</label>
            <Input
              id="profile-email"
              dir="ltr"
              value={email}
              readOnly
            />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl p-6">
        <h2 className="mb-4 text-base font-bold text-heading">{t('Change Password')}</h2>
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="current-pw" className="font-action text-xs font-medium text-body">{t('Current Password')}</label>
            <Input
              id="current-pw"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={Boolean(pwErrors.current)}
            />
            {pwErrors.current ? <span className="text-[11px] text-salis-orange">{pwErrors.current}</span> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-pw" className="font-action text-xs font-medium text-body">{t('New Password')}</label>
            <Input
              id="new-pw"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={Boolean(pwErrors.next)}
            />
            {pwErrors.next ? <span className="text-[11px] text-salis-orange">{pwErrors.next}</span> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-pw" className="font-action text-xs font-medium text-body">{t('Confirm Password')}</label>
            <Input
              id="confirm-pw"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(pwErrors.confirm)}
            />
            {pwErrors.confirm ? <span className="text-[11px] text-salis-orange">{pwErrors.confirm}</span> : null}
          </div>
        </div>
      </Card>

      <Button className="self-end" onClick={handleSave}>
        <Icon name="Check" size={16} />
        {t('Save Changes')}
      </Button>
    </div>
  )
}
