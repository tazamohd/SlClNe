import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { ShellContext } from './ShellContext'

/** The chrome for a single-audience portal — technician, customer, supplier,
 *  purchase agent, and the client portal.
 *
 *  Deliberately not derived from `AppShell`: a portal serves one audience with
 *  a handful of destinations, so it gets a narrow nav rather than the 28-module
 *  sidebar. The portal designs (`TechnicianPortal.dc.html`,
 *  `CustomerPortal.dc.html`) draw a phone frame with a header and a bottom tab
 *  bar; this reproduces that on small viewports and swaps to a slim top bar
 *  with inline nav on wider ones, with the content column capped rather than
 *  stretched — the desktop reading of a mobile-first surface.
 *
 *  ### What a consuming domain supplies
 *
 *  `PortalShell` itself matches the `Shell` type in `screens/registry.ts` —
 *  it takes `{ children }` and nothing else, so a domain barrel can declare
 *  `shell: PortalShell` directly. The shell then resolves *which* portal it is
 *  dressing from the current route against the `SURFACES` table below. A domain
 *  whose portal is not in that table has two options:
 *
 *  - add its surface to `SURFACES` (one entry: route base, title, icon, nav);
 *  - bind its own config with `portalShellFor(config)` and declare the bound
 *    component in its barrel, touching nothing here.
 *
 *  ### Route matching
 *
 *  A surface owns `base`, everything under `base/`, and everything the
 *  registry routes *flat* as `base-…` — the technician's sub-screens live at
 *  `/technician-portal-my-jobs`, not `/technician-portal/my-jobs`, and before
 *  the hyphen form was matched they rendered the unregistered "Portal" chrome
 *  with no tab bar at all. `also` lists prefixes that belong to a surface
 *  without sharing its base (the vendor page is a supplier tab).
 *
 *  Nav items may name the registry screen they lead to; items the signed-in
 *  role cannot open are removed, exactly like the operational sidebar. Every
 *  nav destination must be a built screen — this shell never links to a route
 *  that renders a placeholder.
 *
 *  Session affordances: the signed-in identity (name + role), theme and
 *  language toggles, and sign-out via `/logout-confirmation` — the same
 *  confirmation route the operational shell uses, so no portal invents its own
 *  way out. RTL comes free: the document `dir` is set by `PreferencesProvider`
 *  and every rule here is logical (`ps`/`pe`/`border-e`/`text-start`).
 */

export interface PortalNavItem {
  /** Route the tab navigates to. Must render a real screen, not a pending one. */
  to: string
  /** lucide icon name. */
  icon: string
  /** English source string — translated at render. */
  label: string
  /** Registry screen name, for the role filter. Omit for an always-on item. */
  screen?: string
  /** React Router `end` matching, for the portal home tab. */
  end?: boolean
}

export interface PortalConfig {
  /** Route prefix that identifies this surface, e.g. `/technician-portal`. */
  base: string
  /** Where the brand chip links. Defaults to `base`; set it when the base
   *  itself is not a route (`/purchase-agent` → `/purchase-agent-dashboard`). */
  home?: string
  /** Extra route prefixes that belong to this surface. */
  also?: readonly string[]
  /** English portal name shown in the header — translated at render. */
  title: string
  /** lucide icon for the brand chip. */
  icon: string
  nav: readonly PortalNavItem[]
}

/** The portals this shell recognises by route. Five tabs at most: a bottom
 *  bar with more than five is a bar with labels nobody can read. */
const SURFACES: readonly PortalConfig[] = [
  {
    base: '/technician-portal',
    title: 'Technician Portal',
    icon: 'Wrench',
    nav: [
      { to: '/technician-portal', icon: 'Home', label: 'Home', screen: 'TechnicianPortal', end: true },
      { to: '/technician-portal-my-jobs', icon: 'ClipboardList', label: 'Jobs', screen: 'Technician-Portal-My-Jobs' },
      { to: '/technician-portal-time-clock', icon: 'Clock', label: 'Clock', screen: 'Technician-Portal-Time-Clock' },
      { to: '/technician-portal-parts', icon: 'Package', label: 'Parts', screen: 'Technician-Portal-Parts' },
      { to: '/technician-portal-profile', icon: 'User', label: 'Profile', screen: 'Technician-Portal-Profile' },
    ],
  },
  {
    base: '/customer-portal',
    title: 'Customer Portal',
    icon: 'Car',
    nav: [
      { to: '/customer-portal', icon: 'Home', label: 'Home', screen: 'CustomerPortal', end: true },
      {
        to: '/customer-portal/booking',
        icon: 'Calendar',
        label: 'Book',
        screen: 'CustomerPortal.Booking',
      },
    ],
  },
  {
    base: '/client-portal',
    home: '/client-portal-dashboard',
    title: 'Client Portal',
    icon: 'UserCircle',
    nav: [
      { to: '/client-portal-dashboard', icon: 'Home', label: 'Home', screen: 'Client-Portal-Dashboard' },
      { to: '/client-portal-vehicles', icon: 'Car', label: 'Vehicles', screen: 'Client-Portal-Vehicles' },
      { to: '/client-portal-appointments', icon: 'Calendar', label: 'Appointments', screen: 'Client-Portal-Appointments' },
      { to: '/client-portal-invoices', icon: 'Receipt', label: 'Invoices', screen: 'Client-Portal-Invoices' },
      { to: '/client-portal-profile', icon: 'User', label: 'Profile', screen: 'Client-Portal-Profile' },
    ],
  },
  {
    base: '/supplier-portal',
    also: ['/vendor-supplier-portal'],
    title: 'Supplier Portal',
    icon: 'Truck',
    nav: [
      { to: '/supplier-portal', icon: 'Home', label: 'Home', screen: 'SupplierPortal', end: true },
      {
        to: '/supplier-portal/orders',
        icon: 'ClipboardList',
        label: 'Orders',
        screen: 'SupplierPortal.Orders',
      },
      { to: '/vendor-supplier-portal', icon: 'Store', label: 'Vendor', screen: 'Vendor-Supplier-Portal' },
    ],
  },
  {
    base: '/purchase-agent',
    home: '/purchase-agent-dashboard',
    title: 'Purchase Agent',
    icon: 'ShoppingCart',
    nav: [
      { to: '/purchase-agent-dashboard', icon: 'LayoutDashboard', label: 'Dashboard', screen: 'Purchase-Agent-Dashboard' },
      { to: '/purchase-agent-orders', icon: 'ClipboardList', label: 'Orders', screen: 'Purchase-Agent-Orders' },
      { to: '/purchase-agent-quotations', icon: 'FileText', label: 'Quotations', screen: 'Purchase-Agent-Quotations' },
      { to: '/purchase-agent-suppliers', icon: 'Users', label: 'Suppliers', screen: 'Purchase-Agent-Suppliers' },
      { to: '/purchase-agent-reports', icon: 'BarChart3', label: 'Reports', screen: 'Purchase-Agent-Reports' },
    ],
  },
  {
    base: '/customer-app',
    home: '/customer-app/home',
    title: 'Customer App',
    icon: 'Smartphone',
    nav: [],
  },
]

/** The last-resort identity for a portal route nobody registered: the shell
 *  still renders working chrome (identity, sign-out) rather than crashing or
 *  silently falling back to the operational sidebar. */
const UNREGISTERED: PortalConfig = {
  base: '',
  title: 'Portal',
  icon: 'LayoutGrid',
  nav: [],
}

function owns(prefix: string, pathname: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}-`)
}

export function surfaceFor(pathname: string): PortalConfig {
  return (
    SURFACES.find(
      (surface) => owns(surface.base, pathname) || (surface.also ?? []).some((prefix) => owns(prefix, pathname))
    ) ?? UNREGISTERED
  )
}

/** The `Shell` the domain barrels declare: resolves the portal from the route. */
export function PortalShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <PortalFrame config={surfaceFor(pathname)}>{children}</PortalFrame>
}

/** Binds a config for a portal this file does not know about, so a future
 *  domain can ship its surface without editing the `SURFACES` table. */
export function portalShellFor(config: PortalConfig) {
  return function BoundPortalShell({ children }: { children: ReactNode }) {
    return <PortalFrame config={config}>{children}</PortalFrame>
  }
}

const PORTAL_SHELL = { kind: 'portal' } as const

function PortalFrame({ config, children }: { config: PortalConfig; children: ReactNode }) {
  const { t, theme, toggleTheme, rtl, toggleLanguage } = usePreferences()
  const { userName, roleLabel, canScreen } = useSession()

  const nav = config.nav.filter((item) => !item.screen || canScreen(item.screen))
  const tabbed = nav.length > 1

  return (
    <ShellContext.Provider value={PORTAL_SHELL}>
    <div className="flex min-h-screen flex-col bg-page-alt font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-salis-blue px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>
      <header className="sticky top-0 z-20 border-b border-border bg-sidebar">
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2.5 px-4 py-3">
          <NavLink
            to={config.home ?? config.base ?? '/'}
            end
            className="flex items-center gap-2.5 no-underline hover:no-underline"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
              <Icon name={config.icon} size={16} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-sm font-bold leading-tight text-heading">
                SALIS AUTO
              </span>
              <span className="text-[11px] leading-tight text-muted">{t(config.title)}</span>
            </span>
          </NavLink>

          {/* Inline nav on wide viewports; the bottom bar covers small ones. */}
          {tabbed ? (
            <nav aria-label={t(config.title)} className="ms-4 hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-1.5 font-action text-[13px] font-medium no-underline transition-colors hover:no-underline',
                      isActive
                        ? 'bg-salis-gradient-r text-white shadow'
                        : 'text-heading hover:bg-salis-blue/[.08]'
                    )
                  }
                >
                  <Icon name={item.icon} size={14} />
                  {t(item.label)}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <span className="flex-1" />

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2 font-action text-xs font-medium text-muted transition-colors hover:bg-salis-blue/[.08] hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name="Globe" size={14} />
            <span>{rtl ? 'English' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted transition-colors hover:bg-salis-blue/[.08] hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>

          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />

          <span className="hidden items-center gap-2 sm:flex">
            <Avatar name={userName} aria-hidden />
            <span className="hidden min-w-0 flex-col md:flex">
              <span className="max-w-[160px] truncate text-[13px] font-semibold leading-tight text-heading">
                {userName}
              </span>
              <span className="text-[11px] leading-tight text-muted">{roleLabel}</span>
            </span>
          </span>

          {/* Through the confirmation screen, never straight to /login — the
              same decision the operational sidebar records. */}
          <NavLink
            to="/logout-confirmation"
            aria-label={t('Logout')}
            className="flex h-11 items-center gap-1.5 rounded-md px-2 font-action text-xs font-medium text-salis-orange no-underline transition-colors hover:bg-salis-orange hover:text-white hover:no-underline"
          >
            <Icon name="LogOut" size={15} />
            <span className="hidden sm:inline">{t('Logout')}</span>
          </NavLink>
        </div>
      </header>

      <main id="main-content" className={cn('mx-auto w-full max-w-[960px] flex-1 p-4 md:p-6', tabbed && 'pb-24 md:pb-6')}>
        {children}
      </main>

      {/* The design's bottom tab bar, on viewports where the inline nav is
          hidden. Rendered only when there is more than one destination — a
          one-tab bar is chrome with nothing to say. */}
      {tabbed ? (
        <nav
          aria-label={t(config.title)}
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 no-underline transition-colors hover:no-underline',
                  isActive ? 'text-salis-blue' : 'text-muted'
                )
              }
            >
              <Icon name={item.icon} size={19} />
              <span className="max-w-full truncate font-action text-[11px] font-semibold">{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
    </ShellContext.Provider>
  )
}
