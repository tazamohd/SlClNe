import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Pending: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Overdue: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Scheduled: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function PurchaseAgentPayments() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Payable'), value: formatSar(35500), icon: 'Wallet', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Paid This Month'), value: formatSar(13200), icon: 'CheckCircle', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('Overdue'), value: formatSar(3600), icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
    { label: t('Scheduled'), value: formatSar(6200), icon: 'Calendar', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
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
      <PageHeader icon="Wallet" title={t('Payments')} subtitle={t('Supplier payment tracking and management')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
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
