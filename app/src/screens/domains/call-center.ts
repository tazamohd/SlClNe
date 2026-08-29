import type { DomainScreens } from '../registry'
import { CallCenter } from '../call-center/CallCenter'
import { CallCenterLogs } from '../call-center/CallCenterLogs'

export const SCREENS: DomainScreens = {
  CallCenter,
  'CallCenter.Logs': CallCenterLogs,
}
