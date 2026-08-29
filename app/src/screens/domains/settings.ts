import type { DomainScreens } from '../registry'
import { SystemSettings } from '../settings/SystemSettings'
import { SecuritySettings } from '../settings/SecuritySettings'
import { UserSettings } from '../settings/UserSettings'
import { UserProfile } from '../settings/UserProfile'
import { FinancialSettings } from '../settings/FinancialSettings'
import { RoleManagement } from '../settings/RoleManagement'

export const SCREENS: DomainScreens = {
  'System-Settings': SystemSettings,
  'Security-Settings': SecuritySettings,
  'User-Settings': UserSettings,
  'User-Profile': UserProfile,
  'Financial-Settings': FinancialSettings,
  'Role-Management': RoleManagement,
}
