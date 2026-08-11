/** Appointments. A bay cannot be double-booked — enforced server-side by
 *  `rules/appointment.ts`, not by the calendar component. */
import { z } from 'zod'
import { isoDate, nonEmpty, plate, ulid } from '../primitives'
import { appRow } from './common'

export const appointmentStatus = z.enum(['confirmed', 'awaiting', 'no-show', 'cancelled', 'completed'])
export type AppointmentStatus = z.infer<typeof appointmentStatus>

/** `"9:00 AM"` — the wall-clock label the design shows. Stored alongside the
 *  machine value so the render is exact and the arithmetic is still possible. */
export const timeLabel = z
  .string()
  .regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, 'expected h:mm AM/PM')

export const appointmentCreate = z.object({
  scheduledDate: isoDate,
  timeLabel,
  /** Minutes from `timeLabel`, used for the overlap check. */
  startMinute: z.number().int().min(0).max(24 * 60 - 1),
  durationMins: z.number().int().min(5).max(24 * 60),
  customerId: ulid.optional(),
  customerName: nonEmpty.max(160),
  vehicleId: ulid.optional(),
  vehicleLabel: nonEmpty.max(120),
  plate,
  serviceLabel: nonEmpty.max(80),
  bay: nonEmpty.max(32),
  technicianId: ulid.optional(),
  technicianName: z.string().max(160).optional(),
  status: appointmentStatus.default('awaiting'),
})

export const appointmentUpdate = appointmentCreate.partial()

export type AppointmentCreate = z.infer<typeof appointmentCreate>
export type AppointmentUpdate = z.infer<typeof appointmentUpdate>

export const appointmentRow = appRow({
  time: z.string(),
  cust: z.string(),
  veh: z.string(),
  plate: z.string(),
  svc: z.string(),
  status: appointmentStatus,
  bay: z.string(),
  tech: z.string(),
  mins: z.number().int(),
  scheduledDate: z.string().nullable(),
  startMinute: z.number().int(),
})

export type AppointmentRow = z.infer<typeof appointmentRow>

/** `"9:00 AM"` → `540`. Used on both sides so the overlap the form warns about
 *  and the overlap the server refuses are the same arithmetic. */
export function minuteOfDay(label: string): number {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(label.trim())
  if (!match) throw new Error(`not a time label: ${label}`)
  const hour12 = Number(match[1]) % 12
  const minutes = Number(match[2])
  const offset = match[3] === 'PM' ? 12 * 60 : 0
  return hour12 * 60 + minutes + offset
}

export function formatTimeLabel(minute: number): string {
  const hour24 = Math.floor(minute / 60) % 24
  const minutes = minute % 60
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}
