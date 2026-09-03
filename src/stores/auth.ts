import { create } from 'zustand'
import type { User } from '@/types'
import { getAccessToken, setAccessToken } from '@/lib/api/client'

interface AuthState {
  user: User | null
  /** 초기 세션 확인(부트스트랩)이 끝났는지 */
  initialized: boolean
  hasToken: boolean
  setAuth: (user: User, token?: string) => void
  setUser: (user: User | null) => void
  setInitialized: (v: boolean) => void
  logout: () => void
}

/**
 * 인증 상태(전역 UI 관점).
 * 서버가 원본인 프로필은 TanStack Query(useMe)로 가져와 여기에 반영한다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  hasToken: Boolean(getAccessToken()),
  setAuth: (user, token) => {
    if (token) setAccessToken(token)
    set({ user, hasToken: Boolean(getAccessToken()) })
  },
  setUser: (user) => set({ user }),
  setInitialized: (v) => set({ initialized: v }),
  logout: () => {
    setAccessToken(null)
    set({ user: null, hasToken: false })
  },
}))
