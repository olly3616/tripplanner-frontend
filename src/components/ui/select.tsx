import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

/** 네이티브 select 를 디자인 토큰에 맞춰 감싼 컴포넌트. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-md border border-border bg-surface pl-3 pr-9 text-fg',
            'hover:border-border-strong focus-visible:outline-none disabled:opacity-45',
            invalid && 'border-danger',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    )
  },
)
Select.displayName = 'Select'
