import type { DomainScreens } from '../registry'
import { ComplianceManagement } from '../compliance/ComplianceManagement'
import { ZATCASettings } from '../compliance/ZATCASettings'
import { VATSettings } from '../compliance/VATSettings'
import { ZakatSettings } from '../compliance/ZakatSettings'
import { SafetyIncidents } from '../compliance/SafetyIncidents'
import { EnvironmentalCompliance } from '../compliance/EnvironmentalCompliance'
import { ISOQualityManagement } from '../compliance/ISOQualityManagement'
import { EquipmentCalibration } from '../compliance/EquipmentCalibration'

export const SCREENS: DomainScreens = {
  'Compliance-Management': ComplianceManagement,
  'ZATCA-Settings': ZATCASettings,
  'VAT-Settings': VATSettings,
  'Zakat-Settings': ZakatSettings,
  'Safety-Incidents': SafetyIncidents,
  'Environmental-Compliance': EnvironmentalCompliance,
  'ISO-Quality-Management': ISOQualityManagement,
  'Equipment-Calibration': EquipmentCalibration,
}
