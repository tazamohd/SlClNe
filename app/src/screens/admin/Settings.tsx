import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MobileCardHeader } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

function Toggle({
  on,
  onToggle,
  rtl,
  label,
}: {
  on: boolean
  onToggle: () => void
  rtl: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={
        'relative h-6 w-[42px] flex-shrink-0 cursor-pointer rounded-full border-none p-0.5 transition-colors ' +
        (on ? 'bg-salis-gradient' : 'bg-border-strong')
      }
    >
      <span
        className="block h-5 w-5 rounded-full bg-white transition-transform"
        style={{
          transform: on
            ? `translateX(${rtl ? '-18px' : '18px'})`
            : 'translateX(0)',
        }}
      />
    </button>
  )
}

export function Settings() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const [wsName, setWsName] = useState('Al-Amri Auto Center')
  const [phone, setPhone] = useState('+966 55 123 4567')
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)

  const notifRows = [
    { label: t('Email Notifications'), on: emailNotif, toggle: () => setEmailNotif((v) => !v) },
    { label: t('SMS Alerts'), on: smsAlerts, toggle: () => setSmsAlerts((v) => !v) },
    { label: t('Two-Factor Authentication'), on: twoFactor, toggle: () => setTwoFactor((v) => !v) },
  ]

  return (
    <div className="flex max-w-[760px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <h1 className="font-display text-[30px] font-black text-heading">
        {t('Settings')}
      </h1>

      <Card className="flex flex-col gap-4 rounded-2xl p-6">
        <h3 className="text-[17px] font-bold text-heading">{t('Workshop Profile')}</h3>
        <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-4'}>
          <div className="flex flex-col gap-1.5">
            <label className="font-action text-xs font-medium text-primary">
              {t('Workshop Name')}
            </label>
            <Input
              inputSize="md"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              disabled={!isLive}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-action text-xs font-medium text-primary">
              {t('Phone')}
            </label>
            <Input
              inputSize="md"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isLive}
              className="font-mono"
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 rounded-2xl p-6">
        <h3 className="text-[17px] font-bold text-heading">
          {t('Notifications Preferences')}
        </h3>
        {isMobile ? (
          <div className="flex flex-col divide-y divide-border">
            {notifRows.map((row) => (
              <div key={row.label} className="py-3 first:pt-0 last:pb-0">
                <MobileCardHeader
                  leading={
                    <span className="text-sm text-body">{row.label}</span>
                  }
                  trailing={
                    <Toggle on={row.on} onToggle={row.toggle} rtl={rtl} label={row.label} />
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          notifRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-body">{row.label}</span>
              <Toggle on={row.on} onToggle={row.toggle} rtl={rtl} label={row.label} />
            </div>
          ))
        )}
      </Card>

      <Card className="flex items-center justify-between gap-4 rounded-2xl p-6">
        <div>
          <h3 className="text-[17px] font-bold text-heading">
            {t('Billing & Subscription')}
          </h3>
          <p className="mt-1 text-[13px] text-muted">
            {t('Current Plan')}:{' '}
            <span className="font-semibold text-salis-blue">PRO</span>
          </p>
        </div>
        <Button variant="outline" size="sm">
          {t('Billing & Subscription')}
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.show({ title: t('Settings saved') })} disabled={!isLive}>
          <Icon name="Check" size={16} />
          {t('Save Changes')}
        </Button>
      </div>
    </div>
  )
}
