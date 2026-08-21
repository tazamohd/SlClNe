import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money } from '@/components/ui/Money'

interface ServiceRecord {
  id: string
  date: string
  vehicle: string
  service: string
  technician: string
  cost: number
  status: 'Completed' | 'Warranty Claim'
}

const SERVICE_HISTORY: ServiceRecord[] = [
  { id: 'WO-8821', date: '2025-08-15', vehicle: '2022 Toyota Camry', service: 'Oil Change + Filter Replacement', technician: 'Ahmed Al-Farsi', cost: 350, status: 'Completed' },
  { id: 'WO-8798', date: '2025-08-12', vehicle: '2021 Honda Accord', service: 'Tire Rotation & Balance', technician: 'Saad Al-Otaibi', cost: 180, status: 'Completed' },
  { id: 'WO-8765', date: '2025-08-08', vehicle: '2022 Toyota Camry', service: 'AC Compressor Service', technician: 'Mohammed Al-Zahrani', cost: 1200, status: 'Completed' },
  { id: 'WO-8730', date: '2025-07-28', vehicle: '2023 Hyundai Tucson', service: 'First Scheduled Service', technician: 'Ahmed Al-Farsi', cost: 450, status: 'Completed' },
  { id: 'WO-8691', date: '2025-07-15', vehicle: '2020 Nissan Altima', service: 'Brake Pad Replacement', technician: 'Saad Al-Otaibi', cost: 890, status: 'Warranty Claim' },
  { id: 'WO-8650', date: '2025-07-01', vehicle: '2021 Honda Accord', service: 'Battery Replacement', technician: 'Mohammed Al-Zahrani', cost: 520, status: 'Completed' },
  { id: 'WO-8612', date: '2025-06-18', vehicle: '2022 Toyota Camry', service: 'Transmission Fluid Change', technician: 'Ahmed Al-Farsi', cost: 680, status: 'Completed' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'Warranty Claim': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function ClientPortalServiceHistory() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="History" title={t('Service History')} subtitle={t('Past services timeline')} />
        {SERVICE_HISTORY.map((s) => (
          <MobileCard key={s.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{s.service}</p>
                    <p className="text-xs text-muted">{s.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>}
            />
            <MobileCardRow label={t('Date')} value={s.date} />
            <MobileCardRow label={t('Technician')} value={s.technician} />
            <MobileCardRow label={t('Cost')} value={<Money sar={s.cost} />} />
            <MobileCardRow label={t('Work Order')} value={s.id} />
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
            <Icon name="History" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Service History')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Complete service timeline')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Work Order')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Technician')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Cost')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_HISTORY.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{s.id}</td>
                  <td className="py-3 pe-4 text-body">{s.date}</td>
                  <td className="py-3 pe-4 text-body">{s.vehicle}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{s.service}</td>
                  <td className="py-3 pe-4 text-body">{s.technician}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={s.cost} /></td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[s.status].bg} color={STATUS_STYLES[s.status].fg}>{t(s.status)}</Badge>
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
