import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

interface Payment {
  id: string
  supplier: string
  poRef: string
  amount: number
  dueDate: string
  method: string
  status: 'Paid' | 'Pending' | 'Overdue' | 'Scheduled'
}

const PAYMENTS: Payment[] = [
  { id: 'PAY-3021', supplier: 'Al-Futtaim Parts', poRef: 'PO-2401', amount: 12500, dueDate: '2025-08-20', method: 'Bank Transfer', status: 'Pending' },
  { id: 'PAY-3018', supplier: 'Brembo KSA', poRef: 'PO-2398', amount: 8400, dueDate: '2025-08-15', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-3015', supplier: 'NGK Middle East', poRef: 'PO-2395', amount: 3600, dueDate: '2025-08-18', method: 'Credit', status: 'Overdue' },
  { id: 'PAY-3012', supplier: 'Gates Automotive', poRef: 'PO-2390', amount: 6200, dueDate: '2025-08-25', method: 'Bank Transfer', status: 'Scheduled' },
  { id: 'PAY-3009', supplier: 'Denso Gulf', poRef: 'PO-2385', amount: 4800, dueDate: '2025-08-10', method: 'Credit', status: 'Paid' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Paid: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Overdue: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Scheduled: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function PurchaseAgentPayments() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Payable'), value: formatSar(35500), icon: 'Wallet', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Paid This Month'), value: formatSar(13200), icon: 'CheckCircle', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Overdue'), value: formatSar(3600), icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('Scheduled'), value: formatSar(6200), icon: 'Calendar', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Wallet" title={t('Payments')} subtitle={t('Supplier payment tracking')} />
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
        {PAYMENTS.map((p) => (
          <MobileCard key={p.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Wallet" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{p.id}</p>
                    <p className="text-xs text-muted">{p.supplier}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>}
            />
            <MobileCardRow label={t('PO Ref')} value={p.poRef} />
            <MobileCardRow label={t('Amount')} value={<Money sar={p.amount} />} />
            <MobileCardRow label={t('Due Date')} value={p.dueDate} />
            <MobileCardRow label={t('Method')} value={t(p.method)} />
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
            <Icon name="Wallet" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Payments')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Supplier payment tracking and management')}</p>
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
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Payment History')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Payment ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('PO Ref')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Method')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{p.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{p.supplier}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-body">{p.poRef}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={p.amount} /></td>
                  <td className="py-3 pe-4 text-body">{p.dueDate}</td>
                  <td className="py-3 pe-4 text-body">{t(p.method)}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>
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
