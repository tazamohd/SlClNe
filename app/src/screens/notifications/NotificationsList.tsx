import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { isLive } from '@/data/repository'

interface Notification {
  title: string
  message: string
  type: 'Info' | 'Warning' | 'Success' | 'Error'
  timestamp: string
  read: boolean
  category: 'System' | 'Appointment' | 'Invoice' | 'Job'
}

const NOTIFICATIONS: Notification[] = [
  { title: 'New Appointment', message: 'Ahmed Al-Rashid booked a service for tomorrow at 10:00 AM', type: 'Info', timestamp: '5 min ago', read: false, category: 'Appointment' },
  { title: 'Invoice Overdue', message: 'Invoice #INV-1042 is 7 days past due', type: 'Warning', timestamp: '15 min ago', read: false, category: 'Invoice' },
  { title: 'Job Completed', message: 'Job Card #JC-2089 has been marked as completed', type: 'Success', timestamp: '1 hour ago', read: false, category: 'Job' },
  { title: 'System Update', message: 'System maintenance scheduled for tonight at 2:00 AM', type: 'Info', timestamp: '2 hours ago', read: true, category: 'System' },
  { title: 'Payment Received', message: 'SAR 3,450 received for Invoice #INV-1038', type: 'Success', timestamp: '3 hours ago', read: true, category: 'Invoice' },
  { title: 'Low Stock Alert', message: 'Oil Filter (Part #OF-204) is below minimum stock level', type: 'Warning', timestamp: '4 hours ago', read: false, category: 'System' },
  { title: 'Appointment Cancelled', message: 'Khalid Mohammed cancelled his appointment for Aug 20', type: 'Error', timestamp: '5 hours ago', read: true, category: 'Appointment' },
  { title: 'New Customer', message: 'Fatima Al-Saud registered as a new customer', type: 'Info', timestamp: '6 hours ago', read: true, category: 'System' },
  { title: 'Job Started', message: 'Technician Yusuf started working on Job Card #JC-2091', type: 'Info', timestamp: 'Yesterday', read: true, category: 'Job' },
  { title: 'Backup Complete', message: 'Daily database backup completed successfully', type: 'Success', timestamp: 'Yesterday', read: true, category: 'System' },
]

const TYPE_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  Info: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'Info' },
  Warning: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)', icon: 'AlertTriangle' },
  Success: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)', icon: 'CheckCircle' },
  Error: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)', icon: 'XCircle' },
}

export function NotificationsList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bell" title={t('Notifications')} subtitle={t('Activity feed')} />
        <div className="flex items-center justify-between">
          {unreadCount > 0 && (
            <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{unreadCount} {t('unread')}</Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={!isLive || unreadCount === 0}>
            <Icon name="CheckCheck" size={14} />
            {t('Mark all read')}
          </Button>
        </div>
        {notifications.map((n, i) => {
          const style = TYPE_STYLES[n.type]
          return (
            <MobileCard key={i}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg p-1.5" style={{ background: style.bg, color: style.fg }} aria-hidden><Icon name={style.icon} size={14} /></span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold text-heading">{t(n.title)}</p>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-salis-blue" />}
                      </div>
                      <p className="text-xs text-muted">{n.timestamp}</p>
                    </div>
                  </div>
                }
                trailing={<Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{t(n.category)}</Badge>}
              />
              <p className="mt-1 text-xs text-body">{t(n.message)}</p>
            </MobileCard>
          )
        })}
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
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{unreadCount}</Badge>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-muted">{t('Activity feed and alerts')}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={!isLive || unreadCount === 0}>
          <Icon name="CheckCheck" size={15} />
          {t('Mark all read')}
        </Button>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          {notifications.map((n, i) => {
            const style = TYPE_STYLES[n.type]
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-colors ${!n.read ? 'bg-[rgba(10,94,215,.04)]' : ''}`}
              >
                <span className="mt-0.5 flex flex-shrink-0 rounded-lg p-1.5" style={{ background: style.bg, color: style.fg }} aria-hidden>
                  <Icon name={style.icon} size={16} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-heading">{t(n.title)}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-salis-blue" />}
                    <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{t(n.category)}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-body">{t(n.message)}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-muted">{n.timestamp}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
