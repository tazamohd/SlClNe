import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  const { data: jobData = [], isLoading, isError, error, refetch } = useCollection('jobs')
  const slots = useSlots(t)
  const [selectedBay, setSelectedBay] = useState<string | null>(null)

  if (isLoading) return <Loading label="Loading calendar..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const activeJobs = jobData.length
  const occupiedSlots = slots.filter((s) => s.status === 'occupied').length
  const availableSlots = BAYS.length * HOURS.length - occupiedSlots

  const kpis = [
    { label: t('Active Jobs'), value: String(activeJobs), icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Occupied Slots'), value: String(occupiedSlots), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Available Slots'), value: String(availableSlots), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Bays'), value: String(BAYS.length), icon: 'LayoutGrid', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
  ]

  const filteredSlots = selectedBay ? slots.filter((s) => s.bay === selectedBay) : slots

  const bayColumns: Column<typeof HOURS[number]>[] = [
    { header: 'Time', cell: (h) => h, code: true },
    ...BAYS.map((bay) => ({
      header: bay,
      cell: (h: typeof HOURS[number]) => {
        const slot = slots.find((s) => s.bay === bay && s.hour === h)
        if (slot?.status === 'occupied') {
          return (
            <div className="rounded-lg bg-[rgba(10,94,215,.06)] p-2">
              <p className="text-xs font-semibold text-heading">{slot.vehicle}</p>
              <p className="font-mono text-[10px] text-muted" dir="ltr">{slot.job}</p>
            </div>
          )
        }
        if (slot?.status === 'break') {
          return <Badge background="var(--tint-orange)" color="var(--salis-orange)">{t('Break')}</Badge>
        }
        return <span className="text-xs text-faint">—</span>
      },
    })),
  ]

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
        <ChipGroup label={t('Bay')}>
          <Chip label={t('All Bays')} selected={!selectedBay} onToggle={() => setSelectedBay(null)} />
          {BAYS.map((b) => (
            <Chip key={b} label={t(b)} selected={selectedBay === b} onToggle={() => setSelectedBay(b)} />
          ))}
        </ChipGroup>
        {filteredSlots.filter((s) => s.status === 'occupied').map((s, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[var(--tint-blue)] text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
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
      <PageHeader icon="CalendarDays" title={t('Workshop Calendar')} subtitle={t('Workshop')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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

      <DataTable
        caption="Bay schedule"
        columns={bayColumns}
        rows={[...HOURS]}
        rowKey={(h) => h}
      />
    </div>
  )
}
