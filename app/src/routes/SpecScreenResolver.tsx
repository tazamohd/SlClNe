import { lazy, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'
import { FeatureScreenView } from '@/screens/feature/FeatureScreenView'
import { PendingScreen } from '@/screens/PendingScreen'
import { RequireAccess } from './RequireAccess'

const specByRoute = new Map(
  SPEC_SCREENS.filter((s) => !s.designScreen).map((s) => [s.route, s]),
)

// Spec-screen routes that have graduated from the generic FeatureScreenView
// to a dedicated component with typed columns, DataTable, and real data.
// Lazy-loaded alongside this resolver so they stay out of the main bundle.

// hr & payroll
const HRManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.HRManagement })),
)
const StaffDirectory = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffDirectory })),
)
const StaffScheduling = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffScheduling })),
)
const StaffPerformanceReview = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffPerformanceReview })),
)
const TimesheetManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TimesheetManagement })),
)
const TimeclockPayroll = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TimeclockPayroll })),
)
const PayrollManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.PayrollManagement })),
)
const LeaveRequests = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.LeaveRequests })),
)
const TrainingLMS = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TrainingLMS })),
)

// insurance / warranty / contracts
const InsuranceClaims = lazy(() =>
  import('@/screens/insurance/InsuranceClaims').then((m) => ({ default: m.InsuranceClaims })),
)
const WarrantyManagement = lazy(() =>
  import('@/screens/insurance/WarrantyManagement').then((m) => ({ default: m.WarrantyManagement })),
)
const ContractManagement = lazy(() =>
  import('@/screens/insurance/ContractManagement').then((m) => ({ default: m.ContractManagement })),
)

// fleet / loaner / towing
const FleetTracking = lazy(() =>
  import('@/screens/fleet/FleetTracking').then((m) => ({ default: m.FleetTracking })),
)
const LoanerVehicles = lazy(() =>
  import('@/screens/fleet/LoanerVehicles').then((m) => ({ default: m.LoanerVehicles })),
)
const TowingAssistance = lazy(() =>
  import('@/screens/fleet/TowingAssistance').then((m) => ({ default: m.TowingAssistance })),
)
const TowingServices = lazy(() =>
  import('@/screens/fleet/TowingServices').then((m) => ({ default: m.TowingServices })),
)

// settings (W4-A)
const SystemSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.SystemSettings })),
)
const UserSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.UserSettings })),
)
const SecuritySettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.SecuritySettings })),
)
const FinancialSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.FinancialSettings })),
)
const ZATCASettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.ZATCASettings })),
)
const VATSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.VATSettings })),
)
const ZakatSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.ZakatSettings })),
)

// admin / compliance (W4-A)
const UserProfile = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.UserProfile })),
)
const RoleManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.RoleManagement })),
)
const ComplianceManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.ComplianceManagement })),
)
const SafetyIncidents = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.SafetyIncidents })),
)
const EnvironmentalCompliance = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.EnvironmentalCompliance })),
)
const ISOQualityManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.ISOQualityManagement })),
)
const EquipmentCalibration = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.EquipmentCalibration })),
)

// system / infrastructure (W4-A)
const NotificationsScreen = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.NotificationsScreen })),
)
const AccountingIntegration = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.AccountingIntegration })),
)
const SMSIntegration = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.SMSIntegration })),
)
const SecurityCameras = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.SecurityCameras })),
)
const MobileDeviceManagement = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.MobileDeviceManagement })),
)
const DocumentManagement = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DocumentManagement })),
)
const DocumentOCR = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DocumentOCR })),
)
const DataImportExport = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DataImportExport })),
)
const DataBackup = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DataBackup })),
)
const DigitalSignage = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DigitalSignage })),
)

// organization / multi-site (W4-A)
const FranchiseManagement = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.FranchiseManagement })),
)
const GlobalizationLayer = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.GlobalizationLayer })),
)
const MultiLocationDashboard = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.MultiLocationDashboard })),
)

// communications (W4-B)
const Chat = lazy(() =>
  import('@/screens/comms/CommunicationScreens').then((m) => ({ default: m.Chat })),
)
const SupportChatDashboard = lazy(() =>
  import('@/screens/comms/CommunicationScreens').then((m) => ({ default: m.SupportChatDashboard })),
)

// marketing (W4-B)
const MarketingHub = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.MarketingHub })),
)
const MarketingAutomation = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.MarketingAutomation })),
)
const EmailMarketing = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.EmailMarketing })),
)
const SocialMediaIntegration = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.SocialMediaIntegration })),
)
const SocialMediaMonitoring = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.SocialMediaMonitoring })),
)
const GoogleBusinessProfile = lazy(() =>
  import('@/screens/marketing/MarketingScreens').then((m) => ({ default: m.GoogleBusinessProfile })),
)

// reporting & BI (W4-B)
const BusinessIntelligence = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.BusinessIntelligence })),
)
const BIDashboard = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.BIDashboard })),
)
const BusinessHeatmaps = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.BusinessHeatmaps })),
)
const ProfitAnalysis = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.ProfitAnalysis })),
)
const KPIDashboard = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.KPIDashboard })),
)
const ProductivityTracker = lazy(() =>
  import('@/screens/reporting/ReportingScreens').then((m) => ({ default: m.ProductivityTracker })),
)

// emerging tech (W4-B)
const EmergingTechnologies = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.EmergingTechnologies })),
)
const NextGenTechnologies = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.NextGenTechnologies })),
)
const IoTDashboard = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.IoTDashboard })),
)
const EdgeComputing = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.EdgeComputing })),
)
const DigitalTwinViewer = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.DigitalTwinViewer })),
)
const DroneInspection = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.DroneInspection })),
)
const ARRepairGuide = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.ARRepairGuide })),
)
const AROverlay = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.AROverlay })),
)
const VRShowroom = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.VRShowroom })),
)
const BlockchainServiceHistory = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.BlockchainServiceHistory })),
)
const SmartContracts = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.SmartContracts })),
)
const QuantumComputing = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.QuantumComputing })),
)
const SustainableEnergyMonitoring = lazy(() =>
  import('@/screens/emerging/EmergingTechScreens').then((m) => ({ default: m.SustainableEnergyMonitoring })),
)

// productivity (W4-B)
const Tasks = lazy(() =>
  import('@/screens/productivity/ProductivityScreens').then((m) => ({ default: m.Tasks })),
)
const TaskManagement = lazy(() =>
  import('@/screens/productivity/ProductivityScreens').then((m) => ({ default: m.TaskManagement })),
)
const Tools = lazy(() =>
  import('@/screens/productivity/ProductivityScreens').then((m) => ({ default: m.Tools })),
)
const DashboardWidgets = lazy(() =>
  import('@/screens/productivity/ProductivityScreens').then((m) => ({ default: m.DashboardWidgets })),
)
const SalesGuide = lazy(() =>
  import('@/screens/productivity/ProductivityScreens').then((m) => ({ default: m.SalesGuide })),
)

// enterprise (W4-B)
const WearableIntegration = lazy(() =>
  import('@/screens/enterprise/EnterpriseScreens').then((m) => ({ default: m.WearableIntegration })),
)

// network & supply (W4-B)
const Suppliers = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.Suppliers })),
)
const PurchaseOrders = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.PurchaseOrders })),
)
const VendorSupplierPortal = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.VendorSupplierPortal })),
)
const PartsMarketplace = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.PartsMarketplace })),
)
const DynamicPricing = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.DynamicPricing })),
)
const IntelligentPriceOptimizer = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.IntelligentPriceOptimizer })),
)
const PartsNetworkDashboard = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.PartsNetworkDashboard })),
)
const MyNetworkRequests = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.MyNetworkRequests })),
)
const IncomingNetworkRequests = lazy(() =>
  import('@/screens/network/NetworkScreens').then((m) => ({ default: m.IncomingNetworkRequests })),
)

// procurement / purchase agent (W4-B)
const PurchaseAgentDashboard = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.PurchaseAgentDashboard })),
)
const ProcurementTasks = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.ProcurementTasks })),
)
const Quotations = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.Quotations })),
)
const SupplierPayments = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.SupplierPayments })),
)
const Deliveries = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.Deliveries })),
)
const AgentOrders = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.AgentOrders })),
)
const AgentSuppliers = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.AgentSuppliers })),
)
const AgentInventoryView = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.AgentInventoryView })),
)
const PriceComparison = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.PriceComparison })),
)
const ShipmentTracking = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.ShipmentTracking })),
)
const ProcurementReports = lazy(() =>
  import('@/screens/procurement/ProcurementScreens').then((m) => ({ default: m.ProcurementReports })),
)

/** Real implementations for spec-screen routes. When a route is listed here,
 *  it takes priority over the generic FeatureScreenView placeholder. */
const SPEC_CUSTOM_SCREENS: Record<string, React.ComponentType> = {
  // hr & payroll
  '/hr-management': HRManagement,
  '/staff-directory': StaffDirectory,
  '/staff-scheduling': StaffScheduling,
  '/staff-performance-review': StaffPerformanceReview,
  '/timesheet-management': TimesheetManagement,
  '/timeclock-payroll': TimeclockPayroll,
  '/payroll-management': PayrollManagement,
  '/leave-requests': LeaveRequests,
  '/training-lms': TrainingLMS,
  // insurance / warranty / contracts
  '/insurance-claims': InsuranceClaims,
  '/warranty-management': WarrantyManagement,
  '/contract-management': ContractManagement,
  // fleet / loaner / towing
  '/fleet-tracking': FleetTracking,
  '/loaner-vehicles': LoanerVehicles,
  '/towing-assistance': TowingAssistance,
  '/towing-services': TowingServices,
  // settings
  '/system-settings': SystemSettings,
  '/user-settings': UserSettings,
  '/security-settings': SecuritySettings,
  '/financial-settings': FinancialSettings,
  '/zatca-settings': ZATCASettings,
  '/vat-settings': VATSettings,
  '/zakat-settings': ZakatSettings,
  // admin / compliance
  '/user-profile': UserProfile,
  '/role-management': RoleManagement,
  '/compliance-management': ComplianceManagement,
  '/safety-incidents': SafetyIncidents,
  '/environmental-compliance': EnvironmentalCompliance,
  '/iso-quality-management': ISOQualityManagement,
  '/equipment-calibration': EquipmentCalibration,
  // system / infrastructure
  '/notifications': NotificationsScreen,
  '/accounting-integration': AccountingIntegration,
  '/sms-integration': SMSIntegration,
  '/security-cameras': SecurityCameras,
  '/mobile-device-management': MobileDeviceManagement,
  '/document-management': DocumentManagement,
  '/document-ocr': DocumentOCR,
  '/data-import-export': DataImportExport,
  '/data-backup': DataBackup,
  '/digital-signage': DigitalSignage,
  // organization / multi-site
  '/franchise-management': FranchiseManagement,
  '/globalization-layer': GlobalizationLayer,
  '/multi-location-dashboard': MultiLocationDashboard,
  // communications
  '/chat': Chat,
  '/support-chat-dashboard': SupportChatDashboard,
  // marketing
  '/marketing-hub': MarketingHub,
  '/marketing-automation': MarketingAutomation,
  '/email-marketing-campaigns': EmailMarketing,
  '/social-media-integration': SocialMediaIntegration,
  '/social-media-monitoring': SocialMediaMonitoring,
  '/google-my-business': GoogleBusinessProfile,
  // reporting & BI
  '/business-intelligence': BusinessIntelligence,
  '/business-intelligence-dashboard': BIDashboard,
  '/business-heatmaps': BusinessHeatmaps,
  '/profit-analysis': ProfitAnalysis,
  '/kpi-dashboard': KPIDashboard,
  '/productivity-tracker': ProductivityTracker,
  // emerging tech
  '/emerging-technologies': EmergingTechnologies,
  '/next-gen-technologies': NextGenTechnologies,
  '/io-t-dashboard': IoTDashboard,
  '/edge-computing': EdgeComputing,
  '/digital-twin-viewer': DigitalTwinViewer,
  '/drone-inspection': DroneInspection,
  '/ar-repair-guide': ARRepairGuide,
  '/ar-overlay': AROverlay,
  '/vr-showroom': VRShowroom,
  '/blockchain-service-history': BlockchainServiceHistory,
  '/smart-contracts': SmartContracts,
  '/quantum-computing': QuantumComputing,
  '/sustainable-energy-monitoring': SustainableEnergyMonitoring,
  // productivity
  '/tasks': Tasks,
  '/task-management': TaskManagement,
  '/tools': Tools,
  '/dashboard-widgets': DashboardWidgets,
  '/sales-guide': SalesGuide,
  // enterprise
  '/wearable-integration': WearableIntegration,
  // network & supply
  '/suppliers': Suppliers,
  '/purchase-orders': PurchaseOrders,
  '/vendor-supplier-portal': VendorSupplierPortal,
  '/parts-marketplace': PartsMarketplace,
  '/dynamic-pricing': DynamicPricing,
  '/intelligent-price-optimizer': IntelligentPriceOptimizer,
  '/parts-network-dashboard': PartsNetworkDashboard,
  '/parts-network-my-requests': MyNetworkRequests,
  '/parts-network-incoming-requests': IncomingNetworkRequests,
  // procurement / purchase agent
  '/purchase-agent-dashboard': PurchaseAgentDashboard,
  '/purchase-agent-tasks': ProcurementTasks,
  '/purchase-agent-quotations': Quotations,
  '/purchase-agent-payments': SupplierPayments,
  '/purchase-agent-delivery': Deliveries,
  '/purchase-agent-orders': AgentOrders,
  '/purchase-agent-suppliers': AgentSuppliers,
  '/purchase-agent-inventory': AgentInventoryView,
  '/purchase-agent-price-compare': PriceComparison,
  '/purchase-agent-tracking': ShipmentTracking,
  '/purchase-agent-reports': ProcurementReports,
}

export default function SpecScreenResolver() {
  const { pathname } = useLocation()
  const spec = useMemo(() => specByRoute.get(pathname), [pathname])

  if (!spec) return <Navigate to="/error404" replace />

  const Custom = SPEC_CUSTOM_SCREENS[spec.route]
  const def = FEATURE_DEF_BY_ROUTE.get(spec.route)
  return (
    <RequireAccess screen={spec.name}>
      {Custom ? (
        <Custom />
      ) : def ? (
        <FeatureScreenView def={def} />
      ) : (
        <PendingScreen
          screen={{
            name: spec.title,
            route: spec.route,
            hasMobile: false,
            purpose: spec.purpose,
          }}
          specId={spec.id}
        />
      )}
    </RequireAccess>
  )
}
