import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/routes/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { TripLayout } from '@/components/layout/TripLayout'
import { LoginRoute } from '@/routes/LoginRoute'

// 라우트 단위 코드 스플리팅: 각 화면을 필요할 때 지연 로딩한다.
// (레이아웃/가드는 즉시 로딩하고, 페이지 청크만 분리)
const TripsListPage = lazy(() =>
  import('@/pages/TripsListPage').then((m) => ({ default: m.TripsListPage })),
)
const TripHomePage = lazy(() =>
  import('@/pages/trip/TripHomePage').then((m) => ({ default: m.TripHomePage })),
)
const ItineraryPage = lazy(() =>
  import('@/pages/trip/ItineraryPage').then((m) => ({ default: m.ItineraryPage })),
)
const PlacesPage = lazy(() =>
  import('@/pages/trip/PlacesPage').then((m) => ({ default: m.PlacesPage })),
)
const PollsPage = lazy(() =>
  import('@/pages/trip/PollsPage').then((m) => ({ default: m.PollsPage })),
)
const ExpensesPage = lazy(() =>
  import('@/pages/trip/ExpensesPage').then((m) => ({ default: m.ExpensesPage })),
)
const ActivityPage = lazy(() =>
  import('@/pages/trip/ActivityPage').then((m) => ({ default: m.ActivityPage })),
)
const MembersPage = lazy(() =>
  import('@/pages/trip/MembersPage').then((m) => ({ default: m.MembersPage })),
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/trips" replace />} />
          <Route path="/trips" element={<TripsListPage />} />
        </Route>

        <Route path="/trips/:tripId" element={<TripLayout />}>
          <Route index element={<TripHomePage />} />
          <Route path="itinerary" element={<ItineraryPage />} />
          <Route path="places" element={<PlacesPage />} />
          <Route path="polls" element={<PollsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  )
}
