import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 min-h-[26px] px-2.5 rounded-full text-xs font-semibold',
  {
    variants: {
      variant: {
        // 상태는 색만으로 구분하지 않고 문구/아이콘을 함께 쓴다.
        confirmed: 'bg-selected text-accent-active',
        considering: 'bg-[oklch(0.95_0.045_74)] text-[oklch(0.46_0.11_65)]',
        closed: 'bg-subtle text-secondary',
        offline: 'bg-[oklch(0.95_0.035_258)] text-info',
        danger: 'bg-[oklch(0.95_0.04_28)] text-danger',
        success: 'bg-selected text-accent-active',
        neutral: 'bg-subtle text-secondary',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
