import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface SMSProvider {
  name: string
  status: 'Connected' | 'Disconnected' | 'Error'
  apiKey: string
  sentToday: number
  deliveryRate: number
  region: string
}

const PROVIDERS: SMSProvider[] = [
  { name: 'Unifonic', status: 'Connected', apiKey: '****-****-7A3F', sentToday: 124, deliveryRate: 98.5, region: 'Saudi Arabia' },
  { name: 'Twilio', status: 'Connected', apiKey: '****-****-9B2E', sentToday: 56, deliveryRate: 97.2, region: 'International' },
  { name: 'Taqnyat', status: 'Disconnected', apiKey: '****-****-4C1D', sentToday: 0, deliveryRate: 0, region: 'Saudi Arabia' },
]

interface SMSLog {
  id: string
  recipient: string
  type: 'Appointment' | 'Invoice' | 'Reminder' | 'Promotion' | 'OTP'
  status: 'Delivered' | 'Pending' | 'Failed'
  timestamp: string
  provider: string
}

const SMS_LOGS: SMSLog[] = [
  { id: 'SMS-4021', recipient: '+966 5xx xxx 412', type: 'Appointment', status: 'Delivered', timestamp: '10:15 AM', provider: 'Unifonic' },
  { id: 'SMS-4020', recipient: '+966 5xx xxx 891', type: 'Invoice', status: 'Delivered', timestamp: '10:08 AM', provider: 'Unifonic' },
  { id: 'SMS-4019', recipient: '+966 5xx xxx 234', type: 'OTP', status: 'Delivered', timestamp: '9:55 AM', provider: 'Twilio' },
  { id: 'SMS-4018', recipient: '+966 5xx xxx 567', type: 'Reminder', status: 'Pending', timestamp: '9:42 AM', provider: 'Unifonic' },
  { id: 'SMS-4017', recipient: '+966 5xx xxx 098', type: 'Promotion', status: 'Failed', timestamp: '9:30 AM', provider: 'Twilio' },
  { id: 'SMS-4016', recipient: '+966 5xx xxx 345', type: 'Appointment', status: 'Delivered', timestamp: '9:15 AM', provider: 'Unifonic' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Connected: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Disconnected: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Error: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Delivered: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Failed: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function SMSIntegration() {
  const { t } = usePreferences()

  const logColumns: Column<SMSLog>[] = [
    { header: 'ID', cell: (log) => log.id, code: true },
    { header: 'Recipient', cell: (log) => log.recipient },
    {
      header: 'Type',
      cell: (log) => (
        <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(log.type)}</Badge>
      ),
    },
    { header: 'Provider', cell: (log) => log.provider },
    { header: 'Time', cell: (log) => log.timestamp },
    {
      header: 'Status',
      cell: (log) => (
        <Badge background={STATUS_STYLES[log.status].bg} color={STATUS_STYLES[log.status].fg}>{t(log.status)}</Badge>
      ),
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquareText" title={t('SMS Integration')} subtitle={t('SMS provider setup and message logs')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PROVIDERS.map((provider, i) => (
          <Card key={i} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                  <Icon name="Radio" size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-heading">{provider.name}</p>
                  <p className="text-xs text-muted">{provider.region}</p>
                </div>
              </div>
              <Badge background={STATUS_STYLES[provider.status].bg} color={STATUS_STYLES[provider.status].fg}>{t(provider.status)}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted">{t('Sent Today')}</p>
                <p className="text-lg font-bold text-heading">{provider.sentToday}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Delivery Rate')}</p>
                <p className="text-lg font-bold text-heading">{provider.deliveryRate > 0 ? `${provider.deliveryRate}%` : '-'}</p>
              </div>
            </div>
            <p className="mt-3 font-mono text-xs text-muted">{t('API Key')}: {provider.apiKey}</p>
          </Card>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Message Log')}</p>
        <DataTable
          caption="SMS message log"
          columns={logColumns}
          rows={SMS_LOGS}
          rowKey={(log) => log.id}
          empty={t('No messages found')}
          mobileCard={(log) => (
            <>
              <MobileCardHeader
                title={log.id}
                code
                trailing={<Badge background={STATUS_STYLES[log.status].bg} color={STATUS_STYLES[log.status].fg}>{t(log.status)}</Badge>}
              />
              <MobileCardRow label={t('Recipient')} value={log.recipient} />
              <MobileCardRow label={t('Type')} value={t(log.type)} />
              <MobileCardRow label={t('Provider')} value={log.provider} />
              <MobileCardRow label={t('Time')} value={log.timestamp} />
            </>
          )}
        />
      </div>
    </div>
  )
}
