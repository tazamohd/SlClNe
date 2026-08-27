import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface ScanEntry {
  id: string
  partName: string
  partNo: string
  barcode: string
  scannedAt: string
  location: string
  action: 'Lookup' | 'Check-In' | 'Check-Out' | 'Count'
}

const RECENT_SCANS: ScanEntry[] = [
  { id: 'SCN-301', partName: 'Oil Filter 5W-30', partNo: 'OF-5W30', barcode: '6281023456789', scannedAt: '10:42 AM', location: 'Warehouse A', action: 'Check-In' },
  { id: 'SCN-300', partName: 'Brake Pad Set Front', partNo: 'BP-FRNT', barcode: '6281098765432', scannedAt: '10:38 AM', location: 'Bay 3', action: 'Check-Out' },
  { id: 'SCN-299', partName: 'Spark Plug Iridium', partNo: 'SP-IRID', barcode: '6281034567890', scannedAt: '10:30 AM', location: 'Warehouse B', action: 'Count' },
  { id: 'SCN-298', partName: 'Timing Belt Kit', partNo: 'TB-KIT', barcode: '6281045678901', scannedAt: '10:22 AM', location: 'Warehouse A', action: 'Lookup' },
  { id: 'SCN-297', partName: 'Air Filter Universal', partNo: 'AF-UNI', barcode: '6281056789012', scannedAt: '10:15 AM', location: 'Bay 1', action: 'Check-Out' },
]

const ACTION_STYLES: Record<string, { bg: string; fg: string }> = {
  Lookup: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'Check-In': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Check-Out': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Count: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
}

export function BarcodeScanner() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Scans Today'), value: '47', icon: 'ScanLine', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Check-Ins'), value: '18', icon: 'PackagePlus', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Check-Outs'), value: '22', icon: 'PackageMinus', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Lookups'), value: '7', icon: 'Search', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  ]

  const columns: Column<ScanEntry>[] = [
    {
      header: 'Part',
      cell: (s) => (
        <div>
          <p className="font-medium text-heading">{s.partName}</p>
          <p className="text-xs text-muted">{s.partNo}</p>
        </div>
      ),
    },
    { header: 'Barcode', cell: (s) => s.barcode, code: true },
    { header: 'Location', cell: (s) => s.location },
    { header: 'Time', cell: (s) => s.scannedAt },
    { header: 'Action', cell: (s) => <Badge background={ACTION_STYLES[s.action].bg} color={ACTION_STYLES[s.action].fg}>{t(s.action)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Recent barcode scans"
      columns={columns}
      rows={RECENT_SCANS}
      rowKey={(s) => s.id}
      mobileCard={(s) => (
        <>
          <MobileCardHeader title={s.partName} trailing={<Badge background={ACTION_STYLES[s.action].bg} color={ACTION_STYLES[s.action].fg}>{t(s.action)}</Badge>} />
          <MobileCardRow label={t('Barcode')} value={s.barcode} />
          <MobileCardRow label={t('Location')} value={s.location} />
          <MobileCardRow label={t('Time')} value={s.scannedAt} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScanLine" title={t('Barcode Scanner')} subtitle={t('Scan and track parts')} />
        <Card className="rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex rounded-2xl bg-[rgba(10,94,215,.1)] p-4 text-salis-blue" aria-hidden><Icon name="ScanLine" size={40} /></span>
            <p className="text-sm font-semibold text-heading">{t('Ready to Scan')}</p>
            <p className="text-xs text-muted">{t('Point camera at barcode to scan')}</p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
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
            <Icon name="ScanLine" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Barcode Scanner')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Scan barcodes for inventory operations')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1 flex flex-col items-center gap-4 rounded-2xl p-8 shadow-sm">
          <span className="flex rounded-2xl bg-[rgba(10,94,215,.1)] p-5 text-salis-blue" aria-hidden><Icon name="ScanLine" size={48} /></span>
          <p className="text-sm font-semibold text-heading">{t('Ready to Scan')}</p>
          <p className="text-center text-xs text-muted">{t('Connect a barcode scanner or use camera')}</p>
        </Card>
        <div className="col-span-2">
          {table}
        </div>
      </div>
    </div>
  )
}
