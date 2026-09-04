import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { SettingsShell } from '@/screens/admin/SettingsShell'

/** System configuration overview. `/system-settings` redirects to `/settings`
 *  (route-redirects.json), so this screen is unrouted and kept as reference;
 *  it still renders inside the settings family shell so it cannot drift. */
const GENERAL = [
  { label: 'Company Name', value: 'SALIS Auto' },
  { label: 'Timezone', value: 'Asia/Riyadh (UTC+3)' },
  { label: 'Language', value: 'English' },
  { label: 'Currency', value: 'SAR' },
]

const NOTIFICATIONS = [
  { label: 'Email Notifications', value: true },
  { label: 'SMS Notifications', value: false },
  { label: 'Push Notifications', value: true },
]

const SECURITY = [
  { label: 'Session Timeout', value: '30 minutes' },
  { label: '2FA Required', value: true },
  { label: 'Password Policy', value: 'Strong' },
]

type Row = { label: string; value: string | boolean }

function OnOff({ on }: { on: boolean }) {
  const { t } = usePreferences()
  return (
    <Badge
      background={on ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
      color={on ? 'var(--salis-blue)' : 'var(--text-muted)'}
    >
      {on ? t('On') : t('Off')}
    </Badge>
  )
}

function Section({ icon, title, rows }: { icon: string; title: string; rows: readonly Row[] }) {
  const { t } = usePreferences()
  return (
    <Card className="rounded-2xl p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
          <Icon name={icon} size={16} />
        </span>
        <h2 className="text-sm font-semibold text-heading">{t(title)}</h2>
      </div>
      <dl className="m-0 grid gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-h-[44px] items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
          >
            <dt className="text-sm text-muted">{t(row.label)}</dt>
            <dd className="m-0">
              {typeof row.value === 'boolean' ? (
                <OnOff on={row.value} />
              ) : (
                <span className="text-sm font-medium text-heading">{row.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

export function SystemSettings() {
  return (
    <SettingsShell title="System Settings" icon="Settings" subtitle="System configuration">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 sm:gap-6">
        <Section icon="Building" title="General" rows={GENERAL} />
        <Section icon="Bell" title="Notifications" rows={NOTIFICATIONS} />
        <Section icon="Lock" title="Security" rows={SECURITY} />
      </div>
    </SettingsShell>
  )
}
