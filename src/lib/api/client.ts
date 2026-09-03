import axios, { AxiosError } from 'axios'

/**
 * Axios 인스턴스 — HTTP 호출 담당.
 * 서버 상태 캐시/무효화는 TanStack Query가, 전역 UI 상태는 Zustand가 맡는다.
 *
 * 인증: 액세스 토큰은 메모리(+선택적 localStorage)에 두고 Authorization 헤더로 전송.
 * 실제 백엔드 연동 시 httpOnly 쿠키 방식으로 전환 가능하도록 인터셉터를 분리해 둔다.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'voyage.accessToken'

let accessToken: string | null =
  typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (typeof localStorage === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

/** 서버 표준 에러 형태 */
export interface ApiErrorBody {
  message: string
  code?: string
  fields?: Record<string, string>
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorBody> {
  return axios.isAxiosError(error)
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // 401 → 로그인 만료. 라우터 가드에서 처리하도록 토큰만 정리한다.
    if (error.response?.status === 401) {
      setAccessToken(null)
    }
    return Promise.reject(error)
  },
)
