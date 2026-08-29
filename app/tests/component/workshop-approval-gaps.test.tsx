import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { WorkshopReports } from '@/screens/workshop/WorkshopReports'
import { DiagnosticReport } from '@/screens/workshop/DiagnosticReport'
import { CustomerApproval } from '@/screens/workshop/CustomerApproval'
import { OBDDiagnostics } from '@/screens/workshop/OBDDiagnostics'
import { ApprovalInbox } from '@/screens/workshop/ApprovalInbox'
import { renderWithProviders } from '../helpers/render'

/** Server gaps this tranche renders honestly instead of faking. Each test pins
 *  the *honest absent state* so it cannot silently rot into a fabricated
 *  success, and names the endpoint that would close it.
 *
 *  GAPs, with the precise missing capability:
 *
 *  1. GET /reports/workshop — a workshop analytics/time-series endpoint. There
 *     is none, so WorkshopReports counts what `jobs`/`technicians` can prove and
 *     states the trend / QC-pass / avg-bay-time panel is not connected.
 *
 *  2. A diagnostic-report total. The `diag*` collections carry line figures but
 *     no server-computed total, and Part 5b forbids a client VAT/grand total, so
 *     DiagnosticReport shows lines and defers the total to the estimate.
 *
 *  3. Customer approval capabilities — an approval-OTP endpoint, e-signature
 *     persistence, and a link from `approvalLines` to the estimate the
 *     `POST /estimates/:id/approve` action needs. None exist; CustomerApproval
 *     marks each "Not connected".
 *
 *  4. OBD device commands — re-scan / clear-codes / add-to-job, and a per-device
 *     DTC readings endpoint. None exist; OBDDiagnostics shows last-reading
 *     telemetry and the DTC reference catalog, and says so.
 *
 *  5. Approval SoD preflight — the estimate row exposes no `submittedBy` and
 *     there is no GET /estimates/:id/history, so the inbox cannot show the SoD
 *     conflict per row; it states the control is server-side (F-004).
 *
 *  6. A unified approvals queue. Only estimates have an approve action; POs,
 *     journals and payroll (other domains) have none, so the inbox operates on
 *     estimates alone rather than inventing rows.
 *
 *  7. Appointment↔technician reconciliation in the seed: appointments carry
 *     `technicianName` strings with no `technicianId`, and those names are not
 *     the `technicians` roster's names. TechnicianSchedule unions the two so the
 *     day's work is not lost; the durable fix is a seed link. */
describe('GAP: workshop server capabilities rendered honestly', () => {
  it('GAP GET /reports/workshop — WorkshopReports names the missing analytics endpoint', async () => {
    renderWithProviders(<WorkshopReports />, { role: 'owner' })
    expect(await screen.findByText(/Awaiting GET \/reports\/workshop/)).toBeInTheDocument()
    // The real counts it *can* prove are still shown.
    expect(screen.getByText('Job Cards')).toBeInTheDocument()
  })

  it('GAP diagnostic-report total — DiagnosticReport defers the total to the estimate', async () => {
    renderWithProviders(<DiagnosticReport />, { role: 'advisor' })
    expect(await screen.findByText(/Totals live on the estimate, not this report/)).toBeInTheDocument()
  })

  it('GAP approval OTP / e-signature / estimate link — CustomerApproval marks them not connected', async () => {
    renderWithProviders(<CustomerApproval />, { role: 'customer' })
    expect(await screen.findByText('Authorise the work')).toBeInTheDocument()
    expect(screen.getAllByText('Not connected').length).toBeGreaterThanOrEqual(3)
  })

  it('GAP OBD device commands — OBDDiagnostics states re-scan/clear/add-to-job are absent', async () => {
    renderWithProviders(<OBDDiagnostics />, { role: 'technician' })
    expect(
      await screen.findByText(/device commands the API does not expose yet/)
    ).toBeInTheDocument()
  })

  it('GAP SoD preflight — ApprovalInbox states the control is server-side', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    expect(await screen.findByText('Segregation of duties')).toBeInTheDocument()
    expect(
      screen.getByText(/the estimate does not carry who raised it/)
    ).toBeInTheDocument()
  })
})
