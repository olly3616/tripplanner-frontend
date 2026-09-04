import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { PageFallback } from './PageFallback'
import { SkipLink } from './SkipLink'

/** 여행 목록 등 여행 컨텍스트가 없는 상위 페이지용 셸(상단바만). */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-bg">
      <SkipLink />
      <Topbar />
      <main id="main-content" tabIndex={-1} className="px-5 pb-16 pt-6 focus:outline-none md:px-10">
        <div className="mx-auto w-full max-w-content">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
