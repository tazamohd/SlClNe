import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `Profile` (admin/Profile.tsx) on a live build.
 *
 *  Previously "Save Changes" always showed a success toast — the name was
 *  never persisted, and the current-password field was validated locally and
 *  then thrown away without ever being checked against the server. The point
 *  of this file: a name change calls `PATCH /auth/me`, a password change
 *  calls `POST /auth/change-password` and ends the session on success, and a
 *  server-refused current password surfaces the server's own message rather
 *  than the client's local shape check pretending the request never needed
 *  to happen.
 */
vi.mock('@/data/repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/repository')>()),
  API_URL: 'https://api.test',
  isLive: true,
}))

const { Profile } = await import('@/screens/admin/Profile')

const REFRESH_KEY = 'salis-refresh'
const fetchMock = vi.fn()

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status })
}

function tokenPair(over: Record<string, unknown> = {}) {
  return {
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    expiresIn: 900,
    user: {
      id: '01USER001',
      email: 'owner@salisauto.sa',
      name: 'Khalid Al-Amri',
      role: 'owner',
      baseRole: 'owner',
      orgId: 'org1',
      branchId: 'branch1',
    },
    ...over,
  }
}

/** Signs the session in before the screen under test ever renders: the
 *  bootstrap effect reads a stored refresh token and exchanges it for an
 *  access token via `POST /auth/refresh`, which is the only way
 *  `updateProfile`/`changePassword` see a token to call with. */
async function signIn() {
  window.localStorage.setItem(REFRESH_KEY, 'stored-refresh-token')
  fetchMock.mockResolvedValueOnce(jsonResponse(200, tokenPair()))
  const result = renderScreen(Profile, { role: 'owner' })
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  await screen.findByDisplayValue('Khalid Al-Amri')
  return result
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Profile — live', () => {
  it('saves a changed name through PATCH /auth/me, not a fake toast', async () => {
    await signIn()
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { user: { ...tokenPair().user, name: 'New Name' }, entitlements: null }),
    )

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body as string)).toEqual({ name: 'New Name' })
    expect(await screen.findByText('Profile updated')).toBeInTheDocument()
  })

  it('changes the password through POST /auth/change-password and ends the session', async () => {
    await signIn()
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }))

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'the-old-password' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'a-brand-new-long-password' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'a-brand-new-long-password' } })
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      currentPassword: 'the-old-password',
      newPassword: 'a-brand-new-long-password',
    })
    expect(await screen.findByText('Password changed')).toBeInTheDocument()
    // The session ended: the stored refresh token this test seeded is gone.
    await waitFor(() => expect(window.localStorage.getItem(REFRESH_KEY)).toBeNull())
  })

  it('surfaces a server-refused current password on the field, and revokes nothing', async () => {
    await signIn()
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { error: { code: 'invalid_credentials', message: 'That current password is incorrect.', field: 'current' } }),
    )

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'wrong-password' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'a-brand-new-long-password' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'a-brand-new-long-password' } })
    fireEvent.click(screen.getByText('Save Changes'))

    expect(await screen.findByText('That current password is incorrect.')).toBeInTheDocument()
    // Still signed in — a refused change is not treated as one that happened.
    expect(window.localStorage.getItem(REFRESH_KEY)).not.toBeNull()
  })

  it("rejects a new password shorter than the server's own policy before ever calling it", async () => {
    await signIn()

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'the-old-password' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'short' } })
    fireEvent.click(screen.getByText('Save Changes'))

    expect(await screen.findByText('At least 12 characters')).toBeInTheDocument()
    // No second call: the request was never sent.
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
