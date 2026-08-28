import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { formatSar } from '@/components/ui/Money'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface CashFlowItem {
  label: string
  amount: number
}

interface CashFlowSection {
  title: string
  icon: string
  items: CashFlowItem[]
}

function useSections(t: (s: string) => string): CashFlowSection[] {
  return useMemo(
    () => [
      {
        title: t('Operating Activities'),
        icon: 'Activity',
        items: [
          { label: t('Net Income'), amount: 285000 },
          { label: t('Depreciation'), amount: 42000 },
          { label: t('Changes in Receivables'), amount: -18500 },
          { label: t('Changes in Payables'), amount: 12300 },
          { label: t('Changes in Inventory'), amount: -8700 },
        ],
      },
      {
        title: t('Investing Activities'),
        icon: 'TrendingUp',
        items: [
          { label: t('Equipment Purchases'), amount: -95000 },
          { label: t('Tool Acquisitions'), amount: -22000 },
          { label: t('Asset Disposals'), amount: 8500 },
        ],
      },
      {
        title: t('Financing Activities'),
        icon: 'Landmark',
        items: [
          { label: t('Loan Proceeds'), amount: 150000 },
          { label: t('Loan Repayments'), amount: -45000 },
          { label: t('Owner Drawings'), amount: -30000 },
        ],
      },
    ],
    [t],
  )
}

const fmtSar = (v: number) => formatSar(v, { parens: true })

function SectionCard({
  section,
  t,
}: {
  section: CashFlowSection
  t: (s: string) => string
}) {
  const subtotal = section.items.reduce((s, i) => s + i.amount, 0)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="flex rounded-lg p-1.5"
          style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }}
          aria-hidden
        >
          <Icon name={section.icon} size={16} />
        </span>
        <h3 className="text-sm font-bold text-heading">{section.title}</h3>
      </div>
      <div className="flex flex-col gap-1">
        {section.items.map((item) => (
          <div key={item.label} className="flex justify-between py-1 text-[13px]">
            <span className="text-body">{item.label}</span>
            <span
              dir="ltr"
              className={
                'font-mono font-medium ' +
                (item.amount < 0 ? 'text-salis-orange' : 'text-heading')
              }
            >
              {fmtSar(item.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
        <span className="text-heading">{t('Subtotal')}</span>
        <span
          dir="ltr"
          className={
            'font-mono ' + (subtotal < 0 ? 'text-salis-orange' : 'text-salis-blue')
          }
        >
          {fmtSar(subtotal)}
        </span>
      </div>
    </div>
  )
}

export function CashFlowStatement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const sections = useSections(t)

  const netChange = sections.reduce(
    (s, sec) => s + sec.items.reduce((a, i) => a + i.amount, 0),
    0,
  )
  const openingBalance = 320000
  const closingBalance = openingBalance + netChange

  const kpis = [
    { label: t('Opening Balance'), value: fmtSar(openingBalance), icon: 'Wallet', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Net Change'), value: fmtSar(netChange), icon: 'ArrowUpDown', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Closing Balance'), value: fmtSar(closingBalance), icon: 'PiggyBank', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ArrowUpDown" title={t('Cash Flow Statement')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden>
                <Icon name={k.icon} size={14} />
              </span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {sections.map((sec) => (
          <MobileCard key={sec.title}>
            <SectionCard section={sec} t={t} />
          </MobileCard>
        ))}
        <MobileCard>
          <div className="flex justify-between text-base font-bold">
            <span className="text-heading">{t('Net Cash Change')}</span>
            <span dir="ltr" className={'font-mono ' + (netChange < 0 ? 'text-salis-orange' : 'text-salis-blue')}>
              {fmtSar(netChange)}
            </span>
          </div>
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ArrowUpDown" title={t('Cash Flow Statement')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {sections.map((sec) => (
          <Card key={sec.title} className="rounded-2xl p-6 shadow-sm">
            <SectionCard section={sec} t={t} />
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-heading">{t('Net Cash Change')}</span>
          <span dir="ltr" className={'font-mono ' + (netChange < 0 ? 'text-salis-orange' : 'text-salis-blue')}>
            {fmtSar(netChange)}
          </span>
        </div>
      </Card>
    </div>
  )
}
