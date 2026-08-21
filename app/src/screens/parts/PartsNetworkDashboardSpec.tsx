import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface NetworkNode {
  name: string
  type: 'Warehouse' | 'Hub' | 'Branch' | 'Supplier'
  city: string
  skus: number
  unitsStored: number
  fillRate: number
  status: 'Online' | 'Maintenance' | 'Offline'
}

interface TransferRequest {
  id: string
  from: string
  to: string
  parts: string
  qty: number
  urgency: 'Urgent' | 'Standard' | 'Low'
  eta: string
}

const NODES: NetworkNode[] = [
  { name: 'Riyadh Central Warehouse', type: 'Warehouse', city: 'Riyadh', skus: 2840, unitsStored: 45200, fillRate: 94.2, status: 'Online' },
  { name: 'Jeddah Distribution Hub', type: 'Hub', city: 'Jeddah', skus: 1920, unitsStored: 28600, fillRate: 91.5, status: 'Online' },
  { name: 'Dammam Parts Center', type: 'Hub', city: 'Dammam', skus: 1340, unitsStored: 18400, fillRate: 88.7, status: 'Online' },
  { name: 'Riyadh North Branch', type: 'Branch', city: 'Riyadh', skus: 620, unitsStored: 4800, fillRate: 82.1, status: 'Online' },
  { name: 'Jeddah South Branch', type: 'Branch', city: 'Jeddah', skus: 480, unitsStored: 3200, fillRate: 79.4, status: 'Maintenance' },
  { name: 'Makkah Service Point', type: 'Branch', city: 'Makkah', skus: 310, unitsStored: 2100, fillRate: 85.6, status: 'Online' },
  { name: 'Al-Rajhi Auto Parts', type: 'Supplier', city: 'Riyadh', skus: 1450, unitsStored: 32000, fillRate: 97.8, status: 'Online' },
  { name: 'Gulf Motor Supply', type: 'Supplier', city: 'Jeddah', skus: 890, unitsStored: 18500, fillRate: 95.2, status: 'Offline' },
]

const TRANSFERS: TransferRequest[] = [
  { id: 'TRF-0284', from: 'Riyadh Central', to: 'Riyadh North Branch', parts: 'Oil Filters (x50)', qty: 50, urgency: 'Standard', eta: 'Aug 19, 2026' },
  { id: 'TRF-0283', from: 'Jeddah Hub', to: 'Makkah Service Point', parts: 'Brake Pads (x20)', qty: 20, urgency: 'Urgent', eta: 'Aug 18, 2026' },
  { id: 'TRF-0282', from: 'Al-Rajhi Auto Parts', to: 'Dammam Center', parts: 'Cabin Filters (x100)', qty: 100, urgency: 'Standard', eta: 'Aug 20, 2026' },
  { id: 'TRF-0281', from: 'Riyadh Central', to: 'Jeddah Hub', parts: 'Alternators (x10)', qty: 10, urgency: 'Low', eta: 'Aug 22, 2026' },
  { id: 'TRF-0280', from: 'Gulf Motor Supply', to: 'Riyadh Central', parts: 'Spark Plug Sets (x200)', qty: 200, urgency: 'Urgent', eta: 'Aug 18, 2026' },
]

const NODE_TYPE_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  Warehouse: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'Warehouse' },
  Hub: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)', icon: 'GitBranch' },
  Branch: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)', icon: 'Building' },
  Supplier: { bg: 'rgba(107,114,128,.15)', fg: 'rgb(107,114,128)', icon: 'Factory' },
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Online: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Maintenance: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Offline: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
}

const URGENCY_STYLES: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  Standard: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PartsNetworkDashboardSpec() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalSKUs = NODES.reduce((sum, n) => sum + n.skus, 0)
  const totalUnits = NODES.reduce((sum, n) => sum + n.unitsStored, 0)
  const avgFillRate = (NODES.reduce((sum, n) => sum + n.fillRate, 0) / NODES.length).toFixed(1)

  const kpis = [
    { label: t('Network Nodes'), value: String(NODES.length), icon: 'Network', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total SKUs'), value: totalSKUs.toLocaleString(), icon: 'Package', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Total Units'), value: `${(totalUnits / 1000).toFixed(0)}K`, icon: 'Boxes', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Fill Rate'), value: `${avgFillRate}%`, icon: 'BarChart3', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Network" title={t('Parts Network')} subtitle={t('Network overview')} />
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

        <p className="text-[13px] font-bold text-heading">{t('Network Nodes')}</p>
        {NODES.map((n) => (
          <MobileCard key={n.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: NODE_TYPE_STYLES[n.type].bg, color: NODE_TYPE_STYLES[n.type].fg }} aria-hidden>
                    <Icon name={NODE_TYPE_STYLES[n.type].icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{n.name}</p>
                    <p className="text-xs text-muted">{n.city}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[n.status].bg} color={STATUS_STYLES[n.status].fg}>{t(n.status)}</Badge>}
            />
            <MobileCardRow label={t('Type')} value={t(n.type)} />
            <MobileCardRow label={t('SKUs')} value={n.skus.toLocaleString()} />
            <MobileCardRow label={t('Units')} value={n.unitsStored.toLocaleString()} />
            <MobileCardRow label={t('Fill Rate')} value={`${n.fillRate}%`} />
          </MobileCard>
        ))}

        <p className="text-[13px] font-bold text-heading">{t('Active Transfers')}</p>
        {TRANSFERS.map((tr) => (
          <MobileCard key={tr.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="ArrowRightLeft" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{tr.id}</p>
                    <p className="text-xs text-muted">{tr.parts}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={URGENCY_STYLES[tr.urgency].bg} color={URGENCY_STYLES[tr.urgency].fg}>{t(tr.urgency)}</Badge>}
            />
            <MobileCardRow label={t('From')} value={tr.from} />
            <MobileCardRow label={t('To')} value={tr.to} />
            <MobileCardRow label={t('Qty')} value={String(tr.qty)} />
            <MobileCardRow label={t('ETA')} value={tr.eta} />
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
            <Icon name="Network" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Parts Network')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Network nodes, inventory, and transfers')}</p>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Network Nodes')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Node')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('City')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('SKUs')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Units')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Fill Rate')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {NODES.map((n) => (
                <tr key={n.name} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{n.name}</td>
                  <td className="py-3 pe-4">
                    <Badge background={NODE_TYPE_STYLES[n.type].bg} color={NODE_TYPE_STYLES[n.type].fg}>{t(n.type)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">{n.city}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{n.skus.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{n.unitsStored.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{n.fillRate}%</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[n.status].bg} color={STATUS_STYLES[n.status].fg}>{t(n.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Active Transfers')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Transfer #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('From')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('To')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Parts')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Qty')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Urgency')}</th>
                <th className="pb-3 text-start font-medium">{t('ETA')}</th>
              </tr>
            </thead>
            <tbody>
              {TRANSFERS.map((tr) => (
                <tr key={tr.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono font-semibold text-heading" dir="ltr">{tr.id}</td>
                  <td className="py-3 pe-4 text-body">{tr.from}</td>
                  <td className="py-3 pe-4 text-body">{tr.to}</td>
                  <td className="py-3 pe-4 text-body">{tr.parts}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{tr.qty}</td>
                  <td className="py-3 pe-4">
                    <Badge background={URGENCY_STYLES[tr.urgency].bg} color={URGENCY_STYLES[tr.urgency].fg}>{t(tr.urgency)}</Badge>
                  </td>
                  <td className="py-3 text-muted">{tr.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
