import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
          {SETTINGS.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)}>
              {s.type === 'toggle' ? (
                <Badge
                  background={(s.value as boolean) ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                  color={(s.value as boolean) ? 'var(--salis-blue)' : '#64748B'}
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Lock" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Security Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Security configuration')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Shield" size={16} /></span>
          <h2 className="text-sm font-semibold text-heading">{t('Security Configuration')}</h2>
        </div>
        <div className="grid gap-4">
          {SETTINGS.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{t(s.label)}</span>
              {s.type === 'toggle' ? (
                <Badge
                  background={(s.value as boolean) ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                  color={(s.value as boolean) ? 'var(--salis-blue)' : '#64748B'}
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
