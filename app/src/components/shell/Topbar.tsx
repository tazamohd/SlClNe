import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** 56px desktop header: search, command palette hint, theme, notifications,
 *  chat. Below 860px `AppShell` renders `MobileHeader` instead — the design's
 *  mobile header is a different composition, not this one narrowed. */
export function Topbar() {
  const { t, theme, toggleTheme } = usePreferences()
  const navigate = useNavigate()

  return (
    <header className="relative z-[5] flex h-topbar flex-shrink-0 items-center gap-3 border-b border-border bg-sidebar px-6 shadow-sm">
      <div className="flex-1" />

      <span className="relative hidden items-center sm:flex">
        <Icon
          name="Search"
          size={16}
          className="pointer-events-none absolute z-[1] text-muted start-2.5"
        />
        <input
          placeholder={t('Search customers, vehicles, parts...')}
          onFocus={() => navigate('/global-search')}
          className="h-9 w-[260px] rounded border border-border bg-inset px-3 ps-8 font-ui text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
        />
      </span>

      <button
        type="button"
        className="hidden h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded border border-border bg-card px-3 font-action text-xs text-heading transition-all duration-200 hover:border-transparent hover:bg-salis-gradient hover:text-white md:inline-flex"
      >
        <Icon name="Zap" size={14} />
        <span>{t('Quick Actions')}</span>
        <kbd className="rounded-[4px] border border-border bg-inset px-1 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      <IconButton
        label="Toggle theme"
        icon={theme === 'dark' ? 'Sun' : 'Moon'}
        onClick={toggleTheme}
      />
      <IconButton
        label="Notifications"
        icon="Bell"
        onClick={() => navigate('/notification-center')}
        badge
      />
      <IconButton label="Chat" icon="MessageSquare" onClick={() => navigate('/aiassistant')} />
    </header>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  badge,
}: {
  label: string
  icon: string
  onClick?: () => void
  /** Unread dot, as on the notifications bell. */
  badge?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-all duration-150 hover:bg-[rgba(10,94,215,.1)] hover:text-salis-blue"
    >
      <Icon name={icon} size={16} />
      {badge ? (
        <span className="absolute top-[5px] h-2 w-2 rounded-full border-2 border-sidebar bg-salis-orange end-1.5" />
      ) : null}
    </button>
  )
}
