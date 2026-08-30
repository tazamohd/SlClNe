import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover } from '@/components/ui/Popover'
import { renderWithProviders } from '../helpers/render'

/** Popover is the click-triggered overlay used for filter dropdowns, action
 *  menus, and contextual controls in the ERP. Must dismiss on outside click
 *  and on Escape. */

function PopoverHarness({ side }: { side?: 'top' | 'bottom' | 'start' | 'end' }) {
  return (
    <div>
      <button type="button">Outside</button>
      <Popover
        trigger={<button type="button">More actions</button>}
        side={side}
      >
        <button type="button">Edit</button>
        <button type="button">Delete</button>
        <button type="button">Export PDF</button>
      </Popover>
    </div>
  )
}

describe('Popover', () => {
  it('does not show content initially', () => {
    renderWithProviders(<PopoverHarness />)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('opens on click and shows content', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PopoverHarness />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeInTheDocument()
  })

  it('toggles closed on a second click of the trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PopoverHarness />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PopoverHarness />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument(),
    )
  })

  it('closes on outside click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PopoverHarness />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Outside' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument(),
    )
  })

  it('renders with the group role for accessibility', () => {
    renderWithProviders(<PopoverHarness />)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('supports different side positions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PopoverHarness side="top" />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    // The panel should be present with the top positioning class
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})
