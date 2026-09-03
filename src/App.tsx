import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/routes/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { TripLayout } from '@/components/layout/TripLayout'
import { LoginRoute } from '@/routes/LoginRoute'
import { TripsListPage } from '@/pages/TripsListPage'
import { TripHomePage } from '@/pages/trip/TripHomePage'
import { ComingSoon } from '@/pages/trip/ComingSoon'

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
          <Route path="itinerary" element={<ComingSoon title="일정" phase="2. 일정" />} />
          <Route path="places" element={<ComingSoon title="장소" phase="3. 장소" />} />
          <Route path="polls" element={<ComingSoon title="투표" phase="5. 협업" />} />
          <Route path="expenses" element={<ComingSoon title="경비·정산" phase="4. 경비" />} />
          <Route path="activity" element={<ComingSoon title="활동" phase="5. 협업" />} />
          <Route path="members" element={<ComingSoon title="멤버·설정" phase="1. 여행·멤버" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  )
}
