import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md'
}

export function Select({ className, size = 'sm', children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        'cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none',
        'focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
        size === 'sm' ? 'h-9' : 'h-10',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
