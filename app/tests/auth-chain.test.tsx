import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Welcome } from '@/screens/auth/Welcome'
import { LanguageSelection } from '@/screens/auth/LanguageSelection'
import { RegionSelection } from '@/screens/auth/RegionSelection'
import { STORAGE_KEYS } from '@/lib/storage'
import { renderScreen } from './helpers/render'

/** The first-run chain — Welcome → Language → Region → Login — used to be four
 *  unrelated screens with no way back and no sense of how far along you were.
 *  Now the shell draws the progress and the back link; each screen only has
 *  to say where it sits. */

function progress() {
  return within(screen.getByTestId('auth-progress')).getAllByRole('listitem')
}

describe('Welcome', () => {
  it('is step 1 of 4 with no way back', () => {
    renderScreen(Welcome, { route: '/welcome' })
    const dots = progress()
    expect(dots).toHaveLength(4)
    expect(dots[0]).toHaveAttribute('aria-current', 'step')
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('says what the product does and lets a returning user skip to sign-in', () => {
    renderScreen(Welcome, { route: '/welcome' })
    expect(screen.getByRole('heading', { name: 'Welcome to SALIS AUTO' })).toBeInTheDocument()
    expect(screen.getByText('Every job from check-in to delivery')).toBeInTheDocument()
    expect(screen.getByText('Estimates, invoices and payments in SAR')).toBeInTheDocument()
    expect(screen.getByText('Arabic and English on any device')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute(
      'href',
      '/language-selection'
    )
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })
})

describe('LanguageSelection', () => {
  it('is step 2 of 4 and links back to Welcome', () => {
    renderScreen(LanguageSelection, { route: '/language-selection' })
    expect(progress()[1]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/welcome')
    expect(screen.getByRole('heading', { name: 'Choose your language' })).toBeInTheDocument()
  })

  it('keeps the Arabic card the smoke test presses', async () => {
    const user = userEvent.setup()
    renderScreen(LanguageSelection, { route: '/language-selection' })
    const arabic = screen.getByRole('button', { name: /Arabic|العربية/ })
    expect(arabic).toHaveAttribute('aria-pressed', 'false')
    await user.click(arabic)
    expect(await screen.findByRole('heading', { name: 'اختر لغتك' })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })
})

describe('RegionSelection', () => {
  it('is step 3 of 4 and persists the chosen city', async () => {
    const user = userEvent.setup()
    renderScreen(RegionSelection, { route: '/region-selection' })
    expect(progress()[2]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/language-selection'
    )

    expect(screen.getByRole('button', { name: /Riyadh/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Jeddah/ }))
    expect(window.localStorage.getItem(STORAGE_KEYS.region)).toBe('Jeddah')
    expect(screen.getByRole('button', { name: /Jeddah/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/login')
  })

  it('reopens on the city it saved', () => {
    window.localStorage.setItem(STORAGE_KEYS.region, 'Dammam')
    renderScreen(RegionSelection, { route: '/region-selection' })
    expect(screen.getByRole('button', { name: /Dammam/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
