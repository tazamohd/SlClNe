import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import {
  EmptyState,
  ErrorState,
  Loading,
  PermissionDenied,
  ReadOnlyNotice,
  Skeleton,
} from '@/components/ui/States'
import { Tabs, TabList, Tab } from '@/components/ui/Tabs'

/** The frame every detail screen renders inside.
 *
 *  Nine detail screens across four domains consume this. It exists so that the
 *  header, the status pill, the stat strip, the section grid and the phone
 *  layout are decided once — `CustomerDetail` and `VehicleDetail` are its first
 *  two consumers and are the reason each part of the API is here. Nothing is
 *  present that neither of them needed, except the four rails, which are
 *  declared slots with no implementation because the components that fill them
 *  do not exist yet: an empty slot is honest, a stub is a lie with a deadline.
 *
 *  ── What a consumer must supply ──────────────────────────────────────────
 *
 *  `title` and nothing else. A page with only a title renders: a heading, and
 *  whichever state props are set. Everything below is optional and absent means
 *  "this screen has none of that", never "not built yet".
 *
 *  ── What a consumer may supply ───────────────────────────────────────────
 *
 *  `back`         breadcrumb link out. `{ to, label }`, label is an English
 *                 source string and is translated here.
 *  `titleCode`    render the title as a Latin identifier — LTR and monospaced.
 *                 Plates, invoice numbers, VINs. Arabic reorders them otherwise.
 *  `avatar`       `{ initial }` for a person (gradient letter chip) or
 *                 `{ icon }` for a thing (tinted icon tile). **The icon tile is
 *                 desktop-only chrome**: both designed mobile screens drop it
 *                 and only the letter chip survives to the phone. That is the
 *                 rule this frame encodes, not an accident.
 *  `meta`         the header's detail line: `{ icon, label, value, code }[]`.
 *                 `label` is for assistive tech, `value` is what is shown.
 *                 A redacted field is *omitted from the array* by the screen —
 *                 `fieldHidden()` hides a value, so there is deliberately no
 *                 `hidden` flag here that would render an empty row instead.
 *  `status`       trailing node in the header. A `Badge`, normally.
 *  `actions`      header buttons. The screen decides which ones RBAC allows;
 *                 this frame does not check permissions, it only lays them out.
 *  `summary`      the stat strip. `{ label, value, icon? }[]` — with an icon it
 *                 gets the tinted chip `CustomerDetail` draws, without one it is
 *                 the plain figure `VehicleDetail` draws. Up to four across on
 *                 desktop; two or three across on a phone, by count.
 *  `summaryAlign` `center` for the centred phone tiles `CustomerDetail.Mobile`
 *                 uses. Defaults to `start`.
 *  `tabs`         `{ id, label, icon? }[]`. Sections and related lists carry an
 *                 optional `tab`; one with no `tab` shows under every tab, which
 *                 is what a summary panel wants. Omit `tabs` entirely and every
 *                 section renders — neither first consumer is tabbed.
 *  `sections`     content cards. `span: 'half'` pairs two across on desktop
 *                 (the designs' 1fr 1fr row), `'full'` spans the width.
 *  `related`      lists of *other* records — a customer's vehicles, a vehicle's
 *                 job cards. Declarative rather than free children because four
 *                 of these panels appear across the two first consumers and
 *                 they need the same empty state, the same loading state and the
 *                 same keyboard-reachable rows. A record with an `icon` renders
 *                 the design's inset chip row; without one, the plain ruled row.
 *  `timeline` `comments` `attachments` `audit`
 *                 the rails from the execution plan's detail-page paragraph.
 *                 Nothing renders the day nothing is passed, and the rail column
 *                 does not appear at all. When `ActivityFeed`, `Comments` and
 *                 `Attachments` exist, a screen passes them here and the layout
 *                 already has their place.
 *
 *  ── States ──────────────────────────────────────────────────────────────
 *
 *  `loading`, `error`, `notFound`, `denied` and `readOnly` are props rather
 *  than branches each screen re-invents, so no detail screen can ship an
 *  unexplained blank area (execution plan §2.3). They are checked in that
 *  order: a record that failed to load is not also "not found", and a denial
 *  outranks both. `denied` is the record-level refusal — the *route* is already
 *  gated by `RequireAccess`, and neither check is a security boundary (§36).
 *
 *  `on: 'desktop' | 'mobile'` on a stat, a section or a related list is how the
 *  designed mobile screens differ in *content*, not merely in width: the phone
 *  `CustomerDetail` shows three different stats and one of the three panels.
 *  Layout differences this frame handles itself.
 */

/** Which viewport an item belongs to. Absent means both. */
export type DetailSurface = 'desktop' | 'mobile'

export interface DetailMeta {
  /** lucide name for the leading glyph. */
  icon?: string
  /** English source string, translated here. Labels the value for screen
   *  readers, which would otherwise get a bare glyph and a phone number. */
  label: string
  value: ReactNode
  /** Latin identifier — pinned LTR and monospaced. */
  code?: boolean
}

export interface DetailStat {
  /** English source string, translated here. */
  label: string
  value: ReactNode
  /** lucide name. With it, the design's tinted chip; without it, a plain tile. */
  icon?: string
  on?: DetailSurface
}

export interface DetailTab {
  id: string
  /** English source string, translated here. */
  label: string
  icon?: string
}

export interface DetailSection {
  id: string
  /** English source string, translated here. */
  title: string
  icon?: string
  /** Trailing control in the section header — "View all", a filter, a button. */
  action?: ReactNode
  /** Half the row on desktop, or the whole width. Defaults to full. */
  span?: 'half' | 'full'
  /** Which tab this belongs to. Omit to show under every tab. */
  tab?: string
  on?: DetailSurface
  children: ReactNode
}

export interface DetailRecord {
  id: string
  /** Navigating row. Omit for a row that is only information. */
  to?: string
  primary: ReactNode
  secondary?: ReactNode
  /** Trailing figure — an amount, a count. */
  meta?: ReactNode
  /** Trailing pill. */
  badge?: ReactNode
  /** lucide name. With it, the design's inset chip row; without it, a ruled row. */
  icon?: string
}

export interface DetailRelated {
  id: string
  /** English source string, translated here. */
  title: string
  icon?: string
  records: readonly DetailRecord[]
  loading?: boolean
  /** Shown when `records` is empty. Both strings are English sources. */
  empty?: { icon?: string; title: string; description?: string }
  action?: ReactNode
  span?: 'half' | 'full'
  tab?: string
  on?: DetailSurface
}

export interface DetailPageProps {
  back?: { to: string; label: string }
  title: string
  titleCode?: boolean
  subtitle?: ReactNode
  avatar?: { initial?: string; icon?: string }
  meta?: readonly DetailMeta[]
  status?: ReactNode
  actions?: ReactNode
  summary?: readonly DetailStat[]
  summaryAlign?: 'start' | 'center'
  tabs?: readonly DetailTab[]
  sections?: readonly DetailSection[]
  related?: readonly DetailRelated[]
  /** Rails from the execution plan's detail-page architecture. Unfilled today. */
  timeline?: ReactNode
  comments?: ReactNode
  attachments?: ReactNode
  audit?: ReactNode
  loading?: boolean
  /** A failed load, with the retry an error state is required to offer. */
  error?: { message?: string; onRetry: () => void } | null
  /** The record could not be found. `action` is a route back to the list. */
  notFound?: { title: string; description?: string; action?: ReactNode } | null
  denied?: boolean
  /** `true` for the default sentence, or a specific one. */
  readOnly?: boolean | string
}

function visible(on: DetailSurface | undefined, isMobile: boolean): boolean {
  if (!on) return true
  return on === (isMobile ? 'mobile' : 'desktop')
}

export function DetailPage({
  back,
  title,
  titleCode,
  subtitle,
  avatar,
  meta,
  status,
  actions,
  summary,
  summaryAlign = 'start',
  tabs,
  sections,
  related,
  timeline,
  comments,
  attachments,
  audit,
  loading,
  error,
  notFound,
  denied,
  readOnly,
}: DetailPageProps) {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<string | undefined>(tabs?.[0]?.id)

  // A screen that swaps its tab set (a role change, a record of another kind)
  // must not be left pointing at a tab that no longer exists.
  useEffect(() => {
    if (!tabs?.length) return
    setActiveTab((current) =>
      current && tabs.some((tab) => tab.id === current) ? current : tabs[0].id
    )
  }, [tabs])

  const onThisTab = (tab: string | undefined) => !tabs?.length || !tab || tab === activeTab

  const stats = (summary ?? []).filter((stat) => visible(stat.on, isMobile))
  const panels = (sections ?? []).filter((s) => visible(s.on, isMobile) && onThisTab(s.tab))
  const lists = (related ?? []).filter((r) => visible(r.on, isMobile) && onThisTab(r.tab))

  const rails = [timeline, comments, attachments, audit].filter(Boolean)

  const backLink = back ? (
    <Link
      to={back.to}
      className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
    >
      <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
      {t(back.label)}
    </Link>
  ) : null

  const frame = (children: ReactNode) => (
    <div
      className={cn(
        'flex animate-fade-up flex-col motion-reduce:animate-none',
        isMobile ? 'gap-3.5' : 'max-w-[1100px] gap-6'
      )}
    >
      {backLink}
      {children}
    </div>
  )

  if (denied) {
    return frame(
      <Card className="p-6">
        <PermissionDenied
          description={t("You don't have permission to view this record.")}
        />
      </Card>
    )
  }

  if (loading) {
    return frame(
      <>
        <Card className={isMobile ? 'flex flex-col gap-3 p-4' : 'flex flex-col gap-3 p-6'}>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
        <Loading label="Loading..." />
      </>
    )
  }

  if (error) {
    return frame(
      <Card className="p-6">
        <ErrorState description={error.message} onRetry={error.onRetry} />
      </Card>
    )
  }

  if (notFound) {
    return frame(
      <Card className="p-6">
        <EmptyState
          icon="FileQuestion"
          title={t(notFound.title)}
          description={notFound.description ? t(notFound.description) : undefined}
          action={notFound.action}
        />
      </Card>
    )
  }

  return frame(
    <>
      {readOnly ? (
        <ReadOnlyNotice message={typeof readOnly === 'string' ? t(readOnly) : undefined} />
      ) : null}

      <DetailHeader
        title={title}
        titleCode={titleCode}
        subtitle={subtitle}
        avatar={avatar}
        meta={meta}
        status={status}
        actions={actions}
        isMobile={isMobile}
      />

      {stats.length ? (
        <StatStrip stats={stats} align={summaryAlign} isMobile={isMobile} />
      ) : null}

      {tabs?.length ? (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList label="Detail tabs" className="overflow-x-auto">
            {tabs.map((tab) => (
              <Tab key={tab.id} id={tab.id}>
                {tab.icon ? <span className="inline-flex items-center gap-1.5"><Icon name={tab.icon} size={14} />{t(tab.label)}</span> : t(tab.label)}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      ) : null}

      <div
        className={cn(
          'grid gap-6',
          isMobile || rails.length === 0 ? '' : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'
        )}
      >
        <div className={cn('grid min-w-0 gap-6', isMobile ? '' : 'md:grid-cols-2')}>
          {panels.map((section) => (
            <SectionCard key={section.id} section={section} isMobile={isMobile} />
          ))}
          {lists.map((list) => (
            <RelatedCard key={list.id} list={list} isMobile={isMobile} />
          ))}
        </div>

        {rails.length ? (
          <aside className="flex min-w-0 flex-col gap-6">
            {timeline}
            {comments}
            {attachments}
            {audit}
          </aside>
        ) : null}
      </div>
    </>
  )
}

// ── Header ──────────────────────────────────────────────────────────────────

function DetailHeader({
  title,
  titleCode,
  subtitle,
  avatar,
  meta,
  status,
  actions,
  isMobile,
}: {
  title: string
  titleCode?: boolean
  subtitle?: ReactNode
  avatar?: { initial?: string; icon?: string }
  meta?: readonly DetailMeta[]
  status?: ReactNode
  actions?: ReactNode
  isMobile: boolean
}) {
  const { t } = usePreferences()

  const heading = (
    <h1
      dir={titleCode ? 'ltr' : undefined}
      className={cn(
        'font-display font-black text-heading',
        titleCode && 'font-mono',
        isMobile ? 'text-sm' : 'text-2xl'
      )}
    >
      {title}
    </h1>
  )

  const details = meta?.length ? (
    <dl
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1',
        isMobile ? 'mt-0.5' : 'mt-1.5'
      )}
    >
      {meta.map((item) => (
        <div key={item.label} className="flex items-center gap-1 text-[13px] text-muted">
          <dt className="sr-only">{t(item.label)}</dt>
          {item.icon ? <Icon name={item.icon} size={13} className="flex-shrink-0" /> : null}
          <dd dir={item.code ? 'ltr' : undefined} className={cn('m-0', item.code && 'font-mono')}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  ) : null

  // The phone header. Both designed mobile screens drop the icon tile and keep
  // only the letter chip, and the one with no chip is not a card at all.
  if (isMobile) {
    const chip = avatar?.initial ? (
      <Avatar name={avatar.initial} size={48} />
    ) : null

    const body = (
      <>
        <div className="min-w-0 flex-1">
          {heading}
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
          {details}
        </div>
        {status}
      </>
    )

    return (
      <>
        {chip ? (
          <Card className="flex items-center gap-3 rounded-2xl p-[18px]">
            {chip}
            {body}
          </Card>
        ) : (
          <div className="flex items-center justify-between gap-3">{body}</div>
        )}
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </>
    )
  }

  const tile = avatar?.initial ? (
    <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[26px] font-black text-white shadow-[0_8px_20px_rgba(10,94,215,.2)]">
      {avatar.initial}
    </span>
  ) : avatar?.icon ? (
    <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(10,94,215,.08)] text-salis-blue">
      <Icon name={avatar.icon} size={32} />
    </span>
  ) : null

  return (
    <Card className="flex flex-wrap items-center gap-5 rounded-[14px] p-6">
      {tile}
      <div className="min-w-0 flex-1">
        {heading}
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        {details}
      </div>
      {status}
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </Card>
  )
}

// ── Stat strip ──────────────────────────────────────────────────────────────

function StatStrip({
  stats,
  align,
  isMobile,
}: {
  stats: readonly DetailStat[]
  align: 'start' | 'center'
  isMobile: boolean
}) {
  const { t } = usePreferences()
  const columns = isMobile
    ? stats.length <= 2
      ? 'grid-cols-2'
      : 'grid-cols-3'
    : stats.length <= 2
      ? 'sm:grid-cols-2'
      : stats.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-2.5 md:gap-4', columns)}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={cn(
            'flex items-center gap-3',
            isMobile ? 'rounded-lg p-3' : 'rounded-lg p-4',
            align === 'center' && !stat.icon && 'flex-col justify-center gap-0 text-center'
          )}
        >
          {stat.icon ? (
            <span className="flex flex-shrink-0 rounded-lg bg-[var(--tint-blue)] p-2.5 text-salis-blue">
              <Icon name={stat.icon} size={16} />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[11px] text-muted">{t(stat.label)}</p>
            <p
              className={cn(
                'mt-0.5 font-display font-black text-heading',
                isMobile ? 'text-sm' : 'text-xl'
              )}
            >
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Sections and related records ────────────────────────────────────────────

function PanelShell({
  title,
  icon,
  action,
  span,
  isMobile,
  children,
}: {
  title: string
  icon?: string
  action?: ReactNode
  span?: 'half' | 'full'
  isMobile: boolean
  children: ReactNode
}) {
  const { t } = usePreferences()
  return (
    <Card
      className={cn(
        'flex min-w-0 flex-col gap-3.5',
        isMobile ? 'rounded-2xl p-4' : 'p-5',
        span === 'half' ? '' : 'md:col-span-2'
      )}
    >
      <div className="flex items-center gap-2">
        {icon ? <Icon name={icon} size={16} className="text-salis-blue" /> : null}
        <h3 className="text-sm font-bold text-heading">{t(title)}</h3>
        <span className="flex-1" />
        {action}
      </div>
      {children}
    </Card>
  )
}

function SectionCard({ section, isMobile }: { section: DetailSection; isMobile: boolean }) {
  return (
    <PanelShell
      title={section.title}
      icon={section.icon}
      action={section.action}
      span={section.span}
      isMobile={isMobile}
    >
      {section.children}
    </PanelShell>
  )
}

function RelatedCard({ list, isMobile }: { list: DetailRelated; isMobile: boolean }) {
  const { t } = usePreferences()
  return (
    <PanelShell
      title={list.title}
      icon={list.icon}
      action={list.action}
      span={list.span}
      isMobile={isMobile}
    >
      {list.loading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton />
          <Skeleton className="w-2/3" />
        </div>
      ) : list.records.length === 0 ? (
        <EmptyState
          icon={list.empty?.icon ?? 'Inbox'}
          title={list.empty ? t(list.empty.title) : undefined}
          description={list.empty?.description ? t(list.empty.description) : undefined}
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {list.records.map((record) => (
            <li key={record.id}>
              <RecordRow record={record} />
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function RecordRow({ record }: { record: DetailRecord }) {
  const chipped = Boolean(record.icon)

  const body = (
    <>
      {record.icon ? (
        <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
          <Icon name={record.icon} size={16} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-heading">{record.primary}</p>
        {record.secondary ? (
          <p className="mt-0.5 truncate text-[11px] text-muted">{record.secondary}</p>
        ) : null}
      </div>
      {record.meta}
      {record.badge}
    </>
  )

  const shape = chipped
    ? 'flex items-center gap-2.5 rounded-lg border border-border bg-inset p-2.5'
    : 'flex items-center gap-2.5 border-0 border-b border-solid border-border bg-transparent py-2'

  if (!record.to) {
    return <div className={shape}>{body}</div>
  }

  return (
    <Link
      to={record.to}
      className={cn(
        shape,
        'w-full text-start no-underline transition-colors duration-150 hover:no-underline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
        chipped ? 'hover:border-salis-blue' : 'hover:bg-inset'
      )}
    >
      {body}
    </Link>
  )
}
