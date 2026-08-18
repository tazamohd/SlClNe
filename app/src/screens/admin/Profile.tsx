import { useEffect, useState, type FormEvent } from 'react'
import { Field } from '@/components/shell/AuthCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Profile (Profile.dc.html): the signed-in staff user's own name/email, plus
 *  an inline change-password section using ResetPassword's ≥8-char rule.
 *
 *  Identity is live from useSession() — the prototype hardcoded
 *  "Khalid Al-Amri" / khalid.amri@salisauto.sa and a fixed "ADMIN" pill.
 *  Switching role (the design's login stand-in) or language reseeds the form
 *  from the new identity and clears any in-progress password entry, so a
 *  stale draft can never be submitted against the wrong account. The role
 *  pill is tinted from `roleMeta.color` rather than hardcoded blue, since the
 *  signed-in role is no longer always Admin. */

const MIN_PASSWORD_LENGTH = 8

export function Profile() {
  const { t } = usePreferences()
  const { userName, roleLabel, roleMeta } = useSession()
  const toast = useToast()

  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(roleMeta.demo.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setName(userName)
    setEmail(roleMeta.demo.email)
    setCurrentPassword('')
    setNewPassword('')
    setSubmitted(false)
  }, [userName, roleMeta.demo.email])

  const changingPassword = currentPassword.length > 0 || newPassword.length > 0
  const nameInvalid = submitted && !name.trim()
  const emailInvalid = submitted && !email.trim()
  const currentPasswordInvalid = submitted && changingPassword && !currentPassword
  const newPasswordInvalid =
    submitted && changingPassword && newPassword.length < MIN_PASSWORD_LENGTH

  function save(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    if (!name.trim() || !email.trim()) {
      toast.show({
        title: t('Error'),
        description: t('Name and email are required'),
        error: true,
      })
      return
    }
    if (changingPassword && !currentPassword) {
      toast.show({
        title: t('Error'),
        description: t('Current password is required'),
        error: true,
      })
      return
    }
    if (changingPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.show({
        title: t('Error'),
        description: t('Must be at least 8 characters'),
        error: true,
      })
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setSubmitted(false)
    toast.show({
      title: t('Success'),
      description: t('Your changes have been applied.'),
    })
  }

  return (
    <form onSubmit={save} noValidate className="flex w-full max-w-[640px] flex-col gap-6">
      <h1 className="m-0 font-display text-[26px] font-black text-heading md:text-[30px]">
        {t('Profile')}
      </h1>

      <Card className="flex flex-col gap-[18px] p-5 md:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-2xl font-bold text-white">
            {userName.trim()[0] ?? '?'}
          </span>
          <div className="min-w-0">
            <p className="m-0 text-base font-bold text-heading">{userName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[13px] text-muted">{t('Role')}:</span>
              <Badge background={`${roleMeta.color}1F`} color={roleMeta.color}>
                {roleLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('Full Name')} htmlFor="profile-name">
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={nameInvalid}
            />
          </Field>
          <Field label={t('Email')} htmlFor="profile-email">
            <Input
              id="profile-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={emailInvalid}
            />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 p-5 md:p-6">
        <h3 className="m-0 text-sm font-bold text-heading md:text-base">
          {t('Change Password')}
        </h3>
        <Field label={t('Current Password')} htmlFor="profile-current-password">
          <Input
            id="profile-current-password"
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            invalid={currentPasswordInvalid}
          />
        </Field>
        <Field
          label={t('New Password')}
          htmlFor="profile-new-password"
          hint={changingPassword ? t('Must be at least 8 characters') : undefined}
        >
          <Input
            id="profile-new-password"
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            invalid={newPasswordInvalid}
          />
        </Field>
      </Card>

      <Button type="submit" size="lg" className="h-11 w-full self-end sm:w-auto sm:px-6">
        <Icon name="Check" size={16} />
        {t('Save Changes')}
      </Button>
    </form>
  )
}
