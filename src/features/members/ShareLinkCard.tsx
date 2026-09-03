import { useState } from 'react'
import { Copy, Globe, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Field } from '@/components/ui/field'

/**
 * 공개 공유 링크 설정 — 마크업 단계.
 * 링크 발급/폐기, 경비 요약 공개 토글, 비밀번호(선택)를 로컬 상태로 다룬다.
 * API 단계에서 서버 발급 토큰(해시 저장)·만료/폐기 상태로 대체한다.
 */
export function ShareLinkCard() {
  const [enabled, setEnabled] = useState(false)
  const [includeExpenses, setIncludeExpenses] = useState(false)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')

  const shareLink = 'https://voyage.app/s/demo-share-token'

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('공유 링크를 복사했어요.')
    } catch {
      toast.error('복사에 실패했어요.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-4 text-accent" />
          공개 공유 링크
        </CardTitle>
        <p className="text-xs text-muted">
          읽기 전용으로 일정·지도·예산 요약을 공유합니다. 수정 UI는 노출되지 않습니다.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!enabled ? (
          <Button variant="outline" className="justify-self-start" onClick={() => setEnabled(true)}>
            공유 링크 만들기
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="text-xs text-muted" />
              <Button variant="outline" size="icon" aria-label="링크 복사" onClick={copy}>
                <Copy className="size-4" />
              </Button>
            </div>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm">경비 요약 공개</span>
              <Switch
                checked={includeExpenses}
                onCheckedChange={setIncludeExpenses}
                aria-label="경비 요약 공개"
              />
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm">비밀번호 보호</span>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} aria-label="비밀번호 보호" />
            </label>

            {usePassword && (
              <Field label="비밀번호" htmlFor="share-pw">
                <Input
                  id="share-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="방문자에게 요구할 비밀번호"
                />
              </Field>
            )}

            <Button
              variant="danger"
              className="justify-self-start"
              onClick={() => {
                setEnabled(false)
                setIncludeExpenses(false)
                setUsePassword(false)
                setPassword('')
                toast.success('공유 링크를 폐기했어요.')
              }}
            >
              <Trash2 className="size-4" />
              링크 폐기
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
