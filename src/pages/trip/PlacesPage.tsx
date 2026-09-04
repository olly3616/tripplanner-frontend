import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { cn } from '@/lib/utils'
import { useSavedPlaces } from '@/features/places/api'
import { PlaceMap } from '@/features/places/PlaceMap'
import {
  PlaceDetailDrawer,
  type PlaceDetailValues,
} from '@/features/places/PlaceDetailDrawer'
import {
  placeStatusLabel,
  placeStatusOptions,
  placeStatusVariant,
} from '@/features/places/display'
import type { PlaceStatus, SavedPlace } from '@/types'

/**
 * 장소 탐색·저장 (S-05) — 마크업 + 기능 단계.
 * 검색/필터, 목록↔지도 선택 동기화, 상세 드로어 편집을 로컬 상태로 처리한다.
 * 장소 검색(Geoapify)과 저장 mutation 은 다음 API 단계에서 연결한다.
 */
export function PlacesPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: fetched, isLoading, isError, refetch } = useSavedPlaces(tripId)

  const [places, setPlaces] = useState<SavedPlace[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (fetched) setPlaces(fetched)
  }, [fetched])

  const categories = useMemo(
    () => Array.from(new Set(places.map((p) => p.category).filter(Boolean))) as string[],
    [places],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return places.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (q && !`${p.name} ${p.address}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [places, query, statusFilter, categoryFilter])

  const selectedPlace = places.find((p) => p.id === selectedId) ?? null

  function openDetail(id: string) {
    setSelectedId(id)
    setDrawerOpen(true)
  }

  function handleSaveDetail(values: PlaceDetailValues) {
    if (!selectedPlace) return
    setPlaces((prev) =>
      prev.map((p) => (p.id === selectedPlace.id ? { ...p, ...values } : p)),
    )
    toast.success('장소 정보를 저장했어요.')
  }

  return (
    <>
      <PageHeader title="장소" />

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="저장한 장소·주소 검색"
          className="pl-9"
          aria-label="장소 검색"
        />
      </div>

      {/* 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PlaceStatus | 'all')}
          className="h-9 w-auto text-sm"
          aria-label="상태 필터"
        >
          <option value="all">상태 전체</option>
          {placeStatusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 w-auto text-sm"
          aria-label="카테고리 필터"
        >
          <option value="all">카테고리 전체</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {isError ? (
        <ErrorState title="장소를 불러오지 못했어요" onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="min-h-[280px]" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 후보 목록 */}
          <div>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<MapPin />}
                title="조건에 맞는 장소가 없어요"
                description="필터를 바꾸거나 새 장소를 검색해 저장해 보세요."
              />
            ) : (
              <ul className="grid gap-2">
                {filtered.map((place, i) => {
                  const selected = place.id === selectedId
                  return (
                    <li key={place.id}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-md border bg-surface p-3 shadow-sm transition-colors',
                          selected
                            ? 'border-accent bg-selected'
                            : 'border-border hover:border-border-strong',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(place.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
                          aria-pressed={selected}
                        >
                          <span
                            className={cn(
                              'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                              selected
                                ? 'bg-accent-active text-surface'
                                : 'bg-subtle text-accent-active',
                            )}
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-sm">{place.name}</strong>
                            <span className="block truncate text-xs text-muted">
                              {place.category ? `${place.category} · ` : ''}
                              {placeStatusLabel[place.status]}
                            </span>
                          </span>
                        </button>
                        <Badge variant={placeStatusVariant[place.status]} className="shrink-0">
                          {placeStatusLabel[place.status]}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => openDetail(place.id)}
                          aria-label={`${place.name} 상세`}
                          className="shrink-0 rounded p-1 text-muted hover:bg-subtle hover:text-fg focus-visible:outline-none"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* 지도 */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)]">
            <PlaceMap
              places={filtered}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>
        </div>
      )}

      <PlaceDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        place={selectedPlace}
        onSave={handleSaveDetail}
        onAddToItinerary={() => toast.info('장소를 일정에 추가하는 기능은 일정 단계에서 연결됩니다.')}
        onCreatePoll={() => toast.info('투표 만들기는 투표 단계에서 연결됩니다.')}
      />
    </>
  )
}
