import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { DEFAULT_COLLAPSED, iconForItem } from '@/data/nav-journey'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Role-filtered, journey-grouped, collapsible sidebar.
 *
 *  Groups a role can't see are gone, not disabled — the user chose "hide it
 *  entirely" during design review. Fold state persists per browser: a parts
 *  clerk who folds Growth on Monday should not find it open on Tuesday. The
 *  group holding the current route unfolds on navigation so the highlight is
 *  never hidden. Thirteen groups is more than a glance can scan, so a filter
 *  box narrows the tree to matching items. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, rtl } = usePreferences()
  const { nav, userName, roleLabel } = useSession()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState<readonly string[]>(() => readCollapsed())
  const [filter, setFilter] = useState('')

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
      writeStored(STORAGE_KEYS.navCollapsed, JSON.stringify(next))
      return next
    })

  // The active group unfolds when the route lands in it.
  useEffect(() => {
    const owner = nav.find((group) => group.items.some((item) => item.route === pathname))
    if (owner && collapsed.includes(owner.label)) {
      setCollapsed((prev) => prev.filter((l) => l !== owner.label))
    }
    // Only the route matters here; folding by hand must stick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, nav])

  const needle = filter.trim().toLowerCase()
  const visible = useMemo(() => {
    if (!needle) return nav
    return nav
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [item.label, t(item.label), group.label, t(group.label)].some((s) => s.toLowerCase().includes(needle))
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [nav, needle, t])

  return (
    <aside
      data-testid="sidebar"
      className="flex h-full w-sidebar flex-shrink-0 flex-col border-e border-border bg-sidebar"
    >
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

      <div className="px-3 pb-1 pt-2">
        <label className="relative block">
          <span className="sr-only">{t('Filter navigation')}</span>
          <Icon
            name="Search"
            size={13}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted start-2.5"
          />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('Filter navigation')}
            className="h-8 w-full rounded border border-border bg-inset ps-8 pe-2 text-xs text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
          />
        </label>
      </div>

      <nav aria-label={t('Main navigation')} className="flex-1 overflow-y-auto p-3 pt-1">
        <div className="flex flex-col gap-0.5">
          {visible.map((group) => {
            const open = needle.length > 0 || !collapsed.includes(group.label)
            const slug = slugOf(group.label)
            return (
              <div key={group.label}>
                <button
                  type="button"
                  data-testid={`nav-group-${slug}`}
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={open}
                  aria-controls={`nav-group-${slug}-items`}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent p-2 font-action text-[12px] font-extrabold uppercase tracking-[.05em] text-heading transition-colors duration-150 hover:bg-tint-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
                >
                  <Icon name={group.icon} size={13} className="text-muted" />
                  <span>{t(group.label)}</span>
                  <span className="flex-1" />
                  <Icon
                    name={open ? 'ChevronDown' : rtl ? 'ChevronLeft' : 'ChevronRight'}
                    size={12}
                    className="text-muted"
                  />
                </button>
                {open ? (
                  <div id={`nav-group-${slug}-items`} className="mt-0.5 flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.route ?? '#'}
                        onClick={onNavigate}
                        data-testid={`nav-item-${slugOf(item.key ?? item.label)}`}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-[36px] items-center gap-2 overflow-hidden whitespace-nowrap rounded-md py-1.5 pe-3 ps-3',
                            'font-action text-xs font-medium no-underline transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                            isActive
                              ? 'bg-salis-gradient-r text-white shadow'
                              : 'text-heading hover:bg-salis-blue/[.08]'
                          )
                        }
                      >
                        <Icon name={iconForItem(item, group)} size={14} className="flex-shrink-0" />
                        <span className="truncate">{t(item.label)}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
          {visible.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted">{t('No matching navigation items')}</p>
          ) : null}
        </div>
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        <LanguageToggle />
        {/* Logout routes through the confirmation screen — the prototypes
            linked straight to Login and orphaned LogoutConfirmation. */}
        <NavLink
          to="/logout-confirmation"
          onClick={onNavigate}
          data-testid="nav-item-logout"
          className="flex h-9 items-center gap-2 rounded-md px-2 py-1.5 font-action text-xs font-medium text-salis-orange no-underline transition-all duration-200 hover:bg-salis-orange hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="LogOut" size={16} />
          <span>{t('Logout')}</span>
        </NavLink>
      </div>
    </aside>
  )
}

function slugOf(label: string): string {
  return label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function readCollapsed(): readonly string[] {
  const raw = readStored(STORAGE_KEYS.navCollapsed)
  if (!raw) return DEFAULT_COLLAPSED
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : DEFAULT_COLLAPSED
  } catch {
    return DEFAULT_COLLAPSED
  }
}

function LanguageToggle() {
  const { rtl, toggleLanguage } = usePreferences()
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex h-9 cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2 py-1.5 font-action text-xs font-medium text-muted transition-all duration-150 hover:bg-salis-blue/[.08] hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
    >
      <Icon name="Globe" size={14} />
      <span lang={rtl ? 'en' : 'ar'}>{rtl ? 'English' : 'عربي'}</span>
    </button>
  )
}
