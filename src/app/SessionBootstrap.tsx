import { useEffect, type ReactNode } from 'react'
import { useMe } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth'

/**
 * 앱 시작 시 저장된 토큰으로 세션을 복원한다.
 * 토큰이 있으면 /auth/me 로 프로필을 가져와 스토어에 반영하고,
 * 어느 경우든 initialized 를 true 로 만들어 라우터 가드가 동작하게 한다.
 */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const hasToken = useAuthStore((s) => s.hasToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setInitialized = useAuthStore((s) => s.setInitialized)

  const { data, isError, isSuccess, isLoading } = useMe(hasToken)

  useEffect(() => {
    if (!hasToken) {
      setInitialized(true)
      return
    }
    if (isSuccess && data) {
      setUser(data)
      setInitialized(true)
    } else if (isError) {
      setUser(null)
      setInitialized(true)
    }
  }, [hasToken, isSuccess, isError, data, isLoading, setUser, setInitialized])

  return <>{children}</>
}
