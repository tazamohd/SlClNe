import { useMemo, useState } from 'react'
import { StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { RepositoryError, useCollection, useDelete, useUpdate, type RowOf } from '@/data/useCollection'
import {
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { rowId } from '../registry/writes'

/** Notifications (BLK-004) — a per-tenant feed of job, appointment, invoice
 *  and stock alerts. This screen used to render a hardcoded fixture (a
 *  fictional job card, an invented overdue invoice, ...) with no backend
 *  anywhere; it now reads and writes `notifications`
 *  (`GET/POST/PATCH/DELETE /notifications`), a flat generic collection with
 *  no bespoke router behind it. A notification is filed by the system, not
 *  typed in by a user, so this screen has no create action — only mark as
 *  read (single and bulk) and dismiss, both real field writes. */

type Notification = RowOf<'notifications'>

const CATEGORY_PALETTE: Record<string, readonly [string, string]> = {
  job: ['var(--tint-blue)', 'var(--salis-blue)'],
  appointment: ['var(--tint-navy)', 'var(--salis-navy)'],
  invoice: ['var(--tint-orange)', 'var(--salis-orange)'],
  stock: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  system: ['var(--tint-neutral)', 'var(--text-muted)'],
}

const CATEGORY_LABEL: Record<string, string> = {
  job: 'Job',
  appointment: 'Appointment',
  invoice: 'Invoice',
  stock: 'Stock',
  system: 'System',
}

/* The palette has no red (README §7) — critical rides the darkest available
 *  tint (navy) so it still reads as more urgent than a plain warning. */
const SEVERITY_PALETTE: Record<string, readonly [string, string]> = {
  info: ['var(--tint-blue)', 'var(--salis-blue)'],
  warning: ['var(--tint-orange)', 'var(--salis-orange)'],
  critical: ['var(--tint-navy)', 'var(--salis-navy)'],
}

const SEVERITY_LABEL: Record<string, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
}

export function NotificationCenter() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const toast = useToast()
  const { confirm } = useModal()
  const update = useUpdate('notifications')
  const remove = useDelete('notifications')
  const { data: notifications = [], isLoading, isError, error, refetch } = useCollection('notifications')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const mayWrite = can('dashboard', 'e')
  const mayDismiss = can('dashboard', 'd')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return notifications
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(needle) || n.message.toLowerCase().includes(needle),
    )
  }, [notifications, query])

  const totals = useMemo(() => {
    let unread = 0
    let critical = 0
    for (const n of notifications) {
      if (!n.read) unread++
      if (n.severity === 'critical' && !n.read) critical++
    }
    return { total: notifications.length, unread, critical }
  }, [notifications])

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

  const stats: Stat[] = [
    { label: 'Total Notifications', value: totals.total, caption: 'All records', highlight: true },
    { label: 'Unread', value: totals.unread, caption: 'Needs attention', tone: totals.unread > 0 ? 'warning' : 'info' },
    { label: 'Critical Unread', value: totals.critical, caption: 'Highest severity', tone: totals.critical > 0 ? 'warning' : 'info' },
  ]

  const columns: Column<Notification>[] = [
    {
      header: 'Category',
      cell: (n) => {
        const [bg, fg] = CATEGORY_PALETTE[n.category] ?? CATEGORY_PALETTE.system
        return <Badge background={bg} color={fg}>{t(CATEGORY_LABEL[n.category] ?? n.category)}</Badge>
      },
    },
    {
      header: 'Severity',
      cell: (n) => {
        const [bg, fg] = SEVERITY_PALETTE[n.severity] ?? SEVERITY_PALETTE.info
        return <Badge background={bg} color={fg}>{t(SEVERITY_LABEL[n.severity] ?? n.severity)}</Badge>
      },
    },
    {
      header: 'Notification',
      cell: (n) => (
        <div className="flex flex-col gap-0.5">
          <span className={n.read ? 'text-body' : 'font-semibold text-heading'}>{n.title}</span>
          <span className="text-[12px] text-muted">{n.message}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (n) =>
        n.read ? (
          <Badge background="var(--tint-neutral)" color="var(--text-muted)">{t('Read')}</Badge>
        ) : (
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Unread')}</Badge>
        ),
    },
    ...(mayWrite || mayDismiss
      ? [
          {
            header: 'Actions',
            cell: (n: Notification) => (
              <div className="flex items-center gap-2">
                {mayWrite && !n.read ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void handleMarkRead(n)}
                    disabled={busyId === rowId(n)}
                  >
                    <Icon name="Check" size={13} />
                    {t('Mark as Read')}
                  </Button>
                ) : null}
                {mayDismiss ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void handleDismiss(n)}
                    disabled={busyId === rowId(n)}
                  >
                    <Icon name="Trash2" size={13} />
                    {t('Dismiss')}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
  ]

  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const table = (
    <DataTable
      caption="Notifications"
      columns={columns}
      rows={filtered}
      rowKey={(n) => rowId(n) ?? n.title}
      loading={isLoading}
      mobileCard={(n) => {
        const [catBg, catFg] = CATEGORY_PALETTE[n.category] ?? CATEGORY_PALETTE.system
        return (
          <>
            <MobileCardHeader
              title={n.title}
              trailing={
                n.read ? null : <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Unread')}</Badge>
              }
            />
            <MobileCardRow>{n.message}</MobileCardRow>
            <MobileCardRow label={t('Category')}>
              <Badge background={catBg} color={catFg}>{t(CATEGORY_LABEL[n.category] ?? n.category)}</Badge>
            </MobileCardRow>
          </>
        )
      }}
      empty={
        <EmptyState
          icon="BellOff"
          title={t(notifications.length === 0 ? 'No notifications yet' : 'No notifications match the filter')}
        />
      }
    />
  )

  const markAllButton =
    mayWrite && totals.unread > 0 ? (
      <Button size="md" variant="subtle" onClick={() => void handleMarkAllRead()} disabled={markingAll}>
        <Icon name="CheckCheck" size={16} />
        {markingAll ? t('Updating...') : t('Mark all as read')}
      </Button>
    ) : null

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bell" title={t('Notification Center')} subtitle={t('Job, appointment, invoice and stock alerts')} />
        {markAllButton}
        <StatRow stats={stats} />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Title or message')}
          aria-label={t('Search notifications')}
          inputSize="sm"
        />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <ListPageHeader
        title={t('Notification Center')}
        subtitle={t('Job, appointment, invoice and stock alerts')}
        actions={markAllButton}
      />
      <StatRow stats={stats} />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Title or message')}
          aria-label={t('Search notifications')}
          inputSize="sm"
        />
      </label>

      {table}
    </div>
  )
}
