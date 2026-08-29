import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { MobileCard, MobileCardHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface BackupEntry {
  date: string
  size: string
}

const FIXTURE_BACKUPS: BackupEntry[] = [
  { date: 'Jul 19, 2026, 3:00 AM', size: '482 MB' },
  { date: 'Jul 18, 2026, 3:00 AM', size: '479 MB' },
  { date: 'Jul 17, 2026, 3:00 AM', size: '476 MB' },
  { date: 'Jul 16, 2026, 3:00 AM', size: '471 MB' },
]

export function Backup() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const handleRunBackup = () => {
    toast.show({ title: t('Backup started') })
  }

  const handleExport = (_entity: string) => {
    toast.show({ title: t('Export started') })
  }

  return (
    <div className="flex max-w-[800px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[30px] font-black text-heading">
          {t('Backup & Export')}
        </h1>
        <Button onClick={handleRunBackup} disabled={!isLive}>
          <Icon name="RefreshCw" size={15} />
          {t('Run Backup Now')}
        </Button>
      </div>

      <Card className="flex flex-col gap-3.5 rounded-2xl p-5">
        <h2 className="text-base font-bold text-heading">{t('Export Data')}</h2>
        <div className={isMobile ? 'flex flex-col gap-3' : 'flex flex-wrap gap-3'}>
          <Button
            variant="outline"
            onClick={() => handleExport('customers')}
            disabled={!isLive}
          >
            <Icon name="Download" size={15} />
            {t('Export Customers')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('jobs')}
            disabled={!isLive}
          >
            <Icon name="Download" size={15} />
            {t('Export Job Cards')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('invoices')}
            disabled={!isLive}
          >
            <Icon name="Download" size={15} />
            {t('Export Invoices')}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 rounded-2xl p-5">
        <h2 className="text-base font-bold text-heading">{t('Backup History')}</h2>

        {isMobile ? (
          <div className="flex flex-col gap-2.5">
            {FIXTURE_BACKUPS.map((b) => (
              <MobileCard key={b.date}>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2.5">
                      <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-1.5 text-salis-blue">
                        <Icon name="Database" size={14} />
                      </span>
                      <span className="text-[13px] text-body">{b.date}</span>
                    </div>
                  }
                  trailing={
                    <span className="font-mono text-xs text-muted">{b.size}</span>
                  }
                />
              </MobileCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {FIXTURE_BACKUPS.map((b) => (
              <div
                key={b.date}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue">
                    <Icon name="Database" size={14} />
                  </span>
                  <span className="text-[13px] text-body">{b.date}</span>
                </div>
                <span className="font-mono text-xs text-muted">{b.size}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
