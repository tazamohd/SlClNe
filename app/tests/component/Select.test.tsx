import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from '@/components/ui/Select'
import { renderWithProviders } from '../helpers/render'

/** The Select component wraps the native <select> with the design system's
 *  border and focus treatment. Being native, it gets keyboard nav and screen
 *  reader support for free — these tests verify the wrapper does not break it. */

describe('Select', () => {
  it('renders a native select element with options', () => {
    renderWithProviders(
      <Select aria-label="Branch">
        <option value="riyadh">Riyadh</option>
        <option value="jeddah">Jeddah</option>
        <option value="dammam">Dammam</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', { name: 'Branch' })
    expect(select).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders the first option as selected by default', () => {
    renderWithProviders(
      <Select aria-label="Status">
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </Select>,
    )

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('open')
  })

  it('fires onChange when the user selects a different option', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <Select aria-label="Priority" onChange={onChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>,
    )

    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'high')
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('combobox', { name: 'Priority' })).toHaveValue('high')
  })

  it('supports the sm size variant', () => {
    renderWithProviders(
      <Select aria-label="Size test" size="sm">
        <option value="a">A</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Size test' })
    expect(select.className).toContain('h-9')
  })

  it('supports the md size variant', () => {
    renderWithProviders(
      <Select aria-label="Size test" size="md">
        <option value="a">A</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Size test' })
    expect(select.className).toContain('h-10')
  })

  it('passes through native HTML attributes', () => {
    renderWithProviders(
      <Select aria-label="Required field" required disabled>
        <option value="x">X</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Required field' })
    expect(select).toBeRequired()
    expect(select).toBeDisabled()
  })

  it('applies custom className alongside default styles', () => {
    renderWithProviders(
      <Select aria-label="Custom" className="my-custom-class">
        <option value="a">A</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Custom' })
    expect(select.className).toContain('my-custom-class')
    expect(select.className).toContain('rounded') // default style still present
  })

  it('supports a controlled value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <Select aria-label="Controlled" value="b" onChange={onChange}>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'Controlled' })).toHaveValue('b')
  })

  it('renders with an empty option for placeholder patterns', () => {
    renderWithProviders(
      <Select aria-label="Vehicle type">
        <option value="">Select type...</option>
        <option value="sedan">Sedan</option>
        <option value="suv">SUV</option>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'Vehicle type' })).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })
})
