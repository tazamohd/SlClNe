import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'

/** The live-path counterpart to public-contact-form.test.tsx.
 *
 *  There, `API_URL` is '' (the fixture build) and the form honestly reports it
 *  cannot deliver. Here we mock `@/data/repository` so `API_URL` is set — the
 *  form takes the live branch and calls `POST /public/leads` — and we mock
 *  `fetch` to stand in for the endpoint. `LIVE` is computed once at module load
 *  from `API_URL`, so the mock must be in place before Contact is imported;
 *  Vitest isolates the module registry per test file, so this file sees a live
 *  API while the sibling file sees the fixture. */
vi.mock('@/data/repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/repository')>()),
  API_URL: 'https://api.test',
}))

// Imported after the mock is registered (vi.mock is hoisted above imports).
const { PublicContact } = await import('@/screens/public/Contact')

function renderContact() {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={['/public-portal/contact']}>
        <PublicContact />
      </MemoryRouter>
    </PreferencesProvider>
  )
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Ahmed Al-Rashid')
  await user.type(screen.getByLabelText('Email'), 'ahmed@example.sa')
  await user.type(screen.getByLabelText('Message'), 'I would like a demo for my workshop.')
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('contact form delivery — live endpoint', () => {
  it('POSTs the lead to /public/leads with no auth header and shows a real confirmation on 202', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ status: 'accepted' }), { status: 202 })
    )
    const user = userEvent.setup()
    renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Message sent.'))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/public/leads')
    expect(init.method).toBe('POST')
    // The one public write carries no token — no Authorization header at all.
    expect(init.headers).not.toHaveProperty('authorization')
    expect(init.headers).not.toHaveProperty('Authorization')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.sa',
      message: 'I would like a demo for my workshop.',
      source: 'Website',
    })
    // The form clears after a real acceptance.
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('maps a 429 rate-limit to a wait-and-retry message with working channels', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 429, message: 'Rate limit exceeded' }), {
        status: 429,
      })
    )
    const user = userEvent.setup()
    renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Too many messages from this address.')
    expect(alert.querySelector('a[href="mailto:info@salisauto.sa"]')).toBeTruthy()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('surfaces a 400 validation message from the server envelope', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'bad_request', message: 'Provide an email or a phone number so we can reply.' } }),
        { status: 400 }
      )
    )
    const user = userEvent.setup()
    renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Provide an email or a phone number so we can reply.')
  })

  it('falls back to a transport message when the server cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('We could not reach the server.')
  })
})
