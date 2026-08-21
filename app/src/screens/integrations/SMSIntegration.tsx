import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Error: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Delivered: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Failed: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function SMSIntegration() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="MessageSquareText" title={t('SMS Integration')} subtitle={t('Provider configuration')} />
        <p className="text-xs font-bold text-heading">{t('Providers')}</p>
        {PROVIDERS.map((provider, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={provider.name}
              trailing={<Badge background={STATUS_STYLES[provider.status].bg} color={STATUS_STYLES[provider.status].fg}>{t(provider.status)}</Badge>}
            />
            <MobileCardRow label={t('Region')} value={provider.region} />
            <MobileCardRow label={t('Sent Today')} value={provider.sentToday} />
            <MobileCardRow label={t('Delivery Rate')} value={provider.deliveryRate > 0 ? `${provider.deliveryRate}%` : '-'} />
          </MobileCard>
        ))}
        <p className="mt-2 text-xs font-bold text-heading">{t('Recent Messages')}</p>
        {SMS_LOGS.map((log) => (
          <MobileCard key={log.id}>
            <MobileCardHeader
              title={log.id}
              code
              trailing={<Badge background={STATUS_STYLES[log.status].bg} color={STATUS_STYLES[log.status].fg}>{t(log.status)}</Badge>}
            />
            <MobileCardRow label={t('Recipient')} value={log.recipient} />
            <MobileCardRow label={t('Type')} value={t(log.type)} />
            <MobileCardRow label={t('Time')} value={log.timestamp} />
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
            <Icon name="MessageSquareText" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('SMS Integration')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('SMS provider setup and message logs')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Message Log')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('ID')}</th>
                <th className="pb-3 font-medium">{t('Recipient')}</th>
                <th className="pb-3 font-medium">{t('Type')}</th>
                <th className="pb-3 font-medium">{t('Provider')}</th>
                <th className="pb-3 font-medium">{t('Time')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {SMS_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-xs text-muted">{log.id}</td>
                  <td className="py-3 text-body">{log.recipient}</td>
                  <td className="py-3">
                    <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(log.type)}</Badge>
                  </td>
                  <td className="py-3 text-body">{log.provider}</td>
                  <td className="py-3 text-muted">{log.timestamp}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[log.status].bg} color={STATUS_STYLES[log.status].fg}>{t(log.status)}</Badge>
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
