import { useIsMobile } from '@/lib/useMediaQuery'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { EmptyState } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Loading } from '@/components/ui/States'
import { formatSar } from '@/components/ui/Money'
import { productReports } from '@/data/repository'
import { usePreferences } from '@/providers/PreferencesProvider'
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

/** The gap state, shown when there is no API to compute the aggregate. */
function ReportGap({ icon, title, collection, detail }: {
  icon: string
  title: string
  collection: string
  detail: string
}) {
  const { t } = usePreferences()
  return (
    <Section title={t('Connect the API')}>
      <EmptyState icon={icon} title={t(title)} description={t(detail)} />
      <p className="flex items-start justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Server aggregate:')}{' '}
        <span dir="ltr" className="font-mono text-body">{collection}</span>
      </p>
    </Section>
  )
}

/** A labelled money figure — the server's, displayed, never computed here. */
function Figure({ label, halalas, accent }: { label: string; halalas: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div
        dir="ltr"
        className={`mt-1 font-mono text-lg font-semibold ${accent ? 'text-salis-orange' : 'text-body'}`}
      >
        {formatSar(halalas / 100)}
      </div>
    </div>
  )
}

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
          {summary.data.byStatus.length > 0 && (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-start text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-2 text-start font-medium">{t('Status')}</th>
                  <th className="py-2 text-end font-medium">{t('Count')}</th>
                  <th className="py-2 text-end font-medium">{t('Claimed')}</th>
                  <th className="py-2 text-end font-medium">{t('Approved')}</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.byStatus.map((row) => (
                  <tr key={row.status} className="border-b border-line/50">
                    <td className="py-2">{t(row.status.replace(/_/g, ' '))}</td>
                    <td dir="ltr" className="py-2 text-end font-mono">{row.count}</td>
                    <td dir="ltr" className="py-2 text-end font-mono">{formatSar(row.claimedHalalas / 100)}</td>
                    <td dir="ltr" className="py-2 text-end font-mono">{formatSar(row.approvedHalalas / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
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
            {summary.data.byStatus.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-start text-[11px] uppercase tracking-wide text-muted">
                      <th className="py-2 text-start font-medium">{t('Status')}</th>
                      <th className="py-2 text-end font-medium">{t('Count')}</th>
                      <th className="py-2 text-end font-medium">{t('Principal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.data.byStatus.map((row) => (
                      <tr key={row.status} className="border-b border-line/50">
                        <td className="py-2">{t(row.status.replace(/_/g, ' '))}</td>
                        <td dir="ltr" className="py-2 text-end font-mono">{row.count}</td>
                        <td dir="ltr" className="py-2 text-end font-mono">{formatSar(row.principalHalalas / 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
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
          {summary.data.byStatus.length > 0 && (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-start text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-2 text-start font-medium">{t('Status')}</th>
                  <th className="py-2 text-end font-medium">{t('Count')}</th>
                  <th className="py-2 text-end font-medium">{t('Principal')}</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.byStatus.map((row) => (
                  <tr key={row.status} className="border-b border-line/50">
                    <td className="py-2">{t(row.status.replace(/_/g, ' '))}</td>
                    <td dir="ltr" className="py-2 text-end font-mono">{row.count}</td>
                    <td dir="ltr" className="py-2 text-end font-mono">{formatSar(row.principalHalalas / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}
    </>
  )
}
