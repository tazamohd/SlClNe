import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface OEMConnection {
  manufacturer: string
  system: string
  type: 'Parts Catalog' | 'Warranty' | 'Diagnostics' | 'Recall Data' | 'Service Manual'
  status: 'Connected' | 'Pending' | 'Error' | 'Inactive'
  lastSync: string
  dataPoints: number
}

const OEM_CONNECTIONS: OEMConnection[] = [
  { manufacturer: 'Toyota', system: 'Toyota TechInfo', type: 'Parts Catalog', status: 'Connected', lastSync: '10 min ago', dataPoints: 42500 },
  { manufacturer: 'Toyota', system: 'Toyota Warranty Portal', type: 'Warranty', status: 'Connected', lastSync: '1 hour ago', dataPoints: 1840 },
  { manufacturer: 'Hyundai', system: 'Hyundai GSW', type: 'Parts Catalog', status: 'Connected', lastSync: '30 min ago', dataPoints: 38200 },
  { manufacturer: 'Hyundai', system: 'Hyundai WebDTS', type: 'Diagnostics', status: 'Pending', lastSync: 'Never', dataPoints: 0 },
  { manufacturer: 'Honda', system: 'Honda iN', type: 'Service Manual', status: 'Connected', lastSync: '2 hours ago', dataPoints: 15600 },
  { manufacturer: 'Nissan', system: 'Nissan ASIST', type: 'Diagnostics', status: 'Error', lastSync: '3 days ago', dataPoints: 8900 },
  { manufacturer: 'Kia', system: 'Kia GSWIN', type: 'Recall Data', status: 'Connected', lastSync: '45 min ago', dataPoints: 2100 },
  { manufacturer: 'Ford', system: 'Ford OASIS', type: 'Warranty', status: 'Inactive', lastSync: 'Never', dataPoints: 0 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Connected: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Error: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Inactive: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function OEMIntegrations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const connectedCount = OEM_CONNECTIONS.filter((c) => c.status === 'Connected').length

  const columns: Column<OEMConnection>[] = [
    { header: 'Manufacturer', cell: (conn) => <span className="font-semibold text-heading">{conn.manufacturer}</span> },
    { header: 'System', cell: (conn) => conn.system },
    { header: 'Type', cell: (conn) => <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(conn.type)}</Badge> },
    { header: 'Records', cell: (conn) => conn.dataPoints > 0 ? conn.dataPoints.toLocaleString() : '-' },
    { header: 'Last Sync', cell: (conn) => <span className="text-muted">{conn.lastSync}</span> },
    { header: 'Status', cell: (conn) => <Badge background={STATUS_STYLES[conn.status].bg} color={STATUS_STYLES[conn.status].fg}>{t(conn.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Connected Systems"
      columns={columns}
      rows={OEM_CONNECTIONS}
      rowKey={(_, i) => `oem-${i}`}
      mobileCard={(conn) => (
        <>
          <MobileCardHeader
            leading={
              <div>
                <p className="text-[13px] font-semibold text-heading">{conn.manufacturer}</p>
                <p className="text-xs text-muted">{conn.system}</p>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[conn.status].bg} color={STATUS_STYLES[conn.status].fg}>{t(conn.status)}</Badge>}
          />
          <MobileCardRow label={t('Type')} value={t(conn.type)} />
          <MobileCardRow label={t('Last Sync')} value={conn.lastSync} />
          {conn.dataPoints > 0 && <MobileCardRow label={t('Records')} value={conn.dataPoints.toLocaleString()} />}
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('OEM Integrations')} subtitle={t('Manufacturer connections')} />
        <div className="flex items-center gap-2">
          <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{connectedCount} {t('connected')}</Badge>
          <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{OEM_CONNECTIONS.length} {t('total')}</Badge>
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Car" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('OEM Integrations')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Manufacturer system connections and data sync')}</p>
        </div>
      </div>

      {table}
    </div>
  )
}
