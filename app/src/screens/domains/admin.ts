import type { DomainScreens } from '../registry'
import { UsersTeams } from '../admin/UsersTeams'
import { Branches } from '../admin/Branches'
import { Organizations } from '../admin/Organizations'
import { AdvancedSettings } from '../admin/AdvancedSettings'
import { AutomationRules } from '../admin/AutomationRules'
import { Backup } from '../admin/Backup'
import { Subscription } from '../admin/Subscription'
import { Templates } from '../admin/Templates'
import { WorkflowBuilder } from '../admin/WorkflowBuilder'

export const SCREENS: DomainScreens = {
  AdvancedSettings,
  AutomationRules,
  Backup,
  Branches,
  Organizations,
  Subscription,
  Templates,
  UsersTeams,
  WorkflowBuilder,
}
