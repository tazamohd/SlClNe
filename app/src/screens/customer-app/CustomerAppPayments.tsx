import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Completed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Refunded: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function CustomerAppPayments() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalSpent = PAYMENTS.filter((p) => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)

  const kpis = [
    { label: t('Total Spent'), value: `${(totalSpent / 1000).toFixed(1)}K`, icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Transactions'), value: String(PAYMENTS.length), icon: 'Receipt', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending'), value: String(PAYMENTS.filter((p) => p.status === 'Pending').length), icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Payment Methods'), value: String(METHODS.length), icon: 'CreditCard', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CreditCard" title={t('Payments')} subtitle={t('History & methods')} />
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

        <p className="text-[13px] font-bold text-heading">{t('Payment Methods')}</p>
        {METHODS.map((m) => (
          <Card key={m.last4} className="flex items-center gap-3 rounded-xl p-3 shadow-sm">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={m.icon} size={14} /></span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-heading">{m.type} <span className="font-mono text-muted" dir="ltr">****{m.last4}</span></p>
              <p className="text-xs text-muted">{m.expiry !== '-' ? `${t('Expires')} ${m.expiry}` : t('Digital Wallet')}</p>
            </div>
            {m.primary && <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Primary')}</Badge>}
          </Card>
        ))}

        <p className="text-[13px] font-bold text-heading">{t('Payment History')}</p>
        {PAYMENTS.map((p) => (
          <MobileCard key={p.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Receipt" size={14} /></span>
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
            <Icon name="CreditCard" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Payments')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Payment history and saved methods')}</p>
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
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Payment Methods')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {METHODS.map((m) => (
            <div key={m.last4} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue" aria-hidden><Icon name={m.icon} size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">{m.type} <span className="font-mono text-muted" dir="ltr">****{m.last4}</span></p>
                <p className="text-xs text-muted">{m.expiry !== '-' ? `${t('Expires')} ${m.expiry}` : t('Digital Wallet')}</p>
              </div>
              {m.primary && <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Primary')}</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Payment History')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Description')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Amount')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Method')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Invoice')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-mono text-xs font-semibold text-heading" dir="ltr">{p.id}</td>
                  <td className="py-3 pe-4 font-medium text-heading">{t(p.description)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{p.amount.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-body">{p.method}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{p.invoice}</td>
                  <td className="py-3 pe-4 text-muted">{p.date}</td>
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
