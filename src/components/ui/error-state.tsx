import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

/** 오류 상태: 원인 설명 + 재시도 버튼(디자인 규칙). */
export function ErrorState({
  title = '문제가 발생했어요',
  description = '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="size-8 text-danger" />
      <div className="grid gap-1">
        <p className="text-base font-semibold text-fg">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-1">
          <RotateCw className="size-4" />
          다시 시도
        </Button>
      )}
    </div>
  )
}
