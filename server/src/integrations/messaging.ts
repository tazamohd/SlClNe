/** The campaign-dispatch transport — adapter interface, an honest mock, and
 *  nothing that fakes a delivered message.
 *
 *  A marketing campaign's "Send" action would hand off to an SMS/WhatsApp
 *  provider. There is no provider configured in any environment this code has
 *  run in, and this deployment resolves no per-campaign recipient list either
 *  — `campaigns` carries no audience or segment linkage. So a dispatch here
 *  is a single request to trigger the provider's send, never a claim that N
 *  recipients were reached: `reach`/`opens`/`clicks`/`conversions` stay
 *  whatever they already were, exactly as `ObdBridge`'s mock never invents a
 *  DTC.  The unconfigured default *refuses* with a 503 naming the credentials
 *  that are missing, the same envelope `estimate-otp.ts` and `obd.ts` use.
 */
import type { IntegrationStatus } from './obd'
import type { IntegrationConfig } from './config'

export type MessagingChannel = 'sms' | 'whatsapp'

export interface MessagingDispatch {
  campaignId: string
  campaignName: string
  channel: MessagingChannel
}

export interface MessagingResult {
  dispatchedAt: string
  /** True when this came from the mock transport, never a real provider. */
  mock: boolean
}

/** The adapter every messaging transport implements. A live implementation
 *  would POST to the provider; the shape is fixed here so the route never
 *  changes when one arrives. */
export interface MessagingTransport {
  readonly name: string
  readonly configured: boolean
  dispatch(message: MessagingDispatch): Promise<MessagingResult>
}

export class MessagingUnavailable extends Error {
  readonly requires: readonly string[]
  readonly detail: string
  constructor(requires: readonly string[]) {
    super('The messaging provider is not configured in this deployment.')
    this.name = 'MessagingUnavailable'
    this.requires = requires
    this.detail =
      `Set ${requires.join(', ')} and deploy a provider adapter, then set MESSAGING_TRANSPORT. ` +
      'Until then no campaign can be dispatched and this endpoint will keep refusing.'
  }
}

const REQUIRES = ['MESSAGING_PROVIDER_URL', 'MESSAGING_PROVIDER_TOKEN'] as const

/** The default. Refuses rather than pretending a message went out. */
export const unconfiguredMessagingTransport: MessagingTransport = {
  name: 'unconfigured',
  configured: false,
  async dispatch() {
    throw new MessagingUnavailable(REQUIRES)
  },
}

/** Development / test transport. Deterministic, and every response is flagged
 *  `mock: true`. It talks to no provider and says so. */
export const mockMessagingTransport: MessagingTransport = {
  name: 'mock',
  configured: false,
  async dispatch() {
    return { dispatchedAt: new Date().toISOString(), mock: true }
  },
}

export function messagingTransportFor(config: IntegrationConfig): MessagingTransport {
  switch (config.MESSAGING_TRANSPORT) {
    case 'mock':
      return mockMessagingTransport
    default:
      return unconfiguredMessagingTransport
  }
}

export function messagingStatus(config: IntegrationConfig, transport: MessagingTransport): IntegrationStatus {
  return {
    id: 'messaging',
    configured: config.messagingConfigured,
    requires: REQUIRES,
    state:
      transport.name === 'mock'
        ? 'mock transport: dispatch accepted deterministically, no provider is called'
        : 'unconfigured: campaign dispatch refuses with 503 until a provider is deployed',
    dependency: 'SMS/WhatsApp provider (e.g. Unifonic, WhatsApp Business)',
  }
}
