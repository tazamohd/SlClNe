/** Parts-network and procurement fixtures.
 *
 *  These live in the design files' component scripts rather than in
 *  `gms-data.js`, so the port script can't generate them — they're transcribed
 *  here by hand from the `.dc.html` sources and typed the same way the
 *  generated tables are. Move them into `gms-data.js` upstream and the
 *  generator will pick them up instead. */

export interface PartRequest {
  part: string
  priority: 'urgent' | 'normal' | 'low'
  /** "RFQ-2025-001 · 04465-33450 · Toyota" */
  reference: string
  vehicle: string
  qty: string
  /** Suppliers the request reached. */
  reach: string
  quotes: string
  status: 'open' | 'reviewing' | 'ordered'
  date: string
  unread: string
}

/** Source: PartsNetwork.Requests.dc.html */
export const PART_REQUESTS: readonly PartRequest[] = [
  {
    part: 'Front Brake Pads Set',
    priority: 'urgent',
    reference: 'RFQ-2025-001 · 04465-33450 · Toyota',
    vehicle: 'Toyota Camry 2022',
    qty: '4',
    reach: '12',
    quotes: '2',
    status: 'open',
    date: 'Jan 15, 2025',
    unread: '3',
  },
  {
    part: 'Oil Filter',
    priority: 'normal',
    reference: 'RFQ-2025-002 · Honda',
    vehicle: 'Honda Accord 2021',
    qty: '6',
    reach: '18',
    quotes: '5',
    status: 'reviewing',
    date: 'Jan 14, 2025',
    unread: '2',
  },
  {
    part: 'Alternator Assembly',
    priority: 'low',
    reference: 'RFQ-2025-003 · 23100-28041 · Nissan',
    vehicle: 'Nissan Altima 2020',
    qty: '3',
    reach: '8',
    quotes: '1',
    status: 'ordered',
    date: 'Jan 13, 2025',
    unread: '0',
  },
]

export interface PartOrder {
  part: string
  status: 'processing' | 'shipped' | 'delivered'
  reference: string
  supplier: string
  city: string
  method: 'Delivery' | 'Pickup'
  eta: string
  tracking: string
  total: string
  breakdown: string
  payment: 'paid' | 'pending'
}

/** Source: PartsNetwork.Orders.dc.html */
export const PART_ORDERS: readonly PartOrder[] = [
  {
    part: 'Front Brake Pads Set',
    status: 'shipped',
    reference: 'ORD-2025-001 · 04465-33450',
    supplier: 'Al-Faisal Auto Parts',
    city: 'Riyadh',
    method: 'Delivery',
    eta: 'Jan 18',
    tracking: 'SA123456789',
    total: '525.00',
    breakdown: '2 × 250.00',
    payment: 'paid',
  },
  {
    part: 'Oil Filter',
    status: 'delivered',
    reference: 'ORD-2025-002 · 15400-RTA-003',
    supplier: 'Parts Hub KSA',
    city: 'Dammam',
    method: 'Pickup',
    eta: 'Jan 14',
    tracking: '',
    total: '225.00',
    breakdown: '5 × 45.00',
    payment: 'paid',
  },
  {
    part: 'Alternator Assembly',
    status: 'processing',
    reference: 'ORD-2025-003 · 23100-28041',
    supplier: 'Saudi Parts Company',
    city: 'Jeddah',
    method: 'Delivery',
    eta: '',
    tracking: '',
    total: '900.00',
    breakdown: '1 × 850.00',
    payment: 'pending',
  },
]

export interface NetworkMember {
  name: string
  ar: string
  initials: string
  kind: 'supplier' | 'dealer' | 'store' | 'garage'
  city: string
  rating: string
  deals: string
  /** Fulfilment rate; blank where the design had none. */
  fulfilment: string
  brands: readonly string[]
  phone: string
}

/** Source: PartsNetwork.Members.dc.html */
export const NETWORK_MEMBERS: readonly NetworkMember[] = [
  {
    name: 'Al-Faisal Auto Parts',
    ar: 'قطع غيار الفيصل',
    initials: 'AL',
    kind: 'supplier',
    city: 'Riyadh',
    rating: '4.8',
    deals: '156',
    fulfilment: '95%',
    brands: ['Toyota', 'Honda', 'Nissan'],
    phone: '+966 50 123 4567',
  },
  {
    name: 'Saudi Parts Company',
    ar: 'شركة القطع السعودية',
    initials: 'SA',
    kind: 'dealer',
    city: 'Jeddah',
    rating: '4.5',
    deals: '89',
    fulfilment: '88%',
    brands: ['Mercedes-Benz', 'BMW', 'Audi'],
    phone: '+966 55 987 6543',
  },
  {
    name: 'Eastern Auto Warehouse',
    ar: 'مستودع الشرقية للسيارات',
    initials: 'EA',
    kind: 'store',
    city: 'Dammam',
    rating: '4.2',
    deals: '45',
    fulfilment: '82%',
    brands: ['Hyundai', 'Kia', 'Chevrolet'],
    phone: '+966 53 456 7890',
  },
  {
    name: 'Premium Auto Services',
    ar: 'خدمات بريميوم للسيارات',
    initials: 'PR',
    kind: 'garage',
    city: 'Riyadh',
    rating: '4.6',
    deals: '78',
    fulfilment: '',
    brands: ['Toyota', 'Lexus'],
    phone: '+966 56 789 0123',
  },
]

export interface Requisition {
  status: 'pending' | 'approved' | 'converted' | 'rejected'
  id: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  what: string
  from: string
  age: string
  /** SAR amount as a number so it formats like every other amount. */
  amount: number
}

/** Source: ProcurementPortal.Requisitions.dc.html */
export const REQUISITIONS: readonly Requisition[] = [
  {
    status: 'pending',
    id: 'REQ-0518',
    priority: 'urgent',
    what: 'Brake Pads (Front) ×40 — stock below reorder',
    from: 'Riyadh Main · Inventory',
    age: '2 hours ago',
    amount: 12400,
  },
  {
    status: 'pending',
    id: 'REQ-0517',
    priority: 'high',
    what: 'Diagnostic scanner — workshop equipment',
    from: 'Jeddah Branch · Workshop',
    age: '5 hours ago',
    amount: 28000,
  },
  {
    status: 'pending',
    id: 'REQ-0515',
    priority: 'medium',
    what: 'Oil Filter (Toyota) ×120 — routine restock',
    from: 'Riyadh North · Inventory',
    age: 'Yesterday',
    amount: 5400,
  },
  {
    status: 'pending',
    id: 'REQ-0512',
    priority: 'low',
    what: 'Office supplies — quarterly order',
    from: 'Head Office · Administration',
    age: '2 days',
    amount: 1850,
  },
  {
    status: 'approved',
    id: 'REQ-0509',
    priority: 'high',
    what: 'Battery 12V ×24',
    from: 'Jeddah Branch · Inventory',
    age: 'Jul 21',
    amount: 9120,
  },
]

/** Priority palette. Urgent and high take the warning orange; medium and low
 *  sit on the blue scale (README §7 — no red, no green). */
export const PRIORITY_TONE: Record<string, readonly [string, string]> = {
  urgent: ['var(--tint-orange)', 'var(--salis-orange)'],
  high: ['var(--tint-orange)', 'var(--salis-orange)'],
  normal: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  medium: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  low: ['var(--tint-blue)', 'var(--salis-blue)'],
}

/** Request / order lifecycle palette. */
export const NETWORK_STATUS: Record<string, readonly [string, string]> = {
  open: ['var(--tint-blue)', 'var(--salis-blue)'],
  reviewing: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  ordered: ['var(--tint-navy)', 'var(--salis-navy)'],
  processing: ['var(--tint-orange)', 'var(--salis-orange)'],
  shipped: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  delivered: ['var(--tint-blue)', 'var(--salis-blue)'],
  pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  approved: ['var(--tint-blue)', 'var(--salis-blue)'],
  converted: ['var(--tint-navy)', 'var(--salis-navy)'],
  rejected: ['var(--tint-neutral)', 'var(--text-muted)'],
  paid: ['var(--tint-blue)', 'var(--salis-blue)'],
}
