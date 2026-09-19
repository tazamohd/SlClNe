/** Notifications (BLK-004) — a per-tenant feed of job, appointment, invoice
 *  and stock alerts a staff member can view, mark read and dismiss.
 *  `app/src/screens/admin/NotificationCenter.tsx` rendered an honest GAP
 *  state because no collection backed it; this is that collection.
 *
 *  A flat, tenant-owned directory, writable through the generic collection
 *  router — the same shape `warrantyCreate`/`warrantyRow` gives
 *  `equipmentWarranties`: no line-item or money computation behind it that
 *  would need a bespoke router. The one lifecycle move a notification makes
 *  — unread to read — is an ordinary field write; `readAt` is never accepted
 *  as input, only derived server-side from a `read` boolean
 *  (`server/src/writers.ts`), so a read timestamp always reflects when the
 *  row actually changed rather than a date a client made up.
 */
import { z } from 'zod'
import { nonEmpty } from '../primitives'
import { appRow } from './common'

export const notificationCategory = z.enum(['job', 'appointment', 'invoice', 'stock', 'system'])
export type NotificationCategory = z.infer<typeof notificationCategory>

export const notificationSeverity = z.enum(['info', 'warning', 'critical'])
export type NotificationSeverity = z.infer<typeof notificationSeverity>

export const notificationCreate = z.object({
  category: notificationCategory.optional(),
  severity: notificationSeverity.optional(),
  title: nonEmpty.max(200),
  message: nonEmpty.max(4000),
  link: z.string().max(300).optional(),
  /** Accepted on create too — a notification can be seeded already read
   *  (e.g. one an advisor filed after handling it), not only through a
   *  two-step create-then-mark-read. */
  read: z.boolean().optional(),
})
export type NotificationCreate = z.infer<typeof notificationCreate>

/** `title`/`message`/`link` stay editable on update as well as `read` — a
 *  correction to a notification's own text is a legitimate write, not just
 *  the read/unread toggle. */
export const notificationUpdate = notificationCreate.partial()
export type NotificationUpdate = z.infer<typeof notificationUpdate>

export const notificationRow = appRow({
  category: notificationCategory,
  severity: notificationSeverity,
  title: z.string(),
  message: z.string(),
  link: z.string().nullable(),
  read: z.boolean(),
  /** Null until the notification is marked read. */
  readAt: z.string().nullable(),
})
export type NotificationRow = z.infer<typeof notificationRow>
