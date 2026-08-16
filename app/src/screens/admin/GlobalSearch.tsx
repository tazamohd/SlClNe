import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/DataTable'
import { InvoiceStatusBadge } from '@/screens/finance/Invoices'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { useIsMobile } from '@/lib/useMediaQuery'
import { readStored, writeStored } from '@/lib/storage'
import { cn } from '@/lib/cn'

/** GlobalSearch (`project/GlobalSearch.dc.html` / `.Mobile.dc.html`) — the
 *  ⌘K command palette. The prototype hardcoded seven results for "Ahmed";
 *  this queries the real collections client-side (customers, vehicles, job
 *  cards, invoices, appointments, estimates, parts, technicians) by name,
 *  plate, id and phone, and links each hit to its real detail route.
 *  Entities with no detail screen yet (appointments, parts, technicians)
 *  link to their registry list instead of a route that doesn't exist. */

type EntityType =
  | 'customers' | 'vehicles' | 'jobs' | 'invoices'
  | 'appointments' | 'estimates' | 'parts' | 'technicians'

interface Hit {
  type: EntityType
  key: string
  title: ReactNode
  subtitle: ReactNode
  badge: ReactNode
  href: string
  search: string
}

const BLUE = ['rgba(10,94,215,.08)', '#0A5ED7'] as const
const CYAN = ['rgba(11,179,255,.08)', '#0BB3FF'] as const
const SLATE = ['rgba(100,116,139,.1)', '#64748B'] as const
const ORANGE = ['rgba(249,115,22,.1)', '#F97316'] as const
const ENTITY_META: Record<EntityType, { label: string; icon: string; tint: readonly [string, string] }> = {
  customers: { label: 'Customers', icon: 'User', tint: BLUE },
  jobs: { label: 'Job Cards', icon: 'ClipboardList', tint: CYAN },
  vehicles: { label: 'Vehicles', icon: 'Car', tint: BLUE },
  invoices: { label: 'Invoices', icon: 'Receipt', tint: BLUE },
  appointments: { label: 'Appointments', icon: 'CalendarCheck', tint: CYAN },
  estimates: { label: 'Estimates', icon: 'FileText', tint: BLUE },
  parts: { label: 'Parts', icon: 'Package', tint: CYAN },
  technicians: { label: 'Technicians', icon: 'UserCog', tint: BLUE },
}
const ENTITY_ORDER = Object.keys(ENTITY_META) as EntityType[]

const VEHICLE_STATUS: Record<string, readonly [string, string]> = { active: BLUE, service: CYAN }
const ESTIMATE_STATUS: Record<string, readonly [string, string]> = { draft: SLATE, sent: CYAN, approved: BLUE }
const APPT_STATUS: Record<string, readonly [string, string]> = { confirmed: BLUE, awaiting: CYAN, 'no-show': ORANGE }

const RECENT_KEY = 'salis-global-search-recent'
const MAX_RECENT = 5

function loadRecent(): string[] {
  const raw = readStored(RECENT_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

/** Latin id/plate/phone fragment, pinned LTR inside a bidi-mixed line. */
function Code({ children }: { children: ReactNode }) {
  return <span dir="ltr" className="font-mono">{children}</span>
}

function tone(bg: string, fg: string, label: ReactNode): ReactNode {
  return <Badge background={bg} color={fg}>{label}</Badge>
}

function KbdHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-faint">
      <kbd className="rounded border border-border bg-inset px-1 py-px font-mono text-[10px]">{keys}</kbd>
      {label}
    </span>
  )
}

/** One result. Desktop renders a dense row with a trailing status badge;
 *  mobile renders the design's bordered card with a trailing chevron. */
function HitRow({ hit, icon, tint, dense, active, rtl, onSelect }: {
  hit: Hit; icon: string; tint: readonly [string, string]
  dense: boolean; active?: boolean; rtl: boolean; onSelect: () => void
}) {
  return (
    <Link
      to={hit.href}
      onClick={onSelect}
      className={cn(
        'flex items-center no-underline transition-colors duration-100',
        dense
          ? cn('gap-3 px-5 py-2.5', active ? 'bg-[rgba(10,94,215,.06)]' : 'hover:bg-[rgba(10,94,215,.04)]')
          : 'gap-2.5 rounded-[14px] border border-border bg-card p-3.5 shadow-sm'
      )}
    >
      <span className="flex shrink-0 rounded-lg p-1.5" style={{ background: tint[0], color: tint[1] }}>
        <Icon name={icon} size={dense ? 14 : 15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('m-0 truncate text-[13px] text-heading', dense ? 'font-medium' : 'font-semibold')}>
          {hit.title}
        </p>
        <p className="m-0 mt-0.5 truncate text-[11px] text-muted">{hit.subtitle}</p>
      </div>
      {dense ? (
        <span className="shrink-0">{hit.badge}</span>
      ) : (
        <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={14} className="shrink-0 text-muted" />
      )}
    </Link>
  )
}

export function GlobalSearch() {
  const { t, rtl } = usePreferences()
  const { fieldHidden } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | EntityType>('all')
  const [recent, setRecent] = useState<string[]>(loadRecent)

  const customers = useCollection('customers')
  const vehicles = useCollection('vehicles')
  const jobs = useCollection('jobs')
  const invoices = useCollection('invoices')
  const appointments = useCollection('appointments')
  const estimates = useCollection('estimates')
  const parts = useCollection('parts')
  const technicians = useCollection('technicians')

  const isLoading =
    customers.isLoading || vehicles.isLoading || jobs.isLoading || invoices.isLoading ||
    appointments.isLoading || estimates.isLoading || parts.isLoading || technicians.isLoading

  // Contact details are hidden from some roles app-wide (Customers screen
  // applies the same rule) — a search result can't leak what the list can't.
  const hideContact = fieldHidden('Customer contact details')

  const hits = useMemo<Hit[]>(() => {
    const list: Hit[] = []
    for (const c of customers.data ?? []) {
      list.push({
        type: 'customers',
        key: `customers-${c.name}`,
        title: c.name,
        subtitle: hideContact ? t('Customer') : <>{t('Customer')} · <Code>{c.phone}</Code></>,
        badge: tone(BLUE[0], BLUE[1], `${c.vehicles} ${t('Vehicles')}`),
        href: `/customer-detail?name=${encodeURIComponent(c.name)}`,
        search: [c.name, c.phone].join(' ').toLowerCase(),
      })
    }
    for (const v of vehicles.data ?? []) {
      const [bg, fg] = VEHICLE_STATUS[v.status] ?? VEHICLE_STATUS.active
      list.push({
        type: 'vehicles',
        key: `vehicles-${v.plate}`,
        title: v.make,
        subtitle: <><Code>{v.plate}</Code> · {v.owner}</>,
        badge: tone(bg, fg, t(v.status === 'service' ? 'In Service' : 'Active')),
        href: `/vehicle-detail?plate=${encodeURIComponent(v.plate)}`,
        search: [v.plate, v.make, v.owner].join(' ').toLowerCase(),
      })
    }
    for (const j of jobs.data ?? []) {
      list.push({
        type: 'jobs',
        key: `jobs-${j.id}`,
        title: <Code>{j.id}</Code>,
        subtitle: `${j.cust} · ${j.veh}`,
        badge: <StatusBadge value={j.st} label={t(j.st.replace(/_/g, ' '))} />,
        href: `/job-detail?id=${encodeURIComponent(j.id)}`,
        search: [j.id, j.cust, j.veh].join(' ').toLowerCase(),
      })
    }
    for (const inv of invoices.data ?? []) {
      list.push({
        type: 'invoices',
        key: `invoices-${inv.id}`,
        title: <Code>{inv.id}</Code>,
        subtitle: `${inv.cust} · ${inv.amount}`,
        badge: <InvoiceStatusBadge status={inv.status} />,
        href: `/invoice-detail?id=${encodeURIComponent(inv.id)}`,
        search: [inv.id, inv.cust].join(' ').toLowerCase(),
      })
    }
    for (const [index, a] of (appointments.data ?? []).entries()) {
      const [bg, fg] = APPT_STATUS[a.status] ?? APPT_STATUS.confirmed
      list.push({
        type: 'appointments',
        key: `appointments-${a.plate}-${index}`,
        title: a.cust,
        subtitle: <><Code>{a.plate}</Code> · {a.veh} · <Code>{a.time}</Code></>,
        badge: tone(bg, fg, t(a.status === 'no-show' ? 'No Show' : a.status[0].toUpperCase() + a.status.slice(1))),
        href: '/appointments',
        search: [a.cust, a.veh, a.plate, a.tech].join(' ').toLowerCase(),
      })
    }
    for (const e of estimates.data ?? []) {
      const [bg, fg] = ESTIMATE_STATUS[e.status] ?? ESTIMATE_STATUS.draft
      list.push({
        type: 'estimates',
        key: `estimates-${e.id}`,
        title: <Code>{e.id}</Code>,
        subtitle: `${e.cust} · ${e.veh}`,
        badge: tone(bg, fg, t(e.status[0].toUpperCase() + e.status.slice(1))),
        href: `/estimate-detail?id=${encodeURIComponent(e.id)}`,
        search: [e.id, e.cust, e.veh].join(' ').toLowerCase(),
      })
    }
    for (const p of parts.data ?? []) {
      const low = p.stock <= p.reorder
      list.push({
        type: 'parts',
        key: `parts-${p.sku}`,
        title: p.name,
        subtitle: <><Code>{p.sku}</Code> · {p.price}</>,
        badge: low ? tone(ORANGE[0], ORANGE[1], t('Low Stock')) : tone(BLUE[0], BLUE[1], t('In Stock')),
        href: '/inventory',
        search: [p.name, p.sku].join(' ').toLowerCase(),
      })
    }
    for (const x of technicians.data ?? []) {
      list.push({
        type: 'technicians',
        key: `technicians-${x.name}`,
        title: x.name,
        subtitle: t(x.specialty),
        badge: (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Icon name="Star" size={12} className="text-salis-orange" />
            <Code>{x.rating}</Code>
          </span>
        ),
        href: '/technicians',
        search: [x.name, x.specialty].join(' ').toLowerCase(),
      })
    }
    return list
  }, [
    customers.data, vehicles.data, jobs.data, invoices.data,
    appointments.data, estimates.data, parts.data, technicians.data,
    t, hideContact,
  ])

  const needle = query.trim().toLowerCase()
  const matched = useMemo(
    () => (needle ? hits.filter((hit) => hit.search.includes(needle)) : []),
    [hits, needle]
  )

  const groups = useMemo(
    () =>
      ENTITY_ORDER.map((type) => ({
        type,
        label: t(ENTITY_META[type].label),
        icon: ENTITY_META[type].icon,
        tint: ENTITY_META[type].tint,
        items: matched.filter((hit) => hit.type === type),
      })).filter((group) => group.items.length > 0),
    [matched, t]
  )

  const effectiveTab: 'all' | EntityType =
    activeTab !== 'all' && groups.some((g) => g.type === activeTab) ? activeTab : 'all'
  const visibleGroups = effectiveTab === 'all' ? groups : groups.filter((g) => g.type === effectiveTab)
  const flat = useMemo(() => visibleGroups.flatMap((g) => g.items), [visibleGroups])
  const clampedIndex = Math.min(activeIndex, Math.max(flat.length - 1, 0))

  const hasQuery = needle.length > 0
  const hasResults = hasQuery && flat.length > 0
  const noResults = hasQuery && !isLoading && flat.length === 0

  function commitRecent(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT)
      writeStored(RECENT_KEY, JSON.stringify(next))
      return next
    })
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      const hit = flat[clampedIndex]
      if (hit) {
        commitRecent(query)
        navigate(hit.href)
      }
    } else if (event.key === 'Escape') {
      setQuery('')
      setActiveIndex(0)
    }
  }

  function onQueryChange(value: string) {
    setQuery(value)
    setActiveIndex(0)
  }

  let flatCursor = -1

  if (isMobile) {
    const tabDefs: { key: 'all' | EntityType; label: string; count: number }[] = [
      { key: 'all', label: t('All'), count: matched.length },
      ...groups.map((g) => ({ key: g.type, label: g.label, count: g.items.length })),
    ]

    return (
      <div className="flex flex-col gap-3">
        <span className="relative flex items-center">
          <Icon name="Search" size={16} className="pointer-events-none absolute text-muted start-3" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t('Search customers, vehicles, parts...')}
            aria-label={t('Search customers, vehicles, parts...')}
            className={cn(
              'box-border h-[46px] w-full rounded-xl border bg-card font-ui text-sm text-heading outline-none',
              'ps-10 pe-10 transition-shadow duration-150',
              hasQuery ? 'border-[1.5px] border-salis-blue shadow-[0_0_0_3px_rgba(10,94,215,.1)]' : 'border-border'
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label={t('Clear')}
              className="absolute flex h-6 w-6 items-center justify-center rounded-md border-none bg-inset text-muted end-2.5"
            >
              <X size={13} />
            </button>
          ) : null}
        </span>
        {hasResults ? (
          <div role="tablist" aria-label={t('Filter')} className="flex gap-2 overflow-x-auto">
            {tabDefs.map((tab) => {
              const on = effectiveTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'h-8 shrink-0 whitespace-nowrap rounded-lg px-3 font-action text-xs font-medium',
                    on ? 'bg-salis-gradient text-white' : 'border border-border bg-card text-body'
                  )}
                >
                  {tab.label} <span className="font-mono opacity-70">{tab.count}</span>
                </button>
              )
            })}
          </div>
        ) : null}
        {isLoading && hasQuery ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[52px] animate-pulse rounded-xl bg-inset" />
            ))}
          </div>
        ) : hasResults ? (
          <div className="flex flex-col gap-4">
            {visibleGroups.map((group) => (
              <div key={group.type} className="flex flex-col gap-2">
                <p className="m-0 font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                  {group.label}
                </p>
                {group.items.map((hit) => (
                  <HitRow
                    key={hit.key}
                    hit={hit}
                    icon={group.icon}
                    tint={group.tint}
                    dense={false}
                    rtl={rtl}
                    onSelect={() => commitRecent(query)}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : noResults ? (
          <EmptyState
            icon="SearchX"
            title={t('No matches found')}
            description={t('Try a different name, plate, ID or phone number.')}
          />
        ) : null}
        {recent.length > 0 ? (
          <div className="rounded-[14px] border border-border bg-card p-3.5">
            <p className="m-0 mb-2.5 font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
              {t('Recent Searches')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onQueryChange(term)}
                  className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-inset px-2.5 font-action text-xs text-body"
                >
                  <Icon name="Clock" size={11} className="text-faint" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-start justify-center pt-4 sm:pt-16">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Icon name="Search" size={20} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            autoFocus
            placeholder={t('Search customers, vehicles, parts...')}
            aria-label={t('Search customers, vehicles, parts...')}
            className="h-8 flex-1 border-none bg-transparent font-ui text-base text-heading outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border bg-inset px-2 py-0.5 font-mono text-[11px] text-muted">
            ESC
          </kbd>
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          {isLoading && hasQuery ? (
            <div className="flex flex-col gap-2 p-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-inset" />
              ))}
            </div>
          ) : hasResults ? (
            groups.map((group) => (
              <div key={group.type}>
                <div className="px-5 pb-1 pt-2">
                  <span className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {group.label}
                  </span>
                </div>
                {group.items.map((hit) => {
                  flatCursor += 1
                  return (
                    <HitRow
                      key={hit.key}
                      hit={hit}
                      icon={group.icon}
                      tint={group.tint}
                      dense
                      active={flatCursor === clampedIndex}
                      rtl={rtl}
                      onSelect={() => commitRecent(query)}
                    />
                  )
                })}
              </div>
            ))
          ) : noResults ? (
            <div className="px-5 py-10 text-center">
              <Icon name="SearchX" size={32} className="mx-auto mb-2 text-muted" />
              <p className="m-0 text-sm text-muted">{t('No matches found')}</p>
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Icon name="Search" size={32} className="mx-auto mb-2 text-muted" />
              <p className="m-0 text-sm text-muted">{t('Search customers, vehicles, job cards, invoices and more.')}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-2.5">
          <KbdHint keys="↑↓" label={t('Navigate')} />
          <KbdHint keys="↵" label={t('Open')} />
          <span className="flex-1" />
          <span className="text-[11px] text-faint">⌘K</span>
        </div>
      </div>
    </div>
  )
}
