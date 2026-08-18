import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, LineChart, PieChart } from 'lucide-react'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { formatSar, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** Reports hub — the landing page the sidebar's "Reports" entry opens.
 *
 *  The design (Reports.dc.html) draws a single dashboard: three KPI tiles, a
 *  revenue-by-service panel and a top-technicians panel. It never links
 *  anywhere else, which strands every other report screen (Financial,
 *  Operational, Executive, Sales, Custom, BI, ...) behind the sidebar alone.
 *  This hub keeps the design's dashboard content and adds the category grid
 *  a "reports home" needs, so every report screen in SCREEN_MAP is one click
 *  away. Cards are filtered by `canScreen` — a role that can't open a report
 *  never sees a card that would bounce it to Unauthorized. */

/** Brand-safe chart palette — blue/bright/slate/orange, no green or red. */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

const CATEGORIES = [
  {
    title: 'Financial Reports',
    desc: 'Balance sheet, P&L, cash flow, trial balance',
    to: '/financial-reports',
    screen: 'FinancialReports',
    icon: 'TrendingUp',
  },
  {
    title: 'Financial Statements',
    desc: 'IFRS statements for the current period',
    to: '/financial-statements',
    screen: 'FinancialStatements',
    icon: 'FileText',
  },
  {
    title: 'Executive Reports',
    desc: 'Board and CEO level KPIs',
    to: '/executive-reports',
    screen: 'ExecutiveReports',
    icon: 'BarChart3',
  },
  {
    title: 'Operational Reports',
    desc: 'Workshop throughput, bookings and technician load',
    to: '/operational-reports',
    screen: 'OperationalReports',
    icon: 'Activity',
  },
  {
    title: 'BI Dashboard',
    desc: 'Cross-module analytics',
    to: '/bidashboard',
    screen: 'BIDashboard',
    icon: 'PieChart',
  },
  {
    title: 'Reports & Analytics',
    desc: 'Analytics overview',
    to: '/reports-analytics',
    screen: 'ReportsAnalytics',
    icon: 'LineChart',
  },
  {
    title: 'Sales Reports',
    desc: 'Revenue reports',
    to: '/sales-reports',
    screen: 'SalesReports',
    icon: 'DollarSign',
  },
  {
    title: 'Custom Reports',
    desc: 'User-built report builder',
    to: '/custom-reports',
    screen: 'CustomReports',
    icon: 'SlidersHorizontal',
  },
  {
    title: 'Workshop Reports',
    desc: 'Workshop throughput reports',
    to: '/workshop-reports',
    screen: 'WorkshopReports',
    icon: 'Wrench',
  },
  {
    title: 'Inventory Reports',
    desc: 'Stock reports',
    to: '/inventory-reports',
    screen: 'InventoryReports',
    icon: 'Package',
  },
  {
    title: 'Insurance Reports',
    desc: 'Insurance claim reports',
    to: '/insurance-reports',
    screen: 'InsuranceReports',
    icon: 'ShieldCheck',
  },
  {
    title: 'Loan Reports',
    desc: 'Auto-loan / financing reports',
    to: '/loan-reports',
    screen: 'LoanReports',
    icon: 'Landmark',
  },
] as const

/** `BarChart3`, `PieChart` and `LineChart` aren't in the generated icon
 *  registry — imported directly from lucide-react per the binding
 *  conventions, sized and stroked to match `Icon`'s defaults. */
const UNREGISTERED_ICONS: Record<string, typeof BarChart3> = {
  BarChart3,
  PieChart,
  LineChart,
}

function CategoryIcon({ name, size }: { name: string; size: number }) {
  const Glyph = UNREGISTERED_ICONS[name]
  if (Glyph) return <Glyph size={size} strokeWidth={2} aria-hidden />
  return <Icon name={name} size={size} />
}

export function Reports() {
  const { t, rtl } = usePreferences()
  const { canScreen } = useSession()
  const { data: jobs = [] } = useCollection('jobs')
  const { data: technicians = [] } = useCollection('technicians')
  const { data: invoices = [] } = useCollection('invoices')

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((category) => canScreen(category.screen)),
    [canScreen]
  )

  const invoiceTotals = useMemo(() => {
    const invoiced = invoices.reduce((sum, invoice) => sum + parseSar(invoice.amount), 0)
    const outstanding = invoices
      .filter((invoice) => invoice.status !== 'paid')
      .reduce((sum, invoice) => sum + parseSar(invoice.amount), 0)
    return { invoiced, outstanding }
  }, [invoices])

  const jobsByService = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) {
      const label = job.svc.replace(/_/g, ' ')
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [jobs])

  const topTechnicians = useMemo(
    () => [...technicians].sort((a, b) => b.jobs - a.jobs),
    [technicians]
  )

  const maxJobsByService = Math.max(...jobsByService.map((row) => row.value), 1)

  return (
    <>
      <FeatureHeader
        icon="BarChart3"
        title={t('Reports & Analytics')}
        subtitle={t('Jump into any report, or scan this month at a glance below')}
        actions={
          <>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 font-action text-[13px] text-body">
              <Icon name="Calendar" size={14} />
              {t('This Month')}
            </span>
            <Button size="md">
              <Icon name="Download" size={15} />
              {t('Export Report')}
            </Button>
          </>
        }
      />

      <Section title={t('Report Categories')} subtitle={t('Every report screen, one click away')}>
        {visibleCategories.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => (
              <Link
                key={category.to}
                to={category.to}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 no-underline shadow-sm transition-all duration-150 hover:border-salis-blue hover:shadow-md hover:no-underline"
              >
                <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2.5 text-salis-blue transition-colors duration-150 group-hover:bg-salis-gradient group-hover:text-white">
                  <CategoryIcon name={category.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[15px] font-bold text-heading">
                    {t(category.title)}
                  </h3>
                  <p className="truncate text-xs text-muted">{t(category.desc)}</p>
                </div>
                <Icon
                  name={rtl ? 'ChevronLeft' : 'ChevronRight'}
                  size={16}
                  className="flex-shrink-0 text-muted"
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted">{t('No report categories are available to your role.')}</p>
        )}
      </Section>

      {/* KPIs below mirror the design's three tiles, extended to four so the
          figures come from the ledger rather than being hardcoded — a hub
          that quotes numbers the linked reports don't agree with is worse
          than one that quotes fewer of them. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-lg p-5">
          <p className="text-[13px] text-muted">{t('Job Cards')}</p>
          <p className="mt-1.5 font-display text-[28px] font-black leading-none text-heading">
            {jobs.length}
          </p>
        </Card>
        <Card className="rounded-lg p-5">
          <p className="text-[13px] text-muted">{t('Technicians')}</p>
          <p className="mt-1.5 font-display text-[28px] font-black leading-none text-heading">
            {technicians.length}
          </p>
        </Card>
        <Card className="relative overflow-hidden rounded-lg border-transparent bg-salis-gradient p-5 shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]">
          <p className="text-[13px] font-medium text-white/80">{t('Invoiced')}</p>
          <p className="mt-1.5 font-display text-[28px] font-black leading-none text-white">
            {formatSar(invoiceTotals.invoiced)}
          </p>
        </Card>
        <Card className="rounded-lg p-5">
          <p className="text-[13px] text-muted">{t('Outstanding')}</p>
          <p className="mt-1.5 font-display text-[28px] font-black leading-none text-salis-orange">
            {formatSar(invoiceTotals.outstanding)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Jobs by Service')} subtitle={t('Current job cards, by service type')}>
          {jobsByService.length ? (
            <div className="flex flex-col gap-3">
              {jobsByService.map((row, index) => (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="capitalize text-body">{t(row.label)}</span>
                    <span className="font-mono font-semibold text-heading" dir="ltr">
                      {row.value}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(row.value / maxJobsByService) * 100}%`,
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted">{t('No job cards recorded')}</p>
          )}
        </Section>

        <Section title={t('Top Technicians')} subtitle={t('Ranked by active jobs')}>
          {topTechnicians.length ? (
            <div className="flex flex-col gap-3.5">
              {topTechnicians.map((tech) => (
                <div key={tech.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient font-display text-xs font-bold text-white">
                    {tech.name[0]}
                  </span>
                  <span className="flex-1 truncate text-sm text-body">{tech.name}</span>
                  <span className="font-mono text-[13px] text-muted" dir="ltr">
                    {tech.jobs} {t('jobs')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted">{t('No technicians on strength')}</p>
          )}
        </Section>
      </div>
    </>
  )
}
