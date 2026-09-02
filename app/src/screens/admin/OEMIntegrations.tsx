import { useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** OEM Integrations (`/oemintegrations`) — the manufacturer scan tools the
 *  workshop is licensed for, read from `oemTools` (`GET /integrations/oem-tools`)
 *  through the repository seam.
 *
 *  The collection carries brand, tool, status, vehicle coverage, protocol and
 *  the licence with its expiry. It carries no sync clock and no record count,
 *  so the old `Last Sync` and `Records` columns are gone rather than filled with
 *  a plausible number: adapter runtime state is `GET /diagnostics/integrations`,
 *  which is a different read and is not connected to this screen. The gap line
 *  under the table says exactly that.
 */

type OemTool = RowOf<'oemTools'>

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  connected: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  available: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

function StatusBadge({ value }: { value: string }) {
  const { t } = usePreferences()
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.available
  return (
    <Badge background={style.bg} color={style.fg}>
      {t(value.charAt(0).toUpperCase() + value.slice(1))}
    </Badge>
  )
}

/** What `GET /integrations/oem-tools` does not return, named rather than
 *  invented. The house rule for a figure the server owns and does not expose is
 *  to say which read would supply it. */
function FieldGap() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      <span>
        {t('Not recorded in this dataset')}: {t('Last Sync')}, {t('Records')}. {t('Endpoint')}:{' '}
        <span dir="ltr" className="font-mono">
          GET /diagnostics/integrations
        </span>
      </span>
    </p>
  )
}

export function OEMIntegrations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: tools = [], isLoading, isError, error, refetch } = useCollection('oemTools')

  const connectedCount = useMemo(
    () => tools.filter((tool) => tool.status === 'connected').length,
    [tools],
  )

  const columns: Column<OemTool>[] = [
    {
      header: 'Manufacturer',
      cell: (tool) => <span className="font-semibold text-heading">{tool.brand}</span>,
    },
    { header: 'Scan tool', cell: (tool) => tool.tool },
    {
      header: 'Protocol',
      cell: (tool) => (
        <Badge background="rgba(107,114,128,.08)" color="var(--text-muted)">
          {tool.protocol}
        </Badge>
      ),
    },
    {
      header: 'Coverage',
      cell: (tool) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {tool.vehicles.toLocaleString('en-US')}
        </span>
      ),
    },
    { header: 'Licence', cell: (tool) => <span className="text-muted">{tool.licence}</span> },
    {
      header: 'Expires',
      cell: (tool) => (
        <span className="text-muted" dir="ltr">
          {tool.expires}
        </span>
      ),
    },
    { header: 'Status', cell: (tool) => <StatusBadge value={tool.status} /> },
  ]

  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      </Card>
    )
  }

  const table = (
    <DataTable
      caption="Connected Systems"
      columns={columns}
      rows={tools}
      rowKey={(tool) => `${tool.brand}-${tool.tool}`}
      loading={isLoading}
      mobileCard={(tool) => (
        <>
          <MobileCardHeader
            leading={
              <div>
                <p className="text-[13px] font-semibold text-heading">{tool.brand}</p>
                <p className="text-xs text-muted">{tool.tool}</p>
              </div>
            }
            trailing={<StatusBadge value={tool.status} />}
          />
          <MobileCardRow label={t('Protocol')} value={tool.protocol} />
          <MobileCardRow label={t('Coverage')} value={tool.vehicles.toLocaleString('en-US')} />
          <MobileCardRow label={t('Licence')} value={tool.licence} />
          <MobileCardRow label={t('Expires')} value={tool.expires} />
        </>
      )}
      empty={
        <EmptyState
          icon="Car"
          title={t('No scan tools paired')}
          description={t('No tools available yet')}
        />
      }
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Car"
          title={t('OEM Integrations')}
          subtitle={t('Manufacturer connections')}
        />
        <div className="flex items-center gap-2">
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">
            {connectedCount} {t('connected')}
          </Badge>
          <Badge background="var(--tint-neutral)" color="var(--text-muted)">
            {tools.length} {t('total')}
          </Badge>
        </div>
        {table}
        <FieldGap />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader
        icon="Car"
        title={t('OEM Integrations')}
        subtitle={t('Manufacturer system connections and data sync')}
      />

      {table}
      <FieldGap />
      <p className="max-w-[820px] text-[12px] leading-relaxed text-muted">
        {t(
          'Each manufacturer tool runs under its own licence and connects through a J2534 pass-thru interface. SALIS AUTO stores the session log and attaches the diagnostic report to the job card — it does not replace or emulate the manufacturer software.',
        )}
      </p>
    </div>
  )
}
