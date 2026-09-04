import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'
import { CustomerAppGarage, CustomerAppHome } from '@/screens/customer-app/CustomerApp'
import { JOBS, VEHICLES } from '@/data/generated/tables'
import { renderWithProviders } from '../helpers/render'

/** The customer app's home and garage against the fixture repository. The
 *  greeting must never wait on a fetch, the hero must be the job collection's
 *  answer, and "Add Vehicle" must open a real form rather than reload the
 *  garage — the three things the redesign changed. */

const ACTIVE = JOBS.find((job) => job.st === 'in_progress')!

function mountInShell(route: string, element: JSX.Element) {
  return renderWithProviders(
    <CustomerAppShell>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </CustomerAppShell>,
    { route, role: 'customer' }
  )
}

describe('CustomerAppHome', () => {
  it('shows the greeting before the collections land, then the live hero', async () => {
    renderWithProviders(<CustomerAppHome />, { route: '/customer-app/home', role: 'customer' })
    // Synchronous: the greeting renders on the first pass, with the skeleton under it.
    expect(screen.getByText('Welcome back,')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()

    // The hero is the in-progress job, not the first vehicle.
    expect((await screen.findAllByText(ACTIVE.veh)).length).toBeGreaterThan(0)
    expect(screen.getByText('Active Service')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Track/ })).toBeInTheDocument()
    // No sent estimate for that vehicle in the fixtures: no approval CTA.
    expect(screen.queryByRole('button', { name: /Approve estimate/ })).toBeNull()
    // Six stage dots, one of them current.
    const rail = screen.getByRole('list', { name: 'Stage' })
    expect(within(rail).getAllByRole('listitem')).toHaveLength(6)
    expect(rail.querySelector('[aria-current="step"]')).not.toBeNull()
  })

  it('keeps the four quick actions and the vehicle list', async () => {
    renderWithProviders(<CustomerAppHome />, { route: '/customer-app/home', role: 'customer' })
    expect(await screen.findByRole('button', { name: 'Book' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wallet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insure' })).toBeInTheDocument()
    expect(screen.getByText('My Vehicles')).toBeInTheDocument()
    expect(screen.getAllByText(VEHICLES[0].make).length).toBeGreaterThan(0)
  })
})

describe('CustomerAppShell', () => {
  it('keeps the five tabs and badges Tracking while a job is in progress', async () => {
    mountInShell('/customer-app/home', <CustomerAppHome />)
    const nav = screen.getByRole('navigation', { name: 'App navigation' })
    const tabs = within(nav).getAllByRole('link')
    expect(tabs.map((tab) => tab.getAttribute('href'))).toEqual([
      '/customer-app/home',
      '/customer-app/garage',
      '/customer-app/appointments',
      '/customer-app/service-tracking',
      '/customer-app/profile',
    ])
    const inProgress = JOBS.filter((job) => job.st === 'in_progress').length
    const tracking = tabs[3]
    expect((await within(tracking).findAllByText(String(inProgress))).length).toBeGreaterThan(0)
    expect(document.querySelector('aside')).toBeNull()
  })
})

describe('CustomerAppGarage', () => {
  it('opens a bottom-sheet form from "Add Vehicle" and adds the vehicle', async () => {
    const user = userEvent.setup()
    mountInShell('/customer-app/garage', <CustomerAppGarage />)
    expect(await screen.findByText(VEHICLES[0].make)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Add Vehicle/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Add Vehicle' })
    const plate = within(dialog).getByLabelText('License Plate')
    expect(plate).toHaveAttribute('dir', 'ltr')
    expect(plate).toHaveAttribute('autocapitalize', 'characters')

    // An empty submit is refused on the field, not silently.
    await user.click(within(dialog).getByRole('button', { name: 'Save Vehicle' }))
    expect(await within(dialog).findByText('Enter the make and model.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Make & Model'), 'Kia Sportage 2024')
    await user.type(plate, 'kia 9001')
    await user.click(within(dialog).getByRole('button', { name: 'Save Vehicle' }))

    expect(await screen.findByText('Kia Sportage 2024')).toBeInTheDocument()
    expect(screen.getByText('KIA 9001')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
