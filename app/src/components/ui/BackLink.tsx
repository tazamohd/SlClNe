import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

export function BackLink({ to, label }: { to: string; label: string }) {
  const { t, rtl } = usePreferences()
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
    >
      <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
      {t(label)}
    </Link>
  )
}
