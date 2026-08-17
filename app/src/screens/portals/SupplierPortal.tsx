import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Standalone supplier extranet — SupplierPortal.dc.html / .Orders.dc.html.
 *
 *  Unlike the operator screens this renders for a supplier account, not a
 *  SALIS AUTO employee: no `useSession`/RBAC, and its own fixed nav rather
 *  than the role-filtered internal `Sidebar`. `PortalChrome` below is that
 *  chrome, shared by both routes so the sidebar/header markup lives once. */

const SUPPLIER_NAME = 'AutoParts KSA'

const NAV_ITEMS: readonly { route?: string; icon: string; label: string }[] = [
  { route: '/supplier-portal', icon: 'LayoutDashboard', label: 'Dashboard' },
  { route: '/supplier-portal/orders', icon: 'FileText', label: 'Purchase Orders' },
  { icon: 'MessageSquareQuote', label: 'Quote Requests' },
  { icon: 'Package', label: 'My Catalog' },
  { icon: 'Truck', label: 'Deliveries' },
  { icon: 'Receipt', label: 'Invoices' },
  { icon: 'TrendingUp', label: 'Performance' },
  { icon: 'Building2', label: 'Company Profile' },
]

// ── Shared demo data (mirrors both .dc.html files) ──────────────────────────
type OrderStatus = 'new' | 'ack' | 'transit' | 'delivered'

const STATUS_TONE: Record<OrderStatus, readonly [string, string]> = {
  new: ['rgba(249,115,22,.1)', '#F97316'],
  ack: ['rgba(11,179,255,.1)', '#0BB3FF'],
  transit: ['rgba(10,94,215,.1)', '#0A5ED7'],
  delivered: ['rgba(11,31,59,.1)', '#0B1F3B'],
}
const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  ack: 'Acknowledged',
  transit: 'In Transit',
  delivered: 'Delivered',
}
const STATUS_ICON: Record<OrderStatus, string> = {
  new: 'FileText',
  ack: 'PackageCheck',
  transit: 'Truck',
  delivered: 'CheckCircle',
}

interface SupplierOrder {
  id: string
  items: string
  lines: number
  branch: string
  due: string
  dueUrgent: boolean
  total: number
  status: OrderStatus
}

const SUPPLIER_ORDERS: readonly SupplierOrder[] = [
  { id: 'PO-2026-0412', items: 'Brake Pads (Front), Brake Discs', lines: 2, branch: 'Riyadh Main', due: 'Jul 28', dueUrgent: true, total: 18400, status: 'new' },
  { id: 'PO-2026-0409', items: 'Oil Filter (Toyota), Air Filter', lines: 2, branch: 'Riyadh North', due: 'Jul 26', dueUrgent: true, total: 12780, status: 'ack' },
  { id: 'PO-2026-0404', items: 'Battery 12V', lines: 1, branch: 'Jeddah Branch', due: 'Jul 25', dueUrgent: true, total: 9120, status: 'transit' },
  { id: 'PO-2026-0398', items: 'Spark Plug Set, Coolant 4L', lines: 2, branch: 'Riyadh Main', due: 'Jul 22', dueUrgent: false, total: 14360, status: 'delivered' },
  { id: 'PO-2026-0391', items: 'Wiper Blades', lines: 1, branch: 'Dammam Branch', due: 'Jul 18', dueUrgent: false, total: 6500, status: 'delivered' },
  { id: 'PO-2026-0384', items: 'Transmission Fluid, Coolant 4L', lines: 2, branch: 'Riyadh North', due: 'Jul 14', dueUrgent: false, total: 8940, status: 'delivered' },
  { id: 'PO-2026-0377', items: 'Brake Pads (Rear)', lines: 1, branch: 'Jeddah Branch', due: 'Jul 09', dueUrgent: false, total: 11200, status: 'delivered' },
]

const NEEDS_ACTION: Record<OrderStatus, string> = { new: 'Acknowledge', ack: 'Ship', transit: '', delivered: '' }

// ── Portal chrome (sidebar + header), shared by both routes ────────────────
function PortalChrome({ children }: { children: ReactNode }) {
  const { t, rtl, theme, toggleTheme, toggleLanguage } = usePreferences()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const nav = (
    <>
      <div className="flex items-center gap-2.5 border-b border-border p-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-salis-gradient text-white">
          <Icon name="Truck" size={16} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-extrabold text-heading">SALIS AUTO</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[.06em] text-salis-blue">
            {t('Supplier')}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.route ? pathname === item.route : false
          const body = (
            <>
              <Icon name={item.icon} size={15} className="flex-shrink-0" />
              <span className="min-w-0 truncate">{t(item.label)}</span>
            </>
          )
          const className = cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-action text-[13px] font-medium no-underline transition-colors duration-150',
            active ? 'bg-salis-gradient-r text-white shadow' : 'text-heading hover:bg-[rgba(10,94,215,.08)]'
          )
          return item.route ? (
            <Link key={item.label} to={item.route} onClick={() => setDrawerOpen(false)} className={className}>
              {body}
            </Link>
          ) : (
            <span key={item.label} aria-disabled className={cn(className, 'cursor-default opacity-70')}>
              {body}
            </span>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-[9px] border border-border bg-inset p-2.5">
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[11px] font-bold text-white">
            {SUPPLIER_NAME.trim()[0] ?? 'S'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-heading">{SUPPLIER_NAME}</p>
            <p className="truncate text-[10px] text-muted">
              {t('Approved Supplier')} · SUP-0114
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-2 py-1.5 font-action text-xs font-medium text-muted transition-colors duration-150 hover:bg-[rgba(10,94,215,.08)] hover:text-salis-blue"
        >
          <Icon name="Globe" size={14} />
          <span>{rtl ? 'English' : 'عربي'}</span>
        </button>
        <Link
          to="/login"
          className="flex h-8 items-center gap-2 rounded-md px-2 py-1.5 font-action text-xs font-medium text-salis-orange no-underline transition-colors duration-150 hover:bg-salis-orange hover:text-white"
        >
          <Icon name="LogOut" size={15} />
          <span>{t('Logout')}</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-page font-ui">
      {isMobile ? (
        <>
          {drawerOpen ? (
            <button
              type="button"
              aria-label={t('Close navigation')}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 cursor-default border-none bg-black/50"
            />
          ) : null}
          <div
            className={cn(
              'fixed inset-y-0 z-50 flex w-sidebar flex-col bg-sidebar transition-transform duration-300 ease-salis start-0',
              drawerOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
            )}
          >
            {nav}
          </div>
        </>
      ) : (
        <aside className="flex h-full w-sidebar flex-shrink-0 flex-col border-e border-border bg-sidebar">
          {nav}
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-sidebar px-4 shadow-sm md:px-6">
          {isMobile ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('Open menu')}
              className="inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-heading"
            >
              <Icon name="Menu" size={20} />
            </button>
          ) : (
            <span className="relative hidden items-center sm:flex">
              <Icon name="Search" size={14} className="pointer-events-none absolute text-muted start-2.5" />
              <input
                placeholder={t('Search orders, parts...')}
                className="h-[34px] w-[250px] rounded-lg border border-border bg-inset px-3 ps-8 font-ui text-[13px] text-heading outline-none"
              />
            </span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            aria-label={t('Notifications')}
            className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted hover:bg-[rgba(10,94,215,.1)]"
          >
            <Icon name="Bell" size={16} />
            <span className="absolute top-[5px] h-[7px] w-[7px] rounded-full border-2 border-sidebar bg-salis-orange end-1.5" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-muted hover:bg-[rgba(10,94,215,.1)]"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="flex animate-fade-up flex-col gap-5 p-4 md:gap-[22px] md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

/** Reusable page title row: gradient icon tile, heading and right-aligned actions. */
function PortalHeader({ icon, title, subtitle, actions }: { icon: string; title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-shrink-0 rounded-[15px] bg-salis-gradient p-2.5 text-white shadow-[0_16px_22px_-6px_rgba(10,94,215,.25)] md:p-[11px]">
          <Icon name={icon} size={25} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black leading-tight text-heading md:text-[27px]">{title}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  )
}

// ── /supplier-portal — dashboard ────────────────────────────────────────────
export function SupplierPortal() {
  const { t } = usePreferences()

  const kpis = [
    { icon: 'FileText', label: 'Open Orders', value: '3', sub: `2 ${t('need action')}`, warn: true },
    { icon: 'MessageSquareQuote', label: 'Pending Quotes', value: '3', sub: t('1 closing today'), warn: true },
    { icon: 'Banknote', label: 'Outstanding', value: formatSar(40300), sub: t('2 invoices awaiting payment'), warn: false },
    { icon: 'TrendingUp', label: 'MTD Revenue', value: formatSar(61200), sub: `+14% ${t('vs Last Period')}`, warn: false },
  ]

  const rfqs = [
    { id: 'RFQ-0231', part: 'Timing Belt Kit — Toyota Camry', qty: '25', branch: 'Riyadh Main', due: 'Due in 4h', urgent: true },
    { id: 'RFQ-0228', part: 'Alternator — Nissan Patrol', qty: '8', branch: 'Jeddah Branch', due: 'Due tomorrow', urgent: false },
    { id: 'RFQ-0224', part: 'Suspension Bushing Set', qty: '40', branch: 'Riyadh North', due: 'Due in 2 days', urgent: false },
  ]

  const scorecard = [
    { label: 'On-Time Delivery', display: '96.4%', pct: 96, warn: false },
    { label: 'Order Accuracy', display: '99.1%', pct: 99, warn: false },
    { label: 'Quote Response Time', display: '4.2h', pct: 82, warn: false },
    { label: 'Return Rate', display: '1.8%', pct: 18, warn: true },
  ]

  return (
    <PortalChrome>
      <PortalHeader
        icon="LayoutDashboard"
        title={t('Supplier Dashboard')}
        subtitle={`${SUPPLIER_NAME} · ${t('Approved Supplier')}`}
        actions={
          <>
            <Button variant="outline" size="md">
              <Icon name="Upload" size={15} />
              {t('Update Stock')}
            </Button>
            <Button size="md">
              <Icon name="Send" size={15} />
              {t('Submit Quote')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-[17px]">
            <div className="flex items-center gap-2">
              <span
                className="flex rounded-[10px] p-2"
                style={{ background: 'rgba(10,94,215,.09)', color: '#0A5ED7' }}
              >
                <Icon name={kpi.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{t(kpi.label)}</span>
            </div>
            <h4 dir="ltr" className="mt-2.5 font-display text-2xl font-black text-heading">
              {kpi.value}
            </h4>
            <p className={cn('mt-1 text-[11px]', kpi.warn ? 'text-salis-orange' : 'text-muted')}>{kpi.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
            <h3 className="text-[15px] font-bold text-heading">{t('Purchase Orders')}</h3>
            <Badge background="rgba(249,115,22,.1)" color="#F97316">
              2 {t('need action')}
            </Badge>
            <span className="flex-1" />
            <Link to="/supplier-portal/orders" className="font-action text-xs font-medium text-salis-blue">
              {t('View All')} →
            </Link>
          </div>
          {SUPPLIER_ORDERS.slice(0, 5).map((order) => {
            const [bg, fg] = STATUS_TONE[order.status]
            const action = NEEDS_ACTION[order.status]
            return (
              <div
                key={order.id}
                className="flex items-center gap-3.5 border-b border-border px-5 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-[rgba(10,94,215,.03)]"
              >
                <span className="flex flex-shrink-0 rounded-[10px] p-2" style={{ background: `${bg}`, color: fg }}>
                  <Icon name={STATUS_ICON[order.status]} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span dir="ltr" className="font-mono text-xs font-semibold text-salis-blue">
                      {order.id}
                    </span>
                    <Badge background={bg} color={fg}>
                      {t(STATUS_LABEL[order.status])}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-body">{t(order.items)}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {t(order.branch)} · {t('Due')} {order.due}
                  </p>
                </div>
                <div className="flex-shrink-0 text-end">
                  <Money sar={order.total} className="font-display text-sm font-bold text-heading" />
                  {action ? (
                    <Button size="sm" className="mt-1.5 h-7 px-2.5 text-[11px]">
                      {t(action)}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </Card>

        <div className="flex flex-col gap-[22px]">
          <Card className="p-5">
            <h3 className="mb-3.5 text-[15px] font-bold text-heading">{t('Quote Requests')}</h3>
            <div className="flex flex-col gap-2.5">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="rounded-[11px] border border-border bg-inset p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span dir="ltr" className="font-mono text-[11px] text-muted">
                      {rfq.id}
                    </span>
                    <span className="flex-1" />
                    <span className={cn('text-[11px] font-semibold', rfq.urgent ? 'text-salis-orange' : 'text-muted')}>
                      {t(rfq.due)}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-heading">{t(rfq.part)}</p>
                  <p className="mb-2 mt-0.5 text-[11px] text-muted">
                    {t('Qty')} {rfq.qty} · {t(rfq.branch)}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('Submit Quote')}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3.5 text-[15px] font-bold text-heading">{t('Supplier Scorecard')}</h3>
            <div className="flex flex-col gap-3">
              {scorecard.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-body">{t(row.label)}</span>
                    <span
                      dir="ltr"
                      className={cn('font-mono font-semibold', row.warn ? 'text-salis-orange' : 'text-salis-blue')}
                    >
                      {row.display}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                    <div
                      className={cn('h-full rounded-full', row.warn ? 'bg-salis-orange' : 'bg-salis-gradient-r')}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex items-center gap-2.5 border-t border-border pt-3.5">
              <span className="flex rounded-[9px] p-1.5" style={{ background: 'rgba(10,94,215,.09)', color: '#0A5ED7' }}>
                <Icon name="Award" size={15} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-heading">{t('Gold Tier Supplier')}</p>
                <p className="text-[11px] text-muted">{t('Priority routing on new orders')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PortalChrome>
  )
}

// ── /supplier-portal/orders — purchase order list ───────────────────────────
const ORDER_TABS: readonly { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'ack', label: 'Acknowledged' },
  { id: 'transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
]

export function SupplierPortalOrders() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  const rows = useMemo(
    () => (filter === 'all' ? SUPPLIER_ORDERS : SUPPLIER_ORDERS.filter((o) => o.status === filter)),
    [filter]
  )

  const columns: Column<SupplierOrder>[] = [
    { header: 'Order #', cell: (o) => o.id, code: true },
    {
      header: 'Items',
      cell: (o) => (
        <div>
          <p className="text-[13px] text-body">{t(o.items)}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {o.lines} {t('line items')}
          </p>
        </div>
      ),
    },
    { header: 'Branch', cell: (o) => t(o.branch), className: 'text-muted' },
    {
      header: 'Due',
      cell: (o) => (
        <span dir="ltr" className={cn(o.dueUrgent ? 'text-salis-orange' : 'text-body')}>
          {o.due}
        </span>
      ),
    },
    {
      header: 'Total',
      cell: (o) => <Money sar={o.total} className="font-semibold" />,
      className: 'text-end',
    },
    {
      header: 'Status',
      cell: (o) => {
        const [bg, fg] = STATUS_TONE[o.status]
        return (
          <Badge background={bg} color={fg}>
            {t(STATUS_LABEL[o.status])}
          </Badge>
        )
      },
    },
  ]

  return (
    <PortalChrome>
      <PortalHeader
        icon="FileText"
        title={t('Purchase Orders')}
        subtitle={t('Orders issued to you by SALIS AUTO branches')}
        actions={
          <Button variant="outline" size="md">
            <Icon name="Download" size={15} />
            {t('Export')}
          </Button>
        }
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {ORDER_TABS.map((tab) => {
          const count = tab.id === 'all' ? SUPPLIER_ORDERS.length : SUPPLIER_ORDERS.filter((o) => o.status === tab.id).length
          const active = filter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex h-[34px] cursor-pointer items-center gap-1.5 rounded-lg px-3.5',
                'font-action text-xs font-medium transition-all duration-150',
                active
                  ? 'bg-salis-gradient text-white'
                  : 'border border-border bg-card text-body hover:border-border-strong'
              )}
            >
              {t(tab.label)}
              <span dir="ltr" className="font-mono opacity-75">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        mobileCard={(o) => {
          const [bg, fg] = STATUS_TONE[o.status]
          return (
            <>
              <MobileCardHeader
                title={o.id}
                code
                trailing={
                  <Badge background={bg} color={fg}>
                    {t(STATUS_LABEL[o.status])}
                  </Badge>
                }
              />
              <MobileCardRow>{t(o.items)}</MobileCardRow>
              <MobileCardRow label={t('Branch')}>{t(o.branch)}</MobileCardRow>
              <MobileCardRow label={t('Due')}>
                <span dir="ltr" className={o.dueUrgent ? 'text-salis-orange' : undefined}>
                  {o.due}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Total')}>
                <Money sar={o.total} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="FileText" title={t('No orders in this view')} />}
      />
    </PortalChrome>
  )
}
