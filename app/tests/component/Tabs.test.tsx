import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs'
import { renderWithProviders } from '../helpers/render'

/** Tabs are the primary navigation inside detail screens — job cards, estimates,
 *  customer profiles. Each tab must be keyboard-accessible and properly wired
 *  with ARIA so screen readers announce the active panel.
 */

function BasicTabs({ defaultTab = 'info', onChange }: { defaultTab?: string; onChange?: (tab: string) => void }) {
  return (
    <Tabs defaultTab={defaultTab} onChange={onChange}>
      <TabList label="Customer sections">
        <Tab id="info">Info</Tab>
        <Tab id="history">History</Tab>
        <Tab id="billing">Billing</Tab>
      </TabList>
      <TabPanel id="info">Customer information panel</TabPanel>
      <TabPanel id="history">Service history panel</TabPanel>
      <TabPanel id="billing">Billing details panel</TabPanel>
    </Tabs>
  )
}

function ControlledTabs() {
  const [active, setActive] = useState('info')
  return (
    <Tabs value={active} onChange={setActive}>
      <TabList label="Controlled tabs">
        <Tab id="info">Info</Tab>
        <Tab id="history">History</Tab>
      </TabList>
      <TabPanel id="info">Info content</TabPanel>
      <TabPanel id="history">History content</TabPanel>
    </Tabs>
  )
}

function DisabledTab() {
  return (
    <Tabs defaultTab="info">
      <TabList label="With disabled">
        <Tab id="info">Info</Tab>
        <Tab id="restricted" disabled>Restricted</Tab>
      </TabList>
      <TabPanel id="info">Info content</TabPanel>
      <TabPanel id="restricted">Restricted content</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders the default tab and its panel', () => {
    renderWithProviders(<BasicTabs />)
    expect(screen.getByRole('tablist', { name: 'Customer sections' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Info' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Customer information panel')
  })

  it('shows only the active panel, not all of them', () => {
    renderWithProviders(<BasicTabs />)
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Customer information panel')
    expect(screen.queryByText('Service history panel')).not.toBeInTheDocument()
    expect(screen.queryByText('Billing details panel')).not.toBeInTheDocument()
  })

  it('switches panels on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicTabs />)

    await user.click(screen.getByRole('tab', { name: 'History' }))
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Info' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Service history panel')
  })

  it('fires onChange callback with the new tab id', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<BasicTabs onChange={onChange} />)

    await user.click(screen.getByRole('tab', { name: 'Billing' }))
    expect(onChange).toHaveBeenCalledWith('billing')
  })

  it('navigates tabs with ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicTabs />)

    // Focus the active tab
    screen.getByRole('tab', { name: 'Info' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Service history panel')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus()

    // Wraps around from last to first
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Info' })).toHaveFocus()

    // Left arrow wraps from first to last
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus()
  })

  it('supports Home and End keys to jump to first and last tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicTabs />)

    screen.getByRole('tab', { name: 'Info' }).focus()
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus()

    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Info' })).toHaveFocus()
  })

  it('wires aria-controls on tabs and aria-labelledby on panels', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicTabs />)

    const infoTab = screen.getByRole('tab', { name: 'Info' })
    const panelId = infoTab.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', panelId)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', infoTab.id)
  })

  it('sets tabIndex 0 on the active tab and -1 on inactive tabs', () => {
    renderWithProviders(<BasicTabs />)
    expect(screen.getByRole('tab', { name: 'Info' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1')
  })

  it('works in controlled mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ControlledTabs />)

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Info content')
    await user.click(screen.getByRole('tab', { name: 'History' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('History content')
  })

  it('disables a tab and prevents activation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DisabledTab />)

    const restricted = screen.getByRole('tab', { name: 'Restricted' })
    expect(restricted).toBeDisabled()

    await user.click(restricted)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Info content')
  })

  it('supports the pill variant', () => {
    renderWithProviders(
      <Tabs defaultTab="a" variant="pill">
        <TabList>
          <Tab id="a">Alpha</Tab>
          <Tab id="b">Beta</Tab>
        </TabList>
        <TabPanel id="a">Alpha panel</TabPanel>
      </Tabs>,
    )
    const tab = screen.getByRole('tab', { name: 'Alpha' })
    expect(tab.className).toContain('rounded')
  })

  it('respects a custom defaultTab', () => {
    renderWithProviders(<BasicTabs defaultTab="billing" />)
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing details panel')
  })
})
