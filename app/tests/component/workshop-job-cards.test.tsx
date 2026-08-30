import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobCards } from '@/screens/workshop/JobCards'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

/** "New Job Card" was one of the 23 dead CTAs: it routed to a check-in screen
 *  that kept everything in component state. These pin the two properties that
 *  make it not-dead — the button opens a real form, and the form reports a
 *  refused save instead of claiming one. */
describe('JobCards — New Job Card', () => {
  it('opens the create dialog rather than navigating somewhere hopeful', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobCards />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /New Job Card/ }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText(/Customer/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Vehicle/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Service/)).toBeInTheDocument()
  })

  it('refuses an empty submit and puts the message on the field', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<JobCards />, { role: 'owner' })
    await user.click(await screen.findByRole('button', { name: /New Job Card/ }))
    await screen.findByRole('dialog')

    // The footer button is disabled without an API; the form's own submit is
    // what a keyboard user reaches with Enter, and it validates either way.
    await user.click(container.ownerDocument.querySelector('button[type="submit"]') as HTMLElement)

    expect(await screen.findByText('Enter the customer name.')).toBeInTheDocument()
  })

  it('creates a job card when valid fields are submitted', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<JobCards />, { role: 'owner' })
    await user.click(await screen.findByRole('button', { name: /New Job Card/ }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText(/Customer/), 'Ahmed Al-Rashid')
    await user.type(within(dialog).getByLabelText(/Vehicle/), 'Toyota Camry 2022')
    await user.click(container.ownerDocument.querySelector('button[type="submit"]') as HTMLElement)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('hides the CTA from a role without the create grant', async () => {
    // A technician may view the queue and may not open a card. The server
    // re-checks `jobcards:c` on POST /jobs — hiding it is UX, not the boundary.
    renderWithProviders(<JobCards />, { role: 'technician' })
    await screen.findByRole('heading', { name: 'Job Cards' })
    expect(screen.queryByRole('button', { name: /New Job Card/ })).toBeNull()
  })

  it('still offers the CTA on a phone, where the list is cards not a table', async () => {
    setViewportWidth(390)
    renderWithProviders(<JobCards />, { role: 'owner' })
    expect(await screen.findByRole('button', { name: /New Job Card/ })).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })
})
