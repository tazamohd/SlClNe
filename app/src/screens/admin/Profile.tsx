import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

export function Profile() {
  const { t, language, theme } = usePreferences()
  const { userName, roleLabel, user } = useSession()
  const isMobile = useIsMobile()

  const [fullName, setFullName] = useState(userName)
  const [email] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

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
          <h3 className="mb-3 text-base font-bold text-heading">{t('Change Password')}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-action text-xs font-medium text-body">{t('Current Password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-action text-xs font-medium text-body">{t('New Password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Button className="self-end">
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
            <label className="font-action text-xs font-medium text-body">{t('Full Name')}</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-action text-xs font-medium text-body">{t('Email')}</label>
            <Input
              dir="ltr"
              value={email}
              readOnly
            />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl p-6">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Change Password')}</h3>
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="font-action text-xs font-medium text-body">{t('Current Password')}</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-action text-xs font-medium text-body">{t('New Password')}</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Button className="self-end">
        <Icon name="Check" size={16} />
        {t('Save Changes')}
      </Button>
    </div>
  )
}
