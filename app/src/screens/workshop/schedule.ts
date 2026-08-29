/** Shared time helpers for the two schedule views — AppointmentCalendar's time
 *  grid and TechnicianSchedule's per-technician lists both read `appointments`
 *  and need the same minute maths and the same service colour, so it lives here
 *  once rather than being copied into both.
 *
 *  The live API presents `startMinute`; the fixture tables carry only the
 *  human `time` label ("9:00 AM"). `minuteOf` reads the number when it is there
 *  and parses the label when it is not, so both data sources render the same
 *  grid rather than one of them collapsing to midnight. */
import type { RowOf } from '@/data/useCollection'

export type Appointment = RowOf<'appointments'> & { _id?: string; startMinute?: number }

/** "9:00 AM" / "1:30 PM" → minutes past midnight. Returns `null` for anything
 *  it cannot read, so the caller can drop an unplaceable appointment rather
 *  than stack it at 00:00. */
export function parseTimeLabel(label: string | undefined): number | null {
  if (!label) return null
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(label.trim())
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/** The appointment's start minute, from the presented field or the label. */
export function minuteOf(appt: Appointment): number | null {
  if (typeof appt.startMinute === 'number' && appt.startMinute > 0) return appt.startMinute
  return parseTimeLabel(appt.time)
}

/** The strict wall-clock label the appointment contract accepts, mirrored here
 *  because the app deliberately does not depend on `@salis/contract` (see
 *  `stages.ts`). The server re-validates on write; this only keeps the form
 *  from sending an obviously malformed value. */
export function isValidTimeLabel(label: string): boolean {
  return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(label.trim())
}

/** Minutes → "9:00 AM". LTR by construction; render inside a `dir="ltr"`. */
export function labelOfMinute(minute: number): string {
  const h24 = Math.floor(minute / 60)
  const m = minute % 60
  const meridiem = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${meridiem}`
}

/** The design tints an appointment block by service. Only brand-legal colours
 *  appear — blue, sky, navy, slate, orange — keyed off the service label so a
 *  row picks its own colour deterministically. */
export function serviceTint(service: string): { bg: string; fg: string } {
  const key = service.trim().toLowerCase()
  const TINTS: Record<string, { bg: string; fg: string }> = {
    maintenance: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
    inspection: { bg: 'rgba(11,179,255,.15)', fg: 'var(--salis-blue-bright)' },
    'oil change': { bg: 'rgba(11,179,255,.15)', fg: 'var(--salis-blue-bright)' },
    repair: { bg: 'rgba(249,115,22,.12)', fg: 'var(--salis-orange)' },
    diagnostics: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
    'tire service': { bg: 'rgba(100,116,139,.12)', fg: 'var(--text-muted)' },
  }
  return TINTS[key] ?? { bg: 'rgba(100,116,139,.12)', fg: 'var(--text-muted)' }
}

/** Minutes an appointment lasts, defaulting to a 30-minute slot when unknown. */
export function durationOf(appt: Appointment): number {
  const raw = (appt as { mins?: number }).mins
  return typeof raw === 'number' && raw > 0 ? raw : 30
}
