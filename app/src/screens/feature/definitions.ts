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

  // ── Dashboard variants ───────────────────────────────────────────────────
  {
    id: '001',
    route: '/dashboard-home',
    title: 'Dashboard Home',
    subtitle: 'Overview of garage operations and key metrics',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'Active Jobs', value: 0, caption: 'In progress', highlight: true },
      { label: 'Pending Approvals', value: 0, caption: 'Awaiting action', tone: 'warning' },
      { label: "Today's Revenue", value: 'SAR 0.00', caption: 'Invoiced', tone: 'info' },
      { label: 'Customer Satisfaction', value: '0%', caption: 'This month' },
    ],
    sections: [
      {
        title: "Today's Schedule",
        columns: ['Time', 'Customer', 'Vehicle', 'Service', 'Status'],
        empty: { icon: 'Calendar', title: 'No appointments today' },
      },
      {
        title: 'Recent Activity',
        columns: ['Action', 'User', 'Details', 'When'],
        empty: { icon: 'Activity', title: 'No recent activity' },
      },
    ],
  },
  {
    id: '003',
    route: '/dashboard-main',
    title: 'Dashboard Main',
    subtitle: 'Comprehensive operational overview with real-time data',
    icon: 'BarChart3',
    stats: [
      { label: 'Total Jobs', value: 0, caption: 'This month', highlight: true },
      { label: 'Completed', value: 0, caption: 'Closed jobs', tone: 'info' },
      { label: 'Revenue', value: 'SAR 0.00', caption: 'This month' },
      { label: 'Utilisation', value: '0%', caption: 'Bay occupancy' },
    ],
    sections: [
      {
        title: 'Jobs by Status',
        columns: ['Status', 'Count', 'Avg Age', 'Revenue'],
        empty: { icon: 'BarChart3', title: 'No job data yet' },
      },
    ],
  },
  {
    id: '014',
    route: '/calendar',
    title: 'Calendar',
    subtitle: 'Unified calendar view of appointments, jobs and events',
    icon: 'Calendar',
    action: { label: 'New Event', icon: 'Plus' },
    stats: [
      { label: "Today's Events", value: 0, caption: 'Scheduled', highlight: true },
      { label: 'This Week', value: 0, caption: 'Upcoming', tone: 'info' },
      { label: 'Conflicts', value: 0, caption: 'Overlapping', tone: 'warning' },
      { label: 'Unconfirmed', value: 0, caption: 'Awaiting response' },
    ],
    sections: [
      {
        title: 'Upcoming Events',
        columns: ['Date', 'Time', 'Type', 'Customer', 'Details'],
        empty: { icon: 'Calendar', title: 'No events scheduled' },
      },
    ],
  },
  {
    id: '002',
    route: '/welcome-page',
    title: 'Welcome Page',
    subtitle: 'Personalised landing page after login',
    icon: 'Home',
    stats: [
      { label: 'Pending Tasks', value: 0, caption: 'Assigned to you', highlight: true },
      { label: 'Notifications', value: 0, caption: 'Unread', tone: 'info' },
      { label: 'Approvals', value: 0, caption: 'Waiting on you', tone: 'warning' },
      { label: 'Messages', value: 0, caption: 'New' },
    ],
    sections: [
      {
        title: 'My Tasks',
        columns: ['Task', 'Priority', 'Due', 'Status'],
        empty: { icon: 'CheckCircle', title: 'All caught up', description: 'No pending tasks assigned to you.' },
      },
    ],
  },

  // ── Customer intake ──────────────────────────────────────────────────────
  {
    id: '004',
    route: '/customers-list',
    title: 'Customers List',
    subtitle: 'Management of customer profiles and contact information',
    icon: 'Users',
    action: { label: 'Add Customer', icon: 'Plus' },
    stats: [
      { label: 'Total Customers', value: 0, caption: 'Registered', highlight: true },
      { label: 'Active', value: 0, caption: 'Visited this quarter', tone: 'info' },
      { label: 'New This Month', value: 0, caption: 'Recently added' },
      { label: 'Inactive', value: 0, caption: 'No visit in 6 months', tone: 'warning' },
    ],
    sections: [
      {
        title: 'All Customers',
        searchable: true,
        columns: ['Name', 'Phone', 'Email', 'Vehicles', 'Last Visit'],
        empty: { icon: 'Users', title: 'No customers registered yet' },
      },
    ],
  },

  // ── Marketing ────────────────────────────────────────────────────────────
  {
    id: '010',
    route: '/loyalty-program',
    title: 'Loyalty Program',
    subtitle: 'Manage tiered rewards, points and exclusive offers',
    icon: 'Gift',
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'members', label: 'Members', icon: 'Users' },
      { id: 'rewards', label: 'Rewards & Offers', icon: 'Gift' },
      { id: 'settings', label: 'Settings', icon: 'Settings' },
    ],
    stats: [
      { label: 'Total Members', value: 0, caption: 'Enrolled', highlight: true },
      { label: 'Active Offers', value: 0, caption: 'Rewards available', tone: 'info' },
      { label: 'Redemptions', value: 0, caption: 'This month' },
      { label: 'Avg Points', value: 0, caption: 'Per member' },
    ],
    sections: [
      {
        title: 'Member Activity',
        searchable: true,
        columns: ['Customer', 'Tier', 'Points', 'Joined', 'Last Activity'],
        empty: { icon: 'Gift', title: 'No loyalty members yet', description: 'Enrol your first customer to get started.' },
      },
    ],
  },

  // ── Inspection ───────────────────────────────────────────────────────────
  {
    id: '021',
    route: '/vehicle-inspections',
    title: 'Vehicle Inspections',
    subtitle: 'Multi-point inspection records and results',
    icon: 'ClipboardCheck',
    action: { label: 'New Inspection', icon: 'Plus' },
    stats: [
      { label: 'Inspections Today', value: 0, caption: 'Completed', highlight: true },
      { label: 'Pass Rate', value: '0%', caption: 'This month', tone: 'info' },
      { label: 'Failed Items', value: 0, caption: 'Needs repair', tone: 'warning' },
      { label: 'Pending', value: 0, caption: 'In progress' },
    ],
    sections: [
      {
        title: 'Inspection Records',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Type', 'Inspector', 'Result', 'Date'],
        empty: { icon: 'ClipboardCheck', title: 'No inspections recorded yet' },
      },
    ],
  },

  // ── Vehicle management ───────────────────────────────────────────────────
  {
    id: '020',
    route: '/vehicles-list',
    title: 'Vehicles List',
    subtitle: 'Browse and manage all registered vehicles',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'Total Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'In Service', value: 0, caption: 'Currently in workshop', tone: 'info' },
      { label: 'Due Service', value: 0, caption: 'Overdue maintenance', tone: 'warning' },
      { label: 'New This Month', value: 0, caption: 'Recently added' },
    ],
    sections: [
      {
        title: 'All Vehicles',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Owner', 'Year', 'Last Service'],
        empty: { icon: 'Car', title: 'No vehicles registered yet' },
      },
    ],
  },
  {
    id: '023',
    route: '/vehicle-history',
    title: 'Vehicle History',
    subtitle: 'Complete service and repair history per vehicle',
    icon: 'History',
    stats: [
      { label: 'Vehicles with History', value: 0, caption: 'Service records', highlight: true },
      { label: 'Total Services', value: 0, caption: 'All time', tone: 'info' },
      { label: 'Avg Services', value: 0, caption: 'Per vehicle' },
      { label: 'Warranty Claims', value: 0, caption: 'Linked to history' },
    ],
    sections: [
      {
        title: 'Service History',
        searchable: true,
        columns: ['Vehicle', 'Plate', 'Service', 'Date', 'Cost', 'Technician'],
        empty: { icon: 'History', title: 'No service history available' },
      },
    ],
  },

  // ── Operations ───────────────────────────────────────────────────────────
  {
    id: '015',
    route: '/workshop-calendar',
    title: 'Workshop Calendar',
    subtitle: 'Bay and technician scheduling for the workshop floor',
    icon: 'CalendarDays',
    action: { label: 'New Booking', icon: 'Plus' },
    stats: [
      { label: "Today's Jobs", value: 0, caption: 'Scheduled', highlight: true },
      { label: 'Bays Occupied', value: 0, caption: 'Currently', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past estimated time', tone: 'warning' },
      { label: 'Available Slots', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: "Today's Schedule",
        columns: ['Time', 'Bay', 'Vehicle', 'Service', 'Technician', 'Status'],
        empty: { icon: 'CalendarDays', title: 'No jobs scheduled today' },
      },
    ],
  },
  {
    id: '029',
    route: '/fleet-tracking',
    title: 'Fleet Tracking',
    subtitle: 'Live GPS tracking for fleet and service vehicles',
    icon: 'Navigation',
    stats: [
      { label: 'Tracked Vehicles', value: 0, caption: 'With GPS', highlight: true },
      { label: 'On the Road', value: 0, caption: 'Moving now', tone: 'info' },
      { label: 'Idle', value: 0, caption: 'Stationary' },
      { label: 'Alerts', value: 0, caption: 'Speed or geofence', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Fleet Positions',
        searchable: true,
        columns: ['Vehicle', 'Driver', 'Location', 'Speed', 'Last Updated'],
        empty: { icon: 'Navigation', title: 'No fleet vehicles tracked' },
      },
    ],
  },
  {
    id: '032',
    route: '/towing-assistance',
    title: 'Towing Assistance',
    subtitle: 'Roadside recovery requests and dispatch',
    icon: 'Truck',
    action: { label: 'New Request', icon: 'Plus' },
    stats: [
      { label: 'Active Requests', value: 0, caption: 'In progress', highlight: true },
      { label: 'Dispatched', value: 0, caption: 'En route', tone: 'info' },
      { label: 'Completed Today', value: 0, caption: 'Delivered' },
      { label: 'Avg Response', value: '0m', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Tow Requests',
        columns: ['Reference', 'Customer', 'Pickup Location', 'Operator', 'ETA', 'Status'],
        empty: { icon: 'Truck', title: 'No towing requests' },
      },
    ],
  },
  {
    id: '060',
    route: '/automated-reordering',
    title: 'Automated Reordering',
    subtitle: 'Rules and triggers for automatic stock replenishment',
    icon: 'RefreshCcw',
    action: { label: 'New Rule', icon: 'Plus' },
    stats: [
      { label: 'Active Rules', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Orders Created', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Below Threshold', value: 0, caption: 'Parts triggering soon', tone: 'warning' },
      { label: 'Savings', value: 'SAR 0.00', caption: 'Vs manual ordering' },
    ],
    sections: [
      {
        title: 'Reorder Rules',
        searchable: true,
        columns: ['Part', 'Current Stock', 'Threshold', 'Order Qty', 'Supplier', 'Status'],
        empty: { icon: 'RefreshCcw', title: 'No auto-reorder rules set up' },
      },
    ],
  },
  {
    id: '062',
    route: '/barcode-scanner',
    title: 'Barcode Scanner',
    subtitle: 'Scan parts and inventory items for quick lookup',
    icon: 'ScanBarcode',
    action: { label: 'Start Scan', icon: 'ScanLine' },
    stats: [
      { label: 'Scans Today', value: 0, caption: 'Items scanned', highlight: true },
      { label: 'Matched', value: 0, caption: 'Found in inventory', tone: 'info' },
      { label: 'Not Found', value: 0, caption: 'Unknown barcodes', tone: 'warning' },
      { label: 'Added to Job', value: 0, caption: 'Linked to job cards' },
    ],
    sections: [
      {
        title: 'Recent Scans',
        columns: ['Barcode', 'Part', 'SKU', 'Location', 'Scanned'],
        empty: { icon: 'ScanBarcode', title: 'No scans recorded yet' },
      },
    ],
  },
  {
    id: '069',
    route: '/purchase-orders',
    title: 'Purchase Orders',
    subtitle: 'Create and manage purchase orders for parts and supplies',
    icon: 'FileText',
    action: { label: 'New Order', icon: 'Plus' },
    stats: [
      { label: 'Open Orders', value: 0, caption: 'In progress', highlight: true },
      { label: 'Pending Approval', value: 0, caption: 'Awaiting sign-off', tone: 'warning' },
      { label: 'This Month', value: 'SAR 0.00', caption: 'Order value', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past delivery date' },
    ],
    sections: [
      {
        title: 'Purchase Orders',
        searchable: true,
        columns: ['PO Number', 'Supplier', 'Items', 'Total', 'Expected', 'Status'],
        empty: { icon: 'FileText', title: 'No purchase orders yet' },
      },
    ],
  },
  {
    id: '073',
    route: '/parts-network-my-requests',
    title: 'Parts Network My Requests',
    subtitle: 'Parts requests you have sent to the network',
    icon: 'Send',
    stats: [
      { label: 'Sent Requests', value: 0, caption: 'Total', highlight: true },
      { label: 'Awaiting Quotes', value: 0, caption: 'Pending response', tone: 'info' },
      { label: 'Quoted', value: 0, caption: 'Offers received' },
      { label: 'Expired', value: 0, caption: 'No response', tone: 'warning' },
    ],
    sections: [
      {
        title: 'My Requests',
        searchable: true,
        columns: ['Part', 'Quantity', 'Sent', 'Responses', 'Best Price', 'Status'],
        empty: { icon: 'Send', title: 'No requests sent yet' },
      },
    ],
  },
  {
    id: '074',
    route: '/parts-network-incoming-requests',
    title: 'Parts Network Incoming Requests',
    subtitle: 'Parts requests received from other garages',
    icon: 'Inbox',
    stats: [
      { label: 'Incoming', value: 0, caption: 'Total received', highlight: true },
      { label: 'Needs Response', value: 0, caption: 'Unanswered', tone: 'warning' },
      { label: 'Quoted', value: 0, caption: 'Responded', tone: 'info' },
      { label: 'Won', value: 0, caption: 'Orders placed' },
    ],
    sections: [
      {
        title: 'Incoming Requests',
        searchable: true,
        columns: ['From', 'Part', 'Quantity', 'Urgency', 'Received', 'Status'],
        empty: { icon: 'Inbox', title: 'No incoming requests' },
      },
    ],
  },

  // ── Parts & inventory ────────────────────────────────────────────────────
  {
    id: '054',
    route: '/inventory-management',
    title: 'Inventory Management',
    subtitle: 'Advanced inventory control with stock alerts and multi-location transfers',
    icon: 'Package',
    action: { label: 'Add Part', icon: 'Plus' },
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'alerts', label: 'Alerts', icon: 'Bell' },
      { id: 'auto-reorder', label: 'Auto-Reorder', icon: 'RefreshCw' },
      { id: 'transfers', label: 'Transfers', icon: 'ArrowLeftRight' },
    ],
    stats: [
      { label: 'Total Parts', value: 0, caption: 'Active items', highlight: true },
      { label: 'Low Stock Alerts', value: 0, caption: 'Requires attention', tone: 'warning' },
      { label: 'Pending Transfers', value: 0, caption: 'Awaiting approval', tone: 'info' },
      { label: 'Auto-Reorder Enabled', value: 0, caption: 'Active rules' },
    ],
    sections: [
      {
        title: 'Inventory Summary',
        subtitle: 'Quick overview of parts inventory',
        searchable: true,
        columns: ['Part Name', 'SKU', 'Category', 'Stock Status'],
        empty: { icon: 'Package', title: 'No parts in inventory' },
      },
    ],
  },
  {
    id: '061',
    route: '/spare-parts',
    title: 'Spare Parts',
    subtitle: 'Spare parts catalogue with pricing and compatibility',
    icon: 'Wrench',
    action: { label: 'Add Part', icon: 'Plus' },
    stats: [
      { label: 'Parts Listed', value: 0, caption: 'In catalogue', highlight: true },
      { label: 'In Stock', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Out of Stock', value: 0, caption: 'Needs reorder', tone: 'warning' },
      { label: 'Avg Lead Time', value: '0d', caption: 'From supplier' },
    ],
    sections: [
      {
        title: 'Parts Catalogue',
        searchable: true,
        columns: ['Part', 'SKU', 'OEM Number', 'Price', 'Stock', 'Supplier'],
        empty: { icon: 'Wrench', title: 'No spare parts listed yet' },
      },
    ],
  },
  {
    id: '063',
    route: '/internal-warehouse',
    title: 'Internal Warehouse',
    subtitle: 'Stock locations, bins and warehouse layout',
    icon: 'Warehouse',
    stats: [
      { label: 'Locations', value: 0, caption: 'Storage bins', highlight: true },
      { label: 'Items Stored', value: 0, caption: 'Total units', tone: 'info' },
      { label: 'Pending Picks', value: 0, caption: 'Job requests', tone: 'warning' },
      { label: 'Utilisation', value: '0%', caption: 'Space used' },
    ],
    sections: [
      {
        title: 'Warehouse Locations',
        searchable: true,
        columns: ['Location', 'Zone', 'Items', 'Capacity', 'Status'],
        empty: { icon: 'Warehouse', title: 'No warehouse locations defined' },
      },
    ],
  },
  {
    id: '068',
    route: '/suppliers',
    title: 'Suppliers',
    subtitle: 'Supplier directory with contacts, terms and ratings',
    icon: 'Building2',
    action: { label: 'Add Supplier', icon: 'Plus' },
    stats: [
      { label: 'Active Suppliers', value: 0, caption: 'In directory', highlight: true },
      { label: 'Preferred', value: 0, caption: 'Top-rated', tone: 'info' },
      { label: 'Overdue Payments', value: 0, caption: 'Past terms', tone: 'warning' },
      { label: 'Avg Lead Time', value: '0d', caption: 'Delivery' },
    ],
    sections: [
      {
        title: 'Supplier Directory',
        searchable: true,
        columns: ['Supplier', 'Contact', 'Category', 'Rating', 'Terms', 'Status'],
        empty: { icon: 'Building2', title: 'No suppliers added yet' },
      },
    ],
  },

  // ── Team & HR ────────────────────────────────────────────────────────────
  {
    id: '099',
    route: '/technician-management',
    title: 'Technician Management',
    subtitle: 'Manage technician profiles, skills and assignments',
    icon: 'UserCog',
    action: { label: 'Add Technician', icon: 'Plus' },
    stats: [
      { label: 'Technicians', value: 0, caption: 'Active', highlight: true },
      { label: 'On Duty', value: 0, caption: 'Clocked in', tone: 'info' },
      { label: 'Certifications Expiring', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Avg Jobs/Day', value: 0, caption: 'Per technician' },
    ],
    sections: [
      {
        title: 'Technician Directory',
        searchable: true,
        columns: ['Name', 'Level', 'Specialisation', 'Rate', 'Certifications', 'Status'],
        empty: { icon: 'UserCog', title: 'No technicians registered' },
      },
    ],
  },
  {
    id: '100',
    route: '/technician-leaderboards',
    title: 'Technician Leaderboards',
    subtitle: 'Performance rankings and achievement tracking',
    icon: 'Trophy',
    stats: [
      { label: 'Top Performer', value: '—', caption: 'This month', highlight: true },
      { label: 'Jobs Completed', value: 0, caption: 'Team total', tone: 'info' },
      { label: 'First-Time Fix', value: '0%', caption: 'Team average' },
      { label: 'Avg Rating', value: '0.0', caption: 'Customer score' },
    ],
    sections: [
      {
        title: 'Rankings',
        columns: ['Rank', 'Technician', 'Jobs', 'Efficiency', 'Rating', 'Points'],
        empty: { icon: 'Trophy', title: 'Not enough data to rank yet' },
      },
    ],
  },
  {
    id: '101',
    route: '/technician-performance',
    title: 'Technician Performance',
    subtitle: 'Detailed performance metrics and productivity analysis',
    icon: 'TrendingUp',
    stats: [
      { label: 'Avg Efficiency', value: '0%', caption: 'Labour vs estimated', highlight: true },
      { label: 'Comebacks', value: 0, caption: 'Rework jobs', tone: 'warning' },
      { label: 'Revenue per Tech', value: 'SAR 0.00', caption: 'This month', tone: 'info' },
      { label: 'Utilisation', value: '0%', caption: 'Billable hours' },
    ],
    sections: [
      {
        title: 'Performance Summary',
        searchable: true,
        columns: ['Technician', 'Jobs', 'Efficiency', 'Comebacks', 'Revenue', 'Rating'],
        empty: { icon: 'TrendingUp', title: 'No performance data yet' },
      },
    ],
  },

  // ── Enterprise ───────────────────────────────────────────────────────────
  {
    id: '065',
    route: '/parts-marketplace',
    title: 'Parts Marketplace',
    subtitle: 'Browse and purchase parts from network suppliers',
    icon: 'Store',
    stats: [
      { label: 'Listed Parts', value: 0, caption: 'From suppliers', highlight: true },
      { label: 'Suppliers', value: 0, caption: 'Active vendors', tone: 'info' },
      { label: 'Orders Placed', value: 0, caption: 'This month' },
      { label: 'Avg Savings', value: '0%', caption: 'Vs list price' },
    ],
    sections: [
      {
        title: 'Marketplace Listings',
        searchable: true,
        columns: ['Part', 'Supplier', 'Price', 'Availability', 'Lead Time'],
        empty: { icon: 'Store', title: 'No marketplace listings available' },
      },
    ],
  },
  {
    id: '066',
    route: '/dynamic-pricing',
    title: 'Dynamic Pricing',
    subtitle: 'Demand-based pricing rules for services and parts',
    icon: 'DollarSign',
    action: { label: 'New Rule', icon: 'Plus' },
    stats: [
      { label: 'Active Rules', value: 0, caption: 'Pricing rules', highlight: true },
      { label: 'Adjustments Today', value: 0, caption: 'Prices changed', tone: 'info' },
      { label: 'Revenue Impact', value: 'SAR 0.00', caption: 'Additional revenue' },
      { label: 'Override Rate', value: '0%', caption: 'Manual overrides', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Pricing Rules',
        searchable: true,
        columns: ['Rule', 'Applies To', 'Adjustment', 'Trigger', 'Status'],
        empty: { icon: 'DollarSign', title: 'No dynamic pricing rules defined' },
      },
    ],
  },
  {
    id: '071',
    route: '/parts-network-dashboard',
    title: 'Parts Network Dashboard',
    subtitle: 'Overview of inter-garage parts sharing network',
    icon: 'Network',
    stats: [
      { label: 'Network Members', value: 0, caption: 'Connected garages', highlight: true },
      { label: 'Active Requests', value: 0, caption: 'Open now', tone: 'info' },
      { label: 'Fulfilled', value: 0, caption: 'This month' },
      { label: 'Avg Response', value: '0h', caption: 'Time to quote' },
    ],
    sections: [
      {
        title: 'Network Activity',
        columns: ['Type', 'From', 'To', 'Part', 'Status', 'Date'],
        empty: { icon: 'Network', title: 'No network activity yet' },
      },
    ],
  },

  // ── AI Hub ───────────────────────────────────────────────────────────────
  {
    id: '058',
    route: '/smart-parts-recommendations',
    title: 'Smart Parts Recommendations',
    subtitle: 'AI-suggested parts based on vehicle and service patterns',
    icon: 'Lightbulb',
    stats: [
      { label: 'Recommendations', value: 0, caption: 'This month', highlight: true },
      { label: 'Accepted', value: 0, caption: 'Added to orders', tone: 'info' },
      { label: 'Dismissed', value: 0, caption: 'Skipped' },
      { label: 'Accuracy', value: '0%', caption: 'Acceptance rate' },
    ],
    sections: [
      {
        title: 'Current Recommendations',
        columns: ['Vehicle', 'Service', 'Suggested Part', 'Confidence', 'Action'],
        empty: { icon: 'Lightbulb', title: 'No recommendations available', description: 'Recommendations need service history to learn from.' },
      },
    ],
  },
  {
    id: '067',
    route: '/intelligent-price-optimizer',
    title: 'Intelligent Price Optimizer',
    subtitle: 'AI-driven pricing suggestions based on market and demand',
    icon: 'Brain',
    stats: [
      { label: 'Optimised Items', value: 0, caption: 'Parts & services', highlight: true },
      { label: 'Revenue Uplift', value: 'SAR 0.00', caption: 'Estimated gain', tone: 'info' },
      { label: 'Below Market', value: 0, caption: 'Underpriced items', tone: 'warning' },
      { label: 'Model Confidence', value: '0%', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Price Suggestions',
        searchable: true,
        columns: ['Item', 'Current Price', 'Suggested', 'Change', 'Reason'],
        empty: { icon: 'Brain', title: 'Not enough data to optimise prices yet' },
      },
    ],
  },

  // ── Emerging tech ────────────────────────────────────────────────────────
  {
    id: '064',
    route: '/interactive-3-d-parts',
    title: 'Interactive 3D Parts',
    subtitle: 'Exploded 3D views for part identification and ordering',
    icon: 'Box',
    stats: [
      { label: '3D Models', value: 0, caption: 'Available', highlight: true },
      { label: 'Vehicle Makes', value: 0, caption: 'Covered', tone: 'info' },
      { label: 'Parts Identified', value: 0, caption: 'This month' },
      { label: 'Orders from 3D', value: 0, caption: 'Placed via viewer' },
    ],
    sections: [
      {
        title: 'Available Models',
        searchable: true,
        columns: ['Vehicle', 'System', 'Parts Count', 'Last Updated'],
        empty: { icon: 'Box', title: 'No 3D models available yet' },
      },
    ],
  },

  // ── Vendor portal ────────────────────────────────────────────────────────
  {
    id: '070',
    route: '/vendor-supplier-portal',
    title: 'Vendor Supplier Portal',
    subtitle: 'Self-service portal for suppliers to manage orders and invoices',
    icon: 'Building',
    stats: [
      { label: 'Active Vendors', value: 0, caption: 'With portal access', highlight: true },
      { label: 'Open Orders', value: 0, caption: 'Pending fulfilment', tone: 'info' },
      { label: 'Pending Invoices', value: 0, caption: 'Awaiting payment', tone: 'warning' },
      { label: 'Avg Fulfilment', value: '0d', caption: 'Order to delivery' },
    ],
    sections: [
      {
        title: 'Vendor Activity',
        searchable: true,
        columns: ['Vendor', 'Open Orders', 'Pending Invoices', 'Last Activity', 'Rating'],
        empty: { icon: 'Building', title: 'No vendors with portal access' },
      },
    ],
  },

  // ── Purchase Agent Portal ────────────────────────────────────────────────
  {
    id: '079',
    route: '/purchase-agent-dashboard',
    title: 'Purchase Agent Dashboard',
    subtitle: 'Manage procurement, track orders and monitor inventory levels',
    icon: 'ShoppingCart',
    stats: [
      { label: 'Pending Orders', value: 0, caption: 'Awaiting action', highlight: true },
      { label: 'Low Stock Items', value: 0, caption: 'Needs attention', tone: 'warning' },
      { label: 'Active Suppliers', value: 0, caption: 'In network', tone: 'info' },
      { label: 'Total Order Value', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Recent Purchase Orders',
        subtitle: 'Latest procurement activities',
        columns: ['PO Number', 'Supplier', 'Items', 'Total', 'Status'],
        empty: { icon: 'ShoppingCart', title: 'No purchase orders yet' },
      },
      {
        title: 'Low Stock Alerts',
        subtitle: 'Items requiring immediate attention',
        columns: ['Part', 'SKU', 'On Hand', 'Threshold', 'Suggested Action'],
        empty: { icon: 'CheckCircle', title: 'All inventory levels are healthy' },
      },
    ],
  },
  {
    id: '080',
    route: '/purchase-agent-tasks',
    title: 'Purchase Agent Tasks',
    subtitle: 'Task inbox for procurement activities and follow-ups',
    icon: 'ClipboardList',
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'Assigned to you', highlight: true },
      { label: 'Due Today', value: 0, caption: 'Needs action', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This week', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past deadline' },
    ],
    sections: [
      {
        title: 'Task Inbox',
        searchable: true,
        columns: ['Task', 'Priority', 'Related To', 'Due', 'Status'],
        empty: { icon: 'ClipboardList', title: 'No tasks assigned' },
      },
    ],
  },
  {
    id: '081',
    route: '/purchase-agent-quotations',
    title: 'Purchase Agent Quotations',
    subtitle: 'Request and compare supplier quotations',
    icon: 'FileSearch',
    action: { label: 'Request Quote', icon: 'Plus' },
    stats: [
      { label: 'Open RFQs', value: 0, caption: 'Awaiting quotes', highlight: true },
      { label: 'Quotes Received', value: 0, caption: 'To compare', tone: 'info' },
      { label: 'Expiring Soon', value: 0, caption: 'Within 7 days', tone: 'warning' },
      { label: 'Converted', value: 0, caption: 'To purchase orders' },
    ],
    sections: [
      {
        title: 'Quotations',
        searchable: true,
        columns: ['RFQ Number', 'Parts', 'Suppliers Quoted', 'Best Price', 'Deadline', 'Status'],
        empty: { icon: 'FileSearch', title: 'No quotation requests' },
      },
    ],
  },
  {
    id: '082',
    route: '/purchase-agent-payments',
    title: 'Purchase Agent Payments',
    subtitle: 'Track supplier payments and outstanding balances',
    icon: 'Banknote',
    stats: [
      { label: 'Due This Month', value: 'SAR 0.00', caption: 'Payable', highlight: true },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms', tone: 'warning' },
      { label: 'Paid This Month', value: 'SAR 0.00', caption: 'Settled', tone: 'info' },
      { label: 'Credit Available', value: 'SAR 0.00', caption: 'Supplier credit' },
    ],
    sections: [
      {
        title: 'Payment Schedule',
        searchable: true,
        columns: ['Supplier', 'Invoice', 'Amount', 'Due Date', 'Status'],
        empty: { icon: 'Banknote', title: 'No payments scheduled' },
      },
    ],
  },
  {
    id: '083',
    route: '/purchase-agent-delivery',
    title: 'Purchase Agent Delivery',
    subtitle: 'Track inbound deliveries and receive stock',
    icon: 'PackageCheck',
    stats: [
      { label: 'Expected Today', value: 0, caption: 'Deliveries', highlight: true },
      { label: 'In Transit', value: 0, caption: 'On the way', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past expected date', tone: 'warning' },
      { label: 'Received Today', value: 0, caption: 'Checked in' },
    ],
    sections: [
      {
        title: 'Inbound Deliveries',
        columns: ['PO Number', 'Supplier', 'Items', 'Expected', 'Tracking', 'Status'],
        empty: { icon: 'PackageCheck', title: 'No deliveries expected' },
      },
    ],
  },
  {
    id: '084',
    route: '/purchase-agent-orders',
    title: 'Purchase Agent Orders',
    subtitle: 'All purchase orders with full lifecycle tracking',
    icon: 'ShoppingBag',
    action: { label: 'New Order', icon: 'Plus' },
    stats: [
      { label: 'Total Orders', value: 0, caption: 'All time', highlight: true },
      { label: 'Open', value: 0, caption: 'In progress', tone: 'info' },
      { label: 'Pending Approval', value: 0, caption: 'Awaiting sign-off', tone: 'warning' },
      { label: 'This Month', value: 'SAR 0.00', caption: 'Order value' },
    ],
    sections: [
      {
        title: 'Purchase Orders',
        searchable: true,
        columns: ['PO Number', 'Supplier', 'Items', 'Total', 'Created', 'Status'],
        empty: { icon: 'ShoppingBag', title: 'No purchase orders' },
      },
    ],
  },
  {
    id: '085',
    route: '/purchase-agent-suppliers',
    title: 'Purchase Agent Suppliers',
    subtitle: 'Manage supplier relationships and evaluate performance',
    icon: 'Building2',
    action: { label: 'Add Supplier', icon: 'Plus' },
    stats: [
      { label: 'Active Suppliers', value: 0, caption: 'In network', highlight: true },
      { label: 'Preferred', value: 0, caption: 'Top-rated', tone: 'info' },
      { label: 'New This Month', value: 0, caption: 'Recently added' },
      { label: 'Avg Rating', value: '0.0', caption: 'Out of 5' },
    ],
    sections: [
      {
        title: 'Supplier Directory',
        searchable: true,
        columns: ['Supplier', 'Category', 'Lead Time', 'Rating', 'Orders', 'Status'],
        empty: { icon: 'Building2', title: 'No suppliers added' },
      },
    ],
  },
  {
    id: '086',
    route: '/purchase-agent-inventory',
    title: 'Purchase Agent Inventory',
    subtitle: 'Monitor stock levels and identify procurement needs',
    icon: 'PackageSearch',
    stats: [
      { label: 'Tracked SKUs', value: 0, caption: 'Parts monitored', highlight: true },
      { label: 'Low Stock', value: 0, caption: 'Below threshold', tone: 'warning' },
      { label: 'On Order', value: 0, caption: 'Inbound', tone: 'info' },
      { label: 'Stock Value', value: 'SAR 0.00', caption: 'Total on hand' },
    ],
    sections: [
      {
        title: 'Inventory Status',
        searchable: true,
        columns: ['Part', 'SKU', 'On Hand', 'On Order', 'Threshold', 'Status'],
        empty: { icon: 'PackageSearch', title: 'No inventory items tracked' },
      },
    ],
  },
  {
    id: '087',
    route: '/purchase-agent-price-compare',
    title: 'Purchase Agent Price Compare',
    subtitle: 'Compare pricing across suppliers for the same part',
    icon: 'ArrowLeftRight',
    stats: [
      { label: 'Comparisons', value: 0, caption: 'Parts compared', highlight: true },
      { label: 'Potential Savings', value: 'SAR 0.00', caption: 'If switched', tone: 'info' },
      { label: 'Price Drops', value: 0, caption: 'Since last check' },
      { label: 'Suppliers Covered', value: 0, caption: 'With pricing data' },
    ],
    sections: [
      {
        title: 'Price Comparisons',
        searchable: true,
        columns: ['Part', 'Current Supplier', 'Current Price', 'Best Price', 'Best Supplier', 'Savings'],
        empty: { icon: 'ArrowLeftRight', title: 'No price comparisons yet' },
      },
    ],
  },
  {
    id: '088',
    route: '/purchase-agent-tracking',
    title: 'Purchase Agent Tracking',
    subtitle: 'Track shipments and deliveries in real time',
    icon: 'MapPin',
    stats: [
      { label: 'Active Shipments', value: 0, caption: 'In transit', highlight: true },
      { label: 'Arriving Today', value: 0, caption: 'Expected delivery', tone: 'info' },
      { label: 'Delayed', value: 0, caption: 'Behind schedule', tone: 'warning' },
      { label: 'Delivered', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'Shipment Tracking',
        searchable: true,
        columns: ['Tracking ID', 'PO Number', 'Supplier', 'Origin', 'ETA', 'Status'],
        empty: { icon: 'MapPin', title: 'No shipments to track' },
      },
    ],
  },
  {
    id: '089',
    route: '/purchase-agent-reports',
    title: 'Purchase Agent Reports',
    subtitle: 'Procurement analytics and spending reports',
    icon: 'BarChart3',
    stats: [
      { label: 'Total Spend', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Orders', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Avg Order Value', value: 'SAR 0.00', caption: 'Per order' },
      { label: 'Savings Achieved', value: 'SAR 0.00', caption: 'Vs list price' },
    ],
    sections: [
      {
        title: 'Spending by Category',
        columns: ['Category', 'Orders', 'Spend', 'Budget', 'Variance'],
        empty: { icon: 'BarChart3', title: 'No procurement data to report' },
      },
      {
        title: 'Top Suppliers by Spend',
        columns: ['Supplier', 'Orders', 'Total Spend', 'Avg Lead Time', 'Rating'],
        empty: { icon: 'Building2', title: 'No supplier data yet' },
      },
    ],
  },

  // ── Technician Portal ────────────────────────────────────────────────────
  {
    id: '090',
    route: '/technician-portal-dashboard',
    title: 'Technician Portal Dashboard',
    subtitle: 'Personal work overview and daily schedule',
    icon: 'LayoutDashboard',
    stats: [
      { label: "Today's Jobs", value: 0, caption: 'Scheduled', highlight: true },
      { label: 'Active Jobs', value: 0, caption: 'In progress', tone: 'info' },
      { label: 'Completed Today', value: 0, caption: 'Finished' },
      { label: 'Total Assigned', value: 0, caption: 'All open jobs' },
    ],
    sections: [
      {
        title: "Today's Schedule",
        subtitle: 'Jobs scheduled for today',
        columns: ['Time', 'Vehicle', 'Service', 'Bay', 'Status'],
        empty: { icon: 'Clock', title: 'No jobs scheduled for today' },
      },
      {
        title: 'Active Jobs',
        subtitle: 'Jobs currently in progress or assigned to you',
        columns: ['Job Card', 'Vehicle', 'Service', 'Started', 'Status'],
        empty: { icon: 'AlertCircle', title: 'No active jobs' },
      },
    ],
  },
  {
    id: '091',
    route: '/technician-portal-my-jobs',
    title: 'Technician Portal My Jobs',
    subtitle: 'All jobs assigned to you across all statuses',
    icon: 'Wrench',
    stats: [
      { label: 'Assigned', value: 0, caption: 'Total jobs', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Working on', tone: 'info' },
      { label: 'Paused', value: 0, caption: 'Waiting for parts', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This week' },
    ],
    sections: [
      {
        title: 'My Jobs',
        searchable: true,
        columns: ['Job Card', 'Vehicle', 'Service', 'Priority', 'Due', 'Status'],
        empty: { icon: 'Wrench', title: 'No jobs assigned to you' },
      },
    ],
  },
  {
    id: '092',
    route: '/technician-portal-time-clock',
    title: 'Technician Portal Time Clock',
    subtitle: 'Clock in/out and track labour hours per job',
    icon: 'Clock',
    action: { label: 'Clock In', icon: 'Play' },
    stats: [
      { label: 'Hours Today', value: '0.0', caption: 'Logged', highlight: true },
      { label: 'This Week', value: '0.0', caption: 'Total hours', tone: 'info' },
      { label: 'Billable', value: '0%', caption: 'Of logged hours' },
      { label: 'Overtime', value: '0.0', caption: 'Extra hours', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Time Entries',
        columns: ['Date', 'Job Card', 'Start', 'End', 'Duration', 'Type'],
        empty: { icon: 'Clock', title: 'No time entries recorded' },
      },
    ],
  },
  {
    id: '093',
    route: '/technician-portal-parts',
    title: 'Technician Portal Parts',
    subtitle: 'Request and lookup parts for your jobs',
    icon: 'Package',
    action: { label: 'Request Part', icon: 'Plus' },
    stats: [
      { label: 'My Requests', value: 0, caption: 'Open', highlight: true },
      { label: 'Ready for Pickup', value: 0, caption: 'At store', tone: 'info' },
      { label: 'Backordered', value: 0, caption: 'Waiting on supplier', tone: 'warning' },
      { label: 'Used This Week', value: 0, caption: 'Parts consumed' },
    ],
    sections: [
      {
        title: 'Parts Requests',
        searchable: true,
        columns: ['Part', 'Job Card', 'Quantity', 'Requested', 'Status'],
        empty: { icon: 'Package', title: 'No parts requested' },
      },
    ],
  },
  {
    id: '094',
    route: '/technician-portal-documentation',
    title: 'Technician Portal Documentation',
    subtitle: 'Service manuals, technical bulletins and repair guides',
    icon: 'BookOpen',
    stats: [
      { label: 'Documents', value: 0, caption: 'Available', highlight: true },
      { label: 'Manuals', value: 0, caption: 'Service manuals', tone: 'info' },
      { label: 'Bulletins', value: 0, caption: 'Technical updates', tone: 'info' },
      { label: 'Recently Added', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Documentation Library',
        searchable: true,
        columns: ['Title', 'Type', 'Make/Model', 'Updated', 'Downloads'],
        empty: { icon: 'BookOpen', title: 'No documentation available' },
      },
    ],
  },
  {
    id: '095',
    route: '/technician-portal-profile',
    title: 'Technician Portal Profile',
    subtitle: 'Your profile, certifications and skill matrix',
    icon: 'User',
    stats: [
      { label: 'Certifications', value: 0, caption: 'Active', highlight: true },
      { label: 'Skills', value: 0, caption: 'Listed', tone: 'info' },
      { label: 'Expiring', value: 0, caption: 'Needs renewal', tone: 'warning' },
      { label: 'Experience', value: '0y', caption: 'On platform' },
    ],
    sections: [
      {
        title: 'Certifications',
        columns: ['Certification', 'Issuer', 'Obtained', 'Expires', 'Status'],
        empty: { icon: 'Award', title: 'No certifications recorded' },
      },
    ],
  },
  {
    id: '096',
    route: '/technician-portal-attendance',
    title: 'Technician Portal Attendance',
    subtitle: 'Attendance history and leave records',
    icon: 'CalendarCheck',
    stats: [
      { label: 'Present Days', value: 0, caption: 'This month', highlight: true },
      { label: 'Late Arrivals', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Leave Used', value: 0, caption: 'Days', tone: 'info' },
      { label: 'Leave Balance', value: 0, caption: 'Days remaining' },
    ],
    sections: [
      {
        title: 'Attendance Log',
        columns: ['Date', 'Clock In', 'Clock Out', 'Hours', 'Status'],
        empty: { icon: 'CalendarCheck', title: 'No attendance records' },
      },
    ],
  },
  {
    id: '097',
    route: '/technician-portal-guides',
    title: 'Technician Portal Guides',
    subtitle: 'Step-by-step repair and maintenance guides',
    icon: 'FileText',
    stats: [
      { label: 'Guides', value: 0, caption: 'Available', highlight: true },
      { label: 'By Make', value: 0, caption: 'Vehicle makes covered', tone: 'info' },
      { label: 'Recently Updated', value: 0, caption: 'This month' },
      { label: 'Your Bookmarks', value: 0, caption: 'Saved guides' },
    ],
    sections: [
      {
        title: 'Repair Guides',
        searchable: true,
        columns: ['Guide', 'Make/Model', 'Category', 'Difficulty', 'Updated'],
        empty: { icon: 'FileText', title: 'No guides available' },
      },
    ],
  },
  {
    id: '098',
    route: '/technician-portal-software',
    title: 'Technician Portal Software',
    subtitle: 'Diagnostic software tools and OEM applications',
    icon: 'Monitor',
    stats: [
      { label: 'Tools Available', value: 0, caption: 'Software licenses', highlight: true },
      { label: 'Active Sessions', value: 0, caption: 'In use now', tone: 'info' },
      { label: 'Updates Available', value: 0, caption: 'Needs update', tone: 'warning' },
      { label: 'Expiring Licences', value: 0, caption: 'Within 30 days' },
    ],
    sections: [
      {
        title: 'Software Tools',
        columns: ['Tool', 'Manufacturer', 'Version', 'Licence Expires', 'Status'],
        empty: { icon: 'Monitor', title: 'No software tools configured' },
      },
    ],
  },

  // ── Technician App ───────────────────────────────────────────────────────
  {
    id: '102',
    route: '/technician-mobile',
    title: 'Technician Mobile',
    subtitle: 'Mobile-optimised view for workshop floor technicians',
    icon: 'Smartphone',
    stats: [
      { label: "Today's Jobs", value: 0, caption: 'Assigned', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Working on', tone: 'info' },
      { label: 'Completed', value: 0, caption: 'Today' },
      { label: 'Pending Parts', value: 0, caption: 'Waiting', tone: 'warning' },
    ],
    sections: [
      {
        title: 'My Jobs',
        columns: ['Vehicle', 'Service', 'Bay', 'Priority', 'Status'],
        empty: { icon: 'Wrench', title: 'No jobs assigned' },
      },
    ],
  },
  {
    id: '103',
    route: '/technician-app-home',
    title: 'Technician App Home',
    subtitle: 'Quick access dashboard for technician mobile app',
    icon: 'Home',
    stats: [
      { label: 'Active Jobs', value: 0, caption: 'Right now', highlight: true },
      { label: 'Hours Logged', value: '0.0', caption: 'Today', tone: 'info' },
      { label: 'Parts Pending', value: 0, caption: 'For your jobs', tone: 'warning' },
      { label: 'Messages', value: 0, caption: 'Unread' },
    ],
    sections: [
      {
        title: 'Quick Access',
        columns: ['Action', 'Details', 'Status'],
        empty: { icon: 'Home', title: 'No pending actions' },
      },
    ],
  },
  {
    id: '104',
    route: '/technician-app-jobs',
    title: 'Technician App Jobs',
    subtitle: 'Job list with quick status updates from mobile',
    icon: 'Clipboard',
    stats: [
      { label: 'My Jobs', value: 0, caption: 'Total assigned', highlight: true },
      { label: 'Due Today', value: 0, caption: 'Complete by end of day', tone: 'warning' },
      { label: 'On Hold', value: 0, caption: 'Blocked', tone: 'warning' },
      { label: 'Avg Time', value: '0h', caption: 'Per job' },
    ],
    sections: [
      {
        title: 'Job List',
        searchable: true,
        columns: ['Vehicle', 'Service', 'Priority', 'Due', 'Status'],
        empty: { icon: 'Clipboard', title: 'No jobs in your queue' },
      },
    ],
  },
  {
    id: '105',
    route: '/technician-app-clock',
    title: 'Technician App Clock',
    subtitle: 'Simple clock in/out and labour time tracking',
    icon: 'Timer',
    action: { label: 'Clock In', icon: 'Play' },
    stats: [
      { label: 'Status', value: 'Off', caption: 'Not clocked in', highlight: true },
      { label: 'Today', value: '0.0h', caption: 'Hours worked', tone: 'info' },
      { label: 'This Week', value: '0.0h', caption: 'Total hours' },
      { label: 'Break Time', value: '0m', caption: 'Taken today' },
    ],
    sections: [
      {
        title: "Today's Log",
        columns: ['Event', 'Time', 'Job Card', 'Duration'],
        empty: { icon: 'Timer', title: 'No clock events today' },
      },
    ],
  },
  {
    id: '106',
    route: '/technician-app-lookup',
    title: 'Technician App Lookup',
    subtitle: 'Quick part and vehicle information lookup',
    icon: 'Search',
    stats: [
      { label: 'Lookups Today', value: 0, caption: 'Searches', highlight: true },
      { label: 'Parts Found', value: 0, caption: 'In stock', tone: 'info' },
      { label: 'Not Found', value: 0, caption: 'Unavailable', tone: 'warning' },
      { label: 'Ordered from Lookup', value: 0, caption: 'Triggered orders' },
    ],
    sections: [
      {
        title: 'Recent Lookups',
        columns: ['Query', 'Type', 'Result', 'When'],
        empty: { icon: 'Search', title: 'No recent lookups' },
      },
    ],
  },
  {
    id: '107',
    route: '/technician-app-profile',
    title: 'Technician App Profile',
    subtitle: 'Personal profile and preferences from mobile',
    icon: 'User',
    stats: [
      { label: 'Jobs Completed', value: 0, caption: 'All time', highlight: true },
      { label: 'Rating', value: '0.0', caption: 'Average', tone: 'info' },
      { label: 'Certifications', value: 0, caption: 'Active' },
      { label: 'Efficiency', value: '0%', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Recent Activity',
        columns: ['Job Card', 'Vehicle', 'Service', 'Hours', 'Date'],
        empty: { icon: 'User', title: 'No activity to show' },
      },
    ],
  },

  // ── Client Portal ────────────────────────────────────────────────────────
  {
    id: '108',
    route: '/client-portal-dashboard',
    title: 'Client Portal Dashboard',
    subtitle: 'Overview of your vehicles and service activities',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Upcoming Services', value: 0, caption: 'Scheduled', tone: 'info' },
      { label: 'Active Reminders', value: 0, caption: 'Maintenance alerts' },
      { label: 'Pending Payments', value: 0, caption: 'Awaiting payment', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Upcoming Services',
        subtitle: 'Your scheduled appointments',
        columns: ['Vehicle', 'Service', 'Date', 'Status'],
        empty: { icon: 'Calendar', title: 'No upcoming services', description: 'Book your first appointment.' },
      },
      {
        title: 'Recent Invoices',
        subtitle: 'Your latest service invoices',
        columns: ['Invoice', 'Vehicle', 'Amount', 'Date', 'Status'],
        empty: { icon: 'FileText', title: 'No invoices yet' },
      },
    ],
  },
  {
    id: '109',
    route: '/client-portal-vehicles',
    title: 'Client Portal Vehicles',
    subtitle: 'Your registered vehicles and their details',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'In Service', value: 0, caption: 'Currently at workshop', tone: 'info' },
      { label: 'Due Service', value: 0, caption: 'Maintenance due', tone: 'warning' },
      { label: 'Insurance Expiring', value: 0, caption: 'Within 30 days' },
    ],
    sections: [
      {
        title: 'My Vehicles',
        columns: ['Vehicle', 'Plate', 'Year', 'Last Service', 'Next Service'],
        empty: { icon: 'Car', title: 'No vehicles registered', description: 'Add your first vehicle to get started.' },
      },
    ],
  },
  {
    id: '110',
    route: '/client-portal-appointments',
    title: 'Client Portal Appointments',
    subtitle: 'Book and manage your service appointments',
    icon: 'CalendarDays',
    action: { label: 'Book Service', icon: 'Plus' },
    stats: [
      { label: 'Upcoming', value: 0, caption: 'Booked', highlight: true },
      { label: 'Confirmed', value: 0, caption: 'By garage', tone: 'info' },
      { label: 'Pending', value: 0, caption: 'Awaiting confirmation', tone: 'warning' },
      { label: 'Past Visits', value: 0, caption: 'Completed' },
    ],
    sections: [
      {
        title: 'Appointments',
        columns: ['Date', 'Time', 'Vehicle', 'Service', 'Branch', 'Status'],
        empty: { icon: 'CalendarDays', title: 'No appointments', description: 'Book a service for your vehicle.' },
      },
    ],
  },
  {
    id: '111',
    route: '/client-portal-invoices',
    title: 'Client Portal Invoices',
    subtitle: 'View and pay your service invoices',
    icon: 'Receipt',
    stats: [
      { label: 'Total Invoices', value: 0, caption: 'All time', highlight: true },
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'Unpaid', tone: 'warning' },
      { label: 'Paid', value: 'SAR 0.00', caption: 'This year', tone: 'info' },
      { label: 'Last Payment', value: '—', caption: 'Date' },
    ],
    sections: [
      {
        title: 'Invoices',
        searchable: true,
        columns: ['Invoice', 'Vehicle', 'Date', 'Amount', 'Status'],
        empty: { icon: 'Receipt', title: 'No invoices' },
      },
    ],
  },
  {
    id: '112',
    route: '/client-portal-profile',
    title: 'Client Portal Profile',
    subtitle: 'Your account details and preferences',
    icon: 'User',
    stats: [
      { label: 'Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Total Visits', value: 0, caption: 'All time', tone: 'info' },
      { label: 'Loyalty Points', value: 0, caption: 'Available' },
      { label: 'Member Since', value: '—', caption: 'Join date' },
    ],
    sections: [
      {
        title: 'Account Information',
        columns: ['Field', 'Value'],
        empty: { icon: 'User', title: 'Profile not complete' },
      },
    ],
  },
  {
    id: '113',
    route: '/client-portal-service-history',
    title: 'Client Portal Service History',
    subtitle: 'Complete service history for all your vehicles',
    icon: 'History',
    stats: [
      { label: 'Total Services', value: 0, caption: 'Completed', highlight: true },
      { label: 'This Year', value: 0, caption: 'Services', tone: 'info' },
      { label: 'Total Spent', value: 'SAR 0.00', caption: 'All time' },
      { label: 'Avg Visit Cost', value: 'SAR 0.00', caption: 'Per service' },
    ],
    sections: [
      {
        title: 'Service Records',
        searchable: true,
        columns: ['Date', 'Vehicle', 'Service', 'Technician', 'Cost'],
        empty: { icon: 'History', title: 'No service history yet' },
      },
    ],
  },
  {
    id: '114',
    route: '/client-portal-live-tracking',
    title: 'Client Portal Live Tracking',
    subtitle: 'Track your vehicle service in real time',
    icon: 'Radio',
    stats: [
      { label: 'Active Services', value: 0, caption: 'In progress', highlight: true },
      { label: 'Current Stage', value: '—', caption: 'Service step', tone: 'info' },
      { label: 'Estimated Ready', value: '—', caption: 'Completion time' },
      { label: 'Updates', value: 0, caption: 'Today' },
    ],
    sections: [
      {
        title: 'Live Status',
        columns: ['Vehicle', 'Service', 'Stage', 'Started', 'Est. Complete'],
        empty: { icon: 'Radio', title: 'No vehicles currently in service' },
      },
    ],
  },
  {
    id: '115',
    route: '/client-portal-reminders',
    title: 'Client Portal Reminders',
    subtitle: 'Service reminders and maintenance alerts',
    icon: 'Bell',
    stats: [
      { label: 'Active Reminders', value: 0, caption: 'Set up', highlight: true },
      { label: 'Due Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Overdue', value: 0, caption: 'Past due date', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'Actioned' },
    ],
    sections: [
      {
        title: 'Reminders',
        columns: ['Vehicle', 'Service', 'Due Date', 'Priority', 'Status'],
        empty: { icon: 'Bell', title: 'No active reminders', description: 'Set up a reminder for your next service.' },
      },
    ],
  },
  {
    id: '116',
    route: '/client-portal-review-chat',
    title: 'Client Portal Review & Chat',
    subtitle: 'Leave reviews and chat with your service advisor',
    icon: 'MessageSquare',
    stats: [
      { label: 'My Reviews', value: 0, caption: 'Submitted', highlight: true },
      { label: 'Open Chats', value: 0, caption: 'Active conversations', tone: 'info' },
      { label: 'Unread Messages', value: 0, caption: 'New', tone: 'warning' },
      { label: 'Avg Response', value: '—', caption: 'From garage' },
    ],
    sections: [
      {
        title: 'Recent Conversations',
        columns: ['Subject', 'With', 'Last Message', 'Status'],
        empty: { icon: 'MessageSquare', title: 'No conversations yet' },
      },
    ],
  },

  // ── Customer App extras ──────────────────────────────────────────────────
  {
    id: '118',
    route: '/customer-app-booking',
    title: 'Customer App Booking',
    subtitle: 'Book a service appointment from the mobile app',
    icon: 'CalendarPlus',
    stats: [
      { label: 'Available Slots', value: 0, caption: 'This week', highlight: true },
      { label: 'My Bookings', value: 0, caption: 'Upcoming', tone: 'info' },
      { label: 'Nearest Branch', value: '—', caption: 'Distance' },
      { label: 'Est. Wait', value: '—', caption: 'At nearest branch' },
    ],
    sections: [
      {
        title: 'Your Bookings',
        columns: ['Date', 'Vehicle', 'Service', 'Branch', 'Status'],
        empty: { icon: 'CalendarPlus', title: 'No bookings yet', description: 'Book your first service appointment.' },
      },
    ],
  },
  {
    id: '119',
    route: '/customer-app-vehicles',
    title: 'Customer App Vehicles',
    subtitle: 'Manage your vehicles from the mobile app',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'My Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'Active Service', value: 0, caption: 'In workshop', tone: 'info' },
      { label: 'Service Due', value: 0, caption: 'Maintenance needed', tone: 'warning' },
      { label: 'Total Services', value: 0, caption: 'All time' },
    ],
    sections: [
      {
        title: 'My Vehicles',
        columns: ['Vehicle', 'Plate', 'Year', 'Status', 'Next Service'],
        empty: { icon: 'Car', title: 'No vehicles added', description: 'Add your vehicle to start booking services.' },
      },
    ],
  },
  {
    id: '120',
    route: '/customer-app-payments',
    title: 'Customer App Payments',
    subtitle: 'Pay invoices and manage payment methods',
    icon: 'CreditCard',
    stats: [
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'Amount due', highlight: true },
      { label: 'Paid This Year', value: 'SAR 0.00', caption: 'Total', tone: 'info' },
      { label: 'Payment Methods', value: 0, caption: 'Saved cards' },
      { label: 'Last Payment', value: '—', caption: 'Date' },
    ],
    sections: [
      {
        title: 'Payment History',
        searchable: true,
        columns: ['Date', 'Invoice', 'Amount', 'Method', 'Status'],
        empty: { icon: 'CreditCard', title: 'No payment history' },
      },
    ],
  },

  // ── Portal (generic) ────────────────────────────────────────────────────
  {
    id: '122',
    route: '/portal-dashboard',
    title: 'Portal Dashboard',
    subtitle: 'Unified portal overview for external users',
    icon: 'LayoutDashboard',
    stats: [
      { label: 'Active Services', value: 0, caption: 'In progress', highlight: true },
      { label: 'Upcoming', value: 0, caption: 'Scheduled', tone: 'info' },
      { label: 'Pending Actions', value: 0, caption: 'Needs attention', tone: 'warning' },
      { label: 'Messages', value: 0, caption: 'Unread' },
    ],
    sections: [
      {
        title: 'Recent Activity',
        columns: ['Date', 'Type', 'Details', 'Status'],
        empty: { icon: 'LayoutDashboard', title: 'No activity yet' },
      },
    ],
  },
  {
    id: '123',
    route: '/portal-appointments',
    title: 'Portal Appointments',
    subtitle: 'Manage service appointments through the portal',
    icon: 'CalendarDays',
    action: { label: 'Book Appointment', icon: 'Plus' },
    stats: [
      { label: 'Upcoming', value: 0, caption: 'Booked', highlight: true },
      { label: 'Confirmed', value: 0, caption: 'By garage', tone: 'info' },
      { label: 'Pending', value: 0, caption: 'Awaiting confirmation', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'Past visits' },
    ],
    sections: [
      {
        title: 'Appointments',
        columns: ['Date', 'Time', 'Vehicle', 'Service', 'Status'],
        empty: { icon: 'CalendarDays', title: 'No appointments' },
      },
    ],
  },
  {
    id: '124',
    route: '/portal-invoices',
    title: 'Portal Invoices',
    subtitle: 'View and pay invoices through the portal',
    icon: 'Receipt',
    stats: [
      { label: 'Total Invoices', value: 0, caption: 'All time', highlight: true },
      { label: 'Outstanding', value: 'SAR 0.00', caption: 'Unpaid', tone: 'warning' },
      { label: 'Paid', value: 'SAR 0.00', caption: 'This year', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past due' },
    ],
    sections: [
      {
        title: 'Invoices',
        searchable: true,
        columns: ['Invoice', 'Date', 'Amount', 'Due Date', 'Status'],
        empty: { icon: 'Receipt', title: 'No invoices' },
      },
    ],
  },
  {
    id: '125',
    route: '/portal-vehicles',
    title: 'Portal Vehicles',
    subtitle: 'Registered vehicles visible through the portal',
    icon: 'Car',
    action: { label: 'Add Vehicle', icon: 'Plus' },
    stats: [
      { label: 'Vehicles', value: 0, caption: 'Registered', highlight: true },
      { label: 'In Service', value: 0, caption: 'At workshop', tone: 'info' },
      { label: 'Service Due', value: 0, caption: 'Maintenance needed', tone: 'warning' },
      { label: 'Total Services', value: 0, caption: 'All time' },
    ],
    sections: [
      {
        title: 'My Vehicles',
        columns: ['Vehicle', 'Plate', 'Year', 'Last Service', 'Status'],
        empty: { icon: 'Car', title: 'No vehicles registered' },
      },
    ],
  },
  {
    id: '126',
    route: '/portal-communications',
    title: 'Portal Communications',
    subtitle: 'Messages and notifications through the portal',
    icon: 'MessageCircle',
    stats: [
      { label: 'Unread', value: 0, caption: 'Messages', highlight: true },
      { label: 'Conversations', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Notifications', value: 0, caption: 'This week' },
      { label: 'Avg Response', value: '—', caption: 'From garage' },
    ],
    sections: [
      {
        title: 'Messages',
        columns: ['From', 'Subject', 'Date', 'Status'],
        empty: { icon: 'MessageCircle', title: 'No messages' },
      },
    ],
  },

  // ── Business intelligence ────────────────────────────────────────────────
  {
    id: '129',
    route: '/business-intelligence',
    title: 'Business Intelligence',
    subtitle: 'Data-driven insights for strategic decision making',
    icon: 'Brain',
    stats: [
      { label: 'Revenue', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Growth', value: '0%', caption: 'Month-over-month', tone: 'info' },
      { label: 'Active Customers', value: 0, caption: 'This quarter' },
      { label: 'Avg Ticket', value: 'SAR 0.00', caption: 'Per job' },
    ],
    sections: [
      {
        title: 'Key Metrics',
        columns: ['Metric', 'Current', 'Previous', 'Change', 'Trend'],
        empty: { icon: 'Brain', title: 'Not enough data for insights yet' },
      },
    ],
  },
  {
    id: '130',
    route: '/business-intelligence-dashboard',
    title: 'Business Intelligence Dashboard',
    subtitle: 'Executive-level analytics and KPI tracking',
    icon: 'BarChart3',
    stats: [
      { label: 'Revenue', value: 'SAR 0.00', caption: 'MTD', highlight: true },
      { label: 'Jobs', value: 0, caption: 'Completed MTD', tone: 'info' },
      { label: 'Margin', value: '0%', caption: 'Gross profit' },
      { label: 'NPS', value: 0, caption: 'Net promoter score' },
    ],
    sections: [
      {
        title: 'Performance Overview',
        columns: ['KPI', 'Target', 'Actual', 'Variance'],
        empty: { icon: 'BarChart3', title: 'No performance data available' },
      },
    ],
  },
  {
    id: '131',
    route: '/business-heatmaps',
    title: 'Business Heatmaps',
    subtitle: 'Visual heatmaps of revenue, traffic and service demand',
    icon: 'Flame',
    stats: [
      { label: 'Peak Hour', value: '—', caption: 'Busiest time', highlight: true },
      { label: 'Peak Day', value: '—', caption: 'Busiest day', tone: 'info' },
      { label: 'Quietest Hour', value: '—', caption: 'Lowest traffic' },
      { label: 'Data Points', value: 0, caption: 'Analysed' },
    ],
    sections: [
      {
        title: 'Demand by Time',
        columns: ['Time Slot', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        empty: { icon: 'Flame', title: 'Not enough data for heatmaps yet' },
      },
    ],
  },
  {
    id: '132',
    route: '/profit-analysis',
    title: 'Profit Analysis',
    subtitle: 'Revenue, cost and margin analysis across services',
    icon: 'PieChart',
    stats: [
      { label: 'Gross Profit', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Margin', value: '0%', caption: 'Average', tone: 'info' },
      { label: 'Highest Margin', value: '—', caption: 'Service type' },
      { label: 'Lowest Margin', value: '—', caption: 'Needs review', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Profit by Service',
        columns: ['Service', 'Revenue', 'Cost', 'Profit', 'Margin'],
        empty: { icon: 'PieChart', title: 'No profit data available' },
      },
    ],
  },
  {
    id: '133',
    route: '/kpi-dashboard',
    title: 'KPI Dashboard',
    subtitle: 'Key performance indicators at a glance',
    icon: 'Target',
    stats: [
      { label: 'On Target', value: 0, caption: 'KPIs met', highlight: true },
      { label: 'At Risk', value: 0, caption: 'Below target', tone: 'warning' },
      { label: 'Critical', value: 0, caption: 'Far below', tone: 'warning' },
      { label: 'Not Tracked', value: 0, caption: 'No data yet' },
    ],
    sections: [
      {
        title: 'KPI Summary',
        columns: ['KPI', 'Target', 'Actual', 'Status', 'Trend'],
        empty: { icon: 'Target', title: 'No KPIs configured yet' },
      },
    ],
  },
  {
    id: '134',
    route: '/productivity-tracker',
    title: 'Productivity Tracker',
    subtitle: 'Team and individual productivity metrics',
    icon: 'Gauge',
    stats: [
      { label: 'Team Efficiency', value: '0%', caption: 'This month', highlight: true },
      { label: 'Jobs/Tech/Day', value: 0, caption: 'Average', tone: 'info' },
      { label: 'Idle Time', value: '0%', caption: 'Non-billable', tone: 'warning' },
      { label: 'Utilisation', value: '0%', caption: 'Billable hours' },
    ],
    sections: [
      {
        title: 'Productivity by Team Member',
        searchable: true,
        columns: ['Employee', 'Role', 'Jobs', 'Hours', 'Efficiency', 'Trend'],
        empty: { icon: 'Gauge', title: 'No productivity data yet' },
      },
    ],
  },

  // ── HR & staff management ───────────────────────────────────────────────
  {
    id: '135',
    route: '/hr-management',
    title: 'HR Management',
    subtitle: 'Human resources administration and employee management',
    icon: 'Users',
    stats: [
      { label: 'Total Staff', value: 0, caption: 'Active employees', highlight: true },
      { label: 'On Leave', value: 0, caption: 'Today', tone: 'info' },
      { label: 'Open Positions', value: 0, caption: 'Hiring', tone: 'warning' },
      { label: 'Avg Tenure', value: '0y', caption: 'Years' },
    ],
    sections: [
      {
        title: 'Employees',
        searchable: true,
        columns: ['Name', 'Role', 'Department', 'Joined', 'Status'],
        empty: { icon: 'Users', title: 'No employees registered' },
      },
    ],
  },
  {
    id: '136',
    route: '/staff-directory',
    title: 'Staff Directory',
    subtitle: 'Employee contact directory and organisational chart',
    icon: 'Contact',
    stats: [
      { label: 'Employees', value: 0, caption: 'In directory', highlight: true },
      { label: 'Departments', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Branches', value: 0, caption: 'Locations' },
      { label: 'New Hires', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'Directory',
        searchable: true,
        columns: ['Name', 'Role', 'Department', 'Phone', 'Email'],
        empty: { icon: 'Contact', title: 'No staff in directory' },
      },
    ],
  },
  {
    id: '137',
    route: '/staff-scheduling',
    title: 'Staff Scheduling',
    subtitle: 'Shift planning and staff rotation schedules',
    icon: 'CalendarClock',
    action: { label: 'Create Schedule', icon: 'Plus' },
    stats: [
      { label: 'Scheduled', value: 0, caption: 'This week', highlight: true },
      { label: 'Unassigned Shifts', value: 0, caption: 'Needs coverage', tone: 'warning' },
      { label: 'Overtime', value: 0, caption: 'Hours projected', tone: 'warning' },
      { label: 'Time Off', value: 0, caption: 'Approved this week' },
    ],
    sections: [
      {
        title: 'Weekly Schedule',
        columns: ['Employee', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        empty: { icon: 'CalendarClock', title: 'No schedules created yet' },
      },
    ],
  },
  {
    id: '138',
    route: '/staff-performance-review',
    title: 'Staff Performance Review',
    subtitle: 'Performance evaluations and review cycles',
    icon: 'ClipboardCheck',
    action: { label: 'Start Review', icon: 'Plus' },
    stats: [
      { label: 'Reviews Due', value: 0, caption: 'This quarter', highlight: true },
      { label: 'Completed', value: 0, caption: 'This cycle', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past deadline', tone: 'warning' },
      { label: 'Avg Score', value: '0.0', caption: 'Out of 5' },
    ],
    sections: [
      {
        title: 'Review Cycles',
        columns: ['Employee', 'Reviewer', 'Period', 'Score', 'Status'],
        empty: { icon: 'ClipboardCheck', title: 'No performance reviews scheduled' },
      },
    ],
  },
  {
    id: '139',
    route: '/timesheet-management',
    title: 'Timesheet Management',
    subtitle: 'Employee timesheet submissions and approvals',
    icon: 'Clock',
    stats: [
      { label: 'Pending Approval', value: 0, caption: 'Timesheets', highlight: true },
      { label: 'Submitted', value: 0, caption: 'This period', tone: 'info' },
      { label: 'Rejected', value: 0, caption: 'Needs revision', tone: 'warning' },
      { label: 'Total Hours', value: 0, caption: 'This period' },
    ],
    sections: [
      {
        title: 'Timesheets',
        searchable: true,
        columns: ['Employee', 'Period', 'Hours', 'Submitted', 'Status'],
        empty: { icon: 'Clock', title: 'No timesheets submitted' },
      },
    ],
  },
  {
    id: '140',
    route: '/timeclock-payroll',
    title: 'Timeclock Payroll',
    subtitle: 'Time clock data integrated with payroll processing',
    icon: 'Timer',
    stats: [
      { label: 'Clocked In', value: 0, caption: 'Right now', highlight: true },
      { label: 'Total Hours', value: 0, caption: 'This pay period', tone: 'info' },
      { label: 'Overtime', value: 0, caption: 'Hours', tone: 'warning' },
      { label: 'Exceptions', value: 0, caption: 'Missed punches' },
    ],
    sections: [
      {
        title: 'Payroll Hours',
        searchable: true,
        columns: ['Employee', 'Regular', 'Overtime', 'Total', 'Status'],
        empty: { icon: 'Timer', title: 'No timeclock data for this period' },
      },
    ],
  },
  {
    id: '141',
    route: '/payroll-management',
    title: 'Payroll Management',
    subtitle: 'Salary processing, deductions and payslips',
    icon: 'Wallet',
    action: { label: 'Run Payroll', icon: 'Play' },
    stats: [
      { label: 'Payroll Total', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Employees', value: 0, caption: 'On payroll', tone: 'info' },
      { label: 'Pending', value: 0, caption: 'Awaiting approval', tone: 'warning' },
      { label: 'Last Run', value: '—', caption: 'Date' },
    ],
    sections: [
      {
        title: 'Payroll Register',
        searchable: true,
        columns: ['Employee', 'Base Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'],
        empty: { icon: 'Wallet', title: 'No payroll data' },
      },
    ],
  },
  {
    id: '142',
    route: '/leave-requests',
    title: 'Leave Requests',
    subtitle: 'Employee leave applications and approval workflow',
    icon: 'CalendarOff',
    action: { label: 'New Request', icon: 'Plus' },
    stats: [
      { label: 'Pending', value: 0, caption: 'Awaiting approval', highlight: true },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'On Leave Today', value: 0, caption: 'Employees' },
      { label: 'Rejected', value: 0, caption: 'This month', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Leave Requests',
        searchable: true,
        columns: ['Employee', 'Type', 'From', 'To', 'Days', 'Status'],
        empty: { icon: 'CalendarOff', title: 'No leave requests' },
      },
    ],
  },
  {
    id: '143',
    route: '/training-lms',
    title: 'Training LMS',
    subtitle: 'Learning management system for staff training',
    icon: 'GraduationCap',
    action: { label: 'New Course', icon: 'Plus' },
    stats: [
      { label: 'Courses', value: 0, caption: 'Available', highlight: true },
      { label: 'Enrolled', value: 0, caption: 'Active learners', tone: 'info' },
      { label: 'Completed', value: 0, caption: 'This month' },
      { label: 'Overdue', value: 0, caption: 'Past deadline', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Training Courses',
        searchable: true,
        columns: ['Course', 'Category', 'Duration', 'Enrolled', 'Completion Rate'],
        empty: { icon: 'GraduationCap', title: 'No training courses configured' },
      },
    ],
  },
  {
    id: '144',
    route: '/wearable-integration',
    title: 'Wearable Integration',
    subtitle: 'Smart wearable devices for workshop safety and productivity',
    icon: 'Watch',
    stats: [
      { label: 'Devices', value: 0, caption: 'Connected', highlight: true },
      { label: 'Active Users', value: 0, caption: 'Wearing now', tone: 'info' },
      { label: 'Safety Alerts', value: 0, caption: 'Today', tone: 'warning' },
      { label: 'Battery Low', value: 0, caption: 'Needs charging' },
    ],
    sections: [
      {
        title: 'Connected Devices',
        columns: ['Device', 'User', 'Type', 'Battery', 'Last Sync', 'Status'],
        empty: { icon: 'Watch', title: 'No wearable devices connected' },
      },
    ],
  },

  // ── Accounting & finance ─────────────────────────────────────────────────
  {
    id: '146',
    route: '/general-ledger',
    title: 'General Ledger',
    subtitle: 'Complete record of all financial transactions',
    icon: 'BookOpen',
    stats: [
      { label: 'Entries', value: 0, caption: 'This period', highlight: true },
      { label: 'Debits', value: 'SAR 0.00', caption: 'Total', tone: 'info' },
      { label: 'Credits', value: 'SAR 0.00', caption: 'Total', tone: 'info' },
      { label: 'Unposted', value: 0, caption: 'Draft entries', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Ledger Entries',
        searchable: true,
        columns: ['Date', 'Reference', 'Account', 'Debit', 'Credit', 'Balance'],
        empty: { icon: 'BookOpen', title: 'No ledger entries' },
      },
    ],
  },
  {
    id: '148',
    route: '/trial-balance',
    title: 'Trial Balance',
    subtitle: 'Summary of all account balances for reconciliation',
    icon: 'Scale',
    stats: [
      { label: 'Total Debits', value: 'SAR 0.00', caption: 'All accounts', highlight: true },
      { label: 'Total Credits', value: 'SAR 0.00', caption: 'All accounts', tone: 'info' },
      { label: 'Difference', value: 'SAR 0.00', caption: 'Should be zero' },
      { label: 'Accounts', value: 0, caption: 'With balances' },
    ],
    sections: [
      {
        title: 'Account Balances',
        searchable: true,
        columns: ['Account', 'Code', 'Debit', 'Credit'],
        empty: { icon: 'Scale', title: 'No account balances to show' },
      },
    ],
  },
  {
    id: '149',
    route: '/balance-sheet',
    title: 'Balance Sheet',
    subtitle: 'Assets, liabilities and equity at a point in time',
    icon: 'FileSpreadsheet',
    stats: [
      { label: 'Total Assets', value: 'SAR 0.00', caption: 'Current', highlight: true },
      { label: 'Total Liabilities', value: 'SAR 0.00', caption: 'Current', tone: 'warning' },
      { label: 'Equity', value: 'SAR 0.00', caption: 'Net worth', tone: 'info' },
      { label: 'As Of', value: '—', caption: 'Report date' },
    ],
    sections: [
      {
        title: 'Balance Sheet',
        columns: ['Category', 'Account', 'Amount'],
        empty: { icon: 'FileSpreadsheet', title: 'No balance sheet data' },
      },
    ],
  },
  {
    id: '150',
    route: '/income-statement',
    title: 'Income Statement',
    subtitle: 'Revenue, expenses and net income for a period',
    icon: 'TrendingUp',
    stats: [
      { label: 'Revenue', value: 'SAR 0.00', caption: 'This period', highlight: true },
      { label: 'Expenses', value: 'SAR 0.00', caption: 'This period', tone: 'warning' },
      { label: 'Net Income', value: 'SAR 0.00', caption: 'Profit/Loss', tone: 'info' },
      { label: 'Margin', value: '0%', caption: 'Net margin' },
    ],
    sections: [
      {
        title: 'Income Statement',
        columns: ['Category', 'Item', 'Amount'],
        empty: { icon: 'TrendingUp', title: 'No income data for this period' },
      },
    ],
  },
  {
    id: '151',
    route: '/cash-flow-statement',
    title: 'Cash Flow Statement',
    subtitle: 'Cash inflows and outflows by activity type',
    icon: 'ArrowDownUp',
    stats: [
      { label: 'Operating', value: 'SAR 0.00', caption: 'Cash flow', highlight: true },
      { label: 'Investing', value: 'SAR 0.00', caption: 'Cash flow', tone: 'info' },
      { label: 'Financing', value: 'SAR 0.00', caption: 'Cash flow' },
      { label: 'Net Change', value: 'SAR 0.00', caption: 'Total' },
    ],
    sections: [
      {
        title: 'Cash Flow Details',
        columns: ['Activity', 'Category', 'Inflow', 'Outflow', 'Net'],
        empty: { icon: 'ArrowDownUp', title: 'No cash flow data' },
      },
    ],
  },
  {
    id: '152',
    route: '/accounts-receivable',
    title: 'Accounts Receivable',
    subtitle: 'Outstanding customer balances and collections',
    icon: 'HandCoins',
    stats: [
      { label: 'Total Receivable', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Current', value: 'SAR 0.00', caption: 'Within terms', tone: 'info' },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past due', tone: 'warning' },
      { label: 'Collected', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Receivables',
        searchable: true,
        columns: ['Customer', 'Invoice', 'Amount', 'Due Date', 'Age', 'Status'],
        empty: { icon: 'HandCoins', title: 'No outstanding receivables' },
      },
    ],
  },
  {
    id: '153',
    route: '/accounts-payable',
    title: 'Accounts Payable',
    subtitle: 'Outstanding supplier balances and payment scheduling',
    icon: 'CreditCard',
    stats: [
      { label: 'Total Payable', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Due This Week', value: 'SAR 0.00', caption: 'Upcoming', tone: 'warning' },
      { label: 'Paid', value: 'SAR 0.00', caption: 'This month', tone: 'info' },
      { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms' },
    ],
    sections: [
      {
        title: 'Payables',
        searchable: true,
        columns: ['Supplier', 'Invoice', 'Amount', 'Due Date', 'Age', 'Status'],
        empty: { icon: 'CreditCard', title: 'No outstanding payables' },
      },
    ],
  },
  {
    id: '154',
    route: '/bank-account-management',
    title: 'Bank Account Management',
    subtitle: 'Manage bank accounts and view balances',
    icon: 'Landmark',
    action: { label: 'Add Account', icon: 'Plus' },
    stats: [
      { label: 'Total Balance', value: 'SAR 0.00', caption: 'All accounts', highlight: true },
      { label: 'Accounts', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Unreconciled', value: 0, caption: 'Transactions', tone: 'warning' },
      { label: 'Last Sync', value: '—', caption: 'Bank feed' },
    ],
    sections: [
      {
        title: 'Bank Accounts',
        columns: ['Bank', 'Account', 'Currency', 'Balance', 'Last Transaction'],
        empty: { icon: 'Landmark', title: 'No bank accounts configured' },
      },
    ],
  },
  {
    id: '155',
    route: '/budget-management',
    title: 'Budget Management',
    subtitle: 'Budget planning, tracking and variance analysis',
    icon: 'PiggyBank',
    action: { label: 'New Budget', icon: 'Plus' },
    stats: [
      { label: 'Budgets', value: 0, caption: 'Active', highlight: true },
      { label: 'Spent', value: 'SAR 0.00', caption: 'Of allocated', tone: 'info' },
      { label: 'Over Budget', value: 0, caption: 'Categories', tone: 'warning' },
      { label: 'Remaining', value: 'SAR 0.00', caption: 'Available' },
    ],
    sections: [
      {
        title: 'Budget Summary',
        searchable: true,
        columns: ['Category', 'Budget', 'Actual', 'Variance', 'Status'],
        empty: { icon: 'PiggyBank', title: 'No budgets configured' },
      },
    ],
  },
  {
    id: '156',
    route: '/capital-management',
    title: 'Capital Management',
    subtitle: 'Capital investments and asset allocation',
    icon: 'TrendingUp',
    stats: [
      { label: 'Total Capital', value: 'SAR 0.00', caption: 'Invested', highlight: true },
      { label: 'Active Projects', value: 0, caption: 'Capital projects', tone: 'info' },
      { label: 'ROI', value: '0%', caption: 'Average return' },
      { label: 'Pending Approval', value: 0, caption: 'CapEx requests', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Capital Projects',
        columns: ['Project', 'Budget', 'Spent', 'ROI', 'Status'],
        empty: { icon: 'TrendingUp', title: 'No capital projects' },
      },
    ],
  },
  {
    id: '157',
    route: '/assets-management',
    title: 'Assets Management',
    subtitle: 'Fixed and current asset tracking with depreciation',
    icon: 'Box',
    action: { label: 'Add Asset', icon: 'Plus' },
    stats: [
      { label: 'Total Assets', value: 'SAR 0.00', caption: 'Book value', highlight: true },
      { label: 'Fixed Assets', value: 0, caption: 'Items', tone: 'info' },
      { label: 'Depreciation', value: 'SAR 0.00', caption: 'This year' },
      { label: 'Disposed', value: 0, caption: 'This year', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Asset Register',
        searchable: true,
        columns: ['Asset', 'Category', 'Purchase Value', 'Book Value', 'Status'],
        empty: { icon: 'Box', title: 'No assets registered' },
      },
    ],
  },
  {
    id: '158',
    route: '/liabilities-management',
    title: 'Liabilities Management',
    subtitle: 'Track loans, credit lines and other obligations',
    icon: 'AlertTriangle',
    stats: [
      { label: 'Total Liabilities', value: 'SAR 0.00', caption: 'Outstanding', highlight: true },
      { label: 'Current', value: 'SAR 0.00', caption: 'Due within 1 year', tone: 'warning' },
      { label: 'Long-Term', value: 'SAR 0.00', caption: 'Due after 1 year', tone: 'info' },
      { label: 'Next Payment', value: '—', caption: 'Upcoming' },
    ],
    sections: [
      {
        title: 'Liabilities',
        columns: ['Type', 'Creditor', 'Amount', 'Due Date', 'Status'],
        empty: { icon: 'AlertTriangle', title: 'No liabilities recorded' },
      },
    ],
  },
  {
    id: '159',
    route: '/equity-management',
    title: 'Equity Management',
    subtitle: 'Owner equity, capital contributions and withdrawals',
    icon: 'Coins',
    stats: [
      { label: 'Total Equity', value: 'SAR 0.00', caption: 'Net worth', highlight: true },
      { label: 'Contributions', value: 'SAR 0.00', caption: 'This year', tone: 'info' },
      { label: 'Withdrawals', value: 'SAR 0.00', caption: 'This year' },
      { label: 'Partners', value: 0, caption: 'Active' },
    ],
    sections: [
      {
        title: 'Equity Transactions',
        columns: ['Date', 'Partner', 'Type', 'Amount', 'Notes'],
        empty: { icon: 'Coins', title: 'No equity transactions' },
      },
    ],
  },
  {
    id: '160',
    route: '/retained-earnings',
    title: 'Retained Earnings',
    subtitle: 'Accumulated profits retained in the business',
    icon: 'Vault',
    stats: [
      { label: 'Retained Earnings', value: 'SAR 0.00', caption: 'Cumulative', highlight: true },
      { label: 'This Year', value: 'SAR 0.00', caption: 'Net income', tone: 'info' },
      { label: 'Distributions', value: 'SAR 0.00', caption: 'Paid out' },
      { label: 'Reserves', value: 'SAR 0.00', caption: 'Set aside' },
    ],
    sections: [
      {
        title: 'Earnings History',
        columns: ['Year', 'Net Income', 'Distributions', 'Retained'],
        empty: { icon: 'Vault', title: 'No earnings history' },
      },
    ],
  },
  {
    id: '161',
    route: '/cost-centers',
    title: 'Cost Centers',
    subtitle: 'Track costs by department, branch or project',
    icon: 'FolderTree',
    action: { label: 'Add Cost Center', icon: 'Plus' },
    stats: [
      { label: 'Cost Centers', value: 0, caption: 'Active', highlight: true },
      { label: 'Total Costs', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Over Budget', value: 0, caption: 'Centers', tone: 'warning' },
      { label: 'Unallocated', value: 'SAR 0.00', caption: 'Needs assignment' },
    ],
    sections: [
      {
        title: 'Cost Centers',
        searchable: true,
        columns: ['Center', 'Budget', 'Actual', 'Variance', 'Status'],
        empty: { icon: 'FolderTree', title: 'No cost centers defined' },
      },
    ],
  },
  {
    id: '162',
    route: '/loss-account',
    title: 'Loss Account',
    subtitle: 'Track and categorise business losses',
    icon: 'TrendingDown',
    stats: [
      { label: 'Total Losses', value: 'SAR 0.00', caption: 'This year', highlight: true },
      { label: 'Write-Offs', value: 0, caption: 'Items', tone: 'warning' },
      { label: 'Bad Debt', value: 'SAR 0.00', caption: 'Uncollectable' },
      { label: 'Insurance Claims', value: 0, caption: 'Filed' },
    ],
    sections: [
      {
        title: 'Loss Register',
        columns: ['Date', 'Category', 'Description', 'Amount', 'Status'],
        empty: { icon: 'TrendingDown', title: 'No losses recorded' },
      },
    ],
  },
  {
    id: '163',
    route: '/partners-current-account',
    title: 'Partners Current Account',
    subtitle: 'Partner drawings, contributions and running balances',
    icon: 'Users',
    stats: [
      { label: 'Partners', value: 0, caption: 'Active', highlight: true },
      { label: 'Net Balance', value: 'SAR 0.00', caption: 'All partners', tone: 'info' },
      { label: 'Drawings', value: 'SAR 0.00', caption: 'This year' },
      { label: 'Contributions', value: 'SAR 0.00', caption: 'This year' },
    ],
    sections: [
      {
        title: 'Partner Accounts',
        columns: ['Partner', 'Contributions', 'Drawings', 'Balance'],
        empty: { icon: 'Users', title: 'No partner accounts' },
      },
    ],
  },
  {
    id: '164',
    route: '/expense-tracking',
    title: 'Expense Tracking',
    subtitle: 'Track and categorise daily business expenses',
    icon: 'Receipt',
    action: { label: 'Add Expense', icon: 'Plus' },
    stats: [
      { label: 'This Month', value: 'SAR 0.00', caption: 'Total expenses', highlight: true },
      { label: 'Pending Approval', value: 0, caption: 'Awaiting', tone: 'warning' },
      { label: 'Reimbursable', value: 'SAR 0.00', caption: 'Employee claims', tone: 'info' },
      { label: 'Categories', value: 0, caption: 'Used this month' },
    ],
    sections: [
      {
        title: 'Recent Expenses',
        searchable: true,
        columns: ['Date', 'Category', 'Description', 'Amount', 'Paid By', 'Status'],
        empty: { icon: 'Receipt', title: 'No expenses recorded' },
      },
    ],
  },
  {
    id: '165',
    route: '/expenses-management',
    title: 'Expenses Management',
    subtitle: 'Comprehensive expense management with policies and limits',
    icon: 'Wallet',
    stats: [
      { label: 'Total Budget', value: 'SAR 0.00', caption: 'Allocated', highlight: true },
      { label: 'Spent', value: 'SAR 0.00', caption: 'This period', tone: 'info' },
      { label: 'Over Budget', value: 0, caption: 'Departments', tone: 'warning' },
      { label: 'Claims Pending', value: 0, caption: 'Awaiting review' },
    ],
    sections: [
      {
        title: 'Expense Reports',
        searchable: true,
        columns: ['Employee', 'Department', 'Amount', 'Submitted', 'Status'],
        empty: { icon: 'Wallet', title: 'No expense reports' },
      },
    ],
  },
  {
    id: '166',
    route: '/sales-management',
    title: 'Sales Management',
    subtitle: 'Track sales targets, performance and commissions',
    icon: 'ShoppingCart',
    stats: [
      { label: 'Revenue', value: 'SAR 0.00', caption: 'This month', highlight: true },
      { label: 'Target', value: 'SAR 0.00', caption: 'Monthly goal', tone: 'info' },
      { label: 'Achievement', value: '0%', caption: 'Of target' },
      { label: 'Avg Ticket', value: 'SAR 0.00', caption: 'Per sale' },
    ],
    sections: [
      {
        title: 'Sales Performance',
        searchable: true,
        columns: ['Advisor', 'Sales', 'Revenue', 'Target', 'Achievement'],
        empty: { icon: 'ShoppingCart', title: 'No sales data' },
      },
    ],
  },
  {
    id: '167',
    route: '/accounting-integration',
    title: 'Accounting Integration',
    subtitle: 'Connect to external accounting systems',
    icon: 'Plug',
    stats: [
      { label: 'Integrations', value: 0, caption: 'Connected', highlight: true },
      { label: 'Synced Records', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Sync Errors', value: 0, caption: 'Failed', tone: 'warning' },
      { label: 'Last Sync', value: '—', caption: 'Timestamp' },
    ],
    sections: [
      {
        title: 'Connected Systems',
        columns: ['System', 'Type', 'Records Synced', 'Last Sync', 'Status'],
        empty: { icon: 'Plug', title: 'No accounting integrations configured' },
      },
    ],
  },
  {
    id: '168',
    route: '/financial-settings',
    title: 'Financial Settings',
    subtitle: 'Configure currencies, fiscal year and accounting policies',
    icon: 'Settings',
    stats: [
      { label: 'Fiscal Year', value: '—', caption: 'Current', highlight: true },
      { label: 'Currencies', value: 0, caption: 'Enabled', tone: 'info' },
      { label: 'Tax Rates', value: 0, caption: 'Configured' },
      { label: 'Payment Methods', value: 0, caption: 'Active' },
    ],
    sections: [
      {
        title: 'Configuration',
        columns: ['Setting', 'Value', 'Last Changed'],
        empty: { icon: 'Settings', title: 'Financial settings not configured' },
      },
    ],
  },

  // ── Warranty, contracts, insurance ───────────────────────────────────────
  {
    id: '169',
    route: '/warranty-management',
    title: 'Warranty Management',
    subtitle: 'Track warranty claims and coverage for vehicles and parts',
    icon: 'ShieldCheck',
    action: { label: 'New Claim', icon: 'Plus' },
    stats: [
      { label: 'Active Warranties', value: 0, caption: 'Covered items', highlight: true },
      { label: 'Open Claims', value: 0, caption: 'In progress', tone: 'info' },
      { label: 'Expiring Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Claims Value', value: 'SAR 0.00', caption: 'This year' },
    ],
    sections: [
      {
        title: 'Warranty Claims',
        searchable: true,
        columns: ['Claim', 'Vehicle', 'Part', 'Provider', 'Amount', 'Status'],
        empty: { icon: 'ShieldCheck', title: 'No warranty claims' },
      },
    ],
  },
  {
    id: '170',
    route: '/contract-management',
    title: 'Contract Management',
    subtitle: 'Service contracts, SLAs and renewal tracking',
    icon: 'FileSignature',
    action: { label: 'New Contract', icon: 'Plus' },
    stats: [
      { label: 'Active Contracts', value: 0, caption: 'In force', highlight: true },
      { label: 'Expiring', value: 0, caption: 'Within 30 days', tone: 'warning' },
      { label: 'Revenue', value: 'SAR 0.00', caption: 'Monthly recurring', tone: 'info' },
      { label: 'Renewal Rate', value: '0%', caption: 'This year' },
    ],
    sections: [
      {
        title: 'Contracts',
        searchable: true,
        columns: ['Contract', 'Customer', 'Type', 'Value', 'Expires', 'Status'],
        empty: { icon: 'FileSignature', title: 'No contracts' },
      },
    ],
  },
  {
    id: '171',
    route: '/insurance-claims',
    title: 'Insurance Claims',
    subtitle: 'Manage insurance claims and repair authorisations',
    icon: 'Shield',
    action: { label: 'New Claim', icon: 'Plus' },
    stats: [
      { label: 'Open Claims', value: 0, caption: 'In progress', highlight: true },
      { label: 'Awaiting Auth', value: 0, caption: 'Pending insurer', tone: 'warning' },
      { label: 'Approved', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Claim Value', value: 'SAR 0.00', caption: 'This month' },
    ],
    sections: [
      {
        title: 'Insurance Claims',
        searchable: true,
        columns: ['Claim', 'Customer', 'Vehicle', 'Insurer', 'Amount', 'Status'],
        empty: { icon: 'Shield', title: 'No insurance claims' },
      },
    ],
  },

  // ── Marketing & communications ───────────────────────────────────────────
  {
    id: '172',
    route: '/marketing-hub',
    title: 'Marketing Hub',
    subtitle: 'Central dashboard for all marketing activities',
    icon: 'Megaphone',
    stats: [
      { label: 'Active Campaigns', value: 0, caption: 'Running', highlight: true },
      { label: 'Reach', value: 0, caption: 'Contacts this month', tone: 'info' },
      { label: 'Conversions', value: 0, caption: 'This month' },
      { label: 'ROI', value: '0%', caption: 'Campaign average' },
    ],
    sections: [
      {
        title: 'Campaign Overview',
        columns: ['Campaign', 'Channel', 'Reach', 'Conversions', 'Status'],
        empty: { icon: 'Megaphone', title: 'No marketing campaigns' },
      },
    ],
  },
  {
    id: '173',
    route: '/marketing-automation',
    title: 'Marketing Automation',
    subtitle: 'Automated workflows for customer engagement',
    icon: 'Zap',
    action: { label: 'New Workflow', icon: 'Plus' },
    stats: [
      { label: 'Active Workflows', value: 0, caption: 'Running', highlight: true },
      { label: 'Contacts Engaged', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Emails Sent', value: 0, caption: 'Automated' },
      { label: 'Conversion Rate', value: '0%', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Automation Workflows',
        searchable: true,
        columns: ['Workflow', 'Trigger', 'Contacts', 'Conversions', 'Status'],
        empty: { icon: 'Zap', title: 'No automation workflows configured' },
      },
    ],
  },
  {
    id: '174',
    route: '/email-marketing-campaigns',
    title: 'Email Marketing Campaigns',
    subtitle: 'Create and manage email campaigns',
    icon: 'Mail',
    action: { label: 'New Campaign', icon: 'Plus' },
    stats: [
      { label: 'Campaigns', value: 0, caption: 'Active', highlight: true },
      { label: 'Sent', value: 0, caption: 'Emails this month', tone: 'info' },
      { label: 'Open Rate', value: '0%', caption: 'Average' },
      { label: 'Click Rate', value: '0%', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Campaigns',
        searchable: true,
        columns: ['Campaign', 'Audience', 'Sent', 'Opens', 'Clicks', 'Status'],
        empty: { icon: 'Mail', title: 'No email campaigns' },
      },
    ],
  },
  {
    id: '175',
    route: '/social-media-integration',
    title: 'Social Media Integration',
    subtitle: 'Connect and post to social media platforms',
    icon: 'Share2',
    stats: [
      { label: 'Connected', value: 0, caption: 'Platforms', highlight: true },
      { label: 'Posts', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Engagement', value: 0, caption: 'Interactions' },
      { label: 'Scheduled', value: 0, caption: 'Pending posts' },
    ],
    sections: [
      {
        title: 'Connected Platforms',
        columns: ['Platform', 'Account', 'Followers', 'Posts', 'Status'],
        empty: { icon: 'Share2', title: 'No social media accounts connected' },
      },
    ],
  },
  {
    id: '176',
    route: '/social-media-monitoring',
    title: 'Social Media Monitoring',
    subtitle: 'Track mentions, reviews and sentiment across platforms',
    icon: 'Eye',
    stats: [
      { label: 'Mentions', value: 0, caption: 'This week', highlight: true },
      { label: 'Positive', value: '0%', caption: 'Sentiment', tone: 'info' },
      { label: 'Negative', value: 0, caption: 'Needs response', tone: 'warning' },
      { label: 'Response Rate', value: '0%', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Recent Mentions',
        columns: ['Platform', 'Author', 'Content', 'Sentiment', 'Date'],
        empty: { icon: 'Eye', title: 'No mentions detected' },
      },
    ],
  },
  {
    id: '177',
    route: '/google-my-business',
    title: 'Google My Business',
    subtitle: 'Manage Google Business Profile listings and reviews',
    icon: 'MapPin',
    stats: [
      { label: 'Listings', value: 0, caption: 'Active', highlight: true },
      { label: 'Reviews', value: 0, caption: 'Total', tone: 'info' },
      { label: 'Avg Rating', value: '0.0', caption: 'Stars' },
      { label: 'Unresponded', value: 0, caption: 'Reviews', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Listings',
        columns: ['Location', 'Rating', 'Reviews', 'Views', 'Status'],
        empty: { icon: 'MapPin', title: 'No Google Business listings connected' },
      },
    ],
  },

  // ── Communication ────────────────────────────────────────────────────────
  {
    id: '179',
    route: '/chat',
    title: 'Chat',
    subtitle: 'Internal team messaging and communication',
    icon: 'MessageSquare',
    stats: [
      { label: 'Unread', value: 0, caption: 'Messages', highlight: true },
      { label: 'Conversations', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Channels', value: 0, caption: 'Joined' },
      { label: 'Online', value: 0, caption: 'Team members' },
    ],
    sections: [
      {
        title: 'Recent Conversations',
        columns: ['Conversation', 'Last Message', 'From', 'Time'],
        empty: { icon: 'MessageSquare', title: 'No conversations yet' },
      },
    ],
  },
  {
    id: '180',
    route: '/support-chat-dashboard',
    title: 'Support Chat Dashboard',
    subtitle: 'Live chat support for customers and portal users',
    icon: 'HeadphonesIcon',
    stats: [
      { label: 'Active Chats', value: 0, caption: 'Live now', highlight: true },
      { label: 'Waiting', value: 0, caption: 'In queue', tone: 'warning' },
      { label: 'Resolved Today', value: 0, caption: 'Closed', tone: 'info' },
      { label: 'Avg Response', value: '0m', caption: 'First reply' },
    ],
    sections: [
      {
        title: 'Chat Queue',
        columns: ['Customer', 'Subject', 'Waiting', 'Agent', 'Status'],
        empty: { icon: 'HeadphonesIcon', title: 'No active support chats' },
      },
    ],
  },
  {
    id: '181',
    route: '/notifications',
    title: 'Notifications',
    subtitle: 'System notifications and alert preferences',
    icon: 'Bell',
    stats: [
      { label: 'Unread', value: 0, caption: 'Notifications', highlight: true },
      { label: 'Today', value: 0, caption: 'Received', tone: 'info' },
      { label: 'Action Required', value: 0, caption: 'Pending', tone: 'warning' },
      { label: 'This Week', value: 0, caption: 'Total' },
    ],
    sections: [
      {
        title: 'All Notifications',
        columns: ['Type', 'Message', 'From', 'Time', 'Status'],
        empty: { icon: 'Bell', title: 'No notifications' },
      },
    ],
  },

  // ── Compliance & quality ─────────────────────────────────────────────────
  {
    id: '182',
    route: '/compliance-management',
    title: 'Compliance Management',
    subtitle: 'Regulatory compliance tracking and audit readiness',
    icon: 'ShieldCheck',
    stats: [
      { label: 'Compliance Score', value: '0%', caption: 'Overall', highlight: true },
      { label: 'Open Items', value: 0, caption: 'Non-compliant', tone: 'warning' },
      { label: 'Upcoming Audits', value: 0, caption: 'Scheduled', tone: 'info' },
      { label: 'Last Audit', value: '—', caption: 'Date' },
    ],
    sections: [
      {
        title: 'Compliance Items',
        searchable: true,
        columns: ['Regulation', 'Area', 'Status', 'Due Date', 'Owner'],
        empty: { icon: 'ShieldCheck', title: 'No compliance items configured' },
      },
    ],
  },
  {
    id: '183',
    route: '/zatca-settings',
    title: 'ZATCA Settings',
    subtitle: 'ZATCA e-invoicing compliance configuration',
    icon: 'FileCheck',
    stats: [
      { label: 'Status', value: '—', caption: 'Integration', highlight: true },
      { label: 'Invoices Submitted', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Rejected', value: 0, caption: 'Needs correction', tone: 'warning' },
      { label: 'Last Submission', value: '—', caption: 'Date' },
    ],
    sections: [
      {
        title: 'ZATCA Configuration',
        columns: ['Setting', 'Value', 'Status'],
        empty: { icon: 'FileCheck', title: 'ZATCA integration not configured' },
      },
    ],
  },
  {
    id: '184',
    route: '/vat-settings',
    title: 'VAT Settings',
    subtitle: 'VAT rates, exemptions and return configuration',
    icon: 'Percent',
    stats: [
      { label: 'Standard Rate', value: '15%', caption: 'Current', highlight: true },
      { label: 'Exempt Items', value: 0, caption: 'Configured', tone: 'info' },
      { label: 'Next Return', value: '—', caption: 'Due date' },
      { label: 'VAT Collected', value: 'SAR 0.00', caption: 'This period' },
    ],
    sections: [
      {
        title: 'VAT Configuration',
        columns: ['Category', 'Rate', 'Items', 'Status'],
        empty: { icon: 'Percent', title: 'VAT settings not configured' },
      },
    ],
  },
  {
    id: '185',
    route: '/zakat-settings',
    title: 'Zakat Settings',
    subtitle: 'Zakat calculation rules and payment tracking',
    icon: 'Heart',
    stats: [
      { label: 'Zakat Due', value: 'SAR 0.00', caption: 'Estimated', highlight: true },
      { label: 'Paid', value: 'SAR 0.00', caption: 'This year', tone: 'info' },
      { label: 'Next Due', value: '—', caption: 'Filing date' },
      { label: 'Assets Base', value: 'SAR 0.00', caption: 'Zakatable' },
    ],
    sections: [
      {
        title: 'Zakat Configuration',
        columns: ['Setting', 'Value', 'Last Updated'],
        empty: { icon: 'Heart', title: 'Zakat settings not configured' },
      },
    ],
  },
  {
    id: '186',
    route: '/safety-incidents',
    title: 'Safety Incidents',
    subtitle: 'Workplace safety incident reporting and tracking',
    icon: 'AlertOctagon',
    action: { label: 'Report Incident', icon: 'Plus' },
    stats: [
      { label: 'Open Incidents', value: 0, caption: 'Under investigation', highlight: true },
      { label: 'This Month', value: 0, caption: 'Reported', tone: 'warning' },
      { label: 'Days Without', value: 0, caption: 'Since last incident', tone: 'info' },
      { label: 'Resolved', value: 0, caption: 'This year' },
    ],
    sections: [
      {
        title: 'Incident Log',
        searchable: true,
        columns: ['Date', 'Type', 'Location', 'Severity', 'Status'],
        empty: { icon: 'AlertOctagon', title: 'No safety incidents reported' },
      },
    ],
  },
  {
    id: '187',
    route: '/environmental-compliance',
    title: 'Environmental Compliance',
    subtitle: 'Waste management, emissions and environmental standards',
    icon: 'Leaf',
    stats: [
      { label: 'Compliance Score', value: '0%', caption: 'Environmental', highlight: true },
      { label: 'Waste Disposed', value: '0kg', caption: 'This month', tone: 'info' },
      { label: 'Open Issues', value: 0, caption: 'Non-compliant', tone: 'warning' },
      { label: 'Next Inspection', value: '—', caption: 'Scheduled' },
    ],
    sections: [
      {
        title: 'Environmental Records',
        columns: ['Category', 'Metric', 'Value', 'Limit', 'Status'],
        empty: { icon: 'Leaf', title: 'No environmental records' },
      },
    ],
  },
  {
    id: '188',
    route: '/iso-quality-management',
    title: 'ISO Quality Management',
    subtitle: 'ISO certification tracking and quality management system',
    icon: 'Award',
    stats: [
      { label: 'Certifications', value: 0, caption: 'Active', highlight: true },
      { label: 'Audits Passed', value: 0, caption: 'This year', tone: 'info' },
      { label: 'NCRs Open', value: 0, caption: 'Non-conformances', tone: 'warning' },
      { label: 'Next Audit', value: '—', caption: 'Scheduled' },
    ],
    sections: [
      {
        title: 'Certifications',
        columns: ['Standard', 'Scope', 'Certified Until', 'Auditor', 'Status'],
        empty: { icon: 'Award', title: 'No ISO certifications recorded' },
      },
    ],
  },
  {
    id: '189',
    route: '/equipment-calibration',
    title: 'Equipment Calibration',
    subtitle: 'Calibration schedules and records for workshop equipment',
    icon: 'Ruler',
    action: { label: 'Schedule Calibration', icon: 'Plus' },
    stats: [
      { label: 'Equipment', value: 0, caption: 'Tracked', highlight: true },
      { label: 'Due', value: 0, caption: 'Calibration needed', tone: 'warning' },
      { label: 'Calibrated', value: 0, caption: 'This quarter', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past schedule' },
    ],
    sections: [
      {
        title: 'Calibration Schedule',
        searchable: true,
        columns: ['Equipment', 'Type', 'Last Calibrated', 'Next Due', 'Status'],
        empty: { icon: 'Ruler', title: 'No equipment tracked for calibration' },
      },
    ],
  },

  // ── Multi-location & franchise ───────────────────────────────────────────
  {
    id: '190',
    route: '/franchise-management',
    title: 'Franchise Management',
    subtitle: 'Franchise operations and performance monitoring',
    icon: 'Building2',
    stats: [
      { label: 'Franchises', value: 0, caption: 'Active', highlight: true },
      { label: 'Revenue', value: 'SAR 0.00', caption: 'Network total', tone: 'info' },
      { label: 'Compliance', value: '0%', caption: 'Average score' },
      { label: 'New Applications', value: 0, caption: 'Pending', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Franchise Locations',
        searchable: true,
        columns: ['Franchise', 'Location', 'Revenue', 'Rating', 'Status'],
        empty: { icon: 'Building2', title: 'No franchises registered' },
      },
    ],
  },
  {
    id: '191',
    route: '/globalization-layer',
    title: 'Globalization Layer',
    subtitle: 'Multi-language, multi-currency and regional settings',
    icon: 'Globe',
    stats: [
      { label: 'Languages', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Currencies', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Regions', value: 0, caption: 'Configured' },
      { label: 'Translation Coverage', value: '0%', caption: 'Complete' },
    ],
    sections: [
      {
        title: 'Localization Settings',
        columns: ['Setting', 'Type', 'Value', 'Status'],
        empty: { icon: 'Globe', title: 'No localization settings configured' },
      },
    ],
  },
  {
    id: '192',
    route: '/multi-location-dashboard',
    title: 'Multi Location Dashboard',
    subtitle: 'Performance overview across all branch locations',
    icon: 'MapPin',
    stats: [
      { label: 'Locations', value: 0, caption: 'Active branches', highlight: true },
      { label: 'Total Revenue', value: 'SAR 0.00', caption: 'All locations', tone: 'info' },
      { label: 'Best Performer', value: '—', caption: 'By revenue' },
      { label: 'Needs Attention', value: 0, caption: 'Below target', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Location Performance',
        columns: ['Location', 'Revenue', 'Jobs', 'Satisfaction', 'Status'],
        empty: { icon: 'MapPin', title: 'No locations configured' },
      },
    ],
  },

  // ── AI & automation ──────────────────────────────────────────────────────
  {
    id: '193',
    route: '/ai-automation',
    title: 'AI Automation',
    subtitle: 'AI-powered workflow automation and task routing',
    icon: 'Sparkles',
    stats: [
      { label: 'Active Automations', value: 0, caption: 'Running', highlight: true },
      { label: 'Tasks Automated', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Time Saved', value: '0h', caption: 'Estimated' },
      { label: 'Errors', value: 0, caption: 'Failed runs', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Automation Rules',
        searchable: true,
        columns: ['Rule', 'Trigger', 'Action', 'Runs', 'Status'],
        empty: { icon: 'Sparkles', title: 'No automation rules configured' },
      },
    ],
  },
  {
    id: '194',
    route: '/ai-chatbot',
    title: 'AI Chatbot',
    subtitle: 'Customer-facing chatbot for enquiries and booking',
    icon: 'Bot',
    stats: [
      { label: 'Conversations', value: 0, caption: 'This month', highlight: true },
      { label: 'Resolved', value: 0, caption: 'Without human', tone: 'info' },
      { label: 'Escalated', value: 0, caption: 'To agent', tone: 'warning' },
      { label: 'Satisfaction', value: '0%', caption: 'User rating' },
    ],
    sections: [
      {
        title: 'Recent Conversations',
        columns: ['Customer', 'Topic', 'Messages', 'Outcome', 'Date'],
        empty: { icon: 'Bot', title: 'No chatbot conversations yet' },
      },
    ],
  },
  {
    id: '195',
    route: '/ai-chatbot-assistant',
    title: 'AI Chatbot Assistant',
    subtitle: 'Internal AI assistant for staff queries',
    icon: 'MessageCircle',
    stats: [
      { label: 'Queries', value: 0, caption: 'This month', highlight: true },
      { label: 'Answered', value: 0, caption: 'Automatically', tone: 'info' },
      { label: 'Accuracy', value: '0%', caption: 'Correct answers' },
      { label: 'Avg Response', value: '0s', caption: 'Time' },
    ],
    sections: [
      {
        title: 'Recent Queries',
        columns: ['User', 'Query', 'Answer', 'Helpful', 'Date'],
        empty: { icon: 'MessageCircle', title: 'No queries recorded' },
      },
    ],
  },
  {
    id: '196',
    route: '/ai-service-advisor',
    title: 'AI Service Advisor',
    subtitle: 'AI-assisted service recommendations for customers',
    icon: 'Sparkles',
    stats: [
      { label: 'Recommendations', value: 0, caption: 'This month', highlight: true },
      { label: 'Accepted', value: 0, caption: 'By customer', tone: 'info' },
      { label: 'Revenue Generated', value: 'SAR 0.00', caption: 'From recommendations' },
      { label: 'Accuracy', value: '0%', caption: 'Relevant suggestions' },
    ],
    sections: [
      {
        title: 'AI Recommendations',
        columns: ['Customer', 'Vehicle', 'Recommendation', 'Confidence', 'Outcome'],
        empty: { icon: 'Sparkles', title: 'No recommendations generated yet' },
      },
    ],
  },
  {
    id: '197',
    route: '/voice-commands',
    title: 'Voice Commands',
    subtitle: 'Voice-activated commands for hands-free operation',
    icon: 'Mic',
    stats: [
      { label: 'Commands Used', value: 0, caption: 'This month', highlight: true },
      { label: 'Recognition Rate', value: '0%', caption: 'Accuracy', tone: 'info' },
      { label: 'Active Users', value: 0, caption: 'Technicians' },
      { label: 'Top Command', value: '—', caption: 'Most used' },
    ],
    sections: [
      {
        title: 'Available Commands',
        searchable: true,
        columns: ['Command', 'Action', 'Usage', 'Success Rate'],
        empty: { icon: 'Mic', title: 'No voice commands configured' },
      },
    ],
  },
  {
    id: '198',
    route: '/voice-command-interface',
    title: 'Voice Command Interface',
    subtitle: 'Configure and test voice command recognition',
    icon: 'AudioLines',
    stats: [
      { label: 'Commands', value: 0, caption: 'Registered', highlight: true },
      { label: 'Languages', value: 0, caption: 'Supported', tone: 'info' },
      { label: 'Active', value: 0, caption: 'Enabled commands' },
      { label: 'Avg Confidence', value: '0%', caption: 'Recognition' },
    ],
    sections: [
      {
        title: 'Command Library',
        searchable: true,
        columns: ['Command', 'Category', 'Language', 'Confidence', 'Status'],
        empty: { icon: 'AudioLines', title: 'No voice commands registered' },
      },
    ],
  },
  {
    id: '199',
    route: '/smart-damage-assessment',
    title: 'Smart Damage Assessment',
    subtitle: 'AI-powered vehicle damage detection from photos',
    icon: 'Camera',
    action: { label: 'New Assessment', icon: 'Camera' },
    stats: [
      { label: 'Assessments', value: 0, caption: 'Completed', highlight: true },
      { label: 'Damage Detected', value: 0, caption: 'Findings', tone: 'warning' },
      { label: 'Accuracy', value: '0%', caption: 'Vs manual', tone: 'info' },
      { label: 'Time Saved', value: '0m', caption: 'Per assessment' },
    ],
    sections: [
      {
        title: 'Recent Assessments',
        columns: ['Vehicle', 'Photos', 'Findings', 'Severity', 'Date'],
        empty: { icon: 'Camera', title: 'No damage assessments recorded' },
      },
    ],
  },
  {
    id: '200',
    route: '/ml-fraud-detection',
    title: 'ML Fraud Detection',
    subtitle: 'Machine learning models to detect fraudulent claims',
    icon: 'ShieldAlert',
    stats: [
      { label: 'Claims Analysed', value: 0, caption: 'This month', highlight: true },
      { label: 'Flagged', value: 0, caption: 'Suspicious', tone: 'warning' },
      { label: 'Confirmed Fraud', value: 0, caption: 'This year' },
      { label: 'Model Accuracy', value: '0%', caption: 'Precision' },
    ],
    sections: [
      {
        title: 'Flagged Claims',
        columns: ['Claim', 'Customer', 'Risk Score', 'Indicators', 'Status'],
        empty: { icon: 'ShieldAlert', title: 'No claims flagged' },
      },
    ],
  },
  {
    id: '201',
    route: '/neural-network-prediction',
    title: 'Neural Network Prediction',
    subtitle: 'Deep learning predictions for demand and failure forecasting',
    icon: 'Brain',
    stats: [
      { label: 'Models Active', value: 0, caption: 'Running', highlight: true },
      { label: 'Predictions', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Accuracy', value: '0%', caption: 'Average' },
      { label: 'Data Points', value: 0, caption: 'Training set' },
    ],
    sections: [
      {
        title: 'Predictions',
        columns: ['Model', 'Type', 'Prediction', 'Confidence', 'Date'],
        empty: { icon: 'Brain', title: 'No predictions generated yet' },
      },
    ],
  },

  // ── Emerging & future tech ───────────────────────────────────────────────
  {
    id: '202',
    route: '/emerging-technologies',
    title: 'Emerging Technologies',
    subtitle: 'Overview of advanced technology integrations',
    icon: 'Rocket',
    stats: [
      { label: 'Technologies', value: 0, caption: 'Evaluated', highlight: true },
      { label: 'Active Pilots', value: 0, caption: 'In trial', tone: 'info' },
      { label: 'Production', value: 0, caption: 'Deployed' },
      { label: 'Planned', value: 0, caption: 'On roadmap' },
    ],
    sections: [
      {
        title: 'Technology Registry',
        columns: ['Technology', 'Category', 'Phase', 'Impact', 'Status'],
        empty: { icon: 'Rocket', title: 'No emerging technologies registered' },
      },
    ],
  },
  {
    id: '203',
    route: '/next-gen-technologies',
    title: 'NextGen Technologies',
    subtitle: 'Next-generation features and innovation pipeline',
    icon: 'Lightbulb',
    stats: [
      { label: 'In Pipeline', value: 0, caption: 'Features', highlight: true },
      { label: 'Beta', value: 0, caption: 'In testing', tone: 'info' },
      { label: 'Released', value: 0, caption: 'This year' },
      { label: 'Impact Score', value: '0/10', caption: 'Average' },
    ],
    sections: [
      {
        title: 'Innovation Pipeline',
        columns: ['Feature', 'Category', 'Phase', 'Priority', 'ETA'],
        empty: { icon: 'Lightbulb', title: 'No features in the pipeline' },
      },
    ],
  },
  {
    id: '204',
    route: '/io-t-dashboard',
    title: 'IoT Dashboard',
    subtitle: 'Internet of Things device monitoring and management',
    icon: 'Cpu',
    stats: [
      { label: 'Devices', value: 0, caption: 'Connected', highlight: true },
      { label: 'Online', value: 0, caption: 'Reporting', tone: 'info' },
      { label: 'Alerts', value: 0, caption: 'Active', tone: 'warning' },
      { label: 'Data Points', value: 0, caption: 'Last 24h' },
    ],
    sections: [
      {
        title: 'Connected Devices',
        searchable: true,
        columns: ['Device', 'Type', 'Location', 'Last Report', 'Status'],
        empty: { icon: 'Cpu', title: 'No IoT devices connected' },
      },
    ],
  },
  {
    id: '205',
    route: '/edge-computing',
    title: 'Edge Computing',
    subtitle: 'Edge nodes for low-latency data processing',
    icon: 'Server',
    stats: [
      { label: 'Edge Nodes', value: 0, caption: 'Deployed', highlight: true },
      { label: 'Processing', value: 0, caption: 'Requests/sec', tone: 'info' },
      { label: 'Latency', value: '0ms', caption: 'Average' },
      { label: 'Offline', value: 0, caption: 'Unreachable', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Edge Nodes',
        columns: ['Node', 'Location', 'Load', 'Latency', 'Status'],
        empty: { icon: 'Server', title: 'No edge nodes deployed' },
      },
    ],
  },
  {
    id: '206',
    route: '/digital-twin-viewer',
    title: 'Digital Twin Viewer',
    subtitle: 'Virtual representation of workshop and vehicle systems',
    icon: 'Layers',
    stats: [
      { label: 'Twins Active', value: 0, caption: 'Running', highlight: true },
      { label: 'Simulations', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Anomalies', value: 0, caption: 'Detected', tone: 'warning' },
      { label: 'Accuracy', value: '0%', caption: 'Model fit' },
    ],
    sections: [
      {
        title: 'Digital Twins',
        columns: ['Twin', 'Type', 'Real-World Asset', 'Last Sync', 'Status'],
        empty: { icon: 'Layers', title: 'No digital twins configured' },
      },
    ],
  },
  {
    id: '207',
    route: '/drone-inspection',
    title: 'Drone Inspection',
    subtitle: 'Aerial drone inspections for large vehicles and facilities',
    icon: 'Plane',
    action: { label: 'Schedule Flight', icon: 'Plus' },
    stats: [
      { label: 'Inspections', value: 0, caption: 'Completed', highlight: true },
      { label: 'Drones', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Findings', value: 0, caption: 'Issues detected', tone: 'warning' },
      { label: 'Scheduled', value: 0, caption: 'Upcoming' },
    ],
    sections: [
      {
        title: 'Inspection Log',
        columns: ['Date', 'Target', 'Drone', 'Findings', 'Status'],
        empty: { icon: 'Plane', title: 'No drone inspections recorded' },
      },
    ],
  },
  {
    id: '208',
    route: '/ar-repair-guide',
    title: 'AR Repair Guide',
    subtitle: 'Augmented reality overlays for step-by-step repairs',
    icon: 'Glasses',
    stats: [
      { label: 'Guides', value: 0, caption: 'Available', highlight: true },
      { label: 'Sessions', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Vehicles Covered', value: 0, caption: 'Makes/models' },
      { label: 'Avg Duration', value: '0m', caption: 'Per session' },
    ],
    sections: [
      {
        title: 'AR Guides',
        searchable: true,
        columns: ['Guide', 'Vehicle', 'Steps', 'Duration', 'Rating'],
        empty: { icon: 'Glasses', title: 'No AR guides available' },
      },
    ],
  },
  {
    id: '209',
    route: '/ar-overlay',
    title: 'AR Overlay',
    subtitle: 'Live augmented reality overlay for diagnostics',
    icon: 'ScanLine',
    stats: [
      { label: 'Active Sessions', value: 0, caption: 'Using AR', highlight: true },
      { label: 'Overlays', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Devices', value: 0, caption: 'Connected' },
      { label: 'Sessions Today', value: 0, caption: 'Completed' },
    ],
    sections: [
      {
        title: 'AR Sessions',
        columns: ['Technician', 'Vehicle', 'Overlay', 'Duration', 'Date'],
        empty: { icon: 'ScanLine', title: 'No AR sessions recorded' },
      },
    ],
  },
  {
    id: '210',
    route: '/vr-showroom',
    title: 'VR Showroom',
    subtitle: 'Virtual reality showroom for vehicle browsing',
    icon: 'Headphones',
    stats: [
      { label: 'Vehicles', value: 0, caption: 'In showroom', highlight: true },
      { label: 'Visitors', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Avg Session', value: '0m', caption: 'Duration' },
      { label: 'Enquiries', value: 0, caption: 'From VR' },
    ],
    sections: [
      {
        title: 'Showroom Vehicles',
        columns: ['Vehicle', 'Category', 'Views', 'Enquiries', 'Status'],
        empty: { icon: 'Headphones', title: 'No vehicles in VR showroom' },
      },
    ],
  },
  {
    id: '211',
    route: '/blockchain-service-history',
    title: 'Blockchain Service History',
    subtitle: 'Tamper-proof service records on the blockchain',
    icon: 'Link',
    stats: [
      { label: 'Records', value: 0, caption: 'On chain', highlight: true },
      { label: 'Vehicles', value: 0, caption: 'Tracked', tone: 'info' },
      { label: 'Verified', value: 0, caption: 'This month' },
      { label: 'Block Height', value: 0, caption: 'Latest' },
    ],
    sections: [
      {
        title: 'Blockchain Records',
        searchable: true,
        columns: ['Vehicle', 'Service', 'Hash', 'Block', 'Verified'],
        empty: { icon: 'Link', title: 'No blockchain records' },
      },
    ],
  },
  {
    id: '212',
    route: '/smart-contracts',
    title: 'Smart Contracts',
    subtitle: 'Automated contract execution on the blockchain',
    icon: 'FileCode',
    stats: [
      { label: 'Contracts', value: 0, caption: 'Deployed', highlight: true },
      { label: 'Executed', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Value Locked', value: 'SAR 0.00', caption: 'In escrow' },
      { label: 'Failed', value: 0, caption: 'Execution errors', tone: 'warning' },
    ],
    sections: [
      {
        title: 'Smart Contracts',
        columns: ['Contract', 'Type', 'Parties', 'Value', 'Status'],
        empty: { icon: 'FileCode', title: 'No smart contracts deployed' },
      },
    ],
  },
  {
    id: '213',
    route: '/quantum-computing',
    title: 'Quantum Computing',
    subtitle: 'Quantum computing integration for complex optimisation',
    icon: 'Atom',
    stats: [
      { label: 'Quantum Jobs', value: 0, caption: 'Submitted', highlight: true },
      { label: 'Completed', value: 0, caption: 'Results ready', tone: 'info' },
      { label: 'Queue', value: 0, caption: 'Waiting' },
      { label: 'Speedup', value: '0x', caption: 'Vs classical' },
    ],
    sections: [
      {
        title: 'Quantum Jobs',
        columns: ['Job', 'Algorithm', 'Qubits', 'Status', 'Submitted'],
        empty: { icon: 'Atom', title: 'No quantum computing jobs' },
      },
    ],
  },
  {
    id: '214',
    route: '/sustainable-energy-monitoring',
    title: 'Sustainable Energy Monitoring',
    subtitle: 'Track energy consumption and renewable energy usage',
    icon: 'Zap',
    stats: [
      { label: 'Energy Used', value: '0 kWh', caption: 'This month', highlight: true },
      { label: 'Renewable', value: '0%', caption: 'Of total', tone: 'info' },
      { label: 'Cost', value: 'SAR 0.00', caption: 'This month' },
      { label: 'CO₂ Saved', value: '0kg', caption: 'Vs grid only' },
    ],
    sections: [
      {
        title: 'Energy Sources',
        columns: ['Source', 'Type', 'Output', 'Cost', 'Status'],
        empty: { icon: 'Zap', title: 'No energy monitoring configured' },
      },
    ],
  },
  {
    id: '215',
    route: '/digital-signage',
    title: 'Digital Signage',
    subtitle: 'Manage digital displays in the workshop and waiting area',
    icon: 'Monitor',
    action: { label: 'New Playlist', icon: 'Plus' },
    stats: [
      { label: 'Screens', value: 0, caption: 'Active', highlight: true },
      { label: 'Playlists', value: 0, caption: 'Running', tone: 'info' },
      { label: 'Offline', value: 0, caption: 'Disconnected', tone: 'warning' },
      { label: 'Content Items', value: 0, caption: 'In library' },
    ],
    sections: [
      {
        title: 'Display Screens',
        columns: ['Screen', 'Location', 'Playlist', 'Last Seen', 'Status'],
        empty: { icon: 'Monitor', title: 'No digital signage screens configured' },
      },
    ],
  },

  // ── System & administration ──────────────────────────────────────────────
  {
    id: '217',
    route: '/security-cameras',
    title: 'Security Cameras',
    subtitle: 'CCTV camera feeds and recording management',
    icon: 'Cctv',
    stats: [
      { label: 'Cameras', value: 0, caption: 'Online', highlight: true },
      { label: 'Recording', value: 0, caption: 'Active feeds', tone: 'info' },
      { label: 'Offline', value: 0, caption: 'Disconnected', tone: 'warning' },
      { label: 'Storage', value: '0 GB', caption: 'Used' },
    ],
    sections: [
      {
        title: 'Camera List',
        columns: ['Camera', 'Location', 'Resolution', 'Storage', 'Status'],
        empty: { icon: 'Cctv', title: 'No security cameras configured' },
      },
    ],
  },
  {
    id: '218',
    route: '/mobile-device-management',
    title: 'Mobile Device Management',
    subtitle: 'Manage company mobile devices and tablets',
    icon: 'Tablet',
    action: { label: 'Enrol Device', icon: 'Plus' },
    stats: [
      { label: 'Devices', value: 0, caption: 'Enrolled', highlight: true },
      { label: 'Online', value: 0, caption: 'Active now', tone: 'info' },
      { label: 'Policy Violations', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Updates Pending', value: 0, caption: 'Needs update' },
    ],
    sections: [
      {
        title: 'Managed Devices',
        searchable: true,
        columns: ['Device', 'User', 'OS', 'Last Seen', 'Compliance'],
        empty: { icon: 'Tablet', title: 'No devices enrolled' },
      },
    ],
  },
  {
    id: '219',
    route: '/document-management',
    title: 'Document Management',
    subtitle: 'Central document repository with version control',
    icon: 'FolderOpen',
    action: { label: 'Upload', icon: 'Upload' },
    stats: [
      { label: 'Documents', value: 0, caption: 'Stored', highlight: true },
      { label: 'Storage Used', value: '0 MB', caption: 'Total', tone: 'info' },
      { label: 'Shared', value: 0, caption: 'With teams' },
      { label: 'Recent', value: 0, caption: 'Added this week' },
    ],
    sections: [
      {
        title: 'Documents',
        searchable: true,
        columns: ['Name', 'Type', 'Size', 'Owner', 'Modified'],
        empty: { icon: 'FolderOpen', title: 'No documents uploaded' },
      },
    ],
  },
  {
    id: '220',
    route: '/document-ocr',
    title: 'Document OCR',
    subtitle: 'Optical character recognition for scanned documents',
    icon: 'FileSearch',
    action: { label: 'Scan Document', icon: 'ScanLine' },
    stats: [
      { label: 'Scanned', value: 0, caption: 'This month', highlight: true },
      { label: 'Accuracy', value: '0%', caption: 'Recognition', tone: 'info' },
      { label: 'Pending Review', value: 0, caption: 'Needs verification', tone: 'warning' },
      { label: 'Auto-Filed', value: 0, caption: 'Categorised' },
    ],
    sections: [
      {
        title: 'Recent Scans',
        columns: ['Document', 'Type', 'Pages', 'Accuracy', 'Date'],
        empty: { icon: 'FileSearch', title: 'No documents scanned' },
      },
    ],
  },
  {
    id: '221',
    route: '/data-import-export',
    title: 'Data Import Export',
    subtitle: 'Bulk data import and export operations',
    icon: 'ArrowUpDown',
    stats: [
      { label: 'Imports', value: 0, caption: 'This month', highlight: true },
      { label: 'Exports', value: 0, caption: 'This month', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'Errors', tone: 'warning' },
      { label: 'Records Processed', value: 0, caption: 'Total' },
    ],
    sections: [
      {
        title: 'Recent Operations',
        columns: ['Operation', 'Type', 'Records', 'Duration', 'Status'],
        empty: { icon: 'ArrowUpDown', title: 'No import/export operations' },
      },
    ],
  },
  {
    id: '222',
    route: '/data-backup',
    title: 'Data Backup',
    subtitle: 'Automated backup schedules and restore points',
    icon: 'HardDrive',
    action: { label: 'Backup Now', icon: 'Download' },
    stats: [
      { label: 'Last Backup', value: '—', caption: 'Timestamp', highlight: true },
      { label: 'Backups', value: 0, caption: 'Available', tone: 'info' },
      { label: 'Storage', value: '0 GB', caption: 'Used' },
      { label: 'Next Scheduled', value: '—', caption: 'Auto backup' },
    ],
    sections: [
      {
        title: 'Backup History',
        columns: ['Date', 'Type', 'Size', 'Duration', 'Status'],
        empty: { icon: 'HardDrive', title: 'No backups recorded' },
      },
    ],
  },
  {
    id: '224',
    route: '/user-profile',
    title: 'User Profile',
    subtitle: 'Personal profile settings and preferences',
    icon: 'User',
    stats: [
      { label: 'Role', value: '—', caption: 'Current', highlight: true },
      { label: 'Last Login', value: '—', caption: 'Date', tone: 'info' },
      { label: 'Sessions', value: 0, caption: 'Active' },
      { label: 'Member Since', value: '—', caption: 'Joined' },
    ],
    sections: [
      {
        title: 'Profile Details',
        columns: ['Field', 'Value'],
        empty: { icon: 'User', title: 'No profile information' },
      },
    ],
  },
  {
    id: '225',
    route: '/system-settings',
    title: 'System Settings',
    subtitle: 'Global system configuration and preferences',
    icon: 'Settings',
    stats: [
      { label: 'Modules', value: 0, caption: 'Enabled', highlight: true },
      { label: 'Users', value: 0, caption: 'Active', tone: 'info' },
      { label: 'Integrations', value: 0, caption: 'Connected' },
      { label: 'Last Updated', value: '—', caption: 'Config change' },
    ],
    sections: [
      {
        title: 'Settings',
        searchable: true,
        columns: ['Category', 'Setting', 'Value', 'Status'],
        empty: { icon: 'Settings', title: 'No settings to display' },
      },
    ],
  },
  {
    id: '226',
    route: '/user-settings',
    title: 'User Settings',
    subtitle: 'Personal preferences and notification settings',
    icon: 'UserCog',
    stats: [
      { label: 'Notifications', value: 0, caption: 'Channels active', highlight: true },
      { label: 'Language', value: '—', caption: 'Selected', tone: 'info' },
      { label: 'Theme', value: '—', caption: 'Current' },
      { label: 'Timezone', value: '—', caption: 'Set' },
    ],
    sections: [
      {
        title: 'Preferences',
        columns: ['Preference', 'Value'],
        empty: { icon: 'UserCog', title: 'No preferences configured' },
      },
    ],
  },
  {
    id: '228',
    route: '/security-settings',
    title: 'Security Settings',
    subtitle: 'Password policies, 2FA and session management',
    icon: 'Lock',
    stats: [
      { label: '2FA Enabled', value: '0%', caption: 'Of users', highlight: true },
      { label: 'Active Sessions', value: 0, caption: 'Current', tone: 'info' },
      { label: 'Failed Logins', value: 0, caption: 'This week', tone: 'warning' },
      { label: 'Locked Accounts', value: 0, caption: 'Currently' },
    ],
    sections: [
      {
        title: 'Security Policies',
        columns: ['Policy', 'Setting', 'Status'],
        empty: { icon: 'Lock', title: 'No security policies configured' },
      },
    ],
  },
  {
    id: '229',
    route: '/role-management',
    title: 'Role Management',
    subtitle: 'Define roles and assign permissions',
    icon: 'Shield',
    action: { label: 'New Role', icon: 'Plus' },
    stats: [
      { label: 'Roles', value: 0, caption: 'Defined', highlight: true },
      { label: 'Users Assigned', value: 0, caption: 'Total', tone: 'info' },
      { label: 'Custom Roles', value: 0, caption: 'Created' },
      { label: 'Permissions', value: 0, caption: 'Total configured' },
    ],
    sections: [
      {
        title: 'Roles',
        searchable: true,
        columns: ['Role', 'Users', 'Permissions', 'Created', 'Status'],
        empty: { icon: 'Shield', title: 'No roles defined' },
      },
    ],
  },
  {
    id: '230',
    route: '/tasks',
    title: 'Tasks',
    subtitle: 'Personal task list and assignments',
    icon: 'CheckSquare',
    action: { label: 'New Task', icon: 'Plus' },
    stats: [
      { label: 'My Tasks', value: 0, caption: 'Open', highlight: true },
      { label: 'Due Today', value: 0, caption: 'Urgent', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This week', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past deadline' },
    ],
    sections: [
      {
        title: 'Task List',
        searchable: true,
        columns: ['Task', 'Priority', 'Assigned To', 'Due', 'Status'],
        empty: { icon: 'CheckSquare', title: 'No tasks' },
      },
    ],
  },
  {
    id: '231',
    route: '/task-management',
    title: 'Task Management',
    subtitle: 'Team task management with assignments and tracking',
    icon: 'ListTodo',
    action: { label: 'New Task', icon: 'Plus' },
    stats: [
      { label: 'Open Tasks', value: 0, caption: 'Total', highlight: true },
      { label: 'In Progress', value: 0, caption: 'Being worked on', tone: 'info' },
      { label: 'Overdue', value: 0, caption: 'Past deadline', tone: 'warning' },
      { label: 'Completed', value: 0, caption: 'This month' },
    ],
    sections: [
      {
        title: 'All Tasks',
        searchable: true,
        columns: ['Task', 'Assignee', 'Priority', 'Due', 'Status'],
        empty: { icon: 'ListTodo', title: 'No tasks created' },
      },
    ],
  },
  {
    id: '232',
    route: '/tools',
    title: 'Tools',
    subtitle: 'Utility tools and calculators',
    icon: 'Hammer',
    stats: [
      { label: 'Tools', value: 0, caption: 'Available', highlight: true },
      { label: 'Used Today', value: 0, caption: 'Sessions', tone: 'info' },
      { label: 'Favourites', value: 0, caption: 'Bookmarked' },
      { label: 'Recently Added', value: 0, caption: 'New tools' },
    ],
    sections: [
      {
        title: 'Available Tools',
        searchable: true,
        columns: ['Tool', 'Category', 'Description', 'Usage'],
        empty: { icon: 'Hammer', title: 'No tools available' },
      },
    ],
  },
  {
    id: '233',
    route: '/dashboard-widgets',
    title: 'Dashboard Widgets',
    subtitle: 'Customise your dashboard with drag-and-drop widgets',
    icon: 'LayoutGrid',
    action: { label: 'Add Widget', icon: 'Plus' },
    stats: [
      { label: 'Widgets', value: 0, caption: 'Available', highlight: true },
      { label: 'Active', value: 0, caption: 'On your dashboard', tone: 'info' },
      { label: 'Custom', value: 0, caption: 'User-created' },
      { label: 'Shared', value: 0, caption: 'From team' },
    ],
    sections: [
      {
        title: 'Widget Gallery',
        searchable: true,
        columns: ['Widget', 'Category', 'Description', 'Status'],
        empty: { icon: 'LayoutGrid', title: 'No widgets available' },
      },
    ],
  },
  {
    id: '234',
    route: '/sms-integration',
    title: 'SMS Integration',
    subtitle: 'SMS gateway configuration and message logs',
    icon: 'Smartphone',
    stats: [
      { label: 'Messages Sent', value: 0, caption: 'This month', highlight: true },
      { label: 'Delivered', value: '0%', caption: 'Success rate', tone: 'info' },
      { label: 'Failed', value: 0, caption: 'This month', tone: 'warning' },
      { label: 'Credits', value: 0, caption: 'Remaining' },
    ],
    sections: [
      {
        title: 'Message Log',
        searchable: true,
        columns: ['To', 'Content', 'Type', 'Sent', 'Status'],
        empty: { icon: 'Smartphone', title: 'No SMS messages sent' },
      },
    ],
  },
  {
    id: '235',
    route: '/sales-guide',
    title: 'Sales Guide',
    subtitle: 'Service pricing guide and upselling recommendations',
    icon: 'BookMarked',
    stats: [
      { label: 'Services', value: 0, caption: 'In guide', highlight: true },
      { label: 'Packages', value: 0, caption: 'Bundle offers', tone: 'info' },
      { label: 'Upsell Scripts', value: 0, caption: 'Available' },
      { label: 'Last Updated', value: '—', caption: 'Guide revision' },
    ],
    sections: [
      {
        title: 'Service Catalogue',
        searchable: true,
        columns: ['Service', 'Category', 'Price', 'Upsell Opportunity'],
        empty: { icon: 'BookMarked', title: 'No services in the guide' },
      },
    ],
  },
]

/** route → definition, for the router. */
export const FEATURE_DEF_BY_ROUTE = new Map(FEATURE_DEFS.map((def) => [def.route, def]))
