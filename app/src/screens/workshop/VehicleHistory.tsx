import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

interface ServiceRecord {
  date: string
  type: string
  technician: string
  status: string
  cost: number
}

function useRecords(t: (s: string) => string): ServiceRecord[] {
  return useMemo(
    () => [
      { date: '2026-08-10', type: t('Full Service'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 2800 },
      { date: '2026-07-15', type: t('Oil Change'), technician: t('Mohammed Saeed'), status: t('Completed'), cost: 450 },
      { date: '2026-06-20', type: t('Brake Inspection'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 1200 },
      { date: '2026-05-05', type: t('Tire Rotation'), technician: t('Khalid Omar'), status: t('Completed'), cost: 300 },
      { date: '2026-03-12', type: t('AC Service'), technician: t('Mohammed Saeed'), status: t('Completed'), cost: 850 },
      { date: '2026-01-20', type: t('Full Service'), technician: t('Ahmad Al-Harbi'), status: t('Completed'), cost: 3200 },
    ],
    [t],
  )
}

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA')}`
}

export function VehicleHistory() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const records = useRecords(t)

  const totalSpent = records.reduce((s, r) => s + r.cost, 0)

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="History" title={t('Vehicle History')} subtitle={t('Service Records')} />
        <MobileCard>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t('Total Spent')}</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(totalSpent)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted">{t('Total Services')}</span>
            <span className="font-mono text-sm font-bold text-heading">{records.length}</span>
          </div>
        </MobileCard>
        {records.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.type}</p>
                    <p className="text-xs text-muted" dir="ltr">{r.date} · {r.technician}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(r.cost)}</span>
              <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status}</Badge>
            </div>
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Vehicle History')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Service Records')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="DollarSign" size={16} /></span>
            <span className="text-xs font-medium text-muted">{t('Total Spent')}</span>
          </div>
          <h4 dir="ltr" className="mt-2 font-mono text-xl font-black text-heading">{fmtSar(totalSpent)}</h4>
        </Card>
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-1.5 bg-[rgba(11,179,255,.1)] text-salis-bright" aria-hidden><Icon name="ClipboardList" size={16} /></span>
            <span className="text-xs font-medium text-muted">{t('Total Services')}</span>
          </div>
          <h4 className="mt-2 font-display text-xl font-black text-heading">{records.length}</h4>
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Service Timeline')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Technician')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Cost')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{r.date}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{r.type}</td>
                  <td className="py-3 pe-4 text-body">{r.technician}</td>
                  <td className="py-3 pe-4 text-end font-mono font-medium text-heading" dir="ltr">{fmtSar(r.cost)}</td>
                  <td className="py-3"><Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
