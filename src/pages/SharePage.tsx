import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Lock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/utils'
import { useSharedTrip } from '@/features/share/api'
import { formatTripRange } from '@/features/trips/display'
import { getTripDays, itemTitle, sortByOrder, transportMeta } from '@/features/itinerary/display'
import { categoryLabel } from '@/features/expenses/display'
import { PlaceMap } from '@/features/places/PlaceMap'
import type { ExpenseCategory } from '@/types'

const CAT_COLOR: Record<ExpenseCategory, string> = {
  lodging: 'var(--accent)',
  food: 'var(--info)',
  transport: 'var(--warning)',
  activity: 'var(--success)',
  shopping: 'var(--border-strong)',
  etc: 'var(--muted)',
}

/**
 * 공개 공유 페이지 (S-08) — 인증 불필요, 읽기 전용.
 * 여행 요약·일정·지도·예산 요약만 노출하고 수정 UI는 제공하지 않는다.
 */
export function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, isError } = useSharedTrip(token)

  return (
    <div className="min-h-dvh bg-bg">
      {/* 공개 헤더 */}
      <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-5">
        <span className="text-lg font-bold tracking-[-0.05em]">Voyage</span>
        <Badge variant="neutral" className="gap-1">
          <Lock className="size-3" />
          읽기 전용 공유
        </Badge>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : isError || !data ? (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
            <p className="text-base font-semibold">유효하지 않은 공유 링크예요</p>
            <p className="mt-1 text-sm text-muted">링크가 만료되었거나 폐기되었을 수 있습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* 여행 요약 */}
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.035em] md:text-3xl">
                {data.trip.title}
              </h1>
              <p className="mt-1.5 text-sm text-secondary">
                {formatTripRange(data.trip.startsOn, data.trip.endsOn)} · {data.trip.destination}
                {data.trip.memberCount ? ` · ${data.trip.memberCount}명` : ''}
              </p>
            </div>

            {/* 예산 요약 */}
            {data.includeExpenses && data.expenseSummary && data.expenseSummary.totalBase > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>예산 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mono text-xl font-semibold tracking-tight">
                    {formatMoney(data.expenseSummary.totalBase, data.expenseSummary.baseCurrency)}
                  </p>
                  <div className="my-3 flex h-2 overflow-hidden rounded-full bg-subtle">
                    {data.expenseSummary.byCategory.map(({ category, amount }) => (
                      <span
                        key={category}
                        style={{
                          width: `${(amount / data.expenseSummary!.totalBase) * 100}%`,
                          background: CAT_COLOR[category],
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    {data.expenseSummary.byCategory
                      .map(
                        ({ category, amount }) =>
                          `${categoryLabel[category]} ${Math.round((amount / data.expenseSummary!.totalBase) * 100)}%`,
                      )
                      .join(' · ')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 일정 */}
            <Card>
              <CardHeader>
                <CardTitle>일정</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5">
                {getTripDays(data.trip.startsOn, data.trip.endsOn).map((day) => {
                  const dayItems = sortByOrder(data.itinerary.filter((i) => i.date === day))
                  return (
                    <div key={day}>
                      <p className="mb-2 text-sm font-bold">
                        {format(parseISO(day), 'M월 d일 EEEE', { locale: ko })}
                      </p>
                      {dayItems.length === 0 ? (
                        <p className="text-xs text-muted">일정 없음</p>
                      ) : (
                        <div className="grid gap-2">
                          {dayItems.map((item) => {
                            const TIcon = transportMeta[item.transport].icon
                            return (
                              <div key={item.id} className="flex gap-3">
                                <span className="mono w-12 shrink-0 pt-2.5 text-right text-xs text-muted">
                                  {item.startsAt ?? '—'}
                                </span>
                                <div className="flex-1 rounded-md border border-border p-3">
                                  <strong className="block text-sm">{itemTitle(item)}</strong>
                                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                                    <TIcon className="size-3.5" />
                                    {transportMeta[item.transport].label}
                                    {item.note ? ` · ${item.note}` : ''}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* 장소 지도 */}
            {data.places.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-4 text-accent" />
                    장소
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="h-64">
                    <PlaceMap places={data.places} selectedId={null} onSelect={() => {}} />
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {data.places.map((p) => (
                      <li key={p.id}>
                        <Badge variant="neutral">{p.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <p className="pb-4 text-center text-xs text-muted">
              이 페이지는 읽기 전용입니다 · Voyage로 만든 여행 계획
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
