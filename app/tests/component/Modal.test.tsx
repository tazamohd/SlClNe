import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, useModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

/** Dialog behaviour the Definition of Done requires: wired, focus-trapped,
 *  Escape-closable, restoring focus. */

function Dialog({
  dismissible,
  onClose = () => {},
}: {
  dismissible?: boolean
  onClose?: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        open={open}
        dismissible={dismissible}
        onClose={() => {
          onClose()
          setOpen(false)
        }}
        title="Edit Customer"
        description="Change the contact details."
        footer={
          <>
            <Button variant="subtle" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <input aria-label="Name" defaultValue="Ahmed" />
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('renders nothing until it is opened', () => {
    renderWithProviders(<Dialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is a labelled, described modal dialog', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dialog />)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    const dialog = screen.getByRole('dialog', { name: 'Edit Customer' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Change the contact details.')
  })

  it('moves focus into the dialog and returns it to the opener on close', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dialog />)
    const opener = screen.getByRole('button', { name: 'Open' })

    await user.click(opener)
    await waitFor(() => expect(screen.getByRole('dialog')).toContainElement(document.activeElement))

    await user.keyboard('{Escape}')
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('cycles Tab inside the dialog instead of escaping to the page behind', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dialog />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')

    for (let step = 0; step < 8; step += 1) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
    for (let step = 0; step < 8; step += 1) {
      await user.tab({ shift: true })
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('closes on Escape, on the close button and on a backdrop press', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Dialog onClose={onClose} />)
    const open = () => user.click(screen.getByRole('button', { name: 'Open' }))

    await open()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await open()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await open()
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement
    await user.click(backdrop)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close when the press starts inside and ends on the backdrop', async () => {
    // Selecting text in the dialog and releasing outside it must not discard
    // the form — the reason the handler is on mousedown of the backdrop itself.
    const user = userEvent.setup()
    renderWithProviders(<Dialog />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')

    await user.pointer([
      { keys: '[MouseLeft>]', target: screen.getByLabelText('Name') },
      { keys: '[/MouseLeft]', target: dialog.parentElement as HTMLElement },
    ])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('refuses every dismissal when the answer is mandatory', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Dialog dismissible={false} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('dialog').parentElement as HTMLElement)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks the page behind it and hands scrolling back on close', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dialog />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'))
  })

  it('fills a phone screen rather than floating in the middle of it', async () => {
    const user = userEvent.setup()
    setViewportWidth(390)
    renderWithProviders(<Dialog />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    // Panel dialogs hold forms and lists, so on a phone they take the screen.
    expect(screen.getByRole('dialog').className).toContain('h-full')
  })
})

function ConfirmHarness() {
  const { confirm } = useModal()
  const [answer, setAnswer] = useState<string>('none')
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({
            title: 'Delete this invoice?',
            description: 'This cannot be undone.',
            confirmLabel: 'Delete',
            destructive: true,
          })
          setAnswer(ok ? 'confirmed' : 'cancelled')
        }}
      >
        Delete
      </button>
      <output data-testid="answer">{answer}</output>
    </>
  )
}

describe('confirmation dialogs', () => {
  it('resolves true when the user confirms', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ConfirmHarness />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('dialog', { name: 'Delete this invoice?' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[1])
    await waitFor(() => expect(screen.getByTestId('answer')).toHaveTextContent('confirmed'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('resolves false on cancel, and on Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ConfirmHarness />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.getByTestId('answer')).toHaveTextContent('cancelled'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByTestId('answer')).toHaveTextContent('cancelled'))
  })

  it('gives a destructive confirmation orange, never red', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ConfirmHarness />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('dialog')

    const confirmButton = screen.getAllByRole('button', { name: 'Delete' })[1]
    expect(confirmButton.className).toContain('bg-salis-orange')
  })
})
