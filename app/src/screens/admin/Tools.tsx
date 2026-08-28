import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface SystemTool {
  name: string
  description: string
  icon: string
  category: 'Database' | 'Communication' | 'Diagnostics' | 'Utilities'
  status: 'Available' | 'Running' | 'Disabled'
  lastUsed: string
}

const TOOLS: SystemTool[] = [
  { name: 'Database Optimizer', description: 'Analyze and optimize database queries and indexes', icon: 'Database', category: 'Database', status: 'Available', lastUsed: 'Aug 15, 2026' },
  { name: 'Cache Manager', description: 'Clear and manage application cache layers', icon: 'Layers', category: 'Database', status: 'Available', lastUsed: 'Aug 18, 2026' },
  { name: 'Email Test Tool', description: 'Send test emails and verify SMTP configuration', icon: 'Mail', category: 'Communication', status: 'Available', lastUsed: 'Aug 12, 2026' },
  { name: 'SMS Diagnostics', description: 'Verify SMS gateway connectivity and delivery', icon: 'MessageSquare', category: 'Communication', status: 'Running', lastUsed: 'Aug 18, 2026' },
  { name: 'System Health Check', description: 'Run comprehensive system diagnostics', icon: 'Activity', category: 'Diagnostics', status: 'Available', lastUsed: 'Aug 17, 2026' },
  { name: 'Error Log Viewer', description: 'Browse and filter application error logs', icon: 'FileText', category: 'Diagnostics', status: 'Available', lastUsed: 'Aug 18, 2026' },
  { name: 'Bulk Data Processor', description: 'Process large data sets with batch operations', icon: 'Cpu', category: 'Utilities', status: 'Disabled', lastUsed: 'Aug 10, 2026' },
  { name: 'Report Generator', description: 'Generate and export custom reports', icon: 'FileSpreadsheet', category: 'Utilities', status: 'Available', lastUsed: 'Aug 16, 2026' },
  { name: 'API Tester', description: 'Test API endpoints and inspect responses', icon: 'Code', category: 'Diagnostics', status: 'Available', lastUsed: 'Aug 14, 2026' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Available: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Running: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Disabled: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

const CATEGORIES = ['Database', 'Communication', 'Diagnostics', 'Utilities'] as const

export function Tools() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Wrench" title={t('System Tools')} subtitle={t('Maintenance utilities')} />
        {TOOLS.map((tool, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={tool.icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(tool.name)}</p>
                    <p className="text-xs text-muted">{t(tool.description)}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[tool.status].bg} color={STATUS_STYLES[tool.status].fg}>{t(tool.status)}</Badge>}
            />
            <MobileCardRow label={t('Category')} value={t(tool.category)} />
            <MobileCardRow label={t('Last Used')} value={tool.lastUsed} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Wrench" title={t('System Tools')} subtitle={t('Administration and maintenance utilities')} />

      {CATEGORIES.map((category) => {
        const categoryTools = TOOLS.filter((tool) => tool.category === category)
        return (
          <div key={category}>
            <p className="mb-3 text-sm font-bold text-heading">{t(category)}</p>
            <div className="grid grid-cols-2 gap-4">
              {categoryTools.map((tool, i) => (
                <Card key={i} className="rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex flex-shrink-0 rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
                      <Icon name={tool.icon} size={20} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-heading">{t(tool.name)}</p>
                        <Badge background={STATUS_STYLES[tool.status].bg} color={STATUS_STYLES[tool.status].fg}>{t(tool.status)}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">{t(tool.description)}</p>
                      <p className="mt-2 text-[11px] text-muted">{t('Last used')}: {tool.lastUsed}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
