import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { SessionBootstrap } from '@/app/SessionBootstrap'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { queryClient } from '@/lib/api/queryClient'
import './index.css'

async function bootstrap() {
  // 목 모드일 때만 MSW 계층을 동적 로딩한다(별도 청크, 실서버 연동 시 번들에서 제외).
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { enableMocking } = await import('@/mocks/browser')
    await enableMocking()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SessionBootstrap>
              <App />
            </SessionBootstrap>
          </BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

void bootstrap()
