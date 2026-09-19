import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `UserSettings` (settings/UserSettings.tsx).
 *
 *  Previously showed one hardcoded person ("Ahmed Al-Rashid",
 *  ahmed@salisauto.com, "+966 50 123 4567") regardless of who was signed in,
 *  plus a "System" theme value `PreferencesProvider` never offers (only
 *  light/dark) and a notification preference, date format and time format no
 *  column tracks. The point of this file: the name comes from the session in
 *  force, and language/theme reflect what `PreferencesProvider` is actually
 *  set to — not the old fixture's fixed strings.
 */
const { UserSettings } = await import('@/screens/settings/UserSettings')

describe('UserSettings', () => {
  it("renders the demo role's own name and real language/theme, not the old fixed person", async () => {
    renderScreen(UserSettings, { role: 'manager', language: 'en' })

    expect(screen.queryByText('Ahmed Al-Rashid')).toBeNull()
    expect(screen.queryByText('ahmed@salisauto.com')).toBeNull()
    expect(screen.queryByText('System')).toBeNull()
    expect(screen.queryByText('+966 50 123 4567')).toBeNull()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  it('reflects Arabic once the language preference is Arabic', async () => {
    renderScreen(UserSettings, { role: 'manager', language: 'ar' })
    expect(screen.getByText('العربية')).toBeInTheDocument()
  })
})
