import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
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

/** OEM diagnostic software — genuine manufacturer tools linked over J2534.
 *
 *  Per the palette rules (README §7): blue is connected/licensed, orange is
 *  the pending-licence warning, slate is merely available. No green. */

type OemTool = RowOf<'oemTools'>
type OemStatus = 'connected' | 'pending' | 'available'

const STATUS: Record<OemStatus, { label: string; bg: string; fg: string }> = {
  connected: { label: 'Connected', bg: 'rgba(10,94,215,.12)', fg: '#0A5ED7' },
  pending: { label: 'Pending licence', bg: 'rgba(249,115,22,.13)', fg: '#F97316' },
  available: { label: 'Available', bg: 'rgba(100,116,139,.13)', fg: '#64748B' },
}

function statusOf(tool: OemTool): OemStatus {
  return tool.status === 'connected' || tool.status === 'pending' ? tool.status : 'available'
}

const FILTERS = [
  ['all', 'All'],
  ['connected', 'Connected'],
  ['pending', 'Pending'],
  ['available', 'Available'],
] as const

type Filter = (typeof FILTERS)[number][0]

/** Compact stat tile matching the design's icon-chip + figure row. */
function StatTile({
  icon,
  value,
  label,
  chipBg,
  chipFg,
}: {
  icon: ReactNode
  value: string | number
  label: string
  chipBg: string
  chipFg: string
}) {
  return (
    <Card className="flex items-center gap-3 rounded-lg p-3.5">
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: chipBg, color: chipFg }}
      >
        {icon}
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

/** Uppercase key/value inset used for the protocol and fleet cells. */
function InsetCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-inset px-2.5 py-2">
      <p className="font-action text-[9.5px] font-bold uppercase tracking-[.05em] text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-[11.5px] font-semibold text-heading">{children}</p>
    </div>
  )
}

export function OEMIntegrations() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { show } = useToast()
  const navigate = useNavigate()
  const { data: tools = [], isLoading } = useCollection('oemTools')
  const [filter, setFilter] = useState<Filter>('all')

  const canManage = can('settings', 'e')

  const filtered = useMemo(
    () => (filter === 'all' ? tools : tools.filter((tool) => statusOf(tool) === filter)),
    [tools, filter]
  )

  const stats = useMemo(
    () => ({
      connected: tools.filter((tool) => statusOf(tool) === 'connected').length,
      pending: tools.filter((tool) => statusOf(tool) === 'pending').length,
      vehicles: tools.reduce((sum, tool) => sum + tool.vehicles, 0),
    }),
    [tools]
  )

  const act = (tool: OemTool) => {
    const connected = statusOf(tool) === 'connected'
    show({
      title: connected ? t('Opening configuration') : t('Connection started'),
      description: `${tool.tool} · ${tool.brand}`,
    })
  }

  return (
    <>
      <FeatureHeader
        icon="Plug"
        title={t('OEM Diagnostic Software')}
        subtitle={t('Genuine manufacturer tools linked to the workshop')}
        actions={
          <Button variant="subtle" size="md" onClick={() => navigate('/obddiagnostics')}>
            <Icon name="Activity" size={15} />
            {t('Live OBD')}
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-[rgba(10,94,215,.16)] bg-[rgba(10,94,215,.05)] px-4 py-3.5">
        <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        <p className="max-w-[88ch] text-[12.5px] leading-relaxed text-body [text-wrap:pretty]">
          {t(
            'Each manufacturer tool runs under its own licence and connects through a J2534 pass-thru interface. SALIS AUTO stores the session log and attaches the diagnostic report to the job card — it does not replace or emulate the manufacturer software.'
          )}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('Loading...')}</p>
      ) : tools.length === 0 ? (
        <Card className="rounded-lg p-6">
          <EmptyState
            icon="Plug"
            title={t('No OEM tools registered')}
            description={t('Manufacturer diagnostic tools appear here once added.')}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <StatTile
              icon={<Icon name="Boxes" size={16} />}
              value={tools.length}
              label={t('Brands supported')}
              chipBg="rgba(10,94,215,.12)"
              chipFg="#0A5ED7"
            />
            <StatTile
              icon={<CheckCircle2 size={16} aria-hidden />}
              value={stats.connected}
              label={t('Connected')}
              chipBg="rgba(10,94,215,.12)"
              chipFg="#0A5ED7"
            />
            <StatTile
              icon={<Icon name="Clock" size={16} />}
              value={stats.pending}
              label={t('Awaiting licence')}
              chipBg="rgba(249,115,22,.12)"
              chipFg="#F97316"
            />
            <StatTile
              icon={<Icon name="Car" size={16} />}
              value={stats.vehicles.toLocaleString('en-US')}
              label={t('Vehicles covered')}
              chipBg="rgba(11,179,255,.12)"
              chipFg="#0BB3FF"
            />
          </div>

          <div
            role="tablist"
            aria-label={t('Status')}
            className="flex gap-2 overflow-x-auto pb-0.5"
          >
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={cn(
                  'h-8 flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5',
                  'font-action text-xs font-semibold transition-all duration-150',
                  filter === id
                    ? 'border-none bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                    : 'border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue'
                )}
              >
                {t(label)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="rounded-lg p-6">
              <EmptyState icon="Plug" title={t('No tools in this view')} />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => {
                const status = statusOf(tool)
                const meta = STATUS[status]
                const connected = status === 'connected'
                return (
                  <Card
                    key={tool.tool}
                    className="flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(10,94,215,.35)] hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[rgba(10,94,215,.1)] text-salis-blue">
                        <Icon name="Wrench" size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-heading" dir="ltr">
                          {tool.tool}
                        </p>
                        <p className="truncate text-[11.5px] text-muted" dir="ltr">
                          {tool.brand}
                        </p>
                      </div>
                      <Badge background={meta.bg} color={meta.fg} className="font-action">
                        {t(meta.label)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <InsetCell label={t('Protocol')}>
                        <span className="font-mono" dir="ltr">
                          {tool.protocol}
                        </span>
                      </InsetCell>
                      <InsetCell label={t('Fleet covered')}>
                        <span dir="ltr" className="[font-variant-numeric:tabular-nums]">
                          {tool.vehicles.toLocaleString('en-US')}
                        </span>{' '}
                        {t('vehicles')}
                      </InsetCell>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="text-[11px] text-muted">
                        {connected ? (
                          <>
                            {t('Licence to')}{' '}
                            <span dir="ltr" className="[font-variant-numeric:tabular-nums]">
                              {tool.expires}
                            </span>
                          </>
                        ) : (
                          `${t('Licence')}: ${t(tool.licence)}`
                        )}
                      </span>
                      {canManage ? (
                        <Button
                          size="sm"
                          variant={connected ? 'subtle' : 'primary'}
                          onClick={() => act(tool)}
                        >
                          {connected
                            ? t('Configure')
                            : status === 'pending'
                              ? t('Add licence')
                              : t('Connect')}
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
