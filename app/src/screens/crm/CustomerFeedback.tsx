import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Customer Feedback: CSAT dashboard — average rating, rating distribution
 *  and the reviews list with manager replies.
 *
 *  No matching `repository.ts` collection exists for reviews, so the design's
 *  demo rows live here as local consts, same as the design bundle's
 *  `CustomerFeedback.Mobile.dc.html`. Star fills are salis-orange, never the
 *  design's literal gold/yellow (README §7); the distribution bars stay on
 *  the blue → orange scale, not green/red. */

interface Review {
  filter: 'positive' | 'neutral' | 'negative'
  name: string
  initial: string
  rating: number
  service: string
  date: string
  text: string
  hasReply: boolean
  reply: string
}

const DISTRIBUTION = [
  { star: 5, count: 124, pct: 100, color: '#0A5ED7' },
  { star: 4, count: 38, pct: 31, color: '#0BB3FF' },
  { star: 3, count: 14, pct: 11, color: '#64748B' },
  { star: 2, count: 6, pct: 5, color: '#F97316' },
  { star: 1, count: 4, pct: 3, color: '#F97316' },
] as const

const REVIEWS: readonly Review[] = [
  {
    filter: 'positive',
    name: 'Ahmed Al-Rashid',
    initial: 'A',
    rating: 5,
    service: 'Maintenance',
    date: 'Jul 22',
    text: 'Fast turnaround and the technician explained everything clearly. The live tracking in the app was excellent.',
    hasReply: true,
    reply: "Thank you Ahmed! We're glad the tracking helped. See you at the next service.",
  },
  {
    filter: 'positive',
    name: 'Layla Al-Sulaiman',
    initial: 'L',
    rating: 5,
    service: 'AC Service',
    date: 'Jul 20',
    text: 'AC works perfectly again after two other shops failed to fix it. Fair pricing too.',
    hasReply: true,
    reply: 'Thanks Layla — happy we could sort it out for you.',
  },
  {
    filter: 'neutral',
    name: 'Mohammed Hassan',
    initial: 'M',
    rating: 3,
    service: 'Diagnostics',
    date: 'Jul 18',
    text: 'Diagnosis was accurate but I waited longer than the quoted time for parts to arrive.',
    hasReply: true,
    reply: "Sorry about the wait, Mohammed. We've since added same-day sourcing for common parts.",
  },
  {
    filter: 'positive',
    name: 'Sara Al-Mutairi',
    initial: 'S',
    rating: 4,
    service: 'Brakes',
    date: 'Jul 15',
    text: 'Good work on the brakes. Would have liked a written summary of what was replaced.',
    hasReply: false,
    reply: '',
  },
  {
    filter: 'negative',
    name: 'Noura Al-Saud',
    initial: 'N',
    rating: 2,
    service: 'Body & Paint',
    date: 'Jul 12',
    text: 'Paint match was slightly off on the rear panel and I had to bring it back.',
    hasReply: true,
    reply: "We're sorry, Noura. The rework has been scheduled at no charge with our senior painter.",
  },
]

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'positive', label: '4–5 Stars' },
  { id: 'neutral', label: '3 Stars' },
  { id: 'negative', label: '1–2 Stars' },
] as const

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="Star"
          size={size}
          fill={i <= rating ? 'currentColor' : 'none'}
          className={i <= rating ? 'text-salis-orange' : 'text-border-strong'}
        />
      ))}
    </div>
  )
}

export function CustomerFeedback() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<'all' | Review['filter']>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? REVIEWS : REVIEWS.filter((r) => r.filter === filter)),
    [filter]
  )

  return (
    <>
      <FeatureHeader
        icon="MessageSquareQuote"
        title={t('Customer Feedback')}
        subtitle={t('CSAT / feedback')}
      />

      <StatRow
        stats={[
          { label: 'Average Rating', value: '4.7 / 5', caption: 'All reviews', highlight: true, icon: 'Star' },
          { label: 'Total Reviews', value: 186, caption: 'All time' },
          { label: 'Response Rate', value: '92%', caption: 'Reviews replied to', tone: 'info' },
          { label: 'NPS Score', value: 72, caption: 'Net promoter score' },
        ]}
      />

      <Section title={t('Rating Distribution')}>
        <div className="flex flex-col gap-2.5">
          {DISTRIBUTION.map((d) => (
            <div key={d.star} className="flex items-center gap-2.5">
              <span className="w-6 flex-shrink-0 font-mono text-xs text-muted" dir="ltr">
                {d.star}★
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${d.pct}%`, background: d.color }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-end font-mono text-xs text-muted" dir="ltr">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div role="tablist" aria-label={t('Filter')} className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5',
              'font-action text-[13px] font-medium transition-all duration-150',
              filter === f.id
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            {t(f.label)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <Card key={r.name} className="flex flex-col gap-2 rounded-lg p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xs font-bold text-white">
                {r.initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{r.name}</p>
                <p className="text-xs text-muted">
                  {t(r.service)} · {r.date}
                </p>
              </div>
              <Stars rating={r.rating} size={11} />
            </div>
            <p className="text-[13px] leading-relaxed text-body">{t(r.text)}</p>
            {r.hasReply ? (
              <div className="rounded-lg border border-border bg-inset p-3">
                <p className="text-[11px] font-semibold text-salis-blue">{t('Your reply')}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t(r.reply)}</p>
              </div>
            ) : null}
          </Card>
        ))}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">{t('No feedback in this view')}</p>
        ) : null}
      </div>
    </>
  )
}
