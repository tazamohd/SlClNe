import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { isLive, organizationApi, type OrgTaxProfile } from '@/data/repository'
import { AggregateGapNotice, ServerTotalsNote } from '@/screens/accounting/ReportControls'
import { AGGREGATE_GAP } from '@/screens/accounting/reporting'
import { useTaxReturn } from '@/screens/accounting/useFinanceReports'
import { VAT_RATE_BPS, fromHalalas } from '@/screens/finance/money'
import { NoteLine, ORG_TAX_PROFILE_KEY, RecordedValue, TaxRow, percentOfBps } from './taxIdentity'

/** VAT settings — the enforced rate, the recorded registration, and the VAT the
 *  server actually computed.
 *
 *  ── What this screen used to hold ─────────────────────────────────────────
 *
 *  Two hardcoded objects. `CONFIG` carried `vatRate: '15%'`,
 *  `vatNumber: '311234567890003'`, `filingFrequency: 'Quarterly'`,
 *  `nextFilingDate: '2026-09-30'` and `autoCalculate: true`; `SUMMARY` carried
 *  `totalCollected: 187500`, `totalPaid: 62300`, `netVat: 125200`. They are not
 *  one problem, and the difference is what this rewrite is built on.
 *
 *  **The rate was a duplicated constant, not invented data.** `15%` is what this
 *  deployment happens to enforce — `VAT_RATE_BPS`, read by the invoice pricing
 *  rule and by `GET /accounting/tax/return`. The literal merely coincided with
 *  it, and would have gone on agreeing right up until someone changed the
 *  deployment's rate, at which point this screen would have quoted a rate the
 *  ledger was not charging. So the rate is now read: from the server when there
 *  is one, and otherwise from the same contract constant the client prices
 *  drafts at, labelled as such. There is still no control over it, on purpose —
 *  the server reads the rate from configuration, so a form here would be a tax
 *  setting the enforcement ignores.
 *
 *  **The VAT number was a fabricated government registration identifier**,
 *  displayed as this organization's own — the most serious line in the old file.
 *  A VAT number *is* legitimately recorded: it lives on the organization's row,
 *  and `POST /invoices/:id/issue` stamps it onto the invoice and its ZATCA QR
 *  and refuses to issue when it is absent. So it is read from that row through
 *  `GET /organization`, and an organization that has recorded none
 *  is shown as **not recorded**, with the consequence named. No stand-in.
 *
 *  **The summary was invented tax totals.** Output VAT over a period is an
 *  aggregate the server computes in SQL over the whole tenant scope, so it comes
 *  from `GET /accounting/tax/return`. Input VAT arrives `inputVatModelled:false`
 *  — expense-side VAT is not tracked anywhere — so **no net VAT is shown at
 *  all**, the same refusal `finance/TaxManagement` makes: a net that subtracts
 *  an input VAT of nothing reads as reconciled when it is simply not modelled.
 *  `netVat: 125200` was exactly that figure, invented.
 *
 *  ── Declared GAPs ────────────────────────────────────────────────────────
 *
 *  **Filing frequency and filing dates.** Nothing records them: no column, no
 *  collection, no endpoint. `Quarterly` and `2026-09-30` were invented, and the
 *  screen now says the filing calendar is not tracked rather than naming a date
 *  someone might file by.
 *
 *  **Input VAT**, as above — not modelled, so no net payable.
 *
 *  `autoCalculate: true` is gone rather than replaced: VAT is not a toggle here.
 *  The server computes it on every invoice it prices, with no switch to read,
 *  so it is stated as a fact of the pricing rule instead of rendered as a
 *  setting somebody might think they could turn off.
 */
export function VATSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  /* The organization's own recorded tax identity. Live only — there is no
   * fixture, deliberately: a fabricated registration number is the defect this
   * screen is being fixed for. */
  const profile = useQuery<OrgTaxProfile>({
    queryKey: ORG_TAX_PROFILE_KEY,
    queryFn: () => organizationApi!.taxProfile(),
    enabled: organizationApi !== null,
  })

  /* The rate this deployment enforces when the server can be asked, and
   * otherwise the contract standard rate the client's own pricing transcription
   * uses. Both are the rate an invoice is priced at; only the first is specific
   * to this deployment, and the label below says which one is on screen. */
  const enforcedBps = profile.data?.vatRateBps ?? VAT_RATE_BPS
  const ratePercent = percentOfBps(enforcedBps)
  const rateSourceLabel = profile.data
    ? t('Deployment configuration')
    : t('Contract standard rate')

  const registration: { label: string; value: string | null; recorded: boolean }[] = profile.data
    ? [
        { label: t('Organization'), value: profile.data.name, recorded: false },
        { label: t('VAT registration number'), value: profile.data.vatNumber, recorded: true },
        { label: t('Commercial registration'), value: profile.data.crNumber, recorded: true },
      ]
    : []

  const RateBlock = (
    <>
      {/* Not labelled "standard rate": the number is whatever this deployment
          charges, which a rate change makes something other than the standard
          one. The label says what the figure does, and the source line below
          says where it came from. */}
      <p className="text-[11px] font-medium text-muted">{t('Rate charged on every invoice')}</p>
      <p className="font-display text-[28px] font-black leading-none text-salis-blue" dir="ltr">
        {ratePercent}%
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-heading">
        <Icon name="Settings2" size={15} className="text-salis-blue" />
        {rateSourceLabel}
      </p>
      {profile.data ? (
        <NoteLine>
          {t(
            'The rate the server charges on every invoice it prices, read from the configuration the pricing rule reads. Changing it is a deployment change, not a setting on this screen.'
          )}
        </NoteLine>
      ) : (
        <NoteLine>
          {t(
            'This build has no API, so the rate this deployment enforces cannot be read. Shown is the contract standard rate the client prices unsaved drafts at.'
          )}
        </NoteLine>
      )}
      <NoteLine>
        {t('VAT is computed by the server on the discounted net of every invoice it prices; there is no switch for it.')}
      </NoteLine>
    </>
  )

  const RegistrationBlock = (
    <>
      {organizationApi === null ? (
        <NoteLine>
          {t(
            'Registration numbers are recorded on the organization’s own record and can only be read from the API. This build has none, so none is shown rather than a stand-in.'
          )}
        </NoteLine>
      ) : profile.isLoading ? (
        <Loading label={t('Reading the organization record…')} />
      ) : profile.error || !profile.data ? (
        <ErrorState
          title={t('Could not read the organization record')}
          description={profile.error?.message}
          onRetry={() => void profile.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4">
            {registration.map((row) => (
              <TaxRow key={row.label} label={row.label}>
                {row.recorded ? (
                  <RecordedValue value={row.value} />
                ) : (
                  <span className="text-sm font-medium text-heading">{row.value}</span>
                )}
              </TaxRow>
            ))}
          </div>
          {profile.data.vatNumber ? (
            <NoteLine>
              {t('This is the seller VAT number the server stamps onto every invoice it issues, and into its ZATCA QR payload.')}
            </NoteLine>
          ) : (
            <NoteLine tone="warn">
              {t('No VAT registration number is recorded, so the server refuses to issue an invoice: it has no seller identity to stamp onto a tax document.')}
            </NoteLine>
          )}
        </>
      )}
      <NoteLine tone="warn">
        {t('GAP: no filing frequency or filing date is recorded anywhere in this system, so no filing calendar is shown.')}
      </NoteLine>
    </>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Receipt" title={t('VAT Settings')} subtitle={t('VAT configuration')} />
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Enforced VAT rate')}</p>} />
          <div className="flex flex-col gap-1">{RateBlock}</div>
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Tax registration')}</p>} />
          <div className="flex flex-col gap-3">{RegistrationBlock}</div>
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Output VAT')}</p>} />
          {isLive ? <OutputVatPanel /> : <AggregateGapNotice endpoint={AGGREGATE_GAP.tax} />}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Receipt" title={t('VAT Settings')} subtitle={t('VAT configuration')} />

      <Card className="flex flex-col gap-2 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-heading">{t('Enforced VAT rate')}</h2>
        {RateBlock}
      </Card>

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Tax registration')}</h2>
        {RegistrationBlock}
      </Card>

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Output VAT')}</h2>
        {isLive ? <OutputVatPanel /> : <AggregateGapNotice endpoint={AGGREGATE_GAP.tax} />}
      </Card>
    </div>
  )
}

/** What the server computed, over every issued invoice in the tenant scope.
 *
 *  No date range, and the caption under the figure says so: a filing period is
 *  exactly what this system does not record, so labelling a figure "this quarter"
 *  would be the invention the old `SUMMARY` block already was. `financeReports`
 *  is null on a build with no API, so this never mounts there. */
function OutputVatPanel() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const query = useTaxReturn({})

  if (query.isLoading) return <Loading label={t('Computing output VAT…')} />
  if (query.error || !query.data) {
    return (
      <ErrorState
        title={t('Could not compute output VAT')}
        description={query.error?.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const r = query.data
  const ratePercent = percentOfBps(r.rateBps)

  if (r.invoiceCount === 0) {
    return (
      <div className="flex flex-col gap-3">
        <ServerTotalsNote endpoint="GET /accounting/tax/return" />
        <EmptyState
          icon="Percent"
          title={t('No output VAT charged yet')}
          description={t('No invoice has been issued, so the server has charged no VAT. Nothing is estimated in its place.')}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ServerTotalsNote endpoint="GET /accounting/tax/return" />
      <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-3'}>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">
            {t('Output VAT charged')} ({ratePercent}%)
          </p>
          <p className="font-display text-[24px] font-black leading-tight text-salis-blue" dir="ltr">
            {formatSar(fromHalalas(r.outputVatHalalas))}
          </p>
          <p className="text-[11px] text-muted">
            {r.invoiceCount} {t('issued invoices, all dates')}
          </p>
        </Card>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Taxable sales')}</p>
          <p className="mt-1 text-[18px] font-bold text-heading" dir="ltr">
            {formatSar(fromHalalas(r.taxableSalesHalalas))}
          </p>
          <p className="text-[11px] text-muted">{t('Net of discount, the VAT base')}</p>
        </Card>
        <Card className="flex flex-col gap-1 rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Input VAT')}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-heading">
            <Icon name="Info" size={15} className="text-salis-orange" />
            {t('Not modelled')}
          </p>
          <p className="text-[11px] text-muted">
            {t(
              'GAP: expense-side VAT is not tracked, so no net VAT is shown — output VAT is not a filing figure on its own.'
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}
