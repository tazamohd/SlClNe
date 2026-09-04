import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KioskCheckIn } from '@/screens/portals/KioskCheckIn'
import { renderWithProviders } from './helpers/render'

/** The kiosk against the in-memory repository: the whole flow works without
 *  an API (the old `!isLive` disabling is gone, the "Demo mode" chip says why),
 *  the keypad types into the phone field, and an untouched screen resets. */
describe('KioskCheckIn', () => {
  it('checks a walk-in through to a ticket in demo mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KioskCheckIn />, { route: '/kiosk-check-in', role: 'owner' })

    expect(screen.getByRole('heading', { name: 'Self Check-In' })).toBeInTheDocument()
    expect(screen.getByText('Demo mode')).toBeInTheDocument()

    const find = screen.getByRole('button', { name: /Find My Vehicle/ })
    expect(find).toBeDisabled()

    // The keypad types into the phone field.
    await user.click(screen.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const phone = screen.getByLabelText('Phone Number')
    expect(phone).toHaveValue('5')
    expect(phone).toHaveAttribute('inputmode', 'tel')
    expect(screen.getByLabelText('License Plate')).toHaveAttribute('autocapitalize', 'characters')

    await user.click(find)
    await user.click(await screen.findByRole('button', { name: /Toyota Camry 2023/ }))
    await user.click(await screen.findByRole('radio', { name: 'Oil Change' }))
    await user.click(screen.getByRole('button', { name: /Confirm Check-In/ }))

    expect(await screen.findByText('Check-In Complete')).toBeInTheDocument()
    // No server promised a wait, so none is invented.
    expect(screen.getByText("We'll call you")).toBeInTheDocument()
    expect(screen.queryByText(/15/)).toBeNull()
  })

  describe('idle reset', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('announces the countdown and clears the flow after a minute untouched', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderWithProviders(<KioskCheckIn />, { route: '/kiosk-check-in', role: 'owner' })

      await user.type(screen.getByLabelText('Phone Number'), '0501234567')
      await user.click(screen.getByRole('button', { name: /Find My Vehicle/ }))
      expect(await screen.findByText('Select Your Vehicle')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(50_000)
      })
      expect(screen.getByText(/Screen resets in/)).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(12_000)
      })
      expect(screen.getByText('Identify Yourself')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone Number')).toHaveValue('')
    })
  })
})
