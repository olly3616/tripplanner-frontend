import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/** VITE_USE_MOCKS 가 true 일 때만 목 워커를 시작한다. */
export async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return
  await worker.start({
    onUnhandledRequest: 'bypass', // 지도 타일 등 외부 요청은 통과
  })
}
