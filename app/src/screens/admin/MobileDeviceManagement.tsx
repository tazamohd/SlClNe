import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface ManagedDevice {
  name: string
  user: string
  platform: 'iOS' | 'Android'
  model: string
  lastSeen: string
  status: 'Active' | 'Inactive' | 'Lost'
  battery: number
  appVersion: string
}

const DEVICES: ManagedDevice[] = [
  { name: 'SA-TABLET-01', user: 'Yusuf Ibrahim', platform: 'Android', model: 'Samsung Galaxy Tab S9', lastSeen: '2 min ago', status: 'Active', battery: 82, appVersion: '3.2.1' },
  { name: 'SA-PHONE-03', user: 'Sara Al-Mutairi', platform: 'iOS', model: 'iPhone 15 Pro', lastSeen: '5 min ago', status: 'Active', battery: 64, appVersion: '3.2.1' },
  { name: 'SA-TABLET-02', user: 'Omar Hassan', platform: 'Android', model: 'Samsung Galaxy Tab A9', lastSeen: '1 hour ago', status: 'Active', battery: 45, appVersion: '3.1.8' },
  { name: 'SA-PHONE-07', user: 'Khalid Mohammed', platform: 'iOS', model: 'iPhone 14', lastSeen: '3 hours ago', status: 'Inactive', battery: 12, appVersion: '3.2.0' },
  { name: 'SA-TABLET-04', user: 'Tariq Al-Dosari', platform: 'Android', model: 'Lenovo Tab P12', lastSeen: '2 days ago', status: 'Lost', battery: 0, appVersion: '3.1.5' },
  { name: 'SA-PHONE-09', user: 'Nora Al-Fahad', platform: 'iOS', model: 'iPhone 15', lastSeen: '10 min ago', status: 'Active', battery: 91, appVersion: '3.2.1' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Inactive: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Lost: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function MobileDeviceManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const activeCount = DEVICES.filter((d) => d.status === 'Active').length

  const columns: Column<ManagedDevice>[] = [
    {
      header: 'Device',
      cell: (device) => (
        <div>
          <p className="font-semibold text-heading">{device.name}</p>
          <p className="text-xs text-muted">{device.model}</p>
        </div>
      ),
    },
    { header: 'User', cell: (device) => device.user },
    { header: 'Platform', cell: (device) => <Badge background="rgba(107,114,128,.08)" color="var(--text-muted)">{device.platform}</Badge> },
    {
      header: 'Battery',
      cell: (device) => (
        <div className="flex items-center gap-2">
          <Icon name={device.battery < 20 ? 'Battery' : 'BatteryCharging'} size={14} style={{ color: device.battery < 20 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
          <span className="text-body">{device.battery}%</span>
        </div>
      ),
    },
    { header: 'App Version', cell: (device) => device.appVersion, code: true },
    { header: 'Last Seen', cell: (device) => <span className="text-muted">{device.lastSeen}</span> },
    { header: 'Status', cell: (device) => <Badge background={STATUS_STYLES[device.status].bg} color={STATUS_STYLES[device.status].fg}>{t(device.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Enrolled Devices"
      columns={columns}
      rows={DEVICES}
      rowKey={(_, i) => `device-${i}`}
      mobileCard={(device) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                  <Icon name={device.platform === 'iOS' ? 'Tablet' : 'Smartphone'} size={14} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{device.name}</p>
                  <p className="text-xs text-muted">{device.model}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[device.status].bg} color={STATUS_STYLES[device.status].fg}>{t(device.status)}</Badge>}
          />
          <MobileCardRow label={t('User')} value={device.user} />
          <MobileCardRow label={t('Battery')} value={`${device.battery}%`} />
          <MobileCardRow label={t('Last Seen')} value={device.lastSeen} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Smartphone" title={t('MDM')} subtitle={t('Device management')} />
        <div className="flex items-center gap-2">
          <Badge background="var(--tint-blue)" color="var(--salis-blue)">{activeCount} {t('active')}</Badge>
          <Badge background="var(--tint-neutral)" color="var(--text-muted)">{DEVICES.length} {t('total')}</Badge>
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Smartphone" title={t('Mobile Device Management')} subtitle={t('Monitor and manage enrolled devices')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: 'Total Devices', value: DEVICES.length.toString(), icon: 'Smartphone' },
          { label: 'Active Devices', value: activeCount.toString(), icon: 'CheckCircle' },
          { label: 'Needs Attention', value: DEVICES.filter((d) => d.status !== 'Active').length.toString(), icon: 'CircleAlert' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
                <Icon name={stat.icon} size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">{t(stat.label)}</p>
                <p className="text-xl font-bold text-heading">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {table}
    </div>
  )
}
