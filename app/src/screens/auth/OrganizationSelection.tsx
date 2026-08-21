import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'
import { useIsMobile } from '@/lib/useMediaQuery'

interface Organization {
  id: string
  name: string
  members: number
}

const ORGANIZATIONS: Organization[] = [
  { id: 'o1', name: 'SALIS AUTO Holding', members: 24 },
  { id: 'o2', name: 'Al-Amri Auto Group', members: 11 },
  { id: 'o3', name: 'Najd Motors Est.', members: 6 },
]

/** Select or create an organization. */
export function OrganizationSelection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [picked, setPicked] = useState('o1')
  const [query, setQuery] = useState('')

  const filtered = ORGANIZATIONS.filter(
    (o) => !query.trim() || o.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[440px]'}>
      <div className={`flex flex-col ${isMobile ? 'gap-3.5' : 'gap-5'}`}>
        {/* Header */}
        <div className="text-center">
          <BrandMark width={isMobile ? 80 : 100} />
          <h1 className={`mt-3 font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {t('Organization Selection')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t('Select your organization')}
          </p>
        </div>

        {/* Search */}
        <Input
          placeholder={t('Search organizations...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Icon name="Search" size={15} />}
          inputSize="sm"
          aria-label={t('Search organizations...')}
        />

        {/* Organization list */}
        <div className="flex flex-col gap-2">
          {filtered.map((org) => {
            const selected = picked === org.id
            return (
              <button
                key={org.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPicked(org.id)}
                className={cn(
                  'flex h-[60px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3.5',
                  'font-action text-sm font-medium transition-all duration-200 ease-salis',
                  selected
                    ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.06)] text-salis-blue'
                    : 'border border-border bg-card text-body hover:border-[rgba(10,94,215,.3)]'
                )}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-[13px] font-bold text-white">
                  <Icon name="Building2" size={16} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-start">
                  <span>{org.name}</span>
                  <span className="text-[11px] font-normal text-muted">
                    {org.members} {t('members')}
                  </span>
                </span>
                {selected ? <Icon name="Check" size={16} /> : null}
              </button>
            )
          })}

          {/* Create new */}
          <button
            type="button"
            aria-label={t('Create New Organization')}
            className="flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] border-dashed border-border-strong bg-transparent px-3.5 font-action text-[13px] font-medium text-muted transition-all duration-150 hover:border-salis-blue hover:text-salis-blue"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-inset">
              <Icon name="Plus" size={16} />
            </span>
            <span>{t('Create New Organization')}</span>
          </button>
        </div>

        {/* Continue */}
        <Button size="lg" className="w-full" disabled={!isLive}>
          {t('Continue')}
        </Button>
      </div>
    </AuthLayout>
  )
}
