import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Compass } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { useTrips } from '@/features/trips/api'
import { CreateTripDialog } from '@/features/trips/CreateTripDialog'
import {
  formatTripRange,
  tripStatusLabel,
  tripStatusVariant,
} from '@/features/trips/display'
import type { TripStatus } from '@/types'

const FILTERS: { key: TripStatus | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'upcoming', label: '예정' },
  { key: 'ongoing', label: '진행 중' },
  { key: 'completed', label: '완료' },
]

export function TripsListPage() {
  const { data: trips, isLoading } = useTrips()
  const [filter, setFilter] = useState<TripStatus | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  const filtered = (trips ?? []).filter(
    (t) => filter === 'all' || t.status === filter,
  )

  return (
    <>
      <PageHeader
        title="내 여행"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />새 여행
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Compass />}
          title="아직 여행이 없어요"
          description="첫 여행을 만들고 동행자를 초대해 함께 계획을 세워 보세요."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />새 여행 만들기
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="group rounded-lg border border-border bg-surface p-5 shadow-sm transition-colors hover:border-border-strong focus-visible:outline-none"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold tracking-tight text-fg group-hover:text-accent-active">
                  {trip.title}
                </h3>
                <Badge variant={tripStatusVariant[trip.status]}>
                  {tripStatusLabel[trip.status]}
                </Badge>
              </div>
              <p className="mono text-sm text-secondary">
                {formatTripRange(trip.startsOn, trip.endsOn)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {trip.destination} · 멤버 {trip.memberCount ?? 0}명
              </p>
              <p className="mt-3 text-xs text-muted">
                {(trip.itineraryCount ?? 0) > 0 || (trip.expenseCount ?? 0) > 0
                  ? `일정 ${trip.itineraryCount ?? 0}개 · 경비 ${trip.expenseCount ?? 0}건`
                  : '아직 계획이 없어요'}
              </p>
            </Link>
          ))}
        </div>
      )}

      <CreateTripDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/trips/${id}`)}
      />
    </>
  )
}
