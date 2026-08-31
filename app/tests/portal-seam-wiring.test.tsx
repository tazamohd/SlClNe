import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'
import { APPOINTMENTS, INVOICES, VEHICLES } from '@/data/generated/tables'
import { ClientPortalVehicles } from '@/screens/portals/client/ClientPortalVehicles'
import { ClientPortalAppointments } from '@/screens/portals/client/ClientPortalAppointments'
import { ClientPortalInvoices } from '@/screens/portals/client/ClientPortalInvoices'
import { PortalVehicles } from '@/screens/portals/misc/PortalVehicles'
import { PortalAppointments } from '@/screens/portals/misc/PortalAppointments'
import { PortalInvoices } from '@/screens/portals/misc/PortalInvoices'
import { CustomerAppVehicles } from '@/screens/customer-app/CustomerAppVehicles'
import { VehiclesList } from '@/screens/workshop/VehiclesList'

/** The portal, customer-app and workshop lists moved off hardcoded arrays and
 *  onto the repository seam.
 *
 *  Two things are pinned for each screen, and the second matters more than the
 *  first: the rows on screen are the ones the repository returned, and the
 *  values the collection cannot supply are **gone**, not carried over from the
 *  array they used to come from. A screen that kept a plausible number after
 *  being "wired" would pass a render test and still be lying, so every case
 *  names the invented value and asserts its absence.
 *
 *  No API is configured here, so `repository` resolves to the design fixtures —
 *  the same seam a live build reads through, with the same row shapes. The
 *  fixtures carry no VIN, no colour, no advisor and no per-invoice vehicle, so
 *  those cells are the honest em dash on this build and fill themselves when
 *  the API serves the column.
 */

const VEHICLE = VEHICLES[0]
const APPOINTMENT = APPOINTMENTS[0]
const INVOICE = INVOICES[0]
const ACTIVE_VEHICLES = VEHICLES.filter((v) => v.status === 'active').length
const AWAITING = APPOINTMENTS.filter((a) => a.status === 'awaiting').length

beforeEach(() => {
  setViewportWidth(1280)
})

describe('ClientPortalVehicles reads vehicles', () => {
  it('renders the rows the collection returned', async () => {
    renderScreen(ClientPortalVehicles, { role: 'customer' })

    expect(await screen.findByText(VEHICLE.make)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.plate)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.mileage)).toBeInTheDocument()
  })

  it('GAP: drops the invented fleet and shows the em dash for colour and VIN', async () => {
    renderScreen(ClientPortalVehicles, { role: 'customer' })
    await screen.findByText(VEHICLE.make)

    // The hardcoded array's plates, VIN and colour are gone.
    expect(screen.queryByText('RJD 4821')).toBeNull()
    expect(screen.queryByText('1HGBH41JXMN109186')).toBeNull()
    expect(screen.queryByText('White')).toBeNull()
    // Colour is not a column of `vehicles` in any build; VIN is API-only.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })
})

describe('ClientPortalAppointments reads appointments', () => {
  it('renders the bookings the collection returned', async () => {
    renderScreen(ClientPortalAppointments, { role: 'customer' })

    expect(await screen.findByText(APPOINTMENT.veh)).toBeInTheDocument()
    expect(screen.getByText(APPOINTMENT.time)).toBeInTheDocument()
    expect(screen.getAllByText(APPOINTMENT.tech).length).toBeGreaterThan(0)
  })

  it('counts the collection status vocabulary, not the design four-state set', async () => {
    renderScreen(ClientPortalAppointments, { role: 'customer' })
    await screen.findByText(APPOINTMENT.veh)

    // `awaiting` is what the API returns; "Pending" is not a booking status.
    expect(screen.getAllByText('Awaiting').length).toBeGreaterThan(0)
    expect(screen.getAllByText(String(AWAITING)).length).toBeGreaterThan(0)
  })

  it('GAP: drops the invented refs, advisors and tallies', async () => {
    renderScreen(ClientPortalAppointments, { role: 'customer' })
    await screen.findByText(APPOINTMENT.veh)

    expect(screen.queryByText('APT-1001')).toBeNull()
    expect(screen.queryByText('Khalid Al-Rashid')).toBeNull()
    expect(screen.queryByText('Brake Inspection')).toBeNull()
    // No appointment aggregate endpoint exists, and the screen says so.
    expect(screen.getByText('GET /appointments/summary')).toBeInTheDocument()
  })
})

describe('ClientPortalInvoices reads invoices', () => {
  it('renders the invoices the collection returned, at the server amount', async () => {
    renderScreen(ClientPortalInvoices, { role: 'customer' })

    expect(await screen.findByText(INVOICE.id)).toBeInTheDocument()
    expect(screen.getAllByText(/SAR 1,840\.00/).length).toBeGreaterThan(0)
    expect(screen.getByText(INVOICE.due)).toBeInTheDocument()
  })

  it('GAP: never sums a page into a period total, and names the endpoint that would', async () => {
    renderScreen(ClientPortalInvoices, { role: 'customer' })
    await screen.findByText(INVOICE.id)

    expect(screen.queryByText('INV-4821')).toBeNull()
    expect(screen.queryByText('Brake Pad Replacement')).toBeNull()
    // "Amount Due" and "Total Paid" were browser sums of a hardcoded array.
    expect(screen.getByText('Amount Due')).toBeInTheDocument()
    expect(screen.getByText('Total Paid')).toBeInTheDocument()
    expect(screen.getByText(/GET \/invoices\/summary/)).toBeInTheDocument()
  })
})

describe('PortalVehicles reads vehicles', () => {
  it('renders the register the collection returned', async () => {
    renderScreen(PortalVehicles, { role: 'owner' })

    expect(await screen.findByText(VEHICLE.plate)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.make)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.owner)).toBeInTheDocument()
  })

  it('GAP: replaces the invented fleet total with the server count, and blanks the rest', async () => {
    renderScreen(PortalVehicles, { role: 'owner' })
    await screen.findByText(VEHICLE.plate)

    expect(screen.queryByText('1,842')).toBeNull()
    expect(screen.queryByText('JTDKN3DU5N0..')).toBeNull()
    expect(screen.queryByText('Nora Al-Fahd')).toBeNull()
    // `page.total` from the repository, not a count of the rendered page.
    expect(screen.getAllByText(String(VEHICLES.length)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(String(ACTIVE_VEHICLES)).length).toBeGreaterThan(0)
    expect(screen.getByText('New This Month')).toBeInTheDocument()
    expect(screen.getByText('GET /vehicles/summary')).toBeInTheDocument()
  })
})

describe('PortalAppointments reads appointments', () => {
  it('renders the bookings the collection returned', async () => {
    renderScreen(PortalAppointments, { role: 'owner' })

    expect(await screen.findByText(APPOINTMENT.cust)).toBeInTheDocument()
    expect(screen.getByText(APPOINTMENT.plate)).toBeInTheDocument()
    expect(screen.getAllByText(APPOINTMENT.bay).length).toBeGreaterThan(0)
  })

  it('GAP: drops the invented ids, staff and averages', async () => {
    renderScreen(PortalAppointments, { role: 'owner' })
    await screen.findByText(APPOINTMENT.cust)

    expect(screen.queryByText('APT-4201')).toBeNull()
    expect(screen.queryByText('Mohammed Ali')).toBeNull()
    expect(screen.queryByText('48m')).toBeNull()
    expect(screen.queryByText('31')).toBeNull()
    // The tiles that cannot be sourced stay, named, showing the em dash.
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('Avg Duration')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })
})

describe('PortalInvoices reads invoices', () => {
  it('renders the register the collection returned', async () => {
    renderScreen(PortalInvoices, { role: 'owner' })

    expect(await screen.findByText(INVOICE.id)).toBeInTheDocument()
    expect(screen.getAllByText(INVOICE.cust).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/SAR 1,840\.00/).length).toBeGreaterThan(0)
  })

  it('GAP: no browser-summed money, and no balance guessed from a fixture row', async () => {
    renderScreen(PortalInvoices, { role: 'owner' })
    await screen.findByText(INVOICE.id)

    expect(screen.queryByText('INV-2026-1284')).toBeNull()
    expect(screen.queryByText('Transmission Flush')).toBeNull()
    expect(screen.queryByText('142')).toBeNull()
    expect(screen.getByText('Outstanding')).toBeInTheDocument()
    expect(screen.getByText('Collected MTD')).toBeInTheDocument()
    expect(screen.getByText(/GET \/invoices\/summary/)).toBeInTheDocument()
    // A fixture invoice carries a total and no payments, so its balance is
    // blank rather than reported as the whole amount outstanding.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(INVOICES.length)
  })
})

describe('CustomerAppVehicles reads vehicles', () => {
  it('renders the garage the collection returned', async () => {
    renderScreen(CustomerAppVehicles, { role: 'customer' })

    expect(await screen.findByText(VEHICLE.make)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.plate)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.mileage)).toBeInTheDocument()
  })

  it('GAP: drops the invented insurance, colours and mileage roll-up', async () => {
    renderScreen(CustomerAppVehicles, { role: 'customer' })
    await screen.findByText(VEHICLE.make)

    expect(screen.queryByText('Tawuniya Comprehensive')).toBeNull()
    expect(screen.queryByText('Pearl White')).toBeNull()
    expect(screen.queryByText('RUH 6633')).toBeNull()
    expect(screen.queryByText('144K')).toBeNull()
    // Colour, next service and insurance are not columns of `vehicles`.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('GET /vehicles/summary')).toBeInTheDocument()
  })
})

describe('VehiclesList reads vehicles', () => {
  it('renders the owner the projection actually carries', async () => {
    renderScreen(VehiclesList, { role: 'owner' })

    // `vehicles` presents the owner as `owner`; the screen read `ownerName`
    // and showed an em dash for every row on a live build.
    expect(await screen.findByText(VEHICLE.owner)).toBeInTheDocument()
    expect(screen.getByText(VEHICLE.plate)).toBeInTheDocument()
  })

  it('counts the contract status vocabulary and the server total', async () => {
    renderScreen(VehiclesList, { role: 'owner' })
    await screen.findByText(VEHICLE.plate)

    expect(screen.getAllByText(String(VEHICLES.length)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(String(ACTIVE_VEHICLES)).length).toBeGreaterThan(0)
    // The status pill renders the contract's vocabulary, not the raw value.
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(screen.queryByText('active')).toBeNull()
  })
})
