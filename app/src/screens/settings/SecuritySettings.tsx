import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Lock" title={t('Security Settings')} subtitle={t('Security configuration')} />
        <MobileCard>
          {SETTINGS.map((s) => (
            <MobileCardRow key={s.label} label={t(s.label)}>
              {s.type === 'toggle' ? (
                <Badge
                  background={(s.value as boolean) ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                  color={(s.value as boolean) ? 'var(--salis-blue)' : 'var(--text-muted)'}
                >
                  {(s.value as boolean) ? t('Enabled') : t('Disabled')}
                </Badge>
              ) : (
                <span className="font-mono text-xs text-heading">{s.value as string}</span>
              )}
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Lock" title={t('Security Settings')} subtitle={t('Security configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Shield" size={16} /></span>
          <h2 className="text-sm font-semibold text-heading">{t('Security Configuration')}</h2>
        </div>
        <div className="grid gap-4">
          {SETTINGS.map((s) => (
            <div key={s.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{t(s.label)}</span>
              {s.type === 'toggle' ? (
                <Badge
                  background={(s.value as boolean) ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                  color={(s.value as boolean) ? 'var(--salis-blue)' : 'var(--text-muted)'}
                >
                  {(s.value as boolean) ? t('Enabled') : t('Disabled')}
                </Badge>
              ) : (
                <span className="font-mono text-sm font-medium text-heading">{s.value as string}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
