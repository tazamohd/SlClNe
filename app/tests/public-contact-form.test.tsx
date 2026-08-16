import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicContact, validateContact } from '@/screens/public/Contact'

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

describe('contact form validation', () => {
  it('rejects an empty submission with per-field errors', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a message.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rejects a malformed email and ties the error to the field', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Name'), 'Ahmed')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Message'), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send Message' }))
    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.')
  })

  it('validateContact accepts a complete, well-formed message', () => {
    expect(
      validateContact({ name: 'A', email: 'a@b.co', message: 'hi' })
    ).toEqual({})
  })
})

describe('contact form delivery — fixture build (no VITE_API_URL)', () => {
  // The public lead endpoint now exists (F-025), but this test build ships no
  // backend (API_URL is ''), so there is genuinely nowhere to deliver. The
  // honest outcome is the "not launched here" state with working channels — no
  // success is faked. The live 202/429/400 paths are covered in
  // public-contact-live.test.tsx, which mocks the endpoint.
  it('a valid submission states messaging is not live in this build, with working fallback channels', async () => {
    const user = userEvent.setup()
    renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('We could not send your message.')
    expect(alert).toHaveTextContent('Online messaging has not launched for this site yet.')
    // The failure state hands the visitor channels that actually work.
    expect(alert.querySelector('a[href="mailto:info@salisauto.sa"]')).toBeTruthy()
    expect(alert.querySelector('a[href="tel:+966112345678"]')).toBeTruthy()
  })

  it('never fakes a success state on the fixture build', async () => {
    const user = userEvent.setup()
    const { container } = renderContact()
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(container.textContent).not.toMatch(/message sent|thank you/i)
  })
})
