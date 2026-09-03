import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { useNotifications, type NotificationItem } from '@/data/useNotifications'
import { useDateFormat } from '@/lib/formatDate'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The notification centre, reading the same collection the bell counts.
 *
 *  The previous version held eight rows in a local array with a `readSet`
 *  that reset on navigation, so the bell's orange dot never went away.
 *  Marking read now writes through the seam; the badge in the topbar, the
 *  phone header and the customer app all fall to zero together. */
type FilterId = 'all' | 'unread' | 'alerts'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All Notifications' },
  { id: 'unread', label: 'Unread' },
  { id: 'alerts', label: 'Alerts' },
]

const KIND_LABEL: Record<NotificationItem['kind'], string> = {
  jobs: 'Job Cards',
  appointments: 'Appointments',
  alerts: 'Alerts',
  finance: 'Finance',
}

export function NotificationCenter() {
  const { t } = usePreferences()
  const { relative } = useDateFormat()
  const navigate = useNavigate()
  const { items, unread, isLoading, isError, error, refetch, markRead, markAllRead, pending } = useNotifications()
  const [filter, setFilter] = useState<FilterId>('all')

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.readAt)
    if (filter === 'alerts') return items.filter((n) => n.kind === 'alerts')
    return items
  }, [items, filter])

  const open = (item: NotificationItem) => {
    if (!item.readAt) markRead(item.id)
    if (item.route) navigate(item.route)
  }

  return (
    <ScreenFrame
      icon="Bell"
      title="Notification Center"
      subtitle={
        <>
          <span dir="ltr" className="font-mono tabular-nums">
            {unread}
          </span>{' '}
          {t('unread')}
        </>
      }
      query={{ isLoading, isError, error, refetch }}
      skeleton="cards"
      empty={
        !isLoading && filtered.length === 0
          ? {
              icon: filter === 'unread' ? 'CheckCheck' : 'BellOff',
              title: filter === 'unread' ? "You're all caught up" : 'No notifications yet',
              description:
                filter === 'unread'
                  ? 'Every notification has been read.'
                  : 'Job, appointment, stock and payment events will appear here.',
            }
          : false
      }
      actions={
        <Button
          variant="outline"
          size="md"
          icon="CheckCheck"
          onClick={markAllRead}
          disabled={unread === 0}
          loading={pending}
          loadingLabel="Saving..."
        >
          {t('Mark all as read')}
        </Button>
      }
      toolbar={
        <ChipGroup label={t('Filter notifications')}>
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              label={f.id === 'unread' ? `${t(f.label)} (${unread})` : t(f.label)}
              selected={filter === f.id}
              onToggle={() => setFilter(f.id)}
            />
          ))}
        </ChipGroup>
      }
    >
      <Card className="divide-y divide-border overflow-hidden">
        {filtered.map((item) => {
          const isUnread = !item.readAt
          const alert = item.kind === 'alerts'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item)}
              data-testid="notification-row"
              aria-label={`${t(item.title)}${isUnread ? ` — ${t('unread')}` : ''}`}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3.5 border-none px-4 py-3.5 text-start transition-colors sm:px-5',
                'hover:bg-salis-blue/[.04] focus-visible:outline-none focus-visible:bg-salis-blue/[.08]',
                isUnread ? 'bg-tint-blue/40' : 'bg-transparent'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex flex-shrink-0 rounded-lg p-2',
                  alert ? 'bg-tint-orange text-salis-orange' : 'bg-tint-blue text-salis-blue'
                )}
              >
                <Icon name={item.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn('text-sm text-heading', isUnread ? 'font-bold' : 'font-semibold')}>
                    {t(item.title)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-px text-[11px] font-medium',
                      alert ? 'bg-tint-orange text-salis-orange' : 'bg-tint-blue text-salis-blue'
                    )}
                  >
                    {t(KIND_LABEL[item.kind])}
                  </span>
                </span>
                <span dir="ltr" className="mt-0.5 block truncate text-[13px] text-muted">
                  {item.body}
                </span>
              </span>
              <span className="flex flex-shrink-0 flex-col items-end gap-1.5">
                <span className="text-[11px] text-faint">{relative(item.createdAt)}</span>
                {isUnread ? (
                  <span aria-hidden className="h-2 w-2 rounded-full bg-salis-orange" />
                ) : null}
              </span>
            </button>
          )
        })}
      </Card>
    </ScreenFrame>
  )
}
