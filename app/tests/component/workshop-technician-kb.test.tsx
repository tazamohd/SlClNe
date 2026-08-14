import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TechnicianKB } from '@/screens/workshop/TechnicianKB'
import { renderWithProviders } from '../helpers/render'

/** The knowledge base is entirely real `kbProcedures` data — search, category
 *  filter and a modal that renders the loaded row. */
describe('TechnicianKB', () => {
  it('renders the seeded procedures', async () => {
    renderWithProviders(<TechnicianKB />, { role: 'technician' })
    expect(await screen.findByText(/Front brake pad & rotor replacement/)).toBeInTheDocument()
  })

  it('filters by search term', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TechnicianKB />, { role: 'technician' })
    await screen.findByText(/Front brake pad & rotor replacement/)
    await user.type(
      screen.getByPlaceholderText(/Search by procedure/),
      'zzz-no-such-procedure'
    )
    expect(await screen.findByText('Nothing matches')).toBeInTheDocument()
  })

  it('opens a procedure in a modal with its torque spec', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TechnicianKB />, { role: 'technician' })
    await user.click(await screen.findByText(/Front brake pad & rotor replacement/))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Torque specification')).toBeInTheDocument()
  })
})
