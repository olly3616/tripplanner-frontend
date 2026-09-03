import type * as React from 'react'
import { cn } from '@/lib/utils'

/** 로딩: 레이아웃을 유지한 스켈레톤(디자인 규칙). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-subtle', className)}
      {...props}
    />
  )
}
