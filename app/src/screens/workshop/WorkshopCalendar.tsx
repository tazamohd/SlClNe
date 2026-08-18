import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

const BAYS = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'] as const
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'] as const

interface BaySlot {
  bay: string
  hour: string
  job: string | null
  vehicle: string | null
  status: 'occupied' | 'available' | 'break'
}

function useSlots(t: (s: string) => string): BaySlot[] {
  return useMemo(
    () => [
      { bay: 'Bay 1', hour: '08:00', job: 'JC-2026-0481', vehicle: t('Toyota Camry'), status: 'occupied' },
      { bay: 'Bay 1', hour: '09:00', job: 'JC-2026-0481', vehicle: t('Toyota Camry'), status: 'occupied' },
      { bay: 'Bay 1', hour: '10:00', job: 'JC-2026-0482', vehicle: t('Honda Accord'), status: 'occupied' },
      { bay: 'Bay 2', hour: '08:00', job: 'JC-2026-0483', vehicle: t('Hyundai Sonata'), status: 'occupied' },
      { bay: 'Bay 2', hour: '09:00', job: null, vehicle: null, status: 'available' },
      { bay: 'Bay 3', hour: '08:00', job: null, vehicle: null, status: 'available' },
      { bay: 'Bay 3', hour: '12:00', job: null, vehicle: null, status: 'break' },
      { bay: 'Bay 4', hour: '14:00', job: 'JC-2026-0484', vehicle: t('Nissan Altima'), status: 'occupied' },
    ],
    [t],
  )
}

export function WorkshopCalendar() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const jobs = useCollection('jobs')
  const slots = useSlots(t)
  const [selectedBay, setSelectedBay] = useState<string | null>(null)

  const activeJobs = (jobs.data ?? []).length
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length
  const availableSlots = BAYS.length * HOURS.length - occupiedSlots

  const kpis = [
    { label: t('Active Jobs'), value: String(activeJobs), icon: 'Wrench', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Occupied Slots'), value: String(occupiedSlots), icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Available Slots'), value: String(availableSlots), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Bays'), value: String(BAYS.length), icon: 'LayoutGrid', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  const filteredSlots = selectedBay ? slots.filter((s) => s.bay === selectedBay) : slots

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CalendarDays" title={t('Workshop Calendar')} subtitle={t('Workshop')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button type="button" onClick={() => setSelectedBay(null)} className={'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ' + (!selectedBay ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue' : 'border-border text-muted')}>
            {t('All Bays')}
          </button>
          {BAYS.map((b) => (
            <button key={b} type="button" onClick={() => setSelectedBay(b)} className={'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ' + (selectedBay === b ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue' : 'border-border text-muted')}>
              {t(b)}
            </button>
          ))}
        </div>
        {filteredSlots.filter((s) => s.status === 'occupied').map((s, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{s.vehicle}</p>
                    <p className="text-xs text-muted">{t(s.bay)} · {s.hour} · {s.job}</p>
                  </div>
                </div>
              }
            />
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
            <Icon name="CalendarDays" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Workshop Calendar')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Workshop')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Bay Schedule')}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 pe-4 text-start text-xs font-medium text-muted">{t('Time')}</th>
              {BAYS.map((b) => (
                <th key={b} className="pb-3 pe-4 text-start text-xs font-medium text-muted">{t(b)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h} className="border-b border-border/50">
                <td className="py-2 pe-4 font-mono text-xs text-muted" dir="ltr">{h}</td>
                {BAYS.map((b) => {
                  const slot = slots.find((s) => s.bay === b && s.hour === h)
                  return (
                    <td key={b} className="py-2 pe-4">
                      {slot?.status === 'occupied' ? (
                        <div className="rounded-lg bg-[rgba(10,94,215,.06)] p-2">
                          <p className="text-xs font-semibold text-heading">{slot.vehicle}</p>
                          <p className="font-mono text-[10px] text-muted" dir="ltr">{slot.job}</p>
                        </div>
                      ) : slot?.status === 'break' ? (
                        <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">{t('Break')}</Badge>
                      ) : (
                        <span className="text-xs text-faint">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
