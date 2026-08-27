import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'

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

  const kpis = [
    { label: t('Total Payable'), value: formatSar(35500), icon: 'Wallet', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Paid This Month'), value: formatSar(13200), icon: 'CheckCircle', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Overdue'), value: formatSar(3600), icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('Scheduled'), value: formatSar(6200), icon: 'Calendar', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  const columns: Column<Payment>[] = [
    { header: t('Payment ID'), cell: (p) => p.id },
    { header: t('Supplier'), cell: (p) => p.supplier },
    { header: t('PO Ref'), cell: (p) => p.poRef },
    { header: t('Amount'), cell: (p) => <Money sar={p.amount} /> },
    { header: t('Due Date'), cell: (p) => p.dueDate },
    { header: t('Method'), cell: (p) => t(p.method) },
    { header: t('Status'), cell: (p) => <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge> },
  ]

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

      <DataTable
        caption="Supplier payments"
        columns={columns}
        rows={PAYMENTS}
        rowKey={(p) => p.id}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={p.id} trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{p.supplier}</MobileCardRow>
            <MobileCardRow label={t('Amount')}><Money sar={p.amount} /></MobileCardRow>
            <MobileCardRow label={t('Due Date')}>{p.dueDate}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
