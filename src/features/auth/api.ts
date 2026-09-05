import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  accessToken: string
}

/** 로그인 */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data } = await api.post<LoginResponse>('/auth/login', body)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
    },
  })
}

interface SignupResponse {
  user: User
  accessToken: string
  needsOnboarding: boolean
}

/** 이메일 가입 */
export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data } = await api.post<SignupResponse>('/auth/signup', body)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
    },
  })
}

export interface ProfileInput {
  name: string
  defaultCurrency: string
  timezone: string
}

/** 프로필 수정 (온보딩·설정) */
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: async (body: ProfileInput) => {
      const { data } = await api.patch<User>('/auth/me', body)
      return data
    },
    onSuccess: (user) => {
      setUser(user)
    },
  })
}

/** 현재 사용자 프로필 — 세션 부트스트랩 및 가드에 사용 */
export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me')
      return data
    },
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  })
}
