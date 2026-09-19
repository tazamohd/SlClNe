import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { RepositoryError, useCollection, useDelete, useUpdate, type RowOf } from '@/data/useCollection'
import { rowId } from '../registry/writes'

/** F-181, the `/notifications` activity feed (BLK-004).
 *
 *  This screen held ten `Notification` literals — an invented appointment from
 *  "Ahmed Al-Rashid", an overdue `#INV-1042`, a "Backup Complete" that no
 *  backup job files — with relative timestamps ("5 min ago") baked into the
 *  constant, so the feed read as live while nothing behind it was. It now
 *  reads and writes the real `notifications` collection
 *  (`GET/POST/PATCH/DELETE /notifications`), the one `NotificationCenter.tsx`
 *  was built on.
 *
 *  Deliberately the same data, hooks and permission gates as
 *  `admin/NotificationCenter.tsx`, not a second interpretation of them:
 *  `useCollection('notifications')` for the rows, `dashboard:e` for
 *  mark-as-read (single and bulk), `dashboard:d` for dismiss, and no create
 *  action anywhere because a notification is filed by the system rather than
 *  typed in by a user. What differs is presentation only — this is the compact
 *  feed its spec shot draws (a stacked card list, unread tinted), where the
 *  Notification Center is the searchable table with severity totals.
 *
 *  Timestamps are the row's own `_createdAt` from the API, rendered as an
 *  absolute stamp; the old "5 min ago" strings were fiction, and a row the
 *  fixture build serves without a stamp shows an em dash rather than a
 *  guessed one. */

type Notification = RowOf<'notifications'>

/* Severity drives the icon tile, category the trailing badge — the same two
 * maps `NotificationCenter` reads, kept in the vocabulary of the contract
 * (`notificationSeverity`, `notificationCategory`) rather than the old
 * screen-local Info/Warning/Success/Error set that no column ever held.
 * The palette has no red (README §7), so critical rides navy. */
const SEVERITY_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  info: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'Info' },
  warning: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', icon: 'AlertTriangle' },
  critical: { bg: 'var(--tint-navy)', fg: 'var(--salis-navy)', icon: 'ShieldAlert' },
}

const CATEGORY_LABEL: Record<string, string> = {
  job: 'Job',
  appointment: 'Appointment',
  invoice: 'Invoice',
  stock: 'Stock',
  system: 'System',
}

/* Latin dates pinned LTR, matching `JobCardDetail`'s stamp so one record does
 * not read two ways depending on which screen shows it. */
const STAMP = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const NOT_RECORDED = '—'

function Stamp({ value }: { value?: string }) {
  if (!value) return <>{NOT_RECORDED}</>
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <>{NOT_RECORDED}</>
  return <span dir="ltr">{STAMP.format(date)}</span>
}

export function NotificationsList() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const { confirm } = useModal()
  const update = useUpdate('notifications')
  const remove = useDelete('notifications')
  const { data: notifications = [], isLoading, isError, error, refetch } = useCollection('notifications')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const mayWrite = can('dashboard', 'e')
  const mayDismiss = can('dashboard', 'd')

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const handleMarkRead = async (notification: Notification) => {
    const id = rowId(notification)
    if (!id) return
    setBusyId(id)
    try {
      await update.mutateAsync({ id, patch: { read: true } as Partial<Notification> })
    } catch (cause) {
      toast.show({
        title: t('Could not update notification'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read)
    if (unread.length === 0) return
    setMarkingAll(true)
    try {
      await Promise.all(
        unread.map((n) => {
          const id = rowId(n)
          return id ? update.mutateAsync({ id, patch: { read: true } as Partial<Notification> }) : Promise.resolve()
        }),
      )
      toast.show({ title: t('All notifications marked as read') })
    } catch (cause) {
      toast.show({
        title: t('Could not update notification'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDismiss = async (notification: Notification) => {
    const id = rowId(notification)
    if (!id) return
    const agreed = await confirm({
      title: t('Dismiss Notification?'),
      description: notification.title,
      icon: 'Trash2',
      confirmLabel: t('Dismiss'),
      destructive: true,
      variant: 'lifecycle',
    })
    if (!agreed) return
    setBusyId(id)
    try {
      await remove.mutateAsync({ id })
      toast.show({ title: t('Notification dismissed'), description: notification.title })
    } catch (cause) {
      toast.show({
        title: t('Could not dismiss notification'),
        description: cause instanceof RepositoryError ? cause.message : String(cause),
        error: true,
      })
    } finally {
      setBusyId(null)
    }
  }

  const markAllButton = (
    <Button
      variant="outline"
      size={isMobile ? 'sm' : 'md'}
      onClick={() => void handleMarkAllRead()}
      disabled={!mayWrite || markingAll || unreadCount === 0}
    >
      <Icon name="CheckCheck" size={isMobile ? 14 : 15} />
      {markingAll ? t('Updating...') : t('Mark all read')}
    </Button>
  )

  const rowActions = (n: Notification) => {
    if (!mayWrite && !mayDismiss) return null
    return (
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {mayWrite && !n.read ? (
          <Button size="sm" variant="subtle" onClick={() => void handleMarkRead(n)} disabled={busyId === rowId(n)}>
            <Icon name="Check" size={13} />
            {t('Mark as Read')}
          </Button>
        ) : null}
        {mayDismiss ? (
          <Button size="sm" variant="subtle" onClick={() => void handleDismiss(n)} disabled={busyId === rowId(n)}>
            <Icon name="Trash2" size={13} />
            {t('Dismiss')}
          </Button>
        ) : null}
      </div>
    )
  }

  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const emptyFeed = (
    <EmptyState icon="BellOff" title={t('No notifications yet')} description={t('Job, appointment, invoice and stock alerts appear here as the system files them.')} />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bell" title={t('Notifications')} subtitle={t('Activity feed')} />
        <div className="flex items-center justify-between gap-2">
          {unreadCount > 0 ? (
            <Badge background="var(--tint-blue)" color="var(--salis-blue)">
              {unreadCount} {t('unread')}
            </Badge>
          ) : (
            <span />
          )}
          {markAllButton}
        </div>
        {isLoading ? (
          <Loading label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          emptyFeed
        ) : (
          notifications.map((n) => {
            const style = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info
            return (
              <MobileCard key={rowId(n) ?? n.title}>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2">
                      <span className="flex rounded-lg p-1.5" style={{ background: style.bg, color: style.fg }} aria-hidden>
                        <Icon name={style.icon} size={14} />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-heading">{n.title}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-salis-blue" />}
                        </div>
                        <p className="text-xs text-muted">
                          <Stamp value={n._createdAt} />
                        </p>
                      </div>
                    </div>
                  }
                  trailing={
                    <Badge background="var(--tint-neutral)" color="var(--text-muted)">
                      {t(CATEGORY_LABEL[n.category] ?? n.category)}
                    </Badge>
                  }
                />
                <p className="mt-1 text-xs text-body">{n.message}</p>
                <div className="mt-2">{rowActions(n)}</div>
              </MobileCard>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Bell" size={28} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[30px] font-black text-heading">{t('Notifications')}</h1>
              {unreadCount > 0 && (
                <Badge background="var(--tint-blue)" color="var(--salis-blue)">{unreadCount}</Badge>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-muted">{t('Activity feed and alerts')}</p>
          </div>
        </div>
        {markAllButton}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        {isLoading ? (
          <Loading label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          emptyFeed
        ) : (
          <ul className="flex list-none flex-col gap-1 p-0">
            {notifications.map((n) => {
              const style = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.info
              return (
                <li
                  key={rowId(n) ?? n.title}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-colors ${!n.read ? 'bg-salis-blue/[.04]' : ''}`}
                >
                  <span className="mt-0.5 flex flex-shrink-0 rounded-lg p-1.5" style={{ background: style.bg, color: style.fg }} aria-hidden>
                    <Icon name={style.icon} size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-heading">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-salis-blue" />}
                      <Badge background="var(--tint-neutral)" color="var(--text-muted)">
                        {t(CATEGORY_LABEL[n.category] ?? n.category)}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-body">{n.message}</p>
                  </div>
                  {rowActions(n)}
                  <span className="flex-shrink-0 text-xs text-muted">
                    <Stamp value={n._createdAt} />
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
