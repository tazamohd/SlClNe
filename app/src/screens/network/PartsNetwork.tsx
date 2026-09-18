import { Link, useNavigate } from 'react-router-dom'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The parts-network screens: a proposed garage-to-garage marketplace for
 *  sourcing parts (send an RFQ, collect quotes from other network members,
 *  place orders, browse the member directory).
 *
 *  No backend concept backs this today. `API_REGISTRY.json` has no
 *  parts-network / marketplace routes, `packages/contract/` has no matching
 *  types, and no `parts_network`/`supply_network` table exists in
 *  `server/drizzle/`. `/api/v1/procurement/suppliers` is a real, wired
 *  endpoint, but it is this workshop's own single-tenant vendor directory for
 *  raising purchase orders — not a cross-shop directory of other network
 *  members you request quotes from and order through. `/api/v1/diagnostics/parts`
 *  is a parts catalog, not a network of trading partners either. So rather
 *  than keep rendering the design's fixture numbers/rows (a false success),
 *  every view here is an honest "no data source yet" shell, following the
 *  `StaffGap.tsx` / `hr/bits.tsx#ConnectApi` convention used elsewhere in this
 *  codebase for screens whose backend doesn't exist. Navigation between the
 *  sub-views is preserved so the page shell still reads as a real feature. */

function GapPanel({
  icon,
  title,
  description,
  collection,
}: {
  icon: string
  title: string
  description: string
  collection: string
}) {
  const { t } = usePreferences()
  return (
    <Card className="p-6">
      <EmptyState icon={icon} title={t(title)} description={t(description)} />
      <p className="mt-3 flex flex-wrap items-start justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">
          {collection}
        </span>
      </p>
    </Card>
  )
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export function PartsNetworkDashboard() {
  const { t } = usePreferences()

  const actions = [
    {
      title: 'Request Quotation',
      desc: 'Send a new part price request to suppliers',
      cta: 'Send Request',
      to: '/parts-network/send-request',
      icon: 'Send',
    },
    {
      title: 'View Incoming Requests',
      desc: 'Respond to quotation requests from garages',
      cta: 'View Requests',
      to: '/parts-network/incoming',
      icon: 'Inbox',
    },
  ]

  return (
    <>
      <FeatureHeader
        icon="Network"
        title={t('Parts Network')}
        subtitle={t('Source parts from garages, dealers and suppliers across the network')}
      />

      <GapPanel
        icon="Network"
        title={t('Parts Network has no data source yet')}
        description={t(
          'A cross-shop parts marketplace — requests, quotes, orders and a member directory — has no backend behind it. This workshop’s own suppliers live in Procurement; the network of other garages and dealers to trade with does not exist as a collection yet, so no counts are shown rather than invented ones.'
        )}
        collection="partsNetwork"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {actions.map((action) => (
          <Card key={action.title} className="flex items-start gap-4 rounded-lg p-5">
            <span className="flex flex-shrink-0 rounded-[10px] bg-salis-blue/[.09] p-2.5 text-salis-blue">
              <Icon name={action.icon} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-heading">{t(action.title)}</h2>
              <p className="mt-1 text-[13px] text-muted">{t(action.desc)}</p>
              <Link
                to={action.to}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:text-white hover:no-underline"
              >
                {t(action.cta)}
                <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── My requests ─────────────────────────────────────────────────────────────
export function PartsNetworkRequests() {
  const { t } = usePreferences()
  const navigate = useNavigate()

  return (
    <>
      <FeatureHeader
        icon="Send"
        title={t('My Requests')}
        subtitle={t('Quotation requests you have sent to the network')}
        actions={
          <Button size="md" onClick={() => navigate('/parts-network/send-request')}>
            <Icon name="Plus" size={16} />
            {t('Send Request')}
          </Button>
        }
      />
      <GapPanel
        icon="Send"
        title={t('No data source for sent requests yet')}
        description={t(
          'Requests sent to other network members would live in a partsNetworkRequests collection the API does not serve yet, so none are shown rather than fabricated ones.'
        )}
        collection="partsNetworkRequests"
      />
    </>
  )
}

// ── Orders ──────────────────────────────────────────────────────────────────
export function PartsNetworkOrders() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Orders')}
        subtitle={t('Parts ordered through the network')}
      />
      <GapPanel
        icon="ShoppingCart"
        title={t('No data source for network orders yet')}
        description={t(
          'Orders placed with other network members would live in a partsNetworkOrders collection the API does not serve yet, so none are shown rather than fabricated ones.'
        )}
        collection="partsNetworkOrders"
      />
    </>
  )
}

// ── Members ─────────────────────────────────────────────────────────────────
export function PartsNetworkMembers() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Network Members')}
        subtitle={t('Garages, dealers, stores and suppliers you can trade with')}
      />
      <GapPanel
        icon="Building2"
        title={t('No data source for the member directory yet')}
        description={t(
          'A directory of other garages, dealers and stores to trade with would live in a partsNetworkMembers collection the API does not serve yet. This workshop’s own vendors are listed under Procurement → Suppliers instead, so no network members are shown here rather than fabricated ones.'
        )}
        collection="partsNetworkMembers"
      />
    </>
  )
}

// ── Incoming requests ───────────────────────────────────────────────────────
export function PartsNetworkIncoming() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="Inbox"
        title={t('Incoming Requests')}
        subtitle={t('Quotation requests other garages have sent you')}
      />
      <GapPanel
        icon="Inbox"
        title={t('No data source for incoming requests yet')}
        description={t(
          'Requests from other network members would live in a partsNetworkIncomingRequests collection the API does not serve yet, so none are shown rather than fabricated ones.'
        )}
        collection="partsNetworkIncomingRequests"
      />
    </>
  )
}
