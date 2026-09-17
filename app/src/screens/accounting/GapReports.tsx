import { useIsMobile } from '@/lib/useMediaQuery'
import {
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { formatSar } from '@/components/ui/Money'
import { Loading } from '@/components/ui/States'
import { productReports } from '@/data/repository'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Figure, ReportGap } from './ReportControls'
import { useInsuranceClaimsSummary, useLoansSummary } from './useFinanceReports'

/** The insurance and loan reports.
 *
 *  These were gaps until the greenfield insurance/loans schema landed: there was
 *  no server collection to report on, so rather than invent a claim or a loan —
 *  worse than an empty screen, because a fabricated figure reads as real — they
 *  named the missing collection and stopped. The data now exists (F-035), and
 *  each report reads a server-computed aggregate (§A10): every total is summed
 *  in SQL over the whole tenant scope, never a page of rows the client added up.
 *
 *  The honest gap is kept for the fixture build. `productReports` is null with
 *  no API, so the summary hook stays disabled and the screen falls back to the
 *  "connect the API" state — nothing is fetched and no figure is faked.
 */

interface ClaimStatusRow {
  status: string
  count: number
  claimedHalalas: number
  approvedHalalas: number
}

interface LoanStatusRow {
  status: string
  count: number
  principalHalalas: number
}

const claimStatusColumns: Column<ClaimStatusRow>[] = [
  { header: 'Status', cell: (r) => r.status.replace(/_/g, ' ') },
  { header: 'Count', cell: (r) => <span dir="ltr" className="font-mono">{r.count}</span>, className: 'text-end' },
  { header: 'Claimed', cell: (r) => <span dir="ltr" className="font-mono">{formatSar(r.claimedHalalas / 100)}</span>, className: 'text-end' },
  { header: 'Approved', cell: (r) => <span dir="ltr" className="font-mono">{formatSar(r.approvedHalalas / 100)}</span>, className: 'text-end' },
]

const loanStatusColumns: Column<LoanStatusRow>[] = [
  { header: 'Status', cell: (r) => r.status.replace(/_/g, ' ') },
  { header: 'Count', cell: (r) => <span dir="ltr" className="font-mono">{r.count}</span>, className: 'text-end' },
  { header: 'Principal', cell: (r) => <span dir="ltr" className="font-mono">{formatSar(r.principalHalalas / 100)}</span>, className: 'text-end' },
]

export function InsuranceReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const summary = useInsuranceClaimsSummary()

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="ShieldCheck" title={t('Insurance Reports')} />
        {productReports === null ? (
          <ReportGap icon="ShieldCheck" title={t('Insurance Reports')}
            collection="GET /insurance/claims/summary"
            detail={t('Claim totals are computed by the server over your whole organization. Connect the API to see them.')} />
        ) : summary.isPending ? (
          <Loading label={t('Summing the claims...')} />
        ) : summary.isError || !summary.data ? (
          <ReportGap icon="ShieldCheck" title={t('Insurance Reports')}
            collection="GET /insurance/claims/summary"
            detail={t('The claim summary could not be loaded.')} />
        ) : (
          <Section title={t('Claim totals')}>
            <div className="grid grid-cols-1 gap-2">
              <Figure label={t('Claimed')} halalas={summary.data.claimedHalalas} />
              <Figure label={t('Approved')} halalas={summary.data.approvedHalalas} />
              <Figure label={t('Paid')} halalas={summary.data.paidHalalas} accent />
            </div>
          </Section>
        )}
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="ShieldCheck"
        title={t('Insurance Reports')}
        subtitle={t('Claim totals, computed by the server')}
      />
      {productReports === null ? (
        <ReportGap
          icon="ShieldCheck"
          title={t('Insurance Reports')}
          collection="GET /insurance/claims/summary"
          detail={t(
            'Claim totals are computed by the server over your whole organization. Connect the API to see them — no figures are estimated here.',
          )}
        />
      ) : summary.isPending ? (
        <Loading label={t('Summing the claims…')} />
      ) : summary.isError || !summary.data ? (
        <ReportGap
          icon="ShieldCheck"
          title={t('Insurance Reports')}
          collection="GET /insurance/claims/summary"
          detail={t('The claim summary could not be loaded.')}
        />
      ) : (
        <>
          <Section title={t('Claim totals')}>
            <p className="mb-3 text-[11px] text-muted">
              {t('Summed by the server over your organization, not from a page of rows.')} ·{' '}
              {summary.data.count} {t('claims')}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Figure label={t('Claimed')} halalas={summary.data.claimedHalalas} />
              <Figure label={t('Approved')} halalas={summary.data.approvedHalalas} />
              <Figure label={t('Paid')} halalas={summary.data.paidHalalas} accent />
            </div>
          </Section>
          {summary.data.byStatus.length > 0 && (
            <DataTable
              caption="Claims by status"
              columns={claimStatusColumns}
              rows={summary.data.byStatus as ClaimStatusRow[]}
              rowKey={(r) => r.status}
              mobileCard={(r) => (
                <>
                  <MobileCardHeader title={r.status.replace(/_/g, ' ')} />
                  <MobileCardRow label={t('Count')}>{r.count}</MobileCardRow>
                  <MobileCardRow label={t('Claimed')}>{formatSar(r.claimedHalalas / 100)}</MobileCardRow>
                </>
              )}
              empty={<EmptyState icon="ShieldCheck" title={t('No claim status data')} />}
            />
          )}
        </>
      )}
    </>
  )
}

export function LoanReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const summary = useLoansSummary()

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Banknote" title={t('Loan Reports')} />
        {productReports === null ? (
          <ReportGap icon="Banknote" title={t('Loan Reports')}
            collection="GET /loans/summary"
            detail={t('Portfolio totals are computed by the server. Connect the API to see them.')} />
        ) : summary.isPending ? (
          <Loading label={t('Summing the portfolio...')} />
        ) : summary.isError || !summary.data ? (
          <ReportGap icon="Banknote" title={t('Loan Reports')}
            collection="GET /loans/summary"
            detail={t('The loan summary could not be loaded.')} />
        ) : (
          <>
            <Section title={t('Financing portfolio')}>
              <p className="mb-3 text-[11px] text-muted">
                {summary.data.contractCount} {t('contracts')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Figure label={t('Principal')} halalas={summary.data.principalHalalas} />
                <Figure label={t('Collected')} halalas={summary.data.collectedHalalas} />
                <Figure label={t('Outstanding')} halalas={summary.data.outstandingHalalas} />
                <Figure label={t('Overdue')} halalas={summary.data.overdueHalalas} accent />
              </div>
            </Section>
            {summary.data.byStatus.length > 0 && (
              <DataTable
                caption="Loans by status"
                columns={loanStatusColumns}
                rows={summary.data.byStatus as LoanStatusRow[]}
                rowKey={(r) => r.status}
                mobileCard={(r) => (
                  <>
                    <MobileCardHeader title={r.status.replace(/_/g, ' ')} />
                    <MobileCardRow label={t('Count')}>{r.count}</MobileCardRow>
                    <MobileCardRow label={t('Principal')}>{formatSar(r.principalHalalas / 100)}</MobileCardRow>
                  </>
                )}
                empty={<EmptyState icon="Banknote" title={t('No loan status data')} />}
              />
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Banknote"
        title={t('Loan Reports')}
        subtitle={t('Financing portfolio, computed by the server')}
      />
      {productReports === null ? (
        <ReportGap
          icon="Banknote"
          title={t('Loan Reports')}
          collection="GET /loans/summary"
          detail={t(
            'Portfolio totals are computed by the server. Connect the API to see them — no figures are estimated here.',
          )}
        />
      ) : summary.isPending ? (
        <Loading label={t('Summing the portfolio…')} />
      ) : summary.isError || !summary.data ? (
        <ReportGap
          icon="Banknote"
          title={t('Loan Reports')}
          collection="GET /loans/summary"
          detail={t('The loan summary could not be loaded.')}
        />
      ) : (
        <>
          <Section title={t('Financing portfolio')}>
            <p className="mb-3 text-[11px] text-muted">
              {t('Outstanding is the unpaid portion of every scheduled repayment, summed in SQL.')} ·{' '}
              {summary.data.contractCount} {t('contracts')}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Figure label={t('Principal')} halalas={summary.data.principalHalalas} />
              <Figure label={t('Collected')} halalas={summary.data.collectedHalalas} />
              <Figure label={t('Outstanding')} halalas={summary.data.outstandingHalalas} />
              <Figure label={t('Overdue')} halalas={summary.data.overdueHalalas} accent />
              <Figure label={t('Monthly instalments')} halalas={summary.data.monthlyInstalmentHalalas} />
              <Figure label={t('Scheduled')} halalas={summary.data.scheduledHalalas} />
            </div>
          </Section>
          {summary.data.byStatus.length > 0 && (
            <DataTable
              caption="Loans by status"
              columns={loanStatusColumns}
              rows={summary.data.byStatus as LoanStatusRow[]}
              rowKey={(r) => r.status}
              mobileCard={(r) => (
                <>
                  <MobileCardHeader title={r.status.replace(/_/g, ' ')} />
                  <MobileCardRow label={t('Count')}>{r.count}</MobileCardRow>
                  <MobileCardRow label={t('Principal')}>{formatSar(r.principalHalalas / 100)}</MobileCardRow>
                </>
              )}
              empty={<EmptyState icon="Banknote" title={t('No loan status data')} />}
            />
          )}
        </>
      )}
    </>
  )
}
