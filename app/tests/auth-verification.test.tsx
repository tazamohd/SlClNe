import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OTPVerification, TwoFactorVerification } from '@/screens/auth/VerificationScreens'
import { renderWithProviders } from './helpers/render'

/** The code screens used to be six loose boxes: no autofill from the SMS, no
 *  paste, and a button to press after typing the sixth digit. They are one
 *  field now, drawn as six cells. */

function mount(route: '/otpverification' | '/two-factor-verification') {
  return renderWithProviders(
    <Routes>
      <Route path="/otpverification" element={<OTPVerification />} />
      <Route path="/two-factor-verification" element={<TwoFactorVerification />} />
      <Route path="/dashboard" element={<h1>Dashboard landed</h1>} />
    </Routes>,
    { route }
  )
}

const field = () => screen.getByLabelText('Verification code') as HTMLInputElement
const localCode = () => screen.getByTestId('local-code').textContent ?? ''
const wrongCode = () => (localCode() === '000000' ? '111111' : '000000')

describe('OTPVerification', () => {
  it('is one numeric field the phone can autofill, pinned left-to-right', () => {
    mount('/otpverification')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(field()).toHaveAttribute('inputmode', 'numeric')
    expect(field()).toHaveAttribute('autocomplete', 'one-time-code')
    expect(field()).toHaveAttribute('pattern', '[0-9]*')
    expect(field()).toHaveAttribute('maxlength', '6')
    expect(field()).toHaveAttribute('dir', 'ltr')
  })

  it('strips the punctuation an SMS pastes in', async () => {
    const user = userEvent.setup()
    mount('/otpverification')
    await user.click(field())
    await user.paste('482 913')
    expect(field().value).toBe('482913')
  })

  it('refuses letters and the overflow', async () => {
    const user = userEvent.setup()
    mount('/otpverification')
    await user.click(field())
    await user.keyboard('4a8')
    expect(field().value).toBe('48')
    await user.paste('12345678')
    expect(field().value).toBe('123456')
  })

  it('verifies as soon as the sixth digit lands', async () => {
    const user = userEvent.setup()
    mount('/otpverification')
    await user.click(field())
    await user.keyboard(localCode())
    expect(await screen.findByText('Dashboard landed')).toBeInTheDocument()
  })

  it('clears a rejected code so the next attempt starts empty', async () => {
    const user = userEvent.setup()
    mount('/otpverification')
    await user.click(field())
    await user.keyboard(wrongCode())
    await waitFor(() => expect(field().value).toBe(''))
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Dashboard landed')).not.toBeInTheDocument()
  })

  it('throttles resend for a minute and announces the wait politely', () => {
    mount('/otpverification')
    const resend = screen.getByRole('button', { name: /Resend Code/ })
    expect(resend).toBeDisabled()
    expect(screen.getByTestId('resend-countdown')).toHaveTextContent('(60s)')
    expect(screen.getByTestId('resend-countdown')).toHaveAttribute('dir', 'ltr')
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('Resend available in 60s')
  })
})

describe('TwoFactorVerification', () => {
  it('auto-submits the authenticator code', async () => {
    const user = userEvent.setup()
    mount('/two-factor-verification')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    await user.click(field())
    await user.keyboard(localCode())
    expect(await screen.findByText('Dashboard landed')).toBeInTheDocument()
  })
})
