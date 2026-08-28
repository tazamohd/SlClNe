import type { FeatureDef } from './types'

/** Feature screens rendered through the kit.
 *
 *  Content comes from each screen's reference screenshot in
 *  `project/spec-shots/` and its spec in `project/spec/`. Where the reference
 *  app shows an empty state (many of these features are not yet populated
 *  there), the empty state is reproduced honestly rather than filled with
 *  invented rows.
 *
 *  Colours follow the design system, not the screenshots: the reference app
 *  uses green for "In Stock" and purple for some metric icons, both forbidden
 *  by handoff README §7. Blue carries positive/neutral, orange carries
 *  attention. */
export const FEATURE_DEFS: readonly FeatureDef[] = [
  // ── Vehicle management ────────────────────────────────────────────────────
  {
    id: '027',
    route: '/vin-decoder',
    title: 'VIN Decoder',
    subtitle: 'Decode a vehicle identification number into make, model and specification',
    icon: 'ScanLine',
    action: { label: 'Decode VIN', icon: 'Search' },
    stats: [
      { label: 'Decoded Today', value: 0, caption: 'Lookups', highlight: true },
      { label: 'Matched', value: 0, caption: 'Known vehicles', tone: 'info' },
      { label: 'Unmatched', value: 0, caption: 'Needs review', tone: 'warning' },
      { label: 'Saved to Garage', value: 0, caption: 'Added vehicles' },
    ],
    sections: [
      {
        title: 'Recent Decodes',
        subtitle: 'VIN lookups performed in this branch',
        columns: ['VIN', 'Make & Model', 'Year', 'Decoded'],
        empty: {
          icon: 'ScanLine',
          title: 'No VINs decoded yet',
          description: 'Decoded vehicles will appear here automatically.',
        },
      },
    ],
  },
  {
    id: '025',
    route: '/vehicle-tracking',
    title: 'Vehicle Tracking',
    subtitle: 'Live location and movement history for tracked vehicles',
    icon: 'MapPin',
    stats: [
      { label: 'Tracked Vehicles', value: 0, caption: 'With a device', highlight: true },
      { label: 'Moving Now', value: 0, caption: 'In transit', tone: 'info' },
      { label: 'Idle', value: 0, caption: 'Stationary' },
      { label: 'Offline', value: 0, caption: 'No signal', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Live Positions',
        columns: ['Vehicle', 'Plate', 'Status', 'Last Seen'],
        empty: {
          icon: 'MapPin',
          title: 'No tracked vehicles',
          description: 'Fit a telematics device to start tracking.',
        },
      },
    ],
  },
  {
    id: '031',
    route: '/loaner-vehicles',
    title: 'Loaner Vehicles',
    subtitle: 'Courtesy cars issued while a customer vehicle is in the workshop',
    icon: 'Car',
    action: { label: 'Issue Loaner', icon: 'Plus' },
    stats: [
      { label: 'Fleet Size', value: 0, caption: 'Loaner vehicles', highlight: true },
      { label: 'On Loan', value: 0, caption: 'Currently issued', tone: 'info' },
      { label: 'Available', value: 0, caption: 'Ready to issue' },
      { label: 'Overdue', value: 0, caption: 'Past return date', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Loaner Register',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Issued To', 'Due Back', 'Status'],
        empty: {
          icon: 'Car',
          title: 'No loaner vehicles',
          description: 'Add a courtesy car to start issuing loaners.',
        },
      },
    ],
  },

  // ── Inspection & check-in ─────────────────────────────────────────────────
  {
    id: '035',
    route: '/digital-vehicle-walkaround',
    title: 'Digital Vehicle Walkaround',
    subtitle: 'Photo and video record of vehicle condition at handover',
    icon: 'Camera',
    action: { label: 'Start Walkaround', icon: 'Video' },
    stats: [
      { label: 'Walkarounds Today', value: 0, caption: 'Recorded', highlight: true },
      { label: 'Damage Noted', value: 0, caption: 'Findings', tone: 'warning' },
      { label: 'Shared', value: 0, caption: 'Sent to customer', tone: 'info' },
      { label: 'Awaiting Review', value: 0, caption: 'Unconfirmed' },
    ],
    sections: [
      {
        title: 'Recent Walkarounds',
        columns: ['Job Card', 'Vehicle', 'Recorded By', 'Findings', 'When'],
        empty: {
          icon: 'Camera',
          title: 'No walkarounds recorded yet',
          description: 'Walkarounds appear here as vehicles are received.',
        },
      },
    ],
  },
  {
    id: '036',
    route: '/license-plate-recognition',
    title: 'License Plate Recognition',
    subtitle: 'Automatic vehicle identification and entry tracking',
    icon: 'Camera',
    action: { label: 'Simulate Scan', icon: 'ScanLine' },
    stats: [
      { label: "Today's Scans", value: 0, caption: 'Captured', highlight: true },
      { label: 'Auto-Matched', value: 0, caption: 'Known vehicles', tone: 'info' },
      { label: 'Manual Review', value: 0, caption: 'Needs attention', tone: 'warning' },
      { label: 'Avg Confidence', value: '0%', caption: 'Recognition accuracy' },
    ],
    sections: [
      {
        title: 'Recent Plate Scans',
        columns: ['Plate', 'Vehicle', 'Confidence', 'Captured'],
        empty: {
          icon: 'Camera',
          title: 'No license plate scans recorded yet',
          description: 'Scans will appear here automatically.',
        },
      },
      {
        title: 'Vehicle Entry Log',
        columns: ['Plate', 'Direction', 'Gate', 'Time'],
        empty: { icon: 'LogIn', title: 'No entry logs recorded yet' },
      },
    ],
  },
  {
    id: '022',
    route: '/vehicle-checklist',
    title: 'Vehicle Checklist',
    subtitle: 'Standard condition checks recorded at intake',
    icon: 'ClipboardCheck',
    stats: [
      { label: 'Checklists Today', value: 0, caption: 'Completed', highlight: true },
      { label: 'Passed', value: 0, caption: 'No findings', tone: 'info' },
      { label: 'Failed Items', value: 0, caption: 'Need work', tone: 'warning' },
      { label: 'In Progress', value: 0, caption: 'Part-complete' },
    ],
    sections: [
      {
        title: 'Completed Checklists',
        columns: ['Job Card', 'Vehicle', 'Checked By', 'Result', 'When'],
        empty: { icon: 'ClipboardCheck', title: 'No checklists completed yet' },
      },
    ],
  },

  // ── Diagnostics ───────────────────────────────────────────────────────────
  {
    id: '038',
    route: '/predictive-diagnostics',
    title: 'Predictive Diagnostics',
    subtitle: 'Fault likelihood from OBD trends and service history',
    icon: 'Activity',
    stats: [
      { label: 'Vehicles Analysed', value: 0, caption: 'With OBD history', highlight: true },
      { label: 'Predictions', value: 0, caption: 'Open findings', tone: 'info' },
      { label: 'High Risk', value: 0, caption: 'Act soon', tone: 'warning' },
      { label: 'Model Confidence', value: '0%', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Predicted Faults',
        columns: ['Vehicle', 'Component', 'Likelihood', 'Window'],
        empty: {
          icon: 'Activity',
          title: 'No predictions yet',
          description: 'Predictions need OBD history to work from.',
        },
      },
    ],
  },
  {
    id: '039',
    route: '/predictive-maintenance',
    title: 'Predictive Maintenance',
    subtitle: 'Service due dates projected from mileage and usage',
    icon: 'CalendarClock',
    stats: [
      { label: 'Vehicles Monitored', value: 0, caption: 'Under a plan', highlight: true },
      { label: 'Due This Month', value: 0, caption: 'Upcoming', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
      { label: 'Booked', value: 0, caption: 'Appointment made' },
    ],
    sections: [
      {
        title: 'Upcoming Services',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Service', 'Projected Due', 'Status'],
        empty: { icon: 'CalendarClock', title: 'No maintenance projected yet' },
      },
    ],
  },
  {
    id: '024',
    route: '/vehicle-health-monitoring',
    title: 'Vehicle Health Monitoring',
    subtitle: 'Continuous health scoring from connected vehicle data',
    icon: 'HeartPulse',
    stats: [
      { label: 'Monitored', value: 0, caption: 'Connected vehicles', highlight: true },
      { label: 'Healthy', value: 0, caption: 'No alerts', tone: 'info' },
      { label: 'Warnings', value: 0, caption: 'Attention needed', tone: 'warning' },
      { label: 'Avg Health Score', value: '0%', caption: 'Fleet-wide' },
    ],
    sections: [
      {
        title: 'Health Alerts',
        columns: ['Vehicle', 'System', 'Severity', 'Detected'],
        empty: { icon: 'HeartPulse', title: 'No health alerts' },
      },
    ],
  },

  // ── Customer experience ───────────────────────────────────────────────────
  {
    id: '006',
    route: '/customer-loyalty',
    title: 'Customer Loyalty',
    subtitle: 'Points, tiers and rewards across the customer base',
    icon: 'Award',
    action: { label: 'New Reward', icon: 'Plus' },
    stats: [
      { label: 'Enrolled Members', value: 0, caption: 'Active accounts', highlight: true },
      { label: 'Points Issued', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Points Redeemed', value: 0, caption: 'This month' },
      { label: 'Expiring Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Members',
        searchable: true,
        columns: ['Customer', 'Tier', 'Points', 'Joined'],
        empty: { icon: 'Award', title: 'No loyalty members yet' },
      },
    ],
  },
  {
    id: '008',
    route: '/referral-program',
    title: 'Referral Program',
    subtitle: 'Track customer referrals and reward payouts',
    icon: 'Share2',
    stats: [
      { label: 'Referrals', value: 0, caption: 'All time', highlight: true },
      { label: 'Converted', value: 0, caption: 'Became customers', tone: 'info' },
      { label: 'Pending Reward', value: 0, caption: 'Awaiting payout', tone: 'warning' },
      { label: 'Rewards Paid', value: 'SAR 0.00', caption: 'All time' },
    ],
    sections: [
      {
        title: 'Referrals',
        columns: ['Referrer', 'Referred', 'Status', 'Reward', 'Date'],
        empty: { icon: 'Share2', title: 'No referrals yet' },
      },
    ],
  },
  {
    id: '007',
    route: '/customer-reviews-ratings',
    title: 'Customer Reviews & Ratings',
    subtitle: 'Feedback collected after service completion',
    icon: 'Star',
    stats: [
      { label: 'Reviews', value: 0, caption: 'All time', highlight: true },
      { label: 'Average Rating', value: '0.0', caption: 'Out of 5', tone: 'info' },
      { label: 'Awaiting Reply', value: 0, caption: 'Needs response', tone: 'warning' },
      { label: 'Response Rate', value: '0%', caption: 'Replied within 48h' },
    ],
    sections: [
      {
        title: 'Recent Reviews',
        columns: ['Customer', 'Job Card', 'Rating', 'Comment', 'Date'],
        empty: { icon: 'Star', title: 'No reviews yet' },
      },
    ],
  },
  {
    id: '011',
    route: '/customer-ltv-analysis',
    title: 'Customer LTV Analysis',
    subtitle: 'Lifetime value and spend patterns by customer segment',
    icon: 'TrendingUp',
    stats: [
      { label: 'Average LTV', value: 'SAR 0.00', caption: 'Per customer', highlight: true },
      { label: 'Top Decile LTV', value: 'SAR 0.00', caption: 'Highest 10%', tone: 'info' },
      { label: 'At Risk', value: 0, caption: 'Lapsing customers', tone: 'warning' },
      { label: 'Repeat Rate', value: '0%', caption: 'Returned within a year' },
    ],
    sections: [
      {
        title: 'Customers by Value',
        searchable: true,
        columns: ['Customer', 'Visits', 'Total Spend', 'Last Visit', 'LTV'],
        empty: { icon: 'TrendingUp', title: 'Not enough history to model LTV yet' },
      },
    ],
  },

  // ── Scheduling ────────────────────────────────────────────────────────────
  {
    id: '013',
    route: '/appointment-reminders',
    title: 'Appointment Reminders',
    subtitle: 'Automated SMS and WhatsApp reminders before a booking',
    icon: 'BellRing',
    action: { label: 'New Reminder Rule', icon: 'Plus' },
    stats: [
      { label: 'Scheduled', value: 0, caption: 'Queued to send', highlight: true },
      { label: 'Sent Today', value: 0, caption: 'Delivered', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'Delivery errors', tone: 'warning' },
      { label: 'No-Show Rate', value: '0%', caption: 'After reminder' },
    ],
    sections: [
      {
        title: 'Reminder Queue',
        columns: ['Customer', 'Appointment', 'Channel', 'Send At', 'Status'],
        empty: { icon: 'BellRing', title: 'No reminders queued' },
      },
    ],
  },
  {
    id: '016',
    route: '/ai-scheduling',
    title: 'AI Scheduling',
    subtitle: 'Suggested booking slots based on bay load and technician skills',
    icon: 'Sparkles',
    stats: [
      { label: 'Slots Suggested', value: 0, caption: 'This week', highlight: true },
      { label: 'Accepted', value: 0, caption: 'Booked as suggested', tone: 'info' },
      { label: 'Conflicts Avoided', value: 0, caption: 'Double-bookings' },
      { label: 'Bay Utilisation', value: '0%', caption: 'Projected' },
    ],
    sections: [
      {
        title: 'Suggested Slots',
        columns: ['Customer', 'Service', 'Suggested Slot', 'Bay', 'Technician'],
        empty: { icon: 'Sparkles', title: 'No suggestions yet' },
      },
    ],
  },
  {
    id: '017',
    route: '/smart-assignment',
    title: 'Smart Assignment',
    subtitle: 'Match jobs to technicians by skill, load and past performance',
    icon: 'Users',
    stats: [
      { label: 'Jobs Assigned', value: 0, caption: 'Automatically', highlight: true },
      { label: 'Reassigned', value: 0, caption: 'Overridden', tone: 'warning' },
      { label: 'Avg Match Score', value: '0%', caption: 'Skill fit', tone: 'info' },
      { label: 'Load Balance', value: '0%', caption: 'Evenness across techs' },
    ],
    sections: [
      {
        title: 'Assignments',
        columns: ['Job Card', 'Service', 'Technician', 'Match Score', 'Status'],
        empty: { icon: 'Users', title: 'No assignments made yet' },
      },
    ],
  },
  {
    id: '043',
    route: '/service-bay-dashboard',
    title: 'Service Bay Dashboard',
    subtitle: 'Live status of every workshop bay',
    icon: 'LayoutGrid',
    stats: [
      { label: 'Bays', value: 0, caption: 'Total', highlight: true },
      { label: 'Occupied', value: 0, caption: 'In use', tone: 'info' },
      { label: 'Free', value: 0, caption: 'Available' },
      { label: 'Blocked', value: 0, caption: 'Out of service', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Bay Status',
        columns: ['Bay', 'Vehicle', 'Job Card', 'Technician', 'Status'],
        empty: { icon: 'LayoutGrid', title: 'No bays configured' },
      },
    ],
  },

  // ── Parts & inventory ─────────────────────────────────────────────────────
  {
    id: '056',
    route: '/parts-auto-reorder',
    title: 'Parts Auto-Reorder',
    subtitle: 'Rules that raise purchase orders when stock falls below a threshold',
    icon: 'RefreshCw',
    action: { label: 'New Rule', icon: 'Plus' },
    stats: [
      { label: 'Active Rules', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Triggered', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Awaiting Approval', value: 0, caption: 'Draft orders', tone: 'warning' },
      { label: 'Stock-Outs Avoided', value: 0, caption: 'Estimated' },
    ],
    sections: [
      {
        title: 'Reorder Rules',
        searchable: true,
        columns: ['Part', 'SKU', 'Reorder At', 'Order Qty', 'Supplier', 'Status'],
        empty: { icon: 'RefreshCw', title: 'No auto-reorder rules configured' },
      },
    ],
  },
  {
    id: '055',
    route: '/parts-availability',
    title: 'Parts Availability',
    subtitle: 'Stock on hand across branches and partner garages',
    icon: 'PackageSearch',
    stats: [
      { label: 'Parts Tracked', value: 0, caption: 'Distinct SKUs', highlight: true },
      { label: 'In Stock', value: 0, caption: 'Above reorder point', tone: 'info' },
      { label: 'Low Stock', value: 0, caption: 'At or below', tone: 'warning' },
      { label: 'On Order', value: 0, caption: 'Inbound' },
    ],
    sections: [
      {
        title: 'Availability',
        searchable: true,
        columns: ['Part', 'SKU', 'Branch', 'On Hand', 'Status'],
        empty: { icon: 'PackageSearch', title: 'No parts tracked yet' },
      },
    ],
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  {
    id: '052',
    route: '/stripe-payment-processing',
    title: 'Stripe Payment Processing',
    subtitle: 'Card payments taken through the Stripe gateway',
    icon: 'CreditCard',
    stats: [
      { label: 'Processed Today', value: 'SAR 0.00', caption: 'Captured', highlight: true },
      { label: 'Successful', value: 0, caption: 'Payments', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'Declined', tone: 'warning' },
      { label: 'Payouts Pending', value: 'SAR 0.00', caption: 'To settle' },
    ],
    sections: [
      {
        title: 'Transactions',
        searchable: true,
        columns: ['Reference', 'Invoice', 'Customer', 'Amount', 'Status'],
        empty: {
          icon: 'CreditCard',
          title: 'No transactions yet',
          description: 'The payment gateway is not yet connected.',
        },
      },
    ],
  },
  {
    id: '053',
    route: '/refund-management',
    title: 'Refund Management',
    subtitle: 'Refund requests, approvals and settlement',
    icon: 'Undo2',
    stats: [
      { label: 'Open Requests', value: 0, caption: 'Awaiting decision', highlight: true },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Rejected', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Refunded', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Refund Requests',
        columns: ['Reference', 'Invoice', 'Customer', 'Amount', 'Status'],
        empty: { icon: 'Undo2', title: 'No refund requests' },
      },
    ],
  },

  // ── Emerging tech ─────────────────────────────────────────────────────────
  {
    id: '046',
    route: '/computer-vision-qc',
    title: 'Computer Vision QC',
    subtitle: 'Automated visual checks on completed work',
    icon: 'ScanEye',
    stats: [
      { label: 'Inspections', value: 0, caption: 'Processed', highlight: true },
      { label: 'Passed', value: 0, caption: 'No defects found', tone: 'info' },
      { label: 'Flagged', value: 0, caption: 'Needs human review', tone: 'warning' },
      { label: 'Avg Confidence', value: '0%', caption: 'Model certainty' },
    ],
    sections: [
      {
        title: 'Recent Inspections',
        columns: ['Job Card', 'Vehicle', 'Check', 'Result', 'Confidence'],
        empty: { icon: 'ScanEye', title: 'No vision inspections yet' },
      },
    ],
  },
  {
    id: '034',
    route: '/telematics-integration',
    title: 'Telematics Integration',
    subtitle: 'Connected devices streaming vehicle data',
    icon: 'Satellite',
    stats: [
      { label: 'Devices', value: 0, caption: 'Registered', highlight: true },
      { label: 'Reporting', value: 0, caption: 'Online now', tone: 'info' },
      { label: 'Silent', value: 0, caption: 'No recent data', tone: 'warning' },
      { label: 'Data Points', value: 0, caption: 'Last 24h' },
    ],
    sections: [
      {
        title: 'Connected Devices',
        columns: ['Device', 'Vehicle', 'Provider', 'Last Report', 'Status'],
        empty: { icon: 'Satellite', title: 'No telematics devices connected' },
      },
    ],
  },

  // ── AI hub ────────────────────────────────────────────────────────────────
  {
    id: '057',
    route: '/smart-parts-recommender',
    title: 'Smart Parts Recommender',
    subtitle: 'Suggested parts for a job from history and vehicle fitment',
    icon: 'Lightbulb',
    stats: [
      { label: 'Suggestions', value: 0, caption: 'This month', highlight: true },
      { label: 'Accepted', value: 0, caption: 'Added to jobs', tone: 'info' },
      { label: 'Fitment Conflicts', value: 0, caption: 'Blocked', tone: 'warning' },
      { label: 'Accuracy', value: '0%', caption: 'Accepted / suggested' },
    ],
    sections: [
      {
        title: 'Recent Suggestions',
        columns: ['Job Card', 'Vehicle', 'Part', 'Confidence', 'Outcome'],
        empty: { icon: 'Lightbulb', title: 'No recommendations yet' },
      },
    ],
  },
  {
    id: '059',
    route: '/smart-inventory-forecasting',
    title: 'Smart Inventory Forecasting',
    subtitle: 'Projected parts demand from booking and service trends',
    icon: 'LineChart',
    stats: [
      { label: 'SKUs Forecast', value: 0, caption: 'Modelled', highlight: true },
      { label: 'Shortfalls Predicted', value: 0, caption: 'Next 30 days', tone: 'warning' },
      { label: 'Overstock', value: 0, caption: 'Above need', tone: 'info' },
      { label: 'Forecast Horizon', value: '30d', caption: 'Rolling window' },
    ],
    sections: [
      {
        title: 'Forecast',
        searchable: true,
        columns: ['Part', 'SKU', 'On Hand', 'Projected Need', 'Gap'],
        empty: { icon: 'LineChart', title: 'Not enough history to forecast yet' },
      },
    ],
  },
  {
    id: '018',
    route: '/routing-optimizer',
    title: 'Routing Optimizer',
    subtitle: 'Efficient routes for mobile service and vehicle collection',
    icon: 'Route',
    stats: [
      { label: 'Routes Planned', value: 0, caption: 'Today', highlight: true },
      { label: 'Stops', value: 0, caption: 'Scheduled', tone: 'info' },
      { label: 'Distance Saved', value: '0 km', caption: 'Versus manual' },
      { label: 'Late Risk', value: 0, caption: 'Stops at risk', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Planned Routes',
        columns: ['Route', 'Driver', 'Stops', 'Distance', 'Window'],
        empty: { icon: 'Route', title: 'No routes planned' },
      },
    ],
  },

  // ── Enterprise / quality ──────────────────────────────────────────────────
  {
    id: '045',
    route: '/quality-control',
    title: 'Quality Control',
    subtitle: 'QC outcomes across jobs, technicians and branches',
    icon: 'ShieldCheck',
    stats: [
      { label: 'Checks This Month', value: 0, caption: 'Completed', highlight: true },
      { label: 'Passed First Time', value: '0%', caption: 'Right first time', tone: 'info' },
      { label: 'Returned to Repair', value: 0, caption: 'Failed QC', tone: 'warning' },
      { label: 'Avg Turnaround', value: '0h', caption: 'Repair to sign-off' },
    ],
    sections: [
      {
        title: 'Recent Checks',
        columns: ['Job Card', 'Vehicle', 'Technician', 'Inspector', 'Result'],
        empty: { icon: 'ShieldCheck', title: 'No quality checks recorded yet' },
      },
    ],
  },
  {
    id: '042',
    route: '/service-templates',
    title: 'Service Templates',
    subtitle: 'Reusable job definitions with standard parts and labour times',
    icon: 'ClipboardList',
    action: { label: 'New Template', icon: 'Plus' },
    stats: [
      { label: 'Templates', value: 0, caption: 'Defined', highlight: true },
      { label: 'Used This Month', value: 0, caption: 'Applied to jobs', tone: 'info' },
      { label: 'Needs Review', value: 0, caption: 'Stale pricing', tone: 'warning' },
      { label: 'Avg Labour Hours', value: '0.0', caption: 'Across templates' },
    ],
    sections: [
      {
        title: 'Templates',
        searchable: true,
        columns: ['Template', 'Category', 'Parts', 'Labour Hours', 'Price'],
        empty: { icon: 'ClipboardList', title: 'No service templates yet' },
      },
    ],
  },
  {
    id: '044',
    route: '/live-service-tracking',
    title: 'Live Service Tracking',
    subtitle: 'Real-time job progress shared with the customer',
    icon: 'Radio',
    stats: [
      { label: 'Tracked Jobs', value: 0, caption: 'In progress', highlight: true },
      { label: 'Customers Watching', value: 0, caption: 'Live viewers', tone: 'info' },
      { label: 'Behind Schedule', value: 0, caption: 'Past estimate', tone: 'warning' },
      { label: 'Updates Sent', value: 0, caption: 'Today' },
    ],
    sections: [
      {
        title: 'Live Jobs',
        columns: ['Job Card', 'Vehicle', 'Stage', 'Elapsed', 'Estimate'],
        empty: { icon: 'Radio', title: 'No jobs currently in progress' },
      },
    ],
  },

  // ── Video / consultation ──────────────────────────────────────────────────
  {
    id: '049',
    route: '/video-estimates',
    title: 'Video Estimates',
    subtitle: 'Estimates supported by a technician video walkthrough',
    icon: 'Video',
    stats: [
      { label: 'Video Estimates', value: 0, caption: 'Sent', highlight: true },
      { label: 'Viewed', value: 0, caption: 'By customer', tone: 'info' },
      { label: 'Approved', value: 0, caption: 'After viewing' },
      { label: 'Awaiting Response', value: 0, caption: 'No reply yet', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Sent Estimates',
        columns: ['Estimate', 'Customer', 'Vehicle', 'Sent', 'Status'],
        empty: { icon: 'Video', title: 'No video estimates sent yet' },
      },
    ],
  },
  {
    id: '050',
    route: '/video-consultations',
    title: 'Video Consultations',
    subtitle: 'Remote diagnosis calls with customers',
    icon: 'VideoIcon',
    action: { label: 'Start Call', icon: 'Video' },
    stats: [
      { label: 'Consultations', value: 0, caption: 'This month', highlight: true },
      { label: 'Converted to Jobs', value: 0, caption: 'Booked after call', tone: 'info' },
      { label: 'Missed', value: 0, caption: 'No-shows', tone: 'warning' },
      { label: 'Avg Duration', value: '0m', caption: 'Per call' },
    ],
    sections: [
      {
        title: 'Scheduled Calls',
        columns: ['Customer', 'Vehicle', 'Scheduled', 'Advisor', 'Status'],
        empty: { icon: 'VideoIcon', title: 'No consultations scheduled' },
      },
    ],
  },

  // ── Vehicle storage / towing ──────────────────────────────────────────────
  {
    id: '026',
    route: '/vehicle-storage',
    title: 'Vehicle Storage',
    subtitle: 'Vehicles held on site beyond their service window',
    icon: 'Warehouse',
    stats: [
      { label: 'In Storage', value: 0, caption: 'Vehicles', highlight: true },
      { label: 'Chargeable', value: 0, caption: 'Past free period', tone: 'info' },
      { label: 'Over 30 Days', value: 0, caption: 'Needs escalation', tone: 'warning' },
      { label: 'Storage Revenue', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Stored Vehicles',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Owner', 'Since', 'Days'],
        empty: { icon: 'Warehouse', title: 'No vehicles in storage' },
      },
    ],
  },
  {
    id: '033',
    route: '/towing-services',
    title: 'Towing Services',
    subtitle: 'Recovery jobs and partner tow operators',
    icon: 'Truck',
    action: { label: 'Request Tow', icon: 'Plus' },
    stats: [
      { label: 'Active Requests', value: 0, caption: 'In progress', highlight: true },
      { label: 'Completed', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Delayed', value: 0, caption: 'Past ETA', tone: 'warning' },
      { label: 'Avg Response', value: '0m', caption: 'Request to arrival' },
    ],
    sections: [
      {
        title: 'Tow Requests',
        columns: ['Reference', 'Vehicle', 'Pickup', 'Operator', 'Status'],
        empty: { icon: 'Truck', title: 'No tow requests' },
      },
    ],
  },
  {
    id: '030',
    route: '/tire-management',
    title: 'Tire Management',
    subtitle: 'Tread depth, rotation schedules and seasonal storage',
    icon: 'CircleDot',
    stats: [
      { label: 'Tire Sets Tracked', value: 0, caption: 'Registered', highlight: true },
      { label: 'Due for Rotation', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Below Legal Tread', value: 0, caption: 'Replace now', tone: 'warning' },
      { label: 'In Storage', value: 0, caption: 'Seasonal sets' },
    ],
    sections: [
      {
        title: 'Tire Sets',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Position', 'Tread', 'Status'],
        empty: { icon: 'CircleDot', title: 'No tire sets tracked yet' },
      },
    ],
  },

  // ── Diagnostics hub ───────────────────────────────────────────────────────
  {
    id: '037',
    route: '/diagnostics-obd-hub',
    title: 'Diagnostics & OBD Hub',
    subtitle: 'Connected diagnostic tools and live fault codes',
    icon: 'Cpu',
    stats: [
      { label: 'Devices Online', value: 0, caption: 'Connected', highlight: true },
      { label: 'Active Sessions', value: 0, caption: 'Reading now', tone: 'info' },
      { label: 'Open Fault Codes', value: 0, caption: 'Unresolved', tone: 'warning' },
      { label: 'Scans Today', value: 0, caption: 'Completed' },
    ],
    sections: [
      {
        title: 'Connected Devices',
        columns: ['Device', 'Bay', 'Vehicle', 'Status', 'Fault Codes'],
        empty: { icon: 'Cpu', title: 'No diagnostic devices connected' },
      },
    ],
  },
  {
    id: '040',
    route: '/oem-software-subscriptions',
    title: 'OEM Software Subscriptions',
    subtitle: 'Manufacturer diagnostic licences and renewal dates',
    icon: 'KeyRound',
    stats: [
      { label: 'Subscriptions', value: 0, caption: 'Active licences', highlight: true },
      { label: 'Expiring Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Seats In Use', value: 0, caption: 'Of allocated', tone: 'info' },
      { label: 'Annual Cost', value: 'SAR 0.00', caption: 'Committed' },
    ],
    sections: [
      {
        title: 'Licences',
        columns: ['Manufacturer', 'Product', 'Seats', 'Renews', 'Status'],
        empty: { icon: 'KeyRound', title: 'No OEM subscriptions recorded' },
      },
    ],
  },
  // ── Dashboards & overview ─────────────────────────────────────────────────
  {
    id: '001',
    route: '/dashboard-home',
    title: 'Dashboard Home',
    subtitle: 'Overview of garage operations and key metrics',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'Open Job Cards', value: 0, caption: 'In progress', highlight: true },
      { label: "Today's Appointments", value: 0, caption: 'Scheduled', tone: 'info' },
      { label: 'Awaiting Parts', value: 0, caption: 'Blocked jobs', tone: 'warning' },
      { label: "Revenue Today", value: 'SAR 0.00', caption: 'Invoiced' },
    ],
    sections: [
      {
        title: 'Activity Feed',
        subtitle: 'Recent events across the workshop',
        columns: ['Time', 'Event', 'Reference', 'By'],
        empty: { icon: 'Activity', title: 'No activity yet today' },
      },
    ],
  },
  {
    id: '002',
    route: '/welcome-page',
    title: 'Welcome',
    subtitle: 'Personalized landing page after login',
    icon: 'Home',
    stats: [
      { label: 'Tasks For You', value: 0, caption: 'Assigned', highlight: true },
      { label: 'Unread Messages', value: 0, caption: 'Inbox', tone: 'info' },
      { label: 'Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Shortcuts', value: 0, caption: 'Pinned' },
    ],
    sections: [
      {
        title: 'Quick Actions',
        subtitle: 'Jump back into your work',
        columns: ['Action', 'Description'],
        empty: { icon: 'Sparkles', title: 'Your workspace is ready', description: 'Pinned shortcuts and tasks appear here.' },
      },
    ],
  },
  {
    id: '003',
    route: '/dashboard-main',
    title: 'Operations Dashboard',
    subtitle: 'Comprehensive operational overview with real-time data',
    icon: 'Gauge',
    stats: [
      { label: 'Bay Utilisation', value: '0%', caption: 'Across all bays', highlight: true },
      { label: 'Jobs In Progress', value: 0, caption: 'Active now', tone: 'info' },
      { label: 'Overdue Jobs', value: 0, caption: 'Past estimate', tone: 'warning' },
      { label: 'Technicians On Shift', value: 0, caption: 'Clocked in' },
    ],
    sections: [
      {
        title: 'Live Workshop Status',
        columns: ['Bay', 'Job Card', 'Vehicle', 'Technician', 'Stage'],
        empty: { icon: 'LayoutGrid', title: 'No jobs currently in progress' },
      },
      {
        title: "Today's Bookings",
        columns: ['Time', 'Customer', 'Service', 'Advisor', 'Status'],
        empty: { icon: 'Calendar', title: 'No bookings for today' },
      },
    ],
  },
  {
    id: '004',
    route: '/customers-list',
    title: 'Customers',
    subtitle: 'Management of customer profiles and contact information',
    icon: 'Users',
    action: { label: 'New Customer', icon: 'UserPlus' },
    stats: [
      { label: 'Total Customers', value: 0, caption: 'On file', highlight: true },
      { label: 'New This Month', value: 0, caption: 'Added', tone: 'info' },
      { label: 'Active', value: 0, caption: 'Visited this year' },
      { label: 'Missing Details', value: 0, caption: 'Incomplete profiles', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Customer Directory',
        searchable: true,
        columns: ['Customer', 'Phone', 'Vehicles', 'Last Visit', 'Status'],
        empty: { icon: 'Users', title: 'No customers yet', description: 'Add a customer to get started.' },
      },
    ],
  },
  {
    id: '010',
    route: '/loyalty-program',
    title: 'Loyalty Program',
    subtitle: 'Setting up reward tiers and point systems',
    icon: 'Award',
    action: { label: 'New Tier', icon: 'Plus' },
    stats: [
      { label: 'Active Tiers', value: 0, caption: 'Configured', highlight: true },
      { label: 'Enrolled Members', value: 0, caption: 'Across tiers', tone: 'info' },
      { label: 'Points Outstanding', value: 0, caption: 'Unredeemed' },
      { label: 'Rules Needing Review', value: 0, caption: 'Stale earn rates', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Reward Tiers',
        columns: ['Tier', 'Points Threshold', 'Earn Rate', 'Members', 'Status'],
        empty: { icon: 'Award', title: 'No tiers configured yet' },
      },
    ],
  },
  // ── Scheduling & calendar ─────────────────────────────────────────────────
  {
    id: '014',
    route: '/calendar',
    title: 'Calendar',
    subtitle: 'Visual calendar view of all scheduled services',
    icon: 'Calendar',
    action: { label: 'New Appointment', icon: 'CalendarPlus' },
    stats: [
      { label: "Today's Bookings", value: 0, caption: 'Scheduled', highlight: true },
      { label: 'This Week', value: 0, caption: 'Upcoming', tone: 'info' },
      { label: 'Unconfirmed', value: 0, caption: 'Awaiting confirmation', tone: 'warning' },
      { label: 'Cancelled', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'Upcoming Appointments',
        columns: ['Date', 'Time', 'Customer', 'Service', 'Status'],
        empty: { icon: 'Calendar', title: 'Nothing scheduled' },
      },
    ],
  },
  {
    id: '015',
    route: '/workshop-calendar',
    title: 'Workshop Calendar',
    subtitle: 'Resource-based scheduling for service bays and technicians',
    icon: 'CalendarDays',
    stats: [
      { label: 'Bays', value: 0, caption: 'Schedulable', highlight: true },
      { label: 'Booked Slots', value: 0, caption: 'Today', tone: 'info' },
      { label: 'Free Capacity', value: '0%', caption: 'Remaining today' },
      { label: 'Overbooked', value: 0, caption: 'Conflicts', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Bay Schedule',
        columns: ['Bay', 'Technician', 'Job Card', 'From', 'To'],
        empty: { icon: 'CalendarDays', title: 'No bay bookings scheduled' },
      },
    ],
  },
  // ── Vehicles ──────────────────────────────────────────────────────────────
  {
    id: '020',
    route: '/vehicles-list',
    title: 'Vehicles',
    subtitle: 'Tabular view of vehicles with filtering and search',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'Total Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'In Workshop', value: 0, caption: 'Currently on site', tone: 'info' },
      { label: 'Due Service', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Fleet Vehicles', value: 0, caption: 'Managed fleets' },
    ],
    sections: [
      {
        title: 'Vehicle Register',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Owner', 'Mileage', 'Last Service'],
        empty: { icon: 'Car', title: 'No vehicles registered yet' },
      },
    ],
  },
  {
    id: '021',
    route: '/vehicle-inspections',
    title: 'Vehicle Inspections',
    subtitle: 'Digital inspection forms and checklists',
    icon: 'ClipboardCheck',
    action: { label: 'New Inspection', icon: 'Plus' },
    stats: [
      { label: 'Inspections This Month', value: 0, caption: 'Completed', highlight: true },
      { label: 'Passed', value: 0, caption: 'No advisories', tone: 'info' },
      { label: 'Advisories Raised', value: 0, caption: 'Needs work', tone: 'warning' },
      { label: 'In Progress', value: 0, caption: 'Part-complete' },
    ],
    sections: [
      {
        title: 'Recent Inspections',
        columns: ['Job Card', 'Vehicle', 'Inspector', 'Result', 'When'],
        empty: { icon: 'ClipboardCheck', title: 'No inspections completed yet' },
      },
    ],
  },
  {
    id: '023',
    route: '/vehicle-history',
    title: 'Vehicle History',
    subtitle: 'Comprehensive record of all past services for a vehicle',
    icon: 'History',
    stats: [
      { label: 'Services Logged', value: 0, caption: 'All vehicles', highlight: true },
      { label: 'Vehicles Tracked', value: 0, caption: 'With history', tone: 'info' },
      { label: 'Open Recalls', value: 0, caption: 'Outstanding', tone: 'warning' },
      { label: 'Avg Services / Vehicle', value: '0.0', caption: 'Lifetime' },
    ],
    sections: [
      {
        title: 'Service Records',
        searchable: true,
        columns: ['Date', 'Vehicle', 'Service', 'Mileage', 'Invoice'],
        empty: { icon: 'History', title: 'No service history recorded yet' },
      },
    ],
  },
  {
    id: '029',
    route: '/fleet-tracking',
    title: 'Fleet Tracking',
    subtitle: 'Real-time dashboard for managed fleet vehicles',
    icon: 'CarFront',
    stats: [
      { label: 'Fleet Vehicles', value: 0, caption: 'Under management', highlight: true },
      { label: 'On The Road', value: 0, caption: 'Active now', tone: 'info' },
      { label: 'In Service', value: 0, caption: 'At a garage', tone: 'warning' },
      { label: 'Idle', value: 0, caption: 'Parked' },
    ],
    sections: [
      {
        title: 'Fleet Status',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Fleet', 'Status', 'Location'],
        empty: { icon: 'CarFront', title: 'No fleet vehicles tracked yet' },
      },
    ],
  },
  {
    id: '032',
    route: '/towing-assistance',
    title: 'Towing Assistance',
    subtitle: 'Dispatching and tracking towing services',
    icon: 'Truck',
    action: { label: 'Dispatch Tow', icon: 'Plus' },
    stats: [
      { label: 'Active Dispatches', value: 0, caption: 'In progress', highlight: true },
      { label: 'Completed Today', value: 0, caption: 'Delivered', tone: 'info' },
      { label: 'Delayed', value: 0, caption: 'Past ETA', tone: 'warning' },
      { label: 'Avg Response', value: '0m', caption: 'Request to arrival' },
    ],
    sections: [
      {
        title: 'Dispatch Board',
        columns: ['Reference', 'Vehicle', 'Pickup', 'Driver', 'Status'],
        empty: { icon: 'Truck', title: 'No active tow dispatches' },
      },
    ],
  },
  // ── Parts & inventory ─────────────────────────────────────────────────────
  {
    id: '054',
    route: '/inventory-management',
    title: 'Inventory Management',
    subtitle: 'Tracking stock levels for parts and consumables',
    icon: 'Boxes',
    action: { label: 'Stock Adjustment', icon: 'Plus' },
    stats: [
      { label: 'Stock Items', value: 0, caption: 'Distinct SKUs', highlight: true },
      { label: 'In Stock', value: 0, caption: 'Above reorder point', tone: 'info' },
      { label: 'Low Stock', value: 0, caption: 'At or below', tone: 'warning' },
      { label: 'Stock Value', value: 'SAR 0.00', caption: 'On hand' },
    ],
    sections: [
      {
        title: 'Stock Levels',
        searchable: true,
        columns: ['Item', 'SKU', 'Category', 'On Hand', 'Status'],
        empty: { icon: 'Boxes', title: 'No stock items tracked yet' },
      },
    ],
  },
  {
    id: '058',
    route: '/smart-parts-recommendations',
    title: 'Smart Parts Recommendations',
    subtitle: 'Upsell and preventative part replacement suggestions',
    icon: 'Sparkles',
    stats: [
      { label: 'Suggestions', value: 0, caption: 'This month', highlight: true },
      { label: 'Accepted', value: 0, caption: 'Added to jobs', tone: 'info' },
      { label: 'Declined', value: 0, caption: 'Not taken', tone: 'warning' },
      { label: 'Upsell Value', value: 'SAR 0.00', caption: 'Realised' },
    ],
    sections: [
      {
        title: 'Recommendations',
        columns: ['Job Card', 'Vehicle', 'Part', 'Reason', 'Outcome'],
        empty: { icon: 'Sparkles', title: 'No recommendations yet' },
      },
    ],
  },
  {
    id: '060',
    route: '/automated-reordering',
    title: 'Automated Reordering',
    subtitle: 'Management of AI-triggered purchase orders',
    icon: 'RefreshCw',
    stats: [
      { label: 'Active Rules', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Draft Orders', value: 0, caption: 'Awaiting approval', tone: 'warning' },
      { label: 'Triggered', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Value Ordered', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Reorder Activity',
        columns: ['Part', 'SKU', 'Trigger Level', 'Order Qty', 'Status'],
        empty: { icon: 'RefreshCw', title: 'No automated orders yet' },
      },
    ],
  },
  {
    id: '061',
    route: '/spare-parts',
    title: 'Spare Parts',
    subtitle: 'Master list of all spare parts with specifications',
    icon: 'Package',
    action: { label: 'Add Part', icon: 'Plus' },
    stats: [
      { label: 'Catalogue Size', value: 0, caption: 'Distinct parts', highlight: true },
      { label: 'Active', value: 0, caption: 'Stocked', tone: 'info' },
      { label: 'Discontinued', value: 0, caption: 'No longer stocked', tone: 'warning' },
      { label: 'Categories', value: 0, caption: 'Part groups' },
    ],
    sections: [
      {
        title: 'Parts Catalogue',
        searchable: true,
        columns: ['Part', 'SKU', 'Category', 'Fits', 'Unit Price'],
        empty: { icon: 'Package', title: 'No spare parts catalogued yet' },
      },
    ],
  },
  {
    id: '062',
    route: '/barcode-scanner',
    title: 'Barcode Scanner',
    subtitle: 'Mobile-ready interface for rapid stock management',
    icon: 'ScanBarcode',
    action: { label: 'Start Scanning', icon: 'ScanBarcode' },
    stats: [
      { label: 'Scans Today', value: 0, caption: 'Captured', highlight: true },
      { label: 'Matched', value: 0, caption: 'Known parts', tone: 'info' },
      { label: 'Unknown Codes', value: 0, caption: 'Not in catalogue', tone: 'warning' },
      { label: 'Stock Moves', value: 0, caption: 'Recorded today' },
    ],
    sections: [
      {
        title: 'Recent Scans',
        columns: ['Barcode', 'Part', 'Action', 'Qty', 'When'],
        empty: { icon: 'ScanBarcode', title: 'No scans recorded yet' },
      },
    ],
  },
  {
    id: '063',
    route: '/internal-warehouse',
    title: 'Internal Warehouse',
    subtitle: 'Managing bin locations and internal part transfers',
    icon: 'Warehouse',
    stats: [
      { label: 'Bin Locations', value: 0, caption: 'Configured', highlight: true },
      { label: 'Occupied Bins', value: 0, caption: 'Holding stock', tone: 'info' },
      { label: 'Pending Transfers', value: 0, caption: 'In movement', tone: 'warning' },
      { label: 'Empty Bins', value: 0, caption: 'Available' },
    ],
    sections: [
      {
        title: 'Bin Locations',
        searchable: true,
        columns: ['Bin', 'Zone', 'Part', 'On Hand', 'Status'],
        empty: { icon: 'Warehouse', title: 'No bin locations configured' },
      },
    ],
  },
  {
    id: '064',
    route: '/interactive-3-d-parts',
    title: 'Interactive 3D Parts',
    subtitle: 'Exploded views for parts identification',
    icon: 'Layers',
    stats: [
      { label: '3D Assemblies', value: 0, caption: 'Available', highlight: true },
      { label: 'Vehicles Covered', value: 0, caption: 'With models', tone: 'info' },
      { label: 'Parts Mapped', value: 0, caption: 'Identifiable' },
      { label: 'Pending Models', value: 0, caption: 'Not yet added', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Available Assemblies',
        searchable: true,
        columns: ['Assembly', 'Vehicle', 'Parts', 'Updated'],
        empty: { icon: 'Layers', title: 'No 3D assemblies available yet' },
      },
    ],
  },
  {
    id: '065',
    route: '/parts-marketplace',
    title: 'Parts Marketplace',
    subtitle: 'B2B portal for buying and selling parts with other garages',
    icon: 'Store',
    action: { label: 'List a Part', icon: 'Plus' },
    stats: [
      { label: 'Active Listings', value: 0, caption: 'For sale', highlight: true },
      { label: 'Open Offers', value: 0, caption: 'Awaiting reply', tone: 'info' },
      { label: 'Sold This Month', value: 0, caption: 'Completed' },
      { label: 'Expiring Soon', value: 0, caption: 'Listings ending', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Marketplace Listings',
        searchable: true,
        columns: ['Part', 'Seller', 'Condition', 'Price', 'Status'],
        empty: { icon: 'Store', title: 'No marketplace listings yet' },
      },
    ],
  },
  {
    id: '066',
    route: '/dynamic-pricing',
    title: 'Dynamic Pricing',
    subtitle: 'Algorithmic pricing for parts and labour',
    icon: 'Percent',
    stats: [
      { label: 'Rules Active', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Items Repriced', value: 0, caption: 'This week', tone: 'info' },
      { label: 'Margin Impact', value: '0%', caption: 'Versus base' },
      { label: 'Below Floor', value: 0, caption: 'Blocked changes', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Pricing Rules',
        columns: ['Rule', 'Applies To', 'Adjustment', 'Floor', 'Status'],
        empty: { icon: 'Percent', title: 'No pricing rules configured' },
      },
    ],
  },
  {
    id: '067',
    route: '/intelligent-price-optimizer',
    title: 'Intelligent Price Optimizer',
    subtitle: 'AI-optimized pricing based on market data',
    icon: 'Target',
    stats: [
      { label: 'Items Analysed', value: 0, caption: 'With market data', highlight: true },
      { label: 'Recommended Changes', value: 0, caption: 'Awaiting review', tone: 'warning' },
      { label: 'Applied', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Projected Uplift', value: 'SAR 0.00', caption: 'Monthly' },
    ],
    sections: [
      {
        title: 'Price Recommendations',
        searchable: true,
        columns: ['Item', 'Current', 'Market', 'Recommended', 'Status'],
        empty: { icon: 'Target', title: 'Not enough market data yet' },
      },
    ],
  },
  {
    id: '068',
    route: '/suppliers',
    title: 'Suppliers',
    subtitle: 'Database of vendors and parts suppliers',
    icon: 'Building2',
    action: { label: 'Add Supplier', icon: 'Plus' },
    stats: [
      { label: 'Suppliers', value: 0, caption: 'On file', highlight: true },
      { label: 'Active', value: 0, caption: 'Trading', tone: 'info' },
      { label: 'On Hold', value: 0, caption: 'Suspended', tone: 'warning' },
      { label: 'Avg Lead Time', value: '0d', caption: 'To delivery' },
    ],
    sections: [
      {
        title: 'Supplier Directory',
        searchable: true,
        columns: ['Supplier', 'Category', 'Contact', 'Lead Time', 'Status'],
        empty: { icon: 'Building2', title: 'No suppliers on file yet' },
      },
    ],
  },
  {
    id: '069',
    route: '/purchase-orders',
    title: 'Purchase Orders',
    subtitle: 'Generating and tracking orders to suppliers',
    icon: 'ShoppingCart',
    action: { label: 'New Order', icon: 'Plus' },
    stats: [
      { label: 'Open Orders', value: 0, caption: 'In progress', highlight: true },
      { label: 'Awaiting Delivery', value: 0, caption: 'Dispatched', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past due date', tone: 'warning' },
      { label: 'Committed Value', value: 'SAR 0.00', caption: 'Open orders' },
    ],
    sections: [
      {
        title: 'Purchase Orders',
        searchable: true,
        columns: ['PO Number', 'Supplier', 'Items', 'Total', 'Status'],
        empty: { icon: 'ShoppingCart', title: 'No purchase orders raised yet' },
      },
    ],
  },
  {
    id: '070',
    route: '/vendor-supplier-portal',
    title: 'Vendor Supplier Portal',
    subtitle: 'Extranet for suppliers to manage orders and quotes',
    icon: 'Building',
    stats: [
      { label: 'Registered Vendors', value: 0, caption: 'With access', highlight: true },
      { label: 'Open Quote Requests', value: 0, caption: 'Awaiting response', tone: 'warning' },
      { label: 'Orders To Confirm', value: 0, caption: 'Pending vendor', tone: 'info' },
      { label: 'Active This Week', value: 0, caption: 'Logged in' },
    ],
    sections: [
      {
        title: 'Vendor Activity',
        columns: ['Vendor', 'Open Quotes', 'Open Orders', 'Last Active'],
        empty: { icon: 'Building', title: 'No vendor portal activity yet' },
      },
    ],
  },
  {
    id: '071',
    route: '/parts-network-dashboard',
    title: 'Parts Network Dashboard',
    subtitle: 'Overview of B2B parts network activity',
    icon: 'Network',
    stats: [
      { label: 'Network Members', value: 0, caption: 'Connected garages', highlight: true },
      { label: 'Open Requests', value: 0, caption: 'Across network', tone: 'info' },
      { label: 'Fulfilled', value: 0, caption: 'This month' },
      { label: 'Unanswered', value: 0, caption: 'Needs response', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Network Activity',
        columns: ['Request', 'From', 'Part', 'Quotes', 'Status'],
        empty: { icon: 'Network', title: 'No network activity yet' },
      },
    ],
  },
  {
    id: '073',
    route: '/parts-network-my-requests',
    title: 'My Network Requests',
    subtitle: 'Tracking sent requests and received quotes',
    icon: 'Send',
    action: { label: 'New Request', icon: 'Plus' },
    stats: [
      { label: 'Open Requests', value: 0, caption: 'Awaiting quotes', highlight: true },
      { label: 'Quotes Received', value: 0, caption: 'To review', tone: 'info' },
      { label: 'Accepted', value: 0, caption: 'This month' },
      { label: 'Expired', value: 0, caption: 'No response', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Sent Requests',
        columns: ['Request', 'Part', 'Quotes', 'Best Price', 'Status'],
        empty: { icon: 'Send', title: 'You have not sent any requests yet' },
      },
    ],
  },
  {
    id: '074',
    route: '/parts-network-incoming-requests',
    title: 'Incoming Network Requests',
    subtitle: 'Managing requests from other network members',
    icon: 'Inbox',
    stats: [
      { label: 'New Requests', value: 0, caption: 'Awaiting quote', highlight: true },
      { label: 'Quoted', value: 0, caption: 'Response sent', tone: 'info' },
      { label: 'Won', value: 0, caption: 'This month' },
      { label: 'Expiring', value: 0, caption: 'Respond soon', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Incoming Requests',
        columns: ['Request', 'From', 'Part', 'Qty', 'Status'],
        empty: { icon: 'Inbox', title: 'No incoming requests' },
      },
    ],
  },
  // ── Purchase agent portal ─────────────────────────────────────────────────
  {
    id: '079',
    route: '/purchase-agent-dashboard',
    title: 'Purchase Agent Dashboard',
    subtitle: 'Primary workspace for procurement agents',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'Assigned to you', highlight: true },
      { label: 'Quotes To Review', value: 0, caption: 'Awaiting decision', tone: 'warning' },
      { label: 'Orders In Transit', value: 0, caption: 'Inbound', tone: 'info' },
      { label: 'Saved This Month', value: 'SAR 0.00', caption: 'Versus list price' },
    ],
    sections: [
      {
        title: 'Priority Queue',
        columns: ['Task', 'Reference', 'Supplier', 'Due', 'Status'],
        empty: { icon: 'ListChecks', title: 'No priority tasks right now' },
      },
    ],
  },
  {
    id: '080',
    route: '/purchase-agent-tasks',
    title: 'Procurement Tasks',
    subtitle: 'Task list for order processing and follow-ups',
    icon: 'ListChecks',
    action: { label: 'New Task', icon: 'Plus' },
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'To do', highlight: true },
      { label: 'Due Today', value: 0, caption: 'Time-sensitive', tone: 'warning' },
      { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
      { label: 'Completed', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'Task List',
        searchable: true,
        columns: ['Task', 'Related To', 'Priority', 'Due', 'Status'],
        empty: { icon: 'ListChecks', title: 'No tasks assigned' },
      },
    ],
  },
  {
    id: '081',
    route: '/purchase-agent-quotations',
    title: 'Quotations',
    subtitle: 'Managing and comparing vendor quotes',
    icon: 'FileText',
    action: { label: 'Request Quote', icon: 'Plus' },
    stats: [
      { label: 'Open Quotes', value: 0, caption: 'Awaiting response', highlight: true },
      { label: 'Received', value: 0, caption: 'To compare', tone: 'info' },
      { label: 'Accepted', value: 0, caption: 'This month' },
      { label: 'Expired', value: 0, caption: 'Past validity', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Quotations',
        searchable: true,
        columns: ['Quote', 'Supplier', 'Items', 'Total', 'Status'],
        empty: { icon: 'FileText', title: 'No quotations yet' },
      },
    ],
  },
  {
    id: '082',
    route: '/purchase-agent-payments',
    title: 'Supplier Payments',
    subtitle: 'Monitoring payments to suppliers',
    icon: 'CreditCard',
    stats: [
      { label: 'Due This Week', value: 'SAR 0.00', caption: 'Payable', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms', tone: 'warning' },
      { label: 'Paid This Month', value: 'SAR 0.00', caption: 'Settled', tone: 'info' },
      { label: 'Pending Approval', value: 0, caption: 'Awaiting sign-off' },
    ],
    sections: [
      {
        title: 'Payments',
        searchable: true,
        columns: ['Invoice', 'Supplier', 'Amount', 'Due', 'Status'],
        empty: { icon: 'CreditCard', title: 'No supplier payments due' },
      },
    ],
  },
  {
    id: '083',
    route: '/purchase-agent-delivery',
    title: 'Deliveries',
    subtitle: 'Tracking incoming part deliveries',
    icon: 'Truck',
    stats: [
      { label: 'Expected Today', value: 0, caption: 'Arriving', highlight: true },
      { label: 'In Transit', value: 0, caption: 'Dispatched', tone: 'info' },
      { label: 'Delayed', value: 0, caption: 'Past ETA', tone: 'warning' },
      { label: 'Received This Week', value: 0, caption: 'Booked in' },
    ],
    sections: [
      {
        title: 'Incoming Deliveries',
        columns: ['Order', 'Supplier', 'Items', 'ETA', 'Status'],
        empty: { icon: 'Truck', title: 'No deliveries expected' },
      },
    ],
  },
  {
    id: '084',
    route: '/purchase-agent-orders',
    title: 'Agent Orders',
    subtitle: 'Order management for purchase agents',
    icon: 'ShoppingCart',
    action: { label: 'New Order', icon: 'Plus' },
    stats: [
      { label: 'Open Orders', value: 0, caption: 'In progress', highlight: true },
      { label: 'Awaiting Approval', value: 0, caption: 'Draft', tone: 'warning' },
      { label: 'Confirmed', value: 0, caption: 'With supplier', tone: 'info' },
      { label: 'Value This Month', value: 'SAR 0.00', caption: 'Ordered' },
    ],
    sections: [
      {
        title: 'Orders',
        searchable: true,
        columns: ['PO Number', 'Supplier', 'Items', 'Total', 'Status'],
        empty: { icon: 'ShoppingCart', title: 'No orders raised yet' },
      },
    ],
  },
  {
    id: '085',
    route: '/purchase-agent-suppliers',
    title: 'Agent Suppliers',
    subtitle: 'Supplier management interface for agents',
    icon: 'Building2',
    stats: [
      { label: 'My Suppliers', value: 0, caption: 'Assigned', highlight: true },
      { label: 'Preferred', value: 0, caption: 'Priority vendors', tone: 'info' },
      { label: 'Under Review', value: 0, caption: 'Performance concerns', tone: 'warning' },
      { label: 'Avg Rating', value: '0.0', caption: 'Out of 5' },
    ],
    sections: [
      {
        title: 'Supplier List',
        searchable: true,
        columns: ['Supplier', 'Category', 'Rating', 'Lead Time', 'Status'],
        empty: { icon: 'Building2', title: 'No suppliers assigned yet' },
      },
    ],
  },
  {
    id: '086',
    route: '/purchase-agent-inventory',
    title: 'Agent Inventory View',
    subtitle: 'Checking stock levels from an agent perspective',
    icon: 'Boxes',
    stats: [
      { label: 'Items Below Reorder', value: 0, caption: 'Need ordering', highlight: true, tone: 'warning' },
      { label: 'On Order', value: 0, caption: 'Inbound', tone: 'info' },
      { label: 'In Stock', value: 0, caption: 'Sufficient' },
      { label: 'Stock Value', value: 'SAR 0.00', caption: 'On hand' },
    ],
    sections: [
      {
        title: 'Stock Requiring Action',
        searchable: true,
        columns: ['Part', 'SKU', 'On Hand', 'Reorder At', 'Status'],
        empty: { icon: 'Boxes', title: 'All stock is above reorder point' },
      },
    ],
  },
  {
    id: '087',
    route: '/purchase-agent-price-compare',
    title: 'Price Comparison',
    subtitle: 'Side-by-side vendor pricing analysis',
    icon: 'Scale',
    stats: [
      { label: 'Parts Compared', value: 0, caption: 'This session', highlight: true },
      { label: 'Suppliers', value: 0, caption: 'In comparison', tone: 'info' },
      { label: 'Best-Price Wins', value: 0, caption: 'Cheapest picks' },
      { label: 'Potential Saving', value: 'SAR 0.00', caption: 'Versus current' },
    ],
    sections: [
      {
        title: 'Comparison',
        searchable: true,
        columns: ['Part', 'Supplier A', 'Supplier B', 'Supplier C', 'Best'],
        empty: { icon: 'Scale', title: 'Add parts to compare pricing' },
      },
    ],
  },
  {
    id: '088',
    route: '/purchase-agent-tracking',
    title: 'Shipment Tracking',
    subtitle: 'Real-time shipment monitoring for orders',
    icon: 'MapPin',
    stats: [
      { label: 'Active Shipments', value: 0, caption: 'In transit', highlight: true },
      { label: 'Out For Delivery', value: 0, caption: 'Arriving today', tone: 'info' },
      { label: 'Delayed', value: 0, caption: 'Behind schedule', tone: 'warning' },
      { label: 'Delivered This Week', value: 0, caption: 'Completed' },
    ],
    sections: [
      {
        title: 'Shipments',
        searchable: true,
        columns: ['Tracking', 'Order', 'Carrier', 'ETA', 'Status'],
        empty: { icon: 'MapPin', title: 'No shipments to track' },
      },
    ],
  },
  {
    id: '089',
    route: '/purchase-agent-reports',
    title: 'Procurement Reports',
    subtitle: 'Procurement efficiency and savings reports',
    icon: 'FileBarChart',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Spend This Month', value: 'SAR 0.00', caption: 'Total procurement', highlight: true },
      { label: 'Savings', value: 'SAR 0.00', caption: 'Versus list', tone: 'info' },
      { label: 'On-Time Delivery', value: '0%', caption: 'Supplier reliability' },
      { label: 'Orders Placed', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Report Library',
        columns: ['Report', 'Period', 'Generated', 'Format'],
        empty: { icon: 'FileBarChart', title: 'No reports generated yet' },
      },
    ],
  },
  // ── Technician portal ─────────────────────────────────────────────────────
  {
    id: '090',
    route: '/technician-portal-dashboard',
    title: 'Technician Dashboard',
    subtitle: 'Home screen for workshop technicians',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'Assigned Jobs', value: 0, caption: 'On your list', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Active now', tone: 'info' },
      { label: 'Awaiting Parts', value: 0, caption: 'Blocked', tone: 'warning' },
      { label: 'Hours Today', value: '0.0', caption: 'Clocked' },
    ],
    sections: [
      {
        title: 'My Jobs Today',
        columns: ['Job Card', 'Vehicle', 'Service', 'Bay', 'Status'],
        empty: { icon: 'Wrench', title: 'No jobs assigned to you today' },
      },
    ],
  },
  {
    id: '091',
    route: '/technician-portal-my-jobs',
    title: 'My Jobs',
    subtitle: 'List of assigned tasks for the technician',
    icon: 'Wrench',
    stats: [
      { label: 'Open Jobs', value: 0, caption: 'Assigned', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Started', tone: 'info' },
      { label: 'On Hold', value: 0, caption: 'Blocked', tone: 'warning' },
      { label: 'Completed Today', value: 0, caption: 'Finished' },
    ],
    sections: [
      {
        title: 'Assigned Jobs',
        searchable: true,
        columns: ['Job Card', 'Vehicle', 'Service', 'Priority', 'Status'],
        empty: { icon: 'Wrench', title: 'No jobs assigned' },
      },
    ],
  },
  {
    id: '092',
    route: '/technician-portal-time-clock',
    title: 'Time Clock',
    subtitle: 'Punching in and out and job timing',
    icon: 'Clock',
    action: { label: 'Clock In', icon: 'Play' },
    stats: [
      { label: 'Status', value: 'Clocked Out', caption: 'Current state', highlight: true },
      { label: 'Hours Today', value: '0.0', caption: 'Recorded', tone: 'info' },
      { label: 'Hours This Week', value: '0.0', caption: 'Recorded' },
      { label: 'Job Time Logged', value: '0.0', caption: 'Against job cards' },
    ],
    sections: [
      {
        title: "Today's Entries",
        columns: ['Job Card', 'Started', 'Ended', 'Duration'],
        empty: { icon: 'Clock', title: 'No time recorded today' },
      },
    ],
  },
  {
    id: '093',
    route: '/technician-portal-parts',
    title: 'Parts Requests',
    subtitle: 'Requesting parts for active job cards',
    icon: 'Package',
    action: { label: 'Request Part', icon: 'Plus' },
    stats: [
      { label: 'Open Requests', value: 0, caption: 'Awaiting parts', highlight: true },
      { label: 'Ready For Pickup', value: 0, caption: 'At the counter', tone: 'info' },
      { label: 'On Backorder', value: 0, caption: 'Not in stock', tone: 'warning' },
      { label: 'Issued Today', value: 0, caption: 'Collected' },
    ],
    sections: [
      {
        title: 'My Requests',
        columns: ['Job Card', 'Part', 'Qty', 'Requested', 'Status'],
        empty: { icon: 'Package', title: 'No parts requested' },
      },
    ],
  },
  {
    id: '094',
    route: '/technician-portal-documentation',
    title: 'Job Documentation',
    subtitle: 'Capturing photos and notes for job execution',
    icon: 'Camera',
    action: { label: 'Add Photo', icon: 'ImagePlus' },
    stats: [
      { label: 'Documented Jobs', value: 0, caption: 'This week', highlight: true },
      { label: 'Photos Captured', value: 0, caption: 'Attached', tone: 'info' },
      { label: 'Missing Docs', value: 0, caption: 'Needs photos', tone: 'warning' },
      { label: 'Shared', value: 0, caption: 'Sent to advisor' },
    ],
    sections: [
      {
        title: 'Recent Documentation',
        columns: ['Job Card', 'Vehicle', 'Photos', 'Notes', 'When'],
        empty: { icon: 'Camera', title: 'No documentation captured yet' },
      },
    ],
  },
  {
    id: '095',
    route: '/technician-portal-profile',
    title: 'Technician Profile',
    subtitle: 'Managing certifications and skills',
    icon: 'UserCircle',
    action: { label: 'Edit Profile', icon: 'Pencil' },
    stats: [
      { label: 'Certifications', value: 0, caption: 'Held', highlight: true },
      { label: 'Skills', value: 0, caption: 'Listed', tone: 'info' },
      { label: 'Expiring Soon', value: 0, caption: 'Within 90 days', tone: 'warning' },
      { label: 'Jobs Completed', value: 0, caption: 'All time' },
    ],
    sections: [
      {
        title: 'Certifications',
        columns: ['Certification', 'Issuer', 'Issued', 'Expires', 'Status'],
        empty: { icon: 'BadgeCheck', title: 'No certifications on record' },
      },
    ],
  },
  {
    id: '096',
    route: '/technician-portal-attendance',
    title: 'Attendance',
    subtitle: 'Historical record of technician work hours',
    icon: 'CalendarCheck',
    stats: [
      { label: 'Days Present', value: 0, caption: 'This month', highlight: true },
      { label: 'Hours Logged', value: '0.0', caption: 'This month', tone: 'info' },
      { label: 'Late Arrivals', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Leave Taken', value: 0, caption: 'Days this month' },
    ],
    sections: [
      {
        title: 'Attendance Log',
        columns: ['Date', 'Clock In', 'Clock Out', 'Hours', 'Status'],
        empty: { icon: 'CalendarCheck', title: 'No attendance records yet' },
      },
    ],
  },
  {
    id: '097',
    route: '/technician-portal-guides',
    title: 'Repair Guides',
    subtitle: 'Access to repair manuals and standard procedures',
    icon: 'BookOpen',
    stats: [
      { label: 'Guides Available', value: 0, caption: 'In library', highlight: true },
      { label: 'Recently Updated', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Bookmarked', value: 0, caption: 'Saved by you' },
      { label: 'Vehicles Covered', value: 0, caption: 'Makes and models' },
    ],
    sections: [
      {
        title: 'Guide Library',
        searchable: true,
        columns: ['Guide', 'Category', 'Vehicle', 'Updated'],
        empty: { icon: 'BookOpen', title: 'No guides available yet' },
      },
    ],
  },
  {
    id: '098',
    route: '/technician-portal-software',
    title: 'Diagnostic Software',
    subtitle: 'Direct access to OEM diagnostic interfaces',
    icon: 'Cpu',
    stats: [
      { label: 'Tools Available', value: 0, caption: 'Licensed', highlight: true },
      { label: 'Online', value: 0, caption: 'Ready to use', tone: 'info' },
      { label: 'Licence Expiring', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Active Sessions', value: 0, caption: 'Running now' },
    ],
    sections: [
      {
        title: 'Diagnostic Tools',
        columns: ['Tool', 'Manufacturer', 'Version', 'Status'],
        empty: { icon: 'Cpu', title: 'No diagnostic software configured' },
      },
    ],
  },
  // ── Team & performance ────────────────────────────────────────────────────
  {
    id: '099',
    route: '/technician-management',
    title: 'Technician Management',
    subtitle: 'Managing technician teams and assignments',
    icon: 'Users',
    action: { label: 'Add Technician', icon: 'UserPlus' },
    stats: [
      { label: 'Technicians', value: 0, caption: 'On the team', highlight: true },
      { label: 'On Shift', value: 0, caption: 'Clocked in', tone: 'info' },
      { label: 'On Leave', value: 0, caption: 'Away today', tone: 'warning' },
      { label: 'Avg Utilisation', value: '0%', caption: 'Billable hours' },
    ],
    sections: [
      {
        title: 'Team',
        searchable: true,
        columns: ['Technician', 'Specialty', 'Active Jobs', 'Utilisation', 'Status'],
        empty: { icon: 'Users', title: 'No technicians on the team yet' },
      },
    ],
  },
  {
    id: '100',
    route: '/technician-leaderboards',
    title: 'Technician Leaderboards',
    subtitle: 'Gamified performance tracking and rewards',
    icon: 'Crown',
    stats: [
      { label: 'Ranked Technicians', value: 0, caption: 'This month', highlight: true },
      { label: 'Top Performer', value: '—', caption: 'This month', tone: 'info' },
      { label: 'Jobs Completed', value: 0, caption: 'Team total' },
      { label: 'Avg Rating', value: '0.0', caption: 'Out of 5' },
    ],
    sections: [
      {
        title: 'Leaderboard',
        columns: ['Rank', 'Technician', 'Jobs', 'Rating', 'Points'],
        empty: { icon: 'Crown', title: 'No leaderboard data yet' },
      },
    ],
  },
  {
    id: '101',
    route: '/technician-performance',
    title: 'Technician Performance',
    subtitle: 'Detailed productivity and quality metrics for technicians',
    icon: 'BarChart3',
    stats: [
      { label: 'Avg Efficiency', value: '0%', caption: 'Actual vs estimate', highlight: true },
      { label: 'Right First Time', value: '0%', caption: 'Passed QC', tone: 'info' },
      { label: 'Comebacks', value: 0, caption: 'Rework this month', tone: 'warning' },
      { label: 'Jobs / Technician', value: '0.0', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Performance By Technician',
        searchable: true,
        columns: ['Technician', 'Jobs', 'Efficiency', 'RFT', 'Rating'],
        empty: { icon: 'BarChart3', title: 'Not enough data to report yet' },
      },
    ],
  },
  // ── Technician mobile app ─────────────────────────────────────────────────
  {
    id: '102',
    route: '/technician-mobile',
    title: 'Technician Mobile',
    subtitle: 'Progressive web app for technicians on the move',
    icon: 'Smartphone',
    stats: [
      { label: 'My Jobs', value: 0, caption: 'Assigned', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Notifications', value: 0, caption: 'Unread', tone: 'warning' },
      { label: 'Hours Today', value: '0.0', caption: 'Clocked' },
    ],
    sections: [
      {
        title: 'Today',
        columns: ['Job Card', 'Vehicle', 'Bay', 'Status'],
        empty: { icon: 'Wrench', title: 'Nothing on your list today' },
      },
    ],
  },
  {
    id: '103',
    route: '/technician-app-home',
    title: 'App Home',
    subtitle: 'Quick access dashboard for mobile technicians',
    icon: 'Home',
    stats: [
      { label: 'Next Job', value: '—', caption: 'Up next', highlight: true },
      { label: 'Open Jobs', value: 0, caption: 'Assigned', tone: 'info' },
      { label: 'Parts Ready', value: 0, caption: 'To collect' },
      { label: 'Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Shortcuts',
        columns: ['Action', 'Description'],
        empty: { icon: 'Smartphone', title: 'Your shortcuts appear here' },
      },
    ],
  },
  {
    id: '104',
    route: '/technician-app-jobs',
    title: 'App Jobs',
    subtitle: 'Job list optimized for mobile screens',
    icon: 'ClipboardList',
    stats: [
      { label: 'Open Jobs', value: 0, caption: 'Assigned', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Started', tone: 'info' },
      { label: 'On Hold', value: 0, caption: 'Blocked', tone: 'warning' },
      { label: 'Done Today', value: 0, caption: 'Completed' },
    ],
    sections: [
      {
        title: 'Jobs',
        searchable: true,
        columns: ['Job Card', 'Vehicle', 'Service', 'Status'],
        empty: { icon: 'ClipboardList', title: 'No jobs assigned' },
      },
    ],
  },
  {
    id: '105',
    route: '/technician-app-clock',
    title: 'App Time Clock',
    subtitle: 'Mobile-based time recording',
    icon: 'Clock',
    action: { label: 'Clock In', icon: 'Play' },
    stats: [
      { label: 'Status', value: 'Clocked Out', caption: 'Current state', highlight: true },
      { label: 'Hours Today', value: '0.0', caption: 'Recorded', tone: 'info' },
      { label: 'On Break', value: 'No', caption: 'Break state' },
      { label: 'Hours This Week', value: '0.0', caption: 'Recorded' },
    ],
    sections: [
      {
        title: "Today's Entries",
        columns: ['Started', 'Ended', 'Type', 'Duration'],
        empty: { icon: 'Clock', title: 'No time recorded today' },
      },
    ],
  },
  {
    id: '106',
    route: '/technician-app-lookup',
    title: 'Parts Lookup',
    subtitle: 'Scanning and looking up parts on the workshop floor',
    icon: 'ScanBarcode',
    action: { label: 'Scan', icon: 'ScanBarcode' },
    stats: [
      { label: 'Lookups Today', value: 0, caption: 'Searches', highlight: true },
      { label: 'Found In Stock', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Out Of Stock', value: 0, caption: 'Not available', tone: 'warning' },
      { label: 'Recent Scans', value: 0, caption: 'This session' },
    ],
    sections: [
      {
        title: 'Recent Lookups',
        columns: ['Part', 'SKU', 'On Hand', 'Location'],
        empty: { icon: 'Search', title: 'Scan or search to look up a part' },
      },
    ],
  },
  {
    id: '107',
    route: '/technician-app-profile',
    title: 'App Profile',
    subtitle: 'Managing mobile app settings and profile',
    icon: 'UserCog',
    action: { label: 'Edit', icon: 'Pencil' },
    stats: [
      { label: 'Certifications', value: 0, caption: 'Held', highlight: true },
      { label: 'Jobs Completed', value: 0, caption: 'All time', tone: 'info' },
      { label: 'Avg Rating', value: '0.0', caption: 'Out of 5' },
      { label: 'Notifications', value: 'On', caption: 'Push alerts' },
    ],
    sections: [
      {
        title: 'Preferences',
        columns: ['Setting', 'Value'],
        empty: { icon: 'Settings', title: 'Profile preferences appear here' },
      },
    ],
  },
  // ── Client portal ─────────────────────────────────────────────────────────
  {
    id: '108',
    route: '/client-portal-dashboard',
    title: 'Client Dashboard',
    subtitle: 'Customer overview of their vehicles and services',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Active Services', value: 0, caption: 'In progress', tone: 'info' },
      { label: 'Due Soon', value: 0, caption: 'Upcoming', tone: 'warning' },
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'To pay' },
    ],
    sections: [
      {
        title: 'Recent Activity',
        columns: ['Date', 'Vehicle', 'Activity', 'Status'],
        empty: { icon: 'Activity', title: 'No recent activity' },
      },
    ],
  },
  {
    id: '109',
    route: '/client-portal-vehicles',
    title: 'My Vehicles',
    subtitle: 'Manage your own vehicles',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Service Due', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'In Workshop', value: 0, caption: 'Being serviced', tone: 'info' },
      { label: 'Warranty Active', value: 0, caption: 'Covered' },
    ],
    sections: [
      {
        title: 'Vehicles',
        columns: ['Vehicle', 'Plate', 'Mileage', 'Next Service', 'Status'],
        empty: { icon: 'Car', title: 'No vehicles added yet', description: 'Add a vehicle to book services online.' },
      },
    ],
  },
  {
    id: '110',
    route: '/client-portal-appointments',
    title: 'My Appointments',
    subtitle: 'Online booking and appointment management',
    icon: 'Calendar',
    action: { label: 'Book Appointment', icon: 'CalendarPlus' },
    stats: [
      { label: 'Upcoming', value: 0, caption: 'Booked', highlight: true },
      { label: 'Awaiting Confirmation', value: 0, caption: 'Requested', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This year', tone: 'info' },
      { label: 'Cancelled', value: 0, caption: 'This year' },
    ],
    sections: [
      {
        title: 'Appointments',
        columns: ['Date', 'Time', 'Vehicle', 'Service', 'Status'],
        empty: { icon: 'Calendar', title: 'No appointments booked' },
      },
    ],
  },
  {
    id: '111',
    route: '/client-portal-invoices',
    title: 'My Invoices',
    subtitle: 'View and pay invoices online',
    icon: 'Receipt',
    stats: [
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'To pay', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past due', tone: 'warning' },
      { label: 'Paid This Year', value: 'SAR 0.00', caption: 'Settled', tone: 'info' },
      { label: 'Open Invoices', value: 0, caption: 'Unpaid' },
    ],
    sections: [
      {
        title: 'Invoices',
        searchable: true,
        columns: ['Invoice', 'Date', 'Vehicle', 'Amount', 'Status'],
        empty: { icon: 'Receipt', title: 'No invoices yet' },
      },
    ],
  },
  {
    id: '112',
    route: '/client-portal-profile',
    title: 'My Profile',
    subtitle: 'Manage contact info and preferences',
    icon: 'UserCircle',
    action: { label: 'Edit', icon: 'Pencil' },
    stats: [
      { label: 'Vehicles', value: 0, caption: 'On your account', highlight: true },
      { label: 'Loyalty Points', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Saved Cards', value: 0, caption: 'Payment methods' },
      { label: 'Notifications', value: 'On', caption: 'Reminders' },
    ],
    sections: [
      {
        title: 'Account Details',
        columns: ['Field', 'Value'],
        empty: { icon: 'UserCircle', title: 'Your details appear here' },
      },
    ],
  },
  {
    id: '113',
    route: '/client-portal-service-history',
    title: 'Service History',
    subtitle: 'Access your past service records',
    icon: 'History',
    stats: [
      { label: 'Services', value: 0, caption: 'All time', highlight: true },
      { label: 'This Year', value: 0, caption: 'Completed', tone: 'info' },
      { label: 'Total Spent', value: 'SAR 0.00', caption: 'All time' },
      { label: 'Open Advisories', value: 0, caption: 'Recommended work', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Past Services',
        searchable: true,
        columns: ['Date', 'Vehicle', 'Service', 'Cost', 'Invoice'],
        empty: { icon: 'History', title: 'No service history yet' },
      },
    ],
  },
  {
    id: '114',
    route: '/client-portal-live-tracking',
    title: 'Live Tracking',
    subtitle: 'Real-time progress for your services',
    icon: 'Activity',
    stats: [
      { label: 'Active Services', value: 0, caption: 'In progress', highlight: true },
      { label: 'Current Stage', value: '—', caption: 'Latest update', tone: 'info' },
      { label: 'Estimated Ready', value: '—', caption: 'Handover' },
      { label: 'Updates', value: 0, caption: 'Today' },
    ],
    sections: [
      {
        title: 'Service Progress',
        columns: ['Vehicle', 'Stage', 'Updated', 'Estimate'],
        empty: { icon: 'Activity', title: 'No services in progress' },
      },
    ],
  },
  {
    id: '115',
    route: '/client-portal-reminders',
    title: 'Reminders',
    subtitle: 'Manage service and appointment reminders',
    icon: 'Bell',
    stats: [
      { label: 'Active Reminders', value: 0, caption: 'Set up', highlight: true },
      { label: 'Due This Month', value: 0, caption: 'Coming up', tone: 'warning' },
      { label: 'Channels', value: 0, caption: 'SMS / email' },
      { label: 'Snoozed', value: 0, caption: 'Postponed' },
    ],
    sections: [
      {
        title: 'My Reminders',
        columns: ['Vehicle', 'Reminder', 'Due', 'Channel', 'Status'],
        empty: { icon: 'Bell', title: 'No reminders set' },
      },
    ],
  },
  {
    id: '116',
    route: '/client-portal-review-chat',
    title: 'Reviews & Chat',
    subtitle: 'Post-service reviews and direct communication',
    icon: 'MessageSquare',
    action: { label: 'New Message', icon: 'Send' },
    stats: [
      { label: 'Open Conversations', value: 0, caption: 'With the garage', highlight: true },
      { label: 'Unread', value: 0, caption: 'New messages', tone: 'warning' },
      { label: 'Reviews Left', value: 0, caption: 'All time', tone: 'info' },
      { label: 'Awaiting Review', value: 0, caption: 'Recent services' },
    ],
    sections: [
      {
        title: 'Conversations',
        columns: ['With', 'Last Message', 'Updated', 'Status'],
        empty: { icon: 'MessageSquare', title: 'No conversations yet' },
      },
    ],
  },
  // ── Customer app ──────────────────────────────────────────────────────────
  {
    id: '118',
    route: '/customer-app-booking',
    title: 'Book a Service',
    subtitle: 'Book appointments via the mobile app',
    icon: 'CalendarPlus',
    action: { label: 'New Booking', icon: 'Plus' },
    stats: [
      { label: 'Upcoming', value: 0, caption: 'Booked', highlight: true },
      { label: 'Available Slots', value: 0, caption: 'This week', tone: 'info' },
      { label: 'Awaiting Confirmation', value: 0, caption: 'Requested', tone: 'warning' },
      { label: 'Nearest Branch', value: '—', caption: 'By location' },
    ],
    sections: [
      {
        title: 'My Bookings',
        columns: ['Date', 'Vehicle', 'Service', 'Branch', 'Status'],
        empty: { icon: 'CalendarPlus', title: 'No bookings yet', description: 'Choose a service to book online.' },
      },
    ],
  },
  {
    id: '119',
    route: '/customer-app-vehicles',
    title: 'My Vehicles',
    subtitle: 'Manage your vehicles on mobile',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Service Due', value: 0, caption: 'Soon', tone: 'warning' },
      { label: 'In Service', value: 0, caption: 'At the garage', tone: 'info' },
      { label: 'Documents', value: 0, caption: 'Stored' },
    ],
    sections: [
      {
        title: 'Vehicles',
        columns: ['Vehicle', 'Plate', 'Mileage', 'Next Service'],
        empty: { icon: 'Car', title: 'No vehicles added yet' },
      },
    ],
  },
  {
    id: '120',
    route: '/customer-app-payments',
    title: 'Payments',
    subtitle: 'Pay for services via mobile wallet or card',
    icon: 'Wallet',
    action: { label: 'Add Card', icon: 'Plus' },
    stats: [
      { label: 'Balance Due', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Saved Cards', value: 0, caption: 'Payment methods', tone: 'info' },
      { label: 'Paid This Year', value: 'SAR 0.00', caption: 'Settled' },
      { label: 'Loyalty Credit', value: 'SAR 0.00', caption: 'Available' },
    ],
    sections: [
      {
        title: 'Payment History',
        columns: ['Date', 'Invoice', 'Method', 'Amount', 'Status'],
        empty: { icon: 'Wallet', title: 'No payments yet' },
      },
    ],
  },
  // ── Generic customer portal ───────────────────────────────────────────────
  {
    id: '122',
    route: '/portal-dashboard',
    title: 'Portal Dashboard',
    subtitle: 'Customer self-service overview',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Upcoming Appointments', value: 0, caption: 'Booked', tone: 'info' },
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'To pay', tone: 'warning' },
      { label: 'Unread Messages', value: 0, caption: 'From the garage' },
    ],
    sections: [
      {
        title: 'Recent Activity',
        columns: ['Date', 'Activity', 'Vehicle', 'Status'],
        empty: { icon: 'Activity', title: 'No recent activity' },
      },
    ],
  },
  {
    id: '123',
    route: '/portal-appointments',
    title: 'Portal Appointments',
    subtitle: 'View and manage your bookings',
    icon: 'Calendar',
    action: { label: 'Book', icon: 'CalendarPlus' },
    stats: [
      { label: 'Upcoming', value: 0, caption: 'Booked', highlight: true },
      { label: 'Awaiting Confirmation', value: 0, caption: 'Requested', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This year', tone: 'info' },
      { label: 'Cancelled', value: 0, caption: 'This year' },
    ],
    sections: [
      {
        title: 'Appointments',
        columns: ['Date', 'Time', 'Vehicle', 'Service', 'Status'],
        empty: { icon: 'Calendar', title: 'No appointments booked' },
      },
    ],
  },
  {
    id: '124',
    route: '/portal-invoices',
    title: 'Portal Invoices',
    subtitle: 'View and settle your invoices',
    icon: 'Receipt',
    stats: [
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'To pay', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past due', tone: 'warning' },
      { label: 'Paid This Year', value: 'SAR 0.00', caption: 'Settled', tone: 'info' },
      { label: 'Open Invoices', value: 0, caption: 'Unpaid' },
    ],
    sections: [
      {
        title: 'Invoices',
        searchable: true,
        columns: ['Invoice', 'Date', 'Amount', 'Status'],
        empty: { icon: 'Receipt', title: 'No invoices yet' },
      },
    ],
  },
  {
    id: '125',
    route: '/portal-vehicles',
    title: 'Portal Vehicles',
    subtitle: 'Manage your registered vehicles',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Service Due', value: 0, caption: 'Soon', tone: 'warning' },
      { label: 'In Workshop', value: 0, caption: 'Being serviced', tone: 'info' },
      { label: 'Warranty Active', value: 0, caption: 'Covered' },
    ],
    sections: [
      {
        title: 'Vehicles',
        columns: ['Vehicle', 'Plate', 'Mileage', 'Next Service', 'Status'],
        empty: { icon: 'Car', title: 'No vehicles added yet' },
      },
    ],
  },
  {
    id: '126',
    route: '/portal-communications',
    title: 'Portal Communications',
    subtitle: 'Messages and notifications from the garage',
    icon: 'MessageCircle',
    action: { label: 'New Message', icon: 'Send' },
    stats: [
      { label: 'Conversations', value: 0, caption: 'Open threads', highlight: true },
      { label: 'Unread', value: 0, caption: 'New messages', tone: 'warning' },
      { label: 'Notifications', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Response Time', value: '0h', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Messages',
        columns: ['From', 'Subject', 'Received', 'Status'],
        empty: { icon: 'MessageCircle', title: 'No messages yet' },
      },
    ],
  },
  // ── Business intelligence ─────────────────────────────────────────────────
  {
    id: '129',
    route: '/business-intelligence',
    title: 'Business Intelligence',
    subtitle: 'Analytics and insight across the business',
    icon: 'BarChart3',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
      { label: 'Gross Margin', value: '0%', caption: 'This month', tone: 'info' },
      { label: 'Jobs Completed', value: 0, caption: 'This month' },
      { label: 'Below Target', value: 0, caption: 'KPIs off track', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Reports',
        columns: ['Report', 'Metric', 'Period', 'Updated'],
        empty: { icon: 'BarChart3', title: 'No reports available yet' },
      },
    ],
  },
  {
    id: '130',
    route: '/business-intelligence-dashboard',
    title: 'BI Dashboard',
    subtitle: 'Executive metrics at a glance',
    icon: 'PieChart',
    stats: [
      { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
      { label: 'Avg Ticket', value: 'SAR 0.00', caption: 'Per job', tone: 'info' },
      { label: 'Utilisation', value: '0%', caption: 'Workshop' },
      { label: 'Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Key Metrics',
        columns: ['Metric', 'Value', 'Trend', 'Target'],
        empty: { icon: 'PieChart', title: 'No metrics to display yet' },
      },
    ],
  },
  {
    id: '131',
    route: '/business-heatmaps',
    title: 'Business Heatmaps',
    subtitle: 'Demand and activity patterns over time',
    icon: 'Grid3x3',
    stats: [
      { label: 'Peak Day', value: '—', caption: 'Busiest', highlight: true },
      { label: 'Peak Hour', value: '—', caption: 'Busiest', tone: 'info' },
      { label: 'Quietest Slot', value: '—', caption: 'Lowest demand' },
      { label: 'Coverage Gaps', value: 0, caption: 'Understaffed slots', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Activity By Slot',
        columns: ['Day', 'Hour', 'Bookings', 'Utilisation'],
        empty: { icon: 'Grid3x3', title: 'Not enough data to map yet' },
      },
    ],
  },
  {
    id: '132',
    route: '/profit-analysis',
    title: 'Profit Analysis',
    subtitle: 'Margin breakdown by service, part and branch',
    icon: 'TrendingUp',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Gross Profit MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
      { label: 'Margin', value: '0%', caption: 'This month', tone: 'info' },
      { label: 'Labour Margin', value: '0%', caption: 'This month' },
      { label: 'Low-Margin Lines', value: 0, caption: 'Below target', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Profit By Category',
        searchable: true,
        columns: ['Category', 'Revenue', 'Cost', 'Profit', 'Margin'],
        empty: { icon: 'TrendingUp', title: 'Not enough data to analyse yet' },
      },
    ],
  },
  {
    id: '133',
    route: '/kpi-dashboard',
    title: 'KPI Dashboard',
    subtitle: 'Track performance against targets',
    icon: 'Gauge',
    stats: [
      { label: 'KPIs Tracked', value: 0, caption: 'Configured', highlight: true },
      { label: 'On Target', value: 0, caption: 'Meeting goal', tone: 'info' },
      { label: 'Off Target', value: 0, caption: 'Below goal', tone: 'warning' },
      { label: 'Improving', value: 0, caption: 'Positive trend' },
    ],
    sections: [
      {
        title: 'Indicators',
        columns: ['KPI', 'Current', 'Target', 'Trend', 'Status'],
        empty: { icon: 'Gauge', title: 'No KPIs configured yet' },
      },
    ],
  },
  {
    id: '134',
    route: '/productivity-tracker',
    title: 'Productivity Tracker',
    subtitle: 'Output and efficiency across the workshop',
    icon: 'Activity',
    stats: [
      { label: 'Billable Hours', value: '0.0', caption: 'This week', highlight: true },
      { label: 'Efficiency', value: '0%', caption: 'Actual vs sold', tone: 'info' },
      { label: 'Idle Time', value: '0.0', caption: 'Hours this week', tone: 'warning' },
      { label: 'Jobs / Day', value: '0.0', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Productivity By Technician',
        searchable: true,
        columns: ['Technician', 'Billable', 'Attended', 'Efficiency'],
        empty: { icon: 'Activity', title: 'No productivity data yet' },
      },
    ],
  },
  // ── HR & workforce ────────────────────────────────────────────────────────
  {
    id: '135',
    route: '/hr-management',
    title: 'HR Management',
    subtitle: 'Employee records and workforce administration',
    icon: 'Users',
    action: { label: 'Add Employee', icon: 'UserPlus' },
    stats: [
      { label: 'Employees', value: 0, caption: 'On the books', highlight: true },
      { label: 'On Leave Today', value: 0, caption: 'Away', tone: 'warning' },
      { label: 'New Hires', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Open Positions', value: 0, caption: 'Recruiting' },
    ],
    sections: [
      {
        title: 'Employees',
        searchable: true,
        columns: ['Employee', 'Role', 'Department', 'Started', 'Status'],
        empty: { icon: 'Users', title: 'No employees on record yet' },
      },
    ],
  },
  {
    id: '136',
    route: '/staff-directory',
    title: 'Staff Directory',
    subtitle: 'Contact details and roles across the team',
    icon: 'Contact',
    stats: [
      { label: 'Staff', value: 0, caption: 'Listed', highlight: true },
      { label: 'Departments', value: 0, caption: 'Across the business', tone: 'info' },
      { label: 'On Shift', value: 0, caption: 'Working now' },
      { label: 'Missing Details', value: 0, caption: 'Incomplete', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Directory',
        searchable: true,
        columns: ['Name', 'Role', 'Department', 'Phone', 'Email'],
        empty: { icon: 'Contact', title: 'No staff listed yet' },
      },
    ],
  },
  {
    id: '137',
    route: '/staff-scheduling',
    title: 'Staff Scheduling',
    subtitle: 'Shift rota and roster planning',
    icon: 'CalendarDays',
    action: { label: 'New Shift', icon: 'Plus' },
    stats: [
      { label: 'Shifts This Week', value: 0, caption: 'Scheduled', highlight: true },
      { label: 'Open Shifts', value: 0, caption: 'Unassigned', tone: 'warning' },
      { label: 'On Shift Now', value: 0, caption: 'Working', tone: 'info' },
      { label: 'Coverage', value: '0%', caption: 'Against demand' },
    ],
    sections: [
      {
        title: 'Roster',
        columns: ['Employee', 'Date', 'Shift', 'Role', 'Status'],
        empty: { icon: 'CalendarDays', title: 'No shifts scheduled' },
      },
    ],
  },
  {
    id: '138',
    route: '/staff-performance-review',
    title: 'Performance Reviews',
    subtitle: 'Appraisals and development tracking',
    icon: 'Star',
    action: { label: 'New Review', icon: 'Plus' },
    stats: [
      { label: 'Reviews Due', value: 0, caption: 'This quarter', highlight: true },
      { label: 'Completed', value: 0, caption: 'This quarter', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
      { label: 'Avg Score', value: '0.0', caption: 'Out of 5' },
    ],
    sections: [
      {
        title: 'Reviews',
        searchable: true,
        columns: ['Employee', 'Reviewer', 'Due', 'Score', 'Status'],
        empty: { icon: 'Star', title: 'No reviews scheduled yet' },
      },
    ],
  },
  {
    id: '139',
    route: '/timesheet-management',
    title: 'Timesheet Management',
    subtitle: 'Recorded hours and approvals',
    icon: 'Clock',
    stats: [
      { label: 'Awaiting Approval', value: 0, caption: 'Submitted', highlight: true, tone: 'warning' },
      { label: 'Approved This Week', value: 0, caption: 'Signed off', tone: 'info' },
      { label: 'Total Hours', value: '0.0', caption: 'This week' },
      { label: 'Discrepancies', value: 0, caption: 'Flagged', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Timesheets',
        searchable: true,
        columns: ['Employee', 'Period', 'Hours', 'Overtime', 'Status'],
        empty: { icon: 'Clock', title: 'No timesheets submitted yet' },
      },
    ],
  },
  {
    id: '140',
    route: '/timeclock-payroll',
    title: 'Timeclock & Payroll',
    subtitle: 'Bridge clocked hours into payroll',
    icon: 'Timer',
    stats: [
      { label: 'Hours To Process', value: '0.0', caption: 'This period', highlight: true },
      { label: 'Overtime', value: '0.0', caption: 'Hours' },
      { label: 'Exceptions', value: 0, caption: 'Need review', tone: 'warning' },
      { label: 'Ready For Payroll', value: 0, caption: 'Approved', tone: 'info' },
    ],
    sections: [
      {
        title: 'Clock Records',
        searchable: true,
        columns: ['Employee', 'Regular', 'Overtime', 'Period', 'Status'],
        empty: { icon: 'Timer', title: 'No clock records this period' },
      },
    ],
  },
  {
    id: '141',
    route: '/payroll-management',
    title: 'Payroll Management',
    subtitle: 'Salaries, deductions and payslips',
    icon: 'Banknote',
    action: { label: 'Run Payroll', icon: 'Play' },
    stats: [
      { label: 'Payroll This Month', value: 'SAR 0.00', caption: 'Gross', highlight: true },
      { label: 'Employees Paid', value: 0, caption: 'This run', tone: 'info' },
      { label: 'Pending', value: 0, caption: 'Not yet run', tone: 'warning' },
      { label: 'Deductions', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Payroll Runs',
        columns: ['Period', 'Employees', 'Gross', 'Net', 'Status'],
        empty: { icon: 'Banknote', title: 'No payroll runs yet' },
      },
    ],
  },
  {
    id: '142',
    route: '/leave-requests',
    title: 'Leave Requests',
    subtitle: 'Time-off requests and approvals',
    icon: 'CalendarX',
    action: { label: 'Request Leave', icon: 'Plus' },
    stats: [
      { label: 'Pending', value: 0, caption: 'Awaiting approval', highlight: true, tone: 'warning' },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'On Leave Today', value: 0, caption: 'Away' },
      { label: 'Upcoming', value: 0, caption: 'Next 30 days' },
    ],
    sections: [
      {
        title: 'Requests',
        searchable: true,
        columns: ['Employee', 'Type', 'From', 'To', 'Status'],
        empty: { icon: 'CalendarX', title: 'No leave requests' },
      },
    ],
  },
  {
    id: '143',
    route: '/training-lms',
    title: 'Training & LMS',
    subtitle: 'Courses, certifications and learning progress',
    icon: 'Library',
    action: { label: 'Add Course', icon: 'Plus' },
    stats: [
      { label: 'Courses', value: 0, caption: 'Available', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Enrolments', tone: 'info' },
      { label: 'Certifications Expiring', value: 0, caption: 'Within 90 days', tone: 'warning' },
      { label: 'Completion Rate', value: '0%', caption: 'Assigned courses' },
    ],
    sections: [
      {
        title: 'Courses',
        searchable: true,
        columns: ['Course', 'Category', 'Enrolled', 'Completion', 'Status'],
        empty: { icon: 'Library', title: 'No courses available yet' },
      },
    ],
  },
  {
    id: '144',
    route: '/wearable-integration',
    title: 'Wearable Integration',
    subtitle: 'Connected wearables for safety and activity',
    icon: 'Activity',
    stats: [
      { label: 'Devices Paired', value: 0, caption: 'Registered', highlight: true },
      { label: 'Reporting', value: 0, caption: 'Online now', tone: 'info' },
      { label: 'Safety Alerts', value: 0, caption: 'Today', tone: 'warning' },
      { label: 'Offline', value: 0, caption: 'No signal' },
    ],
    sections: [
      {
        title: 'Paired Devices',
        columns: ['Device', 'Wearer', 'Type', 'Last Report', 'Status'],
        empty: { icon: 'Activity', title: 'No wearables paired yet' },
      },
    ],
  },
  // ── Finance & accounting ──────────────────────────────────────────────────
  {
    id: '146',
    route: '/general-ledger',
    title: 'General Ledger',
    subtitle: 'Central record of all accounting transactions',
    icon: 'Book',
    action: { label: 'New Entry', icon: 'Plus' },
    stats: [
      { label: 'Journal Entries', value: 0, caption: 'This period', highlight: true },
      { label: 'Posted', value: 0, caption: 'Finalised', tone: 'info' },
      { label: 'Unposted', value: 0, caption: 'Draft', tone: 'warning' },
      { label: 'Accounts', value: 0, caption: 'In chart' },
    ],
    sections: [
      {
        title: 'Ledger Entries',
        searchable: true,
        columns: ['Date', 'Account', 'Description', 'Debit', 'Credit'],
        empty: { icon: 'Book', title: 'No ledger entries yet' },
      },
    ],
  },
  {
    id: '148',
    route: '/trial-balance',
    title: 'Trial Balance',
    subtitle: 'Debit and credit balances across all accounts',
    icon: 'Scale',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Total Debits', value: 'SAR 0.00', caption: 'This period', highlight: true },
      { label: 'Total Credits', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Difference', value: 'SAR 0.00', caption: 'Should be zero', tone: 'warning' },
      { label: 'Accounts', value: 0, caption: 'With activity' },
    ],
    sections: [
      {
        title: 'Balances',
        searchable: true,
        columns: ['Account', 'Code', 'Debit', 'Credit'],
        empty: { icon: 'Scale', title: 'No balances to show yet' },
      },
    ],
  },
  {
    id: '149',
    route: '/balance-sheet',
    title: 'Balance Sheet',
    subtitle: 'Assets, liabilities and equity at a point in time',
    icon: 'FileSpreadsheet',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Total Assets', value: 'SAR 0.00', caption: 'As at today', highlight: true },
      { label: 'Total Liabilities', value: 'SAR 0.00', caption: 'As at today', tone: 'warning' },
      { label: 'Total Equity', value: 'SAR 0.00', caption: 'As at today', tone: 'info' },
      { label: 'Current Ratio', value: '0.0', caption: 'Liquidity' },
    ],
    sections: [
      {
        title: 'Statement',
        columns: ['Line', 'Category', 'Amount'],
        empty: { icon: 'FileSpreadsheet', title: 'No data for this period yet' },
      },
    ],
  },
  {
    id: '150',
    route: '/income-statement',
    title: 'Income Statement',
    subtitle: 'Revenue, costs and profit over a period',
    icon: 'ReceiptText',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Revenue', value: 'SAR 0.00', caption: 'This period', highlight: true },
      { label: 'Cost of Sales', value: 'SAR 0.00', caption: 'This period', tone: 'warning' },
      { label: 'Net Profit', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Net Margin', value: '0%', caption: 'This period' },
    ],
    sections: [
      {
        title: 'Statement',
        columns: ['Line', 'Category', 'Amount'],
        empty: { icon: 'ReceiptText', title: 'No data for this period yet' },
      },
    ],
  },
  {
    id: '151',
    route: '/cash-flow-statement',
    title: 'Cash Flow Statement',
    subtitle: 'Cash movements from operations, investing and financing',
    icon: 'Waves',
    action: { label: 'Export', icon: 'Download' },
    stats: [
      { label: 'Net Cash Flow', value: 'SAR 0.00', caption: 'This period', highlight: true },
      { label: 'Operating', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Investing', value: 'SAR 0.00', caption: 'This period' },
      { label: 'Financing', value: 'SAR 0.00', caption: 'This period' },
    ],
    sections: [
      {
        title: 'Cash Flows',
        columns: ['Activity', 'Line', 'Amount'],
        empty: { icon: 'Waves', title: 'No cash flow data yet' },
      },
    ],
  },
  {
    id: '152',
    route: '/accounts-receivable',
    title: 'Accounts Receivable',
    subtitle: 'Money owed to the business by customers',
    icon: 'ArrowDownLeft',
    stats: [
      { label: 'Total Receivable', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms', tone: 'warning' },
      { label: 'Due This Week', value: 'SAR 0.00', caption: 'Coming due', tone: 'info' },
      { label: 'Avg Days To Pay', value: '0', caption: 'Collection period' },
    ],
    sections: [
      {
        title: 'Outstanding Invoices',
        searchable: true,
        columns: ['Invoice', 'Customer', 'Amount', 'Due', 'Status'],
        empty: { icon: 'ArrowDownLeft', title: 'No outstanding receivables' },
      },
    ],
  },
  {
    id: '153',
    route: '/accounts-payable',
    title: 'Accounts Payable',
    subtitle: 'Money the business owes to suppliers',
    icon: 'ArrowUpRight',
    stats: [
      { label: 'Total Payable', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms', tone: 'warning' },
      { label: 'Due This Week', value: 'SAR 0.00', caption: 'Coming due', tone: 'info' },
      { label: 'Open Bills', value: 0, caption: 'Unpaid' },
    ],
    sections: [
      {
        title: 'Outstanding Bills',
        searchable: true,
        columns: ['Bill', 'Supplier', 'Amount', 'Due', 'Status'],
        empty: { icon: 'ArrowUpRight', title: 'No outstanding payables' },
      },
    ],
  },
  {
    id: '154',
    route: '/bank-account-management',
    title: 'Bank Accounts',
    subtitle: 'Manage bank accounts and reconciliation',
    icon: 'Landmark',
    action: { label: 'Add Account', icon: 'Plus' },
    stats: [
      { label: 'Accounts', value: 0, caption: 'Linked', highlight: true },
      { label: 'Total Balance', value: 'SAR 0.00', caption: 'Across accounts', tone: 'info' },
      { label: 'Unreconciled', value: 0, caption: 'Transactions', tone: 'warning' },
      { label: 'Last Reconciled', value: '—', caption: 'Most recent' },
    ],
    sections: [
      {
        title: 'Accounts',
        columns: ['Account', 'Bank', 'Number', 'Balance', 'Status'],
        empty: { icon: 'Landmark', title: 'No bank accounts linked yet' },
      },
    ],
  },
  {
    id: '155',
    route: '/budget-management',
    title: 'Budget Management',
    subtitle: 'Plan and monitor spend against budget',
    icon: 'PiggyBank',
    action: { label: 'New Budget', icon: 'Plus' },
    stats: [
      { label: 'Budgeted', value: 'SAR 0.00', caption: 'This period', highlight: true },
      { label: 'Spent', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Over Budget', value: 0, caption: 'Categories', tone: 'warning' },
      { label: 'Remaining', value: 'SAR 0.00', caption: 'This period' },
    ],
    sections: [
      {
        title: 'Budgets',
        searchable: true,
        columns: ['Category', 'Budget', 'Actual', 'Variance', 'Status'],
        empty: { icon: 'PiggyBank', title: 'No budgets set yet' },
      },
    ],
  },
  {
    id: '156',
    route: '/capital-management',
    title: 'Capital Management',
    subtitle: 'Track capital contributions and structure',
    icon: 'Coins',
    stats: [
      { label: 'Total Capital', value: 'SAR 0.00', caption: 'Contributed', highlight: true },
      { label: 'Partners', value: 0, caption: 'Contributors', tone: 'info' },
      { label: 'Drawings', value: 'SAR 0.00', caption: 'This year' },
      { label: 'Pending Entries', value: 0, caption: 'Unposted', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Capital Accounts',
        columns: ['Partner', 'Contributed', 'Drawings', 'Balance'],
        empty: { icon: 'Coins', title: 'No capital entries yet' },
      },
    ],
  },
  {
    id: '157',
    route: '/assets-management',
    title: 'Assets Management',
    subtitle: 'Fixed assets, depreciation and disposals',
    icon: 'Building',
    action: { label: 'Add Asset', icon: 'Plus' },
    stats: [
      { label: 'Total Assets', value: 'SAR 0.00', caption: 'Net book value', highlight: true },
      { label: 'Depreciation MTD', value: 'SAR 0.00', caption: 'This month', tone: 'info' },
      { label: 'Due For Disposal', value: 0, caption: 'End of life', tone: 'warning' },
      { label: 'Asset Count', value: 0, caption: 'Registered' },
    ],
    sections: [
      {
        title: 'Asset Register',
        searchable: true,
        columns: ['Asset', 'Category', 'Acquired', 'Net Value', 'Status'],
        empty: { icon: 'Building', title: 'No assets registered yet' },
      },
    ],
  },
  {
    id: '158',
    route: '/liabilities-management',
    title: 'Liabilities Management',
    subtitle: 'Loans, obligations and repayment schedules',
    icon: 'CreditCard',
    stats: [
      { label: 'Total Liabilities', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Due This Month', value: 'SAR 0.00', caption: 'Repayments', tone: 'warning' },
      { label: 'Long Term', value: 'SAR 0.00', caption: 'Beyond a year', tone: 'info' },
      { label: 'Active Loans', value: 0, caption: 'On the books' },
    ],
    sections: [
      {
        title: 'Liabilities',
        columns: ['Liability', 'Type', 'Balance', 'Next Payment', 'Status'],
        empty: { icon: 'CreditCard', title: 'No liabilities recorded yet' },
      },
    ],
  },
  {
    id: '159',
    route: '/equity-management',
    title: 'Equity Management',
    subtitle: 'Owner equity, reserves and movements',
    icon: 'PieChart',
    stats: [
      { label: 'Total Equity', value: 'SAR 0.00', caption: 'As at today', highlight: true },
      { label: 'Share Capital', value: 'SAR 0.00', caption: 'Issued', tone: 'info' },
      { label: 'Reserves', value: 'SAR 0.00', caption: 'Retained' },
      { label: 'Movements', value: 0, caption: 'This period', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Equity Accounts',
        columns: ['Account', 'Opening', 'Movement', 'Closing'],
        empty: { icon: 'PieChart', title: 'No equity movements yet' },
      },
    ],
  },
  {
    id: '160',
    route: '/retained-earnings',
    title: 'Retained Earnings',
    subtitle: 'Accumulated profit retained in the business',
    icon: 'TrendingUp',
    stats: [
      { label: 'Retained Earnings', value: 'SAR 0.00', caption: 'To date', highlight: true },
      { label: 'This Year', value: 'SAR 0.00', caption: 'Added', tone: 'info' },
      { label: 'Distributions', value: 'SAR 0.00', caption: 'This year', tone: 'warning' },
      { label: 'Opening Balance', value: 'SAR 0.00', caption: 'Year start' },
    ],
    sections: [
      {
        title: 'Movements',
        columns: ['Date', 'Description', 'Amount', 'Balance'],
        empty: { icon: 'TrendingUp', title: 'No movements yet' },
      },
    ],
  },
  {
    id: '161',
    route: '/cost-centers',
    title: 'Cost Centers',
    subtitle: 'Allocate and track costs by department',
    icon: 'Calculator',
    action: { label: 'New Cost Center', icon: 'Plus' },
    stats: [
      { label: 'Cost Centers', value: 0, caption: 'Defined', highlight: true },
      { label: 'Total Allocated', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Over Budget', value: 0, caption: 'Centers', tone: 'warning' },
      { label: 'Unallocated', value: 'SAR 0.00', caption: 'Pending split' },
    ],
    sections: [
      {
        title: 'Cost Centers',
        searchable: true,
        columns: ['Cost Center', 'Owner', 'Budget', 'Actual', 'Variance'],
        empty: { icon: 'Calculator', title: 'No cost centers defined yet' },
      },
    ],
  },
  {
    id: '162',
    route: '/loss-account',
    title: 'Loss Account',
    subtitle: 'Track and analyse recorded losses',
    icon: 'AlertTriangle',
    stats: [
      { label: 'Total Losses', value: 'SAR 0.00', caption: 'This year', highlight: true, tone: 'warning' },
      { label: 'This Month', value: 'SAR 0.00', caption: 'Recorded' },
      { label: 'Write-Offs', value: 0, caption: 'This year' },
      { label: 'Largest Category', value: '—', caption: 'By value' },
    ],
    sections: [
      {
        title: 'Loss Entries',
        searchable: true,
        columns: ['Date', 'Category', 'Description', 'Amount'],
        empty: { icon: 'AlertTriangle', title: 'No losses recorded' },
      },
    ],
  },
  {
    id: '163',
    route: '/partners-current-account',
    title: 'Partners Current Account',
    subtitle: 'Transactions between the business and its partners',
    icon: 'Users',
    stats: [
      { label: 'Partners', value: 0, caption: 'With accounts', highlight: true },
      { label: 'Net Balance', value: 'SAR 0.00', caption: 'Owed to partners', tone: 'info' },
      { label: 'Drawings This Year', value: 'SAR 0.00', caption: 'Withdrawn' },
      { label: 'Unposted', value: 0, caption: 'Pending entries', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Partner Accounts',
        columns: ['Partner', 'Contributions', 'Drawings', 'Balance'],
        empty: { icon: 'Users', title: 'No partner accounts yet' },
      },
    ],
  },
  {
    id: '164',
    route: '/expense-tracking',
    title: 'Expense Tracking',
    subtitle: 'Log and categorise day-to-day expenses',
    icon: 'Receipt',
    action: { label: 'Add Expense', icon: 'Plus' },
    stats: [
      { label: 'Spent This Month', value: 'SAR 0.00', caption: 'All categories', highlight: true },
      { label: 'Awaiting Approval', value: 0, caption: 'Submitted', tone: 'warning' },
      { label: 'Reimbursable', value: 'SAR 0.00', caption: 'To staff', tone: 'info' },
      { label: 'Receipts Missing', value: 0, caption: 'Needs upload' },
    ],
    sections: [
      {
        title: 'Expenses',
        searchable: true,
        columns: ['Date', 'Category', 'Description', 'Amount', 'Status'],
        empty: { icon: 'Receipt', title: 'No expenses logged yet' },
      },
    ],
  },
  {
    id: '165',
    route: '/expenses-management',
    title: 'Expenses Management',
    subtitle: 'Approve, categorise and report on expenses',
    icon: 'ReceiptText',
    stats: [
      { label: 'Total Expenses', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Pending Approval', value: 0, caption: 'Submitted', tone: 'warning' },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Top Category', value: '—', caption: 'By spend' },
    ],
    sections: [
      {
        title: 'Expense Claims',
        searchable: true,
        columns: ['Claim', 'Employee', 'Category', 'Amount', 'Status'],
        empty: { icon: 'ReceiptText', title: 'No expense claims yet' },
      },
    ],
  },
  {
    id: '166',
    route: '/sales-management',
    title: 'Sales Management',
    subtitle: 'Track sales performance and pipeline',
    icon: 'ShoppingBag',
    stats: [
      { label: 'Sales MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
      { label: 'Orders', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Avg Order Value', value: 'SAR 0.00', caption: 'This month' },
      { label: 'Below Target', value: 0, caption: 'Reps off pace', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Sales',
        searchable: true,
        columns: ['Date', 'Customer', 'Items', 'Amount', 'Rep'],
        empty: { icon: 'ShoppingBag', title: 'No sales recorded yet' },
      },
    ],
  },
  {
    id: '167',
    route: '/accounting-integration',
    title: 'Accounting Integration',
    subtitle: 'Sync with external accounting systems',
    icon: 'Plug',
    action: { label: 'Connect', icon: 'Plus' },
    stats: [
      { label: 'Connections', value: 0, caption: 'Configured', highlight: true },
      { label: 'Synced Today', value: 0, caption: 'Records', tone: 'info' },
      { label: 'Sync Errors', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Last Sync', value: '—', caption: 'Most recent' },
    ],
    sections: [
      {
        title: 'Integrations',
        columns: ['System', 'Scope', 'Last Sync', 'Status'],
        empty: { icon: 'Plug', title: 'No accounting integrations connected' },
      },
    ],
  },
  {
    id: '168',
    route: '/financial-settings',
    title: 'Financial Settings',
    subtitle: 'Fiscal year, currency and accounting policies',
    icon: 'Settings2',
    stats: [
      { label: 'Base Currency', value: 'SAR', caption: 'Reporting currency', highlight: true },
      { label: 'Fiscal Year Start', value: 'Jan', caption: 'Period start', tone: 'info' },
      { label: 'Chart Accounts', value: 0, caption: 'Configured' },
      { label: 'Open Periods', value: 0, caption: 'Not yet closed', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Configuration',
        columns: ['Setting', 'Value'],
        empty: { icon: 'Settings2', title: 'Financial settings appear here' },
      },
    ],
  },
  // ── Warranty, contracts & insurance ───────────────────────────────────────
  {
    id: '169',
    route: '/warranty-management',
    title: 'Warranty Management',
    subtitle: 'Track warranty coverage, claims and expiry',
    icon: 'ShieldCheck',
    action: { label: 'New Warranty', icon: 'Plus' },
    stats: [
      { label: 'Active Warranties', value: 0, caption: 'In force', highlight: true },
      { label: 'Open Claims', value: 0, caption: 'Being processed', tone: 'info' },
      { label: 'Expiring Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Claims Value', value: 'SAR 0.00', caption: 'This year' },
    ],
    sections: [
      {
        title: 'Warranties',
        searchable: true,
        columns: ['Reference', 'Vehicle', 'Coverage', 'Expires', 'Status'],
        empty: { icon: 'ShieldCheck', title: 'No warranties recorded yet' },
      },
    ],
  },
  {
    id: '170',
    route: '/contract-management',
    title: 'Contract Management',
    subtitle: 'Service contracts, renewals and obligations',
    icon: 'FileSignature',
    action: { label: 'New Contract', icon: 'Plus' },
    stats: [
      { label: 'Active Contracts', value: 0, caption: 'In force', highlight: true },
      { label: 'Up For Renewal', value: 0, caption: 'Within 60 days', tone: 'warning' },
      { label: 'Annual Value', value: 'SAR 0.00', caption: 'Committed', tone: 'info' },
      { label: 'Draft', value: 0, caption: 'Not signed' },
    ],
    sections: [
      {
        title: 'Contracts',
        searchable: true,
        columns: ['Contract', 'Party', 'Value', 'Renews', 'Status'],
        empty: { icon: 'FileSignature', title: 'No contracts on file yet' },
      },
    ],
  },
  {
    id: '171',
    route: '/insurance-claims',
    title: 'Insurance Claims',
    subtitle: 'Process and track insurer-funded repairs',
    icon: 'Shield',
    action: { label: 'New Claim', icon: 'Plus' },
    stats: [
      { label: 'Open Claims', value: 0, caption: 'In progress', highlight: true },
      { label: 'Awaiting Insurer', value: 0, caption: 'Pending approval', tone: 'warning' },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Claims Value', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Claims',
        searchable: true,
        columns: ['Claim', 'Vehicle', 'Insurer', 'Amount', 'Status'],
        empty: { icon: 'Shield', title: 'No insurance claims yet' },
      },
    ],
  },
  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    id: '172',
    route: '/marketing-hub',
    title: 'Marketing Hub',
    subtitle: 'Campaigns, audiences and marketing performance',
    icon: 'Megaphone',
    action: { label: 'New Campaign', icon: 'Plus' },
    stats: [
      { label: 'Active Campaigns', value: 0, caption: 'Running', highlight: true },
      { label: 'Reach', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Conversions', value: 0, caption: 'This month' },
      { label: 'Needs Attention', value: 0, caption: 'Underperforming', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Campaigns',
        searchable: true,
        columns: ['Campaign', 'Channel', 'Reach', 'Conversions', 'Status'],
        empty: { icon: 'Megaphone', title: 'No campaigns yet' },
      },
    ],
  },
  {
    id: '173',
    route: '/marketing-automation',
    title: 'Marketing Automation',
    subtitle: 'Automated journeys and triggered messaging',
    icon: 'Workflow',
    action: { label: 'New Workflow', icon: 'Plus' },
    stats: [
      { label: 'Active Workflows', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Contacts In Flow', value: 0, caption: 'Enrolled', tone: 'info' },
      { label: 'Messages Sent', value: 0, caption: 'This month' },
      { label: 'Failing Steps', value: 0, caption: 'Need attention', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Workflows',
        columns: ['Workflow', 'Trigger', 'Enrolled', 'Sent', 'Status'],
        empty: { icon: 'Workflow', title: 'No workflows configured' },
      },
    ],
  },
  {
    id: '174',
    route: '/email-marketing-campaigns',
    title: 'Email Marketing',
    subtitle: 'Design, send and measure email campaigns',
    icon: 'Mail',
    action: { label: 'New Email', icon: 'Plus' },
    stats: [
      { label: 'Campaigns Sent', value: 0, caption: 'This month', highlight: true },
      { label: 'Open Rate', value: '0%', caption: 'Average', tone: 'info' },
      { label: 'Click Rate', value: '0%', caption: 'Average' },
      { label: 'Unsubscribes', value: 0, caption: 'This month', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Campaigns',
        searchable: true,
        columns: ['Campaign', 'Sent', 'Opened', 'Clicked', 'Status'],
        empty: { icon: 'Mail', title: 'No email campaigns yet' },
      },
    ],
  },
  {
    id: '175',
    route: '/social-media-integration',
    title: 'Social Media Integration',
    subtitle: 'Connect and publish to social channels',
    icon: 'Share2',
    action: { label: 'Connect Channel', icon: 'Plus' },
    stats: [
      { label: 'Connected Channels', value: 0, caption: 'Linked', highlight: true },
      { label: 'Scheduled Posts', value: 0, caption: 'Queued', tone: 'info' },
      { label: 'Published This Week', value: 0, caption: 'Live' },
      { label: 'Failed', value: 0, caption: 'Not published', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Channels',
        columns: ['Channel', 'Account', 'Followers', 'Status'],
        empty: { icon: 'Share2', title: 'No social channels connected' },
      },
    ],
  },
  {
    id: '176',
    route: '/social-media-monitoring',
    title: 'Social Media Monitoring',
    subtitle: 'Track mentions, sentiment and engagement',
    icon: 'Eye',
    stats: [
      { label: 'Mentions', value: 0, caption: 'This week', highlight: true },
      { label: 'Positive', value: 0, caption: 'Sentiment', tone: 'info' },
      { label: 'Needs Response', value: 0, caption: 'Unanswered', tone: 'warning' },
      { label: 'Engagement', value: '0%', caption: 'Rate' },
    ],
    sections: [
      {
        title: 'Mentions',
        searchable: true,
        columns: ['Channel', 'Author', 'Mention', 'Sentiment', 'When'],
        empty: { icon: 'Eye', title: 'No mentions tracked yet' },
      },
    ],
  },
  {
    id: '177',
    route: '/google-my-business',
    title: 'Google Business Profile',
    subtitle: 'Manage your listing, reviews and posts',
    icon: 'Store',
    stats: [
      { label: 'Profile Views', value: 0, caption: 'This month', highlight: true },
      { label: 'Average Rating', value: '0.0', caption: 'Out of 5', tone: 'info' },
      { label: 'Unanswered Reviews', value: 0, caption: 'Need reply', tone: 'warning' },
      { label: 'Direction Requests', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Recent Reviews',
        columns: ['Reviewer', 'Rating', 'Comment', 'Replied', 'When'],
        empty: { icon: 'Store', title: 'No reviews to show yet' },
      },
    ],
  },
  // ── Communications ────────────────────────────────────────────────────────
  {
    id: '179',
    route: '/chat',
    title: 'Chat',
    subtitle: 'Internal and customer messaging',
    icon: 'MessageCircle',
    action: { label: 'New Chat', icon: 'Plus' },
    stats: [
      { label: 'Open Chats', value: 0, caption: 'Active threads', highlight: true },
      { label: 'Unread', value: 0, caption: 'New messages', tone: 'warning' },
      { label: 'Resolved Today', value: 0, caption: 'Closed', tone: 'info' },
      { label: 'Avg Response', value: '0m', caption: 'First reply' },
    ],
    sections: [
      {
        title: 'Conversations',
        searchable: true,
        columns: ['With', 'Last Message', 'Updated', 'Status'],
        empty: { icon: 'MessageCircle', title: 'No conversations yet' },
      },
    ],
  },
  {
    id: '180',
    route: '/support-chat-dashboard',
    title: 'Support Chat Dashboard',
    subtitle: 'Live support queue and agent activity',
    icon: 'Headset',
    stats: [
      { label: 'Waiting', value: 0, caption: 'In queue', highlight: true, tone: 'warning' },
      { label: 'Active Chats', value: 0, caption: 'Being handled', tone: 'info' },
      { label: 'Agents Online', value: 0, caption: 'Available' },
      { label: 'Avg Wait', value: '0m', caption: 'To first reply' },
    ],
    sections: [
      {
        title: 'Live Queue',
        columns: ['Customer', 'Topic', 'Waiting', 'Agent', 'Status'],
        empty: { icon: 'Headset', title: 'The support queue is empty' },
      },
    ],
  },
  {
    id: '181',
    route: '/notifications',
    title: 'Notifications',
    subtitle: 'System alerts and activity notifications',
    icon: 'Bell',
    action: { label: 'Mark All Read', icon: 'CheckCheck' },
    stats: [
      { label: 'Unread', value: 0, caption: 'New', highlight: true },
      { label: 'Today', value: 0, caption: 'Received', tone: 'info' },
      { label: 'Action Required', value: 0, caption: 'Need response', tone: 'warning' },
      { label: 'Archived', value: 0, caption: 'Cleared' },
    ],
    sections: [
      {
        title: 'Recent Notifications',
        columns: ['Type', 'Message', 'When', 'Status'],
        empty: { icon: 'Bell', title: 'You are all caught up' },
      },
    ],
  },
  // ── Compliance & quality ──────────────────────────────────────────────────
  {
    id: '182',
    route: '/compliance-management',
    title: 'Compliance Management',
    subtitle: 'Track regulatory obligations and evidence',
    icon: 'ClipboardCheck',
    stats: [
      { label: 'Obligations', value: 0, caption: 'Tracked', highlight: true },
      { label: 'Compliant', value: 0, caption: 'Up to date', tone: 'info' },
      { label: 'Due Soon', value: 0, caption: 'Action needed', tone: 'warning' },
      { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Compliance Register',
        searchable: true,
        columns: ['Requirement', 'Owner', 'Due', 'Evidence', 'Status'],
        empty: { icon: 'ClipboardCheck', title: 'No compliance items tracked yet' },
      },
    ],
  },
  {
    id: '183',
    route: '/zatca-settings',
    title: 'ZATCA Settings',
    subtitle: 'E-invoicing compliance for the ZATCA mandate',
    icon: 'FileCheck',
    stats: [
      { label: 'Integration', value: 'Not Connected', caption: 'ZATCA portal', highlight: true },
      { label: 'Invoices Cleared', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Rejected', value: 0, caption: 'Need correction', tone: 'warning' },
      { label: 'Phase', value: 'Phase 2', caption: 'Integration' },
    ],
    sections: [
      {
        title: 'Configuration',
        columns: ['Setting', 'Value'],
        empty: { icon: 'FileCheck', title: 'ZATCA settings appear here' },
      },
    ],
  },
  {
    id: '184',
    route: '/vat-settings',
    title: 'VAT Settings',
    subtitle: 'Value-added tax rates and reporting',
    icon: 'Percent',
    stats: [
      { label: 'Standard Rate', value: '15%', caption: 'Applied by default', highlight: true },
      { label: 'Tax Codes', value: 0, caption: 'Configured', tone: 'info' },
      { label: 'VAT Collected', value: 'SAR 0.00', caption: 'This period' },
      { label: 'Next Return', value: '—', caption: 'Filing due', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Tax Codes',
        columns: ['Code', 'Description', 'Rate', 'Status'],
        empty: { icon: 'Percent', title: 'No tax codes configured yet' },
      },
    ],
  },
  {
    id: '185',
    route: '/zakat-settings',
    title: 'Zakat Settings',
    subtitle: 'Zakat calculation base and reporting',
    icon: 'Landmark',
    stats: [
      { label: 'Zakat Base', value: 'SAR 0.00', caption: 'Current period', highlight: true },
      { label: 'Rate', value: '2.5%', caption: 'Applied', tone: 'info' },
      { label: 'Estimated Zakat', value: 'SAR 0.00', caption: 'This year' },
      { label: 'Next Filing', value: '—', caption: 'Due', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Configuration',
        columns: ['Setting', 'Value'],
        empty: { icon: 'Landmark', title: 'Zakat settings appear here' },
      },
    ],
  },
  {
    id: '186',
    route: '/safety-incidents',
    title: 'Safety Incidents',
    subtitle: 'Report and track workplace safety incidents',
    icon: 'ShieldAlert',
    action: { label: 'Report Incident', icon: 'Plus' },
    stats: [
      { label: 'Open Incidents', value: 0, caption: 'Under investigation', highlight: true, tone: 'warning' },
      { label: 'This Month', value: 0, caption: 'Reported', tone: 'info' },
      { label: 'Days Since Last', value: 0, caption: 'Incident-free' },
      { label: 'Corrective Actions', value: 0, caption: 'Outstanding', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Incidents',
        searchable: true,
        columns: ['Reference', 'Type', 'Severity', 'Reported', 'Status'],
        empty: { icon: 'ShieldAlert', title: 'No safety incidents reported' },
      },
    ],
  },
  {
    id: '187',
    route: '/environmental-compliance',
    title: 'Environmental Compliance',
    subtitle: 'Waste handling, emissions and disposal records',
    icon: 'Wind',
    stats: [
      { label: 'Permits', value: 0, caption: 'Active', highlight: true },
      { label: 'Expiring Soon', value: 0, caption: 'Within 60 days', tone: 'warning' },
      { label: 'Waste Logged', value: 0, caption: 'Records this month', tone: 'info' },
      { label: 'Open Actions', value: 0, caption: 'Outstanding' },
    ],
    sections: [
      {
        title: 'Compliance Records',
        searchable: true,
        columns: ['Item', 'Type', 'Due', 'Owner', 'Status'],
        empty: { icon: 'Wind', title: 'No environmental records yet' },
      },
    ],
  },
  {
    id: '188',
    route: '/iso-quality-management',
    title: 'ISO Quality Management',
    subtitle: 'Manage the quality management system and audits',
    icon: 'BadgeCheck',
    stats: [
      { label: 'Controlled Documents', value: 0, caption: 'In the QMS', highlight: true },
      { label: 'Open Non-Conformities', value: 0, caption: 'To resolve', tone: 'warning' },
      { label: 'Audits This Year', value: 0, caption: 'Completed', tone: 'info' },
      { label: 'Next Audit', value: '—', caption: 'Scheduled' },
    ],
    sections: [
      {
        title: 'Non-Conformities',
        searchable: true,
        columns: ['Reference', 'Area', 'Raised', 'Owner', 'Status'],
        empty: { icon: 'BadgeCheck', title: 'No open non-conformities' },
      },
    ],
  },
  {
    id: '189',
    route: '/equipment-calibration',
    title: 'Equipment Calibration',
    subtitle: 'Track calibration schedules for workshop equipment',
    icon: 'SlidersHorizontal',
    action: { label: 'Add Equipment', icon: 'Plus' },
    stats: [
      { label: 'Equipment', value: 0, caption: 'Tracked', highlight: true },
      { label: 'Calibrated', value: 0, caption: 'In date', tone: 'info' },
      { label: 'Due Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Overdue', value: 0, caption: 'Out of calibration', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Equipment',
        searchable: true,
        columns: ['Equipment', 'Serial', 'Last Calibrated', 'Due', 'Status'],
        empty: { icon: 'SlidersHorizontal', title: 'No equipment tracked yet' },
      },
    ],
  },
  // ── Multi-site & franchise ────────────────────────────────────────────────
  {
    id: '190',
    route: '/franchise-management',
    title: 'Franchise Management',
    subtitle: 'Manage franchise locations and royalties',
    icon: 'Store',
    action: { label: 'Add Franchise', icon: 'Plus' },
    stats: [
      { label: 'Franchises', value: 0, caption: 'Operating', highlight: true },
      { label: 'Royalties Due', value: 'SAR 0.00', caption: 'This month', tone: 'warning' },
      { label: 'Top Performer', value: '—', caption: 'By revenue', tone: 'info' },
      { label: 'Onboarding', value: 0, caption: 'In setup' },
    ],
    sections: [
      {
        title: 'Franchises',
        searchable: true,
        columns: ['Franchise', 'Location', 'Revenue MTD', 'Royalty', 'Status'],
        empty: { icon: 'Store', title: 'No franchises yet' },
      },
    ],
  },
  {
    id: '191',
    route: '/globalization-layer',
    title: 'Globalization Layer',
    subtitle: 'Languages, currencies and regional settings',
    icon: 'Globe',
    stats: [
      { label: 'Languages', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Currencies', value: 0, caption: 'Supported', tone: 'info' },
      { label: 'Regions', value: 0, caption: 'Configured' },
      { label: 'Missing Translations', value: 0, caption: 'To complete', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Regional Settings',
        columns: ['Region', 'Language', 'Currency', 'Status'],
        empty: { icon: 'Globe', title: 'No regional settings configured' },
      },
    ],
  },
  {
    id: '192',
    route: '/multi-location-dashboard',
    title: 'Multi-Location Dashboard',
    subtitle: 'Compare performance across branches',
    icon: 'Building2',
    stats: [
      { label: 'Locations', value: 0, caption: 'Active', highlight: true },
      { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'All branches', tone: 'info' },
      { label: 'Top Branch', value: '—', caption: 'By revenue' },
      { label: 'Below Target', value: 0, caption: 'Branches', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Branch Performance',
        searchable: true,
        columns: ['Branch', 'Jobs', 'Revenue MTD', 'Utilisation', 'Status'],
        empty: { icon: 'Building2', title: 'No branch data yet' },
      },
    ],
  },
  // ── AI & automation ───────────────────────────────────────────────────────
  {
    id: '193',
    route: '/ai-automation',
    title: 'AI Automation',
    subtitle: 'Automated workflows powered by AI',
    icon: 'Bot',
    action: { label: 'New Automation', icon: 'Plus' },
    stats: [
      { label: 'Active Automations', value: 0, caption: 'Running', highlight: true },
      { label: 'Runs Today', value: 0, caption: 'Executed', tone: 'info' },
      { label: 'Failures', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Time Saved', value: '0h', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Automations',
        searchable: true,
        columns: ['Automation', 'Trigger', 'Runs', 'Last Run', 'Status'],
        empty: { icon: 'Bot', title: 'No automations configured' },
      },
    ],
  },
  {
    id: '194',
    route: '/ai-chatbot',
    title: 'AI Chatbot',
    subtitle: 'Automated conversational assistant for customers',
    icon: 'Bot',
    stats: [
      { label: 'Conversations', value: 0, caption: 'This month', highlight: true },
      { label: 'Resolved By Bot', value: 0, caption: 'No handoff', tone: 'info' },
      { label: 'Escalated', value: 0, caption: 'To an agent', tone: 'warning' },
      { label: 'Satisfaction', value: '0%', caption: 'Positive rating' },
    ],
    sections: [
      {
        title: 'Recent Conversations',
        columns: ['Customer', 'Topic', 'Outcome', 'When'],
        empty: { icon: 'Bot', title: 'No chatbot conversations yet' },
      },
    ],
  },
  {
    id: '195',
    route: '/ai-chatbot-assistant',
    title: 'AI Assistant',
    subtitle: 'In-app assistant for staff queries and actions',
    icon: 'Sparkles',
    stats: [
      { label: 'Queries', value: 0, caption: 'This month', highlight: true },
      { label: 'Actions Taken', value: 0, caption: 'On your behalf', tone: 'info' },
      { label: 'Suggestions', value: 0, caption: 'Offered' },
      { label: 'Needs Review', value: 0, caption: 'Awaiting confirm', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Recent Queries',
        columns: ['User', 'Query', 'Response', 'When'],
        empty: { icon: 'Sparkles', title: 'Ask the assistant to get started' },
      },
    ],
  },
  {
    id: '196',
    route: '/ai-service-advisor',
    title: 'AI Service Advisor',
    subtitle: 'AI-assisted service recommendations and estimates',
    icon: 'MessageSquareText',
    stats: [
      { label: 'Recommendations', value: 0, caption: 'This month', highlight: true },
      { label: 'Accepted', value: 0, caption: 'Added to jobs', tone: 'info' },
      { label: 'Estimates Drafted', value: 0, caption: 'AI-generated' },
      { label: 'Needs Review', value: 0, caption: 'Low confidence', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Advisory Activity',
        columns: ['Vehicle', 'Recommendation', 'Confidence', 'Outcome'],
        empty: { icon: 'MessageSquareText', title: 'No advisory activity yet' },
      },
    ],
  },
  {
    id: '197',
    route: '/voice-commands',
    title: 'Voice Commands',
    subtitle: 'Hands-free control across the workshop',
    icon: 'Voicemail',
    stats: [
      { label: 'Commands Enabled', value: 0, caption: 'Configured', highlight: true },
      { label: 'Used Today', value: 0, caption: 'Invocations', tone: 'info' },
      { label: 'Recognition Rate', value: '0%', caption: 'Accuracy' },
      { label: 'Unrecognised', value: 0, caption: 'Failed today', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Available Commands',
        searchable: true,
        columns: ['Phrase', 'Action', 'Uses', 'Status'],
        empty: { icon: 'Voicemail', title: 'No voice commands configured' },
      },
    ],
  },
  {
    id: '198',
    route: '/voice-command-interface',
    title: 'Voice Command Interface',
    subtitle: 'Live voice capture and command history',
    icon: 'Waves',
    action: { label: 'Start Listening', icon: 'Play' },
    stats: [
      { label: 'Status', value: 'Idle', caption: 'Microphone', highlight: true },
      { label: 'Commands Today', value: 0, caption: 'Captured', tone: 'info' },
      { label: 'Confidence', value: '0%', caption: 'Last capture' },
      { label: 'Errors', value: 0, caption: 'Today', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Command History',
        columns: ['Time', 'Heard', 'Action', 'Result'],
        empty: { icon: 'Waves', title: 'No commands captured yet' },
      },
    ],
  },
  {
    id: '199',
    route: '/smart-damage-assessment',
    title: 'Smart Damage Assessment',
    subtitle: 'AI damage detection from vehicle photos',
    icon: 'SearchCheck',
    action: { label: 'New Assessment', icon: 'ImagePlus' },
    stats: [
      { label: 'Assessments', value: 0, caption: 'This month', highlight: true },
      { label: 'Damage Detected', value: 0, caption: 'Findings', tone: 'warning' },
      { label: 'Estimates Generated', value: 0, caption: 'From findings', tone: 'info' },
      { label: 'Avg Confidence', value: '0%', caption: 'Model certainty' },
    ],
    sections: [
      {
        title: 'Recent Assessments',
        columns: ['Vehicle', 'Findings', 'Estimated Cost', 'Confidence', 'When'],
        empty: { icon: 'SearchCheck', title: 'No assessments yet' },
      },
    ],
  },
  {
    id: '200',
    route: '/ml-fraud-detection',
    title: 'ML Fraud Detection',
    subtitle: 'Flag anomalous transactions and claims',
    icon: 'Fingerprint',
    stats: [
      { label: 'Transactions Scanned', value: 0, caption: 'This month', highlight: true },
      { label: 'Flagged', value: 0, caption: 'For review', tone: 'warning' },
      { label: 'Confirmed Fraud', value: 0, caption: 'This month' },
      { label: 'False Positive Rate', value: '0%', caption: 'Of flags', tone: 'info' },
    ],
    sections: [
      {
        title: 'Flagged Activity',
        searchable: true,
        columns: ['Reference', 'Type', 'Risk Score', 'Detected', 'Status'],
        empty: { icon: 'Fingerprint', title: 'No flagged activity' },
      },
    ],
  },
  {
    id: '201',
    route: '/neural-network-prediction',
    title: 'Neural Network Prediction',
    subtitle: 'Model-driven forecasts across operations',
    icon: 'Cpu',
    stats: [
      { label: 'Models Deployed', value: 0, caption: 'In production', highlight: true },
      { label: 'Predictions Today', value: 0, caption: 'Generated', tone: 'info' },
      { label: 'Avg Accuracy', value: '0%', caption: 'Validated' },
      { label: 'Retraining Due', value: 0, caption: 'Drift detected', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Deployed Models',
        columns: ['Model', 'Purpose', 'Accuracy', 'Last Trained', 'Status'],
        empty: { icon: 'Cpu', title: 'No models deployed yet' },
      },
    ],
  },
  {
    id: '202',
    route: '/emerging-technologies',
    title: 'Emerging Technologies',
    subtitle: 'Pilot programs and experimental capabilities',
    icon: 'Sparkles',
    stats: [
      { label: 'Active Pilots', value: 0, caption: 'Running', highlight: true },
      { label: 'In Evaluation', value: 0, caption: 'Under review', tone: 'info' },
      { label: 'Blocked', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Graduated', value: 0, caption: 'To production' },
    ],
    sections: [
      {
        title: 'Pilots',
        searchable: true,
        columns: ['Technology', 'Owner', 'Stage', 'Started', 'Status'],
        empty: { icon: 'Sparkles', title: 'No pilots running yet' },
      },
    ],
  },
  {
    id: '203',
    route: '/next-gen-technologies',
    title: 'NextGen Technologies',
    subtitle: 'Roadmap of next-generation capabilities',
    icon: 'Zap',
    stats: [
      { label: 'On Roadmap', value: 0, caption: 'Planned', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Being built', tone: 'info' },
      { label: 'At Risk', value: 0, caption: 'Behind plan', tone: 'warning' },
      { label: 'Shipped', value: 0, caption: 'This year' },
    ],
    sections: [
      {
        title: 'Roadmap',
        columns: ['Capability', 'Category', 'Target', 'Status'],
        empty: { icon: 'Zap', title: 'Nothing on the roadmap yet' },
      },
    ],
  },
  {
    id: '204',
    route: '/io-t-dashboard',
    title: 'IoT Dashboard',
    subtitle: 'Connected sensors and device telemetry',
    icon: 'Webhook',
    stats: [
      { label: 'Devices', value: 0, caption: 'Registered', highlight: true },
      { label: 'Online', value: 0, caption: 'Reporting', tone: 'info' },
      { label: 'Alerts', value: 0, caption: 'Active', tone: 'warning' },
      { label: 'Data Points', value: 0, caption: 'Last 24h' },
    ],
    sections: [
      {
        title: 'Connected Devices',
        searchable: true,
        columns: ['Device', 'Type', 'Location', 'Last Report', 'Status'],
        empty: { icon: 'Webhook', title: 'No IoT devices connected' },
      },
    ],
  },
  {
    id: '205',
    route: '/edge-computing',
    title: 'Edge Computing',
    subtitle: 'On-site compute nodes and workloads',
    icon: 'Cpu',
    stats: [
      { label: 'Edge Nodes', value: 0, caption: 'Deployed', highlight: true },
      { label: 'Online', value: 0, caption: 'Healthy', tone: 'info' },
      { label: 'Degraded', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Avg Load', value: '0%', caption: 'Across nodes' },
    ],
    sections: [
      {
        title: 'Nodes',
        columns: ['Node', 'Location', 'Workloads', 'Load', 'Status'],
        empty: { icon: 'Cpu', title: 'No edge nodes deployed' },
      },
    ],
  },
  {
    id: '206',
    route: '/digital-twin-viewer',
    title: 'Digital Twin Viewer',
    subtitle: 'Virtual replica of vehicles and assets',
    icon: 'Copy',
    stats: [
      { label: 'Digital Twins', value: 0, caption: 'Modelled', highlight: true },
      { label: 'Live-Synced', value: 0, caption: 'Streaming data', tone: 'info' },
      { label: 'Anomalies', value: 0, caption: 'Detected', tone: 'warning' },
      { label: 'Assets Covered', value: 0, caption: 'With a twin' },
    ],
    sections: [
      {
        title: 'Digital Twins',
        searchable: true,
        columns: ['Twin', 'Asset', 'Sync', 'Health', 'Status'],
        empty: { icon: 'Copy', title: 'No digital twins yet' },
      },
    ],
  },
  {
    id: '207',
    route: '/drone-inspection',
    title: 'Drone Inspection',
    subtitle: 'Aerial and remote vehicle inspection',
    icon: 'Satellite',
    action: { label: 'New Inspection', icon: 'Plus' },
    stats: [
      { label: 'Inspections', value: 0, caption: 'This month', highlight: true },
      { label: 'Findings', value: 0, caption: 'Raised', tone: 'warning' },
      { label: 'Drones Available', value: 0, caption: 'Ready', tone: 'info' },
      { label: 'Images Captured', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Recent Inspections',
        columns: ['Reference', 'Target', 'Findings', 'Pilot', 'When'],
        empty: { icon: 'Satellite', title: 'No drone inspections yet' },
      },
    ],
  },
  {
    id: '208',
    route: '/ar-repair-guide',
    title: 'AR Repair Guide',
    subtitle: 'Augmented-reality step-by-step repair guidance',
    icon: 'View',
    stats: [
      { label: 'AR Guides', value: 0, caption: 'Available', highlight: true },
      { label: 'Sessions Today', value: 0, caption: 'Launched', tone: 'info' },
      { label: 'Vehicles Covered', value: 0, caption: 'Supported' },
      { label: 'Pending Guides', value: 0, caption: 'In production', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Guide Library',
        searchable: true,
        columns: ['Guide', 'Vehicle', 'Steps', 'Updated'],
        empty: { icon: 'View', title: 'No AR guides available yet' },
      },
    ],
  },
  {
    id: '209',
    route: '/ar-overlay',
    title: 'AR Overlay',
    subtitle: 'Live augmented overlays on the workshop floor',
    icon: 'SwitchCamera',
    stats: [
      { label: 'Active Overlays', value: 0, caption: 'Configured', highlight: true },
      { label: 'Devices', value: 0, caption: 'AR-capable', tone: 'info' },
      { label: 'Sessions Today', value: 0, caption: 'Launched' },
      { label: 'Calibration Needed', value: 0, caption: 'Devices', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Overlays',
        columns: ['Overlay', 'Context', 'Device', 'Status'],
        empty: { icon: 'SwitchCamera', title: 'No overlays configured' },
      },
    ],
  },
  {
    id: '210',
    route: '/vr-showroom',
    title: 'VR Showroom',
    subtitle: 'Immersive virtual showroom experiences',
    icon: 'Store',
    stats: [
      { label: 'Showrooms', value: 0, caption: 'Published', highlight: true },
      { label: 'Visits This Month', value: 0, caption: 'Sessions', tone: 'info' },
      { label: 'Leads Generated', value: 0, caption: 'From VR' },
      { label: 'In Production', value: 0, caption: 'Not yet live', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Showrooms',
        columns: ['Showroom', 'Theme', 'Visits', 'Status'],
        empty: { icon: 'Store', title: 'No VR showrooms yet' },
      },
    ],
  },
  {
    id: '211',
    route: '/blockchain-service-history',
    title: 'Blockchain Service History',
    subtitle: 'Tamper-proof service records on a distributed ledger',
    icon: 'Link',
    stats: [
      { label: 'Records On Chain', value: 0, caption: 'Immutable', highlight: true },
      { label: 'Verified', value: 0, caption: 'Confirmed', tone: 'info' },
      { label: 'Pending', value: 0, caption: 'Awaiting confirmation', tone: 'warning' },
      { label: 'Vehicles Covered', value: 0, caption: 'With a chain' },
    ],
    sections: [
      {
        title: 'Ledger Records',
        searchable: true,
        columns: ['Record', 'Vehicle', 'Hash', 'Recorded', 'Status'],
        empty: { icon: 'Link', title: 'No records on chain yet' },
      },
    ],
  },
  {
    id: '212',
    route: '/smart-contracts',
    title: 'Smart Contracts',
    subtitle: 'Automated agreements executed on-chain',
    icon: 'ScrollText',
    action: { label: 'New Contract', icon: 'Plus' },
    stats: [
      { label: 'Active Contracts', value: 0, caption: 'Deployed', highlight: true },
      { label: 'Executions', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Pending Signatures', value: 0, caption: 'Awaiting parties', tone: 'warning' },
      { label: 'Value Locked', value: 'SAR 0.00', caption: 'In escrow' },
    ],
    sections: [
      {
        title: 'Contracts',
        searchable: true,
        columns: ['Contract', 'Parties', 'Trigger', 'Status'],
        empty: { icon: 'ScrollText', title: 'No smart contracts deployed' },
      },
    ],
  },
  {
    id: '213',
    route: '/quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'Experimental quantum-assisted optimisation',
    icon: 'Cpu',
    stats: [
      { label: 'Jobs Submitted', value: 0, caption: 'This month', highlight: true },
      { label: 'Completed', value: 0, caption: 'Returned', tone: 'info' },
      { label: 'Queued', value: 0, caption: 'Awaiting compute', tone: 'warning' },
      { label: 'Backends', value: 0, caption: 'Available' },
    ],
    sections: [
      {
        title: 'Compute Jobs',
        columns: ['Job', 'Problem', 'Backend', 'Submitted', 'Status'],
        empty: { icon: 'Cpu', title: 'No quantum jobs submitted' },
      },
    ],
  },
  {
    id: '214',
    route: '/sustainable-energy-monitoring',
    title: 'Sustainable Energy Monitoring',
    subtitle: 'Track energy use and renewable generation',
    icon: 'BatteryCharging',
    stats: [
      { label: 'Consumption Today', value: '0 kWh', caption: 'Total', highlight: true },
      { label: 'Solar Generated', value: '0 kWh', caption: 'Today', tone: 'info' },
      { label: 'Peak Demand', value: '0 kW', caption: 'Today', tone: 'warning' },
      { label: 'CO2 Avoided', value: '0 kg', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Metering',
        columns: ['Meter', 'Location', 'Consumption', 'Status'],
        empty: { icon: 'BatteryCharging', title: 'No energy meters connected' },
      },
    ],
  },
  {
    id: '215',
    route: '/digital-signage',
    title: 'Digital Signage',
    subtitle: 'Manage screens and content across locations',
    icon: 'Tablet',
    action: { label: 'New Content', icon: 'Plus' },
    stats: [
      { label: 'Screens', value: 0, caption: 'Registered', highlight: true },
      { label: 'Online', value: 0, caption: 'Displaying', tone: 'info' },
      { label: 'Offline', value: 0, caption: 'No signal', tone: 'warning' },
      { label: 'Playlists', value: 0, caption: 'Scheduled' },
    ],
    sections: [
      {
        title: 'Screens',
        searchable: true,
        columns: ['Screen', 'Location', 'Now Playing', 'Status'],
        empty: { icon: 'Tablet', title: 'No screens registered yet' },
      },
    ],
  },
  // ── Infrastructure & devices ──────────────────────────────────────────────
  {
    id: '217',
    route: '/security-cameras',
    title: 'Security Cameras',
    subtitle: 'Live feeds and recorded footage across the site',
    icon: 'Camera',
    stats: [
      { label: 'Cameras', value: 0, caption: 'Installed', highlight: true },
      { label: 'Online', value: 0, caption: 'Streaming', tone: 'info' },
      { label: 'Offline', value: 0, caption: 'No signal', tone: 'warning' },
      { label: 'Motion Events', value: 0, caption: 'Last 24h' },
    ],
    sections: [
      {
        title: 'Cameras',
        searchable: true,
        columns: ['Camera', 'Location', 'Last Event', 'Status'],
        empty: { icon: 'Camera', title: 'No cameras configured' },
      },
    ],
  },
  {
    id: '218',
    route: '/mobile-device-management',
    title: 'Mobile Device Management',
    subtitle: 'Enrol and manage company mobile devices',
    icon: 'Smartphone',
    action: { label: 'Enrol Device', icon: 'Plus' },
    stats: [
      { label: 'Enrolled Devices', value: 0, caption: 'Managed', highlight: true },
      { label: 'Compliant', value: 0, caption: 'Policy met', tone: 'info' },
      { label: 'Non-Compliant', value: 0, caption: 'Action needed', tone: 'warning' },
      { label: 'Lost / Stolen', value: 0, caption: 'Locked' },
    ],
    sections: [
      {
        title: 'Devices',
        searchable: true,
        columns: ['Device', 'Assigned To', 'OS', 'Last Seen', 'Status'],
        empty: { icon: 'Smartphone', title: 'No devices enrolled yet' },
      },
    ],
  },
  {
    id: '219',
    route: '/document-management',
    title: 'Document Management',
    subtitle: 'Store, organise and share business documents',
    icon: 'FileText',
    action: { label: 'Upload', icon: 'Upload' },
    stats: [
      { label: 'Documents', value: 0, caption: 'Stored', highlight: true },
      { label: 'Shared', value: 0, caption: 'With others', tone: 'info' },
      { label: 'Expiring Soon', value: 0, caption: 'Need renewal', tone: 'warning' },
      { label: 'Storage Used', value: '0 MB', caption: 'Of quota' },
    ],
    sections: [
      {
        title: 'Documents',
        searchable: true,
        columns: ['Name', 'Type', 'Owner', 'Modified', 'Status'],
        empty: { icon: 'FileText', title: 'No documents uploaded yet' },
      },
    ],
  },
  {
    id: '220',
    route: '/document-ocr',
    title: 'Document OCR',
    subtitle: 'Extract text and data from scanned documents',
    icon: 'FileType',
    action: { label: 'Scan Document', icon: 'Upload' },
    stats: [
      { label: 'Documents Processed', value: 0, caption: 'This month', highlight: true },
      { label: 'Auto-Extracted', value: 0, caption: 'No review needed', tone: 'info' },
      { label: 'Needs Review', value: 0, caption: 'Low confidence', tone: 'warning' },
      { label: 'Avg Confidence', value: '0%', caption: 'Extraction' },
    ],
    sections: [
      {
        title: 'Processed Documents',
        columns: ['Document', 'Type', 'Fields', 'Confidence', 'Status'],
        empty: { icon: 'FileType', title: 'No documents processed yet' },
      },
    ],
  },
  {
    id: '221',
    route: '/data-import-export',
    title: 'Data Import & Export',
    subtitle: 'Bulk import and export of business data',
    icon: 'ArrowRightLeft',
    action: { label: 'New Job', icon: 'Plus' },
    stats: [
      { label: 'Jobs This Month', value: 0, caption: 'Import & export', highlight: true },
      { label: 'Completed', value: 0, caption: 'Succeeded', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'Need attention', tone: 'warning' },
      { label: 'Records Processed', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Jobs',
        columns: ['Job', 'Type', 'Records', 'Started', 'Status'],
        empty: { icon: 'ArrowRightLeft', title: 'No import or export jobs yet' },
      },
    ],
  },
  {
    id: '222',
    route: '/data-backup',
    title: 'Data Backup',
    subtitle: 'Scheduled backups and restore points',
    icon: 'Database',
    action: { label: 'Back Up Now', icon: 'Save' },
    stats: [
      { label: 'Last Backup', value: '—', caption: 'Most recent', highlight: true },
      { label: 'Restore Points', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Failed Backups', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Storage Used', value: '0 GB', caption: 'Of quota' },
    ],
    sections: [
      {
        title: 'Backup History',
        columns: ['Backup', 'Type', 'Size', 'Taken', 'Status'],
        empty: { icon: 'Database', title: 'No backups taken yet' },
      },
    ],
  },
  // ── Account & administration ──────────────────────────────────────────────
  {
    id: '224',
    route: '/user-profile',
    title: 'User Profile',
    subtitle: 'Your account details and activity',
    icon: 'UserCircle',
    action: { label: 'Edit Profile', icon: 'Pencil' },
    stats: [
      { label: 'Role', value: '—', caption: 'Assigned', highlight: true },
      { label: 'Last Login', value: '—', caption: 'Most recent', tone: 'info' },
      { label: 'Active Sessions', value: 0, caption: 'Signed in' },
      { label: 'Security Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Account Details',
        columns: ['Field', 'Value'],
        empty: { icon: 'UserCircle', title: 'Your details appear here' },
      },
    ],
  },
  {
    id: '225',
    route: '/system-settings',
    title: 'System Settings',
    subtitle: 'Global configuration for the platform',
    icon: 'Settings',
    stats: [
      { label: 'Modules Enabled', value: 0, caption: 'Active', highlight: true },
      { label: 'Integrations', value: 0, caption: 'Connected', tone: 'info' },
      { label: 'Pending Updates', value: 0, caption: 'Available', tone: 'warning' },
      { label: 'Environment', value: 'Production', caption: 'Current' },
    ],
    sections: [
      {
        title: 'Configuration',
        searchable: true,
        columns: ['Setting', 'Scope', 'Value'],
        empty: { icon: 'Settings', title: 'System settings appear here' },
      },
    ],
  },
  {
    id: '226',
    route: '/user-settings',
    title: 'User Settings',
    subtitle: 'Personal preferences and notifications',
    icon: 'Settings2',
    stats: [
      { label: 'Language', value: '—', caption: 'Interface', highlight: true },
      { label: 'Theme', value: '—', caption: 'Appearance', tone: 'info' },
      { label: 'Notifications', value: 'On', caption: 'Alerts' },
      { label: 'Two-Factor', value: 'Off', caption: 'Sign-in security', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Preferences',
        columns: ['Setting', 'Value'],
        empty: { icon: 'Settings2', title: 'Your preferences appear here' },
      },
    ],
  },
  {
    id: '228',
    route: '/security-settings',
    title: 'Security Settings',
    subtitle: 'Authentication, sessions and access policies',
    icon: 'Lock',
    stats: [
      { label: 'Two-Factor Users', value: '0%', caption: 'Enrolled', highlight: true },
      { label: 'Active Sessions', value: 0, caption: 'Across users', tone: 'info' },
      { label: 'Failed Logins', value: 0, caption: 'Last 24h', tone: 'warning' },
      { label: 'Policies', value: 0, caption: 'Enforced' },
    ],
    sections: [
      {
        title: 'Security Policies',
        columns: ['Policy', 'Scope', 'Status'],
        empty: { icon: 'Lock', title: 'No security policies configured' },
      },
    ],
  },
  {
    id: '229',
    route: '/role-management',
    title: 'Role Management',
    subtitle: 'Define roles and their permissions',
    icon: 'Key',
    action: { label: 'New Role', icon: 'Plus' },
    stats: [
      { label: 'Roles', value: 0, caption: 'Defined', highlight: true },
      { label: 'Users Assigned', value: 0, caption: 'Across roles', tone: 'info' },
      { label: 'Custom Roles', value: 0, caption: 'Non-default' },
      { label: 'Unused Roles', value: 0, caption: 'No members', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Roles',
        searchable: true,
        columns: ['Role', 'Members', 'Permissions', 'Type'],
        empty: { icon: 'Key', title: 'No roles defined yet' },
      },
    ],
  },
  // ── Productivity ──────────────────────────────────────────────────────────
  {
    id: '230',
    route: '/tasks',
    title: 'Tasks',
    subtitle: 'Your to-do list across the business',
    icon: 'ListChecks',
    action: { label: 'New Task', icon: 'Plus' },
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'To do', highlight: true },
      { label: 'Due Today', value: 0, caption: 'Time-sensitive', tone: 'warning' },
      { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
      { label: 'Completed', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'Task List',
        searchable: true,
        columns: ['Task', 'Assignee', 'Priority', 'Due', 'Status'],
        empty: { icon: 'ListChecks', title: 'No tasks yet' },
      },
    ],
  },
  {
    id: '231',
    route: '/task-management',
    title: 'Task Management',
    subtitle: 'Assign, track and prioritise team tasks',
    icon: 'ClipboardList',
    action: { label: 'New Task', icon: 'Plus' },
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'Across the team', highlight: true },
      { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
      { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
      { label: 'Completed', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'All Tasks',
        searchable: true,
        columns: ['Task', 'Assignee', 'Project', 'Due', 'Status'],
        empty: { icon: 'ClipboardList', title: 'No tasks yet' },
      },
    ],
  },
  {
    id: '232',
    route: '/tools',
    title: 'Tools',
    subtitle: 'Utilities and shortcuts for the workshop',
    icon: 'Hammer',
    stats: [
      { label: 'Available Tools', value: 0, caption: 'In this workspace', highlight: true },
      { label: 'Recently Used', value: 0, caption: 'This week', tone: 'info' },
      { label: 'Pinned', value: 0, caption: 'Favourites' },
      { label: 'Updates', value: 0, caption: 'Available', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Toolbox',
        searchable: true,
        columns: ['Tool', 'Category', 'Description'],
        empty: { icon: 'Hammer', title: 'No tools available yet' },
      },
    ],
  },
  {
    id: '233',
    route: '/dashboard-widgets',
    title: 'Dashboard Widgets',
    subtitle: 'Configure the widgets shown on your dashboard',
    icon: 'LayoutGrid',
    action: { label: 'Add Widget', icon: 'Plus' },
    stats: [
      { label: 'Active Widgets', value: 0, caption: 'On your dashboard', highlight: true },
      { label: 'Available', value: 0, caption: 'To add', tone: 'info' },
      { label: 'Pinned', value: 0, caption: 'Always shown' },
      { label: 'Needs Data Source', value: 0, caption: 'Unconfigured', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Widgets',
        columns: ['Widget', 'Data Source', 'Size', 'Status'],
        empty: { icon: 'LayoutGrid', title: 'No widgets configured yet' },
      },
    ],
  },
  {
    id: '234',
    route: '/sms-integration',
    title: 'SMS Integration',
    subtitle: 'Connect an SMS gateway for customer messaging',
    icon: 'MessageSquare',
    action: { label: 'Connect Gateway', icon: 'Plus' },
    stats: [
      { label: 'Gateway', value: 'Not Connected', caption: 'Provider', highlight: true },
      { label: 'Sent This Month', value: 0, caption: 'Messages', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'Delivery errors', tone: 'warning' },
      { label: 'Credit Balance', value: 'SAR 0.00', caption: 'Remaining' },
    ],
    sections: [
      {
        title: 'Recent Messages',
        columns: ['Recipient', 'Message', 'Sent', 'Status'],
        empty: { icon: 'MessageSquare', title: 'No messages sent yet' },
      },
    ],
  },
  {
    id: '235',
    route: '/sales-guide',
    title: 'Sales Guide',
    subtitle: 'Playbooks and scripts for service advisors',
    icon: 'BookOpen',
    stats: [
      { label: 'Guides', value: 0, caption: 'Available', highlight: true },
      { label: 'Updated This Month', value: 0, caption: 'Refreshed', tone: 'info' },
      { label: 'Bookmarked', value: 0, caption: 'Saved by you' },
      { label: 'Needs Review', value: 0, caption: 'Stale content', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Guides',
        searchable: true,
        columns: ['Guide', 'Category', 'Updated'],
        empty: { icon: 'BookOpen', title: 'No sales guides available yet' },
      },
    ],
  },
]

/** route → definition, for the router. */
export const FEATURE_DEF_BY_ROUTE = new Map(FEATURE_DEFS.map((def) => [def.route, def]))
