import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { organizationApi, type OrgTaxProfile } from '@/data/repository'
import { NoteLine, ORG_TAX_PROFILE_KEY, RecordedValue, TaxRow, percentOfBps } from './taxIdentity'
import { VAT_RATE_BPS } from '@/screens/finance/money'

/** ZATCA e-invoicing — the recorded seller identity, and what this system
 *  actually does about phase-2 invoicing.
 *
 *  ── What this screen used to hold ─────────────────────────────────────────
 *
 *  One hardcoded `SETTINGS` object: `organizationTin: '300075588700003'`,
 *  `vatNumber: '311234567890003'`, `integrationStatus: 'Connected'`,
 *  `phase: 'Phase 2'`, `lastSync: '2026-08-17 14:32'`. Two fabricated government
 *  registration identifiers, and three claims about an integration that does not
 *  exist. Plus a "Test Connection" button wired to nothing.
 *
 *  ── What it holds now ────────────────────────────────────────────────────
 *
 *  **The seller VAT number, read from the organization's own row** through
 *  `GET /organization` — the same value `POST /invoices/:id/issue`
 *  stamps onto an invoice and into its ZATCA QR payload, and refuses to issue
 *  without. An organization that has recorded none shows as **not recorded**.
 *  The commercial-registration number is recorded the same way and shown beside
 *  it.
 *
 *  **`organizationTin` is gone, not re-sourced.** No tax identification number
 *  is recorded anywhere in this system — no column, no endpoint — and the
 *  15-digit value that was here was invented. Removing it is the honest outcome:
 *  there is nothing to read it from, and in Saudi practice the number ZATCA
 *  identifies the seller by on an invoice is the VAT registration number above.
 *
 *  **The integration status, phase and last-sync time are declared GAPs.**
 *  There is no ZATCA integration in this deployment: nothing clears an invoice,
 *  nothing reports one, and nothing syncs — so there is no status to report, no
 *  onboarding phase to be in and no sync time to show. `Connected` was not an
 *  optimistic reading of a partial integration; it described a connection that
 *  has never existed. The "Test Connection" button is removed with it: a control
 *  that calls no endpoint is worse than no control, because it invites someone to
 *  conclude the connection is fine.
 *
 *  What the system genuinely does at issue time is stated instead, because it is
 *  real and it is verifiable in `server/src/routes/invoices.ts`: each issued
 *  invoice is stamped with the seller VAT number, a base64 TLV QR payload, and a
 *  hash chained to the previously issued invoice. That is phase-2 *document*
 *  preparation. It is not clearance, and this screen does not call it clearance.
 */
export function ZATCASettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const profile = useQuery<OrgTaxProfile>({
    queryKey: ORG_TAX_PROFILE_KEY,
    queryFn: () => organizationApi!.taxProfile(),
    enabled: organizationApi !== null,
  })

  const ratePercent = percentOfBps(profile.data?.vatRateBps ?? VAT_RATE_BPS)

  const IdentityBlock =
    organizationApi === null ? (
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
          <TaxRow label={t('Organization')}>
            <span className="text-sm font-medium text-heading">{profile.data.name}</span>
          </TaxRow>
          <TaxRow label={t('Seller VAT registration number')}>
            <RecordedValue value={profile.data.vatNumber} />
          </TaxRow>
          <TaxRow label={t('Commercial registration')}>
            <RecordedValue value={profile.data.crNumber} />
          </TaxRow>
          <TaxRow label={t('Invoice VAT rate')}>
            <span className="font-mono text-sm font-medium text-heading" dir="ltr">
              {ratePercent}%
            </span>
          </TaxRow>
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
    )

  const StatusBlock = (
    <div className="flex flex-col gap-3">
      <NoteLine tone="warn">
        {t(
          'GAP: no ZATCA integration is configured in this deployment. Nothing clears, reports or syncs an invoice with the authority, so there is no integration status, onboarding phase or sync time to show.'
        )}
      </NoteLine>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold text-heading">{t('What the server does do at issue time')}</p>
        <ul className="flex flex-col gap-1.5 text-[11px] text-muted">
          <li className="flex items-start gap-1.5">
            <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            <span>{t('Stamps the organization’s recorded VAT number onto the invoice as the seller.')}</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            <span>{t('Builds the phase-2 QR payload from the seller, the timestamp, the total and the VAT.')}</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
            <span>{t('Chains each issued invoice’s hash to the previously issued one.')}</span>
          </li>
        </ul>
        <NoteLine>
          {t('That is document preparation, not clearance: no invoice here has been submitted to the authority.')}
        </NoteLine>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Seller identity')}</p>} />
          <div className="flex flex-col gap-3">{IdentityBlock}</div>
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Authority integration')}</p>} />
          {StatusBlock}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileCheck" title={t('ZATCA Settings')} subtitle={t('E-invoicing configuration')} />

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Seller identity')}</h2>
        {IdentityBlock}
      </Card>

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Authority integration')}</h2>
        {StatusBlock}
      </Card>
    </div>
  )
}
