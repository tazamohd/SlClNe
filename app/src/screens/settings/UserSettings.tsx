import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

/** Previously one hardcoded person ("Ahmed Al-Rashid") regardless of who was
 *  signed in, plus a phone number, a notification preference, a date format
 *  and a time format no column or collection tracks — `theme` itself is only
 *  ever `'light'`/`'dark'` (`PreferencesProvider.tsx`), so "System" was
 *  invented too. `userName`/`user.email` are real (`useSession()`); language
 *  and theme are real, live settings this same screen's title promises —
 *  `usePreferences()` is where they're actually read and changed. The four
 *  fields with nothing to back them are dropped rather than re-invented. */
export function UserSettings() {
  const { t, language, theme } = usePreferences()
  const { userName, user } = useSession()
  const isMobile = useIsMobile()

  const settings = [
    { label: t('Display Name'), value: userName },
    { label: t('Email'), value: user?.email ?? '—' },
    { label: t('Language'), value: language === 'ar' ? 'العربية' : 'English' },
    { label: t('Theme'), value: theme === 'dark' ? t('Dark') : t('Light') },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="UserCog" title={t('User Settings')} subtitle={t('User preferences')} />
        <MobileCard>
          {settings.map((s) => (
            <MobileCardRow key={s.label} label={s.label} value={<span dir="ltr">{s.value}</span>} />
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
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="UserCog" size={16} /></span>
          <h2 className="text-sm font-semibold text-heading">{t('Preferences')}</h2>
        </div>
        <div className="grid gap-4">
          {settings.map((s) => (
            <div key={s.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{s.label}</span>
              <span dir="ltr" className="text-sm font-medium text-heading">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
