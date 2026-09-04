import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: (reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 전역 에러 바운더리 — 렌더 중 발생한 예외를 잡아
 * 앱 전체가 흰 화면이 되지 않도록 복구 UI를 보여준다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 실제 서비스에서는 에러 추적 서비스(Sentry 등)로 전송한다.
    console.error('ErrorBoundary caught:', error, info)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback(this.reset)

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <div className="grid gap-1">
          <p className="text-lg font-bold">문제가 발생했어요</p>
          <p className="max-w-sm text-sm text-muted">
            예상치 못한 오류로 화면을 표시하지 못했습니다. 다시 시도하거나 페이지를 새로고침해 주세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Button onClick={this.reset}>다시 시도</Button>
        </div>
      </div>
    )
  }
}
