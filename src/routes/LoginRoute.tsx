import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { LoginPage } from '@/pages/LoginPage'

/** 이미 로그인한 사용자는 여행 목록으로 보낸다. */
export function LoginRoute() {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)

  if (!initialized) return null
  if (user) return <Navigate to="/trips" replace />
  return <LoginPage />
}
