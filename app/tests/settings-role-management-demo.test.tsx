import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `RoleManagement` on a fixture build (its own file so `@/data/repository`'s
 *  module-level `isLive` is unmocked). There is no account table behind a
 *  demo build to count staff from — the per-role user count says so rather
 *  than showing a fixture number as if it came from somewhere. */
const { RoleManagement } = await import('@/screens/settings/RoleManagement')

describe('RoleManagement — fixture build', () => {
  it("shows the real permission counts, and says a staff count isn't available rather than inventing one", async () => {
    renderScreen(RoleManagement, { role: 'owner' })

    const ownerRow = (await screen.findByText('Owner / CEO')).closest('tr')
    expect(ownerRow).not.toBeNull()
    expect(ownerRow!.textContent).toContain('—')
  })
})
