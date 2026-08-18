import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

interface Integration {
  name: string
  status: string
  lastSync: string
  syncFrequency: string
  recordsSynced: number
}

const MOCK_INTEGRATIONS: readonly Integration[] = [
  { name: 'QuickBooks', status: 'Connected', lastSync: '2026-08-18 09:30', syncFrequency: 'Every 15 min', recordsSynced: 12450 },
  { name: 'Xero', status: 'Connected', lastSync: '2026-08-18 09:15', syncFrequency: 'Hourly', recordsSynced: 8320 },
  { name: 'SAP', status: 'Disconnected', lastSync: '2026-08-10 14:00', syncFrequency: 'Daily', recordsSynced: 45200 },
  { name: 'Oracle', status: 'Error', lastSync: '2026-08-17 22:45', syncFrequency: 'Every 30 min', recordsSynced: 3100 },
  { name: 'Sage', status: 'Disconnected', lastSync: 'Never', syncFrequency: 'Manual', recordsSynced: 0 },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Connected: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Disconnected: ['rgba(100,116,139,.1)', '#64748B'],
  Error: ['rgba(249,115,22,.1)', '#F97316'],
}

const STATUS_ICON: Record<string, string> = {
  Connected: 'ShieldCheck',
  Disconnected: 'ShieldOff',
  Error: 'ShieldAlert',
}

export function AccountingIntegration() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Link"
          title={t('Integrations')}
          subtitle={t('Accounting')}
        />
        <div className="flex flex-col gap-3">
          {MOCK_INTEGRATIONS.map((intg) => {
            const [bg, fg] = STATUS_PALETTE[intg.status] ?? STATUS_PALETTE.Disconnected
            return (
              <MobileCard key={intg.name}>
                <MobileCardHeader
                  title={intg.name}
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(intg.status)}
                    </Badge>
                  }
                />
                <MobileCardRow label={t('Last Sync')}>
                  <span dir="ltr">{intg.lastSync}</span>
                </MobileCardRow>
                <MobileCardRow label={t('Frequency')}>{t(intg.syncFrequency)}</MobileCardRow>
                <MobileCardRow label={t('Records Synced')}>
                  {intg.recordsSynced.toLocaleString('en-US')}
                </MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Link"
        title={t('Accounting Integrations')}
        subtitle={t('External system connections and sync status')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_INTEGRATIONS.map((intg) => {
          const [bg, fg] = STATUS_PALETTE[intg.status] ?? STATUS_PALETTE.Disconnected
          const iconName = STATUS_ICON[intg.status] ?? 'ShieldOff'
          return (
            <Card key={intg.name} className="flex flex-col gap-4 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex rounded-lg p-2"
                    style={{ background: bg, color: fg }}
                    aria-hidden
                  >
                    <Icon name={iconName} size={18} />
                  </span>
                  <span className="text-base font-bold text-heading">{intg.name}</span>
                </div>
                <Badge background={bg} color={fg}>{t(intg.status)}</Badge>
              </div>

              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('Last Sync')}</span>
                  <span className="text-body" dir="ltr">{intg.lastSync}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('Frequency')}</span>
                  <span className="text-body">{t(intg.syncFrequency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('Records Synced')}</span>
                  <span className="font-semibold text-heading">{intg.recordsSynced.toLocaleString('en-US')}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
