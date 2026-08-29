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

// ─── Purchase Agent Dashboard ─────────────────────────────────────────────────

interface PurchaseAgentRow {
  task: string
  reference: string
  supplier: string
  due: string
  status: 'urgent' | 'pending' | 'done'
}

const PURCHASE_AGENT_TABS = [
  { id: 'all', label: 'All', icon: 'LayoutDashboard' },
  { id: 'urgent', label: 'Urgent', icon: 'AlertCircle' },
  { id: 'today', label: 'Today', icon: 'Clock' },
  { id: 'this-week', label: 'This Week', icon: 'Calendar' },
] as const

const DEMO_PURCHASE_AGENT: readonly PurchaseAgentRow[] = []

function PurchaseAgentStatusBadge({ status }: { status: PurchaseAgentRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'urgent':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Urgent')}
        </Badge>
      )
    case 'pending':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Pending')}
        </Badge>
      )
    case 'done':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Done')}
        </Badge>
      )
  }
}

export function PurchaseAgentDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PURCHASE_AGENT_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly PurchaseAgentRow[] = DEMO_PURCHASE_AGENT
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.task, r.reference, r.supplier].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Open Tasks', value: 0, caption: 'Assigned to you', highlight: true },
    { label: 'Quotes To Review', value: 0, caption: 'Awaiting decision', tone: 'warning' },
    { label: 'Orders In Transit', value: 0, caption: 'Inbound', tone: 'info' },
    { label: 'Saved This Month', value: 'SAR 0.00', caption: 'Versus list price' },
  ]

  const columns: Column<PurchaseAgentRow>[] = [
    { header: 'Task', cell: (r) => <span className="font-medium text-heading">{r.task}</span> },
    { header: 'Reference', cell: (r) => r.reference },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <PurchaseAgentStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="LayoutDashboard"
        title={t('Purchase Agent Dashboard')}
        subtitle={t('Primary workspace for procurement agents')}
      />

      <TabBar tabs={PURCHASE_AGENT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Priority Queue')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.task}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.task} trailing={<PurchaseAgentStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Reference')}>{r.reference}</MobileCardRow>
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ListChecks"
              title={t('No priority tasks right now')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Procurement Tasks ────────────────────────────────────────────────────────

interface ProcurementTaskRow {
  task: string
  relatedTo: string
  priority: string
  due: string
  status: 'open' | 'in-progress' | 'completed'
}

const PROCUREMENT_TASK_TABS = [
  { id: 'all', label: 'All', icon: 'ListChecks' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'due-today', label: 'Due Today', icon: 'AlertCircle' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
] as const

const DEMO_PROCUREMENT_TASKS: readonly ProcurementTaskRow[] = []

function ProcurementTaskStatusBadge({ status }: { status: ProcurementTaskRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Open')}
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Progress')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
  }
}

export function ProcurementTasks() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PROCUREMENT_TASK_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ProcurementTaskRow[] = DEMO_PROCUREMENT_TASKS
    if (tab !== 'all') {
      const statusMap: Record<string, ProcurementTaskRow['status'][]> = {
        open: ['open'],
        'due-today': ['open', 'in-progress'],
        completed: ['completed'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((r) => statuses.includes(r.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.task, r.relatedTo, r.priority].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Tasks', value: 0, caption: 'To do', highlight: true },
    { label: 'Due Today', value: 0, caption: 'Time-sensitive', tone: 'warning' },
    { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
    { label: 'Completed', value: 0, caption: 'This week' },
  ]

  const columns: Column<ProcurementTaskRow>[] = [
    { header: 'Task', cell: (r) => <span className="font-medium text-heading">{r.task}</span> },
    { header: 'Related To', cell: (r) => r.relatedTo },
    { header: 'Priority', cell: (r) => r.priority },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <ProcurementTaskStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ListChecks"
        title={t('Procurement Tasks')}
        subtitle={t('Task list for order processing and follow-ups')}
      />

      <TabBar tabs={PROCUREMENT_TASK_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Task List')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search tasks...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.task}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.task} trailing={<ProcurementTaskStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Related To')}>{r.relatedTo}</MobileCardRow>
              <MobileCardRow label={t('Priority')}>{r.priority}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ListChecks"
              title={t('No tasks assigned')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Quotations ───────────────────────────────────────────────────────────────

interface QuotationRow {
  quote: string
  supplier: string
  items: number
  total: string
  status: 'open' | 'received' | 'accepted' | 'expired'
}

const QUOTATION_TABS = [
  { id: 'all', label: 'All', icon: 'FileText' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'received', label: 'Received', icon: 'Inbox' },
  { id: 'accepted', label: 'Accepted', icon: 'CheckCircle' },
] as const

const DEMO_QUOTATIONS: readonly QuotationRow[] = []

function QuotationStatusBadge({ status }: { status: QuotationRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'received':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Received')}
        </Badge>
      )
    case 'accepted':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Accepted')}
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

export function Quotations() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(QUOTATION_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly QuotationRow[] = DEMO_QUOTATIONS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.quote, r.supplier].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Quotes', value: 0, caption: 'Awaiting response', highlight: true },
    { label: 'Received', value: 0, caption: 'To compare', tone: 'info' },
    { label: 'Accepted', value: 0, caption: 'This month' },
    { label: 'Expired', value: 0, caption: 'Past validity', tone: 'warning' },
  ]

  const columns: Column<QuotationRow>[] = [
    { header: 'Quote', cell: (r) => <span className="font-medium text-heading">{r.quote}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Items', cell: (r) => r.items },
    { header: 'Total', cell: (r) => r.total },
    { header: 'Status', cell: (r) => <QuotationStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Quotations')}
        subtitle={t('Managing and comparing vendor quotes')}
      />

      <TabBar tabs={QUOTATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Quotations')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search quotations...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.quote}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.quote} trailing={<QuotationStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Items')}>{r.items}</MobileCardRow>
              <MobileCardRow label={t('Total')}>{r.total}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileText"
              title={t('No quotations yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Supplier Payments ────────────────────────────────────────────────────────

interface SupplierPaymentRow {
  invoice: string
  supplier: string
  amount: string
  due: string
  status: 'due' | 'overdue' | 'paid'
}

const SUPPLIER_PAYMENT_TABS = [
  { id: 'all', label: 'All', icon: 'CreditCard' },
  { id: 'due', label: 'Due', icon: 'Clock' },
  { id: 'overdue', label: 'Overdue', icon: 'AlertCircle' },
  { id: 'paid', label: 'Paid', icon: 'CheckCircle' },
] as const

const DEMO_SUPPLIER_PAYMENTS: readonly SupplierPaymentRow[] = []

function SupplierPaymentStatusBadge({ status }: { status: SupplierPaymentRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'due':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Due')}
        </Badge>
      )
    case 'overdue':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Overdue')}
        </Badge>
      )
    case 'paid':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Paid')}
        </Badge>
      )
  }
}

export function SupplierPayments() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SUPPLIER_PAYMENT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SupplierPaymentRow[] = DEMO_SUPPLIER_PAYMENTS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.invoice, r.supplier, r.amount].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Due This Week', value: 'SAR 0.00', caption: 'Payable', highlight: true },
    { label: 'Overdue', value: 'SAR 0.00', caption: 'Past terms', tone: 'warning' },
    { label: 'Paid This Month', value: 'SAR 0.00', caption: 'Settled', tone: 'info' },
    { label: 'Pending Approval', value: 0, caption: 'Awaiting sign-off' },
  ]

  const columns: Column<SupplierPaymentRow>[] = [
    { header: 'Invoice', cell: (r) => <span className="font-medium text-heading">{r.invoice}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Amount', cell: (r) => r.amount },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <SupplierPaymentStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="CreditCard"
        title={t('Supplier Payments')}
        subtitle={t('Monitoring payments to suppliers')}
      />

      <TabBar tabs={SUPPLIER_PAYMENT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Payments')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search payments...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.invoice}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.invoice} trailing={<SupplierPaymentStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>{r.amount}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="CreditCard"
              title={t('No supplier payments due')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

interface DeliveryRow {
  order: string
  supplier: string
  items: number
  eta: string
  status: 'expected' | 'in-transit' | 'delayed' | 'received'
}

const DELIVERY_TABS = [
  { id: 'all', label: 'All', icon: 'Truck' },
  { id: 'today', label: 'Today', icon: 'Clock' },
  { id: 'in-transit', label: 'In Transit', icon: 'Truck' },
  { id: 'delayed', label: 'Delayed', icon: 'AlertCircle' },
] as const

const DEMO_DELIVERIES: readonly DeliveryRow[] = []

function DeliveryStatusBadge({ status }: { status: DeliveryRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'expected':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Expected')}
        </Badge>
      )
    case 'in-transit':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Transit')}
        </Badge>
      )
    case 'delayed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Delayed')}
        </Badge>
      )
    case 'received':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Received')}
        </Badge>
      )
  }
}

export function Deliveries() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(DELIVERY_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly DeliveryRow[] = DEMO_DELIVERIES
    if (tab !== 'all') {
      const statusMap: Record<string, DeliveryRow['status'][]> = {
        today: ['expected'],
        'in-transit': ['in-transit'],
        delayed: ['delayed'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((r) => statuses.includes(r.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.order, r.supplier].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Expected Today', value: 0, caption: 'Arriving', highlight: true },
    { label: 'In Transit', value: 0, caption: 'Dispatched', tone: 'info' },
    { label: 'Delayed', value: 0, caption: 'Past ETA', tone: 'warning' },
    { label: 'Received This Week', value: 0, caption: 'Booked in' },
  ]

  const columns: Column<DeliveryRow>[] = [
    { header: 'Order', cell: (r) => <span className="font-medium text-heading">{r.order}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Items', cell: (r) => r.items },
    { header: 'ETA', cell: (r) => r.eta },
    { header: 'Status', cell: (r) => <DeliveryStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Truck"
        title={t('Deliveries')}
        subtitle={t('Tracking incoming part deliveries')}
      />

      <TabBar tabs={DELIVERY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Incoming Deliveries')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.order}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.order} trailing={<DeliveryStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Items')}>{r.items}</MobileCardRow>
              <MobileCardRow label={t('ETA')}>{r.eta}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Truck"
              title={t('No deliveries expected')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Agent Orders ─────────────────────────────────────────────────────────────

interface AgentOrderRow {
  poNumber: string
  supplier: string
  items: number
  total: string
  status: 'draft' | 'confirmed' | 'received'
}

const AGENT_ORDER_TABS = [
  { id: 'all', label: 'All', icon: 'ShoppingCart' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
  { id: 'confirmed', label: 'Confirmed', icon: 'CheckCircle' },
  { id: 'received', label: 'Received', icon: 'Inbox' },
] as const

const DEMO_AGENT_ORDERS: readonly AgentOrderRow[] = []

function AgentOrderStatusBadge({ status }: { status: AgentOrderRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'draft':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Draft')}
        </Badge>
      )
    case 'confirmed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Confirmed')}
        </Badge>
      )
    case 'received':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Received')}
        </Badge>
      )
  }
}

export function AgentOrders() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AGENT_ORDER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly AgentOrderRow[] = DEMO_AGENT_ORDERS
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
    { label: 'Awaiting Approval', value: 0, caption: 'Draft', tone: 'warning' },
    { label: 'Confirmed', value: 0, caption: 'With supplier', tone: 'info' },
    { label: 'Value This Month', value: 'SAR 0.00', caption: 'Ordered' },
  ]

  const columns: Column<AgentOrderRow>[] = [
    { header: 'PO Number', cell: (r) => <span className="font-medium text-heading">{r.poNumber}</span> },
    { header: 'Supplier', cell: (r) => r.supplier },
    { header: 'Items', cell: (r) => r.items },
    { header: 'Total', cell: (r) => r.total },
    { header: 'Status', cell: (r) => <AgentOrderStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Agent Orders')}
        subtitle={t('Order management for purchase agents')}
      />

      <TabBar tabs={AGENT_ORDER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Orders')}
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
              <MobileCardHeader title={r.poNumber} trailing={<AgentOrderStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Supplier')}>{r.supplier}</MobileCardRow>
              <MobileCardRow label={t('Items')}>{r.items}</MobileCardRow>
              <MobileCardRow label={t('Total')}>{r.total}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ShoppingCart"
              title={t('No orders raised yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Agent Suppliers ──────────────────────────────────────────────────────────

interface AgentSupplierRow {
  supplier: string
  category: string
  rating: string
  leadTime: string
  status: 'preferred' | 'active' | 'under-review'
}

const AGENT_SUPPLIER_TABS = [
  { id: 'all', label: 'All', icon: 'Building2' },
  { id: 'preferred', label: 'Preferred', icon: 'Star' },
  { id: 'under-review', label: 'Under Review', icon: 'AlertCircle' },
  { id: 'new', label: 'New', icon: 'PlusCircle' },
] as const

const DEMO_AGENT_SUPPLIERS: readonly AgentSupplierRow[] = []

function AgentSupplierStatusBadge({ status }: { status: AgentSupplierRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'preferred':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Preferred')}
        </Badge>
      )
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'under-review':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Under Review')}
        </Badge>
      )
  }
}

export function AgentSuppliers() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AGENT_SUPPLIER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly AgentSupplierRow[] = DEMO_AGENT_SUPPLIERS
    if (tab !== 'all') {
      const statusMap: Record<string, AgentSupplierRow['status'][]> = {
        preferred: ['preferred'],
        'under-review': ['under-review'],
        new: ['active'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((r) => statuses.includes(r.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.supplier, r.category].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'My Suppliers', value: 0, caption: 'Assigned', highlight: true },
    { label: 'Preferred', value: 0, caption: 'Priority vendors', tone: 'info' },
    { label: 'Under Review', value: 0, caption: 'Performance concerns', tone: 'warning' },
    { label: 'Avg Rating', value: '0.0', caption: 'Out of 5' },
  ]

  const columns: Column<AgentSupplierRow>[] = [
    { header: 'Supplier', cell: (r) => <span className="font-medium text-heading">{r.supplier}</span> },
    { header: 'Category', cell: (r) => r.category },
    { header: 'Rating', cell: (r) => r.rating },
    { header: 'Lead Time', cell: (r) => r.leadTime },
    { header: 'Status', cell: (r) => <AgentSupplierStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Agent Suppliers')}
        subtitle={t('Supplier management interface for agents')}
      />

      <TabBar tabs={AGENT_SUPPLIER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Supplier List')}
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
              <MobileCardHeader title={r.supplier} trailing={<AgentSupplierStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Category')}>{r.category}</MobileCardRow>
              <MobileCardRow label={t('Rating')}>{r.rating}</MobileCardRow>
              <MobileCardRow label={t('Lead Time')}>{r.leadTime}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Building2"
              title={t('No suppliers assigned yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Agent Inventory View ─────────────────────────────────────────────────────

interface AgentInventoryRow {
  part: string
  sku: string
  onHand: number
  reorderAt: number
  status: 'below-reorder' | 'on-order' | 'sufficient'
}

const AGENT_INVENTORY_TABS = [
  { id: 'all', label: 'All', icon: 'Boxes' },
  { id: 'below-reorder', label: 'Below Reorder', icon: 'AlertCircle' },
  { id: 'on-order', label: 'On Order', icon: 'Truck' },
  { id: 'sufficient', label: 'Sufficient', icon: 'CheckCircle' },
] as const

const DEMO_AGENT_INVENTORY: readonly AgentInventoryRow[] = []

function AgentInventoryStatusBadge({ status }: { status: AgentInventoryRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'below-reorder':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Below Reorder')}
        </Badge>
      )
    case 'on-order':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('On Order')}
        </Badge>
      )
    case 'sufficient':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Sufficient')}
        </Badge>
      )
  }
}

export function AgentInventoryView() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AGENT_INVENTORY_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly AgentInventoryRow[] = DEMO_AGENT_INVENTORY
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.part, r.sku].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Items Below Reorder', value: 0, caption: 'Need ordering', highlight: true, tone: 'warning' },
    { label: 'On Order', value: 0, caption: 'Inbound', tone: 'info' },
    { label: 'In Stock', value: 0, caption: 'Sufficient' },
    { label: 'Stock Value', value: 'SAR 0.00', caption: 'On hand' },
  ]

  const columns: Column<AgentInventoryRow>[] = [
    { header: 'Part', cell: (r) => <span className="font-medium text-heading">{r.part}</span> },
    { header: 'SKU', cell: (r) => r.sku },
    { header: 'On Hand', cell: (r) => r.onHand },
    { header: 'Reorder At', cell: (r) => r.reorderAt },
    { header: 'Status', cell: (r) => <AgentInventoryStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Boxes"
        title={t('Agent Inventory View')}
        subtitle={t('Checking stock levels from an agent perspective')}
      />

      <TabBar tabs={AGENT_INVENTORY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Stock Requiring Action')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search stock...')}
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
              <MobileCardHeader title={r.part} trailing={<AgentInventoryStatusBadge status={r.status} />} />
              <MobileCardRow label={t('SKU')}>{r.sku}</MobileCardRow>
              <MobileCardRow label={t('On Hand')}>{r.onHand}</MobileCardRow>
              <MobileCardRow label={t('Reorder At')}>{r.reorderAt}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Boxes"
              title={t('All stock is above reorder point')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Price Comparison ─────────────────────────────────────────────────────────

interface PriceComparisonRow {
  part: string
  supplierA: string
  supplierB: string
  supplierC: string
  best: string
}

const PRICE_COMPARISON_TABS = [
  { id: 'all', label: 'All', icon: 'Scale' },
  { id: 'savings-found', label: 'Savings Found', icon: 'TrendingDown' },
  { id: 'no-savings', label: 'No Savings', icon: 'Minus' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
] as const

const DEMO_PRICE_COMPARISON: readonly PriceComparisonRow[] = []

export function PriceComparison() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PRICE_COMPARISON_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly PriceComparisonRow[] = DEMO_PRICE_COMPARISON
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.part, r.supplierA, r.supplierB, r.supplierC, r.best].some((f) =>
          f.toLowerCase().includes(needle),
        ),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Parts Compared', value: 0, caption: 'This session', highlight: true },
    { label: 'Suppliers', value: 0, caption: 'In comparison', tone: 'info' },
    { label: 'Best-Price Wins', value: 0, caption: 'Cheapest picks' },
    { label: 'Potential Saving', value: 'SAR 0.00', caption: 'Versus current' },
  ]

  const columns: Column<PriceComparisonRow>[] = [
    { header: 'Part', cell: (r) => <span className="font-medium text-heading">{r.part}</span> },
    { header: 'Supplier A', cell: (r) => r.supplierA },
    { header: 'Supplier B', cell: (r) => r.supplierB },
    { header: 'Supplier C', cell: (r) => r.supplierC },
    { header: 'Best', cell: (r) => r.best },
  ]

  return (
    <>
      <FeatureHeader
        icon="Scale"
        title={t('Price Comparison')}
        subtitle={t('Side-by-side vendor pricing analysis')}
      />

      <TabBar tabs={PRICE_COMPARISON_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Comparison')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search parts...')}
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
              <MobileCardHeader title={r.part} />
              <MobileCardRow label={t('Supplier A')}>{r.supplierA}</MobileCardRow>
              <MobileCardRow label={t('Supplier B')}>{r.supplierB}</MobileCardRow>
              <MobileCardRow label={t('Supplier C')}>{r.supplierC}</MobileCardRow>
              <MobileCardRow label={t('Best')}>{r.best}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Scale"
              title={t('Add parts to compare pricing')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Shipment Tracking ────────────────────────────────────────────────────────

interface ShipmentTrackingRow {
  tracking: string
  order: string
  carrier: string
  eta: string
  status: 'in-transit' | 'delivered' | 'delayed'
}

const SHIPMENT_TRACKING_TABS = [
  { id: 'all', label: 'All', icon: 'MapPin' },
  { id: 'in-transit', label: 'In Transit', icon: 'Truck' },
  { id: 'delivered', label: 'Delivered', icon: 'CheckCircle' },
  { id: 'delayed', label: 'Delayed', icon: 'AlertCircle' },
] as const

const DEMO_SHIPMENT_TRACKING: readonly ShipmentTrackingRow[] = []

function ShipmentTrackingStatusBadge({ status }: { status: ShipmentTrackingRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'in-transit':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Transit')}
        </Badge>
      )
    case 'delivered':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Delivered')}
        </Badge>
      )
    case 'delayed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Delayed')}
        </Badge>
      )
  }
}

export function ShipmentTracking() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SHIPMENT_TRACKING_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ShipmentTrackingRow[] = DEMO_SHIPMENT_TRACKING
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.tracking, r.order, r.carrier].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Shipments', value: 0, caption: 'In transit', highlight: true },
    { label: 'Out For Delivery', value: 0, caption: 'Arriving today', tone: 'info' },
    { label: 'Delayed', value: 0, caption: 'Behind schedule', tone: 'warning' },
    { label: 'Delivered This Week', value: 0, caption: 'Completed' },
  ]

  const columns: Column<ShipmentTrackingRow>[] = [
    { header: 'Tracking', cell: (r) => <span className="font-medium text-heading">{r.tracking}</span> },
    { header: 'Order', cell: (r) => r.order },
    { header: 'Carrier', cell: (r) => r.carrier },
    { header: 'ETA', cell: (r) => r.eta },
    { header: 'Status', cell: (r) => <ShipmentTrackingStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="MapPin"
        title={t('Shipment Tracking')}
        subtitle={t('Real-time shipment monitoring for orders')}
      />

      <TabBar tabs={SHIPMENT_TRACKING_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Shipments')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search shipments...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.tracking}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.tracking} trailing={<ShipmentTrackingStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Order')}>{r.order}</MobileCardRow>
              <MobileCardRow label={t('Carrier')}>{r.carrier}</MobileCardRow>
              <MobileCardRow label={t('ETA')}>{r.eta}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="MapPin"
              title={t('No shipments to track')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Procurement Reports ──────────────────────────────────────────────────────

interface ProcurementReportRow {
  report: string
  period: string
  generated: string
  format: string
}

const PROCUREMENT_REPORT_TABS = [
  { id: 'all', label: 'All', icon: 'FileBarChart' },
  { id: 'monthly', label: 'Monthly', icon: 'Calendar' },
  { id: 'quarterly', label: 'Quarterly', icon: 'Calendar' },
  { id: 'custom', label: 'Custom', icon: 'Settings' },
] as const

const DEMO_PROCUREMENT_REPORTS: readonly ProcurementReportRow[] = []

export function ProcurementReports() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PROCUREMENT_REPORT_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ProcurementReportRow[] = DEMO_PROCUREMENT_REPORTS
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.report, r.period, r.format].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Spend This Month', value: 'SAR 0.00', caption: 'Total procurement', highlight: true },
    { label: 'Savings', value: 'SAR 0.00', caption: 'Versus list', tone: 'info' },
    { label: 'On-Time Delivery', value: '0%', caption: 'Supplier reliability' },
    { label: 'Orders Placed', value: 0, caption: 'This month' },
  ]

  const columns: Column<ProcurementReportRow>[] = [
    { header: 'Report', cell: (r) => <span className="font-medium text-heading">{r.report}</span> },
    { header: 'Period', cell: (r) => r.period },
    { header: 'Generated', cell: (r) => r.generated },
    { header: 'Format', cell: (r) => r.format },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileBarChart"
        title={t('Procurement Reports')}
        subtitle={t('Procurement efficiency and savings reports')}
      />

      <TabBar tabs={PROCUREMENT_REPORT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Report Library')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.report}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.report} />
              <MobileCardRow label={t('Period')}>{r.period}</MobileCardRow>
              <MobileCardRow label={t('Generated')}>{r.generated}</MobileCardRow>
              <MobileCardRow label={t('Format')}>{r.format}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileBarChart"
              title={t('No reports generated yet')}
            />
          }
        />
      </Section>
    </>
  )
}
