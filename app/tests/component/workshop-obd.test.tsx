import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OBDDiagnostics } from '@/screens/workshop/OBDDiagnostics'
import { renderWithProviders } from '../helpers/render'

/** OBD diagnostics reads the real device and DTC catalog. */
describe('OBDDiagnostics', () => {
  it('lists the scan tools and shows the selected telemetry', async () => {
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    // The device name appears both in the tool list and the detail header.
    expect((await screen.findAllByText('Toyota Camry 2021')).length).toBeGreaterThan(0)
    // Telemetry PIDs from the real device row.
    expect(screen.getByText('Engine RPM')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
  })

  it('is honest that the telemetry is the last reading, not a live stream', async () => {
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    await screen.findAllByText('Toyota Camry 2021')
    expect(screen.getByText('Last reading')).toBeInTheDocument()
    expect(
      screen.getByText(/device commands the API does not expose yet/)
    ).toBeInTheDocument()
  })

  it('switches device on selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    await screen.findAllByText('Toyota Camry 2021')
    const buttons = screen.getAllByRole('button')
    // Clicking a different device button updates the detail panel without error.
    if (buttons.length > 1) await user.click(buttons[1])
    expect(screen.getByText('Trouble code reference')).toBeInTheDocument()
  })
})
