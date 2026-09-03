import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

/**
 * 보호 라우트 가드.
 * 부트스트랩(useMe) 완료 전에는 아무것도 렌더하지 않고,
 * 토큰/유저가 없으면 로그인으로 보낸다(원래 목적지 기억).
 */
export function RequireAuth() {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!initialized) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
