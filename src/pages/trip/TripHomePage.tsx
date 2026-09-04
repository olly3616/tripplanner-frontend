import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/utils'
import { useTrip } from '@/features/trips/api'
import { formatTripRange } from '@/features/trips/display'
import { useItinerary } from '@/features/itinerary/api'
import { itemTitle, transportMeta } from '@/features/itinerary/display'
import { useExpenses } from '@/features/expenses/api'
import { categoryLabel } from '@/features/expenses/display'
import { usePolls } from '@/features/polls/api'
import { formatCloseAt, isPollClosed } from '@/features/polls/display'
import { useActivity } from '@/features/activity/api'
import { activityIcon, activityText, formatRelative } from '@/features/activity/display'
import type { ExpenseCategory } from '@/types'

const CAT_COLOR: Record<ExpenseCategory, string> = {
  lodging: 'var(--accent)',
  food: 'var(--info)',
  transport: 'var(--warning)',
  activity: 'var(--success)',
  shopping: 'var(--border-strong)',
  etc: 'var(--muted)',
}

// 여행 홈 요약 — 실제 목 데이터(일정·경비·투표·활동)로 계산.
export function TripHomePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)
  const { data: items = [] } = useItinerary(tripId)
  const { data: expenses = [] } = useExpenses(tripId)
  const { data: polls = [] } = usePolls(tripId)
  const { data: logs = [] } = useActivity(tripId)

  const baseCurrency = trip?.baseCurrency ?? 'KRW'
  const to = (seg: string) => `/trips/${tripId}/${seg}`

  const upcoming = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.date.localeCompare(b.date) || a.sortOrder - b.sortOrder)
        .slice(0, 3),
    [items],
  )

  const totalBase = expenses.reduce((s, e) => s + e.baseAmountMinor, 0)
  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.baseAmountMinor)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  const openPolls = polls.filter((p) => !isPollClosed(p))
  const recent = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [logs],
  )

  if (isLoading || !trip) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={trip.title}
        description={`${formatTripRange(trip.startsOn, trip.endsOn)} · ${trip.destination} · ${trip.memberCount ?? 0}명`}
        action={
          <Button variant="outline" asChild>
            <Link to={to('members')}>
              <UserPlus className="size-4" />초대
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* 다음 일정 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>다음 일정</CardTitle>
            <Link to={to('itinerary')} className="text-xs text-accent-active hover:underline">
              전체 보기
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3">
            {upcoming.length === 0 ? (
              <p className="py-2 text-sm text-muted">아직 등록된 일정이 없어요.</p>
            ) : (
              upcoming.map((item) => {
                const TIcon = transportMeta[item.transport].icon
                return (
                  <div key={item.id} className="flex gap-3">
                    <span className="mono w-14 shrink-0 pt-1 text-xs text-muted">
                      {format(parseISO(item.date), 'M/d')} {item.startsAt ?? ''}
                    </span>
                    <div className="flex-1 rounded-md border border-border p-3">
                      <strong className="block truncate text-sm">{itemTitle(item)}</strong>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <TIcon className="size-3.5" />
                        {transportMeta[item.transport].label}
                        {item.note ? ` · ${item.note}` : ''}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* 예산 / 지출 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>지출</CardTitle>
            <Link to={to('expenses')} className="text-xs text-accent-active hover:underline">
              전체 보기
            </Link>
          </CardHeader>
          <CardContent>
            {totalBase === 0 ? (
              <p className="py-2 text-sm text-muted">아직 기록된 지출이 없어요.</p>
            ) : (
              <>
                <p className="mono text-xl font-semibold tracking-tight">
                  {formatMoney(totalBase, baseCurrency)}
                </p>
                <div className="my-3 flex h-2 overflow-hidden rounded-full bg-subtle">
                  {byCategory.map(([cat, sum]) => (
                    <span
                      key={cat}
                      style={{ width: `${(sum / totalBase) * 100}%`, background: CAT_COLOR[cat] }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted">
                  {byCategory
                    .map(([cat, sum]) => `${categoryLabel[cat]} ${Math.round((sum / totalBase) * 100)}%`)
                    .join(' · ')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 미결 투표 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>미결 투표</CardTitle>
            <Link to={to('polls')} className="text-xs text-accent-active hover:underline">
              전체 보기
            </Link>
          </CardHeader>
          <CardContent className="grid gap-2">
            {openPolls.length === 0 ? (
              <p className="py-2 text-sm text-muted">진행 중인 투표가 없어요.</p>
            ) : (
              openPolls.slice(0, 3).map((poll) => (
                <Link
                  key={poll.id}
                  to={to('polls')}
                  className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 hover:border-border-strong"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{poll.title}</span>
                  <Badge variant="considering" className="shrink-0">
                    {formatCloseAt(poll.closesAt)}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>최근 활동</CardTitle>
            <Link to={to('activity')} className="text-xs text-accent-active hover:underline">
              전체 보기
            </Link>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {recent.length === 0 ? (
              <p className="py-2 text-sm text-muted">아직 활동이 없어요.</p>
            ) : (
              recent.map((log) => {
                const Icon = activityIcon(log)
                return (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className="relative">
                      <Avatar name={log.actor.name} src={log.actor.avatarUrl} className="size-7" />
                      <span className="absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full bg-surface text-accent-active shadow-sm">
                        <Icon className="size-2" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <strong className="font-semibold">{log.actor.name}</strong>
                        <span className="text-secondary">님이 {activityText(log)}</span>
                      </p>
                      <p className="text-xs text-muted">{formatRelative(log.createdAt)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
