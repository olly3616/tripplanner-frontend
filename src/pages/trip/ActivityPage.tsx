import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Activity as ActivityIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { cn } from '@/lib/utils'
import { useActivity } from '@/features/activity/api'
import {
  activityIcon,
  activityText,
  activityType,
  activityTypeOptions,
  formatRelative,
} from '@/features/activity/display'
import type { ActivityType } from '@/features/activity/display'

/**
 * 활동 피드 (S-08 일부) — 마크업 + 기능 단계.
 * 사람·행동·대상·시각을 시간순으로 표시하고 유형 필터를 제공한다.
 * 실시간 갱신(WebSocket)은 협업 API 단계에서 연결한다.
 */
export function ActivityPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: logs = [], isLoading, isError, refetch } = useActivity(tripId)
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')

  const filtered = useMemo(() => {
    const list = filter === 'all' ? logs : logs.filter((l) => activityType(l) === filter)
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [logs, filter])

  const FILTERS = [{ value: 'all' as const, label: '전체' }, ...activityTypeOptions]

  return (
    <>
      <PageHeader title="활동" />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              filter === f.value
                ? 'border-accent bg-selected font-semibold text-accent-active'
                : 'border-border bg-surface text-secondary hover:border-border-strong hover:text-fg',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState title="활동을 불러오지 못했어요" onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon />}
          title="표시할 활동이 없어요"
          description="여행에 변경이 생기면 이곳에 시간순으로 기록됩니다."
        />
      ) : (
        <ul className="relative grid gap-1">
          {filtered.map((log) => {
            const Icon = activityIcon(log)
            return (
              <li key={log.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-subtle">
                <div className="relative">
                  <Avatar name={log.actor.name} src={log.actor.avatarUrl} />
                  <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-surface text-accent-active shadow-sm">
                    <Icon className="size-2.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm">
                    <strong className="font-semibold">{log.actor.name}</strong>
                    <span className="text-secondary">님이 {activityText(log)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{formatRelative(log.createdAt)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
