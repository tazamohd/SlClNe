import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

interface Quotation {
  id: string
  supplier: string
  description: string
  items: number
  total: number
  validUntil: string
  status: 'Received' | 'Under Review' | 'Accepted' | 'Rejected' | 'Expired'
}

const QUOTATIONS: Quotation[] = [
  { id: 'QT-701', supplier: 'Al-Futtaim Parts', description: 'Brake components bulk order', items: 45, total: 28500, validUntil: '2025-08-30', status: 'Under Review' },
  { id: 'QT-698', supplier: 'Brembo KSA', description: 'Premium brake pads Q4 supply', items: 200, total: 56000, validUntil: '2025-09-15', status: 'Received' },
  { id: 'QT-695', supplier: 'NGK Middle East', description: 'Spark plugs annual contract', items: 500, total: 15000, validUntil: '2025-08-25', status: 'Accepted' },
  { id: 'QT-690', supplier: 'Gates Automotive', description: 'Timing belt kits batch', items: 30, total: 19500, validUntil: '2025-08-20', status: 'Under Review' },
  { id: 'QT-685', supplier: 'Denso Gulf', description: 'Filters and sensors package', items: 120, total: 9600, validUntil: '2025-08-10', status: 'Expired' },
  { id: 'QT-680', supplier: 'Bosch Arabia', description: 'Wiper blades seasonal stock', items: 80, total: 4800, validUntil: '2025-08-05', status: 'Rejected' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Received: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Under Review': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Accepted: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Rejected: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Expired: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PurchaseAgentQuotations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Active Quotes'), value: '4', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(133400), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending Review'), value: '2', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Accepted'), value: '1', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileText" title={t('Quotations')} subtitle={t('Supplier quotes')} />
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
        {QUOTATIONS.map((q) => (
          <MobileCard key={q.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="FileText" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{q.id}</p>
                    <p className="text-xs text-muted">{q.supplier}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[q.status].bg} color={STATUS_STYLES[q.status].fg}>{t(q.status)}</Badge>}
            />
            <MobileCardRow label={t('Description')} value={q.description} />
            <MobileCardRow label={t('Items')} value={String(q.items)} />
            <MobileCardRow label={t('Total')} value={<Money sar={q.total} />} />
            <MobileCardRow label={t('Valid Until')} value={q.validUntil} />
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
            <Icon name="FileText" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Quotations')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Supplier quotation management')}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Quote')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Description')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Items')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Total')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Valid Until')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {QUOTATIONS.map((q) => (
                <tr key={q.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{q.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{q.supplier}</td>
                  <td className="py-3 pe-4 text-body">{q.description}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{q.items}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={q.total} /></td>
                  <td className="py-3 pe-4 text-body">{q.validUntil}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[q.status].bg} color={STATUS_STYLES[q.status].fg}>{t(q.status)}</Badge>
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
