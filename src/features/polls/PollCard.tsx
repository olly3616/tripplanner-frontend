import { useEffect, useState } from 'react'
import { CalendarCheck, MapPin, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isPollClosed, pollMeta, totalVotes } from './display'
import type { Poll } from '@/types'

interface PollCardProps {
  poll: Poll
  canReflect: boolean
  onVote: (optionIds: string[]) => void
  onReflect: (poll: Poll) => void
}

export function PollCard({ poll, canReflect, onVote, onReflect }: PollCardProps) {
  const closed = isPollClosed(poll)
  const total = totalVotes(poll)
  const maxVotes = Math.max(1, ...poll.options.map((o) => o.voteCount))
  const [selected, setSelected] = useState<string[]>(poll.myVotes)

  useEffect(() => setSelected(poll.myVotes), [poll.myVotes])

  const dirty =
    selected.length !== poll.myVotes.length ||
    selected.some((id) => !poll.myVotes.includes(id))

  function toggle(optionId: string) {
    if (closed) return
    if (poll.multiple) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    } else {
      setSelected([optionId])
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{poll.title}</CardTitle>
          {closed && <Badge variant="closed">마감됨</Badge>}
        </div>
        <p className="text-xs text-muted">{pollMeta(poll)}</p>
      </CardHeader>
      <CardContent className="grid gap-2">
        {poll.options.map((opt) => {
          const checked = selected.includes(opt.id)
          const isWinner = closed && opt.voteCount === maxVotes && opt.voteCount > 0
          const pct = Math.round((opt.voteCount / maxVotes) * 100)
          return (
            <button
              key={opt.id}
              type="button"
              disabled={closed}
              onClick={() => toggle(opt.id)}
              className={cn(
                'relative overflow-hidden rounded-md border px-3 py-2.5 text-left transition-colors',
                closed ? 'cursor-default' : 'hover:border-border-strong',
                checked ? 'border-accent' : 'border-border',
                isWinner && 'border-accent bg-selected',
              )}
              aria-pressed={checked}
            >
              {/* 결과 막대 배경 */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-y-0 left-0 rounded-md transition-all',
                  isWinner ? 'bg-selected' : 'bg-subtle',
                )}
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center border',
                    poll.multiple ? 'rounded-sm' : 'rounded-full',
                    checked ? 'border-accent bg-accent text-surface' : 'border-border-strong/50',
                  )}
                >
                  {checked && <Check className="size-3" />}
                </span>
                <span className="flex-1 text-sm font-medium">{opt.label}</span>
                <span className="mono text-sm text-secondary">{opt.voteCount}표</span>
              </span>
            </button>
          )
        })}

        {!closed ? (
          <Button
            className="mt-1 justify-self-start"
            disabled={selected.length === 0 || !dirty}
            onClick={() => onVote(selected)}
          >
            {poll.myVotes.length > 0 ? '투표 수정' : '투표하기'}
          </Button>
        ) : (
          canReflect && (
            <div className="mt-1 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onReflect(poll)}>
                <CalendarCheck className="size-4" />
                일정에 반영
              </Button>
              <Button variant="outline" size="sm" onClick={() => onReflect(poll)}>
                <MapPin className="size-4" />
                장소 확정
              </Button>
            </div>
          )
        )}

        {total === 0 && !closed && (
          <p className="text-xs text-muted">아직 투표한 사람이 없어요.</p>
        )}
      </CardContent>
    </Card>
  )
}
