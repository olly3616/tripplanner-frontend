import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Map as MapIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { cn } from '@/lib/utils'
import { isApiError } from '@/lib/api/client'
import { useTrip } from '@/features/trips/api'
import {
  useCreateItineraryItem,
  useDeleteItineraryItem,
  useItinerary,
  useReorderItinerary,
  useUpdateItineraryItem,
} from '@/features/itinerary/api'
import { useSavedPlaces } from '@/features/places/api'
import { DayTimeline } from '@/features/itinerary/DayTimeline'
import {
  ItineraryItemDrawer,
  type ItineraryFormValues,
} from '@/features/itinerary/ItineraryItemDrawer'
import { getTripDays, sortByOrder } from '@/features/itinerary/display'
import type { ItineraryItem } from '@/types'

/**
 * 일정 플래너 (S-04) — API 연결 단계.
 * 편집은 TanStack Query mutation(낙관적 업데이트 + version 기반 낙관적 잠금)으로 처리한다.
 */
export function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip } = useTrip(tripId)
  const { data: items = [], isLoading, isError, refetch } = useItinerary(tripId)
  const { data: places = [] } = useSavedPlaces(tripId)

  const createItem = useCreateItineraryItem(tripId!)
  const updateItem = useUpdateItineraryItem(tripId!)
  const deleteItem = useDeleteItineraryItem(tripId!)
  const reorder = useReorderItinerary(tripId!)

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<ItineraryItem | null>(null)

  const days = useMemo(
    () => (trip ? getTripDays(trip.startsOn, trip.endsOn) : []),
    [trip],
  )

  useEffect(() => {
    if (!selectedDate && days.length > 0) setSelectedDate(days[0])
  }, [days, selectedDate])

  const dayItems = useMemo(
    () => sortByOrder(items.filter((i) => i.date === selectedDate)),
    [items, selectedDate],
  )

  function handleAdd() {
    setEditing(null)
    setDrawerOpen(true)
  }

  function handleEdit(item: ItineraryItem) {
    setEditing(item)
    setDrawerOpen(true)
  }

  async function handleSave(values: ItineraryFormValues) {
    try {
      if (editing) {
        await updateItem.mutateAsync({
          id: editing.id,
          version: editing.version,
          date: values.date,
          startsAt: values.startsAt || undefined,
          endsAt: values.endsAt || undefined,
          placeId: values.placeId, // '' 이면 장소 해제
          note: values.note || undefined,
          transport: values.transport,
        })
        toast.success('일정을 수정했어요.')
      } else {
        await createItem.mutateAsync({
          date: values.date,
          startsAt: values.startsAt || undefined,
          endsAt: values.endsAt || undefined,
          placeId: values.placeId || undefined,
          note: values.note || undefined,
          transport: values.transport,
        })
        setSelectedDate(values.date)
        toast.success('일정을 추가했어요.')
      }
    } catch (err) {
      if (isApiError(err) && err.response?.status === 409) {
        toast.error('다른 사람이 먼저 수정했어요. 최신 내용으로 갱신합니다.')
      } else {
        toast.error('저장에 실패했어요. 다시 시도해 주세요.')
      }
    }
  }

  async function handleDelete(item: ItineraryItem) {
    try {
      await deleteItem.mutateAsync(item.id)
      toast.success('일정을 삭제했어요.')
    } catch {
      toast.error('삭제에 실패했어요.')
    }
  }

  // 같은 날짜 안에서 순서를 재배열해 서버에 일괄 반영한다.
  async function handleReorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, idx) => ({
      id,
      date: selectedDate,
      sortOrder: idx + 1,
    }))
    try {
      await reorder.mutateAsync(updates)
    } catch {
      toast.error('순서 변경에 실패했어요.')
    }
  }

  return (
    <>
      <PageHeader
        title="일정"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('지도 보기는 장소 단계에서 연결됩니다.')}>
              <MapIcon className="size-4" />지도 보기
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="size-4" />일정 추가
            </Button>
          </div>
        }
      />

      {/* 날짜 선택 */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const active = d === selectedDate
          const count = items.filter((i) => i.date === d).length
          return (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={cn(
                'flex shrink-0 flex-col items-center rounded-md border px-3.5 py-2 transition-colors',
                active
                  ? 'border-accent bg-selected text-accent-active'
                  : 'border-border bg-surface text-secondary hover:border-border-strong hover:text-fg',
              )}
            >
              <span className="text-xs">{format(parseISO(d), 'EEE', { locale: ko })}</span>
              <span className="mono text-sm font-semibold">{format(parseISO(d), 'M/d')}</span>
              <span className="text-[10px] text-muted">{count > 0 ? `${count}개` : '-'}</span>
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <h2 className="mb-3 text-lg font-bold tracking-tight">
          {format(parseISO(selectedDate), 'M월 d일 EEEE', { locale: ko })}
        </h2>
      )}

      {isError ? (
        <ErrorState title="일정을 불러오지 못했어요" onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <DayTimeline
          items={dayItems}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      <ItineraryItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editing}
        defaultDate={selectedDate || days[0] || ''}
        days={days}
        places={places}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing) : undefined}
      />
    </>
  )
}
