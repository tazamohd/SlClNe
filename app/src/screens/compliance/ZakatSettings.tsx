import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { organizationApi, type OrgTaxProfile } from '@/data/repository'
import { NoteLine, ORG_TAX_PROFILE_KEY, RecordedValue, TaxRow } from './taxIdentity'

/** Zakat — the recorded registration this organization would file under, and an
 *  explicit refusal to state a zakat figure this system cannot compute.
 *
 *  ── What this screen used to hold ─────────────────────────────────────────
 *
 *  One hardcoded `CONFIG` object: `zakatRate: '2.5%'`, `assessmentYear: '2026'`,
 *  `zakatBase: 4850000`, `estimatedZakat: 121250`, `filingStatus: 'Pending'`.
 *  The two monetary figures are the serious ones: SAR 4,850,000 of zakat base
 *  and SAR 121,250 of zakat owed, invented and displayed as this organization's
 *  own tax position.
 *
 *  ── Why they are removed rather than re-sourced ───────────────────────────
 *
 *  **A zakat base is not derivable from anything here.** Under the ZATCA rules
 *  it is a net-worth computation over an adjusted balance sheet — additions,
 *  deductions and a choice of method — and nothing in this system performs it.
 *  The trial balance's equity figure is *not* a zakat base, and presenting it as
 *  one would be inventing a tax methodology, which is a worse fabrication than
 *  the constant it replaced: a wrong number nobody can audit, wearing the look
 *  of a computation. `estimatedZakat` was that number multiplied by a rate.
 *
 *  **An assessment year and a filing status are not recorded either.** No fiscal
 *  year, no zakat filing and no filing state exists in the schema, so `2026` and
 *  `Pending` had nothing behind them.
 *
 *  So this screen declares the gap and shows the one thing it can stand behind:
 *  the registration this organization would file under, read from its own row
 *  through `GET /organization`. The statutory rate is stated as a
 *  fact of Saudi law in the note below rather than rendered as a configured
 *  value, because nothing in this system applies it to anything — unlike VAT,
 *  which the server genuinely charges at the rate it is configured with.
 */
export function ZakatSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const profile = useQuery<OrgTaxProfile>({
    queryKey: ORG_TAX_PROFILE_KEY,
    queryFn: () => organizationApi!.taxProfile(),
    enabled: organizationApi !== null,
  })

  const RegistrationBlock =
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
      <div className="grid gap-4">
        <TaxRow label={t('Organization')}>
          <span className="text-sm font-medium text-heading">{profile.data.name}</span>
        </TaxRow>
        <TaxRow label={t('Commercial registration')}>
          <RecordedValue value={profile.data.crNumber} />
        </TaxRow>
        <TaxRow label={t('VAT registration number')}>
          <RecordedValue value={profile.data.vatNumber} />
        </TaxRow>
      </div>
    )

  const AssessmentBlock = (
    <div className="flex flex-col gap-3">
      <NoteLine tone="warn">
        {t(
          'GAP: no zakat base, zakat due, assessment year or filing status is recorded or computed anywhere in this system, so none is shown.'
        )}
      </NoteLine>
      <NoteLine>
        {t(
          'A zakat base is a net-worth computation over an adjusted balance sheet under the authority’s rules. Nothing here performs it, and the ledger’s equity figure is not one — so no figure is estimated in its place.'
        )}
      </NoteLine>
      <NoteLine>
        {t(
          'The statutory zakat rate on an assessed base is 2.5%. It is stated here as law, not as a setting: no computation in this system applies it to anything.'
        )}
      </NoteLine>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Heart" title={t('Zakat Settings')} subtitle={t('Zakat configuration')} />
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Filing registration')}</p>} />
          {RegistrationBlock}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Zakat assessment')}</p>} />
          {AssessmentBlock}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Heart" title={t('Zakat Settings')} subtitle={t('Zakat configuration')} />

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Filing registration')}</h2>
        {RegistrationBlock}
      </Card>

      <Card className="flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-heading">{t('Zakat assessment')}</h2>
        {AssessmentBlock}
      </Card>
    </div>
  )
}
