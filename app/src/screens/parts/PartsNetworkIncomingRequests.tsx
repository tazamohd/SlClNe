import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface IncomingRequest {
  id: string
  requestor: string
  shop: string
  partName: string
  partNumber: string
  quantity: number
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'New' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired'
  receivedAt: string
  vehicle: string
}

const INCOMING_REQUESTS: IncomingRequest[] = [
  { id: 'IR-3042', requestor: 'Fahad Al-Harbi', shop: 'Jeddah Auto Care', partName: 'Spark Plug Set', partNumber: '90919-01253', quantity: 4, urgency: 'Medium', status: 'New', receivedAt: '20 min ago', vehicle: 'Toyota Land Cruiser 2024' },
  { id: 'IR-3041', requestor: 'Sultan Al-Dosari', shop: 'Dammam Motors', partName: 'Water Pump', partNumber: '25100-2G500', quantity: 1, urgency: 'High', status: 'New', receivedAt: '1 hour ago', vehicle: 'Hyundai Santa Fe 2023' },
  { id: 'IR-3040', requestor: 'Nawaf Al-Shammari', shop: 'Al Khobar Workshop', partName: 'CV Joint Boot Kit', partNumber: '44018-SNA-A01', quantity: 2, urgency: 'Low', status: 'Quoted', receivedAt: '3 hours ago', vehicle: 'Honda Civic 2024' },
  { id: 'IR-3039', requestor: 'Bader Al-Mutairi', shop: 'Tabuk Service Center', partName: 'Fuel Injector', partNumber: '23250-0D050', quantity: 4, urgency: 'Critical', status: 'Accepted', receivedAt: '5 hours ago', vehicle: 'Toyota Camry 2023' },
  { id: 'IR-3038', requestor: 'Mohammed Al-Qahtani', shop: 'Riyadh North Auto', partName: 'Serpentine Belt', partNumber: '25212-2E100', quantity: 1, urgency: 'Medium', status: 'Declined', receivedAt: 'Yesterday', vehicle: 'Kia Sportage 2025' },
  { id: 'IR-3037', requestor: 'Abdulrahman Nasser', shop: 'Madinah Cars', partName: 'Shock Absorber - Rear', partNumber: '55300-F2000', quantity: 2, urgency: 'Low', status: 'Expired', receivedAt: '2 days ago', vehicle: 'Hyundai Elantra 2024' },
]

const URGENCY_STYLES: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Medium: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  High: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Critical: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  New: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Quoted: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Accepted: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  Declined: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Expired: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PartsNetworkIncomingRequests() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const newCount = INCOMING_REQUESTS.filter((r) => r.status === 'New').length

  const columns: Column<IncomingRequest>[] = [
    { header: 'ID', cell: (req) => req.id, code: true },
    {
      header: 'Requestor',
      cell: (req) => (
        <div>
          <p className="text-body">{req.requestor}</p>
          <p className="text-xs text-muted">{req.shop}</p>
        </div>
      ),
    },
    {
      header: 'Part',
      cell: (req) => (
        <div>
          <p className="text-body">{req.partName}</p>
          <p className="font-mono text-xs text-muted">{req.partNumber}</p>
        </div>
      ),
    },
    { header: 'Vehicle', cell: (req) => req.vehicle },
    { header: 'Qty', cell: (req) => req.quantity },
    { header: 'Urgency', cell: (req) => <Badge background={URGENCY_STYLES[req.urgency].bg} color={URGENCY_STYLES[req.urgency].fg}>{t(req.urgency)}</Badge> },
    { header: 'Received', cell: (req) => req.receivedAt },
    { header: 'Status', cell: (req) => <Badge background={STATUS_STYLES[req.status].bg} color={STATUS_STYLES[req.status].fg}>{t(req.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="Incoming parts requests"
      columns={columns}
      rows={INCOMING_REQUESTS}
      rowKey={(req) => req.id}
      mobileCard={(req) => (
        <>
          <MobileCardHeader title={req.id} code trailing={<Badge background={STATUS_STYLES[req.status].bg} color={STATUS_STYLES[req.status].fg}>{t(req.status)}</Badge>} />
          <MobileCardRow label={t('From')} value={`${req.requestor} - ${req.shop}`} />
          <MobileCardRow label={t('Part')} value={req.partName} />
          <MobileCardRow label={t('Vehicle')} value={req.vehicle} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Inbox" title={t('Incoming Requests')} subtitle={t('From parts network')} />
        {newCount > 0 && (
          <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{newCount} {t('new')}</Badge>
        )}
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
            <Icon name="Inbox" size={28} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[30px] font-black text-heading">{t('Incoming Requests')}</h1>
            {newCount > 0 && (
              <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{newCount} {t('new')}</Badge>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted">{t('Parts requests from your network')}</p>
        </div>
      </div>

      {table}
    </div>
  )
}
