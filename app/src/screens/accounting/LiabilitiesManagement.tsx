import { useMemo, useState } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

interface Liability {
  code: string
  name: string
  type: string
  amount: number
  dueDate: string
  creditor: string
  status: string
}

const MOCK_LIABILITIES: readonly Liability[] = [
  { code: 'LIA-001', name: 'Accounts Payable – Parts', type: 'Current', amount: 185000_00, dueDate: '2026-09-15', creditor: 'Al-Futtaim Parts', status: 'Active' },
  { code: 'LIA-002', name: 'VAT Payable', type: 'Current', amount: 42000_00, dueDate: '2026-08-30', creditor: 'ZATCA', status: 'Active' },
  { code: 'LIA-003', name: 'Bank Loan – Equipment', type: 'Long-term', amount: 350000_00, dueDate: '2029-06-01', creditor: 'Al Rajhi Bank', status: 'Active' },
  { code: 'LIA-004', name: 'Lease Liability – Premises', type: 'Long-term', amount: 720000_00, dueDate: '2031-12-31', creditor: 'Saudi Real Estate Co', status: 'Active' },
  { code: 'LIA-005', name: 'Supplier Invoice – Overdue', type: 'Current', amount: 28500_00, dueDate: '2026-07-01', creditor: 'Quick Parts LLC', status: 'Overdue' },
  { code: 'LIA-006', name: 'Insurance Premium – Settled', type: 'Current', amount: 15000_00, dueDate: '2026-06-15', creditor: 'Tawuniya Insurance', status: 'Paid' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  Paid: ['rgba(100,116,139,.1)', '#64748B'],
  Overdue: ['rgba(249,115,22,.1)', '#F97316'],
}

export function LiabilitiesManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MOCK_LIABILITIES.filter(
      (l) =>
        !needle ||
        l.code.toLowerCase().includes(needle) ||
        l.name.toLowerCase().includes(needle) ||
        l.creditor.toLowerCase().includes(needle)
    )
  }, [query])

  const totals = useMemo(() => {
    let total = 0
    let current = 0
    let longTerm = 0
    let overdue = 0
    for (const l of MOCK_LIABILITIES) {
      total += l.amount
      if (l.type === 'Current') current += l.amount
      if (l.type === 'Long-term') longTerm += l.amount
      if (l.status === 'Overdue') overdue++
    }
    return { total, current, longTerm, overdue }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Liabilities', value: formatSar(totals.total), caption: 'All obligations', highlight: true },
    { label: 'Current', value: formatSar(totals.current), caption: 'Due within 12 months' },
    { label: 'Long-term', value: formatSar(totals.longTerm), caption: 'Due after 12 months' },
    { label: 'Overdue', value: totals.overdue, caption: 'Requires attention', tone: 'warning' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="Scale"
          title={t('Liabilities Management')}
          subtitle={t('Accounting')}
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((l) => {
            const [bg, fg] = STATUS_PALETTE[l.status] ?? STATUS_PALETTE.Active
            return (
              <MobileCard key={l.code}>
                <MobileCardHeader
                  title={l.code}
                  code
                  trailing={
                    <Badge background={bg} color={fg}>
                      {t(l.status)}
                    </Badge>
                  }
                />
                <MobileCardRow>{t(l.name)}</MobileCardRow>
                <MobileCardRow label={t('Type')}>{t(l.type)}</MobileCardRow>
                <MobileCardRow label={t('Amount')}>
                  <Money sar={l.amount} className="text-heading" />
                </MobileCardRow>
                <MobileCardRow label={t('Due Date')}>
                  <span dir="ltr">{l.dueDate}</span>
                </MobileCardRow>
                <MobileCardRow label={t('Creditor')}>{l.creditor}</MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Scale"
        title={t('Liabilities Management')}
        subtitle={t('Current and long-term obligations')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Liabilities')}
        subtitle={t('All obligations with amounts and due dates')}
        toolbar={
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Code, name or creditor')}
              aria-label={t('Search liabilities')}
              className="h-10 rounded border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Code')}</th>
                <th className="py-2.5 text-start font-medium">{t('Name')}</th>
                <th className="py-2.5 text-start font-medium">{t('Type')}</th>
                <th className="py-2.5 text-end font-medium">{t('Amount')}</th>
                <th className="py-2.5 text-start font-medium">{t('Due Date')}</th>
                <th className="py-2.5 text-start font-medium">{t('Creditor')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const [bg, fg] = STATUS_PALETTE[l.status] ?? STATUS_PALETTE.Active
                return (
                  <tr key={l.code} className="border-b border-border/50">
                    <td className="py-2.5">
                      <span className="font-mono text-[13px]" dir="ltr">{l.code}</span>
                    </td>
                    <td className="py-2.5 text-[13px] text-body">{t(l.name)}</td>
                    <td className="py-2.5 text-[13px] text-body">{t(l.type)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={l.amount} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-[13px] text-muted" dir="ltr">{l.dueDate}</td>
                    <td className="py-2.5 text-[13px] text-body">{l.creditor}</td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(l.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">{t('No liabilities match the filter')}</p>
        )}
      </Section>
    </div>
  )
}
