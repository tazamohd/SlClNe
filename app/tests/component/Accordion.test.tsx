import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { renderWithProviders } from '../helpers/render'

/** Accordion is used in settings, FAQ sections, and detail pages to show
 *  collapsible sections. Keyboard and ARIA compliance matter for accessibility. */

function BasicAccordion({ multiple, defaultOpen }: { multiple?: boolean; defaultOpen?: string[] }) {
  return (
    <Accordion multiple={multiple} defaultOpen={defaultOpen}>
      <AccordionItem id="vehicle" title="Vehicle Details">
        VIN: 1HGCM82633A004352
      </AccordionItem>
      <AccordionItem id="service" title="Service History">
        Last service: 2024-01-15
      </AccordionItem>
      <AccordionItem id="billing" title="Billing">
        Outstanding: SAR 1,250
      </AccordionItem>
    </Accordion>
  )
}

describe('Accordion', () => {
  it('renders all section headings but no panels initially', () => {
    renderWithProviders(<BasicAccordion />)
    expect(screen.getByRole('button', { name: /Vehicle Details/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Service History/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Billing/ })).toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('expands a section on click and shows the panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    await user.click(screen.getByRole('button', { name: /Vehicle Details/ }))
    expect(screen.getByRole('region')).toHaveTextContent('VIN: 1HGCM82633A004352')
    expect(screen.getByRole('button', { name: /Vehicle Details/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('collapses an open section when clicked again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    await user.click(screen.getByRole('button', { name: /Vehicle Details/ }))
    expect(screen.getByRole('region')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Vehicle Details/ }))
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vehicle Details/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('closes the previous section when another is opened (single mode)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    await user.click(screen.getByRole('button', { name: /Vehicle Details/ }))
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByRole('region')).toHaveTextContent('VIN')

    await user.click(screen.getByRole('button', { name: /Service History/ }))
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByRole('region')).toHaveTextContent('Last service')
  })

  it('keeps multiple sections open when multiple mode is enabled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion multiple />)

    await user.click(screen.getByRole('button', { name: /Vehicle Details/ }))
    await user.click(screen.getByRole('button', { name: /Service History/ }))
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })

  it('opens sections listed in defaultOpen on mount', () => {
    renderWithProviders(<BasicAccordion defaultOpen={['service']} />)
    expect(screen.getByRole('region')).toHaveTextContent('Last service')
    expect(screen.getByRole('button', { name: /Service History/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('wires aria-controls and aria-labelledby between trigger and panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    const trigger = screen.getByRole('button', { name: /Vehicle Details/ })
    await user.click(trigger)

    const panelId = trigger.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('id', panelId)
    expect(region).toHaveAttribute('aria-labelledby', trigger.id)
  })

  it('expands a section on Enter key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    screen.getByRole('button', { name: /Vehicle Details/ }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('region')).toHaveTextContent('VIN')
  })

  it('expands a section on Space key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BasicAccordion />)

    screen.getByRole('button', { name: /Billing/ }).focus()
    await user.keyboard(' ')
    expect(screen.getByRole('region')).toHaveTextContent('Outstanding')
  })

  it('does not expand a disabled item', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Accordion>
        <AccordionItem id="open" title="Open">
          Open content
        </AccordionItem>
        <AccordionItem id="locked" title="Locked" disabled>
          Locked content
        </AccordionItem>
      </Accordion>,
    )

    const locked = screen.getByRole('button', { name: /Locked/ })
    expect(locked).toBeDisabled()
    await user.click(locked)
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('opens multiple defaultOpen items simultaneously', () => {
    renderWithProviders(<BasicAccordion multiple defaultOpen={['vehicle', 'billing']} />)
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })
})
