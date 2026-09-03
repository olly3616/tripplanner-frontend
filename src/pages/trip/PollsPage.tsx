import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Vote } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useTripMembers } from '@/features/trips/api'
import { usePolls } from '@/features/polls/api'
import { PollCard } from '@/features/polls/PollCard'
import { CreatePollDialog, type PollInput } from '@/features/polls/CreatePollDialog'
import { isPollClosed } from '@/features/polls/display'
import type { Poll } from '@/types'

type Filter = 'open' | 'closed' | 'all'

/**
 * 투표 (S-06) — 마크업 + 기능 단계.
 * 투표 생성/투표/결과 표시를 로컬 상태로 처리한다.
 * 마감 시각 이후 생성·변경 거부(수용 기준)는 클라이언트에서 우선 반영하고,
 * 서버 검증·mutation 은 다음 API 단계에서 연결한다.
 */
export function PollsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id ?? '')
  const { data: members = [] } = useTripMembers(tripId)
  const { data: fetched, isLoading } = usePolls(tripId)

  const [polls, setPolls] = useState<Poll[]>([])
  const [filter, setFilter] = useState<Filter>('open')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (fetched) setPolls(fetched)
  }, [fetched])

  const myRole = members.find((m) => m.userId === currentUserId)?.role
  const canReflect = myRole === 'owner' || myRole === 'editor'

  const filtered = useMemo(() => {
    if (filter === 'all') return polls
    const wantClosed = filter === 'closed'
    return polls.filter((p) => isPollClosed(p) === wantClosed)
  }, [polls, filter])

  function handleVote(pollId: string, newSelected: string[]) {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p
        const options = p.options.map((o) => {
          const was = p.myVotes.includes(o.id)
          const now = newSelected.includes(o.id)
          const delta = now && !was ? 1 : !now && was ? -1 : 0
          return { ...o, voteCount: o.voteCount + delta }
        })
        return { ...p, options, myVotes: newSelected }
      }),
    )
    toast.success('투표를 반영했어요.')
  }

  function handleCreate(input: PollInput) {
    const poll: Poll = {
      id: crypto.randomUUID(),
      tripId: tripId!,
      title: input.title,
      options: input.options.map((label) => ({
        id: crypto.randomUUID(),
        label,
        voteCount: 0,
      })),
      multiple: input.multiple,
      anonymous: input.anonymous,
      closesAt: input.closesAt,
      closed: false,
      myVotes: [],
    }
    setPolls((prev) => [poll, ...prev])
    setFilter('open')
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'open', label: '진행 중' },
    { key: 'closed', label: '마감됨' },
    { key: 'all', label: '전체' },
  ]

  return (
    <>
      <PageHeader
        title="투표"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />투표 만들기
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              filter === f.key
                ? 'border-accent bg-selected font-semibold text-accent-active'
                : 'border-border bg-surface text-secondary hover:border-border-strong hover:text-fg',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Vote />}
          title={filter === 'closed' ? '마감된 투표가 없어요' : '진행 중인 투표가 없어요'}
          description="후보 장소나 식당을 두고 투표를 만들어 함께 정해 보세요."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />투표 만들기
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {filtered.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              canReflect={canReflect}
              onVote={(ids) => handleVote(poll.id, ids)}
              onReflect={() =>
                toast.info('결과 반영(일정·장소 확정)은 해당 단계에서 연결됩니다.')
              }
            />
          ))}
        </div>
      )}

      <CreatePollDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
    </>
  )
}
