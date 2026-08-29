// Ported verbatim from app/src/data/generated/rbac.ts (design bundle source of truth).
// Types stripped for the server's standalone tree; values are identical.

export const ROLES = [
  {
    "id": "owner",
    "label": "Owner / CEO",
    "ar": "المالك / الرئيس التنفيذي",
    "icon": "Crown",
    "demo": {
      "name": "Abdullah Al-Salis",
      "ar": "عبدالله السالس",
      "email": "owner@salisauto.sa"
    },
    "scope": "all",
    "limit": null,
    "color": "#0A5ED7"
  },
  {
    "id": "superadmin",
    "label": "Super Admin",
    "ar": "المشرف العام",
    "icon": "Shield",
    "demo": {
      "name": "Platform Admin",
      "ar": "مشرف المنصة",
      "email": "admin@salisauto.com"
    },
    "scope": "platform",
    "limit": null,
    "color": "#0B1F3B"
  },
  {
    "id": "manager",
    "label": "Branch Manager",
    "ar": "مدير الفرع",
    "icon": "UserCog",
    "demo": {
      "name": "Faisal Al-Harbi",
      "ar": "فيصل الحربي",
      "email": "manager@salisauto.sa"
    },
    "scope": "branch",
    "limit": 50000,
    "color": "#0A5ED7"
  },
  {
    "id": "advisor",
    "label": "Service Advisor",
    "ar": "مستشار الخدمة",
    "icon": "Headset",
    "demo": {
      "name": "Noura Al-Qahtani",
      "ar": "نورة القحطاني",
      "email": "advisor@salisauto.sa"
    },
    "scope": "branch",
    "limit": 5000,
    "color": "#0BB3FF"
  },
  {
    "id": "technician",
    "label": "Technician",
    "ar": "فني",
    "icon": "Wrench",
    "demo": {
      "name": "Saeed Al-Zahrani",
      "ar": "سعيد الزهراني",
      "email": "tech@salisauto.sa"
    },
    "scope": "own",
    "limit": 0,
    "color": "#0BB3FF"
  },
  {
    "id": "qc",
    "label": "QC Inspector",
    "ar": "مفتش الجودة",
    "icon": "ClipboardCheck",
    "demo": {
      "name": "Majed Al-Otaibi",
      "ar": "ماجد العتيبي",
      "email": "qc@salisauto.sa"
    },
    "scope": "branch",
    "limit": 0,
    "color": "#0BB3FF"
  },
  {
    "id": "parts",
    "label": "Storekeeper",
    "ar": "أمين المستودع",
    "icon": "Package",
    "demo": {
      "name": "Yousef Al-Ghamdi",
      "ar": "يوسف الغامدي",
      "email": "parts@salisauto.sa"
    },
    "scope": "branch",
    "limit": 10000,
    "color": "#0A5ED7"
  },
  {
    "id": "accountant",
    "label": "Accountant",
    "ar": "محاسب",
    "icon": "Calculator",
    "demo": {
      "name": "Hessa Al-Mutairi",
      "ar": "حصة المطيري",
      "email": "finance@salisauto.sa"
    },
    "scope": "all",
    "limit": 25000,
    "color": "#0A5ED7"
  },
  {
    "id": "hr",
    "label": "HR Manager",
    "ar": "مدير الموارد البشرية",
    "icon": "Users",
    "demo": {
      "name": "Reem Al-Dossari",
      "ar": "ريم الدوسري",
      "email": "hr@salisauto.sa"
    },
    "scope": "all",
    "limit": 15000,
    "color": "#0A5ED7"
  },
  {
    "id": "frontdesk",
    "label": "Receptionist",
    "ar": "موظف الاستقبال",
    "icon": "Bell",
    "demo": {
      "name": "Lama Al-Shehri",
      "ar": "لمى الشهري",
      "email": "frontdesk@salisauto.sa"
    },
    "scope": "branch",
    "limit": 0,
    "color": "#0BB3FF"
  },
  {
    "id": "callcenter",
    "label": "Call Center Agent",
    "ar": "موظف مركز الاتصال",
    "icon": "PhoneCall",
    "demo": {
      "name": "Turki Al-Anazi",
      "ar": "تركي العنزي",
      "email": "calls@salisauto.sa"
    },
    "scope": "all",
    "limit": 0,
    "color": "#0BB3FF"
  },
  {
    "id": "procurement",
    "label": "Procurement Agent",
    "ar": "وكيل المشتريات",
    "icon": "ShoppingCart",
    "demo": {
      "name": "Bandar Al-Subaie",
      "ar": "بندر السبيعي",
      "email": "procurement@salisauto.sa"
    },
    "scope": "all",
    "limit": 20000,
    "color": "#0A5ED7"
  },
  {
    "id": "supplier",
    "label": "Supplier",
    "ar": "مورّد",
    "icon": "Truck",
    "demo": {
      "name": "Al-Jazira Parts Co.",
      "ar": "شركة الجزيرة للقطع",
      "email": "supplier@aljazira.sa"
    },
    "scope": "external",
    "limit": 0,
    "color": "#F97316"
  },
  {
    "id": "customer",
    "label": "Customer",
    "ar": "عميل",
    "icon": "User",
    "demo": {
      "name": "Khalid Al-Amri",
      "ar": "خالد العامري",
      "email": "khalid@example.sa"
    },
    "scope": "self",
    "limit": 0,
    "color": "#F97316"
  }
]

/** module → role → granted actions, e.g. "vcex". "" means hidden from nav. */
export const PERMS = {
  "dashboard": {
    "owner": "vx",
    "manager": "vx",
    "advisor": "v",
    "technician": "v",
    "qc": "v",
    "parts": "v",
    "accountant": "vx",
    "hr": "v",
    "frontdesk": "v",
    "callcenter": "v",
    "procurement": "v",
    "superadmin": "vx"
  },
  "jobcards": {
    "owner": "vcedax",
    "manager": "vcedax",
    "advisor": "vcea",
    "technician": "ve",
    "qc": "va",
    "parts": "v",
    "accountant": "vx",
    "frontdesk": "vc",
    "callcenter": "v",
    "superadmin": "v"
  },
  "appointments": {
    "owner": "vcedax",
    "manager": "vcedax",
    "advisor": "vced",
    "technician": "v",
    "qc": "",
    "parts": "",
    "accountant": "",
    "hr": "",
    "frontdesk": "vced",
    "callcenter": "vced",
    "procurement": "",
    "superadmin": "v"
  },
  "estimates": {
    "owner": "vcedax",
    "manager": "vceax",
    "advisor": "vce",
    "technician": "v",
    "qc": "",
    "parts": "v",
    "accountant": "vx",
    "frontdesk": "v",
    "callcenter": "v",
    "superadmin": "v"
  },
  "customers": {
    "owner": "vcedax",
    "manager": "vcedx",
    "advisor": "vce",
    "technician": "v",
    "qc": "",
    "parts": "",
    "accountant": "vx",
    "hr": "",
    "frontdesk": "vce",
    "callcenter": "vce",
    "procurement": "",
    "superadmin": "v"
  },
  "vehicles": {
    "owner": "vcedax",
    "manager": "vcedx",
    "advisor": "vce",
    "technician": "v",
    "qc": "v",
    "parts": "",
    "accountant": "v",
    "frontdesk": "vce",
    "callcenter": "v",
    "superadmin": "v"
  },
  "inventory": {
    "owner": "vcedax",
    "manager": "vcedax",
    "advisor": "v",
    "technician": "v",
    "qc": "",
    "parts": "vcedax",
    "accountant": "vx",
    "procurement": "vcex",
    "superadmin": "v"
  },
  "procurement": {
    "owner": "vcedax",
    "manager": "vcax",
    "advisor": "",
    "technician": "",
    "qc": "",
    "parts": "vc",
    "accountant": "vax",
    "procurement": "vcedax",
    "supplier": "v",
    "superadmin": "v"
  },
  "invoices": {
    "owner": "vcedax",
    "manager": "vceax",
    "advisor": "vc",
    "technician": "",
    "qc": "",
    "parts": "",
    "accountant": "vcedax",
    "frontdesk": "vc",
    "callcenter": "v",
    "superadmin": "v"
  },
  "payments": {
    "owner": "vcedax",
    "manager": "vcax",
    "advisor": "vc",
    "technician": "",
    "qc": "",
    "parts": "",
    "accountant": "vcedax",
    "frontdesk": "vc",
    "callcenter": "",
    "superadmin": "v"
  },
  "accounting": {
    "owner": "vax",
    "manager": "vx",
    "accountant": "vcedax",
    "superadmin": "v"
  },
  "hr": {
    "owner": "vcedax",
    "manager": "vx",
    "hr": "vcedax",
    "accountant": "vx",
    "superadmin": "v"
  },
  "technicians": {
    "owner": "vcedax",
    "manager": "vcedax",
    "advisor": "v",
    "technician": "v",
    "qc": "v",
    "hr": "vcedx",
    "frontdesk": "v",
    "superadmin": "v"
  },
  "crm": {
    "owner": "vcedax",
    "manager": "vcedx",
    "advisor": "vce",
    "callcenter": "vced",
    "superadmin": "v"
  },
  "callcenter": {
    "owner": "vx",
    "manager": "vx",
    "advisor": "v",
    "callcenter": "vcedx",
    "frontdesk": "v",
    "superadmin": "v"
  },
  "reports": {
    "owner": "vx",
    "manager": "vx",
    "advisor": "v",
    "technician": "",
    "qc": "v",
    "parts": "vx",
    "accountant": "vx",
    "hr": "vx",
    "procurement": "vx",
    "superadmin": "vx"
  },
  "approvals": {
    "owner": "vax",
    "manager": "vax",
    "advisor": "va",
    "technician": "",
    "qc": "",
    "parts": "va",
    "accountant": "vax",
    "hr": "va",
    "frontdesk": "",
    "callcenter": "",
    "procurement": "vax",
    "supplier": "",
    "customer": "",
    "superadmin": "vx"
  },
  "kiosk": {
    "owner": "v",
    "manager": "v",
    "advisor": "v",
    "technician": "",
    "qc": "",
    "parts": "",
    "accountant": "",
    "hr": "",
    "frontdesk": "vcex",
    "callcenter": "v",
    "procurement": "",
    "supplier": "",
    "customer": "",
    "superadmin": "v"
  },
  "execreports": {
    "owner": "vx",
    "manager": "vx",
    "advisor": "",
    "technician": "",
    "qc": "",
    "parts": "",
    "accountant": "vx",
    "hr": "",
    "frontdesk": "",
    "callcenter": "",
    "procurement": "",
    "superadmin": "vx"
  },
  "portaltech": {
    "owner": "v",
    "manager": "v",
    "advisor": "v",
    "technician": "vx",
    "qc": "vx",
    "parts": "",
    "accountant": "",
    "hr": "",
    "frontdesk": "",
    "callcenter": "",
    "procurement": "",
    "superadmin": "v"
  },
  "portalcustomer": {
    "owner": "v",
    "manager": "v",
    "advisor": "v",
    "technician": "",
    "qc": "",
    "parts": "",
    "accountant": "",
    "hr": "",
    "frontdesk": "v",
    "callcenter": "v",
    "procurement": "",
    "customer": "vx",
    "superadmin": "v"
  },
  "portalsupplier": {
    "owner": "v",
    "manager": "v",
    "advisor": "",
    "technician": "",
    "qc": "",
    "parts": "v",
    "accountant": "",
    "hr": "",
    "frontdesk": "",
    "callcenter": "",
    "procurement": "v",
    "supplier": "vx",
    "superadmin": "v"
  },
  "portalprocure": {
    "owner": "v",
    "manager": "v",
    "advisor": "",
    "technician": "",
    "qc": "",
    "parts": "v",
    "accountant": "v",
    "hr": "",
    "frontdesk": "",
    "callcenter": "",
    "procurement": "vx",
    "superadmin": "v"
  },
  "ai": {
    "owner": "vcedax",
    "manager": "vce",
    "advisor": "v",
    "accountant": "v",
    "superadmin": "vcedax"
  },
  "admin": {
    "owner": "vcedax",
    "manager": "v",
    "superadmin": "vcedax"
  },
  "settings": {
    "owner": "vcedax",
    "manager": "ve",
    "superadmin": "vcedax"
  },
  "audit": {
    "owner": "vx",
    "manager": "vx",
    "accountant": "vx",
    "superadmin": "vx"
  },
  "network": {
    "owner": "vcedax",
    "manager": "vcedx",
    "parts": "vced",
    "procurement": "vcedax",
    "supplier": "vce",
    "superadmin": "v"
  }
}

/** Screens that bypass RBAC entirely (auth, errors, design reference). */
export const RBAC_UNGATED = [
  "Index",
  "RBACSpec",
  "FlowSpec",
  "UI.EmptyStates",
  "UI.LoadingStates",
  "UI.FormValidation",
  "Login",
  "Splash",
  "Welcome",
  "Error404",
  "Maintenance",
  "SessionExpired",
  "AccountLocked",
  "Unauthorized",
  "PrivacyPolicy",
  "TermsConditions"
]

export const SCREEN_MODULE = {
  "TechnicianPortal": "portaltech",
  "TechnicianPortal.JobDetail": "portaltech",
  "TechnicianKB": "technicians",
  "CustomerPortal": "portalcustomer",
  "CustomerPortal.Booking": "portalcustomer",
  "KioskCheckIn": "kiosk",
  "SupplierPortal": "portalsupplier",
  "SupplierPortal.Orders": "portalsupplier",
  "ProcurementPortal": "portalprocure",
  "ProcurementPortal.Requisitions": "portalprocure",
  "SuperAdmin": "settings",
  "FinancialStatements": "accounting",
  "Dashboard": "dashboard",
  "JobCards": "jobcards",
  "JobDetail": "jobcards",
  "JobCardDetail": "jobcards",
  "WorkshopCheckIn": "jobcards",
  "WorkshopInspection": "jobcards",
  "WorkshopEstimate": "estimates",
  "WorkshopQC": "jobcards",
  "WorkshopSignature": "jobcards",
  "WorkshopDelivery": "jobcards",
  "Appointments": "appointments",
  "AppointmentCalendar": "appointments",
  "Estimates": "estimates",
  "EstimateDetail": "estimates",
  "Customers": "customers",
  "CustomerDetail": "customers",
  "CustomerFeedback": "customers",
  "Vehicles": "vehicles",
  "VehicleDetail": "vehicles",
  "FleetManagement": "vehicles",
  "FleetContract": "vehicles",
  "Inventory": "inventory",
  "PurchaseOrder": "procurement",
  "PartsNetwork": "network",
  "PartsSupplyNetwork": "network",
  "Invoices": "invoices",
  "InvoiceDetail": "invoices",
  "InvoiceCreate": "invoices",
  "InvoicePreview": "invoices",
  "Payments": "payments",
  "Receipts": "payments",
  "ChartOfAccounts": "accounting",
  "JournalEntries": "accounting",
  "Expenses": "accounting",
  "TaxManagement": "accounting",
  "BankReconciliation": "accounting",
  "FinancialReports": "accounting",
  "HRPayroll": "hr",
  "Technicians": "technicians",
  "TechnicianSchedule": "technicians",
  "Departments": "hr",
  "LeadPipeline": "crm",
  "LeadDetail": "crm",
  "Opportunities": "crm",
  "Campaigns": "crm",
  "EmailMarketing": "crm",
  "SMSCampaigns": "crm",
  "WhatsAppCampaigns": "crm",
  "CustomerSegments": "crm",
  "CRMTasks": "crm",
  "CRMCalendar": "crm",
  "CallCenter": "callcenter",
  "CallCenter.Logs": "callcenter",
  "Reports": "reports",
  "ReportsAnalytics": "reports",
  "ExecutiveReports": "execreports",
  "OperationalReports": "reports",
  "WorkshopReports": "reports",
  "InventoryReports": "reports",
  "SalesReports": "execreports",
  "InsuranceReports": "execreports",
  "LoanReports": "execreports",
  "CustomReports": "reports",
  "BIDashboard": "execreports",
  "AIAssistant": "ai",
  "PromptLibrary": "ai",
  "KnowledgeBase": "ai",
  "WorkflowBuilder": "ai",
  "AgentDashboard": "ai",
  "AgentRegistry": "ai",
  "ConversationHistory": "ai",
  "ModelSettings": "ai",
  "AIAnalytics": "ai",
  "AutomationRules": "ai",
  "Organizations": "admin",
  "Branches": "admin",
  "UsersTeams": "admin",
  "RolesPermissions": "admin",
  "Integrations": "admin",
  "Templates": "admin",
  "Settings": "settings",
  "AdvancedSettings": "settings",
  "Backup": "settings",
  "Subscription": "settings",
  "NotificationCenter": "dashboard",
  "GlobalSearch": "dashboard",
  "Profile": "dashboard",
  "AuditLog": "audit",
  "ApprovalInbox": "approvals",
  "CustomerApproval": "estimates",
  "OBDDiagnostics": "jobcards",
  "DiagnosticReport": "jobcards",
  "OEMIntegrations": "settings",
  "SystemIntegrations": "settings"
}

/** Field-level redaction: which roles may NOT see each field. */
export const FIELD_RULES = [
  {
    "field": "Part cost / margin",
    "ar": "تكلفة القطعة / الهامش",
    "hidden": [
      "advisor",
      "technician",
      "qc",
      "frontdesk",
      "callcenter",
      "customer",
      "supplier"
    ]
  },
  {
    "field": "Labour cost rate",
    "ar": "تكلفة أجر العمل",
    "hidden": [
      "technician",
      "qc",
      "frontdesk",
      "callcenter",
      "customer",
      "supplier"
    ]
  },
  {
    "field": "Employee salary",
    "ar": "راتب الموظف",
    "hidden": [
      "advisor",
      "technician",
      "qc",
      "parts",
      "frontdesk",
      "callcenter",
      "procurement",
      "supplier",
      "customer"
    ]
  },
  {
    "field": "Supplier purchase price",
    "ar": "سعر الشراء من المورد",
    "hidden": [
      "advisor",
      "technician",
      "qc",
      "frontdesk",
      "callcenter",
      "customer"
    ]
  },
  {
    "field": "Customer contact details",
    "ar": "بيانات اتصال العميل",
    "hidden": [
      "technician",
      "qc",
      "supplier"
    ]
  },
  {
    "field": "Bank account details",
    "ar": "بيانات الحساب البنكي",
    "hidden": [
      "advisor",
      "technician",
      "qc",
      "parts",
      "frontdesk",
      "callcenter",
      "hr",
      "procurement",
      "supplier",
      "customer"
    ]
  },
  {
    "field": "Branch P&L",
    "ar": "أرباح وخسائر الفرع",
    "hidden": [
      "advisor",
      "technician",
      "qc",
      "parts",
      "frontdesk",
      "callcenter",
      "procurement",
      "supplier",
      "customer"
    ]
  }
]

/** Duty pairs that must never sit with one person. */
export const SOD = [
  {
    "a": "Raise purchase order",
    "b": "Approve purchase order",
    "ar": [
      "رفع أمر شراء",
      "اعتماد أمر شراء"
    ],
    "risk": "high"
  },
  {
    "a": "Create supplier",
    "b": "Approve supplier payment",
    "ar": [
      "إنشاء مورد",
      "اعتماد دفعة للمورد"
    ],
    "risk": "high"
  },
  {
    "a": "Post journal entry",
    "b": "Approve journal entry",
    "ar": [
      "تسجيل قيد",
      "اعتماد قيد"
    ],
    "risk": "high"
  },
  {
    "a": "Perform repair",
    "b": "Pass quality check",
    "ar": [
      "تنفيذ الإصلاح",
      "اعتماد فحص الجودة"
    ],
    "risk": "high"
  },
  {
    "a": "Issue stock",
    "b": "Adjust stock count",
    "ar": [
      "صرف مخزون",
      "تعديل جرد المخزون"
    ],
    "risk": "medium"
  },
  {
    "a": "Create employee",
    "b": "Approve payroll run",
    "ar": [
      "إنشاء موظف",
      "اعتماد مسير الرواتب"
    ],
    "risk": "medium"
  }
]
