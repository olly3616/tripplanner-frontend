import { Suspense } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'
import { MobileTabs } from './MobileTabs'
import { MobileMoreDrawer } from './MobileMoreDrawer'
import { PageFallback } from './PageFallback'
import { SkipLink } from './SkipLink'
import { useTrip, useTrips } from '@/features/trips/api'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'

/** 여행 상세 셸: 상단바 + (데스크톱)사이드바 / (모바일)하단 탭 + 콘텐츠. */
export function TripLayout() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { data: trip, isLoading, isError, refetch } = useTrip(tripId)
  const { data: trips } = useTrips()

  return (
    <div className="min-h-dvh bg-bg">
      <SkipLink />
      <Topbar
        trip={trip}
        trips={trips}
        onSwitchTrip={(id) => navigate(`/trips/${id}`)}
      />
      <div className="flex">
        {tripId && <Sidebar tripId={tripId} />}
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 px-5 pb-24 pt-6 focus:outline-none md:px-10 md:pb-10"
        >
          <div className="mx-auto w-full max-w-content">
            {isError ? (
              <ErrorState
                title="여행을 불러오지 못했어요"
                description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <div className="grid gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            )}
          </div>
        </main>
      </div>
      {tripId && <MobileTabs tripId={tripId} />}
      {tripId && <MobileMoreDrawer tripId={tripId} />}
    </div>
  )
}
