import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface PartRequest {
  id: string
  partName: string
  partNumber: string
  workOrder: string
  quantity: number
  status: 'Approved' | 'Pending' | 'Delivered' | 'Out of Stock'
  requestDate: string
}

const PART_REQUESTS: PartRequest[] = [
  { id: 'PR-501', partName: 'Brake Pads (Front)', partNumber: 'BP-TOY-4821', workOrder: 'WO-8830', quantity: 2, status: 'Delivered', requestDate: '2025-08-17' },
  { id: 'PR-502', partName: 'Oil Filter', partNumber: 'OF-HON-2210', workOrder: 'WO-8831', quantity: 1, status: 'Approved', requestDate: '2025-08-18' },
  { id: 'PR-503', partName: 'AC Compressor', partNumber: 'AC-HYU-3301', workOrder: 'WO-8832', quantity: 1, status: 'Pending', requestDate: '2025-08-18' },
  { id: 'PR-504', partName: 'Transmission Fluid (4L)', partNumber: 'TF-NIS-5500', workOrder: 'WO-8833', quantity: 4, status: 'Out of Stock', requestDate: '2025-08-16' },
  { id: 'PR-505', partName: 'Shock Absorber (Rear)', partNumber: 'SA-TOY-7701', workOrder: 'WO-8834', quantity: 2, status: 'Pending', requestDate: '2025-08-18' },
  { id: 'PR-506', partName: 'Spark Plugs', partNumber: 'SP-TOY-1100', workOrder: 'WO-8831', quantity: 4, status: 'Delivered', requestDate: '2025-08-15' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Approved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Delivered: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Out of Stock': { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function TechnicianPortalParts() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Requests'), value: String(PART_REQUESTS.length), icon: 'Package', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: '2', icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Delivered'), value: '2', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Out of Stock'), value: '1', icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  ]

  const columns: Column<PartRequest>[] = [
    { header: t('Ref'), cell: (p) => p.id },
    { header: t('Part Name'), cell: (p) => p.partName },
    { header: t('Part No.'), cell: (p) => p.partNumber },
    { header: t('Work Order'), cell: (p) => p.workOrder },
    { header: t('Qty'), cell: (p) => p.quantity },
    { header: t('Requested'), cell: (p) => p.requestDate },
    { header: t('Status'), cell: (p) => <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Parts Requests')} subtitle={t('Request and track parts')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Parts requests"
        columns={columns}
        rows={PART_REQUESTS}
        rowKey={(p) => p.id}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.partName} trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>} />
            <MobileCardRow label={t('Part No.')}>{p.partNumber}</MobileCardRow>
            <MobileCardRow label={t('Work Order')}>{p.workOrder}</MobileCardRow>
            <MobileCardRow label={t('Quantity')}>{p.quantity}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
