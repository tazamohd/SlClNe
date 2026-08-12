import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

/** Customer CRUD, end to end through the same hooks the screen uses.
 *
 *  The fixture repository refuses writes by design, so a test that exercised a
 *  save against it would only ever prove that it refuses. This substitutes a
 *  repository that behaves like the API — including its rejections — and drives
 *  the real screen, the real modal, the real form and the real contract schema
 *  through it. */

const h = vi.hoisted(() => ({
  state: {
    customers: [] as Record<string, unknown>[],
    vehicles: [] as Record<string, unknown>[],
    jobs: [] as Record<string, unknown>[],
    invoices: [] as Record<string, unknown>[],
    estimates: [] as Record<string, unknown>[],
    created: [] as unknown[],
    updated: [] as { id: string; patch: unknown }[],
    deleted: [] as string[],
    rejectCreate: null as unknown,
  },
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  const { state } = h
  const rowsOf = (key: string) =>
    (state as unknown as Record<string, Record<string, unknown>[]>)[key] ?? []

  const collection = (key: string) => ({
    async list() {
      const rows = rowsOf(key)
      return { rows, page: { page: 1, pageSize: rows.length || 1, total: rows.length, totalPages: 1 } }
    },
    async get(id: string) {
      const row = rowsOf(key).find((r) => r._id === id)
      if (!row) throw new actual.RepositoryError('not_found', 'No record.')
      return row
    },
    async create(input: Record<string, unknown>) {
      if (state.rejectCreate) throw state.rejectCreate
      state.created.push(input)
      const row = { ...input, _id: `NEW${state.created.length}`, _version: 1 }
      rowsOf(key).push(row)
      return row
    },
    async update(id: string, patch: Record<string, unknown>) {
      state.updated.push({ id, patch })
      const row = rowsOf(key).find((r) => r._id === id)
      Object.assign(row ?? {}, patch)
      return row
    },
    async delete(id: string) {
      state.deleted.push(id)
      const rows = rowsOf(key)
      const at = rows.findIndex((r) => r._id === id)
      if (at >= 0) rows.splice(at, 1)
    },
    async bulkCreate() {
      return []
    },
    async bulkUpdate() {
      return []
    },
    async bulkDelete() {},
  })

  return {
    ...actual,
    isLive: true,
    repository: new Proxy({}, { get: (_target, key: string) => collection(key) }),
  }
})

const { Customers } = await import('@/screens/registry/Registries')
const { RepositoryError } = await import('@/data/repository')

const AHMED = {
  _id: 'C1',
  _version: 1,
  name: 'Ahmed Al-Rashid',
  phone: '+966 55 210 4471',
  email: 'ahmed@email.com',
  vehicles: 2,
  spent: 'SAR 12,840',
  last: '2 weeks ago',
}

beforeEach(() => {
  h.state.customers = [{ ...AHMED }]
  h.state.vehicles = []
  h.state.created = []
  h.state.updated = []
  h.state.deleted = []
  h.state.rejectCreate = null
})

async function openAddCustomer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /Add Customer/ }))
  return screen.getByRole('dialog')
}

describe('Add Customer', () => {
  it('opens the CRUD modal — the CTA is no longer inert', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const dialog = await openAddCustomer(user)

    // The three fields the design's "Add New Customer" panel carries.
    expect(within(dialog).getByLabelText(/Full Name/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Phone/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Email/)).toBeInTheDocument()
  })

  it('refuses an empty submit and marks the fields that caused it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })
    const dialog = await openAddCustomer(user)

    await user.click(within(dialog).getByRole('button', { name: /^Add Customer$/ }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/Full Name/)).toHaveAttribute('aria-invalid', 'true')
    )
    expect(within(dialog).getByLabelText(/Phone/)).toHaveAttribute('aria-invalid', 'true')
    expect(h.state.created).toHaveLength(0)
  })

  it('enforces the contract schema rather than a second copy of it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })
    const dialog = await openAddCustomer(user)

    await user.type(within(dialog).getByLabelText(/Full Name/), 'Noura Al-Qahtani')
    // Not a phone number by `packages/contract`'s regex.
    await user.type(within(dialog).getByLabelText(/Phone/), 'call me')
    await user.click(within(dialog).getByRole('button', { name: /^Add Customer$/ }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/Phone/)).toHaveAttribute('aria-invalid', 'true')
    )
    expect(h.state.created).toHaveLength(0)
  })

  it('sends the parsed body, drops an empty optional, and confirms the save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })
    const dialog = await openAddCustomer(user)

    await user.type(within(dialog).getByLabelText(/Full Name/), '  Noura Al-Qahtani  ')
    await user.type(within(dialog).getByLabelText(/Phone/), '+966 50 887 2201')
    await user.click(within(dialog).getByRole('button', { name: /^Add Customer$/ }))

    await waitFor(() => expect(h.state.created).toHaveLength(1))
    expect(h.state.created[0]).toEqual({
      name: 'Noura Al-Qahtani',
      phone: '+966 50 887 2201',
      type: 'individual',
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByRole('status')).toHaveTextContent('Noura Al-Qahtani')
  })

  it('puts a server rejection on the field the server blamed, not in a toast', async () => {
    const user = userEvent.setup()
    h.state.rejectCreate = new RepositoryError(
      'bad_request',
      'A customer with this phone already exists.',
      { field: 'phone', status: 400 }
    )
    renderWithProviders(<Customers />, { role: 'owner' })
    const dialog = await openAddCustomer(user)

    await user.type(within(dialog).getByLabelText(/Full Name/), 'Noura Al-Qahtani')
    await user.type(within(dialog).getByLabelText(/Phone/), '+966 55 210 4471')
    await user.click(within(dialog).getByRole('button', { name: /^Add Customer$/ }))

    const phone = within(dialog).getByLabelText(/Phone/)
    await waitFor(() => expect(phone).toHaveAttribute('aria-invalid', 'true'))
    const messageId = phone.getAttribute('aria-describedby') as string
    expect(document.getElementById(messageId)).toHaveTextContent(
      'A customer with this phone already exists.'
    )
    // Still open, with the user's typing intact, so the rejection is fixable.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Edit Customer', () => {
  it('opens on the record and patches it by its id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /Edit Ahmed Al-Rashid/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText(/Full Name/)).toHaveValue('Ahmed Al-Rashid')
    expect(within(dialog).getByLabelText(/Email/)).toHaveValue('ahmed@email.com')

    await user.clear(within(dialog).getByLabelText(/Full Name/))
    await user.type(within(dialog).getByLabelText(/Full Name/), 'Ahmed Al-Rashid Jr')
    await user.click(within(dialog).getByRole('button', { name: /Save Changes/ }))

    await waitFor(() => expect(h.state.updated).toHaveLength(1))
    expect(h.state.updated[0].id).toBe('C1')
    expect(h.state.updated[0].patch).toMatchObject({ name: 'Ahmed Al-Rashid Jr' })
  })
})

describe('Delete Customer', () => {
  it('confirms first, names the record, and is honest about what stays', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /Delete Ahmed Al-Rashid/ }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(dialog).toHaveTextContent('kept in the audit trail')
    expect(dialog).toHaveTextContent('vehicles stay in the registry')
    expect(dialog).toHaveTextContent('Job cards and invoices keep their history')
    // Nothing has happened yet.
    expect(h.state.deleted).toHaveLength(0)

    await user.click(within(dialog).getByRole('button', { name: /^Delete$/ }))
    await waitFor(() => expect(h.state.deleted).toEqual(['C1']))
  })

  it('leaves the record alone when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /Delete Ahmed Al-Rashid/ }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Cancel/ }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(h.state.deleted).toHaveLength(0)
  })
})

describe('RBAC', () => {
  it('gives a technician no write controls and no contact details', async () => {
    renderWithProviders(<Customers />, { role: 'technician' })

    expect(await screen.findByText('Ahmed Al-Rashid')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add Customer/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit Ahmed/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete Ahmed/ })).not.toBeInTheDocument()
    // FIELD_RULES: "Customer contact details" is redacted, so the value is
    // absent rather than shown disabled.
    expect(screen.queryByText('+966 55 210 4471')).not.toBeInTheDocument()
  })

  it('lets an advisor create and edit but not delete', async () => {
    renderWithProviders(<Customers />, { role: 'advisor' })
    await screen.findByText('Ahmed Al-Rashid')

    expect(screen.getByRole('button', { name: /Add Customer/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit Ahmed Al-Rashid/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete Ahmed Al-Rashid/ })).not.toBeInTheDocument()
  })
})

describe('mobile', () => {
  it('keeps the row actions reachable in the designed card layout at 390', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Customers />, { role: 'owner' })
    await screen.findByText('Ahmed Al-Rashid')

    act(() => setViewportWidth(390))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Edit Ahmed Al-Rashid/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
