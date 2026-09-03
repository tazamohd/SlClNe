import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { iconForItem } from '@/data/nav-journey'

/** What the ⌘K palette can *do*, beyond finding records.
 *
 *  The design drew "Quick Actions ⌘K" in the topbar; the palette behind it
 *  only searched entities. A command is an action with a name: go to a
 *  screen, open the form that creates something, flip a preference, sign
 *  out. Built-in commands come from the nav tree and the session; a screen
 *  registers its own (`useCommand`) while it is mounted, so "New Job Card"
 *  appears in the palette exactly when the Job Cards screen could act on it.
 *  Everything is filtered by the same RBAC the sidebar uses. */
export type CommandGroup = 'navigate' | 'create' | 'toggle' | 'session' | 'screen'

export interface CommandContext {
  navigate: NavigateFunction
}

export interface Command {
  id: string
  /** English source string, translated at render. */
  label: string
  icon: string
  /** Extra words the search should match — synonyms, the group name. */
  keywords?: readonly string[]
  group: CommandGroup
  /** Registry screen name; the command is hidden from roles that cannot open it. */
  screen?: string
  /** Keyboard hint shown beside the label, e.g. `N`. */
  shortcut?: string
  run: (ctx: CommandContext) => void
}

/* ── Screen-registered commands ─────────────────────────────────────────── */

const registered = new Map<string, Command>()
const listeners = new Set<() => void>()
let snapshot: Command[] = []

function publish() {
  snapshot = [...registered.values()]
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function registerCommand(command: Command): () => void {
  registered.set(command.id, command)
  publish()
  return () => {
    if (registered.get(command.id) === command) {
      registered.delete(command.id)
      publish()
    }
  }
}

/** Register one or more commands for as long as the calling screen is
 *  mounted. Re-registers when the array identity changes, so wrap the list in
 *  `useMemo` (or pass a stable constant) to avoid churn. */
export function useCommand(command: Command | readonly Command[]): void {
  useEffect(() => {
    const list = Array.isArray(command) ? (command as Command[]) : [command as Command]
    const disposers = list.map(registerCommand)
    return () => disposers.forEach((dispose) => dispose())
  }, [command])
}

export function useRegisteredCommands(): Command[] {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}

/* ── Built-in commands ──────────────────────────────────────────────────── */

/** Navigation, preference and session commands the current role may run. */
export function useBuiltInCommands(): Command[] {
  const { nav } = useSession()
  const { theme, toggleTheme, rtl, toggleLanguage, density, toggleDensity } = usePreferences()

  return useMemo<Command[]>(() => {
    const navigation: Command[] = nav.flatMap((group) =>
      group.items
        .filter((item) => item.route)
        .map((item) => ({
          id: `go:${item.key ?? item.route}`,
          label: item.label,
          icon: iconForItem(item, group),
          keywords: [group.label, 'go to', 'open'],
          group: 'navigate' as const,
          run: ({ navigate }) => navigate(item.route as string),
        }))
    )
    const toggles: Command[] = [
      {
        id: 'toggle:theme',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: theme === 'dark' ? 'Sun' : 'Moon',
        keywords: ['theme', 'dark', 'light', 'appearance'],
        group: 'toggle',
        run: () => toggleTheme(),
      },
      {
        id: 'toggle:language',
        label: rtl ? 'Switch to English' : 'Switch to Arabic',
        icon: 'Globe',
        keywords: ['language', 'arabic', 'english', 'rtl'],
        group: 'toggle',
        run: () => toggleLanguage(),
      },
      {
        id: 'toggle:density',
        label: density === 'compact' ? 'Comfortable table rows' : 'Compact table rows',
        icon: density === 'compact' ? 'Rows3' : 'LayoutList',
        keywords: ['density', 'compact', 'comfortable', 'rows', 'table'],
        group: 'toggle',
        run: () => toggleDensity(),
      },
    ]
    const session: Command[] = [
      {
        id: 'session:logout',
        label: 'Logout',
        icon: 'LogOut',
        keywords: ['sign out', 'log out', 'exit'],
        group: 'session',
        run: ({ navigate }) => navigate('/logout-confirmation'),
      },
    ]
    return [...navigation, ...toggles, ...session]
  }, [nav, theme, toggleTheme, rtl, toggleLanguage, density, toggleDensity])
}

/** Substring match over label, translated label and keywords. */
export function matchCommand(command: Command, needle: string, translate: (s: string) => string): boolean {
  if (!needle) return true
  const haystack = [command.label, translate(command.label), ...(command.keywords ?? [])]
    .join(' ')
    .toLowerCase()
  return needle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}
