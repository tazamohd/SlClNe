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
import { useIsMobile } from '@/lib/useMediaQuery'

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
    route: '/job-cards',
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
    route: '/invoices',
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
    route: '/estimates',
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

const RECENT_KEY = 'salis-recent-searches'
const MAX_RECENT = 5

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function addRecent(term: string): void {
  try {
    const list = readRecent().filter((s) => s !== term)
    list.unshift(term)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {
    /* localStorage may be blocked */
  }
}

/* ── Search logic ──────────────────────────────────────────────────────────── */

const MAX_PER_CATEGORY = 5
const MAX_TOTAL = 25

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

/* ── Component ─────────────────────────────────────────────────────────────── */

export function GlobalSearchPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecent)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Entity definitions the current role can access. */
  const allowedDefs = useMemo(
    () => ENTITY_DEFS.filter((def) => can(def.module, 'v')),
    [can],
  )

  /** Execute search across all permitted entities. */
  const executeSearch = useCallback(
    async (term: string) => {
      const needle = term.toLowerCase().trim()
      if (!needle) {
        setResults([])
        setActiveIndex(0)
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
                  route: def.route,
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
      setActiveIndex(0)
    },
    [allowedDefs],
  )

  /** Debounced search. */
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void executeSearch(query)
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open, executeSearch])

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

  /** Scroll active item into view. */
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    if (active) {
      active.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  /** Navigate to a result. */
  const selectResult = useCallback(
    (result: SearchResult) => {
      if (query.trim()) addRecent(query.trim())
      setRecentSearches(readRecent())
      navigate(result.route)
      onClose()
    },
    [navigate, onClose, query],
  )

  /** Navigate to a recent search term. */
  const selectRecent = useCallback(
    (term: string) => {
      setQuery(term)
    },
    [],
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
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (results[activeIndex]) {
          selectResult(results[activeIndex])
        }
        return
      }
    },
    [onClose, results, activeIndex, selectResult],
  )

  if (!open) return null

  /** Group results by category. */
  const grouped: { label: string; icon: string; items: { result: SearchResult; globalIndex: number }[] }[] = []
  const seen = new Map<string, number>()
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    let groupIdx = seen.get(r.categoryKey)
    if (groupIdx === undefined) {
      groupIdx = grouped.length
      seen.set(r.categoryKey, groupIdx)
      grouped.push({ label: r.category, icon: r.icon, items: [] })
    }
    grouped[groupIdx].items.push({ result: r, globalIndex: i })
  }

  const hasQuery = query.trim().length > 0
  const showRecent = !hasQuery && recentSearches.length > 0
  const showEmpty = hasQuery && results.length === 0

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[95] flex items-start justify-center bg-salis-navy/[.55] pt-[10vh] sm:pt-[15vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('Global Search')}
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col overflow-hidden border border-border bg-card shadow-2xl',
          isMobile
            ? 'h-full rounded-none'
            : 'max-h-[min(520px,70vh)] max-w-[580px] rounded-2xl',
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
            placeholder={t('Search customers, vehicles, parts...')}
            aria-label={t('Search customers, vehicles, parts...')}
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
              className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors hover:text-heading"
            >
              <Icon name="X" size={16} />
            </button>
          ) : (
            <kbd className="flex-shrink-0 rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[11px] text-faint">
              ESC
            </kbd>
          )}
        </div>

        {/* ── Results / recent / empty ─────────────────────────────────── */}
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto" role="listbox">
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
                    onClick={() => selectRecent(term)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-2 py-2 text-start transition-colors hover:bg-salis-blue/[.04] focus-visible:bg-salis-blue/[.06] focus-visible:outline-none"
                  >
                    <Icon name="Clock" size={14} className="flex-shrink-0 text-muted" />
                    <span className="text-[13px] text-body">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : showEmpty ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Icon name="SearchX" size={36} className="text-muted" />
              <p className="m-0 text-sm text-muted">{t('No results found')}</p>
              <p className="m-0 text-xs text-faint">
                {t('Try a different search term')}
              </p>
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
                {group.items.map(({ result, globalIndex }) => (
                  <button
                    key={result.id}
                    type="button"
                    role="option"
                    aria-selected={globalIndex === activeIndex}
                    data-active={globalIndex === activeIndex}
                    onClick={() => selectResult(result)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 border-none px-4 py-2.5 text-start transition-colors focus-visible:outline-none',
                      globalIndex === activeIndex
                        ? 'bg-salis-blue/[.08]'
                        : 'bg-transparent hover:bg-salis-blue/[.04]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex flex-shrink-0 rounded-lg p-1.5',
                        globalIndex === activeIndex
                          ? 'bg-salis-blue/[.15] text-salis-blue'
                          : 'bg-salis-blue/[.08] text-salis-blue',
                      )}
                    >
                      <Icon name={result.icon} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[13px] font-medium text-heading">
                        {result.primary}
                      </p>
                      <p className="m-0 mt-px truncate text-[11px] text-muted">
                        {result.secondary}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-faint">
                      {t(result.category)}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}

          {/* Hint when nothing is typed and no recent searches */}
          {!hasQuery && recentSearches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <Icon name="Search" size={36} className="text-muted" />
              <p className="m-0 text-sm text-muted">{t('Search across all entities')}</p>
              <p className="m-0 text-xs text-faint">
                {t('Search customers, vehicles, parts...')}
              </p>
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

/** Hook: manages the search palette open/close state and the Cmd+K / Ctrl+K
 *  global shortcut. Returns `{ open, setOpen }`. */
export function useGlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen }
}
