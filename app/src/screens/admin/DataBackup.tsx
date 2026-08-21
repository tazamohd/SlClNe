import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface BackupRecord {
  id: string
  type: 'Full' | 'Incremental' | 'Differential'
  size: string
  duration: string
  date: string
  time: string
  status: 'Completed' | 'In Progress' | 'Failed' | 'Scheduled'
  destination: string
}

const BACKUPS: BackupRecord[] = [
  { id: 'BK-0048', type: 'Full', size: '4.2 GB', duration: '18 min', date: 'Aug 18, 2026', time: '02:00 AM', status: 'Completed', destination: 'AWS S3' },
  { id: 'BK-0047', type: 'Incremental', size: '320 MB', duration: '3 min', date: 'Aug 17, 2026', time: '02:00 AM', status: 'Completed', destination: 'AWS S3' },
  { id: 'BK-0046', type: 'Incremental', size: '410 MB', duration: '4 min', date: 'Aug 16, 2026', time: '02:00 AM', status: 'Completed', destination: 'AWS S3' },
  { id: 'BK-0045', type: 'Full', size: '4.1 GB', duration: '17 min', date: 'Aug 15, 2026', time: '02:00 AM', status: 'Completed', destination: 'AWS S3' },
  { id: 'BK-0044', type: 'Incremental', size: '280 MB', duration: '2 min', date: 'Aug 14, 2026', time: '02:00 AM', status: 'Failed', destination: 'AWS S3' },
  { id: 'BK-NEXT', type: 'Full', size: '-', duration: '-', date: 'Aug 22, 2026', time: '02:00 AM', status: 'Scheduled', destination: 'AWS S3' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'In Progress': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Failed: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Scheduled: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

const STATS = [
  { label: 'Last Backup', value: 'Today 02:00', icon: 'Clock' },
  { label: 'Total Storage', value: '28.6 GB', icon: 'Database' },
  { label: 'Success Rate', value: '96%', icon: 'ShieldCheck' },
  { label: 'Next Backup', value: 'Aug 22', icon: 'CalendarClock' },
]

export function DataBackup() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Database" title={t('Data Backup')} subtitle={t('Backup management')} />
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat) => (
            <MobileCard key={stat.label}>
              <MobileCardHeader
                leading={
                  <span className="flex rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                    <Icon name={stat.icon} size={14} />
                  </span>
                }
              />
              <p className="text-xs text-muted">{t(stat.label)}</p>
              <p className="text-lg font-bold text-heading">{stat.value}</p>
            </MobileCard>
          ))}
        </div>
        {BACKUPS.map((backup) => (
          <MobileCard key={backup.id}>
            <MobileCardHeader
              title={backup.id}
              code
              trailing={<Badge background={STATUS_STYLES[backup.status].bg} color={STATUS_STYLES[backup.status].fg}>{t(backup.status)}</Badge>}
            />
            <MobileCardRow label={t('Type')} value={t(backup.type)} />
            <MobileCardRow label={t('Size')} value={backup.size} />
            <MobileCardRow label={t('Date')} value={`${backup.date} ${backup.time}`} />
            <MobileCardRow label={t('Duration')} value={backup.duration} />
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
            <Icon name="Database" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Data Backup')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Backup schedules and restore points')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Backup History')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('ID')}</th>
                <th className="pb-3 font-medium">{t('Type')}</th>
                <th className="pb-3 font-medium">{t('Size')}</th>
                <th className="pb-3 font-medium">{t('Duration')}</th>
                <th className="pb-3 font-medium">{t('Date')}</th>
                <th className="pb-3 font-medium">{t('Destination')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {BACKUPS.map((backup) => (
                <tr key={backup.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-xs text-muted">{backup.id}</td>
                  <td className="py-3">
                    <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(backup.type)}</Badge>
                  </td>
                  <td className="py-3 text-body">{backup.size}</td>
                  <td className="py-3 text-body">{backup.duration}</td>
                  <td className="py-3 text-muted">{backup.date} {backup.time}</td>
                  <td className="py-3 text-body">{backup.destination}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[backup.status].bg} color={STATUS_STYLES[backup.status].fg}>{t(backup.status)}</Badge>
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
