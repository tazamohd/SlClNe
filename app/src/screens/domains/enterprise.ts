import type { DomainScreens } from '../registry'
import { FranchiseManagement } from '../enterprise/FranchiseManagement'
import { GlobalizationLayer } from '../enterprise/GlobalizationLayer'
import { MultiLocationDashboard } from '../enterprise/MultiLocationDashboard'

export const SCREENS: DomainScreens = {
  'Franchise-Management': FranchiseManagement,
  'Globalization-Layer': GlobalizationLayer,
  'Multi-Location-Dashboard': MultiLocationDashboard,
}
