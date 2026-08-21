import type { DomainScreens } from '../registry'
import { EmergingTechnologies } from '../emerging/EmergingTechnologies'
import { NextGenTechnologies } from '../emerging/NextGenTechnologies'
import { IoTDashboard } from '../emerging/IoTDashboard'
import { EdgeComputing } from '../emerging/EdgeComputing'
import { DigitalTwinViewer } from '../emerging/DigitalTwinViewer'
import { SustainableEnergyMonitoring } from '../emerging/SustainableEnergyMonitoring'

export const SCREENS: DomainScreens = {
  'Emerging-Technologies': EmergingTechnologies,
  'NextGen-Technologies': NextGenTechnologies,
  'IoT-Dashboard': IoTDashboard,
  'Edge-Computing': EdgeComputing,
  'Digital-Twin-Viewer': DigitalTwinViewer,
  'Sustainable-Energy-Monitoring': SustainableEnergyMonitoring,
}
