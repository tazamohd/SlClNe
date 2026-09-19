import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `Profile` on a fixture build (no `VITE_API_URL`, its own file so the
 *  module-level `LIVE` constant `@/providers/SessionProvider` computes once
 *  at import time is unmocked).
 *
 *  There is no account here for "Save Changes" to update or a password to
 *  change against — it must say so rather than showing the same "Profile
 *  updated" success a live save does. */
const { Profile } = await import('@/screens/admin/Profile')

describe('Profile — fixture build', () => {
  it('says the deployment has no API rather than faking a save', async () => {
    renderScreen(Profile, { role: 'owner' })
    fireEvent.click(screen.getByText('Save Changes'))
    expect(await screen.findByText('Not available on this deployment')).toBeInTheDocument()
    expect(screen.queryByText('Profile updated')).toBeNull()
  })
})
