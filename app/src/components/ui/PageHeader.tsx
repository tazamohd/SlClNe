import { Icon } from '@/components/ui/Icon'

export function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
        <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name={icon} size={28} />
        </div>
      </div>
      <div>
        <h1 className="font-display text-[30px] font-black text-heading">{title}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
