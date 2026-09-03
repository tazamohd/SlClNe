import { useMemo } from 'react'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { Language } from '@/data/types'

/** Locale-aware dates and times, once.
 *
 *  Seven screens had their own `Intl.DateTimeFormat` call, two of them with a
 *  hardcoded `'en-US'` that rendered month-first dates to a Saudi workshop.
 *  The handoff (§7) says Gregorian by default with Latin digits even in Arabic
 *  — plates, invoice ids and money are all `dir="ltr"` Latin runs, and a date
 *  in Arabic-Indic digits next to a Latin invoice number reads as two systems.
 *  `ca-gregory` and `nu-latn` pin both. */
export function localeFor(language: Language): string {
  return language === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB'
}

export type DateStyle = 'short' | 'medium' | 'long'

type DateInput = Date | string | number | null | undefined

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
}

export function formatDate(value: DateInput, language: Language, style: DateStyle = 'medium'): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(localeFor(language), DATE_OPTIONS[style]).format(date)
}

export function formatTime(value: DateInput, language: Language): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(localeFor(language), { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatDateTime(value: DateInput, language: Language, style: DateStyle = 'medium'): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(localeFor(language), {
    ...DATE_OPTIONS[style],
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const RELATIVE_STEPS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** "3 hours ago" / "in 2 days", or "just now" inside a minute. `now` is
 *  injectable so a test does not depend on the wall clock. */
export function formatRelative(value: DateInput, language: Language, now: Date = new Date()): string {
  const date = toDate(value)
  if (!date) return '—'
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(localeFor(language), { numeric: 'auto' })
  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit)
  }
  return formatter.format(0, 'second')
}

/** The formatter bound to the session language. */
export function useDateFormat() {
  const { language } = usePreferences()
  return useMemo(
    () => ({
      date: (value: DateInput, style?: DateStyle) => formatDate(value, language, style),
      time: (value: DateInput) => formatTime(value, language),
      dateTime: (value: DateInput, style?: DateStyle) => formatDateTime(value, language, style),
      relative: (value: DateInput, now?: Date) => formatRelative(value, language, now),
      locale: localeFor(language),
    }),
    [language]
  )
}
