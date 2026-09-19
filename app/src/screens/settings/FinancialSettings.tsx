import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { organizationApi, type OrgTaxProfile } from '@/data/repository'
import { HALALAS_PER_SAR } from '@/screens/finance/money'

const ORG_TAX_PROFILE_KEY = ['organization'] as const

/** Seven hand-picked values used to sit here: `Default Currency: 'SAR'`,
 *  `Fiscal Year Start: 'January 1'`, `Invoice Prefix: 'INV-'`, `Invoice
 *  Numbering: 'Sequential'`, `Payment Terms: 'Net 30'`, `Tax Rate: '15%'` and
 *  `Rounding: '2 decimal places'`. `Tax Rate` was the same hardcoded literal
 *  the tax-compliance screens carried before their own fix landed — now read from
 *  `organizationApi.taxProfile()`, the exact accessor those screens already
 *  use, rather than a second copy of the mistake it fixed there. `Currency`
 *  and the invoice-numbering scheme (`INV-<year>-<sequence>`, assigned by
 *  `routes/invoices.ts`'s `nextCode`) are real, code-enforced facts — not
 *  per-org settings, so shown as facts rather than as an editable row.
 *  `Fiscal Year Start` and `Payment Terms` are dropped outright: no fiscal
 *  year exists anywhere in this schema, and `dueDate` is required per
 *  invoice precisely because there is no default term to fall back on
 *  (`routes/invoices.ts`'s own comment: "payment terms are a commercial
 *  decision"). `Rounding` was never its own setting — it was always just
 *  `HALALAS_PER_SAR`'s two decimal places restated as a different label. */
export function FinancialSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const profile = useQuery<OrgTaxProfile>({
    queryKey: ORG_TAX_PROFILE_KEY,
    queryFn: () => organizationApi!.taxProfile(),
    enabled: organizationApi !== null,
  })

  const ratePercent = profile.data ? (profile.data.vatRateBps / 100).toFixed(2) : null

  const Body =
    organizationApi === null ? (
      <p className="flex items-start gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        <span>{t('The enforced VAT rate can only be read from the API. This build has none, so nothing is shown in its place.')}</span>
      </p>
    ) : profile.isLoading ? (
      <Loading label={t('Reading the enforced tax rate…')} />
    ) : profile.error || !profile.data ? (
      <ErrorState
        title={t('Could not read the tax rate')}
        description={profile.error?.message}
        onRetry={() => void profile.refetch()}
      />
    ) : (
      <div className="grid gap-4">
        <Row label={t('Invoice VAT Rate')} value={`${ratePercent}%`} />
        <Row label={t('Currency')} value={t(`SAR, tracked as halalas (${HALALAS_PER_SAR} to the riyal)`)} />
        <Row label={t('Invoice Numbering')} value={t('INV-<year>-<sequence>, assigned by the server')} />
      </div>
    )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Landmark" title={t('Financial Settings')} subtitle={t('Enforced financial configuration')} />
        <MobileCard>
          {organizationApi === null || profile.isLoading || profile.error || !profile.data ? (
            <div className="p-3">{Body}</div>
          ) : (
            <>
              <MobileCardRow label={t('Invoice VAT Rate')} value={<span dir="ltr">{`${ratePercent}%`}</span>} />
              <MobileCardRow label={t('Currency')} value={t(`SAR, tracked as halalas (${HALALAS_PER_SAR} to the riyal)`)} />
              <MobileCardRow label={t('Invoice Numbering')} value={<span dir="ltr">{t('INV-<year>-<sequence>, assigned by the server')}</span>} />
            </>
          )}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Landmark" title={t('Financial Settings')} subtitle={t('Enforced financial configuration')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
            <Icon name="Landmark" size={16} />
          </span>
          <h2 className="text-sm font-semibold text-heading">{t('Configuration')}</h2>
        </div>
        {Body}
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span dir="ltr" className="font-mono text-sm font-medium text-heading">
        {value}
      </span>
    </div>
  )
}
