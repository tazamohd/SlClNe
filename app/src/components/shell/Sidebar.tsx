import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Role-filtered, grouped, collapsible sidebar.
 *
 *  Groups a role can't see are gone, not disabled — the user chose "hide it
 *  entirely" during design review. Every group starts expanded, matching the
 *  prototypes. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, rtl } = usePreferences()
  const { nav, userName, roleLabel, signOut } = useSession()
  const [collapsed, setCollapsed] = useState<readonly string[]>([])

  const toggleGroup = (label: string) =>
    setCollapsed((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )

  return (
    <aside className="flex h-full w-sidebar flex-shrink-0 flex-col border-e border-border bg-sidebar">
      <div className="p-3 pb-1">
        <div className="flex items-center gap-2 rounded border border-border bg-inset p-2">
          <Avatar name={userName} size={28} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-heading">{userName}</p>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-salis-blue/[.12] px-1.5 py-px text-[10px] font-semibold tracking-[.03em] text-salis-blue">
                {roleLabel}
              </span>
              <span className="rounded-full bg-salis-gradient px-1.5 py-px text-[10px] font-semibold tracking-[.03em] text-white">
                PRO
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label={t('Main navigation')} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {nav.map((group) => {
            const open = !collapsed.includes(group.label)
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={open}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent p-2 font-action text-[13px] font-extrabold uppercase tracking-[.05em] text-heading transition-colors duration-150 hover:bg-tint-blue"
                >
                  <span>{t(group.label)}</span>
                  <span className="flex-1" />
                  <Icon
                    name={open ? 'ChevronDown' : rtl ? 'ChevronLeft' : 'ChevronRight'}
                    size={12}
                    className="text-muted"
                  />
                </button>
                {open ? (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.route ?? '#'}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-md py-1.5 pe-3 ps-6',
                            'font-action text-xs font-medium no-underline transition-all duration-200',
                            isActive
                              ? 'bg-salis-gradient-r text-white shadow'
                              : 'text-heading hover:bg-salis-blue/[.08]'
                          )
                        }
                      >
                        <Icon name={group.icon} size={14} />
                        <span>{t(item.label)}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        <LanguageToggle />
        {/* Logout routes through the confirmation screen — the prototypes
            linked straight to Login and orphaned LogoutConfirmation. */}
        <NavLink
          to="/logout-confirmation"
          onClick={onNavigate}
          className="flex h-8 items-center gap-2 rounded-md px-2 py-1.5 font-action text-xs font-medium text-salis-orange no-underline transition-all duration-200 hover:bg-salis-orange hover:text-white"
        >
          <Icon name="LogOut" size={16} />
          <span>{t('Logout')}</span>
        </NavLink>
        <button type="button" onClick={signOut} className="hidden" aria-hidden />
      </div>
    </aside>
  )
}

function LanguageToggle() {
  const { rtl, toggleLanguage } = usePreferences()
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2 py-1.5 font-action text-xs font-medium text-muted transition-all duration-150 hover:bg-salis-blue/[.08] hover:text-salis-blue"
    >
      <Icon name="Globe" size={14} />
      <span>{rtl ? 'English' : 'عربي'}</span>
    </button>
  )
}
