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
import { SuperAdmin } from '../admin/SuperAdmin'
import { DataImportExport } from '../admin/DataImportExport'
import { DocumentManagement } from '../admin/DocumentManagement'
import { OEMIntegrations } from '../admin/OEMIntegrations'
import { SystemIntegrations } from '../admin/SystemIntegrations'
import { MobileDeviceManagement } from '../admin/MobileDeviceManagement'
import { DocumentOCR } from '../admin/DocumentOCR'
import { DataBackup } from '../admin/DataBackup'
import { Tools } from '../admin/Tools'
import { DashboardWidgets } from '../admin/DashboardWidgets'
import { SMSIntegration } from '../integrations/SMSIntegration'
import { SalesGuide } from '../integrations/SalesGuide'

export const SCREENS: DomainScreens = {
  AdvancedSettings,
  AutomationRules,
  Backup,
  Branches,
  Organizations,
  Subscription,
  SuperAdmin,
  Templates,
  UsersTeams,
  WorkflowBuilder,
  'Data-Import-Export': DataImportExport,
  'Document-Management': DocumentManagement,
  OEMIntegrations,
  SystemIntegrations,
  'Mobile-Device-Management': MobileDeviceManagement,
  'Document-OCR': DocumentOCR,
  'Data-Backup': DataBackup,
  Tools,
  'Dashboard-Widgets': DashboardWidgets,
  'SMS-Integration': SMSIntegration,
  'Sales-Guide': SalesGuide,
}
