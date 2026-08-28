import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search } from '@/components/ui/Search'
import { Badge } from '@/components/ui/Badge'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'

interface Prompt {
  id: number
  name: string
  category: string
  catBg: string
  catFg: string
  preview: string
  uses: string
  favorited: boolean
}

function usePrompts(t: (s: string) => string): Prompt[] {
  return useMemo(() => [
    { id: 1, name: t('Monthly Revenue Summary'), category: t('Finance'), catBg: 'var(--tint-blue)', catFg: 'var(--salis-blue)', preview: 'Generate a comprehensive revenue breakdown by service type, branch, and customer segment for the current month.', uses: '124', favorited: true },
    { id: 2, name: t('Inventory Reorder Check'), category: t('Inventory'), catBg: 'var(--tint-orange)', catFg: 'var(--salis-orange)', preview: 'List all parts below reorder level with supplier info and estimated delivery times.', uses: '89', favorited: true },
    { id: 3, name: t('Customer Follow-up Draft'), category: t('CRM'), catBg: 'var(--tint-bright)', catFg: 'var(--salis-blue-bright)', preview: 'Draft a follow-up email for customers who haven\'t visited in 60+ days.', uses: '67', favorited: false },
    { id: 4, name: t('Technician Schedule Optimizer'), category: t('Operations'), catBg: 'var(--tint-navy)', catFg: 'var(--text-heading)', preview: 'Analyze current job assignments and suggest optimal technician allocation.', uses: '52', favorited: false },
    { id: 5, name: t('Tax Filing Checklist'), category: t('Accounting'), catBg: 'var(--tint-neutral)', catFg: 'var(--text-muted)', preview: 'Generate a ZATCA VAT filing checklist with all required documents and calculations.', uses: '41', favorited: true },
    { id: 6, name: t('Job Card Summary'), category: t('Workshop'), catBg: 'var(--tint-blue)', catFg: 'var(--salis-blue)', preview: 'Summarize all active job cards with status, assigned technician, and ETA.', uses: '156', favorited: true },
    { id: 7, name: t('Performance Review'), category: t('HR'), catBg: 'var(--tint-bright)', catFg: 'var(--salis-blue-bright)', preview: 'Generate a performance review summary for a technician based on their metrics.', uses: '38', favorited: false },
    { id: 8, name: t('Fleet Report'), category: t('Fleet'), catBg: 'var(--tint-orange)', catFg: 'var(--salis-orange)', preview: 'Create a detailed fleet maintenance report for a specific account.', uses: '45', favorited: false },
    { id: 9, name: t('Appointment Optimizer'), category: t('Scheduling'), catBg: 'var(--tint-navy)', catFg: 'var(--text-heading)', preview: 'Analyze appointment patterns and suggest optimal time slots for next week.', uses: '33', favorited: false },
  ], [t])
}

export function PromptLibrary() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()
  const allPrompts = usePrompts(t)

  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return allPrompts
    const q = search.toLowerCase()
    return allPrompts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.preview.toLowerCase().includes(q)
    )
  }, [allPrompts, search])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="BookMarked"
          title={t('Prompt Library')}
          subtitle={t('AI Platform')}
        />

        <div className="flex gap-2">
          <Input
            inputSize="sm"
            placeholder={t('Search prompts...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" disabled={!isLive}
            onClick={() => toast.show({ title: t('Connect the API') })}>
            <Icon name="Plus" size={14} />
            {t('Add Prompt')}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <MobileCard key={p.id}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <Badge background={p.catBg} color={p.catFg}>{p.category}</Badge>
                    {p.favorited && <Icon name="Star" size={12} className="text-salis-orange" />}
                  </div>
                }
              />
              <h3 className="text-[13px] font-semibold text-heading">{p.name}</h3>
              <p className="line-clamp-2 text-xs text-muted">{p.preview}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <Icon name="Zap" size={10} />
                {p.uses} {t('uses')}
              </span>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader icon="BookMarked" title={t('Prompt Library')} subtitle={t('AI Platform')} />
        <div className="flex gap-2.5">
          <Search value={search} onChange={setSearch} placeholder={t('Search prompts...')} className="w-full sm:w-[220px]" compact />
          <Button size="sm" disabled={!isLive}
            onClick={() => toast.show({ title: t('Connect the API') })}>
            <Icon name="Plus" size={16} />
            {t('Add Prompt')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="flex cursor-pointer flex-col gap-2.5 rounded-[14px] p-[18px] shadow-sm transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Badge background={p.catBg} color={p.catFg}>{p.category}</Badge>
              <span className="flex-1" />
              <span className={p.favorited ? 'text-salis-orange' : 'text-muted'}>
                <Icon name="Star" size={14} />
              </span>
            </div>
            <h2 className="text-sm font-semibold text-heading">{p.name}</h2>
            <p className="line-clamp-2 text-xs text-muted">{p.preview}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Icon name="Zap" size={10} />
              {p.uses} {t('uses')}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
