import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { AdvancedFilters, type ActiveFilter, type FilterGroup } from '@/components/ui/AdvancedFilters'
import { ExportCenter, type ExportColumn } from '@/components/ui/ExportCenter'
import { ImportCenter, type ImportField } from '@/components/ui/ImportCenter'
import { Button } from '@/components/ui/Button'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const ITEMS = [
  { sku: 'SKU-001', name: 'Oil Filter', category: 'Filters', onHand: 120, reserved: 15, available: 105, reorderPoint: 20, unitCost: 18.50, status: 'In Stock' },
  { sku: 'SKU-002', name: 'Brake Pad Set', category: 'Brakes', onHand: 8, reserved: 3, available: 5, reorderPoint: 10, unitCost: 145.00, status: 'Low Stock' },
  { sku: 'SKU-003', name: 'Spark Plug', category: 'Engine Parts', onHand: 200, reserved: 30, available: 170, reorderPoint: 50, unitCost: 12.75, status: 'In Stock' },
  { sku: 'SKU-004', name: 'Alternator', category: 'Electrical', onHand: 0, reserved: 0, available: 0, reorderPoint: 5, unitCost: 520.00, status: 'Out of Stock' },
  { sku: 'SKU-005', name: 'Engine Oil 5W-30', category: 'Fluids', onHand: 75, reserved: 10, available: 65, reorderPoint: 30, unitCost: 42.00, status: 'In Stock' },
  { sku: 'SKU-006', name: 'Front Bumper', category: 'Body', onHand: 3, reserved: 1, available: 2, reorderPoint: 5, unitCost: 890.00, status: 'Low Stock' },
  { sku: 'SKU-007', name: 'Air Filter', category: 'Filters', onHand: 95, reserved: 5, available: 90, reorderPoint: 20, unitCost: 24.00, status: 'In Stock' },
  { sku: 'SKU-008', name: 'Headlight Assembly', category: 'Electrical', onHand: 0, reserved: 0, available: 0, reorderPoint: 3, unitCost: 675.00, status: 'Out of Stock' },
  { sku: 'SKU-009', name: 'Brake Fluid', category: 'Fluids', onHand: 50, reserved: 8, available: 42, reorderPoint: 15, unitCost: 28.50, status: 'In Stock' },
  { sku: 'SKU-010', name: 'Timing Belt', category: 'Engine Parts', onHand: 6, reserved: 2, available: 4, reorderPoint: 8, unitCost: 185.00, status: 'Low Stock' },
] as const

type Item = (typeof ITEMS)[number]

function statusColor(status: string) {
  if (status === 'Out of Stock') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  if (status === 'Low Stock') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
}

const INVENTORY_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'onHand', label: 'On Hand' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'available', label: 'Available' },
  { key: 'reorderPoint', label: 'Reorder Pt' },
  { key: 'unitCost', label: 'Unit Cost' },
  { key: 'status', label: 'Status' },
]

const INVENTORY_IMPORT_FIELDS: ImportField[] = [
  { name: 'SKU', required: true, example: 'SKU-001' },
  { name: 'Name', required: true, example: 'Oil Filter' },
  { name: 'Category', required: true, example: 'Filters' },
  { name: 'On Hand', required: true, example: '120' },
  { name: 'Reorder Point', required: true, example: '20' },
  { name: 'Unit Cost', required: true, example: '18.50' },
]

export function InventoryManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const statuses = [...new Set(ITEMS.map((i) => i.status))]
    const categories = [...new Set(ITEMS.map((i) => i.category))]
    return [
      { id: 'status', label: 'Status', icon: 'Activity', options: statuses },
      { id: 'category', label: 'Category', icon: 'Tag', options: categories },
    ]
  }, [])

  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return [...ITEMS] as unknown as Item[]
    const groups = new Map<string, string[]>()
    for (const f of activeFilters) {
      const arr = groups.get(f.groupId) ?? []
      arr.push(f.value)
      groups.set(f.groupId, arr)
    }
    return ([...ITEMS] as unknown as Item[]).filter((item) => {
      for (const [groupId, values] of groups) {
        const field = groupId === 'status' ? item.status : item.category
        if (!values.includes(field)) return false
      }
      return true
    })
  }, [activeFilters])

  const totalValue = useMemo(() => ITEMS.reduce((sum, i) => sum + i.onHand * i.unitCost, 0), [])
  const lowStock = ITEMS.filter((i) => i.status === 'Low Stock').length
  const outOfStock = ITEMS.filter((i) => i.status === 'Out of Stock').length

  const kpis = [
    { label: t('Total SKUs'), value: String(ITEMS.length), icon: 'Package', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(totalValue), icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Low Stock Items'), value: String(lowStock), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Out of Stock'), value: String(outOfStock), icon: 'XCircle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Item>[] = [
    { header: 'SKU', cell: (item) => <span className="font-mono text-xs text-muted" dir="ltr">{item.sku}</span> },
    { header: 'Name', cell: (item) => <span className="font-medium text-heading">{item.name}</span> },
    { header: 'Category', cell: (item) => t(item.category) },
    { header: 'On Hand', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.onHand}</span> },
    { header: 'Reserved', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.reserved}</span> },
    { header: 'Available', cell: (item) => <span className="font-mono text-heading" dir="ltr">{item.available}</span> },
    { header: 'Reorder Pt', cell: (item) => <span className="font-mono text-muted" dir="ltr">{item.reorderPoint}</span> },
    { header: 'Unit Cost', cell: (item) => <Money sar={item.unitCost} /> },
    { header: 'Status', cell: (item) => <Badge {...statusColor(item.status)}>{t(item.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Inventory Management')} subtitle={t('Master inventory dashboard')} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => { setShowFilters(!showFilters); setShowExport(false); setShowImport(false) }}>
          <Icon name="SlidersHorizontal" size={14} />
          {t('Filters')}
          {activeFilters.length > 0 ? ` (${activeFilters.length})` : null}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setShowExport(!showExport); setShowFilters(false); setShowImport(false) }}>
          <Icon name="Download" size={14} />
          {t('Export')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setShowImport(!showImport); setShowFilters(false); setShowExport(false) }}>
          <Icon name="Upload" size={14} />
          {t('Import')}
        </Button>
      </div>

      {showFilters ? (
        <AdvancedFilters
          groups={filterGroups}
          active={activeFilters}
          onSelect={(groupId, value) => setActiveFilters((prev) => [...prev, { groupId, value }])}
          onRemove={(groupId, value) => setActiveFilters((prev) => prev.filter((f) => f.groupId !== groupId || f.value !== value))}
          onClear={() => setActiveFilters([])}
        />
      ) : null}

      {showExport ? (
        <ExportCenter
          title="Export Inventory"
          description="Export inventory items to a file"
          columns={INVENTORY_EXPORT_COLUMNS}
          totalRows={filteredItems.length}
          onExport={async () => { /* server-side export */ }}
        />
      ) : null}

      {showImport ? (
        <ImportCenter
          title="Import Inventory"
          description="Import inventory items from a CSV or Excel file"
          fields={INVENTORY_IMPORT_FIELDS}
          onImport={async () => ({ total: 0, imported: 0, skipped: 0, errors: [] })}
        />
      ) : null}

      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Inventory items"
        columns={columns}
        rows={filteredItems}
        rowKey={(item) => item.sku}
        empty={t('No inventory items found')}
        mobileCard={(item) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Package" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{item.name}</p>
                    <p className="text-xs text-muted" dir="ltr">{item.sku}</p>
                  </div>
                </div>
              }
              trailing={<Badge {...statusColor(item.status)}>{t(item.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(item.category)} />
            <MobileCardRow label={t('On Hand / Available')} value={`${item.onHand} / ${item.available}`} />
            <MobileCardRow label={t('Unit Cost')}><Money sar={item.unitCost} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
