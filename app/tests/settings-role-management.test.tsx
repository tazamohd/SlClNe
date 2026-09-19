import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `RoleManagement` (settings/RoleManagement.tsx).
 *
 *  Previously six hand-picked rows with invented `userCount`/`permissionCount`
 *  figures (48, 38, 22…), one of them ("Viewer") not among the 15 roles the
 *  RBAC matrix actually defines. The point of this file: every row is a real
 *  role, `permissionCount` is counted from the real `PERMS` matrix, and
 *  `userCount` comes from `listStaff()` on a live build rather than a demo
 *  build pretending to have an account table behind it.
 */
const listStaff = vi.hoisted(() => vi.fn())

vi.mock('@/data/repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/repository')>()),
  isLive: true,
}))

vi.mock('@/screens/admin/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/screens/admin/api')>()),
  listStaff,
}))

const { RoleManagement } = await import('@/screens/settings/RoleManagement')

describe('RoleManagement — live', () => {
  it('lists every real role with a permission count from the matrix, not an invented one', async () => {
    listStaff.mockResolvedValue([])
    renderScreen(RoleManagement, { role: 'owner' })

    await waitFor(() => expect(listStaff).toHaveBeenCalled())
    // 15 real roles, and not the old fixture's invented sixth role.
    expect(await screen.findByText('Owner / CEO')).toBeInTheDocument()
    expect(screen.getByText('Branch Manager')).toBeInTheDocument()
    expect(screen.queryByText('Viewer')).toBeNull()
  })

  it('counts staff per role from the real list, not a hardcoded number', async () => {
    listStaff.mockResolvedValue([
      { id: '1', email: 'a@x.com', name: 'A', role: 'technician', baseRole: 'technician', orgId: 'o', branchId: null, status: 'active' },
      { id: '2', email: 'b@x.com', name: 'B', role: 'technician', baseRole: 'technician', orgId: 'o', branchId: null, status: 'active' },
      { id: '3', email: 'c@x.com', name: 'C', role: 'owner', baseRole: 'owner', orgId: 'o', branchId: null, status: 'active' },
    ])
    renderScreen(RoleManagement, { role: 'owner' })

    await waitFor(() => expect(listStaff).toHaveBeenCalled())
    const technicianRow = (await screen.findByText('Technician')).closest('tr')
    expect(technicianRow).not.toBeNull()
    // Not the old fixture's hardcoded "8".
    expect(technicianRow!.textContent).toContain('2')
    expect(technicianRow!.textContent).not.toContain('8')
  })
})
