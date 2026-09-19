import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationsList } from '@/screens/notifications/NotificationsList'
import { repository, type NotificationRow } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** F-181 `/notifications` (BLK-004) — the feed used to render ten
 *  `Notification` literals with baked-in relative timestamps; it now reads and
 *  writes the same `notifications` collection `NotificationCenter` does, so
 *  these cases mirror `notification-center.test.tsx` against the other
 *  screen's presentation (a stacked card list rather than a table).
 *
 *  There is no create action on the screen — a notification is filed by the
 *  system, not typed in by a user — so each case seeds the fixture through
 *  `repository.notifications.create(...)`, the same generic write path a real
 *  deployment's system principal uses. The fixture is session-scoped and
 *  mutating across tests in this file, so each case works on uniquely-named
 *  records of its own rather than asserting an absolute row count. */
async function seed(patch: Partial<NotificationRow>): Promise<void> {
  await repository.notifications.create({
    category: 'system',
    severity: 'info',
    read: false,
    readAt: null,
    link: null,
    ...patch,
  })
}

/** The feed row a title sits in. The desktop feed is a `ul`/`li` list rather
 *  than a table, so there is no `tr` to reach for. */
function cardOf(title: string): HTMLElement {
  const node = screen.getByText(title).closest('li')
  if (!node) throw new Error(`no feed row around "${title}"`)
  return node as HTMLElement
}

describe('NotificationsList (fixture build)', () => {
  it('lists a seeded notification and marks it as read', async () => {
    await seed({
      title: 'Invoice INV-2026-0207 overdue',
      message: "Nasser Al-Dosari's invoice is past its due date.",
      category: 'invoice',
      severity: 'critical',
    })
    const user = userEvent.setup()
    renderWithProviders(<NotificationsList />, { role: 'advisor' })

    await screen.findByText('Invoice INV-2026-0207 overdue')
    expect(screen.getByText("Nasser Al-Dosari's invoice is past its due date.")).toBeInTheDocument()

    const card = cardOf('Invoice INV-2026-0207 overdue')
    await user.click(within(card).getByRole('button', { name: /Mark as Read/ }))

    // The lifecycle move is real: once the row is read there is nothing to mark.
    await waitFor(() => {
      expect(within(cardOf('Invoice INV-2026-0207 overdue')).queryByRole('button', { name: /Mark as Read/ })).toBeNull()
    })
  })

  it('dismisses a notification after confirming, and it leaves the feed', async () => {
    await seed({
      title: 'Wiper Blades (Pair) low on stock',
      message: '6 units on hand, below the reorder level of 20.',
      category: 'stock',
      severity: 'warning',
    })
    const user = userEvent.setup()
    renderWithProviders(<NotificationsList />, { role: 'advisor' })

    await screen.findByText('Wiper Blades (Pair) low on stock')
    const card = cardOf('Wiper Blades (Pair) low on stock')
    await user.click(within(card).getByRole('button', { name: /Dismiss/ }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Dismiss Notification/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /Dismiss/ }))

    await waitFor(() => {
      expect(screen.queryByText('Wiper Blades (Pair) low on stock')).toBeNull()
    })
  })

  it('marks every unread notification read in one bulk action', async () => {
    await seed({ title: 'Job T9Y8U7I6 ready for QC', message: 'Toyota Land Cruiser 2021 is ready for quality control.', category: 'job' })
    await seed({ title: 'Appointment awaiting confirmation (Bay 2)', message: 'Sara Al-Qahtani — Hyundai Sonata 2020, 9:00 AM, Bay 2.', category: 'appointment' })
    const user = userEvent.setup()
    renderWithProviders(<NotificationsList />, { role: 'advisor' })

    await screen.findByText('Job T9Y8U7I6 ready for QC')
    expect(within(cardOf('Job T9Y8U7I6 ready for QC')).getByRole('button', { name: /Mark as Read/ })).toBeInTheDocument()
    expect(
      within(cardOf('Appointment awaiting confirmation (Bay 2)')).getByRole('button', { name: /Mark as Read/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Mark all read/ }))

    await waitFor(() => {
      expect(within(cardOf('Job T9Y8U7I6 ready for QC')).queryByRole('button', { name: /Mark as Read/ })).toBeNull()
      expect(
        within(cardOf('Appointment awaiting confirmation (Bay 2)')).queryByRole('button', { name: /Mark as Read/ }),
      ).toBeNull()
    })
  })

  it('hides every write action from a role with no dashboard write grant', async () => {
    await seed({ title: 'Visible but not actionable on the feed', message: 'A supplier can view this feed but not touch it.' })
    renderWithProviders(<NotificationsList />, { role: 'supplier' })

    await screen.findByText('Visible but not actionable on the feed')
    expect(screen.queryByRole('button', { name: /Mark as Read/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Dismiss/ })).toBeNull()
    expect(screen.getByRole('button', { name: /Mark all read/ })).toBeDisabled()
  })
})
