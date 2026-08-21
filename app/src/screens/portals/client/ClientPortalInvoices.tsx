import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'

interface Invoice {
  id: string
  vehicle: string
  service: string
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
}

const INVOICES: Invoice[] = [
  { id: 'INV-4821', vehicle: '2022 Toyota Camry', service: 'Oil Change + Filter', date: '2025-08-15', amount: 350, status: 'Pending' },
  { id: 'INV-4798', vehicle: '2021 Honda Accord', service: 'Tire Rotation', date: '2025-08-12', amount: 180, status: 'Paid' },
  { id: 'INV-4765', vehicle: '2022 Toyota Camry', service: 'AC Service', date: '2025-08-08', amount: 1200, status: 'Paid' },
  { id: 'INV-4730', vehicle: '2023 Hyundai Tucson', service: 'First Service', date: '2025-07-28', amount: 450, status: 'Paid' },
  { id: 'INV-4691', vehicle: '2020 Nissan Altima', service: 'Brake Pad Replacement', date: '2025-07-15', amount: 890, status: 'Overdue' },
  { id: 'INV-4650', vehicle: '2021 Honda Accord', service: 'Battery Replacement', date: '2025-07-01', amount: 520, status: 'Paid' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Paid: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Overdue: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function ClientPortalInvoices() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalOwed = INVOICES.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
  const totalPaid = INVOICES.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)

  const kpis = [
    { label: t('Total Invoices'), value: String(INVOICES.length), icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Amount Due'), value: formatSar(totalOwed), icon: 'AlertCircle', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Total Paid'), value: formatSar(totalPaid), icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Overdue'), value: '1', icon: 'Clock', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileText" title={t('Invoices')} subtitle={t('Payment history')} />
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
          <MobileCard key={inv.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="FileText" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{inv.id}</p>
                    <p className="text-xs text-muted">{inv.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[inv.status].bg} color={STATUS_STYLES[inv.status].fg}>{t(inv.status)}</Badge>}
            />
            <MobileCardRow label={t('Service')} value={inv.service} />
            <MobileCardRow label={t('Date')} value={inv.date} />
            <MobileCardRow label={t('Amount')} value={<Money sar={inv.amount} />} />
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
          <p className="mt-0.5 text-[13px] text-muted">{t('Invoice and payment history')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Invoice')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-medium text-heading">{inv.id}</td>
                  <td className="py-3 pe-4 text-body">{inv.vehicle}</td>
                  <td className="py-3 pe-4 text-body">{inv.service}</td>
                  <td className="py-3 pe-4 text-body">{inv.date}</td>
                  <td className="py-3 pe-4 text-end"><Money sar={inv.amount} /></td>
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
