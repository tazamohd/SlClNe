import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full resize-y rounded border bg-inset px-3.5 py-2.5 font-action text-sm text-heading outline-none',
          'transition-all duration-200 ease-salis',
          'focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          invalid ? 'border-salis-orange' : 'border-border',
          className,
        )}
        {...props}
      />
    )
  },
)
