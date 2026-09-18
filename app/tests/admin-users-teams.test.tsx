import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** Users & Teams (`UsersTeams`) on a live build (Phase A).
 *
 *  The point of this file: the screen actually calls `listStaff`/`createStaff`
 *  rather than showing `FIXTURE_USERS`, and a direct-create shows the returned
 *  one-time password rather than silently discarding it — that password
 *  exists nowhere else, so a screen that dropped it would strand the account
 *  it just created. */

const listStaff = vi.hoisted(() => vi.fn())
const createStaff = vi.hoisted(() => vi.fn())

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
})

vi.mock('@/screens/admin/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/screens/admin/api')>()
  return { ...actual, listStaff, createStaff }
})

const { UsersTeams } = await import('@/screens/admin/UsersTeams')

function staffRow(over: Record<string, unknown> = {}) {
  return {
    id: '01STAFF001',
    email: 'owner@salisauto.sa',
    name: 'Khalid Al-Amri',
    role: 'owner',
    baseRole: 'owner',
    orgId: 'org1',
    branchId: 'branch1',
    status: 'active',
    ...over,
  }
}

describe('UsersTeams — live', () => {
  it('lists staff from the API rather than the fixture rows', async () => {
    listStaff.mockResolvedValue([
      staffRow(),
      staffRow({ id: '01STAFF002', email: 'parts@salisauto.sa', name: 'Storekeeper', role: 'parts', status: 'pending' }),
    ])
    renderScreen(UsersTeams, { role: 'owner' })

    await waitFor(() => expect(listStaff).toHaveBeenCalled())
    expect(await screen.findByText('Storekeeper')).toBeInTheDocument()
    expect(screen.getByText('parts@salisauto.sa')).toBeInTheDocument()
    // Not the fixture identities.
    expect(screen.queryByText('Yousef Al-Otaibi')).toBeNull()
  })

  it('creates a staff account directly and shows the one-time password', async () => {
    listStaff.mockResolvedValue([staffRow()])
    createStaff.mockResolvedValue({
      mode: 'direct',
      user: staffRow({ id: '01STAFF003', email: 'new@salisauto.sa', name: 'New Hire', role: 'technician' }),
      temporaryPassword: 'a-one-time-generated-password',
    })
    renderScreen(UsersTeams, { role: 'owner' })
    await waitFor(() => expect(listStaff).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: /Add Staff/ }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/Full Name/), { target: { value: 'New Hire' } })
    fireEvent.change(within(dialog).getByLabelText(/Email/), { target: { value: 'new@salisauto.sa' } })
    fireEvent.change(within(dialog).getByLabelText(/Role/), { target: { value: 'technician' } })

    fireEvent.click(within(dialog).getByRole('button', { name: /Add Staff/ }))

    await waitFor(() => expect(createStaff).toHaveBeenCalledWith({
      name: 'New Hire',
      email: 'new@salisauto.sa',
      role: 'technician',
      mode: 'direct',
    }))

    // The password is shown once, in the dialog itself, not just as a toast.
    expect(await within(dialog).findByText('a-one-time-generated-password')).toBeInTheDocument()

    // Closing reloads the list — the whole reason the modal calls `onCreated`.
    fireEvent.click(within(dialog).getByRole('button', { name: /Done/ }))
    await waitFor(() => expect(listStaff).toHaveBeenCalledTimes(2))
  })
})
