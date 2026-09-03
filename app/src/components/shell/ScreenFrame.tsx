import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Card } from '@/components/ui/Card'
import { PageHeader, type PageHeaderProps } from '@/components/ui/PageHeader'
import {
  CardSkeleton,
  DashboardSkeleton,
  DetailSkeleton,
  EmptyState,
  ErrorState,
  Loading,
  PermissionDenied,
  ReadOnlyNotice,
  TableSkeleton,
} from '@/components/ui/States'

/** The frame every screen renders inside: the page header, then exactly one
 *  of the states the Definition of Done requires, then the content.
 *
 *  What it fixes: screens used to `return <Loading/>` before their header, so
 *  every navigation blanked the title, the breadcrumbs and the actions for as
 *  long as the fetch took — the page looked broken for a second and then
 *  appeared. Here the header and toolbar always render; only the body waits.
 *
 *  Pass the `useQuery` result as `query` and the loading/error branches wire
 *  themselves; `empty` is the screen's own call (a filtered list is not empty,
 *  it is "no matches"). Order of precedence: denied → loading → error →
 *  notFound → empty → children. */
export type ScreenSkeleton = 'table' | 'cards' | 'detail' | 'dashboard' | 'none'

export interface ScreenQuery {
  isLoading: boolean
  isError: boolean
  error?: unknown
  refetch: () => unknown
}

export interface ScreenEmpty {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export interface ScreenFrameProps extends Omit<PageHeaderProps, 'children'> {
  query?: ScreenQuery
  loading?: boolean
  error?: { message?: string; onRetry: () => void } | null
  empty?: boolean | ScreenEmpty
  notFound?: ScreenEmpty | null
  denied?: boolean
  readOnly?: boolean | string
  /** What the body looks like while it loads. Defaults to table rows. */
  skeleton?: ScreenSkeleton | ReactNode
  /** Filters, tabs, a stage strip — rendered under the header in every state. */
  toolbar?: ReactNode
  /** Sits between header and body in every state (a read-only notice, a
   *  gap banner). */
  notice?: ReactNode
  bodyClassName?: string
  children: ReactNode
}

function messageOf(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined
}

export function ScreenFrame({
  query,
  loading,
  error,
  empty,
  notFound,
  denied,
  readOnly,
  skeleton = 'table',
  toolbar,
  notice,
  bodyClassName,
  children,
  ...header
}: ScreenFrameProps) {
  const { t } = usePreferences()

  const isLoading = loading ?? query?.isLoading ?? false
  const failure =
    error ?? (query?.isError ? { message: messageOf(query.error), onRetry: () => void query.refetch() } : null)

  let body: ReactNode
  if (denied) {
    body = (
      <Card className="p-6">
        <PermissionDenied description={t("You don't have permission to view this record.")} />
      </Card>
    )
  } else if (isLoading) {
    body = <SkeletonBody kind={skeleton} />
  } else if (failure) {
    body = (
      <Card className="p-6">
        <ErrorState description={failure.message} onRetry={failure.onRetry} />
      </Card>
    )
  } else if (notFound) {
    body = (
      <Card className="p-6">
        <EmptyState
          icon={notFound.icon ?? 'FileQuestion'}
          title={t(notFound.title)}
          description={notFound.description ? t(notFound.description) : undefined}
          action={notFound.action}
        />
      </Card>
    )
  } else if (empty) {
    const copy = typeof empty === 'object' ? empty : undefined
    body = (
      <Card className="p-6">
        <EmptyState
          icon={copy?.icon}
          title={copy ? t(copy.title) : undefined}
          description={copy?.description ? t(copy.description) : undefined}
          action={copy?.action}
        />
      </Card>
    )
  } else {
    body = children
  }

  const settled = !denied && !isLoading && !failure && !notFound && !empty

  return (
    <div className="flex animate-fade-up flex-col gap-5 motion-reduce:animate-none sm:gap-6">
      <PageHeader {...header}>{toolbar}</PageHeader>
      {readOnly ? (
        <ReadOnlyNotice message={typeof readOnly === 'string' ? t(readOnly) : undefined} />
      ) : null}
      {notice}
      <section
        aria-busy={isLoading || undefined}
        data-state={denied ? 'denied' : isLoading ? 'loading' : failure ? 'error' : notFound ? 'not-found' : empty ? 'empty' : 'ready'}
        className={cn('flex min-w-0 flex-col gap-5 sm:gap-6', settled && bodyClassName)}
      >
        {body}
      </section>
    </div>
  )
}

function SkeletonBody({ kind }: { kind: ScreenSkeleton | ReactNode }) {
  if (typeof kind !== 'string') return <>{kind}</>
  switch (kind) {
    case 'cards':
      return (
        <>
          <CardSkeleton />
          <Loading />
        </>
      )
    case 'detail':
      return <DetailSkeleton />
    case 'dashboard':
      return <DashboardSkeleton />
    case 'none':
      return <Loading />
    case 'table':
    default:
      return (
        <Card className="overflow-hidden">
          <TableSkeleton />
          <Loading className="py-4" />
        </Card>
      )
  }
}
