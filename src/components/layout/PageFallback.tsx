import { Skeleton } from '@/components/ui/skeleton'

/** 라우트 청크 로딩 중 레이아웃을 유지한 스켈레톤 폴백. */
export function PageFallback() {
  return (
    <div className="grid gap-4" role="status" aria-label="불러오는 중">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <span className="sr-only">불러오는 중…</span>
    </div>
  )
}
