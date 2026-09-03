import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatMoney } from '@/lib/utils'
import type { SettlementBalance, SettlementTransfer, TripMember } from '@/types'

interface SettlementPanelProps {
  balances: SettlementBalance[]
  transfers: SettlementTransfer[]
  members: TripMember[]
  baseCurrency: string
  currentUserId: string
}

export function SettlementPanel({
  balances,
  transfers,
  members,
  baseCurrency,
  currentUserId,
}: SettlementPanelProps) {
  const [done, setDone] = useState<Record<number, boolean>>({})
  const name = (id: string) =>
    id === currentUserId ? '나' : (members.find((m) => m.userId === id)?.user.name ?? '알 수 없음')

  return (
    <div className="grid gap-4">
      {/* 순잔액 */}
      <Card>
        <CardHeader>
          <CardTitle>순잔액</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {balances.map((b) => {
            const positive = b.balanceMinor > 0
            const zero = b.balanceMinor === 0
            return (
              <div key={b.userId} className="flex items-center justify-between">
                <span className="text-sm">{name(b.userId)}</span>
                <span
                  className={cn(
                    'mono text-sm font-semibold',
                    zero ? 'text-muted' : positive ? 'text-success' : 'text-danger',
                  )}
                >
                  {positive ? '+' : ''}
                  {formatMoney(b.balanceMinor, baseCurrency)}
                  <span className="ml-1 font-sans text-xs font-normal text-muted">
                    {zero ? '정산 완료' : positive ? '받을 돈' : '보낼 돈'}
                  </span>
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 권장 송금 */}
      <Card>
        <CardHeader>
          <CardTitle>권장 송금</CardTitle>
          <p className="text-xs text-muted">송금 횟수를 최소화한 목록입니다. 실제 송금은 처리하지 않습니다.</p>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="py-2 text-sm text-muted">정산할 송금이 없어요. 모두 균형 상태입니다.</p>
          ) : (
            <ul className="grid gap-2">
              {transfers.map((t, i) => (
                <li
                  key={i}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border px-3 py-2',
                    done[i] && 'opacity-55',
                  )}
                >
                  <span className="text-sm font-medium">{name(t.fromUserId)}</span>
                  <ArrowRight className="size-4 text-muted" />
                  <span className="text-sm font-medium">{name(t.toUserId)}</span>
                  <span className="mono ml-auto text-sm font-semibold">
                    {formatMoney(t.amountMinor, baseCurrency)}
                  </span>
                  <Button
                    variant={done[i] ? 'ghost' : 'outline'}
                    size="sm"
                    onClick={() => setDone((prev) => ({ ...prev, [i]: !prev[i] }))}
                  >
                    <Check className="size-3.5" />
                    {done[i] ? '완료됨' : '송금 완료'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
