/** Reference gallery screens — 25 UI pattern libraries + 3 documentation pages.
 *
 *  Each component is self-contained and uses the existing design-system primitives.
 *  They render as live galleries that demonstrate the pattern they name. */
import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, Skeleton, EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { SCREENS } from '@/data/generated/screens'
import { ROLES, PERMS } from '@/data/generated/rbac'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Page header matching the design system's gradient-icon + heading pattern. */
function PageHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const { t } = usePreferences()
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
        <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name={icon} size={28} />
        </div>
      </div>
      <div>
        <h1 className="font-display text-[30px] font-black text-heading">{t(title)}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t(subtitle)}</p>
      </div>
    </div>
  )
}

/** Section wrapper for pattern examples. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-bold text-heading">{t(title)}</h2>
      {children}
    </Card>
  )
}

/** Small example pill for pattern labels. */
function PatternLabel({ text }: { text: string }) {
  return (
    <Badge background="var(--tint-blue)" color="var(--salis-blue)">{text}</Badge>
  )
}

// ---------------------------------------------------------------------------
// 1. UI.ListView
// ---------------------------------------------------------------------------
export function UIListView() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const items = [
    { id: 'JC-2401', title: 'Oil Change Service', status: 'In Progress', date: '2026-08-20' },
    { id: 'JC-2402', title: 'Brake Pad Replacement', status: 'Pending', date: '2026-08-19' },
    { id: 'JC-2403', title: 'Engine Diagnostics', status: 'Completed', date: '2026-08-18' },
  ]
  const statusColors: Record<string, [string, string]> = {
    'In Progress': ['var(--tint-blue)', 'var(--salis-blue)'],
    Pending: ['var(--tint-orange)', 'var(--salis-orange)'],
    Completed: ['var(--tint-neutral)', 'var(--text-muted)'],
  }
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('ListView Pattern')}>
      <PageHeader icon="List" title="ListView" subtitle="Vertical item lists with status indicators" />
      <Section title="Basic List">
        <ul className="flex flex-col divide-y divide-border" role="list">
          {items.map(item => (
            <li key={item.id} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} py-3`}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">{item.id}</span>
                <span className="text-sm font-medium text-heading">{t(item.title)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge background={statusColors[item.status]?.[0] ?? ''} color={statusColors[item.status]?.[1] ?? ''}>
                  {t(item.status)}
                </Badge>
                <span className="text-xs text-muted">{item.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Compact List">
        <ul className="flex flex-col gap-2" role="list">
          {items.map(item => (
            <li key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Icon name="FileText" size={16} className="text-salis-blue" />
              <span className="flex-1 text-sm text-body">{t(item.title)}</span>
              <Icon name="ChevronRight" size={14} className="text-muted" />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. UI.TableView
// ---------------------------------------------------------------------------
export function UITableView() {
  const { t } = usePreferences()
  type Row = { id: string; customer: string; vehicle: string; amount: number; status: string }
  const rows: Row[] = [
    { id: 'INV-001', customer: 'Abdullah Al-Salis', vehicle: 'Toyota Camry', amount: 2500, status: 'Paid' },
    { id: 'INV-002', customer: 'Faisal Al-Harbi', vehicle: 'Honda Accord', amount: 1800, status: 'Pending' },
    { id: 'INV-003', customer: 'Noura Al-Qahtani', vehicle: 'Hyundai Tucson', amount: 3200, status: 'Overdue' },
  ]
  const cols: Column<Row>[] = [
    { header: 'Invoice', cell: r => r.id, code: true },
    { header: 'Customer', cell: r => r.customer },
    { header: 'Vehicle', cell: r => r.vehicle },
    { header: 'Amount', cell: r => `SAR ${r.amount.toLocaleString()}` },
    {
      header: 'Status', cell: r => {
        const colors: Record<string, [string, string]> = {
          Paid: ['var(--tint-neutral)', 'var(--text-muted)'],
          Pending: ['var(--tint-orange)', 'var(--salis-orange)'],
          Overdue: ['var(--tint-blue)', 'var(--salis-blue)'],
        }
        const [bg, fg] = colors[r.status] ?? ['var(--tint-neutral)', 'var(--text-muted)']
        return <Badge background={bg} color={fg}>{t(r.status)}</Badge>
      },
    },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('TableView Pattern')}>
      <PageHeader icon="Table" title="TableView" subtitle="Tabular data with sorting, filtering and pagination" />
      <Section title="Standard Table">
        <DataTable
          caption="Sample tabular data"
          columns={cols}
          rows={rows}
          rowKey={r => r.id}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.id} code trailing={
                (() => {
                  const colors: Record<string, [string, string]> = {
                    Paid: ['var(--tint-neutral)', 'var(--text-muted)'],
                    Pending: ['var(--tint-orange)', 'var(--salis-orange)'],
                    Overdue: ['var(--tint-blue)', 'var(--salis-blue)'],
                  }
                  const [bg, fg] = colors[r.status] ?? ['var(--tint-neutral)', 'var(--text-muted)']
                  return <Badge background={bg} color={fg}>{t(r.status)}</Badge>
                })()
              } />
              <MobileCardRow label={t('Customer')} value={r.customer} />
              <MobileCardRow label={t('Vehicle')} value={r.vehicle} />
              <MobileCardRow label={t('Amount')} value={`SAR ${r.amount.toLocaleString()}`} />
            </>
          )}
        />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. UI.CardView
// ---------------------------------------------------------------------------
export function UICardView() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const cards = [
    { id: 1, title: 'Oil Filter', sku: 'OIL-001', qty: 45, icon: 'Package' },
    { id: 2, title: 'Brake Pads', sku: 'BRK-042', qty: 12, icon: 'Disc' },
    { id: 3, title: 'Air Filter', sku: 'AIR-019', qty: 28, icon: 'Wind' },
    { id: 4, title: 'Spark Plugs', sku: 'SPK-008', qty: 60, icon: 'Zap' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('CardView Pattern')}>
      <PageHeader icon="LayoutGrid" title="CardView" subtitle="Grid layout with cards for visual scanning" />
      <Section title="Item Cards">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {cards.map(c => (
            <Card key={c.id} className="flex flex-col items-center gap-3 p-5 text-center">
              <span className="flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_10px_15px_-3px_rgba(10,94,215,.25)]">
                <Icon name={c.icon} size={24} />
              </span>
              <h2 className="text-sm font-bold text-heading">{t(c.title)}</h2>
              <span className="font-mono text-xs text-muted">{c.sku}</span>
              <span className="text-2xl font-black text-salis-blue">{c.qty}</span>
              <span className="text-xs text-muted">{t('in stock')}</span>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. UI.TimelineView
// ---------------------------------------------------------------------------
export function UITimelineView() {
  const { t } = usePreferences()
  const steps: TimelineStep[] = [
    { icon: 'ClipboardCheck', label: 'Check-In', time: '09:00 AM', done: true },
    { icon: 'Search', label: 'Inspection', time: '09:30 AM', done: true },
    { icon: 'FileText', label: 'Estimate Sent', time: '10:15 AM', done: true },
    { icon: 'Wrench', label: 'Repair Started', time: '11:00 AM', done: false },
    { icon: 'CheckCircle', label: 'Quality Check', done: false },
    { icon: 'Car', label: 'Delivery', done: false },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('TimelineView Pattern')}>
      <PageHeader icon="GitBranch" title="TimelineView" subtitle="Sequential progress through workflow stages" />
      <Section title="Job Card Timeline">
        <Timeline steps={steps} />
      </Section>
      <Section title="Horizontal Timeline">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1">
              <div className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 ${s.done ? 'bg-[rgba(10,94,215,.08)]' : 'bg-inset'}`}>
                <Icon name={s.icon} size={16} className={s.done ? 'text-salis-blue' : 'text-muted'} />
                <span className={`whitespace-nowrap text-xs font-medium ${s.done ? 'text-salis-blue' : 'text-muted'}`}>{t(s.label)}</span>
              </div>
              {i < steps.length - 1 && <Icon name="ChevronRight" size={14} className="flex-shrink-0 text-muted" />}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. UI.CalendarView
// ---------------------------------------------------------------------------
export function UICalendarView() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const events: Record<number, { label: string; color: string }[]> = {
    3: [{ label: 'Oil Change', color: 'var(--salis-blue)' }],
    7: [{ label: 'Brake Service', color: 'var(--salis-orange)' }],
    12: [{ label: 'Engine Tune', color: 'var(--salis-blue)' }, { label: 'Inspection', color: 'var(--text-muted)' }],
    18: [{ label: 'AC Repair', color: 'var(--salis-orange)' }],
    24: [{ label: 'Full Service', color: 'var(--salis-blue)' }],
  }
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('CalendarView Pattern')}>
      <PageHeader icon="Calendar" title="CalendarView" subtitle="Date-based scheduling and event visualization" />
      <Section title="Month View">
        <div className={`grid ${isMobile ? 'grid-cols-7 gap-1' : 'grid-cols-7 gap-2'}`}>
          {days.map(d => (
            <div key={d} className="py-1 text-center text-xs font-semibold text-muted">{t(d)}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <div key={day} className="flex min-h-[48px] flex-col rounded-lg border border-border p-1">
              <span className="text-xs text-body">{day}</span>
              {events[day]?.map(ev => (
                <span key={ev.label} className="mt-0.5 truncate rounded px-1 text-[10px] font-medium text-white" style={{ background: ev.color }}>
                  {isMobile ? '' : t(ev.label)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 6. UI.KanbanView
// ---------------------------------------------------------------------------
export function UIKanbanView() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const columns = [
    { title: 'To Do', icon: 'Circle', items: ['Diagnose Engine Light', 'Order Brake Pads'] },
    { title: 'In Progress', icon: 'Clock', items: ['Oil Change - Toyota Camry', 'AC Repair - Honda'] },
    { title: 'Review', icon: 'Eye', items: ['QC Check - BMW X5'] },
    { title: 'Done', icon: 'CheckCircle', items: ['Tire Rotation - Ford', 'Filter Replace - Kia'] },
  ]
  const colColors = ['rgba(10,94,215,.08)', 'rgba(249,115,22,.08)', 'rgba(100,116,139,.08)', 'rgba(10,94,215,.05)']
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('KanbanView Pattern')}>
      <PageHeader icon="Columns" title="KanbanView" subtitle="Drag-and-drop board for workflow management" />
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'overflow-x-auto'}`}>
        {columns.map((col, ci) => (
          <Card key={col.title} className="flex min-w-[220px] flex-1 flex-col p-4" style={{ background: colColors[ci] }}>
            <div className="mb-3 flex items-center gap-2">
              <Icon name={col.icon} size={16} className="text-salis-blue" />
              <h2 className="text-sm font-bold text-heading">{t(col.title)}</h2>
              <Badge background="var(--tint-blue)" color="var(--salis-blue)">{col.items.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {col.items.map(item => (
                <Card key={item} className="cursor-pointer p-3 transition-shadow hover:shadow-md">
                  <p className="text-sm text-body">{t(item)}</p>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 7. UI.MapView
// ---------------------------------------------------------------------------
export function UIMapView() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const locations = [
    { name: 'Main Branch', address: 'King Fahd Road, Riyadh', status: 'Open', jobs: 12 },
    { name: 'North Branch', address: 'Prince Sultan St, Riyadh', status: 'Open', jobs: 8 },
    { name: 'Jeddah Branch', address: 'Tahlia Street, Jeddah', status: 'Closed', jobs: 0 },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('MapView Pattern')}>
      <PageHeader icon="Map" title="MapView" subtitle="Geographic visualization of locations and assets" />
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <Card className="col-span-1 flex flex-col gap-3 p-4 lg:col-span-2">
          <CardHeader icon="MapPin" title={t('Service Locations')} />
          <div className="flex aspect-video items-center justify-center rounded-xl bg-inset">
            <div className="flex flex-col items-center gap-2 text-muted">
              <Icon name="Map" size={48} />
              <span className="text-sm">{t('Map view placeholder')}</span>
              <span className="text-xs">{t('Interactive map renders with API key')}</span>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-bold text-heading">{t('Locations')}</h2>
          {locations.map(loc => (
            <div key={loc.name} className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-heading">{t(loc.name)}</span>
                <Badge
                  background={loc.status === 'Open' ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                  color={loc.status === 'Open' ? 'var(--salis-blue)' : 'var(--text-muted)'}
                >{t(loc.status)}</Badge>
              </div>
              <span className="text-xs text-muted">{loc.address}</span>
              <span className="text-xs text-body">{t('Active Jobs')}: {loc.jobs}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 8. UI.Charts
// ---------------------------------------------------------------------------
export function UICharts() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const barData = [
    { label: 'Engine', value: 45 },
    { label: 'Brakes', value: 32 },
    { label: 'Electrical', value: 28 },
    { label: 'Suspension', value: 19 },
    { label: 'AC/Heating', value: 15 },
  ]
  const max = Math.max(...barData.map(d => d.value))
  const COLORS = ['var(--salis-blue)', 'var(--salis-blue-bright)', 'var(--chart-3)', 'var(--text-muted)', 'var(--salis-orange)']
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Charts Pattern')}>
      <PageHeader icon="BarChart3" title="Charts" subtitle="Data visualization components for analytics" />
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <Section title="Horizontal Bar Chart">
          <div className="flex flex-col gap-3">
            {barData.map((d, i) => (
              <div key={d.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-body">{t(d.label)}</span>
                  <span className="font-semibold text-heading">{d.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Donut Chart">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-[180px] w-[180px]">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                {barData.reduce<{ offset: number; elements: React.ReactNode[] }>((acc, d, i) => {
                  const pct = (d.value / barData.reduce((s, x) => s + x.value, 0)) * 100
                  const circumference = 2 * Math.PI * 35
                  const dash = (pct / 100) * circumference
                  acc.elements.push(
                    <circle key={d.label} cx="50" cy="50" r="35" fill="none"
                      stroke={COLORS[i]} strokeWidth="12"
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      strokeDashoffset={-acc.offset * circumference / 100}
                      strokeLinecap="round" />
                  )
                  acc.offset += pct
                  return acc
                }, { offset: 0, elements: [] }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-heading">{barData.reduce((s, d) => s + d.value, 0)}</span>
                <span className="text-xs text-muted">{t('Total')}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {barData.map((d, i) => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-body">{t(d.label)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
      <Section title="KPI Tiles">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { label: 'Revenue', value: 'SAR 125K', icon: 'TrendingUp', delta: '+12%' },
            { label: 'Jobs', value: '284', icon: 'Wrench', delta: '+8%' },
            { label: 'Avg Time', value: '2.4h', icon: 'Clock', delta: '-15%' },
            { label: 'Satisfaction', value: '4.8', icon: 'Star', delta: '+3%' },
          ].map(k => (
            <Card key={k.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{t(k.label)}</span>
                <Icon name={k.icon} size={16} className="text-salis-blue" />
              </div>
              <p className="mt-2 font-display text-xl font-black text-heading">{k.value}</p>
              <span className="text-xs font-medium text-salis-blue">{k.delta}</span>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 9. UI.ActivityFeed
// ---------------------------------------------------------------------------
export function UIActivityFeed() {
  const { t } = usePreferences()
  const activities = [
    { icon: 'UserPlus', user: 'Noura Al-Qahtani', action: 'created job card', target: 'JC-2401', time: '2 min ago', color: 'var(--salis-blue)' },
    { icon: 'FileText', user: 'Faisal Al-Harbi', action: 'approved estimate', target: 'EST-1892', time: '15 min ago', color: 'var(--salis-orange)' },
    { icon: 'Wrench', user: 'Saeed Al-Zahrani', action: 'started repair on', target: 'JC-2399', time: '1 hour ago', color: 'var(--salis-blue)' },
    { icon: 'CreditCard', user: 'Hessa Al-Mutairi', action: 'recorded payment', target: 'INV-4521', time: '2 hours ago', color: 'var(--text-muted)' },
    { icon: 'CheckCircle', user: 'Majed Al-Otaibi', action: 'completed QC for', target: 'JC-2395', time: '3 hours ago', color: 'var(--salis-blue)' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('ActivityFeed Pattern')}>
      <PageHeader icon="Activity" title="ActivityFeed" subtitle="Real-time event stream for system activity" />
      <Section title="Recent Activity">
        <div className="flex flex-col divide-y divide-border">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${a.color}15` }}>
                <Icon name={a.icon} size={16} style={{ color: a.color }} />
              </span>
              <div className="flex-1">
                <p className="text-sm text-body">
                  <span className="font-semibold text-heading">{a.user}</span>{' '}{t(a.action)}{' '}
                  <span className="font-mono text-xs text-salis-blue">{a.target}</span>
                </p>
                <span className="text-xs text-muted">{t(a.time)}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 10. UI.Comments
// ---------------------------------------------------------------------------
export function UIComments() {
  const { t } = usePreferences()
  const comments = [
    { author: 'Faisal Al-Harbi', role: 'Manager', text: 'Customer approved the additional brake work. Please proceed.', time: '10:30 AM', avatar: 'F' },
    { author: 'Saeed Al-Zahrani', role: 'Technician', text: 'Noted. Starting on brake pads now. ETA 2 hours.', time: '10:45 AM', avatar: 'S' },
    { author: 'Noura Al-Qahtani', role: 'Advisor', text: 'Updated the estimate with revised parts cost.', time: '11:15 AM', avatar: 'N' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Comments Pattern')}>
      <PageHeader icon="MessageSquare" title="Comments" subtitle="Threaded discussion and internal notes" />
      <Section title="Job Card Comments">
        <div className="flex flex-col gap-4">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <Avatar name={c.avatar} />
              <div className="flex-1 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-heading">{c.author}</span>
                  <PatternLabel text={c.role} />
                  <span className="ms-auto text-xs text-muted">{c.time}</span>
                </div>
                <p className="mt-1.5 text-sm text-body">{t(c.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 11. UI.Attachments
// ---------------------------------------------------------------------------
export function UIAttachments() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const files = [
    { name: 'inspection_report.pdf', size: '2.4 MB', type: 'PDF', icon: 'FileText', color: 'var(--salis-blue)' },
    { name: 'damage_front_bumper.jpg', size: '1.8 MB', type: 'Image', icon: 'Image', color: 'var(--salis-orange)' },
    { name: 'customer_signature.png', size: '340 KB', type: 'Image', icon: 'Image', color: 'var(--salis-orange)' },
    { name: 'parts_invoice.xlsx', size: '560 KB', type: 'Spreadsheet', icon: 'FileSpreadsheet', color: 'var(--text-muted)' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Attachments Pattern')}>
      <PageHeader icon="Paperclip" title="Attachments" subtitle="File upload, preview and management" />
      <Section title="Attached Files">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${f.color}15` }}>
                <Icon name={f.icon} size={20} style={{ color: f.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading">{f.name}</p>
                <p className="text-xs text-muted">{f.type} &middot; {f.size}</p>
              </div>
              <Button variant="ghost" size="sm"><Icon name="Download" size={14} /></Button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Upload Zone">
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-10">
          <Icon name="Upload" size={32} className="text-muted" />
          <p className="text-sm font-medium text-heading">{t('Drag files here or click to upload')}</p>
          <p className="text-xs text-muted">{t('PDF, JPG, PNG up to 10MB')}</p>
          <Button variant="outline" size="sm"><Icon name="Plus" size={14} /> {t('Browse Files')}</Button>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 12. UI.MediaGallery
// ---------------------------------------------------------------------------
export function UIMediaGallery() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const images = [
    { id: 1, label: 'Front Bumper Damage', date: '2026-08-20' },
    { id: 2, label: 'Engine Bay Inspection', date: '2026-08-19' },
    { id: 3, label: 'Brake Disc Wear', date: '2026-08-18' },
    { id: 4, label: 'Interior Dashboard', date: '2026-08-17' },
    { id: 5, label: 'Tire Tread Depth', date: '2026-08-16' },
    { id: 6, label: 'Undercarriage View', date: '2026-08-15' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('MediaGallery Pattern')}>
      <PageHeader icon="Image" title="MediaGallery" subtitle="Photo and video gallery with lightbox preview" />
      <Section title="Inspection Photos">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl bg-inset">
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                <Icon name="Camera" size={24} />
                <span className="text-xs">{t(img.label)}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(0,0,0,.6)] to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-xs font-medium text-white">{t(img.label)}</p>
                <p className="text-[10px] text-white/70">{img.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 13. UI.Messages
// ---------------------------------------------------------------------------
export function UIMessages() {
  const { t } = usePreferences()
  const messages = [
    { from: 'customer', name: 'Khalid Al-Amri', text: 'When will my car be ready?', time: '2:30 PM' },
    { from: 'staff', name: 'Noura Al-Qahtani', text: 'We are finishing the brake work now. Should be ready by 5 PM today.', time: '2:35 PM' },
    { from: 'customer', name: 'Khalid Al-Amri', text: 'Great, I will come to pick it up then. Thank you!', time: '2:37 PM' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Messages Pattern')}>
      <PageHeader icon="MessageCircle" title="Messages" subtitle="Real-time chat and messaging interface" />
      <Section title="Conversation">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'staff' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.from === 'staff' ? 'bg-salis-gradient text-white' : 'border border-border bg-card'}`}>
                <p className="text-xs font-semibold opacity-80">{m.name}</p>
                <p className="mt-1 text-sm">{t(m.text)}</p>
                <p className="mt-1 text-[10px] opacity-60">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 14. UI.AdvancedFilters
// ---------------------------------------------------------------------------
export function UIAdvancedFilters() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const filters = [
    { label: 'Status', icon: 'Filter', options: ['All', 'Active', 'Pending', 'Completed'] },
    { label: 'Date Range', icon: 'Calendar', options: ['Today', 'This Week', 'This Month', 'Custom'] },
    { label: 'Branch', icon: 'Building', options: ['All Branches', 'Main', 'North', 'Jeddah'] },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('AdvancedFilters Pattern')}>
      <PageHeader icon="SlidersHorizontal" title="AdvancedFilters" subtitle="Complex multi-criteria filtering interface" />
      <Section title="Filter Panel">
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
          {filters.map(f => (
            <div key={f.label} className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <Icon name={f.icon} size={12} /> {t(f.label)}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {f.options.map((opt, i) => (
                  <span key={opt} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${i === 0 ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue' : 'border-border text-body hover:border-salis-blue'}`}>
                    {t(opt)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Active Filters">
        <div className="flex flex-wrap items-center gap-2">
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">
            {t('Status')}: {t('Active')} <span className="ms-1 cursor-pointer opacity-60">&times;</span>
          </Badge>
          <Badge background="var(--tint-orange)" color="var(--salis-orange)">
            {t('Branch')}: {t('Main')} <span className="ms-1 cursor-pointer opacity-60">&times;</span>
          </Badge>
          <Button variant="ghost" size="sm">{t('Clear All')}</Button>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 15. UI.ImportCenter
// ---------------------------------------------------------------------------
export function UIImportCenter() {
  const { t } = usePreferences()
  const importFormats = [
    { format: 'CSV', icon: 'FileText', desc: 'Comma-separated values' },
    { format: 'Excel', icon: 'FileSpreadsheet', desc: 'XLSX spreadsheet files' },
    { format: 'JSON', icon: 'Braces', desc: 'Structured JSON data' },
  ]
  const history = [
    { file: 'customers_aug.csv', records: 245, status: 'Completed', date: '2026-08-18' },
    { file: 'inventory_q3.xlsx', records: 1200, status: 'Completed', date: '2026-08-15' },
    { file: 'vehicles_bulk.csv', records: 89, status: 'Failed', date: '2026-08-12' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('ImportCenter Pattern')}>
      <PageHeader icon="Upload" title="ImportCenter" subtitle="Bulk data import with validation and mapping" />
      <Section title="Import Source">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {importFormats.map(f => (
            <Card key={f.format} className="cursor-pointer p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex rounded-lg bg-[rgba(10,94,215,.08)] p-2">
                  <Icon name={f.icon} size={20} className="text-salis-blue" />
                </span>
                <div>
                  <p className="text-sm font-bold text-heading">{f.format}</p>
                  <p className="text-xs text-muted">{t(f.desc)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Import History">
        <div className="flex flex-col divide-y divide-border">
          {history.map(h => (
            <div key={h.file} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-heading">{h.file}</p>
                <p className="text-xs text-muted">{h.records} {t('records')} &middot; {h.date}</p>
              </div>
              <Badge
                background={h.status === 'Completed' ? 'var(--tint-blue)' : 'var(--tint-orange)'}
                color={h.status === 'Completed' ? 'var(--salis-blue)' : 'var(--salis-orange)'}
              >{t(h.status)}</Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 16. UI.ExportCenter
// ---------------------------------------------------------------------------
export function UIExportCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const exportOptions = [
    { label: 'PDF Report', icon: 'FileText', desc: 'Formatted PDF with charts' },
    { label: 'Excel Export', icon: 'FileSpreadsheet', desc: 'Raw data in XLSX format' },
    { label: 'CSV Download', icon: 'Download', desc: 'Plain CSV for integration' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('ExportCenter Pattern')}>
      <PageHeader icon="Download" title="ExportCenter" subtitle="Data export with format options and scheduling" />
      <Section title="Export Options">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {exportOptions.map(opt => (
            <Card key={opt.label} className="flex items-center gap-3 p-4">
              <span className="flex rounded-lg bg-salis-gradient p-2.5 text-white">
                <Icon name={opt.icon} size={20} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-heading">{t(opt.label)}</p>
                <p className="text-xs text-muted">{t(opt.desc)}</p>
              </div>
              <Button variant="outline" size="sm">{t('Export')}</Button>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Scheduled Exports">
        <div className="flex flex-col gap-2">
          {[
            { name: 'Daily Revenue Report', schedule: 'Every day at 8:00 AM', format: 'PDF' },
            { name: 'Weekly Inventory', schedule: 'Every Sunday at 6:00 AM', format: 'Excel' },
          ].map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Icon name="Clock" size={16} className="text-salis-blue" />
                <div>
                  <p className="text-sm font-medium text-heading">{t(s.name)}</p>
                  <p className="text-xs text-muted">{t(s.schedule)}</p>
                </div>
              </div>
              <PatternLabel text={s.format} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 17. UI.FormValidation
// ---------------------------------------------------------------------------
export function UIFormValidation() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('FormValidation Pattern')}>
      <PageHeader icon="FormInput" title="FormValidation" subtitle="Inline validation, error states and field rules" />
      <Section title="Field States">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ref-default-field" className="text-xs font-medium text-muted">{t('Default Field')}</label>
            <Input id="ref-default-field" placeholder={t('Enter value...')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ref-with-value" className="text-xs font-medium text-muted">{t('With Value')}</label>
            <Input id="ref-with-value" defaultValue="Abdullah Al-Salis" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ref-invalid-field" className="text-xs font-medium text-muted">{t('Invalid Field')}</label>
            <Input id="ref-invalid-field" defaultValue="abc" invalid />
            <span className="text-xs text-salis-orange">{t('Please enter a valid phone number')}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ref-disabled-field" className="text-xs font-medium text-muted">{t('Disabled Field')}</label>
            <Input id="ref-disabled-field" defaultValue="Read-only value" disabled />
          </div>
        </div>
      </Section>
      <Section title="Validation Summary">
        <div className="rounded-lg border border-salis-orange bg-[rgba(249,115,22,.06)] p-3">
          <div className="flex items-center gap-2">
            <Icon name="AlertCircle" size={16} className="text-salis-orange" />
            <span className="text-sm font-semibold text-heading">{t('Please fix the following errors')}</span>
          </div>
          <ul className="mt-2 flex flex-col gap-1 ps-6">
            <li className="text-xs text-body">{t('Phone number format is invalid')}</li>
            <li className="text-xs text-body">{t('Email address is required')}</li>
            <li className="text-xs text-body">{t('License plate must be 7 characters')}</li>
          </ul>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 18. UI.EmptyStates
// ---------------------------------------------------------------------------
export function UIEmptyStates() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const examples = [
    { icon: 'Inbox', title: 'No Job Cards', desc: 'Create your first job card to get started.', action: 'New Job Card' },
    { icon: 'Search', title: 'No Results Found', desc: 'Try adjusting your search or filter criteria.', action: 'Clear Filters' },
    { icon: 'FileText', title: 'No Invoices', desc: 'Invoices will appear here once jobs are completed.', action: 'View Jobs' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('EmptyStates Pattern')}>
      <PageHeader icon="Inbox" title="EmptyStates" subtitle="Meaningful placeholders when no data exists" />
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {examples.map(ex => (
          <Card key={ex.title} className="p-6">
            <EmptyState
              icon={ex.icon}
              title={t(ex.title)}
              description={t(ex.desc)}
              action={<Button variant="outline" size="sm"><Icon name="Plus" size={14} /> {t(ex.action)}</Button>}
            />
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 19. UI.LoadingStates
// ---------------------------------------------------------------------------
export function UILoadingStates() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('LoadingStates Pattern')}>
      <PageHeader icon="Loader" title="LoadingStates" subtitle="Progress indicators and skeleton placeholders" />
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <Section title="Linear Progress">
          <Loading label="Loading job cards..." />
        </Section>
        <Section title="Inline Loading">
          <div className="flex flex-col gap-3">
            <Loading label="Fetching data..." inline />
            <Loading label="Saving changes..." inline />
          </div>
        </Section>
      </div>
      <Section title="Skeleton Placeholders">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-[40%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 20. UI.Modals.CRUD
// ---------------------------------------------------------------------------
export function UIModalsCRUD() {
  const { t } = usePreferences()
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('CRUD Modals Pattern')}>
      <PageHeader icon="PlusCircle" title="Modals: CRUD" subtitle="Create, read, update and delete dialog patterns" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: 'Add Customer', icon: 'UserPlus', fields: ['Full Name', 'Phone Number', 'Email', 'National ID'] },
          { title: 'Edit Vehicle', icon: 'Car', fields: ['Make', 'Model', 'Year', 'License Plate'] },
        ].map(modal => (
          <Card key={modal.title} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon name={modal.icon} size={18} className="text-salis-blue" />
                <h2 className="text-base font-bold text-heading">{t(modal.title)}</h2>
              </div>
              <Icon name="X" size={16} className="cursor-pointer text-muted" />
            </div>
            <div className="flex flex-col gap-3 p-5">
              {modal.fields.map(f => {
                const fieldId = `ref-${modal.title.toLowerCase().replace(/\s+/g, '-')}-${f.toLowerCase().replace(/\s+/g, '-')}`
                return (
                  <div key={f} className="flex flex-col gap-1">
                    <label htmlFor={fieldId} className="text-xs font-medium text-muted">{t(f)}</label>
                    <Input id={fieldId} placeholder={`${t('Enter')} ${t(f).toLowerCase()}...`} inputSize="md" />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
              <Button variant="ghost" size="sm">{t('Cancel')}</Button>
              <Button variant="primary" size="sm">{t('Save')}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 21. UI.Modals.Lifecycle
// ---------------------------------------------------------------------------
export function UIModalsLifecycle() {
  const { t } = usePreferences()
  const stages = [
    { label: 'Check-In', from: 'New', to: 'Checked In', icon: 'ClipboardCheck' },
    { label: 'Start Work', from: 'Approved', to: 'In Progress', icon: 'Play' },
    { label: 'Complete', from: 'In Progress', to: 'Completed', icon: 'CheckCircle' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Lifecycle Modals Pattern')}>
      <PageHeader icon="RotateCcw" title="Modals: Lifecycle" subtitle="Status transitions and workflow stage dialogs" />
      <Section title="Stage Transition Cards">
        <div className="grid gap-4 sm:grid-cols-3">
          {stages.map(s => (
            <Card key={s.label} className="p-5 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-salis-gradient text-white">
                <Icon name={s.icon} size={24} />
              </span>
              <h2 className="mt-3 text-sm font-bold text-heading">{t(s.label)}</h2>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted">
                <Badge background="var(--tint-neutral)" color="var(--text-muted)">{t(s.from)}</Badge>
                <Icon name="ArrowRight" size={12} />
                <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t(s.to)}</Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-3">{t('Confirm Transition')}</Button>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 22. UI.Modals.Status
// ---------------------------------------------------------------------------
export function UIModalsStatus() {
  const { t } = usePreferences()
  const statusModals = [
    { title: 'Operation Successful', desc: 'The job card has been created.', icon: 'CheckCircle', color: 'var(--salis-blue)', bg: 'var(--tint-blue)' },
    { title: 'Warning', desc: 'This action cannot be undone.', icon: 'AlertTriangle', color: 'var(--salis-orange)', bg: 'var(--tint-orange)' },
    { title: 'Session Expiring', desc: 'Your session will expire in 5 minutes.', icon: 'Clock', color: 'var(--text-muted)', bg: 'var(--tint-neutral)' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Status Modals Pattern')}>
      <PageHeader icon="Info" title="Modals: Status" subtitle="Confirmation, success and warning dialog patterns" />
      <div className="grid gap-4 sm:grid-cols-3">
        {statusModals.map(m => (
          <Card key={m.title} className="flex flex-col items-center p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: m.bg }}>
              <Icon name={m.icon} size={28} style={{ color: m.color }} />
            </span>
            <h2 className="mt-3 text-base font-bold text-heading">{t(m.title)}</h2>
            <p className="mt-1 text-sm text-muted">{t(m.desc)}</p>
            <Button variant="primary" size="sm" className="mt-4">{t('OK')}</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 23. UI.Modals.Actions
// ---------------------------------------------------------------------------
export function UIModalsActions() {
  const { t } = usePreferences()
  const actions = [
    { title: 'Assign Technician', icon: 'UserPlus', desc: 'Select a technician to assign to this job.' },
    { title: 'Send Notification', icon: 'Bell', desc: 'Notify the customer about their vehicle status.' },
    { title: 'Print Report', icon: 'Printer', desc: 'Generate and print the service report.' },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Actions Modals Pattern')}>
      <PageHeader icon="Zap" title="Modals: Actions" subtitle="Task-specific action dialogs and confirmations" />
      <Section title="Action Cards">
        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map(a => (
            <Card key={a.title} className="flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-salis-gradient text-white">
                  <Icon name={a.icon} size={20} />
                </span>
                <h2 className="text-sm font-bold text-heading">{t(a.title)}</h2>
              </div>
              <p className="mt-2 flex-1 text-xs text-muted">{t(a.desc)}</p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm">{t('Cancel')}</Button>
                <Button variant="primary" size="sm">{t('Confirm')}</Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 24. UI.Modals.Data
// ---------------------------------------------------------------------------
export function UIModalsData() {
  const { t } = usePreferences()
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Data Modals Pattern')}>
      <PageHeader icon="Database" title="Modals: Data" subtitle="Data preview, detail view and selection dialogs" />
      <Section title="Record Preview">
        <Card className="max-w-md">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-heading">{t('Vehicle Details')}</h2>
            <Icon name="X" size={16} className="cursor-pointer text-muted" />
          </div>
          <div className="flex flex-col gap-3 p-5">
            {[
              ['Make', 'Toyota'], ['Model', 'Camry'], ['Year', '2024'],
              ['License Plate', 'ABC 1234'], ['VIN', '1HGCG5655WA044216'], ['Color', 'Silver'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted">{t(label)}</span>
                <span className="text-sm font-medium text-heading">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
      <Section title="Selection List">
        <Card className="max-w-md">
          <div className="border-b border-border px-4 py-3">
            <Input placeholder={t('Search...')} icon={<Icon name="Search" size={16} className="text-muted" />} inputSize="sm" />
          </div>
          <div className="flex flex-col divide-y divide-border">
            {['Main Warehouse', 'North Branch Store', 'Jeddah Parts Center'].map((item, i) => (
              <div key={item} className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-[rgba(10,94,215,.05)]' : 'hover:bg-inset'}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${i === 0 ? 'border-salis-blue bg-salis-blue' : 'border-border'}`}>
                  {i === 0 && <Icon name="Check" size={12} className="text-white" />}
                </span>
                <span className="text-sm text-body">{t(item)}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 25. UI.Modals.Capture
// ---------------------------------------------------------------------------
export function UIModalsCapture() {
  const { t } = usePreferences()
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Capture Modals Pattern')}>
      <PageHeader icon="Camera" title="Modals: Capture" subtitle="Photo capture, signature and barcode scanning dialogs" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Photo Capture">
          <Card className="p-5">
            <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-inset">
              <Icon name="Camera" size={40} className="text-muted" />
              <p className="mt-2 text-sm text-muted">{t('Camera preview area')}</p>
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <Button variant="outline" size="sm"><Icon name="RotateCcw" size={14} /> {t('Retake')}</Button>
              <Button variant="primary" size="sm"><Icon name="Camera" size={14} /> {t('Capture')}</Button>
            </div>
          </Card>
        </Section>
        <Section title="Signature Pad">
          <Card className="p-5">
            <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card">
              <Icon name="PenTool" size={32} className="text-muted" />
              <p className="mt-2 text-sm text-muted">{t('Sign here')}</p>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="ghost" size="sm"><Icon name="Eraser" size={14} /> {t('Clear')}</Button>
              <Button variant="primary" size="sm"><Icon name="Check" size={14} /> {t('Accept')}</Button>
            </div>
          </Card>
        </Section>
      </div>
      <Section title="Barcode Scanner">
        <Card className="mx-auto max-w-sm p-5 text-center">
          <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-inset">
            <Icon name="ScanLine" size={48} className="text-salis-blue" />
            <p className="mt-2 text-sm text-muted">{t('Position barcode in frame')}</p>
          </div>
          <p className="mt-3 text-xs text-muted">{t('Supports QR, Code128, EAN-13')}</p>
        </Card>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 26. FlowSpec (Documentation)
// ---------------------------------------------------------------------------
export function FlowSpec() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const flows = [
    {
      name: 'Job Card Lifecycle',
      icon: 'Wrench',
      steps: ['Check-In', 'Inspection', 'Estimate', 'Approval', 'Repair', 'QC', 'Invoice', 'Delivery'],
      triggers: ['Walk-in', 'Appointment', 'Towing'],
      notifications: ['Customer SMS on status change', 'Manager email on approval needed', 'Technician push on assignment'],
    },
    {
      name: 'Procurement Flow',
      icon: 'ShoppingCart',
      steps: ['Requisition', 'Quote Request', 'Quote Compare', 'PO Create', 'Supplier Confirm', 'Receive', 'Invoice Match'],
      triggers: ['Low stock alert', 'Manual request', 'Auto-reorder'],
      notifications: ['Supplier email on PO', 'Storekeeper push on delivery', 'Accountant on invoice match'],
    },
    {
      name: 'Customer Onboarding',
      icon: 'UserPlus',
      steps: ['Registration', 'Verification', 'Vehicle Add', 'First Appointment'],
      triggers: ['Portal signup', 'Walk-in registration', 'Referral'],
      notifications: ['Welcome SMS', 'Email verification', 'First visit reminder'],
    },
  ]
  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Flow Specification')}>
      <PageHeader icon="GitBranch" title="Flow Specification" subtitle="Cross-screen workflow specifications" />
      {flows.map(flow => (
        <Card key={flow.name} className="p-5">
          <CardHeader icon={flow.icon} title={t(flow.name)} />
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-heading">{t('Workflow Steps')}</h2>
              <div className={`flex items-center gap-1 overflow-x-auto ${isMobile ? 'flex-wrap' : ''}`}>
                {flow.steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className="whitespace-nowrap rounded-full bg-[rgba(10,94,215,.08)] px-3 py-1 text-xs font-medium text-salis-blue">
                      {t(step)}
                    </span>
                    {i < flow.steps.length - 1 && <Icon name="ChevronRight" size={12} className="flex-shrink-0 text-muted" />}
                  </div>
                ))}
              </div>
            </div>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-muted">{t('Triggers')}</h3>
                <ul className="flex flex-col gap-1">
                  {flow.triggers.map(tr => (
                    <li key={tr} className="flex items-center gap-2 text-sm text-body">
                      <Icon name="Zap" size={12} className="text-salis-orange" /> {t(tr)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-muted">{t('Notifications')}</h3>
                <ul className="flex flex-col gap-1">
                  {flow.notifications.map(n => (
                    <li key={n} className="flex items-center gap-2 text-sm text-body">
                      <Icon name="Bell" size={12} className="text-salis-blue" /> {t(n)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 27. Index (Documentation)
// ---------------------------------------------------------------------------
export function ScreenIndex() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  // Group screens by route prefix
  const groups: Record<string, typeof SCREENS[number][]> = {}
  for (const screen of SCREENS) {
    const prefix = screen.route.split('/').filter(Boolean)[0] ?? 'root'
    // Group UI pattern screens together
    const group = screen.name.startsWith('UI.') ? 'UI Patterns'
      : screen.name.startsWith('CustomerApp.') ? 'Customer App'
      : screen.name.startsWith('PartsNetwork.') ? 'Parts Network'
      : screen.name.startsWith('PublicPortal.') ? 'Public Portal'
      : screen.name.startsWith('ProcurementPortal.') ? 'Procurement'
      : prefix === 'ui' ? 'UI Patterns'
      : prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/-/g, ' ')
    if (!groups[group]) groups[group] = []
    groups[group].push(screen)
  }

  const filtered = search
    ? Object.fromEntries(
        Object.entries(groups)
          .map(([g, screens]) => [g, screens.filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.route.toLowerCase().includes(search.toLowerCase()) ||
            (s.purpose ?? '').toLowerCase().includes(search.toLowerCase())
          )])
          .filter(([, screens]) => (screens as typeof SCREENS[number][]).length > 0)
      )
    : groups

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('Screen Index')}>
      <PageHeader icon="BookOpen" title="Screen Index" subtitle={`${SCREENS.length} screens across ${Object.keys(groups).length} modules`} />
      <Card className="p-4">
        <Input
          placeholder={t('Search screens...')}
          icon={<Icon name="Search" size={16} className="text-muted" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Card>
      <div className="flex flex-col gap-4">
        {Object.entries(filtered as Record<string, typeof SCREENS[number][]>).sort(([a], [b]) => a.localeCompare(b)).map(([group, screens]) => (
          <Card key={group} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-heading">{t(group)}</h2>
              <Badge background="var(--tint-blue)" color="var(--salis-blue)">{screens.length}</Badge>
            </div>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {screens.map(s => (
                <a
                  key={s.name}
                  href={s.route}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-body no-underline transition-colors hover:border-salis-blue hover:bg-[rgba(10,94,215,.04)]"
                >
                  <Icon name={s.hasMobile ? 'Smartphone' : 'Monitor'} size={14} className="flex-shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-heading">{s.name}</p>
                    <p className="truncate text-xs text-muted">{s.purpose ?? s.route}</p>
                  </div>
                  <Icon name="ChevronRight" size={12} className="flex-shrink-0 text-muted" />
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 28. RBACSpec (Documentation)
// ---------------------------------------------------------------------------
export function RBACSpec() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const modules = Object.keys(PERMS)

  const ACTION_LABELS: Record<string, string> = {
    v: 'View', c: 'Create', e: 'Edit', d: 'Delete', a: 'Approve', x: 'Export',
  }
  const ACTION_COLORS: Record<string, [string, string]> = {
    v: ['var(--tint-blue)', 'var(--salis-blue)'],
    c: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
    e: ['var(--tint-orange)', 'var(--salis-orange)'],
    d: ['var(--tint-neutral)', 'var(--text-muted)'],
    a: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
    x: ['rgba(56,189,248,.1)', 'var(--chart-3)'],
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none" aria-label={t('RBAC Specification')}>
      <PageHeader icon="Shield" title="RBAC Specification" subtitle={`${ROLES.length} roles, ${modules.length} modules, 6 actions`} />

      {/* Role overview */}
      <Section title="Roles">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {ROLES.map(role => (
            <div key={role.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${role.color}20` }}>
                <Icon name={role.icon} size={18} style={{ color: role.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">{role.label}</p>
                <p className="text-xs text-muted">{t('Scope')}: {role.scope} &middot; {t('Limit')}: {role.limit === null ? t('Unlimited') : `SAR ${(role.limit ?? 0).toLocaleString()}`}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Permission matrix */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-heading">{t('Permission Matrix')}</h2>
          <p className="mt-0.5 text-xs text-muted">{t('Module access by role (v=View c=Create e=Edit d=Delete a=Approve x=Export)')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-inset">
                <th className="sticky start-0 z-[1] bg-inset px-3 py-2 text-start font-semibold text-heading">{t('Module')}</th>
                {ROLES.map(r => (
                  <th key={r.id} className="whitespace-nowrap px-2 py-2 text-center font-semibold text-heading">
                    <div className="flex flex-col items-center gap-0.5">
                      <Icon name={r.icon} size={14} style={{ color: r.color }} />
                      <span className="text-[10px]">{r.id}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod} className="border-b border-border last:border-0">
                  <td className="sticky start-0 z-[1] bg-card px-3 py-2 font-medium capitalize text-heading">{mod}</td>
                  {ROLES.map(r => {
                    const perms = PERMS[mod]?.[r.id] ?? ''
                    return (
                      <td key={r.id} className="px-2 py-2 text-center">
                        {perms ? (
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {perms.split('').map(p => {
                              const [bg, fg] = ACTION_COLORS[p] ?? ['var(--tint-neutral)', 'var(--text-muted)']
                              return (
                                <span key={p} className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold" style={{ background: bg, color: fg }} title={ACTION_LABELS[p]}>
                                  {p}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-muted">&mdash;</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action legend */}
      <Section title="Action Legend">
        <div className="flex flex-wrap gap-3">
          {Object.entries(ACTION_LABELS).map(([key, label]) => {
            const [bg, fg] = ACTION_COLORS[key] ?? ['var(--tint-neutral)', 'var(--text-muted)']
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold" style={{ background: bg, color: fg }}>
                  {key}
                </span>
                <span className="text-sm text-body">{t(label)}</span>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
