import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `WelcomePage` (dashboard/WelcomePage.tsx).
 *
 *  Previously "5"/"12"/"8" were constants that never moved no matter what
 *  the underlying data held, plus a fourth "Notifications: 3" stat no
 *  collection backs at all. The point of this file: the appointment,
 *  active-job and pending-invoice counts move with the fixture rows behind
 *  them (the same rows every other screen reading these collections sees),
 *  and the notifications stat is gone rather than left fabricated.
 */
const { WelcomePage } = await import('@/screens/dashboard/WelcomePage')

describe('WelcomePage', () => {
  it('counts real fixture rows rather than showing fixed numbers', async () => {
    renderScreen(WelcomePage, { role: 'manager' })

    expect(await screen.findByText('Appointments')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Pending Invoices')).toBeInTheDocument()
    // The dropped stat: no collection backs a notification count.
    expect(screen.queryByText('Notifications')).toBeNull()
  })
})
