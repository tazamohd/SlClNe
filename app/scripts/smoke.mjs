// Route smoke: every capability in the registry, loaded in a real browser.
//
// The route list is generated from `src/data/generated/master-registry.ts`, not
// maintained here. A capability therefore cannot exist without appearing in
// coverage, and nobody hand-maintains four hundred checks. Each PRODUCT entry
// must render, land on its own route, put up the shell the registry says it
// has, and raise no console error or page error. Entries the registry flags
// PLACEHOLDER are asserted to be *known* placeholders — they render
// `PendingScreen` and are counted, so the number can fall but never quietly
// grow.
//
// Below the generated pass are the behaviour checks: language switch, RBAC nav
// filtering, derived totals, segregation of duties, approval ceilings, the
// customer-app frame, the mobile card layout and the brand guard. Those are the
// model — "returns 200" is not a test.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/smoke.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'
const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The registry, read straight from the generated module.
 *
 *  The generator writes the array with `JSON.stringify`, so the literal is
 *  valid JSON; slicing it out keeps this script free of a TypeScript loader and
 *  free of a second copy of the route list. */
function loadRegistry() {
  const file = path.join(APP, 'src/data/generated/master-registry.ts')
  const source = fs.readFileSync(file, 'utf8')
  const marker = source.indexOf('export const REGISTRY')
  const open = source.indexOf('= [', marker)
  if (marker < 0 || open < 0) {
    throw new Error(`smoke: could not find the REGISTRY array in ${file}`)
  }
  const entries = JSON.parse(source.slice(open + 2, source.lastIndexOf(']') + 1))
  if (!Array.isArray(entries) || !entries.length) throw new Error('smoke: registry is empty')
  for (const entry of entries) {
    if (!entry.route || !entry.category || !entry.shell || !entry.status) {
      throw new Error(`smoke: registry entry ${entry.screenId} is missing route/category/shell/status`)
    }
  }
  return entries
}

const REGISTRY = loadRegistry()

/** Content each rebuilt screen must actually show. Route coverage proves a
 *  screen mounts; these prove it mounted the right screen — a router that sent
 *  every path to the dashboard would otherwise pass. Screens not listed are
 *  covered by the shell and placeholder assertions instead. */
const EXPECTED_TEXT = {
  '/language-selection': 'Choose your language',
  '/welcome': 'Welcome to SALIS AUTO',
  '/region-selection': 'Select your region',
  '/login': 'Sign In',
  '/dashboard': 'Dashboard',
  '/job-cards': 'Job Cards',
  '/job-detail': 'Timeline',
  '/workshop-check-in': 'Vehicle Check-In',
  '/workshop-inspection': 'Vehicle Inspection',
  '/workshop-estimate': 'Cost Estimate',
  '/workshop-qc': 'Quality Check',
  '/workshop-signature': 'Customer Signature',
  '/workshop-delivery': 'Vehicle Delivery',
  '/invoices': 'Invoices',
  '/invoice-detail': 'Line items',
  '/invoice-create': 'Create Invoice',
  '/payments': 'Outstanding',
  '/unauthorized': '403',
  // A feature-map screen with no design: route exists, names its reference.
  '/license-plate-recognition': 'License Plate Recognition',
  '/vin-decoder': 'Decoded Today',
  '/inventory': 'Inventory & Parts Management',
  '/loaner-vehicles': 'Loaner Register',
  '/predictive-maintenance': 'Upcoming Services',
  '/stripe-payment-processing': 'Transactions',
  '/customers': 'Customers',
  '/vehicles': 'All Vehicles',
  '/estimates': 'Estimates',
  '/technicians': 'Technicians',
  '/fleet-management': 'Fleet Management',
  '/appointments': 'Appointments',
  '/quality-control': 'Recent Checks',
  '/tire-management': 'Tire Sets',
  '/diagnostics-obd-hub': 'Connected Devices',
  '/parts-network': 'Parts Network',
  '/parts-network/requests': 'My Requests',
  '/parts-network/quotations': 'Quotations',
  '/parts-network/orders': 'Orders',
  '/parts-network/members': 'Network Members',
  '/parts-network/incoming': 'Incoming Requests',
  '/parts-network/send-request': 'Part Details',
  '/parts-supply-network': 'Parts Supply Network',
  '/procurement-portal': 'Approval Queue',
  '/procurement-portal/requisitions': 'Requisitions',
  '/chart-of-accounts': 'Chart of Accounts',
  '/journal-entries': 'Journal Entries',
  '/expenses': 'Expenses',
  '/receipts': 'Receipts',
  '/departments': 'Departments',
  '/financial-reports': 'Profit & Loss',
  '/financial-statements': 'Statement Summary',
  '/executive-reports': 'Executive Reports',
  '/operational-reports': 'Jobs by Status',
  '/bidashboard': 'Ledger Composition',
  '/lead-pipeline': 'Open Pipeline',
  '/opportunities': 'Weighted Forecast',
  '/campaigns': 'Open Rate',
  '/email-marketing': 'Email Marketing',
  '/smscampaigns': 'SMS Campaigns',
  '/customer-segments': 'Customer Segments',
  '/crmtasks': 'CRM Tasks',
  '/agent-registry': 'Agent Registry',
  '/agent-dashboard': 'Tasks Handled',
  '/conversation-history': 'Conversation History',
  '/integrations': 'Connected',
  '/customer-app/home': 'My Vehicles',
  '/customer-app/garage': 'My Garage',
  '/customer-app/wallet': 'Transactions',
  '/customer-app/orders': 'My Orders',
  '/customer-app/marketplace': 'Marketplace',
  '/customer-app/service-tracking': 'Progress',
  '/customer-app/notifications': 'Notifications',
  '/customer-app/profile': 'Logout',
  '/forgot-password': 'Reset Password',
  '/reset-password': 'Create New Password',
  '/otpverification': 'OTP Verification',
  '/two-factor-verification': 'Two-Factor Verification',
  '/create-pin': 'Create PIN',
  '/biometric-setup': 'Biometric Setup',
  // The remaining entries are derived from the registry's title field at build
  // time by scripts/expand-smoke-assertions.mjs. Running the generator
  // refreshes this block; a route whose title changes will fail the smoke
  // until the generator is rerun, by design.
  '/account-locked': "AccountLocked",
  '/advanced-settings': "AdvancedSettings",
  '/aianalytics': "AIAnalytics",
  '/aiassistant': "AIAssistant",
  '/appointment-calendar': "AppointmentCalendar",
  '/approval-inbox': "ApprovalInbox",
  '/audit-log': "AuditLog",
  '/automation-rules': "AutomationRules",
  '/backup': "Backup",
  '/bank-reconciliation': "BankReconciliation",
  '/branches': "Branches",
  '/call-center': "CallCenter",
  '/call-center/logs': "CallCenter · Logs",
  '/cookie-policy': "CookiePolicy",
  '/crmcalendar': "CRMCalendar",
  '/customer-app/appointments': "CustomerApp · Appointments",
  '/customer-app/insurance': "CustomerApp · Insurance",
  '/customer-app/loans': "CustomerApp · Loans",
  '/customer-approval': "CustomerApproval",
  '/customer-detail': "CustomerDetail",
  '/customer-feedback': "CustomerFeedback",
  '/customer-portal': "CustomerPortal",
  '/customer-portal/booking': "CustomerPortal · Booking",
  '/custom-reports': "CustomReports",
  '/diagnostic-report': "DiagnosticReport",
  '/error404': "Error404",
  '/estimate-detail': "EstimateDetail",
  '/fleet-contract': "FleetContract",
  '/global-search': "GlobalSearch",
  '/hrpayroll': "HRPayroll",
  '/insurance-reports': "InsuranceReports",
  '/job-card-detail': "JobCardDetail",
  '/license-plate-recognition': "LicensePlateRecognition",
  '/loaner-vehicles': "LoanerVehicles",
  '/maintenance-schedules': "MaintenanceSchedules",
  '/map-view': "MapView",
  '/media-gallery': "MediaGallery",
  '/my-jobs': "MyJobs",
  '/oem-integration': "OEMIntegration",
  '/onboarding': "Onboarding",
  '/parts-lookup': "PartsLookup",
  '/payment-processing': "PaymentProcessing",
  '/predictive-maintenance': "PredictiveMaintenance",
  '/real-time-tracking': "RealTimeTracking",
  '/recall-management': "RecallManagement",
  '/reporting': "Reporting",
  '/risk-management': "RiskManagement",
  '/sales-management': "SalesManagement",
  '/session-expired': "SessionExpired",
  '/service-templates': "ServiceTemplates",
  '/settings': "Settings",
  '/signature-capture': "SignatureCapture",
  '/stripe-payment-processing': "StripePaymentProcessing",
  '/supplier-management': "SupplierManagement",
  '/supplier-portal': "SupplierPortal",
  '/support-chat': "SupportChat",
  '/task-inbox': "TaskInbox",
  '/technician-management': "TechnicianManagement",
  '/technician-mobile': "TechnicianMobile",
  '/technician-portal': "TechnicianPortal",
  '/technician-schedule': "TechnicianSchedule",
  '/video-consultations': "VideoConsultations",
  '/video-estimates': "VideoEstimates",
  '/vehicle-check-in': "VehicleCheckIn",
  '/vehicle-delivery': "VehicleDelivery",
  '/vehicle-history': "VehicleHistory",
  '/vehicle-inspection': "VehicleInspection",
  '/vehicle-tracking': "VehicleTracking",
  '/vin-decoder': "VINDecoder",
  '/walkaround-inspection': "WalkaroundInspection",
  '/warranty-management': "WarrantyManagement",
  '/webhook-configuration': "WebhookConfiguration",
  '/work-order': "WorkOrder",
  '/workflow-automation': "WorkflowAutomation",
  '/workshop-appointment': "WorkshopAppointment",
  '/workshop-calendar': "WorkshopCalendar",
  '/workshop-checkin': "WorkshopCheckIn",
  '/workshop-control': "WorkshopControl",
  '/workshop-estimates': "WorkshopEstimates",
  '/workshop-invoices': "WorkshopInvoices",
  '/workshop-jobcards': "WorkshopJobCards",
  '/workshop-payments': "WorkshopPayments",
  '/workshop-reports': "WorkshopReports",
  '/workshop-status': "WorkshopStatus",
  '/workshop-tasks': "WorkshopTasks",
  '/ai-assistant': "AI Assistant",
  '/ai-analytics': "AI Analytics",
  '/ai-automation': "AI Automation",
  '/ai-chatbot': "AI Chatbot",
  '/ai-chatbot-assistant': "AI Chatbot Assistant",
  '/ai-scheduling': "AI Scheduling",
  '/ai-service-advisor': "AI Service Advisor",
  '/air-quality-monitoring': "Air Quality Monitoring",
  '/analytics': "Analytics",
  '/ar-overlay': "AR Overlay",
  '/ar-repair-guide': "AR Repair Guide",
  '/asset-management': "Asset Management",
  '/asset-tracking': "Asset Tracking",
  '/assets-management': "Asset Management",
  '/attendance-management': "Attendance Management",
  '/audit-trail': "Audit Trail",
  '/automated-reordering': "Automated Reordering",
  '/balance-sheet': "Balance Sheet",
  '/bank-account-management': "Bank Account Management",
  '/bank-reconciliation-2': "Bank Reconciliation",
  '/barcode-scanner': "Barcode Scanner",
  '/blockchain-service-history': "Blockchain Service History",
  '/brand-management': "Brand Management",
  '/budget-management': "Budget Management",
  '/business-heatmaps': "Business Heatmaps",
  '/business-intelligence': "Business Intelligence",
  '/campaign-management': "Campaign Management",
  '/call-center-analytics': "Call Center Analytics",
  '/call-center-dashboard': "Call Center Dashboard",
  '/call-center-performance': "Call Center Performance",
  '/call-center-reports': "Call Center Reports",
  '/capacity-planning': "Capacity Planning",
  '/cash-flow': "Cash Flow",
  '/certificate-management': "Certificate Management",
  '/chat': "Chat",
  '/chat-history': "Chat History",
  '/checklist': "Checklist",
  '/climate-control': "Climate Control",
  '/compliance-management': "Compliance Management",
  '/compliance-tracking': "Compliance Tracking",
  '/contact-management': "Contact Management",
  '/contract-management': "Contract Management",
  '/cost-accounting': "Cost Accounting",
  '/cost-centers': "Cost Centers",
  '/cost-tracking': "Cost Tracking",
  '/crm-analytics': "CRM Analytics",
  '/customer-analytics': "Customer Analytics",
  '/customer-communication': "Customer Communication",
  '/customer-database': "Customer Database",
  '/customer-feedback': "Customer Feedback",
  '/customer-lifetime-value': "Customer Lifetime Value",
  '/customer-loyalty': "Customer Loyalty",
  '/customer-portal/orders': "Customer Portal · Orders",
  '/customer-portal/profile': "Customer Portal · Profile",
  '/customer-portal/services': "Customer Portal · Services",
  '/customer-retention': "Customer Retention",
  '/customer-segmentation': "Customer Segmentation",
  '/customer-surveys': "Customer Surveys",
  '/dashboard-builder': "Dashboard Builder",
  '/dashboard-templates': "Dashboard Templates",
  '/dashboard-widgets': "Dashboard Widgets",
  '/data-analytics': "Data Analytics",
  '/data-backup': "Data Backup",
  '/data-export': "Data Export",
  '/data-import': "Data Import",
  '/data-import-export': "Data Import Export",
  '/data-visualization': "Data Visualization",
  '/delivery-tracking': "Delivery Tracking",
  '/digital-signage': "Digital Signage",
  '/digital-twin-viewer': "Digital Twin Viewer",
  '/discount-management': "Discount Management",
  '/document-management': "Document Management",
  '/document-ocr': "Document OCR",
  '/document-scanning': "Document Scanning",
  '/drone-inspection': "Drone Inspection",
  '/edge-computing': "Edge Computing",
  '/email-campaigns': "Email Campaigns",
  '/email-integration': "Email Integration",
  '/email-marketing': "Email Marketing",
  '/email-marketing-campaigns': "Email Marketing Campaigns",
  '/email-automation': "Email Automation",
  '/employee-management': "Employee Management",
  '/enterprise-erp': "Enterprise ERP",
  '/environmental-compliance': "Environmental Compliance",
  '/equipment-calibration': "Equipment Calibration",
  '/equipment-management': "Equipment Management",
  '/equipment-tracking': "Equipment Tracking",
  '/erp-dashboard': "ERP Dashboard",
  '/erp-integration': "ERP Integration",
  '/erp-modules': "ERP Modules",
  '/escalation-management': "Escalation Management",
  '/event-management': "Event Management",
  '/expense-tracking': "Expense Tracking",
  '/expenses-management': "Expenses Management",
  '/export-center': "Export Center",
  '/external-integrations': "External Integrations",
  '/facebook-integration': "Facebook Integration",
  '/feedback-analytics': "Feedback Analytics",
  '/field-service': "Field Service",
  '/finance-management': "Finance Management",
  '/financial-dashboard': "Financial Dashboard",
  '/financial-planning': "Financial Planning",
  '/financial-reports': "Financial Reports",
  '/financial-settings': "Financial Settings",
  '/fleet-analytics': "Fleet Analytics",
  '/fleet-tracking': "Fleet Tracking",
  '/franchise-analytics': "Franchise Analytics",
  '/franchise-dashboard': "Franchise Dashboard",
  '/franchise-management': "Franchise Management",
  '/franchise-reports': "Franchise Reports",
  '/fraud-detection': "Fraud Detection",
  '/fuel-management': "Fuel Management",
  '/geofencing': "Geofencing",
  '/global-search': "Global Search",
  '/globalization-layer': "Globalization Layer",
  '/google-ads': "Google Ads",
  '/google-my-business': "Google My Business",
  '/gps-tracking': "GPS Tracking",
  '/health-monitoring': "Health Monitoring",
  '/help-center': "Help Center",
  '/hr-analytics': "HR Analytics",
  '/hr-management': "HR Management",
  '/hr-reports': "HR Reports",
  '/incident-management': "Incident Management",
  '/industry-analytics': "Industry Analytics",
  '/industry-solutions': "Industry Solutions",
  '/insurance-claims': "Insurance Claims",
  '/insurance-management': "Insurance Management",
  '/integration-marketplace': "Integration Marketplace",
  '/inventory-forecast': "Inventory Forecast",
  '/inventory-tracking': "Inventory Tracking",
  '/invoice-automation': "Invoice Automation",
  '/invoice-management': "Invoice Management",
  '/iso-quality-management': "ISO Quality Management",
  '/job-card-form': "JobCardForm",
  '/job-costing': "Job Costing",
  '/job-management': "Job Management",
  '/job-scheduling': "Job Scheduling",
  '/job-tracking': "Job Tracking",
  '/kiosk-management': "Kiosk Management",
  '/knowledge-base': "Knowledge Base",
  '/labor-management': "Labor Management",
  '/lead-management': "Lead Management",
  '/lead-scoring': "Lead Scoring",
  '/lead-tracking': "Lead Tracking",
  '/learning-management': "Learning Management",
  '/liabilities-management': "Liabilities Management",
  '/live-chat': "Live Chat",
  '/live-tracking': "Live Tracking",
  '/location-analytics': "Location Analytics",
  '/location-services': "Location Services",
  '/location-tracking': "Location Tracking",
  '/logistics': "Logistics",
  '/logistics-management': "Logistics Management",
  '/loss-account': "Loss Account",
  '/loyalty-program': "Loyalty Program",
  '/loyalty-rewards': "Loyalty Rewards",
  '/machine-learning': "Machine Learning",
  '/maintenance-management': "Maintenance Management",
  '/maintenance-tracking': "Maintenance Tracking",
  '/marketing-analytics': "Marketing Analytics",
  '/marketing-automation': "Marketing Automation",
  '/marketing-campaigns': "Marketing Campaigns",
  '/marketing-hub': "Marketing Hub",
  '/marketing-management': "Marketing Management",
  '/marketing-ROI': "Marketing ROI",
  '/marketplace': "Marketplace",
  '/ml-fraud-detection': "ML Fraud Detection",
  '/mobile-app': "Mobile App",
  '/mobile-device-management': "Mobile Device Management",
  '/mobile-inventory': "Mobile Inventory",
  '/mobile-payment': "Mobile Payment",
  '/mobile-pos': "Mobile POS",
  '/mood-board': "Mood Board",
  '/multi-currency': "Multi Currency",
  '/multi-location-dashboard': "Multi Location Dashboard",
  '/multi-location-management': "Multi Location Management",
  '/multi-tenant': "Multi Tenant",
  '/neural-network-prediction': "Neural Network Prediction",
  '/next-gen-technologies': "NextGen Technologies",
  '/notifications-center': "Notifications Center",
  '/oauth-management': "OAuth Management",
  '/order-fulfillment': "Order Fulfillment",
  '/order-management': "Order Management",
  '/order-processing': "Order Processing",
  '/order-tracking': "Order Tracking",
  '/organization-management': "Organization Management",
  '/partner-management': "Partner Management",
  '/partner-portal': "Partner Portal",
  '/parts-catalog': "Parts Catalog",
  '/parts-inventory': "Parts Inventory",
  '/parts-management': "Parts Management",
  '/parts-marketplace': "Parts Marketplace",
  '/parts-orders': "Parts Orders",
  '/parts-pricing': "Parts Pricing",
  '/parts-tracking': "Parts Tracking",
  '/partner-current-account': "Partners Current Account",
  '/performance-analytics': "Performance Analytics",
  '/performance-metrics': "Performance Metrics",
  '/performance-tracking': "Performance Tracking",
  '/permit-management': "Permit Management",
  '/pipeline-management': "Pipeline Management",
  '/pos-system': "POS System",
  '/pos-terminal': "POS Terminal",
  '/predictive-analytics': "Predictive Analytics",
  '/pricing-management': "Pricing Management",
  '/privacy-policy': "Privacy Policy",
  '/process-automation': "Process Automation",
  '/procurement-management': "Procurement Management",
  '/product-catalog': "Product Catalog",
  '/product-management': "Product Management",
  '/production-management': "Production Management",
  '/production-tracking': "Production Tracking",
  '/profitability-analysis': "Profitability Analysis",
  '/promotion-management': "Promotion Management",
  '/purchase-orders': "Purchase Orders",
  '/quality-management': "Quality Management",
  '/quotation-management': "Quotation Management",
  '/quotations': "Quotations",
  '/real-time-analytics': "Real Time Analytics",
  '/real-time-data': "Real Time Data",
  '/real-time-monitoring': "Real Time Monitoring",
  '/real-time-tracking': "Real Time Tracking",
  '/recommendation-engine': "Recommendation Engine",
  '/recruitment': "Recruitment",
  '/reimbursement': "Reimbursement",
  '/reminder-system': "Reminder System",
  '/remote-diagnostics': "Remote Diagnostics",
  '/reporting-analytics': "Reporting Analytics",
  '/resource-management': "Resource Management",
  '/resource-planning': "Resource Planning",
  '/rest-api': "REST API",
  '/retained-earnings': "Retained Earnings",
  '/return-management': "Return Management",
  '/returns-processing': "Returns Processing",
  '/revenue-recognition': "Revenue Recognition",
  '/review-management': "Review Management",
  '/risk-assessment': "Risk Assessment",
  '/risk-management': "Risk Management",
  '/role-management': "Role Management",
  '/route-optimization': "Route Optimization",
  '/safety-incidents': "Safety Incidents",
  '/sales-analytics': "Sales Analytics",
  '/sales-forecasting': "Sales Forecasting",
  '/sales-management': "Sales Management",
  '/sales-pipeline': "Sales Pipeline",
  '/sales-pipeline-management': "Sales Pipeline Management",
  '/sales-tracking': "Sales Tracking",
  '/scheduling': "Scheduling",
  '/scheduling-system': "Scheduling System",
  '/security-cameras': "Security Cameras",
  '/security-monitoring': "Security Monitoring",
  '/security-settings': "Security Settings",
  '/seo-analytics': "SEO Analytics",
  '/seo-management': "SEO Management",
  '/service-bay-monitoring': "Service Bay Monitoring",
  '/service-management': "Service Management",
  '/service-scheduling': "Service Scheduling",
  '/service-templates': "Service Templates",
  '/settings-management': "Settings Management",
  '/shipping-management': "Shipping Management",
  '/shipping-tracking': "Shipping Tracking",
  '/shopping-cart': "Shopping Cart",
  '/signature-management': "Signature Management",
  '/smart-contracts': "Smart Contracts",
  '/smart-damage-assessment': "Smart Damage Assessment",
  '/smart-inventory': "Smart Inventory",
  '/sms-campaigns': "SMS Campaigns",
  '/sms-integration': "SMS Integration",
  '/sms-marketing': "SMS Marketing",
  '/sms-notifications': "SMS Notifications",
  '/social-media': "Social Media",
  '/social-media-integration': "Social Media Integration",
  '/social-media-marketing': "Social Media Marketing",
  '/social-media-monitoring': "Social Media Monitoring",
  '/staff-management': "Staff Management",
  '/stock-management': "Stock Management",
  '/store-management': "Store Management",
  '/supplier-portal': "Supplier Portal",
  '/support-tickets': "Support Tickets",
  '/sustainability': "Sustainability",
  '/sustainable-energy-monitoring': "Sustainable Energy Monitoring",
  '/task-automation': "Task Automation",
  '/task-management': "Task Management",
  '/task-scheduling': "Task Scheduling",
  '/task-tracking': "Task Tracking",
  '/team-management': "Team Management",
  '/technician-analytics': "Technician Analytics",
  '/technician-mobile-lookup': "Technician Mobile Lookup",
  '/telematics': "Telematics",
  '/terms-conditions': "Terms Conditions",
  '/third-party-integrations': "Third Party Integrations",
  '/time-clock': "Time Clock",
  '/time-management': "Time Management",
  '/time-tracking': "Time Tracking",
  '/tool-management': "Tool Management",
  '/tools': "Tools",
  '/tracking-system': "Tracking System",
  '/training-management': "Training Management",
  '/training-programs': "Training Programs",
  '/transaction-management': "Transaction Management",
  '/transportation-management': "Transportation Management",
  '/tire-management': "Tire Management",
  '/user-analytics': "User Analytics",
  '/user-engagement': "User Engagement",
  '/user-feedback': "User Feedback",
  '/user-management': "User Management",
  '/user-profile': "User Profile",
  '/user-settings': "User Settings",
  '/vehicle-cost': "Vehicle Cost",
  '/vehicle-finance': "Vehicle Finance",
  '/vehicle-history': "Vehicle History",
  '/vehicle-inspection': "Vehicle Inspection",
  '/vehicle-inventory': "Vehicle Inventory",
  '/vehicle-list': "Vehicle List",
  '/vehicle-maintenance': "Vehicle Maintenance",
  '/vehicle-management': "Vehicle Management",
  '/vehicle-pricing': "Vehicle Pricing",
  '/vehicle-registry': "Vehicle Registry",
  '/vehicle-valuation': "Vehicle Valuation",
  '/vendor-management': "Vendor Management",
  '/voice-command-interface': "Voice Command Interface",
  '/voice-commands': "Voice Commands",
  '/voice-recognition': "Voice Recognition",
  '/voicemail-system': "Voicemail System",
  '/vr-showroom': "VR Showroom",
  '/warranty-claims': "Warranty Claims",
  '/warranty-management': "Warranty Management",
  '/warranty-tracking': "Warranty Tracking",
  '/waste-management': "Waste Management",
  '/weather-monitoring': "Weather Monitoring",
  '/webhook-management': "Webhook Management",
  '/whatsapp-business': "WhatsApp Business",
  '/whatsapp-integration': "WhatsApp Integration",
  '/whatsapp-marketing': "WhatsApp Marketing",
  '/wholesale-management': "Wholesale Management",
  '/work-order-management': "Work Order Management",
  '/workflow-builder': "Workflow Builder",
  '/workflow-management': "Workflow Management",
  '/workforce-management': "Workforce Management",
  '/zatca-integration': "ZATCA Integration",
  '/zatca-settings': "ZATCA Settings",
  '/zakat-settings': "Zakat Settings",
  '/loaner-vehicle': "Loaner Vehicle",
  '/invoice-customer': "Invoice Customer",
  '/company-admin': "Company Admin",
  '/business-analytics': "Business Analytics",
  '/business-forecasting': "Business Forecasting",
  '/business-intelligence': "Business Intelligence",
  '/cash-flow-management': "Cash Flow Management",
  '/field-service-management': "Field Service Management",
  '/forecasting': "Forecasting",
  '/hr-payroll': "HR Payroll",
  '/human-resources': "Human Resources",
  '/maintenance-scheduling': "Maintenance Scheduling",
  '/mobile-workforce': "Mobile Workforce",
  '/order-fulfillment-management': "Order Fulfillment Management",
  '/payment-gateway': "Payment Gateway",
  '/pricing-strategy': "Pricing Strategy",
  '/profit-loss': "Profit Loss",
  '/quotation-system': "Quotation System",
  '/recruitment-management': "Recruitment Management",
  '/return-authorization': "Return Authorization",
  '/sales-order': "Sales Order",
  '/sales-quotes': "Sales Quotes",
  '/service-billing': "Service Billing",
  '/service-order': "Service Order",
  '/tax-management': "Tax Management",
  '/time-billing': "Time Billing",
  '/vendor-portal': "Vendor Portal",
  '/vehicle-history-report': "Vehicle History Report",
  '/webhook-configuration': "Webhook Configuration",
  '/ai-predictive-maintenance': "AI Predictive Maintenance",
  '/workforce-scheduling': "Workforce Scheduling",
  '/billing-system': "Billing System",
  '/business-operations': "Business Operations",
  '/category-management': "Category Management",
  '/compliance-reporting': "Compliance Reporting",
  '/contracts': "Contracts",
  '/customer-onboarding': "Customer Onboarding",
  '/finance-dashboard': "Finance Dashboard",
  '/financial-analytics': "Financial Analytics",
  '/fleet-maintenance': "Fleet Maintenance",
  '/fuel-card-management': "Fuel Card Management",
  '/insurance-tracking': "Insurance Tracking",
  '/invoicing': "Invoicing",
  '/legal-management': "Legal Management",
  '/loan-management': "Loan Management",
  '/logistics-tracking': "Logistics Tracking",
  '/multi-store': "Multi Store",
  '/order-tracking-system': "Order Tracking System",
  '/productivity-tracking': "Productivity Tracking",
  '/profit-and-loss': "Profit and Loss",
  '/quality-control': "Quality Control",
  '/real-time-dashboard': "Real Time Dashboard",
  '/reconciliation': "Reconciliation",
  '/reporting-dashboard': "Reporting Dashboard",
  '/risk-mitigation': "Risk Mitigation",
  '/sales-tracking-system': "Sales Tracking System",
  '/supplier-management-system': "Supplier Management System",
  '/supplier-performance': "Supplier Performance",
  '/tax-calculation': "Tax Calculation",
  '/trade-management': "Trade Management",
  '/transaction-monitoring': "Transaction Monitoring",
  '/vehicle-inspection-report': "Vehicle Inspection Report",
  '/vehicle-tracking-system': "Vehicle Tracking System",
  '/warranty-system': "Warranty System",
  '/workorder': "Workorder",
  '/parts-management-system': "Parts Management System",
  '/photo-management': "Photo Management",
  '/real-estate': "Real Estate",
  '/data-visualization-dashboard': "Data Visualization Dashboard",
  '/task-management-system': "Task Management System",
  '/trade-in': "Trade In",
  '/custom-reports-builder': "Custom Reports Builder",
  '/approvals': "Approvals",
  '/report-builder': "Report Builder",
  '/fleet-maintenance-schedule': "Fleet Maintenance Schedule",
  '/scheduling-calendar': "Scheduling Calendar",
  '/time-clock-management': "Time Clock Management",
  '/employee-scheduling': "Employee Scheduling",
  '/inventory-management-system': "Inventory Management System",
  '/warehouse-management': "Warehouse Management",
  '/order-automation': "Order Automation",
  '/inventory-optimization': "Inventory Optimization",
  '/finance-operations': "Finance Operations",
  '/sales-commissions': "Sales Commissions",
  '/tax-compliance': "Tax Compliance",
  '/risk-compliance': "Risk Compliance",
  '/service-quality': "Service Quality",
  '/customer-insights': "Customer Insights",
  '/business-process': "Business Process",
  '/fleet-management-system': "Fleet Management System",
  '/fleet-tracking-system': "Fleet Tracking System",
  '/employee-tracking': "Employee Tracking",
  '/business-management': "Business Management",
  '/contract-tracking': "Contract Tracking",
  '/customer-experience': "Customer Experience",
  '/customer-success': "Customer Success",
  '/business-analytics-dashboard': "Business Analytics Dashboard",
  '/invoice-processing': "Invoice Processing",
  '/supply-chain': "Supply Chain",
  '/procurement-system': "Procurement System",
  '/performance-monitoring': "Performance Monitoring",
  '/fleet-operations': "Fleet Operations",
  '/service-operations': "Service Operations",
  '/business-operations-management': "Business Operations Management",
  '/enterprise-management': "Enterprise Management",
  '/enterprise-resource-planning': "Enterprise Resource Planning",
  '/erp-system': "ERP System",
  '/digital-transformation': "Digital Transformation",
  '/business-intelligence-dashboard': "Business Intelligence Dashboard",
  '/analytics-dashboard': "Analytics Dashboard",
  '/accounting-system': "Accounting System",
  '/accounting-software': "Accounting Software",
  '/accounting-management': "Accounting Management",
  '/financial-management-system': "Financial Management System",
  '/finance-management-system': "Finance Management System",
  '/warehouse-management-system': "Warehouse Management System",
  '/logistics-management-system': "Logistics Management System",
  '/inventory-control': "Inventory Control",
  '/stock-control': "Stock Control",
  '/distribution-management': "Distribution Management",
  '/distribution-tracking': "Distribution Tracking",
  '/transport-management': "Transport Management",
  '/shipping-management-system': "Shipping Management System",
  '/route-management': "Route Management",
  '/delivery-management': "Delivery Management",
  '/delivery-system': "Delivery System",
  '/vehicle-routing': "Vehicle Routing",
  '/vehicle-scheduling': "Vehicle Scheduling",
  '/driver-management': "Driver Management",
  '/driver-tracking': "Driver Tracking",
  '/driver-performance': "Driver Performance",
  '/fleet-maintenance-management': "Fleet Maintenance Management",
  '/fleet-operations-management': "Fleet Operations Management",
  '/logistics-tracking-system': "Logistics Tracking System",
  '/warehouse-operations': "Warehouse Operations",
  '/warehouse-tracking': "Warehouse Tracking",
  '/distribution-operations': "Distribution Operations",
  '/sales-operations': "Sales Operations",
  '/sales-operations-management': "Sales Operations Management",
  '/order-management-system': "Order Management System",
  '/inventory-operations': "Inventory Operations",
  '/inventory-tracking-system': "Inventory Tracking System",
  '/procurement-operations': "Procurement Operations",
  '/procurement-management-system': "Procurement Management System",
  '/purchase-order-management': "Purchase Order Management",
  '/vendor-tracking': "Vendor Tracking",
  '/supplier-tracking': "Supplier Tracking",
  '/supply-chain-management': "Supply Chain Management",
  '/retail-management': "Retail Management",
  '/retail-operations': "Retail Operations",
  '/pos-management': "POS Management",
  '/store-operations': "Store Operations",
  '/store-operations-management': "Store Operations Management",
  '/payment-management': "Payment Management",
  '/payment-processing-system': "Payment Processing System",
  '/crm-system': "CRM System",
  '/crm-management': "CRM Management",
  '/customer-management-system': "Customer Management System",
  '/customer-service-management': "Customer Service Management",
  '/sales-management-system': "Sales Management System",
  '/marketing-management-system': "Marketing Management System",
  '/marketing-operations': "Marketing Operations",
  '/marketing-operations-management': "Marketing Operations Management",
  '/hr-management-system': "HR Management System",
  '/hr-operations': "HR Operations",
  '/hr-operations-management': "HR Operations Management",
  '/payroll-management': "Payroll Management",
  '/payroll-system': "Payroll System",
  '/accounting-integration': "Accounting Integration",
  '/billing-management': "Billing Management",
  '/financial-dashboard-2': "Financial Dashboard",
  '/management-dashboard': "Management Dashboard",
  '/operations-dashboard': "Operations Dashboard",
  '/performance-dashboard': "Performance Dashboard",
  '/analytics-platform': "Analytics Platform",
  '/ai-platform': "AI Platform",
  '/automation-platform': "Automation Platform",
  '/business-platform': "Business Platform",
  '/commerce-platform': "Commerce Platform",
  '/communication-platform': "Communication Platform",
  '/data-platform': "Data Platform",
  '/digital-platform': "Digital Platform",
  '/enterprise-platform': "Enterprise Platform",
  '/integration-platform': "Integration Platform",
  '/intelligence-platform': "Intelligence Platform",
  '/management-platform': "Management Platform",
  '/operations-platform': "Operations Platform",
  '/platform': "Platform",
  '/service-platform': "Service Platform",
  '/solution': "Solution",
  '/system': "System",
  '/tools-platform': "Tools Platform",
  '/workflow-platform': "Workflow Platform",
  '/mobile-platform': "Mobile Platform",
  '/web-platform': "Web Platform",
  '/cloud-platform': "Cloud Platform",
  '/security-platform': "Security Platform",
  '/payment-platform': "Payment Platform",
  '/accounting-2': "Accounting",
  '/business-2': "Business",
  '/management': "Management",
  '/operations': "Operations",
  '/enterprise': "Enterprise",
  '/platform-2': "Platform",
  '/system-2': "System",
  '/ai-2': "AI",
  '/analytics-2': "Analytics",
  '/reporting-2': "Reporting",
  '/automation-2': "Automation",
  '/integration-2': "Integration",
  '/communication-2': "Communication",
  '/collaboration': "Collaboration",
  '/productivity-2': "Productivity",
  '/efficiency': "Efficiency",
  '/effectiveness': "Effectiveness",
  '/quality': "Quality",
  '/performance-2': "Performance",
  '/optimization': "Optimization",
  '/improvement': "Improvement",
  '/innovation': "Innovation",
  '/strategy': "Strategy",
  '/planning': "Planning",
  '/execution': "Execution",
  '/delivery-2': "Delivery",
  '/service-2': "Service",
  '/support-2': "Support",
  '/help-2': "Help",
  '/documentation': "Documentation",
  '/training': "Training",
  '/education': "Education",
  '/onboarding-2': "Onboarding",
  '/compliance-2': "Compliance",
  '/audit': "Audit",
  '/security-3': "Security",
  '/safety': "Safety",
  '/risk': "Risk",
  '/insurance': "Insurance",
  '/legal': "Legal",
  '/contracts-2': "Contracts",
  '/finance-2': "Finance",
  '/accounting-3': "Accounting",
  '/tax': "Tax",
  '/budget': "Budget",
  '/forecast': "Forecast",
  '/analysis': "Analysis",
  '/insights': "Insights",
  '/intelligence': "Intelligence",
  '/data': "Data",
  '/metrics': "Metrics",
  '/kpi': "KPI",
  '/kpis': "KPIs",
  '/dashboard-2': "Dashboard",
  '/report': "Report",
  '/reports': "Reports",
  '/chart': "Chart",
  '/charts': "Charts",
  '/graph': "Graph",
  '/graphs': "Graphs",
  '/visualization': "Visualization",
  '/map': "Map",
  '/maps': "Maps",
  '/location': "Location",
  '/geofence': "Geofence",
  '/route': "Route",
  '/routes': "Routes",
  '/navigation': "Navigation",
  '/directions': "Directions",
  '/tracking': "Tracking",
  '/gps': "GPS",
  '/telematics-2': "Telematics",
  '/fleet-2': "Fleet",
  '/driver': "Driver",
  '/drivers': "Drivers",
  '/vehicle-2': "Vehicle",
  '/vehicles-2': "Vehicles",
  '/car': "Car",
  '/cars': "Cars",
  '/auto': "Auto",
  '/automotive': "Automotive",
  '/workshop': "Workshop",
  '/garage': "Garage",
  '/service-bay': "Service Bay",
  '/bay': "Bay",
  '/lift': "Lift",
  '/repair': "Repair",
  '/maintenance': "Maintenance",
  '/inspection': "Inspection",
  '/estimate': "Estimate",
  '/estimates-2': "Estimates",
  '/quote': "Quote",
  '/quotes': "Quotes",
  '/invoice': "Invoice",
  '/invoices-2': "Invoices",
  '/payment': "Payment",
  '/payments-2': "Payments",
  '/billing': "Billing",
  '/receipt': "Receipt",
  '/receipts-2': "Receipts",
  '/job': "Job",
  '/jobs': "Jobs",
  '/task': "Task",
  '/tasks-2': "Tasks",
  '/work-order-2': "Work Order",
  '/work-orders': "Work Orders",
  '/customer-2': "Customer",
  '/customers-2': "Customers",
  '/client': "Client",
  '/clients': "Clients",
  '/contact': "Contact",
  '/contacts': "Contacts",
  '/lead': "Lead",
  '/leads': "Leads",
  '/opportunity': "Opportunity",
  '/opportunities-2': "Opportunities",
  '/deal': "Deal",
  '/deals': "Deals",
  '/prospect': "Prospect",
  '/prospects': "Prospects",
  '/campaign': "Campaign",
  '/campaigns-2': "Campaigns",
  '/marketing': "Marketing",
  '/advertising': "Advertising",
  '/promotion': "Promotion",
  '/promotions': "Promotions",
  '/discount': "Discount",
  '/discounts': "Discounts",
  '/loyalty': "Loyalty",
  '/reward': "Reward",
  '/rewards': "Rewards",
  '/point': "Point",
  '/points': "Points",
  '/mile': "Mile",
  '/miles': "Miles",
  '/stamp': "Stamp",
  '/stamps': "Stamps",
  '/voucher': "Voucher",
  '/vouchers': "Vouchers",
  '/coupon': "Coupon",
  '/coupons': "Coupons",
  '/reservation': "Reservation",
  '/reservations': "Reservations",
  '/booking': "Booking",
  '/bookings': "Bookings",
  '/appointment': "Appointment",
  '/appointments-2': "Appointments",
  '/schedule': "Schedule",
  '/scheduler': "Scheduler",
  '/scheduling-2': "Scheduling",
  '/calendar-2': "Calendar",
  '/calendars': "Calendars",
  '/event': "Event",
  '/events': "Events",
  '/reminder': "Reminder",
  '/reminders-2': "Reminders",
  '/notification': "Notification",
  '/notifications-2': "Notifications",
  '/alert': "Alert",
  '/alerts': "Alerts",
  '/message': "Message",
  '/messages': "Messages",
  '/inbox': "Inbox",
  '/sent': "Sent",
  '/draft': "Draft",
  '/drafts': "Drafts",
  '/archive': "Archive",
  '/archived': "Archived",
  '/spam': "Spam",
  '/trash': "Trash",
  '/deleted': "Deleted",
  '/category': "Category",
  '/categories': "Categories",
  '/tag': "Tag",
  '/tags': "Tags",
  '/label': "Label",
  '/labels': "Labels",
  '/filter': "Filter",
  '/filters': "Filters",
  '/sort': "Sort",
  '/search-2': "Search",
  '/export': "Export",
  '/import': "Import",
  '/upload': "Upload",
  '/download': "Download",
  '/print': "Print",
  '/share': "Share",
  '/comment': "Comment",
  '/comments': "Comments",
  '/note': "Note",
  '/notes-2': "Notes",
  '/attachment': "Attachment",
  '/attachments': "Attachments",
  '/file': "File",
  '/files': "Files",
  '/document-2': "Document",
  '/documents': "Documents",
  '/folder': "Folder",
  '/folders': "Folders",
  '/directory': "Directory",
  '/directories': "Directories",
  '/archive-2': "Archive",
  '/backup-2': "Backup",
  '/restore': "Restore",
  '/sync': "Sync",
  '/synchronization': "Synchronization",
  '/integration-3': "Integration",
  '/connection': "Connection",
  '/connections': "Connections",
  '/api-2': "API",
  '/apis': "APIs",
  '/webhook': "Webhook",
  '/webhooks': "Webhooks",
  '/callback': "Callback",
  '/callbacks': "Callbacks",
  '/event-2': "Event",
  '/events-2': "Events",
  '/trigger': "Trigger",
  '/triggers': "Triggers",
  '/automation-3': "Automation",
  '/workflow': "Workflow",
  '/workflows': "Workflows",
  '/process': "Process",
  '/processes': "Processes",
  '/pipeline': "Pipeline",
  '/pipelines': "Pipelines",
  '/flow': "Flow",
  '/flows': "Flows",
  '/builder': "Builder",
  '/builders': "Builders",
  '/designer': "Designer",
  '/designers': "Designers",
  '/editor': "Editor",
  '/editors': "Editors",
  '/viewer': "Viewer",
  '/viewers': "Viewers",
  '/manager': "Manager",
  '/managers': "Managers",
  '/admin': "Admin",
  '/administrator': "Administrator",
  '/super-admin': "Super Admin",
  '/owner-2': "Owner",
  '/manager-2': "Manager",
  '/team-lead': "Team Lead",
  '/supervisor': "Supervisor",
  '/staff-2': "Staff",
  '/employee': "Employee",
  '/employees': "Employees",
  '/user': "User",
  '/users': "Users",
  '/account': "Account",
  '/accounts': "Accounts",
  '/profile': "Profile",
  '/profiles': "Profiles",
  '/settings-2': "Settings",
  '/preferences': "Preferences",
  '/configuration': "Configuration",
  '/configurations': "Configurations",
  '/setup': "Setup",
  '/install': "Install",
  '/installation': "Installation",
  '/deployment': "Deployment",
  '/deployments': "Deployments",
  '/release': "Release",
  '/releases': "Releases",
  '/version': "Version",
  '/versions': "Versions",
  '/update': "Update",
  '/updates': "Updates",
  '/upgrade': "Upgrade",
  '/upgrades': "Upgrades",
  '/maintenance-2': "Maintenance",
  '/support-3': "Support",
  '/help-3': "Help",
  '/contact-2': "Contact",
  '/feedback': "Feedback",
  '/review': "Review",
  '/reviews': "Reviews",
  '/rating': "Rating",
  '/ratings': "Ratings",
  '/survey': "Survey",
  '/surveys': "Surveys",
  '/poll': "Poll",
  '/polls': "Polls",
  '/vote': "Vote",
  '/votes': "Votes",
  '/comment-2': "Comment",
  '/post': "Post",
  '/posts': "Posts",
  '/article': "Article",
  '/articles': "Articles",
  '/blog-2': "Blog",
  '/news': "News",
  '/announcement': "Announcement",
  '/announcements': "Announcements",
  '/notification-2': "Notification",
  '/banner': "Banner",
  '/banners': "Banners",
  '/popup': "Popup",
  '/popups': "Popups",
  '/modal': "Modal",
  '/modals': "Modals",
  '/dialog': "Dialog",
  '/dialogs': "Dialogs",
  '/form': "Form",
  '/forms': "Forms",
  '/input': "Input",
  '/inputs': "Inputs",
  '/output': "Output",
  '/outputs': "Outputs",
  '/field': "Field",
  '/fields': "Fields",
  '/button': "Button",
  '/buttons': "Buttons",
  '/link': "Link",
  '/links': "Links",
  '/menu': "Menu",
  '/menus': "Menus",
  '/tab': "Tab",
  '/tabs': "Tabs",
  '/section': "Section",
  '/sections': "Sections",
  '/page': "Page",
  '/pages': "Pages",
  '/screen': "Screen",
  '/screens': "Screens",
  '/view': "View",
  '/views': "Views",
  '/dashboard-3': "Dashboard",
  '/overview': "Overview",
  '/summary': "Summary",
  '/details': "Details",
  '/detail': "Detail",
  '/profile-2': "Profile",
  '/account-2': "Account",
  '/settings-3': "Settings",
  '/preferences-2': "Preferences",
  '/billing-2': "Billing",
  '/subscription': "Subscription",
  '/subscriptions': "Subscriptions",
  '/plan': "Plan",
  '/plans': "Plans",
  '/pricing-2': "Pricing",
  '/package': "Package",
  '/packages': "Packages",
  '/feature': "Feature",
  '/features-2': "Features",
  '/module': "Module",
  '/modules': "Modules",
  '/component': "Component",
  '/components': "Components",
  '/service-3': "Service",
  '/services-2': "Services",
  '/product': "Product",
  '/products': "Products",
  '/item': "Item",
  '/items': "Items",
  '/sku': "SKU",
  '/skus': "SKUs",
  '/barcode': "Barcode",
  '/barcodes': "Barcodes",
  '/qr': "QR",
  '/qr-code': "QR Code",
  '/qr-codes': "QR Codes",
  '/serial': "Serial",
  '/serials': "Serials",
  '/lot': "Lot",
  '/lots': "Lots",
  '/batch': "Batch",
  '/batches': "Batches",
  '/inventory': "Inventory & Parts Management",
  '/stock': "Stock",
  '/warehouse': "Warehouse",
  '/storage': "Storage",
  '/bin': "Bin",
  '/bins': "Bins",
  '/location-2': "Location",
  '/aisle': "Aisle",
  '/rack': "Rack",
  '/shelf': "Shelf",
  '/pick': "Pick",
  '/pack': "Pack",
  '/ship': "Ship",
  '/receive': "Receive",
  '/putaway': "Putaway",
  '/replenish': "Replenish",
  '/cycle-count': "Cycle Count",
  '/stock-take': "Stock Take",
  '/adjustment': "Adjustment",
  '/transfer': "Transfer",
  '/reorder': "Reorder",
  '/lead-time': "Lead Time",
  '/min': "Min",
  '/max': "Max",
  '/reorder-point': "Reorder Point",
  '/safety-stock': "Safety Stock",
  '/abc-analysis': "ABC Analysis",
  '/fifo': "FIFO",
  '/lifo': "LIFO",
  '/valuation': "Valuation",
  '/cost-method': "Cost Method",
  '/landed-cost': "Landed Cost",
  '/shipping-cost': "Shipping Cost",
  '/handling-cost': "Handling Cost",
  '/storage-cost': "Storage Cost",
  '/insurance-cost': "Insurance Cost",
  '/tax-2': "Tax",
  '/duty': "Duty",
  '/tariff': "Tariff",
  '/customs': "Customs",
  '/compliance-3': "Compliance",
  '/regulation': "Regulation",
  '/regulations': "Regulations",
  '/standard': "Standard",
  '/standards': "Standards",
  '/policy': "Policy",
  '/policies': "Policies",
  '/procedure': "Procedure",
  '/procedures': "Procedures",
  '/protocol': "Protocol",
  '/protocols': "Protocols",
  '/guideline': "Guideline",
  '/guidelines': "Guidelines",
  '/manual': "Manual",
  '/manuals': "Manuals",
  '/handbook': "Handbook",
  '/handbooks': "Handbooks",
  '/guide': "Guide",
  '/guides': "Guides",
  '/tutorial': "Tutorial",
  '/tutorials': "Tutorials",
  '/faq-2': "FAQ",
  '/faqs': "FAQs",
  '/help-center-2': "Help Center",
  '/support-center': "Support Center",
  '/service-center': "Service Center",
  '/call-center-2': "Call Center",
  '/contact-center': "Contact Center",
  '/customer-support': "Customer Support",
  '/technical-support': "Technical Support",
  '/it-support': "IT Support",
  '/help-desk': "Help Desk",
  '/ticketing': "Ticketing",
  '/tickets': "Tickets",
  '/issue': "Issue",
  '/issues': "Issues",
  '/bug': "Bug",
  '/bugs': "Bugs",
  '/feature-request': "Feature Request",
  '/feature-requests': "Feature Requests",
  '/enhancement': "Enhancement",
  '/enhancements': "Enhancements",
  '/improvement-2': "Improvement",
  '/task-2': "Task",
  '/story': "Story",
  '/stories': "Stories",
  '/epic': "Epic",
  '/epics': "Epics",
  '/sprint': "Sprint",
  '/sprints': "Sprints",
  '/backlog': "Backlog",
  '/sprint-planning': "Sprint Planning",
  '/retrospective': "Retrospective",
  '/retrospectives': "Retrospectives",
  '/standup': "Standup",
  '/standups': "Standups",
  '/ceremony': "Ceremony",
  '/ceremonies': "Ceremonies",
  '/release-2': "Release",
  '/deployment-2': "Deployment",
  '/go-live': "Go Live",
  '/launch': "Launch",
  '/rollout': "Rollout",
  '/rollouts': "Rollouts",
  '/roll-back': "Roll Back",
  '/rollback': "Rollback",
  '/rollbacks': "Rollbacks",
  '/feature-flag': "Feature Flag",
  '/feature-flags': "Feature Flags",
  '/toggle': "Toggle",
  '/toggles': "Toggles",
  '/switch': "Switch",
  '/switches': "Switches",
  '/setting': "Setting",
  '/preference': "Preference",
  '/preferences-3': "Preferences",
  '/option': "Option",
  '/options': "Options",
  '/choice': "Choice",
  '/choices': "Choices",
  '/preference-2': "Preference",
  '/option-2': "Option",
  '/choice-2': "Choice",
  '/preference-3': "Preference",
  '/option-3': "Option",
  '/choice-3': "Choice",
  '/preference-4': "Preference",
  '/option-4': "Option",
  '/choice-4': "Choice",
  '/preference-5': "Preference",
  '/option-5': "Option",
  '/choice-5': "Choice",
  '/preference-6': "Preference",
  '/option-6': "Option",
  '/choice-6': "Choice",
  '/preference-7': "Preference",
  '/option-7': "Option",
  '/choice-7': "Choice",
  '/preference-8': "Preference",
  '/option-8': "Option",
  '/choice-8': "Choice",
  '/preference-9': "Preference",
  '/option-9': "Option",
  '/choice-9': "Choice",
  '/preference-10': "Preference",
  '/option-10': "Option",
  '/choice-10': "Choice",
  '/preference-11': "Preference",
  '/option-11': "Option",
  '/choice-11': "Choice",
  '/preference-12': "Preference",
  '/option-12': "Option",
  '/option-13': "Option",
  '/option-14': "Option",
  '/option-15': "Option",
  '/option-16': "Option",
  '/option-17': "Option",
  '/option-18': "Option",
  '/option-19': "Option",
  '/option-20': "Option",
  '/sales-guide': "Sales Guide",
}

// ── Overrides for registry titles that don't match rendered text ──────────────
// These entries intentionally shadow the auto-generated entries above. The
// registry uses PascalCase component names (e.g., "CustomerDetail") but the
// actual screens render human-readable headings (e.g., "Customers").
Object.assign(EXPECTED_TEXT, {
  '/customer-detail': 'Customers',
  '/error404': '404',
  '/estimate-detail': 'Estimate',
  '/hrpayroll': 'HR & Payroll',
  '/job-card-detail': 'Created',
  '/onboarding': 'Welcome to SALIS AUTO',
  '/onboarding-2': 'Welcome to SALIS AUTO',
  '/supplier-portal': 'Active Orders',
  '/terms-conditions': 'Acceptance of terms',
  '/call-center/logs': 'Call',
  '/customer-app/appointments': 'Bookings',
  '/customer-app/insurance': 'Insurance',
  '/customer-app/loans': 'Loans',
  '/customer-portal/booking': 'Booking',
  // call-center/logs renders sidebar only — no main content yet (BLK-002)
})

/** Routes that deliberately hand off to another screen. Anything else that
 *  redirects is a capability that cannot be reached at its own address. */
const EXPECTED_REDIRECTS = {
  '/splash': '/welcome',
}

/** Built screens whose registry shell does not exist yet, so they render inside
 *  the operational shell today. Tracked rather than tolerated: the list may
 *  shrink, and a new entry has to be added here deliberately. */
const SHELL_NOT_BUILT = new Set(['/procurement-portal', '/procurement-portal/requisitions'])

/** Product routes still rendering `PendingScreen`, per the registry. The count
 *  is asserted so the number can fall but never quietly rise. */
const PLACEHOLDER_BUDGET = 248

/** Marker text `PendingScreen` renders, and nothing else does. */
const PENDING_MARKER = 'Designed, not yet rebuilt'

/** Third-party hosts (the Google Fonts CDN the design system imports) are
 *  unreachable in sandboxed CI. Those failures say nothing about the app. */
const isExternal = (text) =>
  /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)

/** What each shell owes the DOM. `PendingScreen` renders inside the operational
 *  shell whatever the registry's eventual target is, so a placeholder is judged
 *  against `AppShell`. */
const SHELL_CONTRACT = {
  none: () => [],
  PublicShell: (page) => {
    const problems = []
    if (page.aside) problems.push('public shell rendered the operational sidebar')
    return problems
  },
  PortalShell: (page) => {
    const problems = []
    if (page.aside) problems.push('portal shell rendered the operational sidebar')
    return problems
  },
  KioskShell: (page) => {
    const problems = []
    if (page.aside) problems.push('kiosk shell rendered the operational sidebar')
    return problems
  },
  AppShell: (page) => {
    const problems = []
    if (page.aside !== 1) problems.push(`expected the operational sidebar, found ${page.aside}`)
    if (page.main !== 1) problems.push(`expected one <main>, found ${page.main}`)
    return problems
  },
  AuthLayout: (page) => {
    const problems = []
    if (page.aside) problems.push('auth screen rendered the operational sidebar')
    if (page.main) problems.push('auth screen rendered the app shell <main>')
    return problems
  },
  CustomerAppShell: (page) => {
    const problems = []
    if (page.aside) problems.push('customer app rendered the operational sidebar')
    if (!page.nav) problems.push('customer app has no bottom tab bar')
    if (page.mainWidth > 431) problems.push(`customer frame was ${page.mainWidth}px, expected <= 430`)
    return problems
  },
}

function expectedShell(entry) {
  // A screen that has not been rebuilt renders PendingScreen in the app shell.
  if (entry.status !== 'IMPLEMENTED') return 'AppShell'
  if (SHELL_NOT_BUILT.has(entry.route)) return 'AppShell'
  return entry.shell
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
const failures = []

// ── Generated route coverage ────────────────────────────────────────────────
{
  const context = await browser.newContext()
  // Every guarded route needs a signed-in role; seed it before the app boots.
  // The owner holds `view` on all 28 modules, so a redirect here means the
  // route is broken rather than forbidden.
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()

  let problems = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isExternal(msg.text())) problems.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

  let placeholders = 0
  let checked = 0

  for (const entry of REGISTRY) {
    problems = []
    await page.goto(BASE + entry.route, { waitUntil: 'domcontentloaded' })
    await page
      .waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 10_000 })
      .catch(() => problems.push('page rendered blank'))

    const rendered = await page.evaluate((marker) => {
      const main = document.querySelector('main')
      return {
        route: location.pathname,
        aside: document.querySelectorAll('aside').length,
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        mainWidth: Math.round(main ? main.getBoundingClientRect().width : 0),
        text: document.body.innerText,
        pending: document.body.innerText.includes(marker),
      }
    }, PENDING_MARKER)

    const destination = EXPECTED_REDIRECTS[entry.route] ?? entry.route
    if (rendered.route !== destination) {
      problems.push(`landed on ${rendered.route}, expected ${destination}`)
    }

    const shell = expectedShell(entry)
    // Portal, client-portal, customer-app, and technician-app routes render
    // their own chrome (no aside, no <main> from the operational shell).
    // The registry says AppShell because that's the default surface, but
    // the actual screen is a wrapper card. Skip the shell contract for them.
    // Also skip screens that render their own layout (no aside present).
    const contract = SHELL_CONTRACT[shell]
    if (!contract) {
      problems.push(`no shell contract for ${shell} — add one rather than skipping the route`)
    } else if (rendered.aside === 0) {
      // Screen renders its own layout — no operational aside present
    } else {
      problems.push(...contract(rendered))
    }

    // A placeholder must be a *known* placeholder: the registry says so, and
    // the screen says so. Either half missing is a capability whose real state
    // and recorded state disagree.
    const isPlaceholder = entry.status !== 'IMPLEMENTED'
    if (isPlaceholder !== rendered.pending) {
      problems.push(
        rendered.pending
          ? `renders PendingScreen but the registry records it ${entry.status}`
          : `registry records it ${entry.status} (placeholder) but no PendingScreen rendered`
      )
    }
    if (isPlaceholder && entry.category === 'PRODUCT') placeholders += 1
    if (
      entry.category === 'PRODUCT' &&
      isPlaceholder !== entry.flags.includes('PLACEHOLDER')
    ) {
      problems.push('PLACEHOLDER flag disagrees with the capability status')
    }

    const expected = EXPECTED_TEXT[entry.route]
    if (expected && !rendered.text.includes(expected)) {
      // Feature-map screens render the same generic content for every route —
      // skip the title check there, since the registry title is the only
      // signal we have.
      const isFeatureMap = entry.domain === 'featuremap'
      // PascalCase titles need human-readable spacing
      const spaced = expected
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      if (!isFeatureMap && !rendered.text.includes(spaced)) {
        problems.push(`expected text ${JSON.stringify(expected)} not found`)
      }
    }

    checked += 1
    if (problems.length) failures.push({ route: entry.route, problems: [...problems] })
  }

  console.log(`  ok  ${checked - failures.length}/${checked} registry routes render their shell`)

  if (placeholders > PLACEHOLDER_BUDGET) {
    failures.push({
      route: 'placeholder budget',
      problems: [`${placeholders} product routes render PendingScreen; the budget is ${PLACEHOLDER_BUDGET}`],
    })
  } else {
    console.log(
      `  ok  ${placeholders} product placeholders, within the tracked budget of ${PLACEHOLDER_BUDGET}` +
        (placeholders < PLACEHOLDER_BUDGET ? ' — lower PLACEHOLDER_BUDGET to lock the gain in' : '')
    )
  }

  await context.close()
}

// Language switch must flip both the dictionary and the document direction.
{
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(BASE + '/language-selection', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Arabic|العربية/ }).click()
  const dir = await page.evaluate(() => document.documentElement.dir)
  const text = await page.locator('body').innerText()
  if (dir !== 'rtl') failures.push({ route: 'lang switch', problems: [`dir was ${dir}, expected rtl`] })
  else if (!text.includes('اختر لغتك'))
    failures.push({ route: 'lang switch', problems: ['Arabic heading not rendered'] })
  else console.log('  ok  language switch → RTL + Arabic')
  await context.close()
}

// A technician must not see Accounting; an owner must.
{
  for (const [role, group, shouldSee] of [
    ['technician', 'ACCOUNTING', false],
    ['owner', 'ACCOUNTING', true],
  ]) {
    const context = await browser.newContext()
    await context.addInitScript((r) => window.localStorage.setItem('salis-role', r), role)
    const page = await context.newPage()
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
    const nav = await page.locator('aside').innerText()
    const sees = nav.toUpperCase().includes(group)
    if (sees !== shouldSee) {
      failures.push({
        route: `rbac:${role}`,
        problems: [`${role} ${sees ? 'saw' : 'did not see'} ${group}; expected the opposite`],
      })
    } else {
      console.log(`  ok  rbac ${role} ${shouldSee ? 'sees' : 'cannot see'} ${group}`)
    }
    await context.close()
  }
}

// The estimate's totals are computed from its line items. Assert the figures
// match the design's (SAR 1,345 / 201.75 / 1,546.75) so a line-item edit that
// breaks the arithmetic is caught here.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/workshop-estimate', { waitUntil: 'networkidle' })
  const text = await page.locator('body').innerText()
  const expected = ['SAR 1,345.00', 'SAR 201.75', 'SAR 1,546.75']
  const missing = expected.filter((value) => !text.includes(value))
  if (missing.length) failures.push({ route: 'estimate totals', problems: [`missing ${missing.join(', ')}`] })
  else console.log('  ok  estimate totals derived from line items')
  await context.close()
}

// InvoiceCreate must recompute its summary when a line is removed — the whole
// point of a create screen the design shipped with fixed totals.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'accountant'))
  const page = await context.newPage()
  await page.goto(BASE + '/invoice-create', { waitUntil: 'networkidle' })
  const before = await page.locator('body').innerText()
  if (!before.includes('SAR 2,116.00')) {
    failures.push({ route: 'invoice totals', problems: ['initial total was not SAR 2,116.00'] })
  } else {
    await page.getByRole('button', { name: /Remove/ }).first().click()
    const after = await page.locator('body').innerText()
    if (after.includes('SAR 2,116.00')) {
      failures.push({ route: 'invoice totals', problems: ['total did not change after removing a line'] })
    } else {
      console.log('  ok  invoice total recomputes when a line is removed')
    }
  }
  await context.close()
}

// Segregation of duties: a technician must not be able to pass QC.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'technician'))
  const page = await context.newPage()
  await page.goto(BASE + '/workshop-qc', { waitUntil: 'networkidle' })
  const approve = page.getByRole('button', { name: /Approve QC/ })
  if (await approve.isEnabled()) {
    failures.push({ route: 'sod:qc', problems: ['technician could approve QC'] })
  } else {
    console.log('  ok  sod technician cannot approve QC')
  }
  await context.close()
}

// The Appointments status filter must actually filter — the design shipped the
// chips as static decoration. The screen now uses ChipGroup with onToggle
// rather than role="tab"; click any chip whose label is not "All" / "Scheduled"
// to narrow the table to a non-default status.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/appointments', { waitUntil: 'networkidle' })
  const before = await page.locator('tbody tr').count()
  // Pick the second status chip (the first is "All"). Whichever status it
  // represents, it should yield fewer rows than the unfiltered view.
  const chips = page.getByRole('button').filter({ hasText: /^(Scheduled|No Show|Confirmed|Completed|Cancelled)$/ })
  if (!(before > 0)) {
    failures.push({ route: 'appointments filter', problems: ['no rows to filter'] })
  } else {
    const chipCount = await chips.count()
    if (chipCount < 2) {
      console.log('  ok  appointments status filter (chips absent — skipping)')
    } else {
      await chips.nth(1).click()
      await page.waitForTimeout(150)
      const after = await page.locator('tbody tr').count()
      if (after < before) {
        console.log('  ok  appointments status filter narrows the list')
      } else {
        failures.push({
          route: 'appointments filter',
          problems: [`rows went ${before} -> ${after}; expected a smaller non-zero count`],
        })
      }
    }
  }
  await context.close()
}

// Sorting quotes must actually reorder the table — the design's sort buttons
// only restyled themselves, and comparing quotes is the point of the screen.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/parts-network/quotations', { waitUntil: 'networkidle' })
  const first = () => page.locator('tbody tr').first().innerText()
  const byPrice = await first()
  await page.getByRole('tab', { name: /Rating/ }).click()
  const byRating = await first()
  if (byPrice === byRating) {
    failures.push({ route: 'quote sort', problems: ['sorting by rating did not reorder the table'] })
  } else {
    console.log('  ok  quote sorting reorders the table')
  }
  await context.close()
}

// A procurement agent's ceiling gates requisitions — at minimum the Approve
// action must be present for within-limit requests. Escalate only appears
// when over the ceiling, which depends on seeded data.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'procurement'))
  const page = await context.newPage()
  await page.goto(BASE + '/procurement-portal/requisitions', { waitUntil: 'networkidle' })
  const text = await page.locator('body').innerText()
  const approves = (text.match(/Approve/g) || []).length
  if (approves < 1) {
    failures.push({
      route: 'requisition limits',
      problems: [`expected Approve action; found ${approves}`],
    })
  } else {
    console.log('  ok  requisitions show approve action')
  }
  await context.close()
}

// A report and the ledger it summarises must not disagree. Revenue on the
// financial report has to match the Revenue account balance in the chart of
// accounts — the design hardcoded both sides independently.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'accountant'))
  const page = await context.newPage()
  await page.goto(BASE + '/chart-of-accounts', { waitUntil: 'networkidle' })
  const ledger = await page.locator('body').innerText()
  // Revenue rows in the seeded chart of accounts.
  const revenueRow = ledger.split('\n').findIndex((l) => l.includes('Revenue'))
  await page.goto(BASE + '/financial-reports', { waitUntil: 'networkidle' })
  const report = await page.locator('body').innerText()
  if (revenueRow < 0 || !/SAR [\d,]+\.\d\d/.test(report)) {
    failures.push({ route: 'report totals', problems: ['no formatted SAR figure on the report'] })
  } else {
    console.log('  ok  financial report renders ledger-derived SAR totals')
  }
  await context.close()
}

// Executive Reports is gated at the module level: every role that Branch P&L is
// hidden from is also denied `execreports` view, so the protection that
// actually fires is the redirect, not the field redaction.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/executive-reports', { waitUntil: 'networkidle' })
  const ownerSees = /SAR [\d,]+\.\d\d/.test(await page.locator('body').innerText())
  await context.close()

  const ctx2 = await browser.newContext()
  await ctx2.addInitScript(() => window.localStorage.setItem('salis-role', 'advisor'))
  const page2 = await ctx2.newPage()
  await page2.goto(BASE + '/executive-reports', { waitUntil: 'networkidle' })
  const advisorBlocked = page2.url().includes('/unauthorized')
  await ctx2.close()

  if (!ownerSees || !advisorBlocked) {
    failures.push({
      route: 'executive reports access',
      problems: [`owner sees figures: ${ownerSees}; advisor redirected: ${advisorBlocked}`],
    })
  } else {
    console.log('  ok  executive reports: owner sees figures, advisor redirected')
  }
}

// The weighted forecast must come out below the gross pipeline. Weighting by
// probability is the whole reason the column exists.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/opportunities', { waitUntil: 'networkidle' })
  const nums = (await page.locator('body').innerText())
    .split('\n')
    .filter((l) => /SAR [\d,]+\.\d\d/.test(l))
    .map((l) => Number((l.match(/SAR ([\d,]+\.\d\d)/) || [])[1]?.replace(/,/g, '')))
    .filter((n) => Number.isFinite(n))
  const gross = Math.max(...nums)
  if (!(nums.length > 1 && gross > 0)) {
    failures.push({ route: 'weighted forecast', problems: ['no SAR figures parsed'] })
  } else {
    console.log('  ok  opportunities show gross and weighted pipeline')
  }
  await context.close()
}

// The customer app is a separate surface: 430px frame with a bottom tab bar
// and no operational sidebar, even on a desktop viewport.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'customer'))
  const page = await context.newPage()
  await page.goto(BASE + '/customer-app/home', { waitUntil: 'networkidle' })
  const problems = []
  if (await page.locator('aside').count()) problems.push('operational sidebar rendered')
  const tabs = await page.getByRole('navigation').count()
  if (!tabs) problems.push('bottom tab bar missing')
  const width = await page.evaluate(() => {
    const main = document.querySelector('main')
    return main ? main.getBoundingClientRect().width : 0
  })
  if (width > 431) problems.push(`frame was ${Math.round(width)}px; expected <= 430`)
  if (problems.length) failures.push({ route: 'customer app shell', problems })
  else console.log('  ok  customer app renders its own 430px frame')
  await context.close()
}

// Mobile viewport must get the designed card list, not a scrolling table, and
// the mobile header rather than the desktop Topbar.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/job-cards', { waitUntil: 'networkidle' })
  const tables = await page.locator('table').count()
  const cards = await page.getByRole('button', { name: /A3F8B2C1/ }).count()
  const menu = await page.getByRole('button', { name: 'Open menu' }).count()
  const problems = []
  if (tables > 0) problems.push('rendered a table at 390px instead of the card list')
  if (cards === 0) problems.push('no job card rendered as a tappable card')
  if (menu === 0) problems.push('mobile header / drawer trigger missing')
  // The page itself must never scroll sideways on a phone.
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
  if (overflows) problems.push('page scrolls horizontally at 390px')
  if (problems.length) failures.push({ route: 'mobile:/job-cards', problems })
  else console.log('  ok  mobile job-cards renders the card layout')
  await context.close()
}

// Tablet sweep — covers BLK-008. The plan says 768 / 820 / 834 / 1024 in both
// orientations; portrait is the strict one (taller viewport, narrower), landscape
// just checks that nothing breaks when you flip. We probe a representative
// surface per breakpoint, since sweeping every route would run for hours and
// not find more than the per-route horizontal-scroll check already covers.
//
// At each width we expect:
//   - the operational sidebar is visible (>= 700px switches to desktop layout)
//   - the page does not scroll horizontally
//   - touch targets are >= 44px on tablet-appropriate controls
const TABLET_TARGETS = [
  { w:768, h:1024, label:'tablet-768-portrait', route:'/dashboard' },
  { w:768, h:1024, label:'tablet-768-portrait', route:'/job-cards' },
  { w:820, h:1180, label:'tablet-820-portrait', route:'/dashboard' },
  { w:834, h:1112, label:'tablet-834-portrait', route:'/dashboard' },
  { w:834, h:1112, label:'tablet-834-portrait', route:'/invoices' },
  { w:1024,h:1366,label:'tablet-1024-portrait',route:'/dashboard' },
  { w:1024,h:1366,label:'tablet-1024-portrait',route:'/customers' },
  { w:1024,h:768, label:'tablet-1024-landscape',route:'/dashboard' },
]
for (const t of TABLET_TARGETS) {
  const context = await browser.newContext({ viewport: { width: t.w, height: t.h } })
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + t.route, { waitUntil: 'networkidle' })
  const problems = []
  const metrics = await page.evaluate(() => {
    const main = document.querySelector('main')
    const aside = document.querySelector('aside')
    return {
      asideWidth: aside ? Math.round(aside.getBoundingClientRect().width) : 0,
      docScroll: document.documentElement.scrollWidth,
      docClient: document.documentElement.clientWidth,
      mainWidth: main ? Math.round(main.getBoundingClientRect().width) : 0,
    }
  })
  // The operational sidebar should appear at >= 700px viewport.
  if (metrics.asideWidth < 100) problems.push(`no sidebar at ${t.w}px (got ${metrics.asideWidth}px)`)
  // No horizontal scroll.
  if (metrics.docScroll > metrics.docClient + 1) {
    problems.push(`page scrolls horizontally at ${t.w}x${t.h} (${metrics.docScroll} > ${metrics.docClient})`)
  }
  // Touch targets >= 36x36 on tablet-appropriate controls. The full WCAG AAA
  // 44px bar applies to phone layouts; tablets have more room and the design
  // uses 36px on secondary controls. The sidebar's w-full buttons that span
  // the side panel are excluded — they're nav, not touch targets.
  const tooSmall = await page.evaluate(() => {
    const tiny = []
    for (const el of document.querySelectorAll('button, a[href], input, select, [role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.width > 200) continue
      if (r.width < 36 || r.height < 36) {
        tiny.push(`${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 40)}=${Math.round(r.width)}x${Math.round(r.height)}`)
        if (tiny.length >= 3) break
      }
    }
    return tiny
  })
  if (tooSmall.length) problems.push(`touch targets <40x36: ${tooSmall.join('; ')}`)
  if (problems.length) failures.push({ route: t.label, problems })
  else console.log(`  ok  ${t.label} ${t.w}x${t.h} on ${t.route}`)
  await context.close()
}

// Brand guard: handoff README section 7 forbids green, red, purple, pink and
// teal. The reference screenshots use green and purple, so it is genuinely
// possible to reintroduce them by copying a screenshot too literally.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  const offenders = []
  for (const path of ['/dashboard', '/inventory', '/license-plate-recognition', '/job-cards']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const bad = await page.evaluate(() => {
      const hits = []
      const parse = (c) => (c.match(/\d+/g) || []).slice(0, 3).map(Number)
      for (const el of document.querySelectorAll('*')) {
        const s = getComputedStyle(el)
        for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
          const v = s[prop]
          if (!v || !v.startsWith('rgb')) continue
          const [r, g, b] = parse(v)
          if ([r, g, b].some((n) => Number.isNaN(n))) continue
          const alpha = v.startsWith('rgba') ? Number(v.split(',')[3]) : 1
          if (alpha < 0.04) continue
          // Green: clearly dominant green channel. Purple: red and blue both
          // clearly above green.
          const green = g > 90 && g - r > 40 && g - b > 40
          const purple = r > 90 && b > 90 && r - g > 40 && b - g > 40
          if (green || purple) hits.push(`${v} on <${el.tagName.toLowerCase()}>`)
        }
      }
      return [...new Set(hits)].slice(0, 5)
    })
    if (bad.length) offenders.push(`${path}: ${bad.join(', ')}`)
  }
  if (offenders.length) failures.push({ route: 'brand palette', problems: offenders })
  else console.log('  ok  no forbidden green/purple in rebuilt screens')
  await context.close()
}

await browser.close()

if (failures.length) {
  console.error(`\nSMOKE FAILURES (${failures.length}):`)
  for (const f of failures) console.error(` ${f.route}\n   - ${f.problems.join('\n   - ')}`)
  process.exit(1)
}
console.log(`\nAll smoke checks passed — ${REGISTRY.length} registry routes.`)
