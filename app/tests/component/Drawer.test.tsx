import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from '@/components/ui/Drawer'
import { renderWithProviders } from '../helpers/render'

/** The Drawer is the slide-out panel for filters, detail views, and forms.
 *  Focus trap and Escape-to-close are critical for keyboard users. */

function DrawerHarness({
  title,
  side,
  onClose,
}: {
  title?: string
  side?: 'start' | 'end'
  onClose?: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open drawer
      </button>
      <Drawer
        open={open}
        onClose={() => {
          onClose?.()
          setOpen(false)
        }}
        title={title ?? 'Filter Jobs'}
        side={side}
      >
        <label>
          Status
          <input type="text" defaultValue="" />
        </label>
        <button type="button" onClick={() => setOpen(false)}>
          Apply
        </button>
      </Drawer>
    </>
  )
}

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    renderWithProviders(<DrawerHarness />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when opened', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    const dialog = screen.getByRole('dialog', { name: 'Filter Jobs' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('displays the title and a close button inside the drawer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(screen.getByText('Filter Jobs')).toBeInTheDocument()
    // Both the backdrop and the X button share aria-label="Close".
    // The visible close button is inside the dialog panel.
    const dialog = screen.getByRole('dialog')
    const closeButtons = dialog.querySelectorAll('button[aria-label="Close"]')
    expect(closeButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<DrawerHarness onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when the X close button inside the panel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<DrawerHarness onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    // The X button is inside the dialog, not the backdrop
    const dialog = screen.getByRole('dialog')
    const closeButton = dialog.querySelector('button[aria-label="Close"]') as HTMLElement
    expect(closeButton).toBeTruthy()
    await user.click(closeButton)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on backdrop click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    // The backdrop is the full-screen button with tabIndex -1 outside the dialog
    const backdrop = screen.getByRole('dialog').parentElement!.querySelector(
      'button[tabindex="-1"]',
    ) as HTMLElement
    expect(backdrop).toBeTruthy()
    await user.click(backdrop)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('moves focus into the drawer on open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })

  it('traps focus inside the drawer — Tab wraps at the end', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    const dialog = screen.getByRole('dialog')

    // Tab through all focusable elements multiple times
    for (let i = 0; i < 10; i++) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })

  it('locks body scrolling while open and restores it on close', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'))
  })

  it('returns focus to the opener on close', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    const opener = screen.getByRole('button', { name: 'Open drawer' })
    await user.click(opener)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('renders the drawer content', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('uses the title as the dialog aria-label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DrawerHarness title="Advanced Filters" />)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    expect(screen.getByRole('dialog', { name: 'Advanced Filters' })).toBeInTheDocument()
  })
})
