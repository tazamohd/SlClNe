import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WhatsAppCampaigns } from '@/screens/crm/Crm'
import { renderWithProviders } from '../helpers/render'

/** The "Send" action on an sms/whatsapp campaign (build-order item 7).
 *
 *  `POST /crm/campaigns/:id/send` is a real route, gated on `crm:e` and
 *  refusing honestly (§40 EXTERNAL_DEPENDENCY) rather than faking delivery.
 *  The design fixtures (`app/src/data/generated/tables.ts`) carry no row id
 *  — the same reason `CampaignFormModal.tsx`'s own Delete button has always
 *  been inert here — so clicking Send against the fixture repository is a
 *  no-op rather than a call. What this suite pins is the honest half a
 *  client can prove without one: the button appears only where a send would
 *  make sense, and a role without the grant never sees it, never that a
 *  click here fabricates a "Sent" (`server/tests/crm-campaigns.test.ts`
 *  covers the real dispatch, refusal and success paths against a live API). */
describe('Campaigns — Send action (fixture build)', () => {
  it('offers Send only for an sms/whatsapp campaign that is not completed', async () => {
    renderWithProviders(<WhatsAppCampaigns />, { role: 'owner' })
    // "New Customer Welcome" is the seeded whatsapp/running campaign.
    expect(await screen.findByText('New Customer Welcome')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument()
  })

  it('a click does not fabricate a status change with no fixture row id to dispatch', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WhatsAppCampaigns />, { role: 'owner' })
    await screen.findByText('New Customer Welcome')
    await user.click(screen.getByRole('button', { name: /Send/ }))

    // Still there, still whatever status it was — never an optimistic "Sent".
    expect(screen.getByText('New Customer Welcome')).toBeInTheDocument()
    expect(screen.queryByText('Campaign dispatched')).not.toBeInTheDocument()
  })

  it('hides Send from a role with no crm edit grant', async () => {
    renderWithProviders(<WhatsAppCampaigns />, { role: 'technician' })
    await screen.findByText('New Customer Welcome')
    expect(screen.queryByRole('button', { name: /Send/ })).toBeNull()
  })
})
