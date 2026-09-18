import { describe, expect, it } from 'vitest'
import { samePathFor } from '@/providers/NativeProvider'

/** Which `appUrlOpen` payloads become a navigation.
 *
 *  On Android any installed app can fire an intent at a registered custom
 *  scheme, and on iOS a universal link can carry any path — so the URL that
 *  reaches this function is attacker-controllable. Handing it straight to
 *  `navigate()` would let another app choose which screen opens and with what
 *  query string; `//evil.example.com/x` is the shape that catches people out,
 *  because it is a protocol-relative URL that resolves to a different origin
 *  while looking like a path.
 */
describe('samePathFor', () => {
  const origin = window.location.origin

  it('follows an absolute link to this app', () => {
    expect(samePathFor(`${origin}/job-cards`)).toBe('/job-cards')
  })

  it('keeps the query and hash a deep link carries', () => {
    expect(samePathFor(`${origin}/invoices?status=overdue#total`)).toBe(
      '/invoices?status=overdue#total'
    )
  })

  it('follows the app’s own custom scheme', () => {
    expect(samePathFor('com.salisauto.app://job-cards')).toBe('/job-cards')
  })

  it('normalises a custom-scheme link that arrives with extra slashes', () => {
    expect(samePathFor('com.salisauto.app:///job-cards')).toBe('/job-cards')
  })

  /* `URL` reads `//job-cards` as an authority for a non-special scheme, so the
   * two-slash form parses as host `job-cards` with an empty pathname and the
   * three-slash form the other way round. Capacitor emits the two-slash form,
   * and reading `pathname` alone sends every deep link to `/`. */
  it('follows a multi-segment custom-scheme link', () => {
    expect(samePathFor('com.salisauto.app://customer-app/home')).toBe('/customer-app/home')
  })

  it('keeps the query and hash on a custom-scheme link', () => {
    expect(samePathFor('com.salisauto.app://invoices?status=overdue#total')).toBe(
      '/invoices?status=overdue#total'
    )
  })

  it('refuses a link to another origin', () => {
    expect(samePathFor('https://evil.example.com/job-cards')).toBeNull()
  })

  it('refuses a protocol-relative link, which resolves off-origin', () => {
    expect(samePathFor('//evil.example.com/job-cards')).toBeNull()
  })

  it('refuses another app’s scheme', () => {
    expect(samePathFor('com.other.app://job-cards')).toBeNull()
  })

  it('refuses a javascript: payload', () => {
    expect(samePathFor('javascript:alert(1)')).toBeNull()
  })

  it('treats a bare path as this app’s, since that is what it resolves to', () => {
    expect(samePathFor('/dashboard')).toBe('/dashboard')
  })
})
