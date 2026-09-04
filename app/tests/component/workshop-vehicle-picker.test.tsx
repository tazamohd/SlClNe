import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobCards } from '@/screens/workshop/JobCards'
import { renderWithProviders } from '../helpers/render'

/** The catalogue picker inside the New Job Card form. It fills the Vehicle
 *  field with one canonical label and explains the car it picked; the field
 *  itself stays a text box, so a car the catalogue does not know can still be
 *  typed. */
describe('JobCardForm — vehicle picker', () => {
  async function openForm() {
    const user = userEvent.setup()
    renderWithProviders(<JobCards />, { role: 'owner' })
    await user.click(await screen.findByRole('button', { name: /New Job Card/ }))
    const dialog = await screen.findByRole('dialog')
    return { user, dialog }
  }

  it('cascades make → model → year → trim into the Vehicle field', async () => {
    const { user, dialog } = await openForm()

    const model = within(dialog).getByLabelText('Model')
    expect(model).toBeDisabled()

    await user.selectOptions(within(dialog).getByLabelText('Make'), 'BMW')
    await user.selectOptions(model, '7 Series')
    expect(within(dialog).getByLabelText(/^Vehicle/)).toHaveValue('BMW 7 Series')

    await user.selectOptions(within(dialog).getByLabelText('Model year'), '2022')
    await user.selectOptions(within(dialog).getByLabelText('Trim'), '740Li')
    expect(within(dialog).getByLabelText(/^Vehicle/)).toHaveValue('BMW 7 Series 740Li 2022')
  })

  it('explains the generation, the badge twin and the factory manual', async () => {
    const { user, dialog } = await openForm()
    await user.selectOptions(within(dialog).getByLabelText('Make'), 'Nissan')
    await user.selectOptions(within(dialog).getByLabelText('Model'), 'Patrol')
    await user.selectOptions(within(dialog).getByLabelText('Model year'), '2019')

    expect(within(dialog).getByText(/Y62 · 2010–2024/)).toBeInTheDocument()
    expect(within(dialog).getByText('Infiniti QX80')).toBeInTheDocument()
    expect(within(dialog).getByText("2019 Nissan Patrol Owner's Manual (Y62)")).toBeInTheDocument()
    // Nissan has no portal on record, so no link is invented.
    expect(within(dialog).queryByRole('link', { name: /Owner portal/ })).toBeNull()
  })

  it('links the maker’s owner portal when one is on record', async () => {
    const { user, dialog } = await openForm()
    await user.selectOptions(within(dialog).getByLabelText('Make'), 'Toyota')
    await user.selectOptions(within(dialog).getByLabelText('Model'), 'Land Cruiser')
    await user.selectOptions(within(dialog).getByLabelText('Model year'), '2020')
    const link = within(dialog).getByRole('link', { name: /Owner portal/ })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/www\.toyota\.com\//))
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('offers no model year before 2000', async () => {
    const { user, dialog } = await openForm()
    await user.selectOptions(within(dialog).getByLabelText('Make'), 'Mercedes-Benz')
    await user.selectOptions(within(dialog).getByLabelText('Model'), 'E-Class')
    const years = within(within(dialog).getByLabelText('Model year')).getAllByRole('option').map((option) => option.textContent)
    expect(years).toContain('2000')
    expect(years).not.toContain('1999')
  })

  it('leaves the Vehicle field editable after a pick', async () => {
    const { user, dialog } = await openForm()
    await user.selectOptions(within(dialog).getByLabelText('Make'), 'Toyota')
    await user.selectOptions(within(dialog).getByLabelText('Model'), 'Camry')
    const vehicle = within(dialog).getByLabelText(/^Vehicle/)
    await user.clear(vehicle)
    await user.type(vehicle, 'Toyota Camry 2022 GCC')
    expect(vehicle).toHaveValue('Toyota Camry 2022 GCC')
  })
})
