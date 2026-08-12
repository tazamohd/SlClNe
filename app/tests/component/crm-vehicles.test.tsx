import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../helpers/render'

/** Vehicle CRUD. The interesting half is the owner picker, which has to resolve
 *  one choice into the two columns a vehicle stores, and the VIN, whose rule
 *  lives in `packages/contract` and is enforced here without being restated. */

const h = vi.hoisted(() => ({
  state: {
    customers: [] as Record<string, unknown>[],
    vehicles: [] as Record<string, unknown>[],
    created: [] as Record<string, unknown>[],
    updated: [] as { id: string; patch: Record<string, unknown> }[],
    deleted: [] as string[],
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

const { Vehicles } = await import('@/screens/registry/Registries')

beforeEach(() => {
  h.state.customers = [
    { _id: '01HQ8ZK3M4N5P6R7S8T9V0WXYZ', _version: 1, name: 'Ahmed Al-Rashid', phone: '+966 55 210 4471', vehicles: 2, spent: 'SAR 12,840', last: '2 weeks ago' },
  ]
  h.state.vehicles = [
    {
      _id: '01HQ8ZK3M4N5P6R7S8T9V0WXY1',
      _version: 1,
      plate: 'RUH 4821',
      make: 'Toyota Camry 2022',
      owner: 'Ahmed Al-Rashid',
      mileage: '42,180 km',
      mileageKm: 42180,
      last: '2 weeks ago',
      status: 'active',
      customerId: '01HQ8ZK3M4N5P6R7S8T9V0WXYZ',
      vin: null,
    },
  ]
  h.state.created = []
  h.state.updated = []
  h.state.deleted = []
})

async function openAddVehicle(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /Add New Vehicle/ }))
  return screen.getByRole('dialog')
}

describe('Add Vehicle', () => {
  it('opens the modal — the second of the two dead registry CTAs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })
    const dialog = await openAddVehicle(user)

    expect(within(dialog).getByLabelText(/Plate/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Make & Model/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Owner/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/VIN/)).toBeInTheDocument()
  })

  it('resolves the owner into both the id and the denormalised name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })
    const dialog = await openAddVehicle(user)

    await user.type(within(dialog).getByLabelText(/Plate/), 'JED 9012')
    await user.type(within(dialog).getByLabelText(/Make & Model/), 'Nissan Patrol 2021')
    await user.selectOptions(within(dialog).getByLabelText(/Owner/), '01HQ8ZK3M4N5P6R7S8T9V0WXYZ')
    await user.type(within(dialog).getByLabelText(/Mileage/), '68,540')
    await user.click(within(dialog).getByRole('button', { name: /^Add Vehicle$/ }))

    await waitFor(() => expect(h.state.created).toHaveLength(1))
    expect(h.state.created[0]).toEqual({
      plate: 'JED 9012',
      makeModel: 'Nissan Patrol 2021',
      mileageKm: 68540,
      status: 'active',
      ownerName: 'Ahmed Al-Rashid',
      customerId: '01HQ8ZK3M4N5P6R7S8T9V0WXYZ',
    })
  })

  it('rejects a VIN the contract refuses, on the VIN field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })
    const dialog = await openAddVehicle(user)

    await user.type(within(dialog).getByLabelText(/Plate/), 'DMM 3357')
    await user.type(within(dialog).getByLabelText(/Make & Model/), 'Hyundai Sonata 2023')
    // 17 characters, but `I` and `O` are not valid VIN letters.
    await user.type(within(dialog).getByLabelText(/VIN/), 'IO1BF1FK5CX123456')
    await user.click(within(dialog).getByRole('button', { name: /^Add Vehicle$/ }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/VIN/)).toHaveAttribute('aria-invalid', 'true')
    )
    expect(h.state.created).toHaveLength(0)
  })

  it('refuses a mileage that is not a whole number of kilometres', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })
    const dialog = await openAddVehicle(user)

    await user.type(within(dialog).getByLabelText(/Plate/), 'MEC 2290')
    await user.type(within(dialog).getByLabelText(/Make & Model/), 'Ford Explorer 2022')
    await user.type(within(dialog).getByLabelText(/Mileage/), '35.7k')
    await user.click(within(dialog).getByRole('button', { name: /^Add Vehicle$/ }))

    await waitFor(() =>
      expect(within(dialog).getByLabelText(/Mileage/)).toHaveAttribute('aria-invalid', 'true')
    )
    expect(h.state.created).toHaveLength(0)
  })
})

describe('Edit and delete', () => {
  it('opens on the record, including the columns the list does not show', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /Edit RUH 4821/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText(/Plate/)).toHaveValue('RUH 4821')
    expect(within(dialog).getByLabelText(/Mileage/)).toHaveValue('42180')
    expect(within(dialog).getByLabelText(/Owner/)).toHaveValue('01HQ8ZK3M4N5P6R7S8T9V0WXYZ')

    await user.selectOptions(within(dialog).getByLabelText(/Status/), 'service')
    await user.click(within(dialog).getByRole('button', { name: /Save Changes/ }))

    await waitFor(() => expect(h.state.updated).toHaveLength(1))
    expect(h.state.updated[0]).toMatchObject({ id: '01HQ8ZK3M4N5P6R7S8T9V0WXY1', patch: { status: 'service' } })
  })

  it('names the plate in the confirmation and says the job cards survive', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Vehicles />, { role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /Delete RUH 4821/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('RUH 4821')).toBeInTheDocument()
    expect(dialog).toHaveTextContent("Job cards keep this vehicle's history")

    await user.click(within(dialog).getByRole('button', { name: /^Delete$/ }))
    await waitFor(() => expect(h.state.deleted).toEqual(['01HQ8ZK3M4N5P6R7S8T9V0WXY1']))
  })
})

describe('RBAC', () => {
  it('gives QC a read-only vehicle registry', async () => {
    renderWithProviders(<Vehicles />, { role: 'qc' })
    await screen.findByText('Toyota Camry 2022')

    expect(screen.queryByRole('button', { name: /Add New Vehicle/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit RUH 4821/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete RUH 4821/ })).not.toBeInTheDocument()
  })
})
