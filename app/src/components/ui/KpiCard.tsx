import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

export interface Kpi {
  label: string
  value: string
  icon: string
  bg: string
  fg: string
  mono?: boolean
}

export function KpiCard({ label, value, icon, bg, fg, mono }: Kpi) {
  return (
    <Card className="rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg p-1.5" style={{ background: bg, color: fg }} aria-hidden>
          <Icon name={icon} size={16} />
        </span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <h4 dir={mono ? 'ltr' : undefined} className={`mt-2 font-black text-heading ${mono ? 'font-mono text-xl' : 'font-display text-2xl'}`}>{value}</h4>
    </Card>
  )
}
