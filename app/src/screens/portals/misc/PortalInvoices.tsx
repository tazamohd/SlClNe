import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Invoice {
  invoiceId: string
  customer: string
  vehicle: string
  services: string
  amount: number
  issueDate: string
  dueDate: string
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft'
}

const INVOICES: Invoice[] = [
  { invoiceId: 'INV-2026-1284', customer: 'Ahmed Al-Rashid', vehicle: 'Toyota Camry 2022', services: 'Oil Change + Filter', amount: 285, issueDate: 'Aug 15, 2026', dueDate: 'Aug 30, 2026', status: 'Paid' },
  { invoiceId: 'INV-2026-1285', customer: 'Khalid Mohammed', vehicle: 'Hyundai Sonata 2024', services: 'Brake Pad Replacement', amount: 1240, issueDate: 'Aug 16, 2026', dueDate: 'Aug 31, 2026', status: 'Pending' },
  { invoiceId: 'INV-2026-1286', customer: 'Fatima Al-Saud', vehicle: 'Nissan Patrol 2023', services: 'Full Service + AC Check', amount: 2180, issueDate: 'Aug 17, 2026', dueDate: 'Sep 01, 2026', status: 'Pending' },
  { invoiceId: 'INV-2026-1280', customer: 'Omar Hassan', vehicle: 'Toyota Hilux 2021', services: 'Engine Diagnostic', amount: 450, issueDate: 'Aug 10, 2026', dueDate: 'Aug 25, 2026', status: 'Overdue' },
  { invoiceId: 'INV-2026-1287', customer: 'Nora Al-Fahd', vehicle: 'Kia Sportage 2023', services: 'Tire Change (4x)', amount: 1850, issueDate: 'Aug 18, 2026', dueDate: 'Sep 02, 2026', status: 'Draft' },
  { invoiceId: 'INV-2026-1281', customer: 'Yusuf Ibrahim', vehicle: 'GMC Sierra 2020', services: 'Transmission Flush', amount: 680, issueDate: 'Aug 11, 2026', dueDate: 'Aug 26, 2026', status: 'Paid' },
  { invoiceId: 'INV-2026-1279', customer: 'Sara Al-Mutairi', vehicle: 'Chevrolet Tahoe 2022', services: 'Battery + Alternator', amount: 1420, issueDate: 'Aug 08, 2026', dueDate: 'Aug 23, 2026', status: 'Paid' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Paid: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Overdue: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PortalInvoices() {
  const { t } = usePreferences()

  const totalOutstanding = INVOICES.filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0)
  const paidThisMonth = INVOICES.filter((inv) => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0)

  const kpis = [
    { label: t('Total Invoices'), value: '142', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Outstanding'), value: `${(totalOutstanding / 1000).toFixed(1)}K`, icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Collected MTD'), value: `${(paidThisMonth / 1000).toFixed(1)}K`, icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: '3', icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  ]

  const columns: Column<Invoice>[] = [
    { header: t('Invoice #'), cell: (inv) => inv.invoiceId },
    { header: t('Customer'), cell: (inv) => inv.customer },
    { header: t('Vehicle'), cell: (inv) => inv.vehicle },
    { header: t('Services'), cell: (inv) => inv.services },
    { header: t('Amount'), cell: (inv) => inv.amount.toLocaleString() },
    { header: t('Due Date'), cell: (inv) => inv.dueDate },
    { header: t('Status'), cell: (inv) => <Badge background={STATUS_STYLES[inv.status].bg} color={STATUS_STYLES[inv.status].fg}>{t(inv.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileText" title={t('Invoices')} subtitle={t('Track billing and payment status')} />

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
        caption="Portal invoices"
        columns={columns}
        rows={INVOICES}
        rowKey={(inv) => inv.invoiceId}
        mobileCard={(inv) => (
          <>
            <MobileCardHeader title={inv.invoiceId} trailing={<Badge background={STATUS_STYLES[inv.status].bg} color={STATUS_STYLES[inv.status].fg}>{t(inv.status)}</Badge>} />
            <MobileCardRow label={t('Customer')}>{inv.customer}</MobileCardRow>
            <MobileCardRow label={t('Services')}>{inv.services}</MobileCardRow>
            <MobileCardRow label={t('Amount')}>{inv.amount.toLocaleString()} SAR</MobileCardRow>
            <MobileCardRow label={t('Due Date')}>{inv.dueDate}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
