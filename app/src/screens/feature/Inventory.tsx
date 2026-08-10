import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  ScopeSelect,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Part = RowOf<'parts'>

const BRANCHES = ['AutoFix Garage', 'Riyadh Central', 'Jeddah North'] as const

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'Package' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' },
  { id: 'reorder', label: 'Auto-Reorder', icon: 'Settings' },
  { id: 'transfers', label: 'Transfers', icon: 'ArrowLeftRight' },
  { id: 'pricing', label: 'Pricing', icon: 'TrendingUp' },
  { id: 'audit', label: 'Audit', icon: 'History' },
] as const

/** Inventory & parts management.
 *
 *  Has real data behind it, so it's a component rather than a `FeatureDef`:
 *  stock status and the low-stock count are derived from each part's level
 *  against its reorder point, not stated.
 *
 *  The reference screenshot tints "In Stock" green. Blue here — green is
 *  forbidden brand-wide (handoff README §7), and blue already carries positive
 *  state everywhere else in this app. */
export function Inventory() {
  const { t } = usePreferences()
  const { fieldHidden } = useSession()
  const { data: parts = [], isLoading } = useCollection('parts')
  const [branch, setBranch] = useState<string>(BRANCHES[0])
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const lowStock = useMemo(
    () => parts.filter((part) => part.stock <= part.reorder),
    [parts]
  )

  const visible = useMemo(() => {
    const base = tab === 'alerts' ? lowStock : parts
    const needle = query.trim().toLowerCase()
    if (!needle) return base
    return base.filter((part) =>
      [part.name, part.sku].some((field) => field.toLowerCase().includes(needle))
    )
  }, [parts, lowStock, tab, query])

  // Purchase price is hidden from advisors, technicians, QC, front desk and
  // call centre (FIELD_RULES), so the price column drops out entirely for them
  // rather than showing a column of dashes.
  const hidePrice = fieldHidden('Supplier purchase price')

  const stats: Stat[] = [
    { label: 'Total Parts', value: parts.length, caption: 'Active items', highlight: true },
    {
      label: 'Low Stock Alerts',
      value: lowStock.length,
      caption: 'Requires attention',
      tone: 'warning',
    },
    { label: 'Pending Transfers', value: 0, caption: 'Awaiting approval', tone: 'info' },
    { label: 'Auto-Reorder Enabled', value: 0, caption: 'Active rules' },
  ]

  const columns: Column<Part>[] = [
    { header: 'Part Name', cell: (part) => part.name },
    { header: 'SKU', cell: (part) => part.sku, code: true },
    {
      header: 'On Hand',
      cell: (part) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {part.stock}
        </span>
      ),
    },
    {
      header: 'Reorder At',
      cell: (part) => (
        <span className="font-mono text-[13px] text-muted" dir="ltr">
          {part.reorder}
        </span>
      ),
    },
    ...(hidePrice
      ? []
      : [
          {
            header: 'Price',
            cell: (part: Part) => <Money sar={parseSar(part.price)} />,
          },
        ]),
    { header: 'Stock Status', cell: (part) => <StockBadge part={part} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Package"
        title={t('Inventory & Parts Management')}
        subtitle={t('Advanced inventory control with stock alerts, auto-reordering, and multi-location transfers')}
      />

      <ScopeSelect value={branch} onChange={setBranch} options={BRANCHES} />
      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Inventory Summary')}
        subtitle={t('Quick overview of parts inventory')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search parts...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={visible}
          rowKey={(part) => part.sku}
          loading={isLoading}
          mobileCard={(part) => (
            <>
              <MobileCardHeader title={part.name} trailing={<StockBadge part={part} />} />
              <MobileCardRow label={t('SKU')}>
                <span className="font-mono" dir="ltr">
                  {part.sku}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('On Hand')}>
                <span className="font-mono" dir="ltr">
                  {part.stock} / {part.reorder}
                </span>
              </MobileCardRow>
              {hidePrice ? null : (
                <MobileCardRow label={t('Price')}>
                  <Money sar={parseSar(part.price)} className="font-semibold text-heading" />
                </MobileCardRow>
              )}
            </>
          )}
          empty={
            <EmptyState
              icon={tab === 'alerts' ? 'ShieldCheck' : 'Package'}
              title={tab === 'alerts' ? t('No low stock alerts') : t('No parts tracked yet')}
              description={
                tab === 'alerts'
                  ? t('Every part is above its reorder point.')
                  : t('Add parts to start tracking stock.')
              }
            />
          }
        />
      </Section>
    </>
  )
}

/** Stock level against the part's own reorder point. */
function StockBadge({ part }: { part: Part }) {
  const { t } = usePreferences()
  const low = part.stock <= part.reorder
  return low ? (
    <Badge background="rgba(249,115,22,.1)" color="#F97316">
      {t('Low Stock')}
    </Badge>
  ) : (
    <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
      {t('In Stock')}
    </Badge>
  )
}
