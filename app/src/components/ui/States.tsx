import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Button } from './Button'
import { Icon } from './Icon'

/** The states every list and detail screen owes the user, per the Definition of
 *  Done: loading, empty, error with a way back, permission denied, and the
 *  read-only case where the role's grant is view-only.
 *
 *  All presentational — they take copy and callbacks and render. Screens pass
 *  them as props (`<ListPage empty={…} error={…}>`) rather than branching on
 *  five booleans in every component. Copy follows `UI.EmptyStates.dc.html` and
 *  `UI.LoadingStates.dc.html`; the design's palette rules hold, so a failure is
 *  Action Orange and never red. */

/** Busy indicator.
 *
 *  The design deliberately avoids a spinning ring: progress is a linear
 *  indeterminate bar, and inline busy states pulse. Both animate transform or
 *  opacity of a decorative element only, so a throttled tab never hides real
 *  content (handoff README §11). */
export function Loading({
  label,
  /** Row form, for a button or a toolbar rather than a whole panel. */
  inline,
  className,
}: {
  label?: string
  inline?: boolean
  className?: string
}) {
  const { t } = usePreferences()
  const text = t(label ?? 'Loading...')

  if (inline) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn('inline-flex items-center gap-2.5 text-[13px] text-muted', className)}
      >
        <span
          aria-hidden
          className="h-[15px] w-[15px] flex-shrink-0 animate-pulse rounded-[3px] bg-salis-blue/[.14] motion-reduce:animate-none"
        />
        {text}
      </span>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center gap-3 py-10', className)}
    >
      <span
        aria-hidden
        className="h-[3px] w-[180px] overflow-hidden rounded-full bg-tint-blue"
      >
        <span className="block h-full w-[30%] rounded-full bg-salis-gradient animate-[salis-linear-progress_1.5s_ease-in-out_infinite] motion-reduce:animate-none" />
      </span>
      <span className="text-[13px] text-muted">{text}</span>
    </div>
  )
}

/** One placeholder block. Sized by the caller so it mirrors the shape of the
 *  content it stands in for — that is what stops the layout jumping when the
 *  data lands. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block h-4 w-full animate-pulse rounded bg-inset motion-reduce:animate-none', className)}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  const { t } = usePreferences()
  return (
    <div role="status" aria-label={t('Loading')} className="w-full animate-pulse motion-reduce:animate-none">
      <div className="flex gap-4 border-b border-border px-4 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <span key={i} aria-hidden className={cn('h-3 rounded bg-inset', i === 0 ? 'w-32' : 'w-20')} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 border-b border-border px-4 py-4">
          {Array.from({ length: cols }, (_, c) => (
            <span key={c} aria-hidden className={cn('h-3 rounded bg-inset', c === 0 ? 'w-40' : 'w-24')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  const { t } = usePreferences()
  return (
    <div role="status" aria-label={t('Loading')} className="grid gap-4 animate-pulse sm:grid-cols-2 lg:grid-cols-3 motion-reduce:animate-none">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <span className="h-4 w-3/4 rounded bg-inset" />
          <span className="h-3 w-1/2 rounded bg-inset" />
          <span className="h-3 w-2/3 rounded bg-inset" />
        </div>
      ))}
    </div>
  )
}

/** Neutral empty state. Screens pass their own copy when they can say something
 *  more useful than "nothing here" — the design's six examples all name the
 *  action that resolves the emptiness. */
export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  action,
}: {
  icon?: string
  title?: string
  description?: string
  action?: ReactNode
}) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex rounded-full bg-inset p-4 text-muted">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="font-action text-sm font-semibold text-heading">
          {t(title ?? 'No results')}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {t(description ?? 'Nothing matches the current filters.')}
        </p>
      </div>
      {action}
    </div>
  )
}

/** A load that failed, with the retry the Definition of Done requires. An error
 *  the user cannot act on is a dead end, so `onRetry` is not optional. */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  /** Extra route out, e.g. a link to service status. */
  secondaryAction,
}: {
  title?: string
  description?: string
  onRetry: () => void
  retryLabel?: string
  secondaryAction?: ReactNode
}) {
  const { t } = usePreferences()
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex rounded-full bg-tint-orange p-4 text-salis-orange">
        <Icon name="CloudOff" size={24} />
      </span>
      <div>
        <p className="font-action text-sm font-semibold text-heading">
          {title ?? t("Couldn't load this")}
        </p>
        <p className="mt-1 max-w-[380px] text-[13px] text-muted">
          {description ??
            t('The request failed. Your data is safe — retry, or check the service status if this keeps happening.')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {secondaryAction}
        <Button onClick={onRetry}>
          <Icon name="RefreshCw" size={15} />
          {t(retryLabel ?? 'Retry')}
        </Button>
      </div>
    </div>
  )
}

/** The client-side half of RBAC. The server is the boundary; this only explains
 *  the refusal, so it never implies a check happened here. */
export function PermissionDenied({
  title,
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  const { t } = usePreferences()
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex rounded-full bg-salis-blue/[.09] p-4 text-salis-blue">
        <Icon name="Lock" size={24} />
      </span>
      <div>
        <p className="font-action text-sm font-semibold text-heading">
          {title ?? t('Permission Denied')}
        </p>
        <p className="mt-1 max-w-[380px] text-[13px] text-muted">
          {description ?? t("You don't have permission to access this page.")}
        </p>
      </div>
      {action}
    </div>
  )
}

/** Banner for a screen the role may open but not change.
 *
 *  Saying so up front beats letting someone fill a form and discover it on
 *  submit — and beats hiding the record, which loses information the role is
 *  entitled to see. */
export function ReadOnlyNotice({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  const { t } = usePreferences()
  return (
    <p
      className={cn(
        'flex items-center gap-2 rounded border border-border bg-inset px-3 py-2 text-[13px] text-body',
        className
      )}
    >
      <Icon name="Lock" size={15} className="flex-shrink-0 text-muted" />
      {message ?? t('Read-only — your role can view this record but not change it.')}
    </p>
  )
}

/** Placeholder for a detail page: header card, four stat tiles, two panels.
 *  Sized like the content it stands in for, so nothing jumps when it lands. */
export function DetailSkeleton() {
  const { t } = usePreferences()
  return (
    <div role="status" aria-label={t('Loading')} className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
      <div aria-hidden className="flex items-center gap-5 rounded-[14px] border border-border bg-card p-6">
        <span className="h-[72px] w-[72px] flex-shrink-0 rounded-full bg-inset" />
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="h-5 w-1/3 rounded bg-inset" />
          <span className="h-3 w-1/2 rounded bg-inset" />
          <span className="h-3 w-2/5 rounded bg-inset" />
        </div>
      </div>
      <div aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="flex h-[74px] flex-col justify-center gap-2 rounded-lg border border-border bg-card p-4">
            <span className="h-2.5 w-1/2 rounded bg-inset" />
            <span className="h-4 w-1/3 rounded bg-inset" />
          </span>
        ))}
      </div>
      <div aria-hidden className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <span key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <span className="h-4 w-1/3 rounded bg-inset" />
            <span className="h-3 w-full rounded bg-inset" />
            <span className="h-3 w-5/6 rounded bg-inset" />
            <span className="h-3 w-2/3 rounded bg-inset" />
          </span>
        ))}
      </div>
      <span className="sr-only">{t('Loading...')}</span>
    </div>
  )
}

/** Placeholder for a dashboard: KPI row, pipeline strip, two chart cards. */
export function DashboardSkeleton() {
  const { t } = usePreferences()
  return (
    <div role="status" aria-label={t('Loading')} className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
      <div aria-hidden className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="flex h-[132px] flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="h-3 w-1/2 rounded bg-inset" />
            <span className="h-8 w-2/3 rounded bg-inset" />
            <span className="h-2.5 w-1/3 rounded bg-inset" />
          </span>
        ))}
      </div>
      <div aria-hidden className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-[118px] rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div aria-hidden className="grid gap-6 lg:grid-cols-2">
        <span className="h-[300px] rounded-xl border border-border bg-card" />
        <span className="h-[300px] rounded-xl border border-border bg-card" />
      </div>
      <span className="sr-only">{t('Loading...')}</span>
    </div>
  )
}
