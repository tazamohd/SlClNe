import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Form, FormErrorSummary, useUnsavedChangesGuard, useZodForm } from '@/components/ui/Form'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { SettingsShell } from './SettingsShell'

/** Workshop settings — the first section of the settings family.
 *
 *  Two cards, two forms: the workshop profile (name, phone) and the
 *  notification preferences (three switches). Each card saves itself, and its
 *  save button stays disabled until something on that card actually changed,
 *  so "Save" is never a no-op. Leaving with unsaved edits asks first.
 *
 *  Demo mode does not disable the inputs — a read-only banner says where the
 *  edits go (this session, reset on reload) and the form keeps working, so
 *  the flow can be exercised end to end without an API.
 *
 *  The danger zone at the bottom resets the demo data by reloading the page:
 *  every fixture is seeded in memory, so a reload *is* the reset. It says so,
 *  it asks for a typed confirmation, and it is owner-only. */

const RESET_WORD = 'RESET'

const profileSchema = z.object({
  workshopName: z.string().trim().min(2, 'Enter the workshop name.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number.'),
})

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsAlerts: z.boolean(),
  twoFactor: z.boolean(),
})

type NotificationValues = z.infer<typeof notificationSchema>

const NOTIFICATION_ROWS: readonly { name: keyof NotificationValues; label: string; hint: string }[] = [
  { name: 'emailNotifications', label: 'Email Notifications', hint: 'Job status, invoices and approvals by email.' },
  { name: 'smsAlerts', label: 'SMS Alerts', hint: 'Text the workshop phone when a customer approves or pays.' },
  { name: 'twoFactor', label: 'Two-Factor Authentication', hint: 'Ask every user for a code at sign-in.' },
]

export function Settings() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const toast = useToast()
  const { live, can, role } = useSession()

  const profileForm = useZodForm({
    schema: profileSchema,
    initial: { workshopName: 'Al-Amri Auto Center', phone: '+966 55 123 4567' },
    onSubmit: async () => {
      toast.show({ title: t('Workshop profile saved'), tone: 'success' })
    },
  })

  const notificationForm = useZodForm({
    schema: notificationSchema,
    initial: { emailNotifications: true, smsAlerts: false, twoFactor: true },
    onSubmit: async () => {
      toast.show({ title: t('Notification preferences saved'), tone: 'success' })
    },
  })

  useUnsavedChangesGuard(profileForm.dirty || notificationForm.dirty)

  const canReset = !live && (role === 'owner' || can('settings', 'd'))

  return (
    <SettingsShell
      title="Settings"
      subtitle="Workshop profile, notifications and billing"
      readOnly={live ? undefined : 'Demo mode — edits are kept for this session and reset when the page reloads.'}
    >
      <Card className="flex flex-col gap-4 rounded-2xl p-5 md:p-6">
        <div>
          <h2 className="text-[17px] font-bold text-heading">{t('Workshop Profile')}</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            {t('Shown on invoices, estimates and the customer app.')}
          </p>
        </div>
        <Form form={profileForm} className="gap-4">
          <FormErrorSummary />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field name="workshopName" label="Workshop Name" required />
            <Field name="phone" label="Phone" kind="phone" required hint="Include the country code." />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              icon="Check"
              loading={profileForm.pending}
              loadingLabel="Saving"
              disabled={!profileForm.dirty}
            >
              {t('Save Changes')}
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="flex flex-col gap-4 rounded-2xl p-5 md:p-6">
        <h2 className="text-[17px] font-bold text-heading">{t('Notifications Preferences')}</h2>
        <Form form={notificationForm} className="gap-4">
          <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
            {NOTIFICATION_ROWS.map((row) => (
              <li key={row.name} className="flex min-h-[56px] items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="m-0 text-sm font-medium text-heading">{t(row.label)}</p>
                  <p className="m-0 mt-0.5 text-[12px] text-muted">{t(row.hint)}</p>
                </div>
                <Toggle
                  on={notificationForm.values[row.name]}
                  onToggle={() => {
                    notificationForm.markTouched(row.name)
                    notificationForm.setValue(row.name, !notificationForm.values[row.name])
                  }}
                  label={t(row.label)}
                />
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              icon="Check"
              loading={notificationForm.pending}
              loadingLabel="Saving"
              disabled={!notificationForm.dirty}
            >
              {t('Save Preferences')}
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="flex flex-col items-start justify-between gap-4 rounded-2xl p-5 md:flex-row md:items-center md:p-6">
        <div>
          <h2 className="text-[17px] font-bold text-heading">{t('Billing & Subscription')}</h2>
          <p className="mt-1 text-[13px] text-muted">
            {t('Current Plan')}: <span className="font-semibold text-salis-blue">PRO</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          icon="CreditCard"
          onClick={() => navigate('/subscription')}
        >
          {t('Manage Billing')}
        </Button>
      </Card>

      {canReset ? <DangerZone /> : null}
    </SettingsShell>
  )
}

/** Owner-only reset of the demo data. The fixtures live in memory, so a reload
 *  restores every seed; the copy says exactly that, and the button only arms
 *  once the word is typed. */
function DangerZone() {
  const { t } = usePreferences()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const armed = typed.trim().toUpperCase() === RESET_WORD

  const close = () => {
    setOpen(false)
    setTyped('')
  }

  const reset = () => {
    if (!armed) return
    window.location.reload()
  }

  return (
    <Card className="flex flex-col gap-4 rounded-2xl border-salis-orange/50 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex flex-shrink-0 rounded-lg bg-tint-orange p-2 text-salis-orange">
          <Icon name="AlertTriangle" size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-heading">{t('Danger zone')}</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            {t('Reset demo data reloads the app and restores every seeded record. Anything changed in this session is lost.')}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="destructive" size="lg" icon="RotateCcw" onClick={() => setOpen(true)}>
          {t('Reset demo data')}
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Reset demo data?"
        variant="lifecycle"
        icon="RotateCcw"
        destructive
        description={t('The page reloads and every record goes back to its seed. This cannot be undone.')}
        footer={
          <>
            <Button variant="outline" size="lg" onClick={close}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" size="lg" icon="RotateCcw" disabled={!armed} onClick={reset}>
              {t('Reload and reset')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-reset-confirm" className="font-action text-xs font-medium text-heading">
            {t('Type the word to confirm')}{' '}
            <span dir="ltr" className="font-mono text-salis-orange">
              {RESET_WORD}
            </span>
          </label>
          <Input
            id="settings-reset-confirm"
            dir="ltr"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') reset()
            }}
            className="font-mono uppercase"
          />
        </div>
      </Modal>
    </Card>
  )
}
