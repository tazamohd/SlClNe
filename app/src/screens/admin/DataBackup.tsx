import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Failed: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
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

  const columns: Column<BackupRecord>[] = [
    { header: 'ID', cell: (b) => b.id, code: true },
    { header: 'Type', cell: (b) => <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(b.type)}</Badge> },
    { header: 'Size', cell: (b) => b.size },
    { header: 'Duration', cell: (b) => b.duration },
    { header: 'Date', cell: (b) => <span className="text-muted">{b.date} {b.time}</span> },
    { header: 'Destination', cell: (b) => b.destination },
    { header: 'Status', cell: (b) => <Badge background={STATUS_STYLES[b.status].bg} color={STATUS_STYLES[b.status].fg}>{t(b.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Backup History"
      columns={columns}
      rows={BACKUPS}
      rowKey={(b) => b.id}
      mobileCard={(backup) => (
        <>
          <MobileCardHeader
            title={backup.id}
            code
            trailing={<Badge background={STATUS_STYLES[backup.status].bg} color={STATUS_STYLES[backup.status].fg}>{t(backup.status)}</Badge>}
          />
          <MobileCardRow label={t('Type')} value={t(backup.type)} />
          <MobileCardRow label={t('Size')} value={backup.size} />
          <MobileCardRow label={t('Date')} value={`${backup.date} ${backup.time}`} />
          <MobileCardRow label={t('Duration')} value={backup.duration} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Database" title={t('Data Backup')} subtitle={t('Backup management')} />
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat) => (
            <Card key={stat.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                  <Icon name={stat.icon} size={14} />
                </span>
                <span className="text-[11px] font-medium text-muted">{t(stat.label)}</span>
              </div>
              <h4 className="mt-1.5 font-display text-lg font-black text-heading">{stat.value}</h4>
            </Card>
          ))}
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

      {table}
    </div>
  )
}
