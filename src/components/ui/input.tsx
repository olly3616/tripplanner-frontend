import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-11 w-full rounded-md border border-border bg-surface px-3 text-fg',
          'placeholder:text-muted hover:border-border-strong',
          'focus-visible:outline-none disabled:opacity-45',
          invalid && 'border-danger',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
