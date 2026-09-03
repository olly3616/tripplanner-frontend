import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // 자주 바뀌지 않는 핵심 벤더를 별도 청크로 분리해 캐싱을 개선한다.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return 'react-vendor'
          if (id.includes('@tanstack')) return 'query-vendor'
          if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('sonner'))
            return 'ui-vendor'
          // 그 외(date-fns 등)는 Rollup 기본 분할에 맡긴다.
        },
      },
    },
  },
})
