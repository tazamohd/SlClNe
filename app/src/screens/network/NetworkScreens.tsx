import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

// ─── Suppliers ────────────────────────────────────────────────────────────────

interface SupplierRow {
  supplier: string
  category: string
  contact: string
  leadTime: string
  status: 'active' | 'on-hold' | 'new'
}

const SUPPLIER_TABS = [
  { id: 'all', label: 'All', icon: 'Building2' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'on-hold', label: 'On Hold', icon: 'AlertCircle' },
  { id: 'new', label: 'New', icon: 'PlusCircle' },
] as const

const DEMO_SUPPLIERS: readonly SupplierRow[] = []

function SupplierStatusBadge({ status }: { status: SupplierRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'on-hold':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('On Hold')}
        </Badge>
      )
    case 'new':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('New')}
        </Badge>
      )
  }
}

export function Suppliers() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SUPPLIER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SupplierRow[] = DEMO_SUPPLIERS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.supplier, r.category, r.contact].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Suppliers', value: 0, caption: 'On file', highlight: true },
    { label: 'Active', value: 0, caption: 'Trading', tone: 'info' },
    { label: 'On Hold', value: 0, caption: 'Suspended', tone: 'warning' },
    { label: 'Avg Lead Time', value: '0d', caption: 'To delivery' },
  ]

  const columns: Column<SupplierRow>[] = [
    { header: 'Supplier', cell: (r) => <span className="font-medium text-heading">{r.supplier}</span> },
    { header: 'Category', cell: (r) => r.category },
    { header: 'Contact', cell: (r) => r.contact },
    { header: 'Lead Time', cell: (r) => r.leadTime },
    { header: 'Status', cell: (r) => <SupplierStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Suppliers')}
        subtitle={t('Database of vendors and parts suppliers')}
      />

      <TabBar tabs={SUPPLIER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Supplier Directory')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search suppliers...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.supplier}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.supplier} trailing={<SupplierStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Category')}>{r.category}</MobileCardRow>
              <MobileCardRow label={t('Contact')}>{r.contact}</MobileCardRow>
              <MobileCardRow label={t('Lead Time')}>{r.leadTime}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Building2"
              title={t('No suppliers on file yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

interface PurchaseOrderRow {
  poNumber: string
  supplier: string
  items: number
  total: string
  status: 'open' | 'delivered' | 'cancelled'
}

const PURCHASE_ORDER_TABS = [
  { id: 'all', label: 'All', icon: 'ShoppingCart' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'delivered', label: 'Delivered', icon: 'CheckCircle' },
  { id: 'cancelled', label: 'Cancelled', icon: 'XCircle' },
] as const

const DEMO_PURCHASE_ORDERS: readonly PurchaseOrderRow[] = []

function PurchaseOrderStatusBadge({ status }: { status: PurchaseOrderRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'delivered':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Delivered')}
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Cancelled')}
        </Badge>
      )
  }
}

export function PurchaseOrders() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PURCHASE_ORDER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly PurchaseOrderRow[] = DEMO_PURCHASE_ORDERS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.poNumber, r.supplier].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Orders', value: 0, caption: 'In progress', highlight: true },
    { label: 'Awaiting Delivery', value: 0, caption: 'Dispatched', tone: 'info' },
    { label: 'Overdue', value: 0, caption: 'Past due date', tone: 'warning' },
    { label: 'Committed Value', value: 'SAR 0.00', caption: 'Open orders' },
  ]

  const columns: Column<PurchaseOrderRow>[] = [
    { header: 'PO Number', cell: (r) => <span className="font-medium text-heading">{r.poNumber}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Items', cell: (r) => r.items },
    { header: 'Total', cell: (r) => r.total },
    { header: 'Status', cell: (r) => <PurchaseOrderStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Purchase Orders')}
        subtitle={t('Generating and tracking orders to suppliers')}
      />

      <TabBar tabs={PURCHASE_ORDER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Purchase Orders')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search orders...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.poNumber}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.poNumber} trailing={<PurchaseOrderStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Items')}>{r.items}</MobileCardRow>
              <MobileCardRow label={t('Total')}>{r.total}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ShoppingCart"
              title={t('No purchase orders raised yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Vendor Supplier Portal ───────────────────────────────────────────────────

interface VendorPortalRow {
  vendor: string
  openQuotes: number
  openOrders: number
  lastActive: string
}

const VENDOR_PORTAL_TABS = [
  { id: 'all', label: 'All', icon: 'Building' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'inactive', label: 'Inactive', icon: 'Clock' },
  { id: 'pending', label: 'Pending', icon: 'AlertCircle' },
] as const

const DEMO_VENDOR_PORTAL: readonly VendorPortalRow[] = []

export function VendorSupplierPortal() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(VENDOR_PORTAL_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly VendorPortalRow[] = DEMO_VENDOR_PORTAL
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.vendor].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Registered Vendors', value: 0, caption: 'With access', highlight: true },
    { label: 'Open Quote Requests', value: 0, caption: 'Awaiting response', tone: 'warning' },
    { label: 'Orders To Confirm', value: 0, caption: 'Pending vendor', tone: 'info' },
    { label: 'Active This Week', value: 0, caption: 'Logged in' },
  ]

  const columns: Column<VendorPortalRow>[] = [
    { header: 'Vendor', cell: (r) => <span className="font-medium text-heading">{r.vendor}</span> },
    { header: 'Open Quotes', cell: (r) => r.openQuotes },
    { header: 'Open Orders', cell: (r) => r.openOrders },
    { header: 'Last Active', cell: (r) => r.lastActive },
  ]

  return (
    <>
      <FeatureHeader
        icon="Building"
        title={t('Vendor Supplier Portal')}
        subtitle={t('Extranet for suppliers to manage orders and quotes')}
      />

      <TabBar tabs={VENDOR_PORTAL_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Vendor Activity')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.vendor}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.vendor} />
              <MobileCardRow label={t('Open Quotes')}>{r.openQuotes}</MobileCardRow>
              <MobileCardRow label={t('Open Orders')}>{r.openOrders}</MobileCardRow>
              <MobileCardRow label={t('Last Active')}>{r.lastActive}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Building"
              title={t('No vendor portal activity yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Parts Marketplace ────────────────────────────────────────────────────────

interface MarketplaceRow {
  part: string
  seller: string
  condition: string
  price: string
  status: 'for-sale' | 'wanted' | 'sold'
}

const MARKETPLACE_TABS = [
  { id: 'all', label: 'All', icon: 'Store' },
  { id: 'for-sale', label: 'For Sale', icon: 'Tag' },
  { id: 'wanted', label: 'Wanted', icon: 'Search' },
  { id: 'sold', label: 'Sold', icon: 'CheckCircle' },
] as const

const DEMO_MARKETPLACE: readonly MarketplaceRow[] = []

function MarketplaceStatusBadge({ status }: { status: MarketplaceRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'for-sale':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('For Sale')}
        </Badge>
      )
    case 'wanted':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Wanted')}
        </Badge>
      )
    case 'sold':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Sold')}
        </Badge>
      )
  }
}

export function PartsMarketplace() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(MARKETPLACE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly MarketplaceRow[] = DEMO_MARKETPLACE
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.part, r.seller, r.condition].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Listings', value: 0, caption: 'For sale', highlight: true },
    { label: 'Open Offers', value: 0, caption: 'Awaiting reply', tone: 'info' },
    { label: 'Sold This Month', value: 0, caption: 'Completed' },
    { label: 'Expiring Soon', value: 0, caption: 'Listings ending', tone: 'warning' },
  ]

  const columns: Column<MarketplaceRow>[] = [
    { header: 'Part', cell: (r) => <span className="font-medium text-heading">{r.part}</span> },
    { header: 'Seller', cell: (r) => r.seller },
    { header: 'Condition', cell: (r) => r.condition },
    { header: 'Price', cell: (r) => r.price },
    { header: 'Status', cell: (r) => <MarketplaceStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Store"
        title={t('Parts Marketplace')}
        subtitle={t('B2B portal for buying and selling parts with other garages')}
      />

      <TabBar tabs={MARKETPLACE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Marketplace Listings')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search listings...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.part}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.part} trailing={<MarketplaceStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Seller')}>{r.seller}</MobileCardRow>
              <MobileCardRow label={t('Condition')}>{r.condition}</MobileCardRow>
              <MobileCardRow label={t('Price')}>{r.price}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Store"
              title={t('No marketplace listings yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Dynamic Pricing ──────────────────────────────────────────────────────────

interface DynamicPricingRow {
  rule: string
  appliesTo: string
  adjustment: string
  floor: string
  status: 'active' | 'paused' | 'draft'
}

const DYNAMIC_PRICING_TABS = [
  { id: 'all', label: 'All', icon: 'Percent' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'paused', label: 'Paused', icon: 'PauseCircle' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
] as const

const DEMO_DYNAMIC_PRICING: readonly DynamicPricingRow[] = []

function DynamicPricingStatusBadge({ status }: { status: DynamicPricingRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'paused':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Paused')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Draft')}
        </Badge>
      )
  }
}

export function DynamicPricing() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(DYNAMIC_PRICING_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly DynamicPricingRow[] = DEMO_DYNAMIC_PRICING
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.rule, r.appliesTo].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Rules Active', value: 0, caption: 'Enabled', highlight: true },
    { label: 'Items Repriced', value: 0, caption: 'This week', tone: 'info' },
    { label: 'Margin Impact', value: '0%', caption: 'Versus base' },
    { label: 'Below Floor', value: 0, caption: 'Blocked changes', tone: 'warning' },
  ]

  const columns: Column<DynamicPricingRow>[] = [
    { header: 'Rule', cell: (r) => <span className="font-medium text-heading">{r.rule}</span> },
    { header: 'Applies To', cell: (r) => r.appliesTo },
    { header: 'Adjustment', cell: (r) => r.adjustment },
    { header: 'Floor', cell: (r) => r.floor },
    { header: 'Status', cell: (r) => <DynamicPricingStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Percent"
        title={t('Dynamic Pricing')}
        subtitle={t('Algorithmic pricing for parts and labour')}
      />

      <TabBar tabs={DYNAMIC_PRICING_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Pricing Rules')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.rule}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.rule} trailing={<DynamicPricingStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Applies To')}>{r.appliesTo}</MobileCardRow>
              <MobileCardRow label={t('Adjustment')}>{r.adjustment}</MobileCardRow>
              <MobileCardRow label={t('Floor')}>{r.floor}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Percent"
              title={t('No pricing rules configured')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Intelligent Price Optimizer ──────────────────────────────────────────────

interface PriceOptimizerRow {
  item: string
  current: string
  market: string
  recommended: string
  status: 'pending' | 'applied' | 'dismissed'
}

const PRICE_OPTIMIZER_TABS = [
  { id: 'all', label: 'All', icon: 'Target' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
  { id: 'applied', label: 'Applied', icon: 'CheckCircle' },
  { id: 'dismissed', label: 'Dismissed', icon: 'XCircle' },
] as const

const DEMO_PRICE_OPTIMIZER: readonly PriceOptimizerRow[] = []

function PriceOptimizerStatusBadge({ status }: { status: PriceOptimizerRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'pending':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Pending')}
        </Badge>
      )
    case 'applied':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Applied')}
        </Badge>
      )
    case 'dismissed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Dismissed')}
        </Badge>
      )
  }
}

export function IntelligentPriceOptimizer() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PRICE_OPTIMIZER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly PriceOptimizerRow[] = DEMO_PRICE_OPTIMIZER
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.item, r.current, r.market].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Items Analysed', value: 0, caption: 'With market data', highlight: true },
    { label: 'Recommended Changes', value: 0, caption: 'Awaiting review', tone: 'warning' },
    { label: 'Applied', value: 0, caption: 'This month', tone: 'info' },
    { label: 'Projected Uplift', value: 'SAR 0.00', caption: 'Monthly' },
  ]

  const columns: Column<PriceOptimizerRow>[] = [
    { header: 'Item', cell: (r) => <span className="font-medium text-heading">{r.item}</span> },
    { header: 'Current', cell: (r) => r.current },
    { header: 'Market', cell: (r) => r.market },
    { header: 'Recommended', cell: (r) => r.recommended },
    { header: 'Status', cell: (r) => <PriceOptimizerStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Target"
        title={t('Intelligent Price Optimizer')}
        subtitle={t('AI-optimized pricing based on market data')}
      />

      <TabBar tabs={PRICE_OPTIMIZER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Price Recommendations')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search recommendations...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.item}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.item} trailing={<PriceOptimizerStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Current')}>{r.current}</MobileCardRow>
              <MobileCardRow label={t('Market')}>{r.market}</MobileCardRow>
              <MobileCardRow label={t('Recommended')}>{r.recommended}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Target"
              title={t('Not enough market data yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Parts Network Dashboard ──────────────────────────────────────────────────

interface NetworkDashboardRow {
  request: string
  from: string
  part: string
  quotes: number
  status: 'open' | 'fulfilled' | 'expired'
}

const NETWORK_DASHBOARD_TABS = [
  { id: 'all', label: 'All', icon: 'Network' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'fulfilled', label: 'Fulfilled', icon: 'CheckCircle' },
  { id: 'expired', label: 'Expired', icon: 'XCircle' },
] as const

const DEMO_NETWORK_DASHBOARD: readonly NetworkDashboardRow[] = []

function NetworkDashboardStatusBadge({ status }: { status: NetworkDashboardRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'fulfilled':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Fulfilled')}
        </Badge>
      )
    case 'expired':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Expired')}
        </Badge>
      )
  }
}

export function PartsNetworkDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(NETWORK_DASHBOARD_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly NetworkDashboardRow[] = DEMO_NETWORK_DASHBOARD
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.request, r.from, r.part].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Network Members', value: 0, caption: 'Connected garages', highlight: true },
    { label: 'Open Requests', value: 0, caption: 'Across network', tone: 'info' },
    { label: 'Fulfilled', value: 0, caption: 'This month' },
    { label: 'Unanswered', value: 0, caption: 'Needs response', tone: 'warning' },
  ]

  const columns: Column<NetworkDashboardRow>[] = [
    { header: 'Request', cell: (r) => <span className="font-medium text-heading">{r.request}</span> },
    { header: 'From', cell: (r) => r.from },
    { header: 'Part', cell: (r) => r.part },
    { header: 'Quotes', cell: (r) => r.quotes },
    { header: 'Status', cell: (r) => <NetworkDashboardStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Network Dashboard')}
        subtitle={t('Overview of B2B parts network activity')}
      />

      <TabBar tabs={NETWORK_DASHBOARD_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Network Activity')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.request}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.request} trailing={<NetworkDashboardStatusBadge status={r.status} />} />
              <MobileCardRow label={t('From')}>{r.from}</MobileCardRow>
              <MobileCardRow label={t('Part')}>{r.part}</MobileCardRow>
              <MobileCardRow label={t('Quotes')}>{r.quotes}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Network"
              title={t('No network activity yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── My Network Requests ──────────────────────────────────────────────────────

interface MyNetworkRequestRow {
  request: string
  part: string
  quotes: number
  bestPrice: string
  status: 'open' | 'quoted' | 'accepted'
}

const MY_NETWORK_REQUEST_TABS = [
  { id: 'all', label: 'All', icon: 'Send' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'quoted', label: 'Quoted', icon: 'FileText' },
  { id: 'accepted', label: 'Accepted', icon: 'CheckCircle' },
] as const

const DEMO_MY_NETWORK_REQUESTS: readonly MyNetworkRequestRow[] = []

function MyNetworkRequestStatusBadge({ status }: { status: MyNetworkRequestRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'quoted':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Quoted')}
        </Badge>
      )
    case 'accepted':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Accepted')}
        </Badge>
      )
  }
}

export function MyNetworkRequests() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(MY_NETWORK_REQUEST_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly MyNetworkRequestRow[] = DEMO_MY_NETWORK_REQUESTS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.request, r.part, r.bestPrice].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Requests', value: 0, caption: 'Awaiting quotes', highlight: true },
    { label: 'Quotes Received', value: 0, caption: 'To review', tone: 'info' },
    { label: 'Accepted', value: 0, caption: 'This month' },
    { label: 'Expired', value: 0, caption: 'No response', tone: 'warning' },
  ]

  const columns: Column<MyNetworkRequestRow>[] = [
    { header: 'Request', cell: (r) => <span className="font-medium text-heading">{r.request}</span> },
    { header: 'Part', cell: (r) => r.part },
    { header: 'Quotes', cell: (r) => r.quotes },
    { header: 'Best Price', cell: (r) => r.bestPrice },
    { header: 'Status', cell: (r) => <MyNetworkRequestStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('My Network Requests')}
        subtitle={t('Tracking sent requests and received quotes')}
      />

      <TabBar tabs={MY_NETWORK_REQUEST_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Sent Requests')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.request}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.request} trailing={<MyNetworkRequestStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Part')}>{r.part}</MobileCardRow>
              <MobileCardRow label={t('Quotes')}>{r.quotes}</MobileCardRow>
              <MobileCardRow label={t('Best Price')}>{r.bestPrice}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Send"
              title={t('You have not sent any requests yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Incoming Network Requests ────────────────────────────────────────────────

interface IncomingRequestRow {
  request: string
  from: string
  part: string
  qty: number
  status: 'new' | 'quoted' | 'won' | 'lost'
}

const INCOMING_REQUEST_TABS = [
  { id: 'all', label: 'All', icon: 'Inbox' },
  { id: 'new', label: 'New', icon: 'AlertCircle' },
  { id: 'quoted', label: 'Quoted', icon: 'FileText' },
  { id: 'won', label: 'Won', icon: 'CheckCircle' },
] as const

const DEMO_INCOMING_REQUESTS: readonly IncomingRequestRow[] = []

function IncomingRequestStatusBadge({ status }: { status: IncomingRequestRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'new':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('New')}
        </Badge>
      )
    case 'quoted':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Quoted')}
        </Badge>
      )
    case 'won':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Won')}
        </Badge>
      )
    case 'lost':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Lost')}
        </Badge>
      )
  }
}

export function IncomingNetworkRequests() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(INCOMING_REQUEST_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly IncomingRequestRow[] = DEMO_INCOMING_REQUESTS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.request, r.from, r.part].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'New Requests', value: 0, caption: 'Awaiting quote', highlight: true },
    { label: 'Quoted', value: 0, caption: 'Response sent', tone: 'info' },
    { label: 'Won', value: 0, caption: 'This month' },
    { label: 'Expiring', value: 0, caption: 'Respond soon', tone: 'warning' },
  ]

  const columns: Column<IncomingRequestRow>[] = [
    { header: 'Request', cell: (r) => <span className="font-medium text-heading">{r.request}</span> },
    { header: 'From', cell: (r) => r.from },
    { header: 'Part', cell: (r) => r.part },
    { header: 'Qty', cell: (r) => r.qty },
    { header: 'Status', cell: (r) => <IncomingRequestStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Inbox"
        title={t('Incoming Network Requests')}
        subtitle={t('Managing requests from other network members')}
      />

      <TabBar tabs={INCOMING_REQUEST_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Incoming Requests')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.request}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.request} trailing={<IncomingRequestStatusBadge status={r.status} />} />
              <MobileCardRow label={t('From')}>{r.from}</MobileCardRow>
              <MobileCardRow label={t('Part')}>{r.part}</MobileCardRow>
              <MobileCardRow label={t('Qty')}>{r.qty}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Inbox"
              title={t('No incoming requests')}
            />
          }
        />
      </Section>
    </>
  )
}
