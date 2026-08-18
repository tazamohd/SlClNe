import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Backup & Export (Backup.dc.html): run a backup, export the three core
 *  datasets, and review the nightly backup history.
 *
 *  Run Backup is an execute-class action, so it is gated on
 *  `can('settings', 'x')` — owner and superadmin only; a manager sees the
 *  exports and history but no run button. The mock repository cannot actually
 *  snapshot or produce files, so both actions acknowledge with a toast. */

interface BackupEntry {
  /** Completion timestamp, as the API will return it. */
  date: string
  /** Human-readable archive size. */
  size: string
}

/** The design's nightly 3 AM snapshots. There is no `backups` collection in
 *  the repository yet — when the REST layer lands this const becomes a
 *  `useCollection('backups')` read and nothing else here moves. */
const BACKUP_HISTORY: readonly BackupEntry[] = [
  { date: 'Jul 19, 2026, 3:00 AM', size: '482 MB' },
  { date: 'Jul 18, 2026, 3:00 AM', size: '479 MB' },
  { date: 'Jul 17, 2026, 3:00 AM', size: '476 MB' },
  { date: 'Jul 16, 2026, 3:00 AM', size: '471 MB' },
]

/** The three export targets the design offers. */
const EXPORTS = ['Export Customers', 'Export Job Cards', 'Export Invoices'] as const

export function Backup() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()

  return (
    // The design caps this page's content column at 800px.
    <div className="flex w-full max-w-[800px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-black text-heading">{t('Backup & Export')}</h1>
        {can('settings', 'x') ? (
          <Button
            className="w-full sm:w-auto"
            onClick={() =>
              toast.show({
                title: t('Backup started'),
                description: t('A new snapshot is being prepared.'),
              })
            }
          >
            <Icon name="RefreshCw" size={15} />
            {t('Run Backup Now')}
          </Button>
        ) : null}
      </div>

      <Card className="p-5">
        <h3 className="mb-3.5 text-base font-bold text-heading">{t('Export Data')}</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {EXPORTS.map((label) => (
            <Button
              key={label}
              variant="subtle"
              className="h-10 w-full justify-start font-normal sm:w-auto"
              onClick={() =>
                toast.show({
                  title: t('Export started'),
                  description: t(label),
                })
              }
            >
              <Icon name="Download" size={15} />
              {t(label)}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3.5 text-base font-bold text-heading">{t('Backup History')}</h3>
        <div className="flex flex-col">
          {BACKUP_HISTORY.map((backup) => (
            <div
              key={backup.date}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue">
                  <Icon name="Database" size={14} />
                </span>
                {/* Latin timestamp — pin LTR so the bidi algorithm keeps
                    "Jul 19, 2026, 3:00 AM" in order under Arabic. */}
                <span className="truncate text-[13px] text-body" dir="ltr">
                  {backup.date}
                </span>
              </div>
              <span className="flex-shrink-0 font-mono text-xs text-muted" dir="ltr">
                {backup.size}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
