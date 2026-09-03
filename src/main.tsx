import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { SessionBootstrap } from '@/app/SessionBootstrap'
import { queryClient } from '@/lib/api/queryClient'
import { enableMocking } from '@/mocks/browser'
import './index.css'

async function bootstrap() {
  await enableMocking()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionBootstrap>
            <App />
          </SessionBootstrap>
        </BrowserRouter>
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
