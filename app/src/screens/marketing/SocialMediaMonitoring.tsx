import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Positive: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Neutral: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  Negative: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
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
    { label: t('Total Mentions'), value: '342', icon: 'AtSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Positive'), value: '68%', icon: 'ThumbsUp', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Response Rate'), value: '82%', icon: 'MessageCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Response Time'), value: '2.4h', icon: 'Clock', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Mention>[] = [
    {
      header: 'Platform',
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          <Icon name={PLATFORM_ICONS[m.platform]} size={14} className="text-muted" />
          <span className="text-body">{m.platform}</span>
        </div>
      ),
    },
    { header: 'Author', cell: (m) => <span className="font-medium text-heading">{m.author}</span> },
    { header: 'Mention', cell: (m) => <span className="max-w-[240px] truncate text-body">{m.text}</span> },
    { header: 'Sentiment', cell: (m) => <Badge background={SENTIMENT_STYLES[m.sentiment].bg} color={SENTIMENT_STYLES[m.sentiment].fg}>{t(m.sentiment)}</Badge> },
    { header: 'Date', cell: (m) => <span className="text-muted">{m.date}</span> },
    {
      header: 'Responded',
      cell: (m) =>
        m.responded
          ? <span className="flex items-center gap-1 text-salis-blue"><Icon name="Check" size={14} />{t('Yes')}</span>
          : <span className="text-muted">{t('No')}</span>,
    },
  ]

  const table = (
    <DataTable
      caption="Social media mentions"
      columns={columns}
      rows={MENTIONS}
      rowKey={(_, i) => `mention-${i}`}
      mobileCard={(m) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name={PLATFORM_ICONS[m.platform]} size={14} /></span>
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
        </>
      )}
    />
  )

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
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Eye" title={t('Social Media Monitoring')} subtitle={t('Brand mentions and sentiment analysis')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
