import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenter } from '@/screens/admin/NotificationCenter'
import { repository, type NotificationRow } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** Notifications (BLK-004) — the screen no longer renders an honest GAP
 *  state; it reads and writes `notifications`
 *  (`GET/POST/PATCH/DELETE /notifications`), a plain generic collection with
 *  no bespoke router behind it. Mark-as-read (single and bulk) and dismiss
 *  are all a field write the fixture repository genuinely performs, so this
 *  suite proves real behaviour rather than a documented refusal.
 *
 *  Unlike `equipmentWarranties`, there is no create action on the real
 *  screen — a notification is filed by the system, not typed in by a user
 *  (`dashboard` grants `c` only to `test`; see `server/src/writers.ts`) — so
 *  each case here seeds the fixture directly through
 *  `repository.notifications.create(...)`, the same generic write path a
 *  real deployment's system principal uses, before exercising the screen.
 *
 *  The fixture is session-scoped and mutating across tests in this file
 *  (`tests/unit/repository-fixture.test.ts`'s own discipline), so each case
 *  below works on uniquely-named records of its own rather than asserting an
 *  absolute row count. */
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

describe('NotificationCenter (fixture build)', () => {
  it('lists an unread notification and marks it as read', async () => {
    await seed({
      title: 'Invoice INV-2026-0141 overdue',
      message: "Fatima Al-Zahrani's invoice for SAR 4,250 is overdue.",
      category: 'invoice',
      severity: 'critical',
    })
    const user = userEvent.setup()
    renderWithProviders(<NotificationCenter />, { role: 'advisor' })

    const title = await screen.findByText('Invoice INV-2026-0141 overdue')
    const row = title.closest('tr')
    if (!row) throw new Error('expected a table row for the invoice notification')
    expect(within(row).getByText('Unread')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /Mark as Read/ }))

    await waitFor(() => {
      const refreshedRow = screen.getByText('Invoice INV-2026-0141 overdue').closest('tr')
      if (!refreshedRow) throw new Error('row disappeared after marking read')
      expect(within(refreshedRow).getByText('Read')).toBeInTheDocument()
    })
    // The lifecycle move is real: the Mark as Read action is gone once read.
    const readRow = screen.getByText('Invoice INV-2026-0141 overdue').closest('tr')
    if (!readRow) throw new Error('expected a table row after marking read')
    expect(within(readRow).queryByRole('button', { name: /Mark as Read/ })).toBeNull()
  })

  it('dismisses a notification after confirming, and it leaves the list', async () => {
    await seed({
      title: 'Brake Pads (Front) low on stock',
      message: '18 units on hand, below the reorder level of 25 (SKU BP-FR-220).',
      category: 'stock',
      severity: 'warning',
    })
    const user = userEvent.setup()
    renderWithProviders(<NotificationCenter />, { role: 'advisor' })

    const title = await screen.findByText('Brake Pads (Front) low on stock')
    const row = title.closest('tr')
    if (!row) throw new Error('expected a table row for the stock notification')

    await user.click(within(row).getByRole('button', { name: /Dismiss/ }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Dismiss Notification/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /Dismiss/ }))

    await waitFor(() => {
      expect(screen.queryByText('Brake Pads (Front) low on stock')).toBeNull()
    })
  })

  it('marks every unread notification read in one bulk action', async () => {
    await seed({ title: 'Job Q1W2E3R4 in progress', message: "Ahmed Al-Rashid's Toyota Camry 2022 is in progress." })
    await seed({ title: 'Appointment awaiting confirmation (Bay 5)', message: 'Nasser Al-Dosari — Nissan Patrol 2019, 2:30 PM, Bay 5 — is still awaiting confirmation.' })
    const user = userEvent.setup()
    renderWithProviders(<NotificationCenter />, { role: 'advisor' })

    const jobRow = (await screen.findByText('Job Q1W2E3R4 in progress')).closest('tr')
    const apptRow = screen.getByText('Appointment awaiting confirmation (Bay 5)').closest('tr')
    if (!jobRow || !apptRow) throw new Error('expected rows for the two seeded notifications')
    expect(within(jobRow).getByText('Unread')).toBeInTheDocument()
    expect(within(apptRow).getByText('Unread')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: /Mark all as read/ }))

    await waitFor(() => {
      const refreshedJobRow = screen.getByText('Job Q1W2E3R4 in progress').closest('tr')
      const refreshedApptRow = screen.getByText('Appointment awaiting confirmation (Bay 5)').closest('tr')
      if (!refreshedJobRow || !refreshedApptRow) throw new Error('rows disappeared after bulk mark-read')
      expect(within(refreshedJobRow).getByText('Read')).toBeInTheDocument()
      expect(within(refreshedApptRow).getByText('Read')).toBeInTheDocument()
    })
  })

  it('hides Mark as Read, Dismiss and Mark all as read from a role with no dashboard write grant', async () => {
    await seed({ title: 'Visible but not actionable', message: 'A supplier can view this feed but not touch it.' })
    renderWithProviders(<NotificationCenter />, { role: 'supplier' })
    expect(await screen.findByRole('heading', { name: 'Notification Center' })).toBeInTheDocument()
    await screen.findByText('Visible but not actionable')
    expect(screen.queryByRole('button', { name: /Mark as Read/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Dismiss/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Mark all as read/ })).toBeNull()
  })
})
