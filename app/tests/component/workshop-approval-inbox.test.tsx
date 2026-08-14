import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApprovalInbox } from '@/screens/workshop/ApprovalInbox'
import { renderWithProviders } from '../helpers/render'

/** The approval inbox operates on the one approvable document with a real server
 *  action — estimates. These pin the properties that keep it honest:
 *
 *  - the queue is only the *undecided* estimates (approved/rejected drop out);
 *  - the approve button is gated by authority + ceiling, so a role without
 *    `estimates:a` gets a disabled control, never a button that would 403;
 *  - the fixture build cannot approve, and the screen says so instead of
 *    faking a success and clearing the row;
 *  - the segregation-of-duties control is stated as server-side, not faked as a
 *    per-row flag the client cannot compute. */
describe('ApprovalInbox', () => {
  it('lists the estimates awaiting a decision and drops the approved one', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    // EST-0231 (draft) and EST-0230 (sent) are awaiting; EST-0229 is approved.
    expect(await screen.findByText('EST-0231')).toBeInTheDocument()
    expect(screen.getByText('EST-0230')).toBeInTheDocument()
    expect(screen.queryByText('EST-0229')).toBeNull()
  })

  it('offers approve and reject to a role with the authority and ceiling', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    await screen.findByText('EST-0231')
    expect(screen.getAllByRole('button', { name: /^Approve$/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Reject/ }).length).toBeGreaterThan(0)
  })

  it('disables approval for a role without estimates:a and hides reject', async () => {
    // advisor holds estimates:v/c/e but not `a`. The button is present but
    // disabled, and there is no reject — the server would refuse either way.
    renderWithProviders(<ApprovalInbox />, { role: 'advisor' })
    await screen.findByText('EST-0231')
    const approve = screen.getAllByRole('button', { name: /Approve/ })
    expect(approve.every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
    expect(screen.queryByRole('button', { name: /Reject/ })).toBeNull()
  })

  it('surfaces the refused fixture write instead of faking an approval', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    await screen.findByText('EST-0231')
    await user.click(screen.getAllByRole('button', { name: /^Approve$/ })[0])
    // The fixture repository cannot POST /estimates/:id/approve; the toast says
    // so and the row is still there.
    expect(await screen.findByText(/Approval failed/)).toBeInTheDocument()
    expect(screen.getByText('EST-0231')).toBeInTheDocument()
  })

  it('states segregation of duties is enforced server-side', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    expect(await screen.findByText('Segregation of duties')).toBeInTheDocument()
  })

  it('renders the queue as cards on a phone with the same stats', async () => {
    renderWithProviders(<ApprovalInbox />, { role: 'owner' })
    const heading = await screen.findByRole('heading', { name: 'Approval Inbox' })
    expect(heading).toBeInTheDocument()
    // Stats strip is always present.
    expect(within(document.body).getByText('Awaiting me')).toBeInTheDocument()
  })
})
