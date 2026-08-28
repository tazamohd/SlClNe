import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Review {
  author: string
  rating: number
  date: string
  text: string
  replied: boolean
}

const REVIEWS: Review[] = [
  { author: 'Mohammed A.', rating: 5, date: 'Aug 16, 2026', text: 'Excellent service! My car was ready in two hours.', replied: true },
  { author: 'Sara K.', rating: 4, date: 'Aug 14, 2026', text: 'Good work overall, slightly long wait time.', replied: true },
  { author: 'Ali R.', rating: 5, date: 'Aug 12, 2026', text: 'Best workshop in Riyadh. Highly recommended.', replied: false },
  { author: 'Layla M.', rating: 3, date: 'Aug 10, 2026', text: 'Average experience. Pricing could be more transparent.', replied: true },
  { author: 'Faisal H.', rating: 5, date: 'Aug 08, 2026', text: 'Professional team and fair prices. Will come again.', replied: false },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="Star"
          size={14}
          className={i < rating ? 'text-[var(--salis-orange)]' : 'text-border'}
        />
      ))}
    </div>
  )
}

export function GoogleMyBusiness() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Average Rating'), value: '4.6', icon: 'Star', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Reviews'), value: '234', icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Profile Views'), value: '1,890', icon: 'Eye', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Direction Requests'), value: '456', icon: 'Navigation', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="MapPin" title={t('Google Business')} subtitle={t('Profile & reviews')} />
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
        {REVIEWS.map((r) => (
          <MobileCard key={r.author + r.date}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.author}</p>
                    <StarRating rating={r.rating} />
                  </div>
                </div>
              }
              trailing={
                r.replied
                  ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Replied')}</Badge>
                  : <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{t('Pending')}</Badge>
              }
            />
            <p className="mt-1 text-xs text-body">{r.text}</p>
            <p className="mt-1 text-[11px] text-muted">{r.date}</p>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MapPin" title={t('Google My Business')} subtitle={t('Profile performance and reviews')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Recent Reviews')}</h3>
        <div className="flex flex-col gap-4">
          {REVIEWS.map((r) => (
            <div key={r.author + r.date} className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-heading">{r.author}</span>
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-muted">{r.date}</span>
                </div>
                <p className="mt-1 text-sm text-body">{r.text}</p>
              </div>
              <div className="ms-4 flex-shrink-0">
                {r.replied
                  ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Replied')}</Badge>
                  : <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{t('Pending')}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
