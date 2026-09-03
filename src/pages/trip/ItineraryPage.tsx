import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Map as MapIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTrip } from '@/features/trips/api'
import { useItinerary } from '@/features/itinerary/api'
import { useSavedPlaces } from '@/features/places/api'
import { DayTimeline } from '@/features/itinerary/DayTimeline'
import {
  ItineraryItemDrawer,
  type ItineraryFormValues,
} from '@/features/itinerary/ItineraryItemDrawer'
import { getTripDays, sortByOrder } from '@/features/itinerary/display'
import type { ItineraryItem } from '@/types'

/**
 * 일정 플래너 (S-04) — 마크업 + 기능 단계.
 * 추가/수정/삭제/드래그 정렬을 로컬 상태로 처리한다.
 * API 연결 단계에서 로컬 상태 변경을 mutation(낙관적 업데이트 + version)으로 대체한다.
 */
export function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip } = useTrip(tripId)
  const { data: fetched, isLoading } = useItinerary(tripId)
  const { data: places = [] } = useSavedPlaces(tripId)

  const [items, setItems] = useState<ItineraryItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<ItineraryItem | null>(null)

  const days = useMemo(
    () => (trip ? getTripDays(trip.startsOn, trip.endsOn) : []),
    [trip],
  )

  // 조회 결과를 로컬 작업본으로 시드
  useEffect(() => {
    if (fetched) setItems(fetched)
  }, [fetched])

  // 기본 선택 날짜 = 첫째 날
  useEffect(() => {
    if (!selectedDate && days.length > 0) setSelectedDate(days[0])
  }, [days, selectedDate])

  const dayItems = useMemo(
    () => sortByOrder(items.filter((i) => i.date === selectedDate)),
    [items, selectedDate],
  )

  function nextSortOrder(date: string): number {
    const inDay = items.filter((i) => i.date === date)
    return inDay.length ? Math.max(...inDay.map((i) => i.sortOrder)) + 1 : 1
  }

  function buildItem(values: ItineraryFormValues, base?: ItineraryItem): ItineraryItem {
    const place = values.placeId ? places.find((p) => p.id === values.placeId) : undefined
    return {
      id: base?.id ?? crypto.randomUUID(),
      tripId: tripId!,
      placeId: values.placeId || undefined,
      place: place
        ? { id: place.id, name: place.name, category: place.category }
        : undefined,
      date: values.date,
      startsAt: values.startsAt || undefined,
      endsAt: values.endsAt || undefined,
      sortOrder: base?.sortOrder ?? nextSortOrder(values.date),
      transport: values.transport,
      note: values.note || undefined,
      version: base?.version ?? 1,
    }
  }

  function handleAdd() {
    setEditing(null)
    setDrawerOpen(true)
  }

  function handleEdit(item: ItineraryItem) {
    setEditing(item)
    setDrawerOpen(true)
  }

  function handleSave(values: ItineraryFormValues) {
    if (editing) {
      const updated = buildItem(values, editing)
      setItems((prev) => prev.map((i) => (i.id === editing.id ? updated : i)))
      toast.success('일정을 수정했어요.')
    } else {
      const created = buildItem(values)
      setItems((prev) => [...prev, created])
      setSelectedDate(values.date)
      toast.success('일정을 추가했어요.')
    }
  }

  function handleDelete(item: ItineraryItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    toast.success('일정을 삭제했어요.')
  }

  // 같은 날짜 안에서 순서를 재배열하고 sortOrder 를 다시 매긴다.
  function handleReorder(orderedIds: string[]) {
    setItems((prev) => {
      const orderMap = new Map(orderedIds.map((id, idx) => [id, idx + 1]))
      return prev.map((i) =>
        orderMap.has(i.id) ? { ...i, sortOrder: orderMap.get(i.id)! } : i,
      )
    })
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

      {isLoading ? (
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
