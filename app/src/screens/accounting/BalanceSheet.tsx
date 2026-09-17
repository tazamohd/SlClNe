import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { financeReports } from '@/data/repository'
import { fromHalalas } from '@/screens/finance/money'
import { AGGREGATE_GAP } from './reporting'
import { ReportGap, ServerTotalsNote } from './ReportControls'
import { useTrialBalance } from './useFinanceReports'

/** Balance Sheet — Assets, Liabilities and Equity, each account a real row
 *  from `GET /accounting/reports/trial-balance` (F-028). Every line item is
 *  one account's own server-computed balance; the section subtotal and the
 *  identity check are `balanceSheet.assetsHalalas` /
 *  `liabilitiesPlusEquityHalalas` / `balanced` as the server returned them,
 *  never re-summed here — the same figure the server confirmed is the figure
 *  the screen displays, so they cannot drift apart.
 *
 *  This used to be fifteen hand-written line items with a docstring admitting
 *  "spec-only build." F-008's real imbalance is surfaced honestly, not tied
 *  off — the same discipline `ReportSuite.tsx`'s `TrialBalancePanel` follows.
 *  There is no fixture fallback: a build with no API names the gap
 *  (`ReportGap`) instead. */

interface LineItem {
  code: string
  name: string
  amountHalalas: number
}

function StatementSection({
  title,
  icon,
  items,
  subtotalLabel,
  subtotalHalalas,
  accentColor,
}: {
  title: string
  icon: string
  items: readonly LineItem[]
  subtotalLabel: string
  subtotalHalalas: number
  accentColor: string
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg p-2" style={{ background: `${accentColor}18` }}>
          <Icon name={icon} size={18} style={{ color: accentColor }} />
        </span>
        <h2 className="font-display text-base font-bold text-heading">{t(title)}</h2>
      </div>
      <div className="flex flex-col">
        {items.length === 0 ? (
          <p className="py-2.5 text-[13px] text-muted">{t('No accounts of this type')}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between border-b border-border/50 py-2.5 text-[13px] text-body"
            >
              <span>{t(item.name)}</span>
              <Money sar={fromHalalas(item.amountHalalas)} />
            </div>
          ))
        )}
        <div className="flex items-center justify-between py-3 text-sm font-bold text-heading">
          <span>{t(subtotalLabel)}</span>
          <Money sar={fromHalalas(subtotalHalalas)} className="font-bold" />
        </div>
      </div>
    </div>
  )
}

export function BalanceSheet() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const trialBalance = useTrialBalance()

  const accounts = trialBalance.data?.accounts ?? []
  const assets = useMemo(
    () => accounts.filter((a) => a.type === 'Assets').map((a) => ({ code: a.code, name: a.name, amountHalalas: a.debitHalalas })),
    [accounts],
  )
  const liabilities = useMemo(
    () => accounts.filter((a) => a.type === 'Liabilities').map((a) => ({ code: a.code, name: a.name, amountHalalas: a.creditHalalas })),
    [accounts],
  )
  const equity = useMemo(
    () => accounts.filter((a) => a.type === 'Equity').map((a) => ({ code: a.code, name: a.name, amountHalalas: a.creditHalalas })),
    [accounts],
  )

  const bs = trialBalance.data?.balanceSheet
  const balanced = bs?.balanced ?? true

  const stats: Stat[] = [
    { label: 'Total Assets', value: bs ? formatSar(fromHalalas(bs.assetsHalalas)) : '—', caption: 'Current period', highlight: true },
    { label: 'Total Liabilities', value: bs ? formatSar(fromHalalas(bs.liabilitiesHalalas)) : '—', caption: 'Current period', tone: 'warning' },
    { label: 'Total Equity', value: bs ? formatSar(fromHalalas(bs.equityHalalas)) : '—', caption: 'Current period', tone: 'info' },
    {
      label: 'Liab. + Equity',
      value: bs ? formatSar(fromHalalas(bs.liabilitiesPlusEquityHalalas)) : '—',
      caption: balanced ? 'Balanced' : 'Unbalanced',
    },
  ]

  if (financeReports === null) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader icon="FileText" title={t('Balance Sheet')} subtitle={t('Assets, liabilities and equity with totals')} />
        <ReportGap
          icon="FileText"
          title={t('Balance Sheet')}
          collection={AGGREGATE_GAP.ledger}
          detail={t(
            'The balance sheet is summed by the server over your whole organization. Connect the API to see it — no figures are estimated here.',
          )}
        />
      </div>
    )
  }

  if (trialBalance.isLoading) {
    return <Loading label={t('Loading the balance sheet…')} />
  }
  if (trialBalance.isError || !bs) {
    return <ErrorState description={trialBalance.error?.message} onRetry={() => void trialBalance.refetch()} />
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileText" title={t('Balance Sheet')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />
        {[
          { title: 'Assets', items: assets },
          { title: 'Liabilities', items: liabilities },
          { title: 'Equity', items: equity },
        ].map(({ title, items }) => (
          <div key={title} className="flex flex-col gap-2">
            <h2 className="font-display text-sm font-bold text-heading">{t(title)}</h2>
            {items.length === 0 ? (
              <p className="text-[13px] text-muted">{t('No accounts of this type')}</p>
            ) : (
              items.map((item) => (
                <MobileCard key={item.code}>
                  <MobileCardHeader leading={<span className="text-sm font-semibold text-heading">{t(item.name)}</span>} />
                  <MobileCardRow label={t('Amount')}>
                    <Money sar={fromHalalas(item.amountHalalas)} className="font-semibold text-heading" />
                  </MobileCardRow>
                </MobileCard>
              ))
            )}
          </div>
        ))}
        {!balanced ? (
          <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-4 py-3 text-[13px] text-body">
            <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
            {t('Assets do not equal liabilities plus equity.')}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader icon="FileText" title={t('Balance Sheet')} subtitle={t('Assets, liabilities and equity with totals')} />
      <StatRow stats={stats} />
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />

      {!balanced && (
        <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-4 py-3 text-[13px] text-body">
          <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
          {t('Assets do not equal liabilities plus equity.')}
        </div>
      )}

      <Section title={t('Balance Sheet')} subtitle={t('As at end of current period')}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StatementSection
            title={t('Assets')}
            icon="Wallet"
            items={assets}
            subtotalLabel={t('Total Assets')}
            subtotalHalalas={bs.assetsHalalas}
            accentColor="var(--salis-blue)"
          />
          <div className="flex flex-col gap-8">
            <StatementSection
              title={t('Liabilities')}
              icon="CreditCard"
              items={liabilities}
              subtotalLabel={t('Total Liabilities')}
              subtotalHalalas={bs.liabilitiesHalalas}
              accentColor="var(--salis-orange)"
            />
            <StatementSection
              title={t('Equity')}
              icon="Landmark"
              items={equity}
              subtotalLabel={t('Total Equity')}
              subtotalHalalas={bs.equityHalalas}
              accentColor="var(--salis-navy)"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-border bg-inset px-5 py-4">
          <div>
            <p className="font-display text-sm font-bold text-heading">{t('Balance Sheet Identity')}</p>
            <p className="mt-0.5 text-xs text-muted">
              {t('Assets')} = {t('Liabilities')} + {t('Equity')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              name={balanced ? 'CheckCircle2' : 'AlertTriangle'}
              size={18}
              className={balanced ? 'text-salis-blue' : 'text-salis-orange'}
            />
            <span className={`font-action text-sm font-semibold ${balanced ? 'text-salis-blue' : 'text-salis-orange'}`}>
              {balanced ? t('Balanced') : t('Unbalanced')}
            </span>
          </div>
        </div>
      </Section>
    </div>
  )
}
