import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { PortalShell, portalShellFor } from '@/components/shell/PortalShell'
import { renderWithProviders } from './helpers/render'

/** The wave-granted shell (F-009's root cause). Portals are single-audience
 *  surfaces: narrow nav, the signed-in identity, sign-out through the
 *  confirmation screen, and a bottom tab bar on phone widths instead of the
 *  28-module sidebar. */

function mount(route: string, role: Parameters<typeof renderWithProviders>[1]['role']) {
  return renderWithProviders(
    <Routes>
      <Route
        path="*"
        element={
          <PortalShell>
            <p>portal body</p>
          </PortalShell>
        }
      />
    </Routes>,
    { route, role }
  )
}

describe('PortalShell', () => {
  it('renders the screen inside portal chrome with the audience named', () => {
    mount('/customer-portal', 'customer')
    expect(screen.getByText('portal body')).toBeInTheDocument()
    expect(screen.getByText('SALIS AUTO')).toBeInTheDocument()
    expect(screen.getByText('Customer Portal')).toBeInTheDocument()
    // The operational sidebar's module groups must not leak in.
    expect(screen.queryByText('Workshop')).toBeNull()
  })

  it('resolves the surface from the route', () => {
    mount('/technician-portal', 'technician')
    expect(screen.getByText('Technician Portal')).toBeInTheDocument()
  })

  it('carries the session affordances: identity and a confirmed sign-out', () => {
    mount('/technician-portal', 'technician')
    // The technician role's demo identity, from the session provider.
    expect(screen.getByText('Technician')).toBeInTheDocument()
    const logout = screen.getAllByRole('link', { name: /Logout/ })[0]
    expect(logout).toHaveAttribute('href', '/logout-confirmation')
  })

  it('gives the customer portal its two real destinations and no more', () => {
    mount('/customer-portal', 'customer')
    // Header nav and bottom tab bar both render; each named after the surface.
    const navs = screen.getAllByRole('navigation', { name: 'Customer Portal' })
    expect(navs.length).toBeGreaterThanOrEqual(1)
    const tabs = within(navs[0]).getAllByRole('link')
    expect(tabs.map((tab) => tab.getAttribute('href'))).toEqual([
      '/customer-portal',
      '/customer-portal/booking',
    ])
  })

  it('filters nav items by the RBAC screen gate', () => {
    // A technician holds nothing on portalcustomer, so the customer surface
    // offers them no destinations at all — hidden, never greyed.
    mount('/customer-portal', 'technician')
    expect(screen.queryByRole('navigation', { name: 'Customer Portal' })).toBeNull()
  })

  it('toggles the interface language from the header', async () => {
    const user = userEvent.setup()
    mount('/customer-portal', 'customer')
    await user.click(screen.getByRole('button', { name: 'عربي' }))
    expect(await screen.findByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('binds an unregistered surface through portalShellFor without editing the table', () => {
    const Bound = portalShellFor({
      base: '/procurement-portal',
      title: 'Procurement Portal',
      icon: 'Package',
      nav: [],
    })
    renderWithProviders(
      <Routes>
        <Route
          path="*"
          element={
            <Bound>
              <p>proc body</p>
            </Bound>
          }
        />
      </Routes>,
      { route: '/procurement-portal', role: 'procurement' }
    )
    expect(screen.getByText('Procurement Portal')).toBeInTheDocument()
    expect(screen.getByText('proc body')).toBeInTheDocument()
  })

  it('still renders working chrome for a portal route nobody registered', () => {
    mount('/unmapped-portal', 'owner')
    expect(screen.getByText('portal body')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Logout/ })[0]).toHaveAttribute(
      'href',
      '/logout-confirmation'
    )
  })
})
