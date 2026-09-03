import { useCallback, useMemo } from 'react'
import { useBulk, useCollection, useUpdate, type RowOf } from './useCollection'

export type NotificationItem = RowOf<'notifications'>

/** The bell's data: every notification, the unread count, and the two writes
 *  the centre needs. One hook so the topbar badge, the phone header, the
 *  customer app and `NotificationCenter` cannot disagree about the number. */
export function useNotifications() {
  const query = useCollection('notifications', { sort: 'createdAt:desc', pageSize: 200 })
  const update = useUpdate('notifications')
  const bulk = useBulk('notifications')

  const items = useMemo(() => query.data ?? [], [query.data])
  const unread = useMemo(() => items.filter((n) => !n.readAt).length, [items])

  const markRead = useCallback(
    (id: string) => update.mutate({ id, patch: { readAt: new Date().toISOString() } }),
    [update]
  )
  const markAllRead = useCallback(() => {
    const ids = items.filter((n) => !n.readAt).map((n) => n.id)
    if (ids.length) bulk.mutate({ kind: 'update', ids, patch: { readAt: new Date().toISOString() } })
  }, [bulk, items])

  return {
    items,
    unread,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markRead,
    markAllRead,
    pending: update.isPending || bulk.isPending,
  }
}
