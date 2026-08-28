import { useId, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { MobileCard, MobilePageHeader } from '@/components/shell/MobileShell'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'

interface ModelOption {
  id: string
  name: string
  desc: string
}

const MODELS: ModelOption[] = [
  { id: 'sonnet', name: 'Claude Sonnet 4.5', desc: 'Balanced speed and depth — default for most agents' },
  { id: 'haiku', name: 'Claude Haiku 4', desc: 'Fastest, lowest cost — for high-volume routine tasks' },
  { id: 'opus', name: 'Claude Opus 4', desc: 'Deepest reasoning — for complex analysis and reports' },
]

interface BehaviorToggle {
  key: string
  label: string
  hint: string
}

const BEHAVIOR_TOGGLES: BehaviorToggle[] = [
  { key: 'arabic', label: 'Arabic Responses', hint: 'Reply in Arabic when the user writes in Arabic' },
  { key: 'cite', label: 'Cite Data Sources', hint: 'Reference the records behind every answer' },
  { key: 'autoExec', label: 'Auto-Execute Actions', hint: 'Let agents act without confirmation' },
  { key: 'log', label: 'Log Conversations', hint: 'Retain chat history for auditing' },
]



export function ModelSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const toast = useToast()

  const baseId = useId()
  const tempId = `${baseId}-temperature`
  const tokensId = `${baseId}-max-tokens`
  const promptId = `${baseId}-system-prompt`

  const [selectedModel, setSelectedModel] = useState('sonnet')
  const [temperature, setTemperature] = useState(30)
  const [maxTokens, setMaxTokens] = useState(8)
  const [flags, setFlags] = useState<Record<string, boolean>>({
    arabic: true,
    cite: true,
    autoExec: false,
    log: true,
  })
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the SALIS AUTO workshop assistant. Answer using live job card, inventory, and invoicing data. Always show SAR amounts with VAT noted separately. Be concise and operational.'
  )

  const toggleFlag = (key: string) =>
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))

  const tempDisplay = (temperature / 100).toFixed(2)
  const tokensDisplay = (maxTokens * 1024).toLocaleString()

  const modelCards = MODELS.map((m) => {
    const selected = selectedModel === m.id
    return (
      <button
        key={m.id}
        type="button"
        onClick={() => setSelectedModel(m.id)}
        className={
          'flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3 text-start transition-all ' +
          (selected
            ? 'border-salis-blue bg-[rgba(10,94,215,.05)]'
            : 'border-border bg-inset')
        }
      >
        <span
          className="flex rounded-lg p-1.5"
          style={{
            background: selected ? 'rgba(10,94,215,.12)' : 'var(--tint-neutral)',
            color: selected ? 'var(--salis-blue)' : 'var(--text-muted)',
          }}
        >
          <Icon name="Cpu" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading">{m.name}</p>
          <p className="mt-0.5 text-[11px] text-muted">{t(m.desc)}</p>
        </div>
        {selected && (
          <Icon name="CheckCircle" size={18} className="flex-shrink-0 text-salis-blue" />
        )}
      </button>
    )
  })

  const behaviorSection = BEHAVIOR_TOGGLES.map((tg) => (
    <div key={tg.key} className="flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-heading">{t(tg.label)}</p>
        <p className="mt-0.5 text-[11px] text-muted">{t(tg.hint)}</p>
      </div>
      <Toggle
        on={flags[tg.key] ?? false}
        onToggle={() => toggleFlag(tg.key)}
        label={t(tg.label)}
      />
    </div>
  ))

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="SlidersHorizontal"
          title={t('Model Settings')}
          subtitle={t('AI Platform')}
        />

        <MobileCard>
          <h3 className="mb-3 text-[15px] font-bold text-heading">{t('AI Model')}</h3>
          <div className="flex flex-col gap-2.5">
            {modelCards}
          </div>
        </MobileCard>

        <MobileCard>
          <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Parameters')}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex justify-between">
                <label htmlFor={tempId} className="font-action text-xs font-medium text-primary">{t('Temperature')}</label>
                <span className="font-mono text-xs font-semibold text-salis-blue">{tempDisplay}</span>
              </div>
              <input
                id={tempId}
                type="range"
                min={0}
                max={100}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                aria-label={t('Temperature')}
                className="w-full accent-salis-blue"
              />
              <p className="mt-1 text-[11px] text-muted">{t('Lower is more precise, higher is more creative')}</p>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <label htmlFor={tokensId} className="font-action text-xs font-medium text-primary">{t('Max Tokens')}</label>
                <span className="font-mono text-xs font-semibold text-salis-blue">{tokensDisplay}</span>
              </div>
              <input
                id={tokensId}
                type="range"
                min={1}
                max={32}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                aria-label={t('Max Tokens')}
                className="w-full accent-salis-blue"
              />
              <p className="mt-1 text-[11px] text-muted">{t('Maximum response length per request')}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={promptId} className="font-action text-xs font-medium text-primary">{t('System Prompt')}</label>
              <Textarea
                id={promptId}
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                disabled={!isLive}
                aria-label={t('System Prompt')}
                className="text-[13px] leading-relaxed"
              />
            </div>
          </div>
        </MobileCard>

        <MobileCard>
          <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Behavior')}</h3>
          <div className="flex flex-col gap-3.5">
            {behaviorSection}
          </div>
        </MobileCard>

        <MobileCard>
          <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Usage')}</h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">{t('Tokens Used')}</span>
                <span className="font-mono text-body">2.4M / 5M</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                <div className="h-full w-[48%] rounded-full bg-salis-gradient" />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">{t('Estimated Cost')}</span>
              <span dir="ltr" className="font-mono font-semibold text-heading">SAR 1,840</span>
            </div>
          </div>
        </MobileCard>

        <Button
          className="w-full"
          onClick={() => toast.show({ title: t('Settings saved') })}
          disabled={!isLive}
        >
          {t('Save Changes')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="SlidersHorizontal" title={t('Model Settings')} subtitle={t('AI Platform')} />

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <div className="flex flex-col gap-5">
          <Card className="rounded-2xl p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-heading">{t('AI Model')}</h3>
            <div className="flex flex-col gap-2.5">
              {modelCards}
            </div>
          </Card>

          <Card className="rounded-2xl p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-heading">{t('Parameters')}</h3>
            <div className="flex flex-col gap-[18px]">
              <div>
                <div className="mb-1.5 flex justify-between">
                  <label htmlFor={tempId} className="font-action text-xs font-medium text-primary">{t('Temperature')}</label>
                  <span className="font-mono text-xs font-semibold text-salis-blue">{tempDisplay}</span>
                </div>
                <input
                  id={tempId}
                  type="range"
                  min={0}
                  max={100}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  aria-label={t('Temperature')}
                  className="w-full accent-salis-blue"
                />
                <p className="mt-1 text-[11px] text-muted">{t('Lower is more precise, higher is more creative')}</p>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between">
                  <label htmlFor={tokensId} className="font-action text-xs font-medium text-primary">{t('Max Tokens')}</label>
                  <span className="font-mono text-xs font-semibold text-salis-blue">{tokensDisplay}</span>
                </div>
                <input
                  id={tokensId}
                  type="range"
                  min={1}
                  max={32}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  aria-label={t('Max Tokens')}
                  className="w-full accent-salis-blue"
                />
                <p className="mt-1 text-[11px] text-muted">{t('Maximum response length per request')}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={promptId} className="font-action text-xs font-medium text-primary">{t('System Prompt')}</label>
                <Textarea
                  id={promptId}
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  disabled={!isLive}
                  aria-label={t('System Prompt')}
                  className="text-[13px] leading-relaxed"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="rounded-2xl p-5 shadow-sm">
            <h3 className="mb-3.5 text-[15px] font-bold text-heading">{t('Behavior')}</h3>
            <div className="flex flex-col gap-3.5">
              {behaviorSection}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Usage')}</h3>
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted">{t('Tokens Used')}</span>
                  <span className="font-mono text-body">2.4M / 5M</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div className="h-full w-[48%] rounded-full bg-salis-gradient" />
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">{t('Estimated Cost')}</span>
                <span dir="ltr" className="font-mono font-semibold text-heading">SAR 1,840</span>
              </div>
            </div>
          </Card>

          <Button
            className="h-11 w-full shadow-[0_4px_12px_rgba(10,94,215,.25)]"
            onClick={() => toast.show({ title: t('Settings saved') })}
            disabled={!isLive}
          >
            {t('Save Changes')}
          </Button>
        </div>
      </div>
    </div>
  )
}
