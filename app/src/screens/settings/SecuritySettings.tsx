import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { SettingsShell } from '@/screens/admin/SettingsShell'

/** Security policy, read from the server's configuration. There is no policy
 *  endpoint yet, so the values shown are the platform defaults and the banner
 *  says so — a form that pretended to save them would be a lie. */
const SETTINGS = [
  { label: 'Password Min Length', value: '12', type: 'text' as const },
  { label: 'Require 2FA', value: true, type: 'toggle' as const },
  { label: 'Session Timeout', value: '30 minutes', type: 'text' as const },
  { label: 'Max Login Attempts', value: '5', type: 'text' as const },
  { label: 'IP Whitelist Enabled', value: false, type: 'toggle' as const },
  { label: 'Audit Log Retention', value: '90 days', type: 'text' as const },
]

export function SecuritySettings() {
  const { t } = usePreferences()
  const { live } = useSession()

  return (
    <SettingsShell
      title="Security Settings"
      icon="Lock"
      subtitle="Security configuration"
      readOnly={
        live
          ? 'Security policy is set by your administrator on the server.'
          : 'Platform defaults — a security policy endpoint is not connected yet.'
      }
    >
      <Card className="rounded-2xl p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
            <Icon name="Shield" size={16} />
          </span>
          <h2 className="text-sm font-semibold text-heading">{t('Security Configuration')}</h2>
        </div>
        <dl className="m-0 grid gap-4">
          {SETTINGS.map((s) => (
            <div
              key={s.label}
              className="flex min-h-[44px] items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted">{t(s.label)}</dt>
              <dd className="m-0">
                {s.type === 'toggle' ? (
                  <Badge
                    background={(s.value as boolean) ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                    color={(s.value as boolean) ? 'var(--salis-blue)' : 'var(--text-muted)'}
                  >
                    {(s.value as boolean) ? t('Enabled') : t('Disabled')}
                  </Badge>
                ) : (
                  <span dir="ltr" className="font-mono text-sm font-medium text-heading">
                    {s.value as string}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </SettingsShell>
  )
}
