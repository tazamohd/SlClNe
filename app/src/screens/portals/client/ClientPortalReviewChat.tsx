import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Review {
  id: string
  service: string
  date: string
  rating: number
  comment: string
  advisor: string
  status: 'Published' | 'Pending' | 'Replied'
}

interface ChatMessage {
  id: string
  from: string
  role: 'advisor' | 'customer'
  message: string
  time: string
  read: boolean
}

const REVIEWS: Review[] = [
  { id: 'REV-101', service: 'Oil Change', date: '2025-08-15', rating: 5, comment: 'Excellent service, very professional team', advisor: 'Khalid Al-Rashid', status: 'Published' },
  { id: 'REV-102', service: 'AC Service', date: '2025-08-08', rating: 4, comment: 'Good work, slightly delayed but quality was great', advisor: 'Omar Al-Hamdan', status: 'Replied' },
  { id: 'REV-103', service: 'Brake Service', date: '2025-07-15', rating: 5, comment: 'Fast turnaround and fair pricing', advisor: 'Faisal Al-Dosari', status: 'Published' },
]

const MESSAGES: ChatMessage[] = [
  { id: 'MSG-1', from: 'Khalid Al-Rashid', role: 'advisor', message: 'Your vehicle is ready for pickup', time: '2:30 PM', read: true },
  { id: 'MSG-2', from: 'You', role: 'customer', message: 'Great, I will be there by 4 PM', time: '2:45 PM', read: true },
  { id: 'MSG-3', from: 'Khalid Al-Rashid', role: 'advisor', message: 'We also noticed your tires need attention. Would you like a quote?', time: '2:50 PM', read: false },
  { id: 'MSG-4', from: 'Omar Al-Hamdan', role: 'advisor', message: 'Your AC parts have arrived. Please book an appointment.', time: '10:15 AM', read: false },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Published: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Replied: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="Star" size={12} className={i < rating ? 'text-salis-orange' : 'text-muted/30'} />
      ))}
    </div>
  )
}

export function ClientPortalReviewChat() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const unreadCount = MESSAGES.filter((m) => !m.read).length

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="MessageSquare" title={t('Reviews & Chat')} subtitle={t('Feedback and messages')} />
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Messages')}</p>} trailing={unreadCount > 0 ? <Badge background="var(--tint-blue)" color="var(--salis-blue)">{unreadCount} {t('unread')}</Badge> : undefined} />
          {MESSAGES.map((m) => (
            <MobileCardRow key={m.id} label={m.from} value={
              <span className={m.read ? 'text-xs text-muted' : 'text-xs font-semibold text-heading'}>{m.message.length > 30 ? m.message.slice(0, 30) + '...' : m.message}</span>
            } />
          ))}
        </MobileCard>
        {REVIEWS.map((r) => (
          <MobileCard key={r.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Star" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.service}</p>
                    <StarRating rating={r.rating} />
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge>}
            />
            <MobileCardRow label={t('Comment')} value={r.comment} />
            <MobileCardRow label={t('Date')} value={r.date} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquare" title={t('Reviews & Chat')} subtitle={t('Feedback and advisor messages')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="MessageCircle" size={16} /></span>
              <h2 className="text-sm font-semibold text-heading">{t('Messages')}</h2>
            </div>
            {unreadCount > 0 && <Badge background="var(--tint-blue)" color="var(--salis-blue)">{unreadCount} {t('unread')}</Badge>}
          </div>
          <div className="grid gap-3">
            {MESSAGES.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1 rounded-xl p-3 ${m.role === 'customer' ? 'bg-salis-blue/[.05] ms-8' : 'bg-surface me-8'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-heading">{m.from}</span>
                  <span className="text-[10px] text-muted">{m.time}</span>
                </div>
                <p className={`text-sm ${m.read ? 'text-body' : 'font-medium text-heading'}`}>{m.message}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Star" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('My Reviews')}</h2>
          </div>
          <div className="grid gap-4">
            {REVIEWS.map((r) => (
              <div key={r.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-heading">{r.service}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge>
                </div>
                <p className="mt-2 text-sm text-body">{r.comment}</p>
                <p className="mt-1 text-xs text-muted">{r.date} - {r.advisor}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
