import type { DomainScreens } from '../registry'
import { BusinessIntelligence } from '../bi/BusinessIntelligence'
import { BusinessIntelligenceDashboard } from '../bi/BusinessIntelligenceDashboard'
import { BusinessHeatmaps } from '../bi/BusinessHeatmaps'
import { ProfitAnalysis } from '../bi/ProfitAnalysis'
import { KPIDashboard } from '../bi/KPIDashboard'

export const SCREENS: DomainScreens = {
  'Business-Intelligence': BusinessIntelligence,
  'Business-Intelligence-Dashboard': BusinessIntelligenceDashboard,
  'Business-Heatmaps': BusinessHeatmaps,
  'Profit-Analysis': ProfitAnalysis,
  'KPI-Dashboard': KPIDashboard,
}
