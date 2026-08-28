import { useState } from 'react'
import { PageHeader } from '@/components/shell/AppShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Super Admin — the platform operator console (`project/SuperAdmin.dc.html`).
 *
 *  Desktop-only by design (a platform operator does not run this from a
 *  phone), but built responsive per the port's own rule: the two-column
 *  layout stacks below `lg`, and the organizations table scrolls in its own
 *  container rather than the page.
 *
 *  There is no `tenants`/`organizations` collection in the repository yet
 *  (`repository.ts` only carries per-workshop tables) — the rows below are a
 *  typed local const standing in for that future `GET /platform/orgs` read,
 *  the same seam `Branches.tsx` uses for branch rows.
 *
 *  The design hardcodes the "Organizations" KPI (47) and the Subscriptions
 *  plan counts (18 + 21 + 8 = 47) as two independent numbers that happen to
 *  agree. Here the KPI is derived from the plan counts so they cannot drift
 *  apart the way `Payments.dc.html`'s headline and its invoice rows did
 *  (README "One number that changed"). Monthly Recurring Revenue is likewise
 *  one number (186,400) formatted two ways — compact in the KPI tile, full
 *  precision in the Subscriptions card — rather than two separately hardcoded
 *  strings.
 *
 *  Suspend/reactivate and impersonate are execute-class, superadmin-only
 *  moves — gated on `can('settings', 'x')`, the same gate `Backup.tsx` uses
 *  for "Run Backup Now" (owner and superadmin only; a branch manager has
 *  `settings: 've'` and never sees these controls). The mock repository has
 *  no write path for tenant status, so both actions flip local state and
 *  confirm with a toast rather than pretending to call an API. */

type PlanId = 'Starter' | 'Pro' | 'Enterprise'
type OrgStatus = 'active' | 'renewal' | 'suspended'

interface Org {
  id: string
  name: string
  initial: string
  workspaces: number
  users: number
  plan: PlanId
  status: OrgStatus
  /** Gradient index into `TILE_TINTS`, matching the design's row-position rotation. */
  tint: number
}

const ORGS: readonly Org[] = [
  { id: 'ORG-1001', name: 'SALIS AUTO Holding', initial: 'S', workspaces: 3, users: 24, plan: 'Enterprise', status: 'active', tint: 0 },
  { id: 'ORG-1002', name: 'Al-Amri Auto Group', initial: 'A', workspaces: 2, users: 11, plan: 'Pro', status: 'active', tint: 1 },
  { id: 'ORG-1003', name: 'Najd Motors Est.', initial: 'N', workspaces: 1, users: 6, plan: 'Starter', status: 'active', tint: 2 },
  { id: 'ORG-1004', name: 'Gulf Fleet Services', initial: 'G', workspaces: 4, users: 38, plan: 'Enterprise', status: 'renewal', tint: 0 },
]

/** Per-plan tenant counts. The design's total organizations KPI (47) is this
 *  distribution's sum, not an independent figure — see the file note above. */
const PLAN_STATS: readonly { plan: PlanId; count: number }[] = [
  { plan: 'Starter', count: 18 },
  { plan: 'Pro', count: 21 },
  { plan: 'Enterprise', count: 8 },
]

const TOTAL_ORGS = PLAN_STATS.reduce((sum, row) => sum + row.count, 0)
const TOTAL_USERS = 1248
const ACTIVE_JOBS = 342
const MRR = 186_400

const HEALTH_METRICS: readonly { label: string; pct: number; value: string; bright?: boolean }[] = [
  { label: 'API Uptime', pct: 99.9, value: '99.9%' },
  { label: 'Response Time', pct: 85, value: '142ms' },
  { label: 'CPU Usage', pct: 34, value: '34%', bright: true },
  { label: 'Storage', pct: 62, value: '62%', bright: true },
]

interface ActivityEntry {
  icon: string
  text: string
  time: string
  tone: 'blue' | 'bright' | 'orange'
}

const ACTIVITY_LOG: readonly ActivityEntry[] = [
  { icon: 'Building2', text: 'New org created: Gulf Fleet Services', time: '2h', tone: 'blue' },
  { icon: 'CreditCard', text: 'Subscription upgrade: Al-Amri Auto → Pro', time: '5h', tone: 'bright' },
  { icon: 'AlertTriangle', text: 'Alert: High storage usage — Najd Motors', time: '1d', tone: 'orange' },
  { icon: 'Users', text: '38 new users this week', time: '2d', tone: 'blue' },
]

const ACTIVITY_TONE: Record<ActivityEntry['tone'], { bg: string; fg: string }> = {
  blue: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  bright: { bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
  orange: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
}

/** Plan pill treatment — Enterprise gets the brand-gradient fill, the rest a
 *  flat tint. Never green/red/yellow/purple (README §7). */
function planBadge(plan: PlanId) {
  if (plan === 'Enterprise') {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-salis-gradient px-2.5 py-0.5 text-xs font-semibold text-white">
        {plan}
      </span>
    )
  }
  const [bg, fg] = plan === 'Pro' ? ['rgba(10,94,215,.1)', '#0A5ED7'] : ['rgba(100,116,139,.1)', '#64748B']
  return (
    <Badge background={bg} color={fg} strong>
      {plan}
    </Badge>
  )
}

/** Status pill — blue is active/healthy, orange is the only other hue
 *  (incidents/suspended/renewal-due). */
function statusBadge(status: OrgStatus, label: string) {
  const [bg, fg] =
    status === 'active' ? ['rgba(10,94,215,.1)', '#0A5ED7'] : ['rgba(249,115,22,.1)', '#F97316']
  return (
    <Badge background={bg} color={fg}>
      {label}
    </Badge>
  )
}

const TILE_TINTS: readonly [string, string][] = [
  ['rgba(10,94,215,.1)', '#0A5ED7'],
  ['rgba(11,179,255,.1)', '#0BB3FF'],
  ['rgba(11,31,59,.1)', '#0B1F3B'],
]

function KpiCard({
  icon,
  iconBg,
  iconFg,
  label,
  value,
  change,
}: {
  icon: string
  iconBg: string
  iconFg: string
  label: string
  value: string
  change: string
}) {
  return (
    <Card className="flex flex-col gap-2 p-[18px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{label}</span>
        <span className="flex flex-shrink-0 rounded-lg p-2" style={{ background: iconBg, color: iconFg }}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <h3 className="font-display text-[26px] font-black leading-none text-heading" dir="ltr">
        {value}
      </h3>
      <span className="inline-flex w-fit items-center rounded-full bg-[rgba(10,94,215,.1)] px-2 py-0.5 text-[11px] font-semibold text-salis-blue">
        {change}
      </span>
    </Card>
  )
}

export function SuperAdmin() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const [orgs, setOrgs] = useState(ORGS)

  const canManage = can('settings', 'x')
  const canAdd = can('settings', 'c')

  const suspend = (org: Org) => {
    const next: OrgStatus = org.status === 'suspended' ? 'active' : 'suspended'
    setOrgs((prev) => prev.map((row) => (row.id === org.id ? { ...row, status: next } : row)))
    toast.show({
      title: next === 'suspended' ? t('Organization suspended') : t('Organization reactivated'),
      description: org.name,
    })
  }

  const impersonate = (org: Org) => {
    toast.show({
      title: t('Impersonation session started'),
      description: `${org.name} — ${t('sign out to return to Super Admin')}`,
    })
  }

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        icon="Shield"
        title={t('Platform Overview')}
        subtitle={t('Organizations, subscriptions and system health across every tenant')}
        actions={
          canAdd ? (
            <Button size="md" onClick={() => toast.show({ title: t('Add organization'), description: t('Organization onboarding is not yet available.') })}>
              <Icon name="Plus" size={16} />
              {t('Add Organization')}
            </Button>
          ) : undefined
        }
      />

      {/* ── Platform KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="Building2"
          iconBg="rgba(10,94,215,.1)"
          iconFg="#0A5ED7"
          label={t('Organizations')}
          value={String(TOTAL_ORGS)}
          change={`↑ 4 ${t('This Month')}`}
        />
        <KpiCard
          icon="Users"
          iconBg="rgba(11,179,255,.1)"
          iconFg="#0BB3FF"
          label={t('Total Users')}
          value={TOTAL_USERS.toLocaleString('en-US')}
          change={`↑ 89 ${t('This Month')}`}
        />
        <KpiCard
          icon="Wrench"
          iconBg="rgba(10,94,215,.1)"
          iconFg="#0A5ED7"
          label={t('Active Jobs')}
          value={String(ACTIVE_JOBS)}
          change="↑ 12.4%"
        />
        <KpiCard
          icon="DollarSign"
          iconBg="rgba(11,179,255,.1)"
          iconFg="#0BB3FF"
          label={t('MRR')}
          value={`SAR ${Math.round(MRR / 1000)}K`}
          change="↑ 8.2%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Organizations ──────────────────────────────────────────────── */}
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Icon name="Building2" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Organizations')}</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              {orgs.map((org) => {
                const [tileBg, tileFg] = TILE_TINTS[org.tint % TILE_TINTS.length] as [string, string]
                const statusLabel =
                  org.status === 'active' ? t('Active') : org.status === 'renewal' ? t('Renewal') : t('Suspended')
                return (
                  <div
                    key={org.id}
                    className="flex items-center gap-2.5 border-b border-border px-5 py-3 last:border-b-0 hover:bg-[rgba(10,94,215,.02)]"
                  >
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{ background: tileBg, color: tileFg }}
                    >
                      {org.initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-baseline gap-1.5">
                        <p className="truncate text-[13px] font-semibold text-heading">{org.name}</p>
                        <span className="flex-shrink-0 font-mono text-[10px] text-muted" dir="ltr">
                          {org.id}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        <span dir="ltr">{org.workspaces}</span> {t('Workspaces')} ·{' '}
                        <span dir="ltr">{org.users}</span> {t('Users')}
                      </p>
                    </div>
                    {planBadge(org.plan)}
                    {statusBadge(org.status, statusLabel)}
                    {canManage ? (
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`${t('Impersonate')} ${org.name}`}
                          onClick={() => impersonate(org)}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-[rgba(10,94,215,.1)] hover:text-salis-blue"
                        >
                          <Icon name="LogIn" size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`${org.status === 'suspended' ? t('Reactivate') : t('Suspend')} ${org.name}`}
                          onClick={() => suspend(org)}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-[rgba(249,115,22,.1)] hover:text-salis-orange"
                        >
                          <Icon name={org.status === 'suspended' ? 'RotateCcw' : 'ShieldOff'} size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* ── System Health + Subscriptions ──────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-3.5 p-5">
            <div className="flex items-center gap-2">
              <Icon name="Activity" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('System Health')}</h3>
              <span className="flex-1" />
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-salis-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-salis-blue" />
                {t('All Operational')}
              </span>
            </div>
            {HEALTH_METRICS.map((metric) => (
              <div key={metric.label} className="flex items-center gap-2.5">
                <span className="flex-1 text-xs text-body">{t(metric.label)}</span>
                <div className="h-1 w-[100px] overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${metric.pct}%`,
                      background: metric.bright ? '#0BB3FF' : 'var(--salis-gradient)',
                    }}
                  />
                </div>
                <span className="w-10 flex-shrink-0 text-end font-mono text-[11px] font-semibold text-heading" dir="ltr">
                  {metric.value}
                </span>
              </div>
            ))}
          </Card>

          <Card className="flex flex-col gap-3.5 p-5">
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} className="text-salis-blue" />
              <h3 className="text-sm font-bold text-heading">{t('Subscriptions')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {PLAN_STATS.map((row, index) => (
                <div
                  key={row.plan}
                  className="rounded-[10px] p-3 text-center"
                  style={{
                    background:
                      index === 0
                        ? 'var(--surface-inset)'
                        : index === 1
                          ? 'rgba(10,94,215,.06)'
                          : 'rgba(10,94,215,.1)',
                  }}
                >
                  <p className="font-display text-xl font-black text-heading" dir="ltr">
                    {row.count}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{t(row.plan)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted">{t('Monthly Recurring Revenue')}</span>
              <Money sar={MRR} className="font-bold text-heading" />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────────── */}
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Icon name="Activity" size={16} className="text-salis-blue" />
          <h3 className="text-sm font-bold text-heading">{t('Recent Activity')}</h3>
        </div>
        <div className="flex flex-col">
          {ACTIVITY_LOG.map((entry) => {
            const tone = ACTIVITY_TONE[entry.tone]
            return (
              <div
                key={entry.text}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0"
              >
                <span
                  className="flex flex-shrink-0 rounded-lg p-1.5"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <Icon name={entry.icon} size={14} />
                </span>
                <p className="flex-1 text-[13px] text-body">{t(entry.text)}</p>
                <span className="text-[11px] text-muted" dir="ltr">
                  {entry.time}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
