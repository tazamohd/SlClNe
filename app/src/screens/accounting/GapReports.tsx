import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { EmptyState } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Two reports whose data does not exist server-side.
 *
 *  Insurance claims and auto-loan contracts have no collection in
 *  `server/src/registry.ts` and no bespoke router. Rather than invent rows — a
 *  fabricated claim or a made-up loan is worse than an empty screen, because it
 *  reads as real — these name the missing collection and stop. When the
 *  collection lands, the report is built against it. The `GAP:` tests pin the
 *  absence so the day the data arrives is the day the placeholder must go.
 */

function GapReport({
  icon,
  title,
  subtitle,
  collection,
  detail,
}: {
  icon: string
  title: string
  subtitle: string
  collection: string
  detail: string
}) {
  const { t } = usePreferences()
  return (
    <>
      <FeatureHeader icon={icon} title={t(title)} subtitle={t(subtitle)} />
      <Section title={t('No data source yet')}>
        <EmptyState icon={icon} title={t(title)} description={t(detail)} />
        <p className="flex items-start justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
          {t('Missing server collection:')}{' '}
          <span dir="ltr" className="font-mono text-body">
            {collection}
          </span>
        </p>
      </Section>
    </>
  )
}

export function InsuranceReports() {
  return (
    <GapReport
      icon="ShieldCheck"
      title="Insurance Reports"
      subtitle="Insurance claim reports"
      collection="insuranceClaims"
      detail="Claim reporting needs an insurance-claims collection on the server. None exists yet, so there is nothing to report on — no figures here are estimated or invented."
    />
  )
}

export function LoanReports() {
  return (
    <GapReport
      icon="Banknote"
      title="Loan Reports"
      subtitle="Auto-loan / financing reports"
      collection="loanContracts"
      detail="Financing reports need a loan-contracts collection on the server. None exists yet, so there is nothing to report on — no figures here are estimated or invented."
    />
  )
}
