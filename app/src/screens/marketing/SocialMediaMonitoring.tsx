import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Mention {
  platform: string
  author: string
  text: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
  date: string
  responded: boolean
}

const MENTIONS: Mention[] = [
  { platform: 'Instagram', author: '@ahmed_cars', text: 'Great service at Salis Auto today!', sentiment: 'Positive', date: 'Aug 18, 2026', responded: true },
  { platform: 'Twitter', author: '@riyadh_driver', text: 'Quick oil change, reasonable price', sentiment: 'Positive', date: 'Aug 17, 2026', responded: true },
  { platform: 'Facebook', author: 'Khalid M.', text: 'Waiting area could use some improvement', sentiment: 'Neutral', date: 'Aug 17, 2026', responded: false },
  { platform: 'Instagram', author: '@car_lover_sa', text: 'Best detailing service in the city', sentiment: 'Positive', date: 'Aug 16, 2026', responded: true },
  { platform: 'Twitter', author: '@daily_commute', text: 'Had to wait longer than expected', sentiment: 'Negative', date: 'Aug 15, 2026', responded: true },
  { platform: 'Facebook', author: 'Nora S.', text: 'Friendly staff, clean facility', sentiment: 'Positive', date: 'Aug 15, 2026', responded: false },
  { platform: 'LinkedIn', author: 'Auto Review SA', text: 'Salis Auto expanding to new locations', sentiment: 'Neutral', date: 'Aug 14, 2026', responded: false },
  { platform: 'Instagram', author: '@mech_enthusiast', text: 'Parts quality could be better', sentiment: 'Negative', date: 'Aug 13, 2026', responded: true },
]

const SENTIMENT_STYLES: Record<string, { bg: string; fg: string }> = {
  Positive: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Neutral: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Negative: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: 'Camera',
  Twitter: 'Twitter',
  Facebook: 'Facebook',
  LinkedIn: 'Linkedin',
}

export function SocialMediaMonitoring() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Mentions'), value: '342', icon: 'AtSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Positive'), value: '68%', icon: 'ThumbsUp', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Response Rate'), value: '82%', icon: 'MessageCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Response Time'), value: '2.4h', icon: 'Clock', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Eye" title={t('Social Monitoring')} subtitle={t('Brand mentions')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {MENTIONS.map((m, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={PLATFORM_ICONS[m.platform]} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{m.author}</p>
                    <p className="text-xs text-muted">{m.platform}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={SENTIMENT_STYLES[m.sentiment].bg} color={SENTIMENT_STYLES[m.sentiment].fg}>{t(m.sentiment)}</Badge>}
            />
            <p className="mt-1 text-xs text-body">{m.text}</p>
            <MobileCardRow label={t('Date')} value={m.date} />
            <MobileCardRow label={t('Responded')} value={m.responded ? t('Yes') : t('No')} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Eye" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Social Media Monitoring')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Brand mentions and sentiment analysis')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Platform')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Author')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Mention')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Sentiment')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Responded')}</th>
              </tr>
            </thead>
            <tbody>
              {MENTIONS.map((m, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={PLATFORM_ICONS[m.platform]} size={14} className="text-muted" />
                      <span className="text-body">{m.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 font-medium text-heading">{m.author}</td>
                  <td className="max-w-[240px] truncate py-3 pe-4 text-body">{m.text}</td>
                  <td className="py-3 pe-4">
                    <Badge background={SENTIMENT_STYLES[m.sentiment].bg} color={SENTIMENT_STYLES[m.sentiment].fg}>{t(m.sentiment)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-muted">{m.date}</td>
                  <td className="py-3">
                    {m.responded
                      ? <span className="flex items-center gap-1 text-salis-blue"><Icon name="Check" size={14} />{t('Yes')}</span>
                      : <span className="text-muted">{t('No')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
