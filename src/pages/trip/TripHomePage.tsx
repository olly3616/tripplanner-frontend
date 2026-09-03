import { useParams } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrip } from '@/features/trips/api'
import { formatTripRange } from '@/features/trips/display'
import { formatMoney } from '@/lib/utils'

// 마크업 단계: 요약 카드는 목 데이터/샘플 값으로 구성. API 연결 단계에서 실제 집계로 대체.
export function TripHomePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip, isLoading } = useTrip(tripId)

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
          <Button variant="outline">
            <UserPlus className="size-4" />초대
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* 다음 일정 */}
        <Card>
          <CardHeader>
            <CardTitle>다음 일정</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex gap-3">
              <span className="mono w-12 pt-1 text-xs text-muted">10:00</span>
              <div className="flex-1 rounded-md border border-border p-3">
                <strong className="block text-sm">성산일출봉</strong>
                <span className="text-xs text-muted">렌터카 · 90분</span>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mono w-12 pt-1 text-xs text-muted">14:00</span>
              <div className="flex-1 rounded-md border border-border p-3">
                <strong className="block text-sm">흑돼지 식당 A</strong>
                <span className="text-xs text-muted">도보 · 15분</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예산 */}
        <Card>
          <CardHeader>
            <CardTitle>예산</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mono text-xl font-semibold tracking-tight">
              {formatMoney(428000, trip.baseCurrency)}
              <span className="ml-1 font-sans text-xs font-normal text-muted">
                / {formatMoney(800000, trip.baseCurrency)}
              </span>
            </p>
            <div className="my-3 h-2 overflow-hidden rounded-full bg-subtle">
              <div className="h-full w-[54%] rounded-full bg-accent" />
            </div>
            <p className="text-xs text-muted">숙소 56% · 식사 28% · 교통 16%</p>
          </CardContent>
        </Card>

        {/* 미결 투표 */}
        <Card>
          <CardHeader>
            <CardTitle>미결 투표</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">첫날 저녁 식당은?</span>
              <Badge variant="considering">마감 2일 전</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>이민지</strong>님이 숙소비를 추가했어요.
            </p>
            <p className="mt-1 text-xs text-muted">5분 전 · ₩240,000</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
