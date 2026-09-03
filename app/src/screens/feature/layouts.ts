import type { FeatureDef } from './types'

/** Per-route choices merged over the base definitions.
 *
 *  `definitions.ts` records what each reference screenshot shows; this file
 *  records how each screen should *behave*, chosen from its purpose. A live
 *  camera wall is a monitor, a VIN decoder is a wizard, a reorder queue is a
 *  board — rendering all forty-eight as "four stat cards over an empty table"
 *  was the sameness the product review called out.
 *
 *  Every `quickLinks.to` must be a real route (the unit test checks), every
 *  `collection` a real repository key, and every `toast` action must say the
 *  effect is not wired rather than pretend it happened. */
type Overrides = Partial<Omit<FeatureDef, 'id' | 'route' | 'title' | 'icon'>>

const goTo = (label: string, icon: string, to: string) => ({ label, icon, to })

export const FEATURE_LAYOUTS: Readonly<Record<string, Overrides>> = {
  // ── Vehicles ────────────────────────────────────────────────────────────
  '/vin-decoder': {
    layout: 'wizard',
    wizard: {
      steps: [
        {
          id: 'vin',
          label: 'Enter VIN',
          icon: 'ScanLine',
          fields: [{ name: 'vin', label: 'VIN', type: 'text', required: true, ltr: true, placeholder: '17 characters' }],
        },
        {
          id: 'vehicle',
          label: 'Confirm vehicle',
          icon: 'Car',
          fields: [
            { name: 'make', label: 'Make & Model', type: 'text', required: true },
            { name: 'year', label: 'Year', type: 'number', required: true, ltr: true },
          ],
        },
      ],
      submit: 'Save to garage',
      done: 'VIN decoded and saved to this session',
      section: 'Recent Decodes',
    },
    actions: [{ label: 'Decode VIN', icon: 'Search', intent: 'primary', kind: 'wizard' }],
    quickLinks: [goTo('Vehicles', 'Car', '/vehicles'), goTo('Vehicle History', 'History', '/vehicle-history')],
  },
  '/vehicle-tracking': {
    layout: 'monitor',
    monitor: {
      gauges: [
        { label: 'Tracked', fromRows: true, max: 50, tone: 'info' },
        { label: 'Moving', value: 0, max: 50 },
        { label: 'Offline', value: 0, max: 50, tone: 'warning' },
      ],
      feedTitle: 'Live Positions',
    },
    notice: 'Positions arrive from a telematics device; none is paired in the demo.',
    quickLinks: [goTo('Fleet Management', 'Truck', '/fleet-management'), goTo('Telematics', 'Satellite', '/telematics-integration')],
  },
  '/loaner-vehicles': {
    collection: {
      key: 'vehicles',
      fields: [
        { header: 'Plate', key: 'plate', code: true },
        { header: 'Vehicle', key: 'make' },
        { header: 'Owner', key: 'owner' },
        { header: 'Status', key: 'status' },
      ],
    },
    filters: [{ id: 'status', label: 'Status', column: 3 }],
    actions: [{ label: 'Issue Loaner', icon: 'Plus', intent: 'primary', kind: 'route', to: '/vehicles' }],
    quickLinks: [goTo('Vehicles', 'Car', '/vehicles'), goTo('Appointments', 'Calendar', '/appointments')],
  },
  '/digital-vehicle-walkaround': {
    layout: 'wizard',
    wizard: {
      steps: [
        { id: 'front', label: 'Front', icon: 'Camera', fields: [{ name: 'front', label: 'Front notes', type: 'textarea' }] },
        { id: 'sides', label: 'Sides', icon: 'Camera', fields: [{ name: 'sides', label: 'Side notes', type: 'textarea' }] },
        { id: 'rear', label: 'Rear', icon: 'Camera', fields: [{ name: 'rear', label: 'Rear notes', type: 'textarea' }] },
      ],
      submit: 'Save walkaround',
      done: 'Walkaround recorded for this session',
    },
    actions: [{ label: 'Start Walkaround', icon: 'Camera', intent: 'primary', kind: 'wizard' }],
    quickLinks: [goTo('Workshop Check-In', 'LogIn', '/workshop-check-in'), goTo('Inspection', 'ClipboardCheck', '/workshop-inspection')],
  },
  '/license-plate-recognition': {
    layout: 'wizard',
    wizard: {
      steps: [
        { id: 'plate', label: 'Plate', icon: 'ScanLine', fields: [{ name: 'plate', label: 'Plate', type: 'text', required: true, ltr: true }] },
      ],
      submit: 'Look up plate',
      done: 'Plate recorded — recognition needs a camera device',
      section: 'Recent Recognitions',
    },
    actions: [{ label: 'Scan Plate', icon: 'ScanLine', intent: 'primary', kind: 'wizard' }],
    notice: 'Recognition runs on a camera device; the demo records manual entries.',
    quickLinks: [goTo('Kiosk Check-In', 'Tablet', '/kiosk-check-in'), goTo('Vehicles', 'Car', '/vehicles')],
  },
  '/vehicle-checklist': {
    layout: 'split',
    quickLinks: [goTo('Inspection', 'ClipboardCheck', '/workshop-inspection'), goTo('Service Templates', 'FileType', '/service-templates')],
  },
  '/predictive-diagnostics': {
    layout: 'monitor',
    monitor: {
      gauges: [
        { label: 'Models', fromRows: true, max: 20, tone: 'info' },
        { label: 'Alerts', value: 0, max: 20, tone: 'warning' },
      ],
      feedTitle: 'Predictions',
    },
    quickLinks: [goTo('OBD Diagnostics', 'Cpu', '/obddiagnostics'), goTo('Diagnostic Report', 'Stethoscope', '/diagnostic-report')],
  },
  '/predictive-maintenance': {
    collection: {
      key: 'vehicles',
      fields: [
        { header: 'Plate', key: 'plate', code: true },
        { header: 'Vehicle', key: 'make' },
        { header: 'Mileage', key: 'mileage', numeric: true },
        { header: 'Last Service', key: 'last' },
      ],
    },
    quickLinks: [goTo('Appointments', 'Calendar', '/appointments'), goTo('Vehicles', 'Car', '/vehicles')],
  },
  '/vehicle-health-monitoring': {
    layout: 'monitor',
    monitor: {
      gauges: [
        { label: 'Connected', fromRows: true, max: 50, tone: 'info' },
        { label: 'Warnings', value: 0, max: 50, tone: 'warning' },
      ],
      feedTitle: 'Health Signals',
    },
    quickLinks: [goTo('OBD Diagnostics', 'Cpu', '/obddiagnostics')],
  },

  // ── Customers ───────────────────────────────────────────────────────────
  '/customer-loyalty': {
    collection: {
      key: 'customers',
      fields: [
        { header: 'Customer', key: 'name' },
        { header: 'Vehicles', key: 'vehicles', numeric: true },
        { header: 'Spent', key: 'spent', numeric: true },
        { header: 'Last Visit', key: 'last' },
      ],
    },
    quickLinks: [goTo('Customers', 'Users', '/customers'), goTo('Campaigns', 'Megaphone', '/campaigns')],
  },
  '/referral-program': {
    quickLinks: [goTo('Customers', 'Users', '/customers'), goTo('Campaigns', 'Megaphone', '/campaigns')],
  },
  '/customer-reviews-ratings': {
    layout: 'gallery',
    quickLinks: [goTo('Customer Feedback', 'MessageSquareText', '/customer-feedback')],
  },
  '/customer-ltv-analysis': {
    collection: {
      key: 'customers',
      fields: [
        { header: 'Customer', key: 'name' },
        { header: 'Lifetime Spend', key: 'spent', numeric: true },
        { header: 'Vehicles', key: 'vehicles', numeric: true },
        { header: 'Last Visit', key: 'last' },
      ],
    },
    quickLinks: [goTo('Customer Segments', 'Layers', '/customer-segments'), goTo('Reports', 'BarChart3', '/reports')],
  },

  // ── Scheduling ──────────────────────────────────────────────────────────
  '/appointment-reminders': {
    layout: 'calendar',
    collection: {
      key: 'appointments',
      fields: [
        { header: 'Time', key: 'time', code: true },
        { header: 'Customer', key: 'cust' },
        { header: 'Vehicle', key: 'veh' },
        { header: 'Service', key: 'svc' },
        { header: 'Status', key: 'status' },
      ],
    },
    quickLinks: [goTo('Appointments', 'Calendar', '/appointments'), goTo('SMS Campaigns', 'MessageSquare', '/smscampaigns')],
  },
  '/ai-scheduling': {
    layout: 'calendar',
    quickLinks: [goTo('Appointment Calendar', 'CalendarDays', '/appointment-calendar'), goTo('Technician Schedule', 'CalendarClock', '/technician-schedule')],
  },
  '/smart-assignment': {
    layout: 'board',
    board: {
      columns: [
        { id: 'unassigned', label: 'Unassigned', tone: 'warning' },
        { id: 'assigned', label: 'Assigned', tone: 'info' },
        { id: 'in bay', label: 'In Bay' },
      ],
      groupBy: -1,
    },
    quickLinks: [goTo('Technicians', 'HardHat', '/technicians'), goTo('Job Cards', 'ClipboardList', '/job-cards')],
  },
  '/service-bay-dashboard': {
    layout: 'monitor',
    monitor: {
      gauges: [
        { label: 'Bays in use', fromRows: true, max: 8, tone: 'info' },
        { label: 'Waiting', value: 0, max: 8, tone: 'warning' },
      ],
      feedTitle: 'Bay Activity',
    },
    quickLinks: [goTo('Job Cards', 'ClipboardList', '/job-cards'), goTo('Technician Schedule', 'CalendarClock', '/technician-schedule')],
  },

  // ── Parts & payments ────────────────────────────────────────────────────
  '/parts-auto-reorder': {
    layout: 'board',
    board: {
      columns: [
        { id: 'suggested', label: 'Suggested', tone: 'warning' },
        { id: 'ordered', label: 'Ordered', tone: 'info' },
        { id: 'received', label: 'Received' },
      ],
      groupBy: -1,
    },
    quickLinks: [goTo('Inventory', 'Package', '/inventory'), goTo('Parts Network', 'Network', '/parts-network')],
  },
  '/parts-availability': {
    collection: {
      key: 'parts',
      fields: [
        { header: 'Part', key: 'name' },
        { header: 'SKU', key: 'sku', code: true },
        { header: 'In Stock', key: 'stock', numeric: true },
        { header: 'Reorder At', key: 'reorder', numeric: true },
        { header: 'Price', key: 'price', numeric: true },
      ],
    },
    quickLinks: [goTo('Inventory', 'Package', '/inventory'), goTo('Parts Network', 'Network', '/parts-network')],
  },
  '/stripe-payment-processing': {
    notice: 'Card processing needs the gateway keys on the live API; the demo shows the flow only.',
    quickLinks: [goTo('Payments', 'CreditCard', '/payments'), goTo('Invoices', 'Receipt', '/invoices')],
  },
  '/refund-management': {
    layout: 'board',
    board: {
      columns: [
        { id: 'requested', label: 'Requested', tone: 'warning' },
        { id: 'approved', label: 'Approved', tone: 'info' },
        { id: 'paid', label: 'Paid' },
      ],
      groupBy: -1,
    },
    quickLinks: [goTo('Payments', 'CreditCard', '/payments'), goTo('Receipts', 'ReceiptText', '/receipts')],
  },

  // ── Quality & emerging tech ─────────────────────────────────────────────
  '/computer-vision-qc': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Inspections', fromRows: true, max: 50, tone: 'info' }], feedTitle: 'Recent Inspections' },
    notice: 'Vision checks need a camera rig; the demo shows recorded results only.',
    quickLinks: [goTo('Quality Check', 'ShieldCheck', '/workshop-qc')],
  },
  '/wearable-integration': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Devices', fromRows: true, max: 20, tone: 'info' }], feedTitle: 'Device Events' },
    notice: 'Pair a device to see live events; none is paired in the demo.',
    quickLinks: [goTo('Technicians', 'HardHat', '/technicians')],
  },
  '/voice-commands': { quickLinks: [goTo('Voice Interface', 'Mic', '/voice-command-interface'), goTo('AI Assistant', 'Bot', '/aiassistant')] },
  '/voice-command-interface': { quickLinks: [goTo('Voice Commands', 'MicVocal', '/voice-commands'), goTo('AI Assistant', 'Bot', '/aiassistant')] },
  '/drone-inspection': {
    layout: 'wizard',
    wizard: {
      steps: [
        { id: 'plan', label: 'Plan flight', icon: 'Route', fields: [{ name: 'area', label: 'Area', type: 'text', required: true }] },
        { id: 'review', label: 'Review', icon: 'Camera', fields: [{ name: 'notes', label: 'Findings', type: 'textarea' }] },
      ],
      submit: 'Record inspection',
      done: 'Inspection recorded — flights need a paired drone',
    },
    actions: [{ label: 'New Inspection', icon: 'Plus', intent: 'primary', kind: 'wizard' }],
    notice: 'Flights need a paired drone; the demo records plans only.',
  },
  '/ar-repair-guide': { layout: 'split', quickLinks: [goTo('Technician Knowledge Base', 'BookOpen', '/technician-kb')] },
  '/ar-overlay': { layout: 'gallery', notice: 'Overlays need an AR-capable device.' },
  '/vr-showroom': { layout: 'gallery', notice: 'Walkthroughs need a VR headset; the demo lists the models.' },
  '/blockchain-service-history': { layout: 'split', quickLinks: [goTo('Vehicle History', 'History', '/vehicle-history')] },
  '/smart-contracts': { layout: 'split', quickLinks: [goTo('Fleet Contracts', 'FileText', '/fleet-contract')] },
  '/quantum-computing': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Jobs', fromRows: true, max: 10, tone: 'info' }], feedTitle: 'Optimisation Runs' },
    notice: 'Experimental — runs need a quantum provider account; nothing is simulated here.',
  },
  '/digital-signage': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Screens online', fromRows: true, max: 10, tone: 'info' }], feedTitle: 'Screens' },
    notice: 'Pair a display to publish to it; none is paired in the demo.',
  },
  '/security-cameras': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Cameras online', fromRows: true, max: 16, tone: 'info' }, { label: 'Alerts', value: 0, max: 16, tone: 'warning' }], feedTitle: 'Cameras' },
    notice: 'Feeds need a camera network; none is connected in the demo.',
  },
  '/telematics-integration': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Devices', fromRows: true, max: 50, tone: 'info' }], feedTitle: 'Device Feed' },
    quickLinks: [goTo('Vehicle Tracking', 'MapPin', '/vehicle-tracking'), goTo('Fleet Management', 'Truck', '/fleet-management')],
  },
  '/smart-parts-recommender': { layout: 'split', quickLinks: [goTo('Inventory', 'Package', '/inventory')] },
  '/smart-inventory-forecasting': {
    collection: {
      key: 'parts',
      fields: [
        { header: 'Part', key: 'name' },
        { header: 'SKU', key: 'sku', code: true },
        { header: 'In Stock', key: 'stock', numeric: true },
        { header: 'Reorder At', key: 'reorder', numeric: true },
      ],
    },
    quickLinks: [goTo('Inventory', 'Package', '/inventory'), goTo('Inventory Reports', 'PackageSearch', '/inventory-reports')],
  },
  '/routing-optimizer': {
    layout: 'board',
    board: { columns: [{ id: 'planned', label: 'Planned', tone: 'info' }, { id: 'en route', label: 'En Route' }, { id: 'done', label: 'Done' }], groupBy: -1 },
    quickLinks: [goTo('Towing Services', 'Truck', '/towing-services')],
  },
  '/quality-control': {
    layout: 'board',
    board: { columns: [{ id: 'awaiting', label: 'Awaiting', tone: 'warning' }, { id: 'pass', label: 'Pass', tone: 'info' }, { id: 'rework', label: 'Rework', tone: 'warning' }], groupBy: -1 },
    quickLinks: [goTo('Quality Check', 'ShieldCheck', '/workshop-qc'), goTo('Job Cards', 'ClipboardList', '/job-cards')],
  },
  '/service-templates': { layout: 'split', quickLinks: [goTo('Estimates', 'FileText', '/estimates')] },
  '/live-service-tracking': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'In service', fromRows: true, max: 20, tone: 'info' }], feedTitle: 'Live Jobs' },
    quickLinks: [goTo('Job Cards', 'ClipboardList', '/job-cards')],
  },
  '/video-estimates': {
    layout: 'wizard',
    wizard: {
      steps: [{ id: 'clip', label: 'Clip', icon: 'Video', fields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'notes', label: 'Notes', type: 'textarea' }] }],
      submit: 'Save estimate note',
      done: 'Note saved — video upload needs a live API',
    },
    actions: [{ label: 'New Video Estimate', icon: 'Video', intent: 'primary', kind: 'wizard' }],
    quickLinks: [goTo('Estimates', 'FileText', '/estimates')],
  },
  '/video-consultations': { layout: 'calendar', quickLinks: [goTo('Appointments', 'Calendar', '/appointments')] },
  '/vehicle-storage': { quickLinks: [goTo('Vehicles', 'Car', '/vehicles')] },
  '/towing-services': { quickLinks: [goTo('Towing Assistance', 'Truck', '/towing-assistance')] },
  '/tire-management': { layout: 'split', quickLinks: [goTo('Inventory', 'Package', '/inventory')] },
  '/diagnostics-obd-hub': {
    layout: 'monitor',
    monitor: { gauges: [{ label: 'Connected Devices', fromRows: true, max: 10, tone: 'info' }], feedTitle: 'Connected Devices' },
    quickLinks: [goTo('OBD Diagnostics', 'Cpu', '/obddiagnostics'), goTo('Diagnostic Report', 'Stethoscope', '/diagnostic-report')],
  },
  '/oem-software-subscriptions': { layout: 'split', quickLinks: [goTo('OEM Integrations', 'Plug', '/oemintegrations')] },
}

/** The def with its layout choices applied. */
export function withLayout(def: FeatureDef): FeatureDef {
  const overrides = FEATURE_LAYOUTS[def.route]
  return overrides ? { ...def, ...overrides } : def
}
