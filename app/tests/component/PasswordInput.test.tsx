import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput, passwordStrength } from '@/components/ui/PasswordInput'
import { renderWithProviders } from '../helpers/render'

/** Login had an eye toggle and nothing else had one; no field warned about
 *  Caps Lock; only Login told the password manager what kind of password it
 *  was. Each test here is one of those gaps, closed once for every caller. */

function Harness({
  strength,
  autoComplete = 'current-password',
}: {
  strength?: boolean
  autoComplete?: 'current-password' | 'new-password'
}) {
  const [value, setValue] = useState('')
  return (
    <>
      <label htmlFor="pw">Password</label>
      <PasswordInput
        id="pw"
        autoComplete={autoComplete}
        strength={strength}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </>
  )
}

const field = () => screen.getByLabelText('Password') as HTMLInputElement

describe('PasswordInput', () => {
  it('starts masked and reveals on the toggle, with a name that says which way it goes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    expect(field().type).toBe('password')
    expect(field()).toHaveAttribute('dir', 'ltr')

    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)

    expect(field().type).toBe('text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('passes the autocomplete hint through so a password manager can tell sign-in from sign-up', () => {
    renderWithProviders(<Harness autoComplete="new-password" />)
    expect(field()).toHaveAttribute('autocomplete', 'new-password')
  })

  it('warns while Caps Lock is on and stands down on blur', () => {
    renderWithProviders(<Harness />)
    expect(screen.queryByText('Caps Lock is on')).not.toBeInTheDocument()

    fireEvent.keyDown(field(), { key: 'A', modifierCapsLock: true })
    expect(screen.getByText('Caps Lock is on')).toBeInTheDocument()
    expect(field().getAttribute('aria-describedby')).toContain(
      screen.getByText('Caps Lock is on').id
    )

    fireEvent.keyUp(field(), { key: 'A', modifierCapsLock: false })
    expect(screen.queryByText('Caps Lock is on')).not.toBeInTheDocument()

    fireEvent.keyDown(field(), { key: 'B', modifierCapsLock: true })
    fireEvent.blur(field())
    expect(screen.queryByText('Caps Lock is on')).not.toBeInTheDocument()
  })

  it('shows no meter unless asked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)
    await user.type(field(), 'abc')
    expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
  })

  it('grades a typed password from Weak to Strong', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness strength />)

    await user.type(field(), 'abc')
    expect(screen.getByText('Weak')).toBeInTheDocument()

    await user.clear(field())
    await user.type(field(), 'Demo@1234')
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.queryByText('Weak')).not.toBeInTheDocument()
  })
})

describe('passwordStrength', () => {
  it('scores shape, not entropy', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('short')).toBe(1)
    expect(passwordStrength('password')).toBe(1)
    expect(passwordStrength('Password')).toBe(2)
    expect(passwordStrength('Password1')).toBe(3)
    expect(passwordStrength('Demo@1234')).toBe(4)
    expect(passwordStrength('correct horse battery staple')).toBe(3)
  })
})
