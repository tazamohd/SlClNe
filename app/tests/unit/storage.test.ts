import { describe, expect, it, beforeEach } from 'vitest'
import { readStored, writeStored, clearStored, STORAGE_KEYS } from '@/lib/storage'

/** Storage helpers — try/catch wrappers around localStorage that swallow errors
 *  in private-mode or disabled-storage browsers. The vitest setup stubs
 *  localStorage on jsdom, so these tests exercise the happy path, the key
 *  constants, and the round-trip contract. */

describe('readStored / writeStored / clearStored', () => {
  const KEY = '__test_storage_key__'

  beforeEach(() => {
    window.localStorage.removeItem(KEY)
  })

  it('returns null for a key that has never been set', () => {
    expect(readStored(KEY)).toBeNull()
  })

  it('round-trips a string value', () => {
    writeStored(KEY, 'hello')
    expect(readStored(KEY)).toBe('hello')
  })

  it('overwrites a previous value', () => {
    writeStored(KEY, 'first')
    writeStored(KEY, 'second')
    expect(readStored(KEY)).toBe('second')
  })

  it('clearStored removes the key', () => {
    writeStored(KEY, 'exists')
    clearStored(KEY)
    expect(readStored(KEY)).toBeNull()
  })

  it('clearStored is safe on a key that does not exist', () => {
    expect(() => clearStored('__never_set__')).not.toThrow()
  })

  it('stores and retrieves JSON via a manual round-trip', () => {
    const obj = { theme: 'dark', lang: 'ar' }
    writeStored(KEY, JSON.stringify(obj))
    const raw = readStored(KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(obj)
  })
})

describe('STORAGE_KEYS', () => {
  it('has the expected application keys', () => {
    expect(STORAGE_KEYS.theme).toBe('salis-theme')
    expect(STORAGE_KEYS.lang).toBe('salis-lang')
    expect(STORAGE_KEYS.role).toBe('salis-role')
    expect(STORAGE_KEYS.notifications).toBe('salis-notif')
    expect(STORAGE_KEYS.region).toBe('salis-region')
    expect(STORAGE_KEYS.token).toBe('salis-token')
    expect(STORAGE_KEYS.refresh).toBe('salis-refresh')
    expect(STORAGE_KEYS.user).toBe('salis-user')
  })

  it('every key has a string value and the salis- prefix', () => {
    for (const [name, value] of Object.entries(STORAGE_KEYS)) {
      expect(typeof value, `STORAGE_KEYS.${name}`).toBe('string')
      expect(value, `STORAGE_KEYS.${name}`).toMatch(/^salis-/)
    }
  })

  it('no two keys share the same localStorage name', () => {
    const values = Object.values(STORAGE_KEYS)
    expect(new Set(values).size).toBe(values.length)
  })
})
