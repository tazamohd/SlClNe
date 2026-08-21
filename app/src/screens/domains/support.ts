import type { DomainScreens } from '../registry'
import { Chat } from '../support/Chat'
import { SupportChatDashboard } from '../support/SupportChatDashboard'

export const SCREENS: DomainScreens = {
  Chat,
  'Support-Chat-Dashboard': SupportChatDashboard,
}
