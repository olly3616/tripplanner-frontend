/** 키보드 사용자가 반복되는 상단 내비게이션을 건너뛰어 본문으로 이동. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-md focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
    >
      본문으로 건너뛰기
    </a>
  )
}
