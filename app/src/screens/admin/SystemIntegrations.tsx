import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** System-wide integrations console — government, insurance, payments,
 *  telematics, commerce, ERP and messaging connectors, ported from
 *  `SystemIntegrations.dc.html`.
 *
 *  Per README §7: blue is connected, orange is setup-pending, slate is merely
 *  available. No green/red. This is the deeper admin console over the same
 *  `integrations` collection the CRM overview (`Crm.tsx`'s `Integrations`)
 *  summarizes — palette and status labels are kept consistent with it. */

type SysIntegration = RowOf<'integrations'>
type IntegrationStatus = 'connected' | 'pending' | 'available'

function statusOf(item: SysIntegration): IntegrationStatus {
  return item.status === 'connected' || item.status === 'pending' ? item.status : 'available'
}

const STATUS: Record<IntegrationStatus, { label: string; bg: string; fg: string }> = {
  connected: { label: 'Connected', bg: 'rgba(10,94,215,.12)', fg: '#0A5ED7' },
  pending: { label: 'Setup pending', bg: 'rgba(249,115,22,.13)', fg: '#F97316' },
  available: { label: 'Available', bg: 'rgba(100,116,139,.13)', fg: '#64748B' },
}

/** Compact icon-chip + figure stat tile matching the design's stat row. */
function StatTile({
  icon,
  value,
  label,
  chipBg,
  chipFg,
}: {
  icon: string
  value: number
  label: string
  chipBg: string
  chipFg: string
}) {
  return (
    <Card className="flex items-center gap-3 rounded-xl p-3.5">
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: chipBg, color: chipFg }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p
          className="font-display text-[19px] font-black leading-tight text-heading [font-variant-numeric:tabular-nums]"
          dir="ltr"
        >
          {value}
        </p>
        <p className="truncate text-[11px] text-muted">{label}</p>
      </div>
    </Card>
  )
}

export function SystemIntegrations() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const { show } = useToast()
  const { data: integrations = [], isLoading } = useCollection('integrations')
  const [filter, setFilter] = useState('all')

  const canManage = can('settings', 'e')

  const categories = useMemo(
    () => ['all', ...new Set(integrations.map((item) => item.cat))],
    [integrations]
  )

  const filtered = useMemo(
    () => (filter === 'all' ? integrations : integrations.filter((item) => item.cat === filter)),
    [integrations, filter]
  )

  const stats = useMemo(
    () => ({
      connected: integrations.filter((item) => statusOf(item) === 'connected').length,
      pending: integrations.filter((item) => statusOf(item) === 'pending').length,
      categories: categories.length - 1,
    }),
    [integrations, categories]
  )

  const act = (item: SysIntegration) => {
    const connected = statusOf(item) === 'connected'
    show({
      title: connected ? t('Opening settings') : t('Connection started'),
      description: rtl ? item.ar : item.name,
    })
  }

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('System Integrations')}
        subtitle={t('Government, insurance, payments, telematics and ERP')}
      />

      {isLoading ? (
        <p className="text-sm text-muted">{t('Loading...')}</p>
      ) : integrations.length === 0 ? (
        <Card className="rounded-lg p-6">
          <EmptyState
            icon="Network"
            title={t('No integrations registered')}
            description={t('Connected systems appear here once added.')}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <StatTile
              icon="Network"
              value={integrations.length}
              label={t('Integrations')}
              chipBg="rgba(10,94,215,.12)"
              chipFg="#0A5ED7"
            />
            <StatTile
              icon="CheckCircle2"
              value={stats.connected}
              label={t('Connected')}
              chipBg="rgba(10,94,215,.12)"
              chipFg="#0A5ED7"
            />
            <StatTile
              icon="Clock"
              value={stats.pending}
              label={t('Setup pending')}
              chipBg="rgba(249,115,22,.12)"
              chipFg="#F97316"
            />
            <StatTile
              icon="Layers"
              value={stats.categories}
              label={t('Categories')}
              chipBg="rgba(11,179,255,.12)"
              chipFg="#0BB3FF"
            />
          </div>

          <div role="tablist" aria-label={t('Category')} className="flex gap-2 overflow-x-auto pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'h-8 flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5',
                  'font-action text-xs font-semibold transition-all duration-150',
                  filter === cat
                    ? 'border-none bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                    : 'border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue'
                )}
              >
                {t(cat === 'all' ? 'All' : cat)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="rounded-lg p-6">
              <EmptyState icon="Network" title={t('No integrations in this view')} />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => {
                const status = statusOf(item)
                const meta = STATUS[status]
                const connected = status === 'connected'
                return (
                  <Card
                    key={item.name}
                    className="flex flex-col gap-2.5 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(10,94,215,.35)] hover:shadow-lg"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[rgba(10,94,215,.1)] text-salis-blue">
                        <Icon name={item.icon} size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-heading">
                          {rtl ? item.ar : item.name}
                        </p>
                        <span className="mt-0.5 inline-block truncate rounded-full bg-[rgba(11,179,255,.12)] px-1.5 py-px font-action text-[10px] font-semibold text-salis-bright">
                          {t(item.cat)}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: meta.fg }}
                      />
                    </div>

                    <p className="text-xs leading-relaxed text-muted [text-wrap:pretty]">
                      {rtl ? item.ar_detail : item.detail}
                    </p>

                    <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                      <Badge background={meta.bg} color={meta.fg} className="font-action">
                        {t(meta.label)}
                      </Badge>
                      {canManage ? (
                        <Button
                          size="sm"
                          variant={connected ? 'subtle' : 'primary'}
                          onClick={() => act(item)}
                        >
                          {connected ? t('Manage') : t('Connect')}
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
