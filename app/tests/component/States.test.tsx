import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EmptyState,
  ErrorState,
  Loading,
  PermissionDenied,
  ReadOnlyNotice,
  Skeleton,
} from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { renderWithProviders } from '../helpers/render'

/** The five states every screen owes the user. Each is checked for the property
 *  that makes it useful rather than decorative: a busy state that announces
 *  itself, an empty state that says what to do, an error with a way out, a
 *  refusal that explains itself, and a read-only banner that arrives before the
 *  user has filled the form. */

describe('Loading', () => {
  it('announces itself politely instead of only animating', () => {
    renderWithProviders(<Loading />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Loading...')
  })

  it('takes the caller’s label, in Arabic too', () => {
    renderWithProviders(<Loading label="Loading..." />, { language: 'ar' })
    expect(screen.getByRole('status').textContent?.trim().length).toBeGreaterThan(0)
    expect(screen.getByRole('status')).not.toHaveTextContent('Loading...')
  })

  it('has an inline form for a toolbar, with the same announcement', () => {
    renderWithProviders(<Loading inline label="Saving…" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saving…')
  })

  it('respects reduced motion in both forms', () => {
    // A user who asked the OS for less motion must not be given a pulsing bar.
    const { container, unmount } = renderWithProviders(<Loading />)
    expect(container.querySelector('.motion-reduce\\:animate-none')).toBeInTheDocument()
    unmount()

    const inline = renderWithProviders(<Loading inline />)
    expect(inline.container.querySelector('.motion-reduce\\:animate-none')).toBeInTheDocument()
  })

  it('keeps skeletons out of the accessibility tree', () => {
    // A screen reader should hear "loading", not a list of empty blocks.
    const { container } = renderWithProviders(<Skeleton className="w-1/2" />)
    const block = container.firstElementChild as HTMLElement
    expect(block).toHaveAttribute('aria-hidden')
    expect(block.className).toContain('w-1/2')
  })
})

describe('EmptyState', () => {
  it('says what is missing and what to do about it', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <EmptyState
        icon="Inbox"
        title="No job cards yet"
        description="Open one from a booked appointment."
        action={<Button onClick={onClick}>New Job Card</Button>}
      />
    )
    expect(screen.getByText('No job cards yet')).toBeInTheDocument()
    expect(screen.getByText('Open one from a booked appointment.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New Job Card' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('falls back to honest generic copy, never to invented rows', () => {
    renderWithProviders(<EmptyState />)
    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Nothing matches the current filters.')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('is an alert with a retry that actually retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderWithProviders(<ErrorState onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText("Couldn't load this")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Retry/ }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('reassures that nothing was lost, and takes a second way out', () => {
    renderWithProviders(
      <ErrorState
        onRetry={() => {}}
        retryLabel="Try again"
        secondaryAction={<Button variant="subtle">Service status</Button>}
      />
    )
    expect(screen.getByText(/Your data is safe/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Service status' })).toBeInTheDocument()
  })
})

describe('PermissionDenied', () => {
  it('explains the refusal without implying the check happened here', () => {
    renderWithProviders(<PermissionDenied />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Permission Denied')).toBeInTheDocument()
    expect(screen.getByText("You don't have permission to access this page.")).toBeInTheDocument()
  })

  it('can point the user at whoever can grant it', () => {
    renderWithProviders(
      <PermissionDenied
        title="Accounting is closed to your role"
        description="Ask a branch manager if you need the ledger."
        action={<Button variant="subtle">Back to Dashboard</Button>}
      />
    )
    expect(screen.getByText('Accounting is closed to your role')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to Dashboard' })).toBeInTheDocument()
  })
})

describe('ReadOnlyNotice', () => {
  it('says the record can be read but not changed', () => {
    renderWithProviders(<ReadOnlyNotice />)
    expect(
      screen.getByText('Read-only — your role can view this record but not change it.')
    ).toBeInTheDocument()
  })

  it('takes screen-specific wording', () => {
    renderWithProviders(<ReadOnlyNotice message="Posted journals cannot be edited." />)
    expect(screen.getByText('Posted journals cannot be edited.')).toBeInTheDocument()
  })
})
