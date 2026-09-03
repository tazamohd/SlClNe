import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { repository } from '@/data/repository'
import { cn } from '@/lib/cn'
import { useDebounce } from '@/lib/useDebounce'
import { useIsMobile } from '@/lib/useMediaQuery'
import { readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'
import {
  matchCommand,
  useBuiltInCommands,
  useRegisteredCommands,
  type Command,
  type CommandGroup,
} from './commands'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface SearchResult {
  id: string
  category: string
  categoryKey: string
  icon: string
  primary: string
  secondary: string
  route: string
}

/** Entity definition: which repository collection to query, which fields to
 *  search and display, the RBAC module that gates visibility, and the route
 *  a click navigates to. */
interface EntityDef {
  key: string
  label: string
  icon: string
  /** RBAC module — the role needs `v` on this to see results. */
  module: string
  /** Repository collection name. */
  collection: keyof typeof repository
  /** Fields to search (substring match). */
  searchFields: string[]
  /** Field used as the primary display text. */
  primaryField: string
  /** Fields joined as secondary text. */
  secondaryFields: string[]
  /** Route to navigate to. `$id` is replaced with the row id. */
  route: string
  /** How to extract an id from the row. */
  idField: string
}

/* ── Entity registry ───────────────────────────────────────────────────────── */

const ENTITY_DEFS: EntityDef[] = [
  {
    key: 'customers',
    label: 'Customers',
    icon: 'Users',
    module: 'customers',
    collection: 'customers',
    searchFields: ['name', 'phone'],
    primaryField: 'name',
    secondaryFields: ['phone', 'spent'],
    route: '/customers',
    idField: 'name',
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    icon: 'Car',
    module: 'vehicles',
    collection: 'vehicles',
    searchFields: ['plate', 'make', 'owner'],
    primaryField: 'make',
    secondaryFields: ['plate', 'owner'],
    route: '/vehicles',
    idField: 'plate',
  },
  {
    key: 'jobs',
    label: 'Job Cards',
    icon: 'ClipboardList',
    module: 'jobcards',
    collection: 'jobs',
    searchFields: ['id', 'cust', 'veh'],
    primaryField: 'id',
    secondaryFields: ['cust', 'veh', 'st'],
    route: '/job-detail?id=$id',
    idField: 'id',
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: 'Receipt',
    module: 'invoices',
    collection: 'invoices',
    searchFields: ['id', 'cust', 'amount'],
    primaryField: 'id',
    secondaryFields: ['cust', 'amount', 'status'],
    route: '/invoice-detail?id=$id',
    idField: 'id',
  },
  {
    key: 'estimates',
    label: 'Estimates',
    icon: 'FileText',
    module: 'estimates',
    collection: 'estimates',
    searchFields: ['id', 'cust', 'veh'],
    primaryField: 'id',
    secondaryFields: ['cust', 'veh', 'amount'],
    route: '/estimate-detail?id=$id',
    idField: 'id',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: 'Calendar',
    module: 'appointments',
    collection: 'appointments',
    searchFields: ['cust', 'veh', 'plate', 'svc', 'tech'],
    primaryField: 'cust',
    secondaryFields: ['veh', 'plate', 'time', 'svc'],
    route: '/appointments',
    idField: 'cust',
  },
  {
    key: 'parts',
    label: 'Parts',
    icon: 'Package',
    module: 'inventory',
    collection: 'parts',
    searchFields: ['name', 'sku'],
    primaryField: 'name',
    secondaryFields: ['sku', 'stock', 'price'],
    route: '/inventory',
    idField: 'sku',
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'Truck',
    module: 'procurement',
    collection: 'suppliers',
    searchFields: ['name', 'nameAr', 'code', 'contactPhone', 'contactEmail'],
    primaryField: 'name',
    secondaryFields: ['code', 'contactPhone', 'status'],
    route: '/parts-network/suppliers',
    idField: 'id',
  },
  {
    key: 'leads',
    label: 'Leads',
    icon: 'UserPlus',
    module: 'crm',
    collection: 'leads',
    searchFields: ['name', 'company', 'source'],
    primaryField: 'name',
    secondaryFields: ['company', 'value', 'stage'],
    route: '/lead-pipeline',
    idField: 'name',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    icon: 'Target',
    module: 'crm',
    collection: 'opportunities',
    searchFields: ['name', 'company', 'owner'],
    primaryField: 'name',
    secondaryFields: ['company', 'value', 'stage'],
    route: '/opportunities',
    idField: 'name',
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: 'Briefcase',
    module: 'hr',
    collection: 'employees',
    searchFields: ['name', 'nameAr', 'employeeNumber', 'title'],
    primaryField: 'name',
    secondaryFields: ['employeeNumber', 'title', 'status'],
    route: '/hr-payroll',
    idField: 'employeeNumber',
  },
  {
    key: 'technicians',
    label: 'Technicians',
    icon: 'Wrench',
    module: 'technicians',
    collection: 'technicians',
    searchFields: ['name', 'specialty'],
    primaryField: 'name',
    secondaryFields: ['specialty', 'rating'],
    route: '/technicians',
    idField: 'name',
  },
]

/* ── Recent searches ───────────────────────────────────────────────────────── */

const MAX_RECENT = 5

function readRecent(): string[] {
  try {
    const raw = readStored(STORAGE_KEYS.recentSearches)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function addRecent(term: string): void {
  const list = readRecent().filter((s) => s !== term)
  list.unshift(term)
  writeStored(STORAGE_KEYS.recentSearches, JSON.stringify(list.slice(0, MAX_RECENT)))
}

/* ── Search logic ──────────────────────────────────────────────────────────── */

const MAX_PER_CATEGORY = 5
const MAX_TOTAL = 25
const MAX_COMMANDS = 8

function matchRow(row: Record<string, unknown>, fields: string[], needle: string): boolean {
  for (const field of fields) {
    const value = row[field]
    if (value == null) continue
    if (String(value).toLowerCase().includes(needle)) return true
  }
  return false
}

function fieldValue(row: Record<string, unknown>, field: string): string {
  const v = row[field]
  if (v == null) return ''
  return String(v)
}

const GROUP_LABEL: Record<CommandGroup, string> = {
  screen: 'On this screen',
  create: 'Create',
  navigate: 'Go to',
  toggle: 'Preferences',
  session: 'Session',
}

/** Everything the list can hold, in one keyboard-navigable order. */
type Item = { kind: 'command'; command: Command } | { kind: 'result'; result: SearchResult }

/* ── Component ─────────────────────────────────────────────────────────────── */

export function GlobalSearchPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const { can, canScreen } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const builtIn = useBuiltInCommands()
  const registeredCommands = useRegisteredCommands()

  const [query, setQuery] = useState('')
  const settled = useDebounce(query, 200)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecent)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  /** Entity definitions the current role can access. */
  const allowedDefs = useMemo(
    () => ENTITY_DEFS.filter((def) => can(def.module, 'v')),
    [can],
  )

  const hasQuery = query.trim().length > 0

  /** Commands: with no query, the screen's own actions plus preferences and
   *  session — a short, actionable list. With a query, everything that
   *  matches, navigation included, capped so records still get room. */
  const commands = useMemo<Command[]>(() => {
    const visible = [...registeredCommands, ...builtIn].filter(
      (command) => !command.screen || canScreen(command.screen)
    )
    if (!hasQuery) return visible.filter((command) => command.group !== 'navigate')
    const needle = query.trim()
    const order: CommandGroup[] = ['screen', 'create', 'navigate', 'toggle', 'session']
    return visible
      .filter((command) => matchCommand(command, needle, t))
      .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group))
      .slice(0, MAX_COMMANDS)
  }, [registeredCommands, builtIn, canScreen, hasQuery, query, t])

  /** Execute search across all permitted entities. */
  const executeSearch = useCallback(
    async (term: string) => {
      const needle = term.toLowerCase().trim()
      if (!needle) {
        setResults([])
        return
      }

      const all: SearchResult[] = []

      await Promise.all(
        allowedDefs.map(async (def) => {
          try {
            const { rows } = await repository[def.collection].list({ pageSize: 200 })
            let count = 0
            for (const row of rows) {
              if (count >= MAX_PER_CATEGORY) break
              if (all.length >= MAX_TOTAL) break
              const r = row as Record<string, unknown>
              if (matchRow(r, def.searchFields, needle)) {
                const primary = fieldValue(r, def.primaryField)
                const secondary = def.secondaryFields
                  .map((f) => fieldValue(r, f))
                  .filter(Boolean)
                  .join(' · ')
                const id = fieldValue(r, def.idField) || String(count)
                all.push({
                  id: `${def.key}-${id}`,
                  category: def.label,
                  categoryKey: def.key,
                  icon: def.icon,
                  primary,
                  secondary,
                  route: def.route.replace('$id', encodeURIComponent(id)),
                })
                count++
              }
            }
          } catch {
            /* Collection may be empty or errored — skip silently */
          }
        }),
      )

      setResults(all.slice(0, MAX_TOTAL))
    },
    [allowedDefs],
  )

  useEffect(() => {
    if (!open) return
    void executeSearch(settled)
  }, [settled, open, executeSearch])

  /** Focus the input when opened. */
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setRecentSearches(readRecent())
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const items = useMemo<Item[]>(
    () => [
      ...commands.map((command): Item => ({ kind: 'command', command })),
      ...results.map((result): Item => ({ kind: 'result', result })),
    ],
    [commands, results]
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length, query])

  /** Scroll active item into view. */
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex])

  const runItem = useCallback(
    (item: Item) => {
      if (item.kind === 'result') {
        if (query.trim()) addRecent(query.trim())
        setRecentSearches(readRecent())
        navigate(item.result.route)
      } else {
        item.command.run({ navigate })
      }
      onClose()
    },
    [navigate, onClose, query],
  )

  /** Keyboard navigation. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (items[activeIndex]) runItem(items[activeIndex])
      }
    },
    [onClose, items, activeIndex, runItem],
  )

  if (!open) return null

  /** Group results by category. */
  const grouped: { label: string; icon: string; entries: { result: SearchResult; index: number }[] }[] = []
  const seen = new Map<string, number>()
  results.forEach((r, i) => {
    const index = commands.length + i
    let groupIdx = seen.get(r.categoryKey)
    if (groupIdx === undefined) {
      groupIdx = grouped.length
      seen.set(r.categoryKey, groupIdx)
      grouped.push({ label: r.category, icon: r.icon, entries: [] })
    }
    grouped[groupIdx].entries.push({ result: r, index })
  })

  const commandGroups: { group: CommandGroup; entries: { command: Command; index: number }[] }[] = []
  commands.forEach((command, index) => {
    let bucket = commandGroups.find((g) => g.group === command.group)
    if (!bucket) {
      bucket = { group: command.group, entries: [] }
      commandGroups.push(bucket)
    }
    bucket.entries.push({ command, index })
  })

  const showRecent = !hasQuery && recentSearches.length > 0
  const showEmpty = hasQuery && items.length === 0

  const optionClass = (active: boolean) =>
    cn(
      'flex w-full cursor-pointer items-center gap-3 border-none px-4 py-2.5 text-start transition-colors focus-visible:outline-none',
      active ? 'bg-salis-blue/[.08]' : 'bg-transparent hover:bg-salis-blue/[.04]',
    )

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-palette flex items-start justify-center bg-salis-navy/[.55] pt-[10vh] sm:pt-[15vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('Global Search')}
        data-testid="command-palette"
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col overflow-hidden border border-border bg-card shadow-2xl',
          isMobile
            ? 'h-full rounded-none'
            : 'max-h-[min(560px,72vh)] max-w-[600px] rounded-2xl',
        )}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search input ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-0 border-b border-solid border-border px-4 py-3">
          <Icon name="Search" size={18} className="flex-shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search or type an action...')}
            aria-label={t('Search or type an action...')}
            aria-controls="command-palette-list"
            aria-activedescendant={items[activeIndex] ? `palette-item-${activeIndex}` : undefined}
            className="min-w-0 flex-1 border-none bg-transparent font-ui text-[15px] text-heading outline-none placeholder:text-faint"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('Close')}
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
            >
              <Icon name="X" size={16} />
            </button>
          ) : (
            <kbd className="flex-shrink-0 rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[11px] text-faint">
              ESC
            </kbd>
          )}
        </div>

        {/* ── Commands / results / recent / empty ───────────────────────── */}
        <div ref={listRef} id="command-palette-list" className="min-h-0 flex-1 overflow-y-auto" role="listbox">
          {commandGroups.map((bucket) => (
            <div key={bucket.group}>
              <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                <Icon name="Zap" size={12} className="text-muted" />
                <span className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                  {t(GROUP_LABEL[bucket.group])}
                </span>
              </div>
              {bucket.entries.map(({ command, index }) => (
                <button
                  key={command.id}
                  id={`palette-item-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  data-active={index === activeIndex}
                  data-testid="command-palette-result"
                  onClick={() => runItem({ kind: 'command', command })}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={optionClass(index === activeIndex)}
                >
                  <span
                    className={cn(
                      'flex flex-shrink-0 rounded-lg p-1.5',
                      index === activeIndex ? 'bg-salis-blue/[.15] text-salis-blue' : 'bg-salis-blue/[.08] text-salis-blue',
                    )}
                  >
                    <Icon name={command.icon} size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-heading">
                    {t(command.label)}
                  </span>
                  {command.shortcut ? (
                    <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">
                      {command.shortcut}
                    </kbd>
                  ) : null}
                </button>
              ))}
            </div>
          ))}

          {showRecent ? (
            <div className="px-4 py-3">
              <span className="font-action text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t('Recent searches')}
              </span>
              <div className="mt-2 flex flex-col gap-0.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-2 py-2 text-start transition-colors hover:bg-salis-blue/[.04] focus-visible:bg-salis-blue/[.06] focus-visible:outline-none"
                  >
                    <Icon name="Clock" size={14} className="flex-shrink-0 text-muted" />
                    <span className="text-[13px] text-body">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showEmpty ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Icon name="SearchX" size={36} className="text-muted" />
              <p className="m-0 text-sm text-muted">{t('No results found')}</p>
              <p className="m-0 text-xs text-faint">{t('Try a different search term')}</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                  <Icon name={group.icon} size={12} className="text-muted" />
                  <span className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {t(group.label)}
                  </span>
                </div>
                {group.entries.map(({ result, index }) => (
                  <button
                    key={result.id}
                    id={`palette-item-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    data-active={index === activeIndex}
                    data-testid="command-palette-result"
                    onClick={() => runItem({ kind: 'result', result })}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={optionClass(index === activeIndex)}
                  >
                    <span
                      className={cn(
                        'flex flex-shrink-0 rounded-lg p-1.5',
                        index === activeIndex ? 'bg-salis-blue/[.15] text-salis-blue' : 'bg-salis-blue/[.08] text-salis-blue',
                      )}
                    >
                      <Icon name={result.icon} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[13px] font-medium text-heading">{result.primary}</p>
                      <p className="m-0 mt-px truncate text-[11px] text-muted">{result.secondary}</p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-faint">{t(result.category)}</span>
                  </button>
                ))}
              </div>
            ))
          )}

          {!hasQuery && commands.length === 0 && recentSearches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Icon name="Search" size={36} className="text-muted" />
              <p className="m-0 text-sm text-muted">{t('Search across all entities')}</p>
              <p className="m-0 text-xs text-faint">{t('Search customers, vehicles, parts...')}</p>
            </div>
          ) : null}
        </div>

        {/* ── Footer with keyboard hints ───────────────────────────────── */}
        {!isMobile ? (
          <div className="flex items-center gap-4 border-0 border-t border-solid border-border px-4 py-2">
            <span className="flex items-center gap-1 text-[11px] text-faint">
              <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">
                &uarr;&darr;
              </kbd>
              {t('Navigate')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-faint">
              <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">
                &crarr;
              </kbd>
              {t('Open')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-faint">
              <kbd className="rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-muted">
                ESC
              </kbd>
              {t('Close')}
            </span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export default GlobalSearchPalette

/** The open/close hook moved to `CommandPalette.tsx` so the headers can bind
 *  ⌘K without pulling this module into the shared entry; re-exported for the
 *  callers that still import it from here. */
export { useGlobalSearch } from './CommandPalette'
