import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { MobileCardRow } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Shared parts of the three tax-compliance screens (BLK-004).
 *
 *  ── The distinction these screens are built around ────────────────────────
 *
 *  **Recorded** — the organization's VAT and commercial-registration numbers.
 *  A registration number is genuinely a property of the organization: it is
 *  issued to it and stored on its row, and `POST /invoices/:id/issue` reads it,
 *  stamps it onto the invoice and into the ZATCA QR payload, and refuses to
 *  issue without it. So it is read from that row, and when the row records none
 *  these screens say so. They used to display `311234567890003` — a made-up
 *  government registration identifier, presented as this organization's own.
 *
 *  **Enforced** — the VAT rate. The server reads it from deployment
 *  configuration (`VAT_RATE_BPS`) and charges it on every invoice it prices, so
 *  these screens read it from the same place rather than printing a percentage
 *  that merely coincides with it. Which is why there is no control over it
 *  here: a database-backed editable rate would be a tax setting the enforcement
 *  ignores, and an ignored control over tax is worse than an obvious mock.
 *
 *  **Derived** — every monetary total. The server sums those in SQL over the
 *  whole tenant scope (`GET /accounting/tax/return`); nothing on these screens
 *  adds up a page of rows, and where no such computation exists the figure is
 *  declared absent rather than estimated.
 */

/** One key for the organization read, so the three screens share one cache
 *  entry rather than fetching the same row three times. */
export const ORG_TAX_PROFILE_KEY = ['organization'] as const

/** Basis points as a percentage string — `1500` → `15.00`. The rate is carried
 *  in bps end to end so it is exact; this is the only place it becomes a
 *  percentage, for display. */
export function percentOfBps(bps: number): string {
  return (bps / 100).toFixed(2)
}

/** A recorded value, or the honest absence of one.
 *
 *  Deliberately not a dash: "—" reads as "nothing to show here", and for a VAT
 *  registration number the difference matters — an organization with none
 *  cannot issue an invoice at all, which is a state worth naming. */
export function RecordedValue({ value }: { value: string | null }) {
  const { t } = usePreferences()
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-salis-orange">
        <Icon name="AlertCircle" size={14} />
        {t('Not recorded')}
      </span>
    )
  }
  return (
    <span className="font-mono text-sm font-medium text-heading" dir="ltr">
      {value}
    </span>
  )
}

/** One label/value line, in the shape each layout wants: a mobile card row on a
 *  phone, a ruled row in a desktop card. Kept here so the three screens present
 *  a recorded value the same way. */
export function TaxRow({ label, children }: { label: string; children: ReactNode }) {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileCardRow label={label}>{children}</MobileCardRow>
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  )
}

/** A small informational line under a card: what a figure is, where it came
 *  from, or what is not knowable here. */
export function NoteLine({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon
        name={tone === 'warn' ? 'AlertTriangle' : 'Info'}
        size={12}
        className={`mt-0.5 flex-shrink-0 ${tone === 'warn' ? 'text-salis-orange' : 'text-salis-blue'}`}
      />
      <span className="min-w-0">{children}</span>
    </p>
  )
}
