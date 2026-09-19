import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderScreen } from './helpers/render'

/** Invite acceptance (Phase A) on a live build.
 *
 *  `InviteAcceptance` is the frontend half of `POST /admin/staff`'s invite
 *  mode: the link's `?token=` is the whole of what authorizes this screen, so
 *  the point of this file is that it actually calls `GET /auth/invite/:token`
 *  and `POST /auth/invite/:token/accept` rather than showing the decorative,
 *  disabled-button placeholder it used to. */
vi.mock('@/data/repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/repository')>()),
  API_URL: 'https://api.test',
  isLive: true,
}))

const { InviteAcceptance } = await import('@/screens/auth/InviteAcceptance')

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status })
}

describe('InviteAcceptance — live', () => {
  it('previews the invite, then accepts it and sets the password', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { name: 'New Hire', email: 'new@salisauto.sa' }))
      .mockResolvedValueOnce(jsonResponse(200, { message: 'ok' }))

    const user = userEvent.setup()
    renderScreen(InviteAcceptance, { route: '/invite-acceptance?token=abc123' })

    expect(await screen.findByText(/New Hire/)).toBeInTheDocument()
    expect(screen.getByText(/new@salisauto\.sa/)).toBeInTheDocument()

    const [previewUrl] = fetchMock.mock.calls[0] as [string]
    expect(previewUrl).toBe('https://api.test/auth/invite/abc123')

    await user.type(screen.getByLabelText('New password'), 'a-brand-new-and-quite-long-password')
    await user.type(screen.getByLabelText('Confirm password'), 'a-brand-new-and-quite-long-password')
    await user.click(screen.getByRole('button', { name: 'Accept Invite' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const [acceptUrl, acceptInit] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(acceptUrl).toBe('https://api.test/auth/invite/abc123/accept')
    expect(JSON.parse(acceptInit.body as string)).toEqual({
      password: 'a-brand-new-and-quite-long-password',
    })

    expect(await screen.findByText('Password set')).toBeInTheDocument()
  })

  it('refuses mismatched passwords without calling the server', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { name: 'New Hire', email: 'new@salisauto.sa' }))
    const user = userEvent.setup()
    renderScreen(InviteAcceptance, { route: '/invite-acceptance?token=abc123' })
    await screen.findByText(/New Hire/)

    await user.type(screen.getByLabelText('New password'), 'a-brand-new-and-quite-long-password')
    await user.type(screen.getByLabelText('Confirm password'), 'does-not-match-at-all')
    await user.click(screen.getByRole('button', { name: 'Accept Invite' }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows an invalid-invitation state for an expired or unknown token', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404 }))
    renderScreen(InviteAcceptance, { route: '/invite-acceptance?token=expired' })
    expect(await screen.findByText('Invalid invitation')).toBeInTheDocument()
  })
})
