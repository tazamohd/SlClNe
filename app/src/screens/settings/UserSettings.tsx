import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="UserCog" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('User Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('User preferences')}</p>
        </div>
      </div>

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
