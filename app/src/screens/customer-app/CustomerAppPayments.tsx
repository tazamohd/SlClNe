import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'

interface Payment {
  id: string
  description: string
  amount: number
  date: string
  method: 'Visa' | 'Mada' | 'Apple Pay' | 'Cash' | 'Bank Transfer'
  invoice: string
  status: 'Completed' | 'Pending' | 'Refunded'
}

interface PaymentMethod {
  type: string
  last4: string
  expiry: string
  icon: string
  primary: boolean
}

const PAYMENTS: Payment[] = [
  { id: 'PAY-8401', description: 'Oil Change + Filter', amount: 285, date: 'Aug 15, 2026', method: 'Visa', invoice: 'INV-2026-1284', status: 'Completed' },
  { id: 'PAY-8398', description: 'Brake Pad Replacement', amount: 1240, date: 'Aug 12, 2026', method: 'Mada', invoice: 'INV-2026-1280', status: 'Completed' },
  { id: 'PAY-8395', description: 'Full Service Package', amount: 2180, date: 'Aug 05, 2026', method: 'Apple Pay', invoice: 'INV-2026-1275', status: 'Completed' },
  { id: 'PAY-8392', description: 'AC Service & Recharge', amount: 450, date: 'Jul 28, 2026', method: 'Visa', invoice: 'INV-2026-1270', status: 'Refunded' },
  { id: 'PAY-8390', description: 'Tire Rotation (4x)', amount: 120, date: 'Jul 20, 2026', method: 'Cash', invoice: 'INV-2026-1265', status: 'Completed' },
  { id: 'PAY-8387', description: 'Battery Replacement', amount: 380, date: 'Jul 15, 2026', method: 'Bank Transfer', invoice: 'INV-2026-1260', status: 'Pending' },
  { id: 'PAY-8384', description: 'Engine Diagnostic', amount: 199, date: 'Jul 10, 2026', method: 'Mada', invoice: 'INV-2026-1255', status: 'Completed' },
]

const METHODS: PaymentMethod[] = [
  { type: 'Visa', last4: '4821', expiry: '09/28', icon: 'CreditCard', primary: true },
  { type: 'Mada', last4: '7733', expiry: '12/27', icon: 'CreditCard', primary: false },
  { type: 'Apple Pay', last4: '1155', expiry: '-', icon: 'Smartphone', primary: false },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Refunded: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

export function CustomerAppPayments() {
  const { t } = usePreferences()

  const totalSpent = PAYMENTS.filter((p) => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)

  const kpis = [
    { label: t('Total Spent'), value: `${(totalSpent / 1000).toFixed(1)}K`, icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Transactions'), value: String(PAYMENTS.length), icon: 'Receipt', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Pending'), value: String(PAYMENTS.filter((p) => p.status === 'Pending').length), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Payment Methods'), value: String(METHODS.length), icon: 'CreditCard', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Payment>[] = [
    { header: 'ID', cell: (p) => p.id, code: true },
    { header: 'Description', cell: (p) => <span className="font-medium text-heading">{t(p.description)}</span> },
    { header: 'Amount', cell: (p) => p.amount.toLocaleString(), code: true, className: 'text-end' },
    { header: 'Method', cell: (p) => p.method },
    { header: 'Invoice', cell: (p) => p.invoice, code: true },
    { header: 'Date', cell: (p) => p.date },
    {
      header: 'Status',
      cell: (p) => (
        <Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>
      ),
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CreditCard" title={t('Payments')} subtitle={t('Payment history and saved methods')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Payment Methods')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {METHODS.map((m) => (
            <div key={m.last4} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <span className="flex rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden><Icon name={m.icon} size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">{m.type} <span className="font-mono text-muted" dir="ltr">****{m.last4}</span></p>
                <p className="text-xs text-muted">{m.expiry !== '-' ? `${t('Expires')} ${m.expiry}` : t('Digital Wallet')}</p>
              </div>
              {m.primary && <Badge background="var(--tint-blue)" color="var(--salis-blue)">{t('Primary')}</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Payment History')}</p>
        <DataTable
          caption="Payment history"
          columns={columns}
          rows={PAYMENTS}
          rowKey={(p) => p.id}
          empty={t('No payments found')}
          mobileCard={(p) => (
            <>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Receipt" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{t(p.description)}</p>
                      <p className="text-xs text-muted">{p.date}</p>
                    </div>
                  </div>
                }
                trailing={<Badge background={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].fg}>{t(p.status)}</Badge>}
              />
              <MobileCardRow label={t('Amount')} value={`${p.amount.toLocaleString()} SAR`} />
              <MobileCardRow label={t('Method')} value={p.method} />
              <MobileCardRow label={t('Invoice')} value={p.invoice} />
            </>
          )}
        />
      </div>
    </div>
  )
}
