import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { SettingsShell } from '@/screens/admin/SettingsShell'

/** User preferences overview. `/user-settings` redirects to `/profile`
 *  (route-redirects.json), so this screen is unrouted and kept as reference;
 *  it renders inside the settings family shell so it cannot drift. */
const SETTINGS = [
  { label: 'Display Name', value: 'Ahmed Al-Rashid' },
  { label: 'Email', value: 'ahmed@salisauto.com', ltr: true },
  { label: 'Phone', value: '+966 50 123 4567', ltr: true },
  { label: 'Language', value: 'English' },
  { label: 'Theme', value: 'System' },
  { label: 'Notifications Preferences', value: 'Email & Push' },
  { label: 'Date Format', value: 'YYYY-MM-DD', ltr: true },
  { label: 'Time Format', value: '24-hour' },
]

export function UserSettings() {
  const { t } = usePreferences()

  return (
    <SettingsShell title="User Settings" icon="UserCog" subtitle="User preferences">
      <Card className="rounded-2xl p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
            <Icon name="UserCog" size={16} />
          </span>
          <h2 className="text-sm font-semibold text-heading">{t('Preferences')}</h2>
        </div>
        <dl className="m-0 grid gap-4">
          {SETTINGS.map((s) => (
            <div
              key={s.label}
              className="flex min-h-[44px] items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted">{t(s.label)}</dt>
              <dd dir={s.ltr ? 'ltr' : undefined} className={s.ltr ? 'm-0 font-mono text-sm font-medium text-heading' : 'm-0 text-sm font-medium text-heading'}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </SettingsShell>
  )
}
