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
 *  3. Customer approval capabilities — the `CustomerApproval` screen's own
 *     wiring. The server side of the e-signature now exists
 *     (`POST /estimates/:id/request-approval-otp` and `/verify-approval-otp`,
 *     which persists `estimates.customer_signed_at` — DF-007), but this screen
 *     is not yet connected to it and `approvalLines` still has no link to the
 *     estimate, so it marks each "Not connected" rather than implying a flow it
 *     does not drive.
 *
 *  4. OBD device commands — re-scan / clear-codes / add-to-job, and a per-device
 *     DTC readings endpoint. None exist; OBDDiagnostics shows last-reading
 *     telemetry and the DTC reference catalog, and says so.
 *
 *  5. Approval SoD preflight — the estimate row exposes no `submittedBy` and
 *     there is no GET /estimates/:id/history, so the inbox cannot show the SoD
 *     conflict per row; it states the control is server-side (F-004).
 *
 *  6. A unified approvals queue — CLOSED for the four sources that have one
 *     (DF-005). `GET /approvals` now carries estimates, requisitions, purchase
 *     orders and insurance claims, each row naming the endpoint that decides
 *     it. Payroll runs and journal entries are still absent on purpose:
 *     posting a payroll run is gated on `hr:e` as an edit, not against a
 *     ceiling, and journal entries are written by the business event that
 *     caused them. Neither has an approval to show, and an unactionable row
 *     carrying a fabricated approval standing is worse than an absent one.
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
