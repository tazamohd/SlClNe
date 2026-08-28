import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface SocialPlatform {
  name: string
  icon: string
  followers: number
  posts: number
  engagement: number
  connected: boolean
  lastSync: string
}

const PLATFORMS: SocialPlatform[] = [
  { name: 'Instagram', icon: 'Camera', followers: 12400, posts: 234, engagement: 4.2, connected: true, lastSync: 'Aug 18, 2026, 9:15 AM' },
  { name: 'Twitter', icon: 'Twitter', followers: 8600, posts: 512, engagement: 2.8, connected: true, lastSync: 'Aug 18, 2026, 9:10 AM' },
  { name: 'Facebook', icon: 'Facebook', followers: 15200, posts: 189, engagement: 3.1, connected: true, lastSync: 'Aug 18, 2026, 8:45 AM' },
  { name: 'LinkedIn', icon: 'Linkedin', followers: 3400, posts: 87, engagement: 5.6, connected: false, lastSync: 'Aug 10, 2026, 2:30 PM' },
]

export function SocialMediaIntegration() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Share2" title={t('Social Media')} subtitle={t('Connected accounts')} />
        {PLATFORMS.map((p) => (
          <MobileCard key={p.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name={p.icon} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{p.name}</p>
                    <p className="text-xs text-muted">{p.lastSync}</p>
                  </div>
                </div>
              }
              trailing={
                p.connected
                  ? <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Connected')}</Badge>
                  : <Badge background="var(--tint-neutral)" color="rgb(107,114,128)">{t('Disconnected')}</Badge>
              }
            />
            <MobileCardRow label={t('Followers')} value={p.followers.toLocaleString()} />
            <MobileCardRow label={t('Posts')} value={String(p.posts)} />
            <MobileCardRow label={t('Engagement')} value={`${p.engagement}%`} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Share2" title={t('Social Media Integration')} subtitle={t('Connected platforms and performance')} />

      <div className="grid grid-cols-2 gap-4">
        {PLATFORMS.map((p) => (
          <Card key={p.name} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex rounded-lg bg-[var(--tint-blue)] p-2 text-salis-blue" aria-hidden><Icon name={p.icon} size={20} /></span>
                <div>
                  <h3 className="text-sm font-bold text-heading">{p.name}</h3>
                  <p className="text-xs text-muted">{t('Last sync')}: {p.lastSync}</p>
                </div>
              </div>
              {p.connected
                ? <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Connected')}</Badge>
                : <Badge background="var(--tint-neutral)" color="rgb(107,114,128)">{t('Disconnected')}</Badge>}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted">{t('Followers')}</p>
                <p className="font-display text-lg font-black text-heading">{p.followers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Posts')}</p>
                <p className="font-display text-lg font-black text-heading">{p.posts}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Engagement')}</p>
                <p className="font-display text-lg font-black text-heading">{p.engagement}%</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
