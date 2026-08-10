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
]

/** route → definition, for the router. */
export const FEATURE_DEF_BY_ROUTE = new Map(FEATURE_DEFS.map((def) => [def.route, def]))
