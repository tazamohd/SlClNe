import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { PortalShell, surfaceFor } from '@/components/shell/PortalShell'
import { TechnicianPortal } from '@/screens/portals/TechnicianPortal'
import { TechnicianPortalMyJobs } from '@/screens/portals/technician/TechnicianPortalMyJobs'
import { PurchaseAgentDashboard } from '@/screens/portals/purchase/PurchaseAgentDashboard'
import { ClientPortalDashboard } from '@/screens/portals/client/ClientPortalDashboard'
import { JOBS } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The portal surfaces the redesign added or repaired: the technician's flat
 *  sub-routes resolve to the technician chrome with a five-tab bar, the
 *  purchase agent and client portal have surfaces of their own, and the
 *  technician home carries its new affordances. */

function mount(route: string, role: Parameters<typeof renderWithProviders>[1]['role'], body = <p>portal body</p>) {
  return renderWithProviders(
    <Routes>
      <Route path="*" element={<PortalShell>{body}</PortalShell>} />
    </Routes>,
    { route, role }
  )
}

describe('surfaceFor', () => {
  it('matches the flat hyphenated sub-routes as well as nested ones', () => {
    expect(surfaceFor('/technician-portal').title).toBe('Technician Portal')
    expect(surfaceFor('/technician-portal/job-detail').title).toBe('Technician Portal')
    expect(surfaceFor('/technician-portal-my-jobs').title).toBe('Technician Portal')
    expect(surfaceFor('/purchase-agent-orders').title).toBe('Purchase Agent')
    expect(surfaceFor('/client-portal-invoices').title).toBe('Client Portal')
    expect(surfaceFor('/vendor-supplier-portal').title).toBe('Supplier Portal')
    expect(surfaceFor('/unmapped-portal').title).toBe('Portal')
  })
})

describe('PortalShell surfaces', () => {
  it('gives the technician five real tabs, on the flat routes too', () => {
    mount('/technician-portal-my-jobs', 'technician')
    const navs = screen.getAllByRole('navigation', { name: 'Technician Portal' })
    const tabs = within(navs[0]).getAllByRole('link')
    expect(tabs.map((tab) => tab.getAttribute('href'))).toEqual([
      '/technician-portal',
      '/technician-portal-my-jobs',
      '/technician-portal-time-clock',
      '/technician-portal-parts',
      '/technician-portal-profile',
    ])
  })

  it('gives the purchase agent a surface whose brand link lands on a real route', () => {
    mount('/purchase-agent-dashboard', 'procurement')
    expect(screen.getByText('Purchase Agent')).toBeInTheDocument()
    const navs = screen.getAllByRole('navigation', { name: 'Purchase Agent' })
    expect(within(navs[0]).getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('link', { name: /SALIS AUTO/ })).toHaveAttribute('href', '/purchase-agent-dashboard')
  })

  it('gives the client portal its five tabs', () => {
    mount('/client-portal-vehicles', 'customer')
    const navs = screen.getAllByRole('navigation', { name: 'Client Portal' })
    expect(within(navs[0]).getAllByRole('link')).toHaveLength(5)
  })
})

describe('TechnicianPortal affordances', () => {
  const CURRENT = JOBS.find((job) => job.st === 'in_progress')!

  it('shows skeleton numerals while loading and the shift chip to the time clock', async () => {
    renderWithProviders(<TechnicianPortal />, { route: '/technician-portal', role: 'technician' })
    // Before the collections resolve, the stat tiles hold skeletons, not '…'.
    expect(screen.queryByText('…')).toBeNull()
    expect(screen.getByRole('link', { name: /On shift/ })).toHaveAttribute('href', '/technician-portal-time-clock')
    await screen.findByText(CURRENT.cust)
    expect(screen.getByText('Current Job')).toBeInTheDocument()
  })

  it('offers parts and photo from the current job, and keeps Open Job as the primary action', async () => {
    renderWithProviders(<TechnicianPortal />, { route: '/technician-portal', role: 'technician' })
    await screen.findByText(CURRENT.cust)
    expect(screen.getByRole('link', { name: /Request parts/ })).toHaveAttribute('href', '/technician-portal-parts')
    expect(screen.getByRole('link', { name: /Add photo/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Job/ })).toBeInTheDocument()
    // Queue rows carry the stage dots.
    expect(screen.getAllByRole('img', { name: /Stage/ }).length).toBeGreaterThan(0)
  })
})

describe('TechnicianPortalMyJobs', () => {
  it('reads the jobs collection through the screen frame', async () => {
    renderWithProviders(<TechnicianPortalMyJobs />, { route: '/technician-portal-my-jobs', role: 'technician' })
    expect(screen.getByRole('heading', { name: 'My Jobs' })).toBeInTheDocument()
    expect(await screen.findByText(JOBS[0].cust)).toBeInTheDocument()
    expect(screen.queryByText('WO-8830')).toBeNull()
  })
})

describe('PurchaseAgentDashboard', () => {
  it('reads purchase orders and shows the honest empty state on a fixture build', async () => {
    renderWithProviders(<PurchaseAgentDashboard />, { route: '/purchase-agent-dashboard', role: 'procurement' })
    expect(screen.getByRole('heading', { name: 'Purchase Dashboard' })).toBeInTheDocument()
    expect(await screen.findByText('No purchase orders yet')).toBeInTheDocument()
    expect(screen.queryByText('PO-2401')).toBeNull()
  })
})

describe('ClientPortalDashboard', () => {
  it('counts the customer collections instead of constants', async () => {
    renderWithProviders(<ClientPortalDashboard />, { route: '/client-portal-dashboard', role: 'customer' })
    expect(screen.getByRole('heading', { name: 'My Dashboard' })).toBeInTheDocument()
    expect(await screen.findByText('Next appointment')).toBeInTheDocument()
    expect(screen.queryByText('Invoice #INV-4821 Payment Due')).toBeNull()
  })
})
