import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Error: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Inactive: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function OEMIntegrations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const connectedCount = OEM_CONNECTIONS.filter((c) => c.status === 'Connected').length

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('OEM Integrations')} subtitle={t('Manufacturer connections')} />
        <div className="flex items-center gap-2">
          <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{connectedCount} {t('connected')}</Badge>
          <Badge background="rgba(107,114,128,.1)" color="rgb(107,114,128)">{OEM_CONNECTIONS.length} {t('total')}</Badge>
        </div>
        {OEM_CONNECTIONS.map((conn, i) => (
          <MobileCard key={i}>
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
          </MobileCard>
        ))}
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Connected Systems')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('Manufacturer')}</th>
                <th className="pb-3 font-medium">{t('System')}</th>
                <th className="pb-3 font-medium">{t('Type')}</th>
                <th className="pb-3 font-medium">{t('Records')}</th>
                <th className="pb-3 font-medium">{t('Last Sync')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {OEM_CONNECTIONS.map((conn, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 font-semibold text-heading">{conn.manufacturer}</td>
                  <td className="py-3 text-body">{conn.system}</td>
                  <td className="py-3">
                    <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(conn.type)}</Badge>
                  </td>
                  <td className="py-3 text-body">{conn.dataPoints > 0 ? conn.dataPoints.toLocaleString() : '-'}</td>
                  <td className="py-3 text-muted">{conn.lastSync}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[conn.status].bg} color={STATUS_STYLES[conn.status].fg}>{t(conn.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
