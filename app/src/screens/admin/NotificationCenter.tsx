import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow, MobileCard, MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

interface Notification {
  id: number
  icon: string
  title: string
  body: string
  time: string
  category: 'jobs' | 'appointments' | 'alerts' | 'finance'
  categoryLabel: string
  iconBg: string
  categoryBg: string
  categoryFg: string
  unread: boolean
}

type FilterId = 'all' | 'unread' | 'alerts'

function useNotifications(t: (s: string) => string) {
  return useMemo<Notification[]>(() => [
    { id: 1, icon: 'Wrench', title: t('New Job Card Created'), body: 'JC-E5D7A3B5 — Sara Al-Mutairi · Ford Explorer 2022', time: t('just now'), category: 'jobs', categoryLabel: t('Job Cards'), iconBg: 'var(--tint-blue)', categoryBg: 'var(--tint-blue)', categoryFg: 'var(--salis-blue)', unread: true },
    { id: 2, icon: 'Calendar', title: t('Appointment Confirmed'), body: 'Ahmed Al-Rashid — ' + t('Maintenance') + ' · Jul 23, 9:00 AM', time: '5 ' + t('minutes ago'), category: 'appointments', categoryLabel: t('Appointments'), iconBg: 'var(--tint-bright)', categoryBg: 'var(--tint-bright)', categoryFg: 'var(--salis-blue-bright)', unread: true },
    { id: 3, icon: 'AlertTriangle', title: t('Invoice Overdue'), body: 'INV-2026-0141 — Fatima Al-Zahrani · SAR 4,250', time: '2 ' + t('hours ago'), category: 'alerts', categoryLabel: t('Alerts'), iconBg: 'var(--tint-orange)', categoryBg: 'var(--tint-orange)', categoryFg: 'var(--salis-orange)', unread: true },
    { id: 4, icon: 'Package', title: t('Low Stock Alert'), body: t('Brake Pads (Front)') + ' — 18/25 ' + t('In Stock'), time: '3 ' + t('hours ago'), category: 'alerts', categoryLabel: t('Alerts'), iconBg: 'var(--tint-orange)', categoryBg: 'var(--tint-orange)', categoryFg: 'var(--salis-orange)', unread: true },
    { id: 5, icon: 'CreditCard', title: t('Payment Received'), body: 'INV-2026-0140 — Omar Al-Ghamdi · SAR 620', time: t('yesterday'), category: 'finance', categoryLabel: t('Finance'), iconBg: 'var(--tint-blue)', categoryBg: 'var(--tint-blue)', categoryFg: 'var(--salis-blue)', unread: false },
    { id: 6, icon: 'FileCheck', title: t('Estimate Approved'), body: 'EST-0230 — Mohammed Hassan · SAR 3,600', time: t('yesterday'), category: 'jobs', categoryLabel: t('Job Cards'), iconBg: 'var(--tint-blue)', categoryBg: 'var(--tint-blue)', categoryFg: 'var(--salis-blue)', unread: false },
    { id: 7, icon: 'ShieldCheck', title: t('QC Passed'), body: 'JC-C2A9F4E3 — Omar Al-Ghamdi · Hyundai Sonata 2023', time: '2 ' + t('days ago'), category: 'jobs', categoryLabel: t('Job Cards'), iconBg: 'var(--tint-blue)', categoryBg: 'var(--tint-blue)', categoryFg: 'var(--salis-blue)', unread: false },
    { id: 8, icon: 'Car', title: t('Vehicle Ready'), body: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry 2022', time: '2 ' + t('days ago'), category: 'jobs', categoryLabel: t('Job Cards'), iconBg: 'var(--tint-bright)', categoryBg: 'var(--tint-bright)', categoryFg: 'var(--salis-blue-bright)', unread: false },
  ], [t])
}

const FILTERS: { id: FilterId; labelKey: string }[] = [
  { id: 'all', labelKey: 'All Notifications' },
  { id: 'unread', labelKey: 'Unread' },
  { id: 'alerts', labelKey: 'Alerts' },
]

export function NotificationCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const allNotifs = useNotifications(t)

  const [filter, setFilter] = useState<FilterId>('all')
  const [readSet, setReadSet] = useState<Record<number, boolean>>({})

  const markRead = (id: number) => setReadSet((prev) => ({ ...prev, [id]: true }))
  const markAllRead = () => {
    const next: Record<number, boolean> = {}
    for (const n of allNotifs) next[n.id] = true
    setReadSet(next)
  }

  const unreadCount = allNotifs.filter((n) => n.unread && !readSet[n.id]).length

  const filtered = useMemo(() => {
    if (filter === 'unread') return allNotifs.filter((n) => n.unread && !readSet[n.id])
    if (filter === 'alerts') return allNotifs.filter((n) => n.category === 'alerts')
    return allNotifs
  }, [allNotifs, filter, readSet])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Bell"
          title={t('Notification Center')}
          subtitle={unreadCount + ' ' + t('unread')}
        />

        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'primary' : 'subtle'}
              size="sm"
              onClick={() => setFilter(f.id)}
            >
              {t(f.labelKey)}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <Icon name="CheckCheck" size={14} />
            {t('Mark All Read')}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon="BellOff"
              title={t('No notifications')}
              description={t('Nothing matches the current filters.')}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n) => {
              const isUnread = n.unread && !readSet[n.id]
              return (
                <MobileCard key={n.id} onClick={() => markRead(n.id)}>
                  <MobileCardHeader
                    leading={
                      <div className="flex items-center gap-2">
                        <span
                          className="flex flex-shrink-0 rounded-lg p-2"
                          style={{ background: n.iconBg, color: n.categoryFg }}
                        >
                          <Icon name={n.icon} size={16} />
                        </span>
                        <span className="text-[13px] font-semibold text-heading">{n.title}</span>
                        {isUnread && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-salis-blue" />
                        )}
                      </div>
                    }
                  />
                  <MobileCardRow label={n.body} />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted">{n.time}</span>
                    <Badge background={n.categoryBg} color={n.categoryFg}>
                      {n.categoryLabel}
                    </Badge>
                  </div>
                </MobileCard>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[800px] animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Bell" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">{t('Notification Center')}</h1>
            <p className="mt-0.5 text-sm text-muted">{unreadCount} {t('unread')}</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex overflow-hidden rounded-lg border border-border">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                'h-[34px] cursor-pointer border-none px-3.5 font-action text-xs font-semibold transition-colors ' +
                (filter === f.id
                  ? 'bg-salis-gradient text-white'
                  : 'bg-card text-body hover:bg-inset')
              }
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <Button variant="subtle" size="sm" onClick={markAllRead}>
          <Icon name="CheckCheck" size={14} />
          {t('Mark All Read')}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon="BellOff"
            title={t('No notifications')}
            description={t('Nothing matches the current filters.')}
          />
        </Card>
      ) : (
        <div className="flex flex-col">
          {filtered.map((n) => {
            const isUnread = n.unread && !readSet[n.id]
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    markRead(n.id)
                  }
                }}
                className="flex cursor-pointer gap-3.5 border-0 border-b border-solid border-border px-4 py-4 transition-colors duration-150 hover:bg-[rgba(10,94,215,.03)]"
                style={isUnread ? { background: 'rgba(10,94,215,.03)' } : undefined}
              >
                <span
                  className="flex flex-shrink-0 rounded-xl p-2.5"
                  style={{ background: n.iconBg, color: n.categoryFg }}
                >
                  <Icon name={n.icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-heading">{n.title}</p>
                    {isUnread && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-salis-blue" />
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-body">{n.body}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] text-muted">{n.time}</span>
                    <Badge background={n.categoryBg} color={n.categoryFg}>
                      {n.categoryLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
