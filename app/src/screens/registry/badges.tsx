import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Status pills for the registry screens — customers, vehicles, fleets,
 *  estimates and the invoice rows a customer's detail page lists.
 *
 *  `data/generated/badges.ts` carries the design's palette tables for job
 *  status, service type and priority, but not for these five, so the screens
 *  had the colours inline. Colours are named through the CSS custom properties
 *  the token files define rather than repeated as hex literals: a hex in a
 *  screen is a value that no longer changes when the theme does, which is the
 *  drift `scripts/check-tokens.mjs` counts.
 *
 *  Blue is active/settled, orange is attention, slate is inert. There is no
 *  green and no red in this product (README §7). */

const TINT = {
  blue: { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' },
  bright: { background: 'rgba(11,179,255,.1)', color: 'var(--salis-blue-bright)' },
  orange: { background: 'rgba(249,115,22,.1)', color: 'var(--salis-orange)' },
  slate: { background: 'rgba(100,116,139,.1)', color: 'var(--text-muted)' },
} as const

export type Tint = keyof typeof TINT

export function TintBadge({ tint, label }: { tint: Tint; label: string }) {
  const { t } = usePreferences()
  return <Badge {...TINT[tint]}>{t(label)}</Badge>
}

/** `active` | `service` | `inactive` — the three the contract's `vehicleStatus`
 *  enum allows. In service is Bright Blue, matching the vehicle registry. */
export function VehicleStatusBadge({ value }: { value: string }) {
  if (value === 'service') return <TintBadge tint="bright" label="In Service" />
  if (value === 'inactive') return <TintBadge tint="slate" label="Inactive" />
  return <TintBadge tint="blue" label="Active" />
}

export function EstimateStatusBadge({ value }: { value: string }) {
  if (value === 'sent') return <TintBadge tint="bright" label="Sent" />
  if (value === 'approved') return <TintBadge tint="blue" label="Approved" />
  return <TintBadge tint="slate" label="Draft" />
}

/** A fleet contract due for renewal is the one thing on that screen that needs
 *  acting on, so it takes the warning tint. */
export function FleetContractBadge({ value }: { value: string }) {
  return value === 'renewal' ? (
    <TintBadge tint="orange" label="Renewal Due" />
  ) : (
    <TintBadge tint="blue" label="Active" />
  )
}

/** Invoice settlement, as the customer's detail page lists it. */
export function InvoiceStatusBadge({ value }: { value: string }) {
  if (value === 'paid') return <TintBadge tint="blue" label="Paid" />
  if (value === 'overdue') return <TintBadge tint="orange" label="Overdue" />
  if (value === 'partial') return <TintBadge tint="bright" label="Partial" />
  return <TintBadge tint="orange" label="Unpaid" />
}
