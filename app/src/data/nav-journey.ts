import type { NavGroup, NavItem } from './types'

/** The sidebar, regrouped by the working day rather than by department.
 *
 *  The generated `NAV` (`generated/nav.ts`) groups screens the way the design
 *  bundle's data file does — Operations, Customers & Vehicles, Finance,
 *  System… A service advisor does not move through the day that way: a car
 *  arrives (front desk), work happens (workshop), parts get pulled, the bill
 *  goes out. Grouping the same items in that order is the change the product
 *  review asked for. `nav.ts` stays generated and untouched; this file only
 *  re-buckets its items by their stable `key`, so a regenerated nav slots
 *  into the same journey and any key not named here keeps its generated group,
 *  appended after the journey groups rather than lost.
 *
 *  Two labels are load-bearing for the RBAC checks in `e2e/navigation.spec.ts`
 *  and `scripts/smoke.mjs`: a group named "Workshop" must exist for the owner,
 *  and "Accounting" must keep its name (and stay module-gated, so a technician
 *  never sees the word). */
export interface JourneyGroup {
  label: string
  icon: string
  keys: readonly string[]
  /** Folded on first visit — long tails the daily journey rarely opens. */
  collapsed?: boolean
}

export const JOURNEY_GROUPS: readonly JourneyGroup[] = [
  { label: 'Today', icon: 'LayoutDashboard', keys: ['dashboard', 'approval-inbox', 'notification-center'] },
  {
    label: 'Front Desk',
    icon: 'Users',
    keys: ['appointments', 'appointment-calendar', 'kiosk', 'customers', 'vehicles', 'fleet-management', 'customer-feedback'],
  },
  {
    label: 'Workshop',
    icon: 'Wrench',
    keys: [
      'job-cards', 'estimates', 'customer-approval', 'technicians', 'technician-schedule',
      'obd', 'diag-report', 'oem', 'technician-kb', 'workshop-reports',
    ],
  },
  { label: 'Parts', icon: 'Package', keys: ['inventory', 'parts-network', 'parts-supply-network'] },
  { label: 'Billing', icon: 'Receipt', keys: ['invoices', 'payments', 'receipts'] },
  {
    label: 'Accounting',
    icon: 'Calculator',
    keys: [
      'chart-of-accounts', 'journal-entries', 'expenses', 'tax-management', 'bank-reconciliation',
      'financial-statements', 'financial-reports',
    ],
  },
  {
    label: 'Reports',
    icon: 'BarChart3',
    keys: [
      'reports', 'reports-analytics', 'executive-reports', 'operational-reports', 'inventory-reports',
      'sales-reports', 'insurance-reports', 'loan-reports', 'custom-reports', 'bi-dashboard',
    ],
  },
  {
    label: 'Growth',
    icon: 'Target',
    keys: [
      'lead-pipeline', 'opportunities', 'campaigns', 'customer-segments', 'crm-tasks',
      'email-marketing', 'sms-campaigns', 'whatsapp-campaigns', 'crm-calendar',
    ],
  },
  { label: 'People', icon: 'HardHat', keys: ['hr-payroll'] },
  {
    label: 'Portals',
    icon: 'Building2',
    collapsed: true,
    keys: ['technician-portal', 'customer-portal', 'supplier-portal', 'procurement-portal', 'call-center', 'call-logs'],
  },
  {
    label: 'AI Platform',
    icon: 'Sparkles',
    collapsed: true,
    keys: [
      'ai-assistant', 'prompt-library', 'knowledge-base', 'workflow-builder', 'agent-dashboard',
      'agent-registry', 'conversation-history', 'model-settings', 'ai-analytics', 'ai-automation',
      'ai-chatbot', 'ai-chatbot-assistant', 'ai-service-advisor', 'smart-damage-assessment',
      'ml-fraud-detection', 'neural-network-prediction', 'voice-commands', 'voice-command-interface',
    ],
  },
  {
    label: 'Administration',
    icon: 'Shield',
    collapsed: true,
    keys: [
      'organizations', 'branches', 'departments', 'users-teams', 'roles-permissions', 'integrations',
      'templates-admin', 'automation-rules', 'audit-log', 'sys-int', 'backup', 'advanced-settings',
      'subscription', 'global-search', 'super-admin',
    ],
  },
  { label: 'Account', icon: 'UserCircle', keys: ['settings', 'profile'] },
]

/** A glyph per item, so a row is recognisable before its label is read. Items
 *  not listed inherit their group's icon. */
export const ITEM_ICONS: Readonly<Record<string, string>> = {
  dashboard: 'LayoutDashboard',
  'approval-inbox': 'Inbox',
  'notification-center': 'Bell',
  appointments: 'Calendar',
  'appointment-calendar': 'CalendarDays',
  kiosk: 'Tablet',
  customers: 'Users',
  vehicles: 'Car',
  'fleet-management': 'Truck',
  'customer-feedback': 'MessageSquareText',
  'job-cards': 'ClipboardList',
  estimates: 'FileText',
  'customer-approval': 'FileCheck',
  technicians: 'HardHat',
  'technician-schedule': 'CalendarClock',
  obd: 'Cpu',
  'diag-report': 'Stethoscope',
  oem: 'Plug',
  'technician-kb': 'BookOpen',
  'workshop-reports': 'FileBarChart',
  inventory: 'Package',
  'parts-network': 'Network',
  'parts-supply-network': 'Boxes',
  invoices: 'Receipt',
  payments: 'CreditCard',
  receipts: 'ReceiptText',
  'chart-of-accounts': 'Landmark',
  'journal-entries': 'ScrollText',
  expenses: 'Wallet',
  'tax-management': 'Percent',
  'bank-reconciliation': 'Scale',
  'financial-statements': 'FileSpreadsheet',
  'financial-reports': 'PieChart',
  reports: 'BarChart3',
  'reports-analytics': 'LineChart',
  'executive-reports': 'Crown',
  'operational-reports': 'Activity',
  'inventory-reports': 'PackageSearch',
  'sales-reports': 'TrendingUp',
  'insurance-reports': 'ShieldCheck',
  'loan-reports': 'Banknote',
  'custom-reports': 'SlidersHorizontal',
  'bi-dashboard': 'LayoutGrid',
  'lead-pipeline': 'UserPlus',
  opportunities: 'Target',
  campaigns: 'Megaphone',
  'customer-segments': 'Layers',
  'crm-tasks': 'ListTodo',
  'email-marketing': 'Mail',
  'sms-campaigns': 'MessageSquare',
  'whatsapp-campaigns': 'MessageCircle',
  'crm-calendar': 'CalendarCheck',
  'hr-payroll': 'Briefcase',
  'technician-portal': 'Wrench',
  'customer-portal': 'Car',
  'supplier-portal': 'Truck',
  'procurement-portal': 'ShoppingCart',
  'call-center': 'Headset',
  'call-logs': 'PhoneCall',
  'ai-assistant': 'Bot',
  'prompt-library': 'Library',
  'knowledge-base': 'BookOpen',
  'workflow-builder': 'Workflow',
  'agent-dashboard': 'LayoutDashboard',
  'agent-registry': 'ListChecks',
  'conversation-history': 'History',
  'model-settings': 'Settings2',
  'ai-analytics': 'LineChart',
  organizations: 'Building2',
  branches: 'GitBranch',
  departments: 'Layers',
  'users-teams': 'Users',
  'roles-permissions': 'KeyRound',
  integrations: 'Plug',
  'templates-admin': 'FileType',
  'automation-rules': 'Workflow',
  'audit-log': 'ScrollText',
  'sys-int': 'Webhook',
  backup: 'HardDrive',
  'advanced-settings': 'Settings2',
  subscription: 'BadgeCheck',
  'global-search': 'Search',
  'super-admin': 'Crown',
  settings: 'Settings',
  profile: 'UserCircle',
}

export function iconForItem(item: NavItem, group: NavGroup): string {
  return (item.key && ITEM_ICONS[item.key]) || group.icon
}

/** Regroup a generated nav by the journey. Pure, so a test can pin that every
 *  key lands exactly once and that an unknown key is kept, not dropped. */
export function journeyNav(nav: readonly NavGroup[]): NavGroup[] {
  const byKey = new Map<string, NavItem>()
  const unplaced: { group: NavGroup; item: NavItem }[] = []
  for (const group of nav) {
    for (const item of group.items) {
      if (item.key && !byKey.has(item.key)) byKey.set(item.key, item)
    }
  }
  const placed = new Set<string>()
  const groups: NavGroup[] = JOURNEY_GROUPS.map((journey) => ({
    label: journey.label,
    icon: journey.icon,
    items: journey.keys.flatMap((key) => {
      const item = byKey.get(key)
      if (!item) return []
      placed.add(key)
      return [item]
    }),
  }))
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.key || !placed.has(item.key)) unplaced.push({ group, item })
    }
  }
  // Anything the journey does not name keeps its generated group, after the
  // journey — visible, so a regenerated nav cannot silently lose a screen.
  const tail = new Map<string, NavGroup>()
  for (const { group, item } of unplaced) {
    const existing = tail.get(group.label) ?? { label: group.label, icon: group.icon, items: [] }
    tail.set(group.label, { ...existing, items: [...existing.items, item] })
  }
  return [...groups, ...tail.values()].filter((group) => group.items.length > 0)
}

/** Labels of the groups that start folded. */
export const DEFAULT_COLLAPSED: readonly string[] = JOURNEY_GROUPS.filter((g) => g.collapsed).map((g) => g.label)
