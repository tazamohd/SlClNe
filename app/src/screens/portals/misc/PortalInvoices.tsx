import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Overdue: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PortalInvoices() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalOutstanding = INVOICES.filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0)
  const paidThisMonth = INVOICES.filter((inv) => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0)

  const kpis = [
    { label: t('Total Invoices'), value: '142', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Outstanding'), value: `${(totalOutstanding / 1000).toFixed(1)}K`, icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Collected MTD'), value: `${(paidThisMonth / 1000).toFixed(1)}K`, icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Overdue'), value: '3', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileText" title={t('Invoices')} subtitle={t('Billing & payments')} />
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
        {INVOICES.map((inv) => (
          <MobileCard key={inv.invoiceId}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="FileText" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{inv.invoiceId}</p>
                    <p className="text-xs text-muted">{inv.customer}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[inv.status].bg} color={STATUS_STYLES[inv.status].fg}>{t(inv.status)}</Badge>}
            />
            <MobileCardRow label={t('Vehicle')} value={inv.vehicle} />
            <MobileCardRow label={t('Services')} value={inv.services} />
            <MobileCardRow label={t('Amount')} value={`${inv.amount.toLocaleString()} SAR`} />
            <MobileCardRow label={t('Due Date')} value={inv.dueDate} />
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Invoices')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Track billing and payment status')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Invoice #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Customer')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Services')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.invoiceId} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono font-semibold text-heading" dir="ltr">{inv.invoiceId}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{inv.customer}</td>
                  <td className="py-3 pe-4 text-body">{inv.vehicle}</td>
                  <td className="py-3 pe-4 text-body">{inv.services}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{inv.amount.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-muted">{inv.dueDate}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[inv.status].bg} color={STATUS_STYLES[inv.status].fg}>{t(inv.status)}</Badge>
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
