import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function SystemSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Settings" title={t('System Settings')} subtitle={t('System configuration')} />
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('General')}</p>} />
          {GENERAL.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)} value={s.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Notifications')}</p>} />
          {NOTIFICATIONS.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)}>
              <Badge
                background={s.value ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                color={s.value ? 'var(--salis-blue)' : '#64748B'}
              >
                {s.value ? t('On') : t('Off')}
              </Badge>
            </MobileCardRow>
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Security')}</p>} />
          {SECURITY.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)}>
              {typeof s.value === 'boolean' ? (
                <Badge
                  background={s.value ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                  color={s.value ? 'var(--salis-blue)' : '#64748B'}
                >
                  {s.value ? t('On') : t('Off')}
                </Badge>
              ) : (
                <span className="text-xs font-medium text-heading">{s.value}</span>
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
            <Icon name="Settings" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('System Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('System configuration')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Building" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('General')}</h2>
          </div>
          <div className="grid gap-4">
            {GENERAL.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(s.label)}</span>
                <span className="text-sm font-medium text-heading">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Bell" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Notifications')}</h2>
          </div>
          <div className="grid gap-4">
            {NOTIFICATIONS.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(s.label)}</span>
                <Badge
                  background={s.value ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                  color={s.value ? 'var(--salis-blue)' : '#64748B'}
                >
                  {s.value ? t('On') : t('Off')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Lock" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Security')}</h2>
          </div>
          <div className="grid gap-4">
            {SECURITY.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(s.label)}</span>
                {typeof s.value === 'boolean' ? (
                  <Badge
                    background={s.value ? 'rgba(10,94,215,.1)' : 'rgba(100,116,139,.1)'}
                    color={s.value ? 'var(--salis-blue)' : '#64748B'}
                  >
                    {s.value ? t('On') : t('Off')}
                  </Badge>
                ) : (
                  <span className="text-sm font-medium text-heading">{s.value}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
