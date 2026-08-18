import { useState } from 'react'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Prompt Library: curated AI prompts by category, favourited with a star.
 *
 *  The design is a static demo grid (no backing collection in the
 *  repository), so the cards live as local consts here — same pattern as the
 *  other design-only screens in this codebase. */

interface Prompt {
  name: string
  category: string
  bg: string
  fg: string
  preview: string
  uses: string
  favorited: boolean
}

const PROMPTS: readonly Prompt[] = [
  {
    name: 'Monthly Revenue Summary',
    category: 'Finance',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
    preview:
      'Generate a comprehensive revenue breakdown by service type, branch, and customer segment for the current month.',
    uses: '124 uses',
    favorited: true,
  },
  {
    name: 'Inventory Reorder Check',
    category: 'Inventory',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
    preview: 'List all parts below reorder level with supplier info and estimated delivery times.',
    uses: '89 uses',
    favorited: true,
  },
  {
    name: 'Customer Follow-up Draft',
    category: 'CRM',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
    preview: "Draft a follow-up email for customers who haven't visited in 60+ days.",
    uses: '67 uses',
    favorited: false,
  },
  {
    name: 'Technician Schedule Optimizer',
    category: 'Operations',
    bg: 'rgba(11,31,59,.1)',
    fg: '#0B1F3B',
    preview: 'Analyze current job assignments and suggest optimal technician allocation.',
    uses: '52 uses',
    favorited: false,
  },
  {
    name: 'Tax Filing Checklist',
    category: 'Accounting',
    bg: 'rgba(100,116,139,.1)',
    fg: '#64748B',
    preview: 'Generate a ZATCA VAT filing checklist with all required documents and calculations.',
    uses: '41 uses',
    favorited: true,
  },
  {
    name: 'Job Card Summary',
    category: 'Workshop',
    bg: 'rgba(10,94,215,.1)',
    fg: '#0A5ED7',
    preview: 'Summarize all active job cards with status, assigned technician, and ETA.',
    uses: '156 uses',
    favorited: true,
  },
  {
    name: 'Performance Review',
    category: 'HR',
    bg: 'rgba(11,179,255,.1)',
    fg: '#0BB3FF',
    preview: 'Generate a performance review summary for a technician based on their metrics.',
    uses: '38 uses',
    favorited: false,
  },
  {
    name: 'Fleet Report',
    category: 'Fleet',
    bg: 'rgba(249,115,22,.1)',
    fg: '#F97316',
    preview: 'Create a detailed fleet maintenance report for a specific account.',
    uses: '45 uses',
    favorited: false,
  },
  {
    name: 'Appointment Optimizer',
    category: 'Scheduling',
    bg: 'rgba(11,31,59,.1)',
    fg: '#0B1F3B',
    preview: 'Analyze appointment patterns and suggest optimal time slots for next week.',
    uses: '33 uses',
    favorited: false,
  },
]

export function PromptLibrary() {
  const { t } = usePreferences()
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(PROMPTS.filter((p) => p.favorited).map((p) => p.name))
  )

  const filtered = PROMPTS.filter((p) => t(p.name).toLowerCase().includes(search.toLowerCase()))

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <>
      <ListPageHeader
        title={t('Prompt Library')}
        subtitle={t('AI Platform')}
        search={{ value: search, onChange: setSearch, placeholder: t('Search prompts...') }}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Add Prompt')}
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t('No prompts found')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((prompt) => {
            const favorited = favorites.has(prompt.name)
            return (
              <Card
                key={prompt.name}
                className="flex cursor-pointer flex-col gap-2.5 p-[18px] transition-all duration-200 hover:border-salis-blue hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Badge background={prompt.bg} color={prompt.fg}>
                    {t(prompt.category)}
                  </Badge>
                  <span className="flex-1" />
                  <button
                    type="button"
                    aria-label={t('Favorite')}
                    aria-pressed={favorited}
                    onClick={() => toggleFavorite(prompt.name)}
                    className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent hover:bg-[rgba(10,94,215,.08)]"
                  >
                    <Icon
                      name="Star"
                      size={14}
                      className={favorited ? 'text-salis-orange' : 'text-faint'}
                    />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-heading">{t(prompt.name)}</h3>
                <p className="line-clamp-2 text-xs text-muted">{t(prompt.preview)}</p>
                <span className="flex items-center gap-1 text-[11px] text-faint">
                  <Icon name="Zap" size={10} />
                  <span dir="ltr">{prompt.uses}</span>
                </span>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
