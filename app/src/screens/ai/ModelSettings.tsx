import { useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Model Settings: AI model selection, generation parameters, behavior
 *  toggles and usage. Every control here is visual-state only — the design
 *  has no persistence, just local `useState` mirroring the prototype. */

const MODELS = [
  { id: 'sonnet', name: 'Claude Sonnet 4.5', desc: 'Balanced speed and depth — default for most agents' },
  { id: 'haiku', name: 'Claude Haiku 4', desc: 'Fastest, lowest cost — for high-volume routine tasks' },
  { id: 'opus', name: 'Claude Opus 4', desc: 'Deepest reasoning — for complex analysis and reports' },
] as const

const TOGGLES = [
  { label: 'Arabic Responses', hint: 'Reply in Arabic when the user writes in Arabic' },
  { label: 'Cite Data Sources', hint: 'Reference the records behind every answer' },
  { label: 'Auto-Execute Actions', hint: 'Let agents act without confirmation' },
  { label: 'Log Conversations', hint: 'Retain chat history for auditing' },
] as const

const DEFAULT_FLAGS: Record<number, boolean> = { 0: true, 1: true, 2: false, 3: true }

const SYSTEM_PROMPT_DEFAULT =
  'You are the SALIS AUTO workshop assistant. Answer using live job card, inventory, and invoicing data. Always show SAR amounts with VAT noted separately. Be concise and operational.'

export function ModelSettings() {
  const { t } = usePreferences()
  const [model, setModel] = useState<(typeof MODELS)[number]['id']>('sonnet')
  const [temp, setTemp] = useState(30)
  const [tokens, setTokens] = useState(8)
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT_DEFAULT)
  const [flags, setFlags] = useState(DEFAULT_FLAGS)

  return (
    <>
      <FeatureHeader icon="SlidersHorizontal" title={t('Model Settings')} subtitle={t('AI Platform')} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px] xl:items-start">
        <div className="flex flex-col gap-5">
          <Section title={t('AI Model')}>
            <div className="flex flex-col gap-2.5">
              {MODELS.map((m) => {
                const selected = model === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-start transition-all duration-150',
                      selected
                        ? 'border-salis-blue bg-[rgba(10,94,215,.05)]'
                        : 'border-border bg-inset hover:border-border-strong'
                    )}
                  >
                    <span
                      className={cn(
                        'flex flex-shrink-0 rounded-lg p-1.5',
                        selected ? 'bg-[rgba(10,94,215,.12)] text-salis-blue' : 'bg-[rgba(100,116,139,.1)] text-muted'
                      )}
                    >
                      <Icon name="Cpu" size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-heading" dir="ltr">
                        {m.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">{t(m.desc)}</span>
                    </span>
                    {selected ? (
                      <Icon name="CheckCircle" size={18} className="flex-shrink-0 text-salis-blue" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title={t('Parameters')}>
            <div className="flex flex-col gap-[18px]">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="font-action text-xs font-medium text-body">{t('Temperature')}</label>
                  <span className="font-mono text-xs font-semibold text-salis-blue">{(temp / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  aria-label={t('Temperature')}
                  className="w-full accent-salis-blue"
                />
                <p className="mt-1 text-[11px] text-muted">{t('Lower is more precise, higher is more creative')}</p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="font-action text-xs font-medium text-body">{t('Max Tokens')}</label>
                  <span className="font-mono text-xs font-semibold text-salis-blue" dir="ltr">
                    {(tokens * 1024).toLocaleString('en-US')}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={tokens}
                  onChange={(e) => setTokens(Number(e.target.value))}
                  aria-label={t('Max Tokens')}
                  className="w-full accent-salis-blue"
                />
                <p className="mt-1 text-[11px] text-muted">{t('Maximum response length per request')}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="model-settings-system-prompt" className="font-action text-xs font-medium text-body">
                  {t('System Prompt')}
                </label>
                <textarea
                  id="model-settings-system-prompt"
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="resize-y rounded-lg border border-border bg-inset px-3 py-2.5 text-[13px] leading-relaxed text-body outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <Section title={t('Behavior')}>
            <div className="flex flex-col gap-3.5">
              {TOGGLES.map((toggle, i) => {
                const on = flags[i] !== false
                return (
                  <div key={toggle.label} className="flex items-center gap-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-heading">{t(toggle.label)}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{t(toggle.hint)}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={t(toggle.label)}
                      onClick={() => setFlags((s) => ({ ...s, [i]: !on }))}
                      className={cn(
                        'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200',
                        on ? 'bg-salis-blue' : 'bg-[#CBD5E1]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[inset-inline-start] duration-200',
                          on ? 'start-[22px]' : 'start-0.5'
                        )}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title={t('Usage')}>
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{t('Tokens Used')}</span>
                  <span className="font-mono text-body" dir="ltr">
                    2.4M / 5M
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div className="h-full w-[48%] rounded-full bg-salis-gradient-r" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{t('Estimated Cost')}</span>
                <span className="font-mono font-semibold text-heading" dir="ltr">
                  SAR 1,840
                </span>
              </div>
            </div>
          </Section>

          <Button size="lg" className="w-full">
            {t('Save Changes')}
          </Button>
        </div>
      </div>
    </>
  )
}
