import { useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface VoiceCommandConfig {
  id: string
  category: string
  commands: string[]
  enabled: boolean
  icon: string
  tone: readonly [string, string]
}

const COMMAND_GROUPS: VoiceCommandConfig[] = [
  {
    id: 'vc-1',
    category: 'Job Management',
    commands: ['Open job card', 'Create new job', 'Update job status', 'Assign technician'],
    enabled: true,
    icon: 'Wrench',
    tone: ['var(--tint-blue)', 'var(--salis-blue)'],
  },
  {
    id: 'vc-2',
    category: 'Search & Navigation',
    commands: ['Search customer', 'Find vehicle', 'Go to dashboard', 'Open inventory'],
    enabled: true,
    icon: 'Search',
    tone: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  },
  {
    id: 'vc-3',
    category: 'Reporting',
    commands: ['Generate daily report', 'Show revenue summary', 'Export invoice list'],
    enabled: true,
    icon: 'BarChart3',
    tone: ['var(--tint-navy)', 'var(--salis-navy)'],
  },
  {
    id: 'vc-4',
    category: 'Communication',
    commands: ['Call customer', 'Send SMS reminder', 'Notify manager'],
    enabled: false,
    icon: 'Phone',
    tone: ['var(--tint-neutral)', 'var(--text-muted)'],
  },
  {
    id: 'vc-5',
    category: 'Inventory',
    commands: ['Check stock level', 'Reorder parts', 'Scan barcode'],
    enabled: false,
    icon: 'Package',
    tone: ['var(--tint-orange)', 'var(--salis-orange)'],
  },
]

const LANGUAGES = [
  { code: 'en', label: 'English', active: true },
  { code: 'ar', label: 'Arabic', active: true },
  { code: 'ur', label: 'Urdu', active: false },
  { code: 'hi', label: 'Hindi', active: false },
] as const

export function VoiceCommands() {
  const { t } = usePreferences()
  const [groups, setGroups] = useState(COMMAND_GROUPS)
  const [sensitivity, setSensitivity] = useState(70)

  function toggleGroup(id: string) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)))
  }

  const enabledCount = groups.filter((g) => g.enabled).length
  const totalCommands = groups.reduce((s, g) => s + g.commands.length, 0)

  return (
    <>
      <FeatureHeader
        icon="Radio"
        title={t('Voice Commands')}
        subtitle={t('Voice interface settings')}
        actions={
          <Badge background="var(--tint-orange)" color="var(--salis-orange)">
            {t('External Dependency')}
          </Badge>
        }
      />

      <StatRow
        stats={[
          { label: 'Command Groups', value: groups.length, highlight: true, icon: 'Mic' },
          { label: 'Enabled Groups', value: enabledCount, tone: 'info', icon: 'CheckCircle' },
          { label: 'Total Commands', value: totalCommands, icon: 'List' },
          { label: 'Languages', value: LANGUAGES.filter((l) => l.active).length, icon: 'Globe' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Section title={t('Command Groups')}>
          <div className="flex flex-col gap-3">
            {groups.map((group) => {
              const [bg, fg] = group.tone
              return (
                <Card key={group.id} className="flex flex-col gap-3 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex flex-shrink-0 rounded-lg p-2"
                      style={{ background: bg, color: fg }}
                    >
                      <Icon name={group.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-heading">{t(group.category)}</h3>
                      <p className="text-xs text-muted">
                        {group.commands.length} {t('commands')}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={group.enabled}
                      aria-label={t(group.category)}
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200',
                        group.enabled ? 'bg-salis-blue' : 'bg-[var(--neutral-300)]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200',
                          group.enabled ? 'start-[22px]' : 'start-0.5'
                        )}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.commands.map((cmd) => (
                      <span
                        key={cmd}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[11px] font-medium',
                          group.enabled
                            ? 'bg-[rgba(10,94,215,.08)] text-salis-blue'
                            : 'bg-inset text-muted'
                        )}
                      >
                        &ldquo;{t(cmd)}&rdquo;
                      </span>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>

        <div className="flex flex-col gap-6">
          <Section title={t('Recognition Settings')}>
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-[13px]">
                  <span className="text-body">{t('Wake Word Sensitivity')}</span>
                  <span className="font-mono text-muted">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-inset accent-salis-blue"
                  aria-label={t('Wake Word Sensitivity')}
                />
                <div className="mt-1 flex justify-between text-[11px] text-muted">
                  <span>{t('Less sensitive')}</span>
                  <span>{t('More sensitive')}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-inset p-3">
                <p className="text-xs text-muted">
                  {t(
                    'Voice command engine requires an external speech recognition service. Configure your provider API key in System Integrations to enable voice input.'
                  )}
                </p>
              </div>
            </div>
          </Section>

          <Section title={t('Languages')}>
            <div className="flex flex-col gap-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Globe" size={14} className="text-muted" />
                    <span className="text-sm text-body">{t(lang.label)}</span>
                  </div>
                  <Badge
                    background={lang.active ? 'var(--tint-blue)' : 'var(--tint-neutral)'}
                    color={lang.active ? 'var(--salis-blue)' : 'var(--text-muted)'}
                  >
                    {lang.active ? t('Active') : t('Inactive')}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
