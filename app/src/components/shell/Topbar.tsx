import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useNotifications } from '@/data/useNotifications'
import { CommandPalette, useGlobalSearch } from './CommandPalette'

/** 56px desktop header: search, command palette hint, theme, notifications,
 *  chat. Below 860px `AppShell` renders `MobileHeader` instead — the design's
 *  mobile header is a different composition, not this one narrowed. */
export function Topbar() {
  const { t, theme, toggleTheme } = usePreferences()
  const navigate = useNavigate()
  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch()
  const { unread } = useNotifications()

  return (
    <header className="relative z-sticky flex h-topbar flex-shrink-0 items-center gap-3 border-b border-border bg-sidebar px-4 shadow-sm sm:px-6">
      <div className="flex-1" />

      <span className="relative hidden w-full max-w-[280px] items-center sm:flex">
        <Icon
          name="Search"
          size={16}
          className="pointer-events-none absolute z-[1] text-muted start-2.5"
        />
        <input
          aria-label={t('Search customers, vehicles, parts...')}
          placeholder={t('Search customers, vehicles, parts...')}
          onFocus={(e) => { e.target.blur(); setSearchOpen(true) }}
          readOnly
          className="h-9 w-full cursor-pointer rounded border border-border bg-inset px-3 ps-8 font-ui text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
        />
      </span>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="hidden h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded border border-border bg-card px-3 font-action text-xs text-heading transition-all duration-200 hover:border-transparent hover:bg-salis-gradient hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue md:inline-flex"
      >
        <Icon name="Zap" size={14} />
        <span>{t('Quick Actions')}</span>
        <kbd className="rounded-[4px] border border-border bg-inset px-1 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <IconButton
        label={t('Toggle theme')}
        icon={theme === 'dark' ? 'Sun' : 'Moon'}
        onClick={toggleTheme}
      />
      <IconButton
        label={unread > 0 ? `${t('Notifications')}: ${unread} ${t('unread')}` : t('Notifications')}
        icon="Bell"
        onClick={() => navigate('/notification-center')}
        count={unread}
        testId="topbar-notifications"
      />
      <IconButton label={t('Chat')} icon="MessageSquare" onClick={() => navigate('/aiassistant')} />
    </header>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  count = 0,
  testId,
}: {
  /** Already translated. */
  label: string
  icon: string
  onClick?: () => void
  /** Unread count; hidden at zero. */
  count?: number
  testId?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      data-testid={testId}
      className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-all duration-150 hover:bg-tint-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
    >
      <Icon name={icon} size={16} />
      {count > 0 ? <CountBadge count={count} /> : null}
    </button>
  )
}

/** Unread pill for a bell. Two digits max — "99+" past that. Decorative to
 *  assistive tech: the count is spoken through the button's label. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      aria-hidden
      dir="ltr"
      className={cn(
        'absolute -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-sidebar bg-salis-orange px-1 font-mono text-[10px] font-bold leading-none text-white end-0',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
