/** Demo notifications, the rows `NotificationCenter` used to hold as a local
 *  array. Moved here so the bell badge, the centre and the customer app read
 *  one collection through the seam and agree on the unread count.
 *
 *  Client-local for now: no API endpoint serves notifications yet, so the
 *  fixture backs this collection in both modes (see `CLIENT_LOCAL` in
 *  `repository.ts`). Marking one read persists for the session, like every
 *  other fixture write. */
export type NotificationKind = 'jobs' | 'appointments' | 'alerts' | 'finance'

export interface NotificationRow {
  id: string
  kind: NotificationKind
  icon: string
  /** English source string, translated at render. */
  title: string
  /** Free text; identifiers inside are Latin runs the screen pins LTR. */
  body: string
  /** Route the notification opens. */
  route?: string
  /** ISO timestamp; `null` while unread. */
  readAt: string | null
  createdAt: string
}

const NOW = Date.parse('2026-07-26T09:00:00+03:00')
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString()

export const NOTIFICATIONS_SEED: readonly NotificationRow[] = [
  { id: 'ntf-001', kind: 'jobs', icon: 'Wrench', title: 'New Job Card Created', body: 'JC-E5D7A3B5 — Sara Al-Mutairi · Ford Explorer 2022', route: '/job-detail?id=JC-E5D7A3B5', readAt: null, createdAt: ago(1) },
  { id: 'ntf-002', kind: 'appointments', icon: 'Calendar', title: 'Appointment Confirmed', body: 'Ahmed Al-Rashid — Maintenance · Jul 23, 9:00 AM', route: '/appointments', readAt: null, createdAt: ago(5) },
  { id: 'ntf-003', kind: 'alerts', icon: 'AlertTriangle', title: 'Invoice Overdue', body: 'INV-2026-0141 — Fatima Al-Zahrani · SAR 4,250', route: '/invoice-detail?id=INV-2026-0141', readAt: null, createdAt: ago(120) },
  { id: 'ntf-004', kind: 'alerts', icon: 'Package', title: 'Low Stock Alert', body: 'Brake Pads (Front) — 18/25 In Stock', route: '/inventory', readAt: null, createdAt: ago(180) },
  { id: 'ntf-005', kind: 'finance', icon: 'CreditCard', title: 'Payment Received', body: 'INV-2026-0140 — Omar Al-Ghamdi · SAR 620', route: '/payments', readAt: ago(60 * 20), createdAt: ago(60 * 26) },
  { id: 'ntf-006', kind: 'jobs', icon: 'FileCheck', title: 'Estimate Approved', body: 'EST-0230 — Mohammed Hassan · SAR 3,600', route: '/estimates', readAt: ago(60 * 20), createdAt: ago(60 * 30) },
  { id: 'ntf-007', kind: 'jobs', icon: 'ShieldCheck', title: 'QC Passed', body: 'JC-C2A9F4E3 — Omar Al-Ghamdi · Hyundai Sonata 2023', route: '/job-detail?id=JC-C2A9F4E3', readAt: ago(60 * 40), createdAt: ago(60 * 48) },
  { id: 'ntf-008', kind: 'jobs', icon: 'Car', title: 'Vehicle Ready', body: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry 2022', route: '/job-detail?id=A3F8B2C1', readAt: ago(60 * 40), createdAt: ago(60 * 50) },
]
