import { readStored, STORAGE_KEYS } from '@/lib/storage'

/** Small shared facts of the first-run chain, kept out of the screen modules
 *  so Login's chunk does not have to carry RegionSelection or the status
 *  screens just to read a city name or a router-state email. */

export const REGION_CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah'] as const
export const DEFAULT_REGION = 'Riyadh'

/** The stored region, or the default the picker would have shown. */
export function storedRegion(): string {
  return readStored(STORAGE_KEYS.region) ?? DEFAULT_REGION
}

/** The address a sign-in screen was reached with, carried in router state so
 *  Login can prefill it. Anything that is not a plausible email is ignored. */
export function emailFromState(state: unknown): string | null {
  if (state && typeof state === 'object' && 'email' in state) {
    const value = (state as { email?: unknown }).email
    if (typeof value === 'string' && value.includes('@')) return value
  }
  return null
}

/** `mm:ss`, zero-padded, for a live countdown. */
export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}
