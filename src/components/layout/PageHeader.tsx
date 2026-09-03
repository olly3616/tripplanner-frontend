import * as React from 'react'

interface PageHeaderProps {
  title: string
  eyebrow?: string
  description?: string
  action?: React.ReactNode
}

/** 페이지 제목 + 주요 행동 (화면설계서 공통 헤더). */
export function PageHeader({ title, eyebrow, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-accent-active">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.045em] md:text-[32px]">
          {title}
        </h1>
        {description && <p className="mt-2 text-sm text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
