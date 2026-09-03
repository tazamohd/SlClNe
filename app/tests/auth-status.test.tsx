import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navigate, Route, Routes } from 'react-router-dom'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountLocked, SessionExpired } from '@/screens/auth/StatusScreens'
import { Splash, SPLASH_MS } from '@/screens/auth/Splash'
import { Login } from '@/screens/auth/Login'
import { REDUCED_MOTION_QUERY } from '@/lib/useReducedMotion'
import { renderWithProviders } from './helpers/render'

describe('AccountLocked', () => {
  it('counts down in mono mm:ss, pinned LTR, with a polite announcement', () => {
    renderWithProviders(<AccountLocked />, { route: '/account-locked' })
    const countdown = screen.getByTestId('lockout-countdown')
    expect(countdown).toHaveTextContent('15:00')
    expect(countdown).toHaveAttribute('dir', 'ltr')
    expect(countdown).toHaveAttribute('role', 'timer')
    expect(countdown.className).toContain('font-mono')

    const live = document.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('Unlocks in 15:00')
  })

  it('is live, not a static fifteen minutes', () => {
    vi.useFakeTimers()
    try {
      renderWithProviders(<AccountLocked />, { route: '/account-locked' })
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(screen.getByTestId('lockout-countdown')).toHaveTextContent('14:57')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('SessionExpired', () => {
  function mount(state?: { email: string }) {
    return renderWithProviders(
      <Routes>
        <Route path="/" element={<Navigate to="/session-expired" replace state={state} />} />
        <Route path="/session-expired" element={<SessionExpired />} />
        <Route path="/login" element={<Login />} />
      </Routes>,
      { route: '/' }
    )
  }

  it('shows the address the session belonged to and hands it to Login', async () => {
    const user = userEvent.setup()
    mount({ email: 'advisor@salis.example' })
    expect(screen.getByText('advisor@salis.example')).toHaveAttribute('dir', 'ltr')

    await user.click(screen.getByRole('link', { name: 'Sign In' }))
    expect((document.getElementById('email') as HTMLInputElement).value).toBe(
      'advisor@salis.example'
    )
  })

  it('says nothing about an address it was not given', () => {
    mount()
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login')
  })
})

describe('Splash', () => {
  const original = window.matchMedia

  afterEach(() => {
    window.matchMedia = original
    vi.useRealTimers()
  })

  function preferReducedMotion() {
    const base = window.matchMedia
    window.matchMedia = (query: string) =>
      query === REDUCED_MOTION_QUERY
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => true,
          } as unknown as MediaQueryList)
        : base(query)
  }

  function mount() {
    return renderWithProviders(
      <Routes>
        <Route path="/splash" element={<Splash />} />
        <Route path="/welcome" element={<h1>Welcome landed</h1>} />
      </Routes>,
      { route: '/splash' }
    )
  }

  it('animates by default', () => {
    mount()
    expect(screen.getByTestId('splash-stage').className).toContain('animate-fade-up')
  })

  it('skips the animation under reduced motion but still moves on after the same wait', () => {
    preferReducedMotion()
    vi.useFakeTimers()
    mount()
    expect(screen.getByTestId('splash-stage').className).not.toContain('animate-')

    act(() => {
      vi.advanceTimersByTime(SPLASH_MS - 100)
    })
    expect(screen.queryByText('Welcome landed')).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByText('Welcome landed')).toBeInTheDocument()
  })
})
