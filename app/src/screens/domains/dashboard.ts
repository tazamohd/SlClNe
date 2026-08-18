import type { DomainScreens } from '../registry'
import { DashboardHome } from '../dashboard/DashboardHome'
import { DashboardMain } from '../dashboard/DashboardMain'
import { Calendar } from '../dashboard/Calendar'

export const SCREENS: DomainScreens = {
  'Dashboard-Home': DashboardHome,
  'Dashboard-Main': DashboardMain,
  Calendar,
}
