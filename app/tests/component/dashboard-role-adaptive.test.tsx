import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Dashboard } from '@/screens/Dashboard'
import { renderScreen } from '../helpers/render'

/** `Dashboard.tsx` used to show every one of the 13 internal staff roles the
 *  identical KPI row — Total Revenue, Active Jobs, Customers, Inventory —
 *  and the same job-cards table, despite its own docstring's claim to be a
 *  "Role-adaptive KPI home." A technician has no reason to see Total
 *  Revenue; an accountant has no reason to see the repair bay queue. This
 *  pins that each role now gets its own, real-data-backed content, and that
 *  the roles with no financial-module grant never see a revenue figure. */
describe('Dashboard — role-adaptive', () => {
  it('owner sees the full operational-and-financial overview', async () => {
    renderScreen(Dashboard, { role: 'owner' })
    expect(await screen.findByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  it('superadmin and test fall back to the same operational overview as owner', async () => {
    renderScreen(Dashboard, { role: 'superadmin' })
    expect(await screen.findByText('Total Revenue')).toBeInTheDocument()

    renderScreen(Dashboard, { role: 'test' })
    expect(await screen.findByText('Total Revenue')).toBeInTheDocument()
  })

  it('manager sees branch operations, not the revenue KPI', async () => {
    renderScreen(Dashboard, { role: 'manager' })
    expect(await screen.findByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Appointments')).toBeInTheDocument()
    expect(screen.getByText('Estimates Awaiting Approval')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('advisor sees the customer-facing queue: estimates, appointments, declined jobs', async () => {
    renderScreen(Dashboard, { role: 'advisor' })
    // The KPI card and the list of pending estimates below it share a label
    // by design (the count and its own breakdown), so this counts rather
    // than assuming a single match.
    expect((await screen.findAllByText('Pending Estimates')).length).toBe(2)
    expect(screen.getByText('Scheduled Appointments')).toBeInTheDocument()
    expect(screen.getByText('Declined — Needs Follow-up')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('technician sees only their own job queue — real job codes, no revenue', async () => {
    renderScreen(Dashboard, { role: 'technician' })
    expect((await screen.findAllByText('My Jobs')).length).toBe(2)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    // The seeded fixture job code — same one TechnicianPortalMyJobs asserts —
    // proves this reads the real `jobs` collection, not an invented list.
    expect(screen.getAllByText('A3F8B2C1').length).toBeGreaterThan(0)
    expect(screen.queryByText('Total Revenue')).toBeNull()
    expect(screen.queryByText('Customers')).toBeNull()
  })

  it('qc sees the job queue by real status, never a fabricated "awaiting QC" count', async () => {
    renderScreen(Dashboard, { role: 'qc' })
    expect(await screen.findByText('Jobs In Progress')).toBeInTheDocument()
    expect(screen.getByText('Total Active')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('parts sees stock health, not revenue or customers', async () => {
    renderScreen(Dashboard, { role: 'parts' })
    expect(await screen.findByText('Low Stock Items')).toBeInTheDocument()
    expect(screen.getByText('Total Parts')).toBeInTheDocument()
    expect(screen.getByText('Purchase Orders In Transit')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('accountant sees receivables and revenue — the two things this role holds', async () => {
    renderScreen(Dashboard, { role: 'accountant' })
    expect(await screen.findByText('Total Revenue')).toBeInTheDocument()
    expect((await screen.findAllByText('Outstanding Invoices')).length).toBe(2)
    expect(screen.queryByText('Active Jobs')).toBeNull()
  })

  it('hr sees headcount and leave requests, never a pay figure', async () => {
    renderScreen(Dashboard, { role: 'hr' })
    expect(await screen.findByText('Headcount')).toBeInTheDocument()
    expect((await screen.findAllByText('Pending Leave Requests')).length).toBe(2)
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('frontdesk sees the front-of-house queue', async () => {
    renderScreen(Dashboard, { role: 'frontdesk' })
    expect(await screen.findByText('Scheduled Appointments')).toBeInTheDocument()
    expect(screen.getByText('Awaiting Check-In')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('callcenter sees leads and opportunities, not a call-log figure no collection backs', async () => {
    renderScreen(Dashboard, { role: 'callcenter' })
    expect((await screen.findAllByText('New Leads')).length).toBe(2)
    expect(screen.getByText('Open Opportunities')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('procurement sees requisitions and purchase orders', async () => {
    renderScreen(Dashboard, { role: 'procurement' })
    expect((await screen.findAllByText('Open Requisitions')).length).toBe(2)
    expect(screen.getByText('Purchase Orders In Transit')).toBeInTheDocument()
    expect(screen.getByText('Suppliers')).toBeInTheDocument()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })
})
