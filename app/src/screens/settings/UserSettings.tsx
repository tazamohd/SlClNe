import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const SETTINGS = [
  { label: 'Display Name', value: 'Ahmed Al-Rashid' },
  { label: 'Email', value: 'ahmed@salisauto.com' },
  { label: 'Phone', value: '+966 50 123 4567' },
  { label: 'Language', value: 'English' },
  { label: 'Theme', value: 'System' },
  { label: 'Notifications Preferences', value: 'Email & Push' },
  { label: 'Date Format', value: 'YYYY-MM-DD' },
  { label: 'Time Format', value: '24-hour' },
]

export function UserSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="UserCog" title={t('User Settings')} subtitle={t('User preferences')} />
        <MobileCard>
          {SETTINGS.map((s, i) => (
            <MobileCardRow key={i} label={t(s.label)} value={s.value} />
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="UserCog" title={t('User Settings')} subtitle={t('User preferences')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="UserCog" size={16} /></span>
          <h2 className="text-sm font-semibold text-heading">{t('Preferences')}</h2>
        </div>
        <div className="grid gap-4">
          {SETTINGS.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{t(s.label)}</span>
              <span className="text-sm font-medium text-heading">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
