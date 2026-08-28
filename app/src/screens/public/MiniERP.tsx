import { useT } from '@/providers/PreferencesProvider'
import { usePageMeta } from './usePageMeta'
import { SectionIntro } from './sections/SectionIntro'
import { StatBand } from './sections/StatBand'
import { IconCardGrid, type IconCardItem } from './sections/IconCardGrid'

/** PublicPortal.MiniERP — Mini ERP product page.
 *
 *  SectionIntro, a StatBand with headline figures, then six module cards
 *  covering the core ERP functionality for small workshops. */
const STATS = [
  { value: '6', label: 'Core Modules' },
  { value: 'SAR', label: 'Native Currency' },
  { value: 'ZATCA', label: 'e-Invoice Ready' },
]

const MODULES: readonly IconCardItem[] = [
  {
    icon: 'FileText',
    title: 'Invoicing',
    description: 'ZATCA Phase-2 compliant invoices with QR codes and e-submission',
    tint: 'blue',
  },
  {
    icon: 'CreditCard',
    title: 'Payments',
    description: 'Multi-method collection with mada, SADAD and bank transfer support',
    tint: 'bright',
  },
  {
    icon: 'Package',
    title: 'Inventory',
    description: 'Stock levels, reorder alerts and warehouse location tracking',
    tint: 'orange',
  },
  {
    icon: 'Users',
    title: 'Customers',
    description: 'Customer profiles, vehicle history and communication log',
    tint: 'navy',
  },
  {
    icon: 'Calculator',
    title: 'Estimates',
    description: 'Quick quotations with parts lookup and labour rate calculations',
    tint: 'blue',
  },
  {
    icon: 'BarChart3',
    title: 'Reports',
    description: 'Revenue, expenses and profit dashboards with export to Excel',
    tint: 'bright',
  },
]

export function PublicMiniERP() {
  const t = useT()
  usePageMeta({
    title: t('Mini ERP — SALIS AUTO'),
    description: t('Lightweight ERP built for small and mid-size Saudi workshops'),
  })

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-up motion-reduce:animate-none px-5 py-10 md:px-10 md:py-[60px]">
      <SectionIntro
        centered
        title="Mini ERP"
        subtitle="Lightweight ERP built for small and mid-size Saudi workshops"
      />
      <StatBand items={STATS} />
      <IconCardGrid items={MODULES} columns={3} centered iconSize={24} />
    </div>
  )
}
