import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  /** Marks the field invalid and colours the border, like `Input`. */
  invalid?: boolean
}

export function Select({ className, size = 'sm', invalid, children, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        'cursor-pointer rounded border bg-card px-3 text-[13px] text-heading outline-none',
        'transition-all duration-200 ease-salis',
        'focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid ? 'border-salis-orange' : 'border-border',
        size === 'sm' ? 'h-9' : size === 'md' ? 'h-10' : 'h-12 text-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
